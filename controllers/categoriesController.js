const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 1. GET all categories
const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY name ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error fetching categories" });
  }
};

// 2. POST create a new category
const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const queryText = `
            INSERT INTO categories (name, description)
            VALUES ($1, $2)
            RETURNING *
        `;
    const values = [name, description];
    const result = await pool.query(queryText, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    // Handle Postgres unique constraint error (error code 23505)
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "A category with this name already exists" });
    }
    res.status(500).json({ error: "Internal server error creating category" });
  }
};

// GET a single category by ID
const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    // Query 1: Get the category details
    const categoryQuery = "SELECT * FROM categories WHERE id = $1";
    const categoryResult = await pool.query(categoryQuery, [id]);

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const category = categoryResult.rows[0];

    // Query 2: Get all products belonging to this specific category
    const productsQuery = `
      SELECT id, sku, name, price
      FROM products
      WHERE category_id = $1
      ORDER BY name ASC
    `;
    const productsResult = await pool.query(productsQuery, [id]);

    // Attach the products array directly to our category object response
    const finalResponse = {
      ...category,
      products: productsResult.rows,
    };

    res.json(finalResponse);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error fetching category details" });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  getCategoryById,
};
