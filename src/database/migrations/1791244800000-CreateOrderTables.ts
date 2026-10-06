import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderTables1791244800000 implements MigrationInterface {
  name = 'CreateOrderTables1791244800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE orders (
        id varchar(36) NOT NULL,
        customer_name varchar(180) NOT NULL,
        customer_phone varchar(40) NOT NULL,
        customer_email varchar(254) NULL,
        delivery_address varchar(255) NOT NULL,
        delivery_city varchar(120) NOT NULL,
        delivery_state varchar(120) NOT NULL,
        delivery_instructions text NULL,
        status enum('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
        subtotal decimal(12,2) NOT NULL,
        discount decimal(12,2) NOT NULL DEFAULT 0.00,
        delivery_fee decimal(12,2) NOT NULL DEFAULT 0.00,
        total_amount decimal(12,2) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY ix_orders_created_at (created_at),
        KEY ix_orders_status_created_at (status, created_at)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE order_items (
        id varchar(36) NOT NULL,
        order_id varchar(36) NOT NULL,
        product_id varchar(36) NOT NULL,
        product_name varchar(180) NOT NULL,
        unit_price decimal(12,2) NOT NULL,
        quantity int unsigned NOT NULL,
        line_total decimal(12,2) NOT NULL,
        PRIMARY KEY (id),
        KEY ix_order_items_order_id (order_id),
        KEY ix_order_items_product_id (product_id),
        CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE order_items');
    await queryRunner.query('DROP TABLE orders');
  }
}