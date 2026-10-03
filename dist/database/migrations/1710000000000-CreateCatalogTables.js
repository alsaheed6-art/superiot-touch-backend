"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCatalogTables1710000000000 = void 0;
class CreateCatalogTables1710000000000 {
    name = 'CreateCatalogTables1710000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE categories (
        id varchar(36) NOT NULL,
        name varchar(120) NOT NULL,
        slug varchar(160) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY uq_categories_name (name),
        UNIQUE KEY uq_categories_slug (slug)
      ) ENGINE=InnoDB
    `);
        await queryRunner.query(`
      CREATE TABLE products (
        id varchar(36) NOT NULL,
        name varchar(180) NOT NULL,
        description text NULL,
        price decimal(12,2) NOT NULL,
        category varchar(120) NOT NULL,
        image_url varchar(2048) NULL,
        is_active tinyint NOT NULL DEFAULT 1,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY ix_products_category (category),
        KEY ix_products_active (is_active)
      ) ENGINE=InnoDB
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE products');
        await queryRunner.query('DROP TABLE categories');
    }
}
exports.CreateCatalogTables1710000000000 = CreateCatalogTables1710000000000;
//# sourceMappingURL=1710000000000-CreateCatalogTables.js.map