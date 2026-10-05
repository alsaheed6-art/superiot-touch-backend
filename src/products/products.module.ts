import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { ProductImageService } from './product-image.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const persistenceImports = process.env.DB_HOST
  ? [TypeOrmModule.forFeature([ProductEntity])]
  : [];

@Module({
  imports: persistenceImports,
  controllers: [ProductsController],
  providers: [ProductImageService, ProductsService],
})
export class ProductsModule {}