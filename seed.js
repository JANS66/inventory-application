require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDatabase() {
  console.log("Starting database seeding...");
  const client = await pool.connect();

  try {
    // 1. Begin a safe transaction
    await client.query("BEGIN");

    // 2. Clear out any existing data to start fresh (TRUNCATE resets tables cleanly)
    console.log("Clearing old data...");
    await client.query(
      "TRUNCATE inventory_stock, products, categories, suppliers RESTART IDENTITY CASCADE;",
    );

    // 3. Insert Dummy Suppliers
    console.log("Inserting suppliers...");
    const supplierRes = await client.query(`
      INSERT INTO suppliers (name, contact_email, phone) VALUES 
      ('Logitech Global', 'wholesale@logitech.com', '+1-555-123-4567'),
      ('Apex Monitors Ltd', 'orders@apexmonitors.com', '+1-555-987-6543'),
      ('Nordic Office Comfort', 'b2b@nordiccomfort.no', '+47-22-33-44-55')
      RETURNING id, name;
    `);
    const suppliers = supplierRes.rows;

    // 4. Insert Dummy Categories
    console.log("Inserting categories...");
    const categoryRes = await client.query(`
      INSERT INTO categories (name, description) VALUES 
      ('Peripherals', 'Mice, keyboards, trackpads, and pointing devices'),
      ('Displays', 'High-refresh rate monitors, ultra-wides, and 4K office screens'),
      ('Furniture', 'Ergonomic standing desks, task chairs, and lumbar supports')
      RETURNING id, name;
    `);
    const categories = categoryRes.rows;

    // 5. Insert Dummy Products & Stock Levels
    console.log("Inserting products and stock records...");

    // Product 1: MX Master Mouse
    const p1 = await client.query(
      `
      INSERT INTO products (sku, name, description, price, category_id, supplier_id) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        "LOGI-MX3S-01",
        "Logitech MX Master 3S",
        "Graphite wireless ergonomic performance mouse",
        99.99,
        categories[0].id,
        suppliers[0].id,
      ],
    );
    await client.query(
      "INSERT INTO inventory_stock (product_id, quantity) VALUES ($1, $2)",
      [p1.rows[0].id, 45],
    );

    // Product 2: Apex Pro Monitor
    const p2 = await client.query(
      `
      INSERT INTO products (sku, name, description, price, category_id, supplier_id) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        "APEX-27QN-4K",
        'Apex 27" Quantum 4K',
        "27-inch IPS professional color-accurate monitor",
        449.5,
        categories[1].id,
        suppliers[1].id,
      ],
    );
    await client.query(
      "INSERT INTO inventory_stock (product_id, quantity) VALUES ($1, $2)",
      [p2.rows[0].id, 12],
    );

    // Product 3: Nordic Standing Desk
    const p3 = await client.query(
      `
      INSERT INTO products (sku, name, description, price, category_id, supplier_id) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        "NORD-DESK-E3",
        "Nordic Motorized Standing Desk",
        "Dual-motor birch wood adjustable standing desk",
        599.0,
        categories[2].id,
        suppliers[2].id,
      ],
    );
    await client.query(
      "INSERT INTO inventory_stock (product_id, quantity) VALUES ($1, $2)",
      [p3.rows[0].id, 8],
    );

    // 6. Commit everything if no errors occurred
    await client.query("COMMIT");
    console.log(
      "Database successfully populated with realistic dummy dataset!",
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seeding failed, transaction rolled back safely:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
