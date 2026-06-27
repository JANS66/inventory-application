const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");

// GET /api/categories
router.get("/", categoriesController.getAllCategories);

// GET /api/categories/:id -> Fetches details for one specific category + its products
router.get("/:id", categoriesController.getCategoryById);

// POST /api/categories
router.post("/", categoriesController.createCategory);

module.exports = router;
