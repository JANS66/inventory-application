import { fetchProducts } from "./js/products.js";

// Helper tool to safely fetch raw HTML template strings and inject them into container points
async function loadComponent(elementId, filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok)
      throw new Error(
        `Could not locate component template file target: ${filePath}`,
      );
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
  } catch (error) {
    console.error("Structural framework asset rendering fault:", error);
  }
}

// Central initialization sequence
document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    loadComponent("add-modal-container", "/components/modal-product-add.html"),
    loadComponent(
      "edit-modal-container",
      "/components/modal-product-edit.html",
    ),
    loadComponent(
      "detail-modal-container",
      "/components/modal-product-detail.html",
    ),
  ]);

  // Initialize the application view data loop
  fetchProducts();
});
