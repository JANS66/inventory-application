const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");

// GET /api/products -> Fetches all products
router.get("/", productsController.getAllProducts);

// GET /api/products/:id -> Fetches details for one specific product
router.get("/:id", productsController.getProductById);

// PUT /api/products/:id => Full update of product fields
router.put("/:id", productsController.updateProduct);

// PATCH /api/products/:id/stock -> Micro adjustment to stock numbers
router.patch("/:id/stock", productsController.updateStock);

// POST /api/products -> Creates a new product
router.post("/", productsController.createProduct);

module.exports = router;
