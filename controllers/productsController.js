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

// 2. POST create a new product AND its matching stock row using a transaction
const createProduct = async (req, res) => {
  const {
    sku,
    name,
    description,
    price,
    category_id,
    supplier_id,
    initial_quantity = 0,
  } = req.body;

  // Get a specific client from the pool to run a multi query transaction
  const client = await pool.connect();

  try {
    // 1. Start the transaction
    await client.query("BEGIN");

    // 2. Insert the product
    const productQueryText = `
            INSERT INTO products (sku, name, description, price, category_id, supplier_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
    const productValues = [
      sku,
      name,
      description,
      price,
      category_id,
      supplier_id,
    ];
    const productResult = await client.query(productQueryText, productValues);

    // Grab the newly generated product ID
    const newProduct = productResult.rows[0];
    const newProductId = newProduct.id;

    // 3. Immediately insert the starting stock ledger row using that ID
    const stockQueryText = `
      INSERT INTO inventory_stock (product_id, quantity)
      VALUES ($1, $2)
      RETURNING quantity, low_stock_threshold
    `;
    const stockValues = [newProductId, initial_quantity];
    const stockResult = await client.query(stockQueryText, stockValues);

    // 4. Commit the changes permanently to the database
    await client.query("COMMIT");

    // Combine product details and stock details into a signle final response object
    const finalResponse = {
      ...newProduct,
      stock: stockResult.rows[0],
    };

    res.status(201).json(finalResponse);
  } catch (err) {
    // If ANY of the steps above fail, cancel everything back to how it was
    await client.query("ROLLBACK");
    console.error("Transaction Error! Rolling back...", err);
    res.status(500).json({
      error: "Internal server error creating product and stock ledger",
    });
  } finally {
    // Crucial, always release the client back to the pool
    client.release();
  }
};

module.exports = {
  getAllProducts,
  createProduct,
};
