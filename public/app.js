document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
});

// 1. Fetch products from Express API
async function fetchProducts() {
  try {
    const response = await fetch("/api/products");
    const products = await response.json();

    const tableBody = document.getElementById("product-table-body");
    tableBody.innerHTML = ""; // Clear loading row

    if (products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-500">No products found. Run seed script.</td></tr>`;
      return;
    }

    // 2. Loop through products and build the rows dynamically
    products.forEach((product) => {
      const row = document.createElement("tr");
      row.className = "border-b border-gray-100 hover:bg-gray-50 transition";

      const skuCell = document.createElement("td");
      skuCell.className = "p-4 font-mono font-semibold text-sm text-blue-600";
      skuCell.textContent = product.sku;

      const nameCell = document.createElement("td");
      nameCell.className = "p-4 font-medium text-gray-900";
      nameCell.textContent = product.name;

      const priceCell = document.createElement("td");
      priceCell.className = "p-4 font-medium text-emerald-600";
      priceCell.textContent = `$${parseFloat(product.price).toFixed(2)}`;

      const actionCell = document.createElement("td");
      actionCell.className = "p-4 text-center";

      const deleteBtn = document.createElement("button");
      deleteBtn.className =
        "bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1 rounded transition text-sm";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteProduct(product.id);

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

// 3. Trigger product deletion
async function deleteProduct(id) {
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

// Toggle visibility of the Add Product Modal and instantly clear fields
function toggleFormModal() {
  const modal = document.getElementById("product-modal");

  // 1. Toggle the hidden utility class layout
  modal.classList.toggle("hidden");

  // 2. FORCE clear the input text strings every time the modal state shifts
  document.getElementById("product-form").reset();
}

// Intercept form submission and send a POST request with payload object
async function submitProductForm(event) {
  event.preventDefault(); // Stop native HTML page refreshing reload behavior

  // Gather values safely from the clean form input
  const payload = {
    sku: document.getElementById("form-sku").value.trim(),
    name: document.getElementById("form-name").value.trim(),
    price: parseFloat(document.getElementById("form-price").value),
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
    alert("Could not reach back-end servers to process record.");
  }
}
