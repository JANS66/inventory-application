const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productController");

// GET /api/products -> Fetches all products
router.get("/", productsController.getAllProducts);

// POST /api/products -> Creates a new product
router.post("/", productsController.createProduct);

module.exports = router;
