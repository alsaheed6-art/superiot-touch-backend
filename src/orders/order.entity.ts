import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from './order-status';
import { OrderItemEntity } from './order-item.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_name', type: 'varchar', length: 180 })
  customerName: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 40 })
  customerPhone: string;

  @Column({ name: 'customer_email', type: 'varchar', length: 254, nullable: true })
  customerEmail: string | null;

  @Column({ name: 'delivery_address', type: 'varchar', length: 255 })
  deliveryAddress: string;

  @Column({ name: 'delivery_city', type: 'varchar', length: 120 })
  deliveryCity: string;

  @Column({ name: 'delivery_state', type: 'varchar', length: 120 })
  deliveryState: string;

  @Column({ name: 'delivery_instructions', type: 'text', nullable: true })
  deliveryInstructions: string | null;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  discount: string;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  deliveryFee: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: string;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items: OrderItemEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;
}