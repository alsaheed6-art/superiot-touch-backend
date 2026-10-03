"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseOptions = databaseOptions;
const category_entity_1 = require("../categories/category.entity");
const product_entity_1 = require("../products/product.entity");
function databaseOptions() {
    return {
        type: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [product_entity_1.ProductEntity, category_entity_1.CategoryEntity],
        migrations: [`${__dirname}/migrations/*{.ts,.js}`],
        migrationsTableName: 'typeorm_migrations',
        synchronize: false,
        migrationsRun: false,
    };
}
//# sourceMappingURL=database.options.js.map