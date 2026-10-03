import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
export declare class ProductsService {
    private readonly products?;
    constructor(products?: Repository<ProductEntity> | undefined);
    findAll(): Promise<ProductEntity[]>;
}
