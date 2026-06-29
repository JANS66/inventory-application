const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 1. GET all products
const getAllProducts = async (req, res) => {
  try {
    // Added second JOIN to pull the quantity from inventory_stock
    const queryText = `
            SELECT 
              p.*, 
              c.name AS category_name,
              s.quantity AS stock_quantity
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN inventory_stock s ON p.id = s.product_id
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

// GET a single product by ID (with all joined data)
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const queryText = `
      SELECT
        p.*,
        c.name AS category_name,
        s.name AS supplier_name,
        i.quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN inventory_stock i ON p.id = i.product_id
      WHERE p.id = $1
    `;
    const result = await pool.query(queryText, [id]);

    // If no product matches that ID, return a 404
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error fetching product details" });
  }
};

// PUT Update general product details (name, price, etc.)
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { sku, name, description, price, category_id, supplier_id } = req.body;

  try {
    const queryText = `
      UPDATE products
      SET sku = $1, name = $2, description = $3, price = $4, category_id = $5, supplier_id = $6
      WHERE id = $7
      RETURNING *
    `;
    const values = [
      sku,
      name,
      description,
      price,
      category_id,
      supplier_id,
      id,
    ];
    const result = await pool.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "A product with this SKU already exists" });
    }
    res
      .status(500)
      .json({ error: "Internal server error updating product details" });
  }
};

// PATCH Update stock quantities (Restock or Deduct)
const updateStock = async (req, res) => {
  const { id } = req.params;
  const { quantity_change } = req.body; // Can be positive (restock) or negative (sale)

  try {
    const queryText = `
      UPDATE inventory_stock
      SET quantity = quantity + $1
      WHERE product_id = $2
      RETURNING *
    `;
    const result = await pool.query(queryText, [quantity_change, id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Stock ledger not found for this product" });
    }

    res.json({
      message: "Stock updated successfully",
      stock: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error updating stock quantities" });
  }
};

// DELETE a product (will automatically cascade delete its stock ledger via database rules)
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product and its associated stock ledger deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error deleting product" });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
};
