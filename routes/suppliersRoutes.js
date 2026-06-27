const express = require("express");
const router = express.Router();
const suppliersController = require("../controllers/suppliersController");

// GET /api/suppliers
router.get("/", suppliersController.getAllSuppliers);

// POST /api/suppliers
router.post("/", suppliersController.createSupplier);

module.exports = router;
