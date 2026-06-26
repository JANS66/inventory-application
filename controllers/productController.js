const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 1. GET all products
const getAllProducts = async (req, res) => {
  try {
    // We use a JOIN to automatically pull the category name along with the product
    const queryText = `
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
        `;
    const result = await pool.query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error fetching products" });
  }
};

// 2. POST create a new product
const createProduct = async (req, res) => {
  const { sku, name, description, price, category_id, supplier_id } = req.body;

  try {
    const queryText = `
            INSERT INTO products (sku, name, description, price, category_id, supplier_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
    const values = [sku, name, description, price, category_id, supplier_id];
    const result = await pool.query(queryText, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error creating product" });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
};
