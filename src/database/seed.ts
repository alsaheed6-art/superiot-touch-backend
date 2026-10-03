import 'dotenv/config';
import { In } from 'typeorm';
import { databaseOptions } from './database.options';
import { ProductEntity } from '../products/product.entity';
import { DataSource } from 'typeorm';

const catalog = [
  { name: 'Premium Agbada', price: 150000, category: 'Agbada', imageUrl: 'images/IMG-20260826-WA0011.jpg' },
  { name: 'Luxury Agbada', price: 150000, category: 'Agbada', imageUrl: 'images/IMG-20260826-WA0012.jpg' },
  { name: 'Royal Agbada', price: 150000, category: 'Agbada', imageUrl: 'images/IMG-20260826-WA0013.jpg' },
  { name: 'Classic Agbada', price: 150000, category: 'Agbada', imageUrl: 'images/IMG-20260826-WA0014.jpg' },
  { name: 'Blue Agbada', price: 150000, category: 'Agbada', imageUrl: 'images/IMG-20260826-WA0015.jpg' },
  { name: 'Black Agbada', price: 150000, category: 'Agbada', imageUrl: 'images/IMG-20260826-WA0016.jpg' },
  { name: 'White Agbada', price: 150000, category: 'Agbada', imageUrl: 'images/IMG-20260826-WA0054.jpg' },
  { name: 'Premium Kaftan', price: 50000, category: 'Kaftan', imageUrl: 'images/IMG-20260826-WA0024.jpg' },
  { name: 'Luxury Kaftan', price: 50000, category: 'Kaftan', imageUrl: 'images/IMG-20260826-WA0025.jpg' },
  { name: 'Purple Kaftan', price: 50000, category: 'Kaftan', imageUrl: 'images/IMG-20260826-WA0028.jpg' },
  { name: 'White Kaftan', price: 50000, category: 'Kaftan', imageUrl: 'images/IMG-20260826-WA0036.jpg' },
  { name: 'Premium Arewa Cap', price: 50000, category: 'Cap', imageUrl: 'images/IMG-20260826-WA0004.jpg' },
  { name: 'Blue Arewa Cap', price: 50000, category: 'Cap', imageUrl: 'images/IMG-20260826-WA0005.jpg' },
  { name: 'Gold Arewa Cap', price: 50000, category: 'Cap', imageUrl: 'images/IMG-20260826-WA0006.jpg' },
  { name: 'Black Arewa Cap', price: 50000, category: 'Cap', imageUrl: 'images/IMG-20260826-WA0007.jpg' },
  { name: 'Luxury Arewa Cap', price: 50000, category: 'Cap', imageUrl: 'images/IMG-20260826-WA0008.jpg' },
  { name: 'Aso Oke Cap', price: 8000, category: 'Cap', imageUrl: 'images/IMG-20260826-WA0047.jpg' },
  { name: 'Purple Aso Oke Cap', price: 8000, category: 'Cap', imageUrl: 'images/IMG-20260826-WA0048.jpg' },
  { name: 'Multi Aso Oke Cap', price: 8000, category: 'Cap', imageUrl: 'images/IMG-20260826-WA0049.jpg' },
  { name: 'Brown Aso Oke Cap', price: 8000, category: 'Cap', imageUrl: 'images/IMG-20260826-WA0050.jpg' },
  { name: 'Navy Aso Oke Cap', price: 8000, category: 'Cap', imageUrl: 'images/IMG-20260826-WA0009.jpg' },
  { name: 'Gold Aso Oke Cap', price: 8000, category: 'Cap', imageUrl: 'images/IMG-20260826-WA0010.jpg' },
  { name: 'Khaki Baggy Pant', price: 15000, category: 'Pant', imageUrl: 'images/IMG-20260826-WA0019.jpg' },
  { name: 'White Baggy Pant', price: 15000, category: 'Pant', imageUrl: 'images/IMG-20260826-WA0020.jpg' },
  { name: 'Grey Baggy Pant', price: 15000, category: 'Pant', imageUrl: 'images/IMG-20260826-WA0023.jpg' },
] as const;

const lockName = 'superior_touch_catalog_seed';

function normalizedName(name: string): string {
  return name.trim().toLocaleLowerCase('en');
}

async function seedCatalog(): Promise<void> {
  const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`Refusing to seed without database configuration: ${missingVariables.join(', ')}`);
  }

  const dataSource = new DataSource(databaseOptions());
  await dataSource.initialize();

  const queryRunner = dataSource.createQueryRunner();
  let lockAcquired = false;
  let transactionStarted = false;

  try {
    await queryRunner.connect();
    const lockRows = (await queryRunner.query('SELECT GET_LOCK(?, 30) AS acquired', [lockName])) as Array<{
      acquired: number | null;
    }>;

    if (Number(lockRows[0]?.acquired) !== 1) {
      throw new Error('Could not acquire the catalog seed lock within 30 seconds.');
    }
    lockAcquired = true;

    await queryRunner.startTransaction('READ COMMITTED');
    transactionStarted = true;

    const repository = queryRunner.manager.getRepository(ProductEntity);
    const existingProducts = await repository.find({
      where: { name: In(catalog.map((product) => product.name)) },
    });
    const existingByName = new Map<string, ProductEntity>();

    for (const product of existingProducts) {
      const key = normalizedName(product.name);
      if (existingByName.has(key)) {
        throw new Error(`Multiple database products match the catalog name "${product.name}".`);
      }
      existingByName.set(key, product);
    }

    let inserted = 0;
    let updated = 0;
    let unchanged = 0;

    for (const item of catalog) {
      const existing = existingByName.get(normalizedName(item.name));
      const price = String(item.price);

      if (!existing) {
        const product = repository.create({
          name: item.name,
          price,
          category: item.category,
          imageUrl: item.imageUrl,
          description: null,
          isActive: true,
        });
        await repository.save(product);
        inserted += 1;
        continue;
      }

      const changed =
        existing.name !== item.name ||
        Number(existing.price) !== item.price ||
        existing.category !== item.category ||
        existing.imageUrl !== item.imageUrl ||
        !existing.isActive;

      if (!changed) {
        unchanged += 1;
        continue;
      }

      existing.name = item.name;
      existing.price = price;
      existing.category = item.category;
      existing.imageUrl = item.imageUrl;
      existing.isActive = true;
      await repository.save(existing);
      updated += 1;
    }

    await queryRunner.commitTransaction();
    transactionStarted = false;
    console.info(`Catalog seed complete: ${inserted} inserted, ${updated} updated, ${unchanged} unchanged.`);
  } catch (error) {
    if (transactionStarted) await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    if (lockAcquired) {
      await queryRunner.query('SELECT RELEASE_LOCK(?)', [lockName]);
    }
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seedCatalog().catch((error: unknown) => {
  console.error('Catalog seed failed:', error);
  process.exitCode = 1;
});