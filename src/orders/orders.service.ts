import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { ProductEntity } from '../products/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './order.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderStatus } from './order-status';

const MAX_MONEY_CENTS = 999999999999n;

function decimalToCents(value: string): bigint {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) throw new BadRequestException('Product price is not a valid monetary value.');
  const fraction = (match[2] ?? '').padEnd(2, '0');
  return BigInt(match[1]) * 100n + BigInt(fraction || '0');
}

function inputToCents(value: number | undefined, field: string): bigint {
  if (value === undefined) return 0n;
  if (!Number.isFinite(value) || value < 0 || !Number.isSafeInteger(Math.round(value * 100))) {
    throw new BadRequestException(`${field} must be a valid nonnegative monetary value.`);
  }
  return BigInt(Math.round(value * 100));
}

function centsToDecimal(value: bigint): string {
  if (value < 0n || value > MAX_MONEY_CENTS) {
    throw new BadRequestException('Calculated monetary amount exceeds the supported limit.');
  }
  return `${value / 100n}.${String(value % 100n).padStart(2, '0')}`;
}

function toResponse(order: OrderEntity) {
  return {
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    deliveryAddress: order.deliveryAddress,
    deliveryCity: order.deliveryCity,
    deliveryState: order.deliveryState,
    deliveryInstructions: order.deliveryInstructions,
    status: order.status,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    deliveryFee: Number(order.deliveryFee),
    totalAmount: Number(order.totalAmount),
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: item.productName,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

@Injectable()
export class OrdersService {
  constructor(
    @Optional()
    @InjectDataSource()
    private readonly dataSource?: DataSource,
  ) {}

  async create(input: CreateOrderDto) {
    const dataSource = this.getDataSource();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      const productRepository = queryRunner.manager.getRepository(ProductEntity);
      const orderRepository = queryRunner.manager.getRepository(OrderEntity);
      const itemRepository = queryRunner.manager.getRepository(OrderItemEntity);
      const products = await productRepository.find({
        where: { id: In(input.items.map((item) => item.productId)), isActive: true },
      });
      const productsById = new Map(products.map((product) => [product.id, product]));

      if (productsById.size !== new Set(input.items.map((item) => item.productId)).size) {
        throw new BadRequestException('One or more requested products are unavailable.');
      }

      const itemSnapshots = input.items.map((requestedItem) => {
        const product = productsById.get(requestedItem.productId)!;
        const unitPriceCents = decimalToCents(product.price);
        const lineTotalCents = unitPriceCents * BigInt(requestedItem.quantity);
        return {
          product,
          quantity: requestedItem.quantity,
          unitPriceCents,
          lineTotalCents,
        };
      });
      const subtotalCents = itemSnapshots.reduce((sum, item) => sum + item.lineTotalCents, 0n);
      const discountCents = inputToCents(input.discount, 'discount');
      const deliveryFeeCents = inputToCents(input.deliveryFee, 'deliveryFee');
      if (discountCents > subtotalCents) {
        throw new BadRequestException('Discount cannot exceed the order subtotal.');
      }
      const totalCents = subtotalCents - discountCents + deliveryFeeCents;

      const order = await orderRepository.save(
        orderRepository.create({
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail ?? null,
          deliveryAddress: input.deliveryAddress,
          deliveryCity: input.deliveryCity,
          deliveryState: input.deliveryState,
          deliveryInstructions: input.deliveryInstructions ?? null,
          status: OrderStatus.PENDING,
          subtotal: centsToDecimal(subtotalCents),
          discount: centsToDecimal(discountCents),
          deliveryFee: centsToDecimal(deliveryFeeCents),
          totalAmount: centsToDecimal(totalCents),
        }),
      );

      const items = itemSnapshots.map(({ product, quantity, unitPriceCents, lineTotalCents }) =>
        itemRepository.create({
          orderId: order.id,
          order,
          productId: product.id,
          product,
          productName: product.name,
          unitPrice: centsToDecimal(unitPriceCents),
          quantity,
          lineTotal: centsToDecimal(lineTotalCents),
        }),
      );
      order.items = await itemRepository.save(items);

      await queryRunner.commitTransaction();
      return toResponse(order);
    } catch (error) {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const orders = await this.getDataSource().getRepository(OrderEntity).find({
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
    return orders.map(toResponse);
  }

  async findOne(id: string) {
    const order = await this.getDataSource().getRepository(OrderEntity).findOne({
      where: { id },
      relations: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found.');
    return toResponse(order);
  }

  async update(id: string, input: UpdateOrderDto) {
    const repository = this.getDataSource().getRepository(OrderEntity);
    const order = await repository.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found.');

    if (input.status !== undefined) order.status = input.status;
    if (input.customerName !== undefined) order.customerName = input.customerName;
    if (input.customerPhone !== undefined) order.customerPhone = input.customerPhone;
    if (input.customerEmail !== undefined) order.customerEmail = input.customerEmail;
    if (input.deliveryAddress !== undefined) order.deliveryAddress = input.deliveryAddress;
    if (input.deliveryCity !== undefined) order.deliveryCity = input.deliveryCity;
    if (input.deliveryState !== undefined) order.deliveryState = input.deliveryState;
    if (input.deliveryInstructions !== undefined) order.deliveryInstructions = input.deliveryInstructions;
    if (input.discount !== undefined) order.discount = centsToDecimal(inputToCents(input.discount, 'discount'));
    if (input.deliveryFee !== undefined) {
      order.deliveryFee = centsToDecimal(inputToCents(input.deliveryFee, 'deliveryFee'));
    }

    const subtotalCents = decimalToCents(order.subtotal);
    const discountCents = decimalToCents(order.discount);
    const deliveryFeeCents = decimalToCents(order.deliveryFee);
    if (discountCents > subtotalCents) {
      throw new BadRequestException('Discount cannot exceed the order subtotal.');
    }
    order.totalAmount = centsToDecimal(subtotalCents - discountCents + deliveryFeeCents);

    await repository.save(order);
    return this.findOne(id);
  }

  private getDataSource(): DataSource {
    if (!this.dataSource?.isInitialized) {
      throw new ServiceUnavailableException('Order database is not configured.');
    }
    return this.dataSource;
  }
}