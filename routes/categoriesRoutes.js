const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");

// GET /api/categories
router.get("/", categoriesController.getAllCategories);

// POST /api/categories
router.post("/", categoriesController.createCategory);

module.exports = router;
