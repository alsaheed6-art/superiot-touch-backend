import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './order.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

const persistenceImports = process.env.DB_HOST
	? [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity])]
	: [];

@Module({
	imports: persistenceImports,
	controllers: [OrdersController],
	providers: [OrdersService],
})
export class OrdersModule {}