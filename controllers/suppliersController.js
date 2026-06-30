const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 1. GET all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const complexQueryText = `
      SELECT
        s.id,
        s.name,
        s.contact_email,
        s.phone,
        COUNT(p.id)::int AS product_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', p.id,
              'sku', p.sku,
              'name', p.name,
              'quantity', COALESCE(i.quantity, 0)
            )
          ) FILTER (WHERE p.id IS NOT NULL), '[]'
        ) AS products
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id
      LEFT JOIN inventory_stock i ON p.id = i.product_id
      GROUP BY s.id
      ORDER BY s.name ASC;
    `;

    const result = await pool.query(complexQueryText);
    res.json(result.rows);
  } catch (err) {
    console.error("Database error compiling supplier analytics:", err);
    res.status(500).json({
      error: "Internal server error fetching suppliers inventory summary",
    });
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

// PUT Update a supplier
const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { name, contact_email, phone } = req.body;

  try {
    const queryText = `
      UPDATE suppliers
      SET name = $1, contact_email = $2, phone = $3
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(queryText, [
      name,
      contact_email,
      phone,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "A supplier with this email already exists" });
    }
    res.status(500).json({ error: "Internal server error updating supplier" });
  }
};

module.exports = {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
};
