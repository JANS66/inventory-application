// 1. Fetch products from Express API
export async function fetchProducts() {
  try {
    const response = await fetch("/api/products");
    const products = await response.json();

    const tableBody = document.getElementById("product-table-body");
    if (!tableBody) return;
    tableBody.innerHTML = ""; // Clear loading row

    if (products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-500">No products found. Run seed script.</td></tr>`;
      return;
    }

    // Loop through products and build the rows dynamically
    products.forEach((product) => {
      const row = document.createElement("tr");
      row.className = "border-b border-gray-100 hover:bg-gray-50 transition";

      const skuCell = document.createElement("td");
      skuCell.className = "p-4 font-mono font-semibold text-sm text-blue-600";
      skuCell.textContent = product.sku;

      const nameCell = document.createElement("td");
      nameCell.className = "p-4 font-medium text-gray-900";

      const nameLink = document.createElement("button");
      nameLink.className =
        "text-blue-600 hover:underline text-left font-semibold";
      nameLink.textContent = product.name;
      nameLink.onclick = () => viewProductDetails(product.id); // Triggers GET /:id

      nameCell.appendChild(nameLink);

      const priceCell = document.createElement("td");
      priceCell.className = "p-4 font-medium text-emerald-600";
      priceCell.textContent = `$${parseFloat(product.price).toFixed(2)}`;

      const actionCell = document.createElement("td");
      actionCell.className = "p-4 text-center space-x-2";

      const editBtn = document.createElement("button");
      editBtn.className =
        "bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded transition text-sm";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => openEditModal(product);

      const deleteBtn = document.createElement("button");
      deleteBtn.className =
        "bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1 rounded transition text-sm";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteProduct(product.id);

      actionCell.appendChild(editBtn);
      actionCell.appendChild(deleteBtn);

      row.appendChild(skuCell);
      row.appendChild(nameCell);
      row.appendChild(priceCell);
      row.appendChild(actionCell);

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

// 2. Trigger product deletion
export async function deleteProduct(id) {
  if (confirm("Are you sure you want to remove this product from inventory?")) {
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchProducts();
      } else {
        alert("Failed to delete the item.");
      }
    } catch (error) {
      console.error("Error executing delete command:", error);
    }
  }
}

// 3. Toggle visibility of the Add Product Modal and instantly clear fields
export async function toggleFormModal() {
  const modal = document.getElementById("product-modal");
  modal.classList.toggle("hidden");

  // Clear out inputs whenever closing or initializing
  document.getElementById("product-form").reset();

  // If opening the modal, fetch dynamic list items from database to fill selections
  if (!modal.classList.contains("hidden")) {
    const catSelect = document.getElementById("form-category");
    const supSelect = document.getElementById("form-supplier");
    catSelect.innerHTML = '<option value="">-- No Category --</option>';
    supSelect.innerHTML = '<option value="">-- No Supplier --</option>';

    try {
      const [catRes, supRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/suppliers"),
      ]);

      if (catRes.ok) {
        const categories = await catRes.json();
        categories.forEach((c) => {
          const opt = document.createElement("option");
          opt.value = c.id;
          opt.textContent = c.name;
          catSelect.appendChild(opt);
        });
      }

      if (supRes.ok) {
        const suppliers = await supRes.json();
        suppliers.forEach((s) => {
          const opt = document.createElement("option");
          opt.value = s.id;
          opt.textContent = s.name;
          supSelect.appendChild(opt);
        });
      }
    } catch (error) {
      console.error("Failed loading options for add product dropdowns:", error);
    }
  }
}

// 4. Transmit Upgraded Payload to POST endpoint
async function submitProductForm(event) {
  event.preventDefault(); // Stop native HTML page refreshing reload behavior

  // Build the complete body parameters mapping object
  const payload = {
    sku: document.getElementById("form-sku").value.trim(),
    name: document.getElementById("form-name").value.trim(),
    price: parseFloat(document.getElementById("form-price").value),
    initial_quantity:
      parseInt(document.getElementById("form-quantity").value) || 0,
    description:
      document.getElementById("form-description").value.trim() || null,
    category_id: document.getElementById("form-category").value
      ? parseInt(document.getElementById("form-category").value)
      : null,
    supplier_id: document.getElementById("form-supplier").value
      ? parseInt(document.getElementById("form-supplier").value)
      : null,
  };

  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      toggleFormModal(); // Close modal upon success
      fetchProducts(); // Instantly fetch the refreshed safe item array grid lists
    } else {
      // Process error data structure returned by backend router validations
      const errorData = await response.json();
      // Map out exact response errors back to the interface alert
      const messages = errorData.errors
        ? errorData.errors.map((err) => err.msg).join("\n")
        : "Unkown error occurred.";
      alert(`Validation Blocked Request:\n\n${messages}`);
    }
  } catch (error) {
    console.error(
      "Network communication error executing create pipeline:",
      error,
    );
  }
}

// 5. Toggle visibility of the Edit Modal
export function toggleEditModal() {
  const modal = document.getElementById("edit-modal");
  modal.classList.toggle("hidden");
}

// 6. Open Edit Modal, download relational items, and fill all inputs
export async function openEditModal(product) {
  // Clear any old dynamically generated select dropdown inputs
  const catSelect = document.getElementById("edit-form-category");
  const supSelect = document.getElementById("edit-form-supplier");
  catSelect.innerHTML = '<option value="">-- No Category --</option>';
  supSelect.innerHTML = '<option value="">-- No Supplier --</option>';

  try {
    // Parallel fetch active categories and suppliers list streams
    const [catRes, supRes] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/suppliers"),
    ]);

    if (catRes.ok) {
      const categories = await catRes.json();
      categories.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        catSelect.appendChild(opt);
      });
    }

    if (supRes.ok) {
      const suppliers = await supRes.json();
      suppliers.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.name;
        supSelect.appendChild(opt);
      });
    }
  } catch (error) {
    console.error("Failed loading options for dropdown elements:", error);
  }

  // Bind values from table object dataset row into form inputs
  document.getElementById("edit-form-id").value = product.id;
  document.getElementById("edit-form-sku").value = product.sku;
  document.getElementById("edit-form-name").value = product.name;
  document.getElementById("edit-form-price").value = product.price;
  document.getElementById("edit-form-description").value =
    product.description || "";

  // Set the dropdown selections to match current IDs (or empty if null)
  document.getElementById("edit-form-category").value =
    product.category_id || "";
  document.getElementById("edit-form-supplier").value =
    product.supplier_id || "";

  toggleEditModal();
}

// 7. Transmit the complete upgraded payload back to Express PUT router rules
export async function submitEditForm(event) {
  event.preventDefault();
  const id = document.getElementById("edit-form-id").value;

  // Package EVERY field value into body payload object
  const payload = {
    sku: document.getElementById("edit-form-sku").value.trim(),
    name: document.getElementById("edit-form-name").value.trim(),
    price: parseFloat(document.getElementById("edit-form-price").value),
    description:
      document.getElementById("edit-form-description").value.trim() || null,
    category_id: document.getElementById("edit-form-category").value
      ? parseInt(document.getElementById("edit-form-category").value)
      : null,
    supplier_id: document.getElementById("edit-form-supplier").value
      ? parseInt(document.getElementById("edit-form-supplier").value)
      : null,
  };

  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      toggleEditModal();
      fetchProducts();
    } else {
      const errorData = await response.json();
      const messages = errorData.errors
        ? errorData.errors.map((err) => err.msg).join("\n")
        : "Failed to update product.";
      alert(`Validation Blocked Request:\n\n${messages}`);
    }
  } catch (error) {
    console.error("Error executing update command:", error);
  }
}

// 8. Toggle Details Modal
export function toggleDetailModal() {
  document.getElementById("detail-modal").classList.toggle("hidden");
}

// 9. Core Implementation of Get (/:id) Endpoint
export async function viewProductDetails(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) throw new Error("Could not retrieve signle data record");

    const product = await response.json();

    // Bind values straight to the modal DOM elements safely
    document.getElementById("detail-product-id").value = product.id;
    document.getElementById("detail-title").textContent = product.name;
    document.getElementById("detail-sku").textContent = product.sku;
    document.getElementById("detail-category").textContent =
      product.category_name || "Uncategorized";
    document.getElementById("detail-supplier").textContent =
      product.supplier_name || "No Vendor Linked";
    document.getElementById("detail-description").textContent =
      product.description ||
      "No supplemental details document provided for this catalog listing.";
    document.getElementById("detail-stock").textContent =
      product.quantity !== null ? product.quantity : "0";

    toggleDetailModal();
  } catch (error) {
    console.error(
      "Pipeline failure executing individual product fetching:",
      error,
    );
  }
}

// 10. Core Implementation of PATCH Endpoint for Stock Control
export async function submitStockPatch(event) {
  event.preventDefault();
  const id = document.getElementById("detail-product-id").value;
  const adjustmentValue = parseInt(
    document.getElementById("patch-stock-quantity").value,
  );

  const payload = { quantity_change: adjustmentValue }; // Sending the difference number (+10 or -5)

  try {
    const response = await fetch(`/api/products/${id}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      document.getElementById("patch-stock-quantity").value = ""; // clear input
      // Real time double update refresh loop
      await viewProductDetails(id); // Reload the modal contents to see the new stock number
      fetchProducts();
    } else {
      alert("Rejected by backend server system rules.");
    }
  } catch (error) {
    console.error(
      "Communication blackout routing stock modification commands:",
      error,
    );
  }
}

// Bind methords explicitly to the global window scope so standard inline HTML onclick handlers work
window.toggleFormModal = toggleFormModal;
window.submitProductForm = submitProductForm;
window.toggleEditModal = toggleEditModal;
window.submitEditForm = submitEditForm;
window.toggleDetailModal = toggleDetailModal;
window.submitStockPatch = submitStockPatch;
