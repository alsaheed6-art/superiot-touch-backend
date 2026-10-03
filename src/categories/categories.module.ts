import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './category.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

const persistenceImports = process.env.DB_HOST
  ? [TypeOrmModule.forFeature([CategoryEntity])]
  : [];

@Module({
  imports: persistenceImports,
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}