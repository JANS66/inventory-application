const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

// Middleware to parse JSON bodies
app.use(express.json());

// PostgreSQL Connection Setup using the External URI
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessary for most cloud providers
  },
});

// Test Database Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  console.log("Successfully connected to PostgreSQL database!");
  release();
});

// Sample Route
app.get("/", async (req, res) => {
  try {
    // Basic query to check if things work
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Welcome to the Express app!", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database query error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
