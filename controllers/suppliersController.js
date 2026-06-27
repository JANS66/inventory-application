const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 1. GET all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM suppliers ORDER BY name ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error fetching suppliers" });
  }
};

// 2. POST create a new supplier
const createSupplier = async (req, res) => {
  const { name, contact_email, phone } = req.body;

  try {
    const queryText = `
            INSERT INTO suppliers (name, contact_email, phone)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
    const values = [name, contact_email, phone];
    const result = await pool.query(queryText, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    // Handle unique constraint error for duplicate contact_email
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "A supplier with this email already exists" });
    }
    res.status(500).json({ error: "Internal server error creating supplier" });
  }
};

module.exports = {
  getAllSuppliers,
  createSupplier,
};
