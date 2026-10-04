import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { databaseOptions } from './database/database.options';
import { HealthModule } from './health/health.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

const configModule = ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
    PORT: Joi.number().port().default(3001),
    FRONTEND_ORIGINS: Joi.string()
      .allow('')
      .default('http://localhost:3000,http://localhost:8000,http://127.0.0.1:8000,http://localhost:5500,http://127.0.0.1:5500'),
    DB_HOST: Joi.string().allow('').default(''),
    DB_PORT: Joi.number().port().default(3306),
    DB_USER: Joi.string().allow('').default(''),
    DB_PASSWORD: Joi.string().allow('').default(''),
    DB_NAME: Joi.string().allow('').default(''),
    JWT_SECRET: Joi.string().allow('').default(''),
  }).with('DB_HOST', ['DB_USER', 'DB_PASSWORD', 'DB_NAME']),
});

const databaseModule = process.env.DB_HOST
  ? [TypeOrmModule.forRoot(databaseOptions())]
  : [];

@Module({
  imports: [
    configModule,
    ...databaseModule,
    HealthModule,
    ProductsModule,
    CategoriesModule,
    AuthModule,
    UsersModule,
    CartModule,
    OrdersModule,
    AdminModule,
    InventoryModule,
  ],
})
export class AppModule {}