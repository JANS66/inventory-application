const express = require("express");
require("dotenv").config();

const productRoutes = require("./routes/productsRoutes");
const categoriesRoutes = require("./routes/categoriesRoutes");

const app = express();
const port = process.env.PORT;

// Middleware to parse JSON bodies
app.use(express.json());

// Use the routes (prefixes all product endpoints with /api/products)
app.use("/api/products", productRoutes);
app.use("/api/categories", categoriesRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Inventory API is up and running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
