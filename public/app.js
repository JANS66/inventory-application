import { fetchProducts } from "./js/products.js";
import { fetchCategories } from "./js/categories.js";

// Async component loader tool
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

// View Switcher / Tab Management Engine
function switchView(targetView) {
  // 1. Hide all application panels
  document.querySelectorAll(".view-panel").forEach((panel) => {
    panel.classList.add("hidden");
  });

  // 2. Unveil the chosen active target panel
  document.getElementById(`view-${targetView}`).classList.remove("hidden");

  // 3. Reset all navigation tab styling configurations
  const tabs = ["products", "categories", "suppliers"];
  tabs.forEach((tab) => {
    const btn = document.getElementById(`tab-${tab}`);
    if (tab === targetView) {
      // Active Style Configurations
      btn.className =
        "px-5 py-2.5 font-semibold text-sm rounded-t-lg transition border-b-2 border-blue-600 text-blue-600";

      // Trigger lazy loaded data refreshes upon choosing views
      if (tab === "products") fetchProducts();
      if (tab === "categories") fetchCategories();
    } else {
      // Inactive Configurations
      btn.className =
        "px-5 py-2.5 font-medium text-sm rounded-t-lg transition text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent";
    }
  });
}

// Attach switchView directly to window scope so inline HTML onclick commands can catch it
window.switchView = switchView;

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

  // Initialize default view state
  switchView("products");
});
