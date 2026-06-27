const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");
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
    .withMessage("The category ID must be a positive integer"),
  handleValidationErrors,
];

// Category Schema Validator (Shared by POST and PUT)
const validateCategoryBody = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 50 })
    .withMessage("Category name cannot exceed 50 characters"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Category name cannot exceed 50 characters"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description cannot exceed 255 characters"),

  handleValidationErrors,
];

// --- ROUTES LINKED WITH VALIDATIONS ---

// Read All (No inputs to validate)
router.get("/", categoriesController.getAllCategories);

// Read One (Validates ID)
router.get("/:id", validateId, categoriesController.getCategoryById);

// Create (Validates Body)
router.post("/", validateCategoryBody, categoriesController.createCategory);

// Update (Validates ID and Body)
router.put(
  "/:id",
  [...validateId, ...validateCategoryBody],
  categoriesController.updateCategory,
);

// Delete (Validates ID)
router.delete("/:id", validateId, categoriesController.deleteCategory);

module.exports = router;
