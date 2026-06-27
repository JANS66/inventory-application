const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");
const { body, param, validationResult } = require("express-validator");

// Common error checker middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("The route ID must be a positive integer"),
  handleValidationErrors,
];

// Product Schema Validator (SHared by POST and PUT)
const validateProductBody = [
  body("sku")
    .trim()
    .notEmpty()
    .withMessage("SKU is required")
    .isAlphanumeric("en-US", { ignore: "-" })
    .withMessage("SKU must only contain letters, numbers, and dashes"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category_id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Category ID must be a valid positive integer"),

  body("supplier_id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Supplier ID must be a valid positive integer"),

  body("initial_quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Initial quantity cannot be negative"),

  handleValidationErrors,
];

// Stock Adjustment Validator (PATCH)
const validateStockBody = [
  body("quantity_change")
    .isInt()
    .withMessage(
      "Stock delta change must be a valid whole integer (positive or negative)",
    ),
  handleValidationErrors,
];

// --- ROUTES LINKED WITH VALIDATIONS ---

// Read All (No input to validate)
router.get("/", productsController.getAllProducts);

// Read One (Validates the ID parameter)
router.get("/:id", validateId, productsController.getProductById);

// Create (Validates the complete product body schema)
router.post("/", validateProductBody, productsController.createProduct);

// Update Details (Validates both the ID parameter AND the product body schema)
router.put(
  "/:id",
  [...validateId, ...validateProductBody],
  productsController.updateProduct,
);

// Update Stock Level (Validates both the ID parameters AND the delta number body)
router.patch(
  "/:id/stock",
  [...validateId, ...validateStockBody],
  productsController.updateStock,
);

// Delete (Validates the ID parameter)
router.delete("/:id", validateId, productsController.deleteProduct);

module.exports = router;
