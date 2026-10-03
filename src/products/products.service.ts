import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Optional } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @Optional()
    @InjectRepository(ProductEntity)
    private readonly products?: Repository<ProductEntity>,
  ) {}

  findAll(): Promise<ProductEntity[]> {
    return this.products
      ? this.products.find({
          where: { isActive: true },
          order: { createdAt: 'DESC' },
        })
      : Promise.resolve([]);
  }
}