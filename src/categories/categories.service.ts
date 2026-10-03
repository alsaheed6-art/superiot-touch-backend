import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Optional } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CategoryEntity } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @Optional()
    @InjectRepository(CategoryEntity)
    private readonly categories?: Repository<CategoryEntity>,
  ) {}

  findAll(): Promise<CategoryEntity[]> {
    return this.categories ? this.categories.find({ order: { name: 'ASC' } }) : Promise.resolve([]);
  }
}