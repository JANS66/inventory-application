const express = require("express");
const router = express.Router();
const suppliersController = require("../controllers/suppliersController");
const { body, param, validationResult } = require("express-validator");

// Common validation error checker middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Reusable parameter ID validator
const validateId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("The supplier ID must be a positive integer"),
  handleValidationErrors,
];

// Supplier Schema Validator (Shared by POST and PUT)
const validateSupplierBody = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Supplier name is required")
    .isLength({ max: 100 })
    .withMessage("Supplier name cannot exceed 100 characters"),

  body("contact_email")
    .trim()
    .notEmpty()
    .withMessage("Contact email is required")
    .isEmail()
    .withMessage(
      "Must be a valid email address structure (e.g., vendor@example.com",
    ),

  body("phone")
    .optional({ nullable: true })
    .trim()
    // Enforces standard phone characters (numbers, spaces, dashes, parentheses, plus sign)
    .matches(/^[\d\s()+-]*$/)
    .withMessage("Phone number contains invalid characters"),

  handleValidationErrors,
];

// --- ROUTES LINKED WITH VALIDATIONS ---

// Read All (No inputs to validate)
router.get("/", suppliersController.getAllSuppliers);

// Create (Validates Body)
router.post("/", validateSupplierBody, suppliersController.createSupplier);

// Update (Validates ID and Body)
router.put(
  "/:id",
  [...validateId, ...validateSupplierBody],
  suppliersController.updateSupplier,
);

module.exports = router;
