const express = require("express");
const router = express.Router();
const suppliersController = require("../controllers/suppliersController");

// GET /api/suppliers
router.get("/", suppliersController.getAllSuppliers);

// POST /api/suppliers
router.post("/", suppliersController.createSupplier);

router.put("/:id", suppliersController.updateSupplier);

module.exports = router;
