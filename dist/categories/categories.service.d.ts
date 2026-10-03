import { Repository } from 'typeorm';
import { CategoryEntity } from './category.entity';
export declare class CategoriesService {
    private readonly categories?;
    constructor(categories?: Repository<CategoryEntity> | undefined);
    findAll(): Promise<CategoryEntity[]>;
}
