// 1. Fetch categories from backend and build the smart grid layout
export async function fetchCategories() {
  try {
    const response = await fetch("/api/categories");
    if (!response.ok) throw new Error("Failed to fetch categories catalog.");
    const categories = await response.json();

    const tableBody = document.getElementById("categories-table-body");
    if (!tableBody) return;
    tableBody.innerHTML = ""; // Clear placeholders

    if (categories.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-500">No categories found.</td></tr>`;
      return;
    }

    categories.forEach((cat) => {
      // Create main entry container row
      const mainRow = document.createElement("tr");
      mainRow.className =
        "border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer";

      // Let clicking the row toggle the nested products drawer
      mainRow.onclick = (e) => {
        // Prevent click events on buttons from triggering the drawer toggle
        if (e.target.tagName !== "BUTTON") {
          toggleProductsDrawer(cat.id);
        }
      };

      // Name Cell
      const nameCell = document.createElement("td");
      nameCell.className = "p-4 font-bold text-gray-900";

      const container = document.createElement("div");
      container.className = "flex items-center space-x-2";

      const prefixLabel = document.createElement("span");
      prefixLabel.className =
        "text-xs font-semibold tracking-wider text-gray-400 uppercase select-none mr-1";

      const nameText = document.createElement("span");
      nameText.className = "text-gray-900 font-bold";
      nameText.textContent = cat.name;

      container.appendChild(prefixLabel);
      container.appendChild(nameText);
      nameCell.appendChild(container);

      // Description Cell
      const descCell = document.createElement("td");
      descCell.className = "p-4 text-sm text-gray-500 max-w-xs truncate";
      descCell.textContent = cat.description || "No description provided.";

      // Count / Badge Cell
      const countCell = document.createElement("td");
      countCell.className = "p-4 text-sm font-medium";
      const hasProducts = cat.product_count > 0;
      countCell.innerHTML = `
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                  hasProducts
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : "bg-gray-100 text-gray-400"
                }">
                    ${cat.product_count} ${cat.product_count === 1 ? "item" : "items"} linked
                </span>
            `;

      // Actions Cell
      const actionCell = document.createElement("td");
      actionCell.className = "p-4 text-center space-x-2";

      const editBtn = document.createElement("button");
      editBtn.className =
        "bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded trantition text-sm";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => openCategoryEditModal(cat);

      const deleteBtn = document.createElement("button");
      deleteBtn.className =
        "bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1 rounded transition text-sm";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteCategory(cat.id, cat.product_count);

      actionCell.appendChild(editBtn);
      actionCell.appendChild(deleteBtn);

      mainRow.appendChild(nameCell);
      mainRow.appendChild(descCell);
      mainRow.appendChild(countCell);
      mainRow.appendChild(actionCell);

      tableBody.appendChild(mainRow);

      // Create HIdden Drawer Row for showing nested linked items
      const drawerRow = document.createElement("tr");
      drawerRow.id = `drawer-${cat.id}`;
      drawerRow.className = "hidden bg-gray-50 border-b border-gray-100";

      const drawerCell = document.createElement("td");
      drawerCell.colSpan = 4;
      drawerCell.className = "p-4 pl-12 bg-gray-50/50";

      if (cat.products && cat.products.length > 0) {
        const listContainer = document.createElement("div");
        listContainer.className =
          "space-y-2 border-l-2 border-gray-200 pl-4 py-1";

        cat.products.forEach((p) => {
          const item = document.createElement("div");
          item.className =
            "text-sm text-gray-600 flex justify-between max-w-xl items-center py-1";

          const leftSide = document.createElement("div");
          leftSide.className = "flex items-center";

          const skuBadge = document.createElement("span");
          skuBadge.className =
            "font-mono text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-semibold mr-2 select-none";
          skuBadge.textContent = p.sku;

          const productName = document.createElement("span");
          productName.className = "font-medium text-gray-800";
          productName.textContent = p.name;

          leftSide.appendChild(skuBadge);
          leftSide.appendChild(productName);

          const priceTag = document.createElement("span");
          priceTag.className = "text-emeral-600 font-medium";
          priceTag.textContent = `$${parseFloat(p.price).toFixed(2)}`;

          item.appendChild(leftSide);
          item.appendChild(priceTag);

          listContainer.appendChild(item);
        });
        drawerCell.appendChild(listContainer);
      } else {
        drawerCell.innerHTML = `<p class="text-xs italic text-gray-400">No active stock catalog profiles currently registered under this grouping block.</p>`;
      }

      drawerRow.appendChild(drawerCell);
      tableBody.appendChild(drawerRow);
    });
  } catch (error) {
    console.error("Error executing categories list view draw pipeline:", error);
  }
}

function toggleProductsDrawer(categoryId) {
  const drawer = document.getElementById(`drawer-${categoryId}`);
  if (drawer) drawer.classList.toggle("hidden");
}

export async function deleteCategory(id, productCount) {
  if (productCount > 0) {
    alert(
      `Deletion Blocked!\n\nYou cannot remove this category because it currently has ${productCount} products assigned to it. Move those products to another category first.`,
    );
    return;
  }

  if (
    confirm(
      "Are you sure you want to permanently erase this inventory category profile?",
    )
  ) {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchCategories();
      } else {
        alert("Failed to erase category configuration profile.");
      }
    } catch (error) {
      console.error("Network communication fault eliminating resource:", error);
    }
  }
}

export function toggleCategoryFormModal() {
  alert("Add category modal layout");
}
export function openCategoryEditModal(cat) {
  alert(`Edit workflow requested for: ${cat.name}`);
}

window.toggleCategoryFormModal = toggleCategoryFormModal;
