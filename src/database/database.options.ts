import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { CategoryEntity } from '../categories/category.entity';
import { OrderEntity } from '../orders/order.entity';
import { OrderItemEntity } from '../orders/order-item.entity';
import { ProductEntity } from '../products/product.entity';

export function databaseOptions(): MysqlConnectionOptions {
  return {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [ProductEntity, CategoryEntity, OrderEntity, OrderItemEntity],
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false,
    migrationsRun: false,
  };
}