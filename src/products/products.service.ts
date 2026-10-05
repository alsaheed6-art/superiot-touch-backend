import {
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductImageService } from './product-image.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productImages: ProductImageService,
    @Optional()
    @InjectRepository(ProductEntity)
    private readonly products?: Repository<ProductEntity>,
  ) {}

  async findAll(includeInactive = false) {
    if (!this.products) return [];
    const products = await this.products.find({
      ...(includeInactive ? {} : { where: { isActive: true } }),
      order: { createdAt: 'DESC' },
    });
    return products.map((product) => this.toResponse(product));
  }

  async findOne(id: string) {
    const product = await this.getRepository().findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found.');
    return this.toResponse(product);
  }

  async create(input: CreateProductDto) {
    const repository = this.getRepository();
    const product = repository.create({
      name: input.name,
      description: input.description ?? null,
      price: String(input.price),
      category: input.category,
      imageUrl: input.imageUrl ?? null,
      isActive: true,
    });
    return this.toResponse(await repository.save(product));
  }

  async update(id: string, input: UpdateProductDto) {
    const repository = this.getRepository();
    const product = await repository.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found.');

    if (input.name !== undefined) product.name = input.name;
    if (input.description !== undefined) product.description = input.description;
    if (input.price !== undefined) product.price = String(input.price);
    if (input.category !== undefined) product.category = input.category;
    if (input.imageUrl !== undefined) product.imageUrl = input.imageUrl;
    if (input.isActive !== undefined) product.isActive = input.isActive;

    return this.toResponse(await repository.save(product));
  }

  async uploadImage(id: string, file: Express.Multer.File) {
    const repository = this.getRepository();
    const product = await repository.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found.');

    const previousImageUrl = product.imageUrl;
    const uploaded = await this.productImages.upload(file);
    product.imageUrl = uploaded.imageUrl;

    try {
      await repository.save(product);
    } catch (error) {
      await this.productImages.deleteByImageUrl(uploaded.imageUrl).catch(() => undefined);
      throw error;
    }

    if (previousImageUrl !== uploaded.imageUrl) {
      await this.productImages.deleteByImageUrl(previousImageUrl);
    }
    return this.toResponse(product);
  }

  async remove(id: string) {
    const repository = this.getRepository();
    const product = await repository.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found.');

    await this.productImages.deleteByImageUrl(product.imageUrl);
    await repository.remove(product);
    return { id, deleted: true };
  }

  private getRepository(): Repository<ProductEntity> {
    if (!this.products) {
      throw new ServiceUnavailableException('Product database is not configured.');
    }
    return this.products;
  }

  private toResponse(product: ProductEntity) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      category: product.category,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}