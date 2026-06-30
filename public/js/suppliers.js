// Fetch suppliers and map out the data registry securely
export async function fetchSuppliers() {
  try {
    const response = await fetch("/api/suppliers");
    if (!response.ok) throw new Error("Failed to retrieve suppliers registry.");
    const suppliers = await response.json();

    const tableBody = document.getElementById("suppliers-table-body");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (suppliers.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500">No suppliers onboarded yet.</td></tr>`;
      return;
    }

    suppliers.forEach((sup) => {
      // Main Data Entry Row Container
      const mainRow = document.createElement("tr");
      mainRow.className =
        "border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer";
      mainRow.onclick = (e) => {
        if (e.target.tagName !== "BUTTON") toggleSuppliersDrawer(sup.id);
      };

      // Supplier Identity (Company Name)
      const nameCell = document.createElement("td");
      nameCell.className = "p-4 font-bold text-gray-900";
      nameCell.textContent = sup.name;

      // Communications Channels (Email / Phone)
      const commsCell = document.createElement("td");
      commsCell.className = "p-4 text-sm text-gray-500 space-y-0.5";

      const emailDiv = document.createElement("div");
      emailDiv.className = "text-gray-600 truncate max-w-xs font-medium";
      emailDiv.textContent = sup.contact_email || "No email registered";

      const phoneDiv = document.createElement("div");
      phoneDiv.className = "text-xs text-gray-400";
      phoneDiv.textContent = sup.phone || "No phone registered";

      commsCell.appendChild(emailDiv);
      commsCell.appendChild(phoneDiv);

      // Volume Counters (Items Count Badge)
      const countCell = document.createElement("td");
      countCell.className = "p-4 text-sm";
      const hasProducts = sup.product_count > 0;
      countCell.innerHTML = `
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                  hasProducts
                    ? "bg-purple-50 text-purple-600 border border-purple-100"
                    : "bg-gray-100 text-gray-400"
                }">
                    ${sup.product_count} catalog ${sup.product_count === 1 ? "line" : "lines"}
                </span>
            `;

      // Operational Actions Menu
      const actionCell = document.createElement("td");
      actionCell.className = "p-4 text-center space-x-2";

      const editBtn = document.createElement("button");
      editBtn.className =
        "bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded transition text-sm";
      editBtn.textContent = "Edit";
      editBtn.onclick = () =>
        alert(`Edit setup initiated for vendor reference: ${sup.name}`);

      const deleteBtn = document.createElement("button");
      deleteBtn.className =
        "bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1 rounded transition text-sm";
      deleteBtn.textContent = "Remove";
      deleteBtn.onclick = () =>
        alert("Deletion guard checking routing protocols...");

      actionCell.appendChild(editBtn);
      actionCell.appendChild(deleteBtn);

      mainRow.appendChild(nameCell);
      mainRow.appendChild(commsCell);
      mainRow.appendChild(countCell);
      mainRow.appendChild(actionCell);

      tableBody.appendChild(mainRow);

      // Expandable Items Sub-Drawer
      const drawerRow = document.createElement("tr");
      drawerRow.id = `sup-drawer-${sup.id}`;
      drawerRow.className = "hidden bg-gray-50 border-b border-gray-100";

      const drawerCell = document.createElement("td");
      drawerCell.colSpan = 5;
      drawerCell.className = "p-4 pl-12 bg-gray-50/50";

      const listContainer = document.createElement("div");
      listContainer.className =
        "space-y-2 border-l-2 border-purple-200 pl-4 py-1";

      if (sup.products && sup.products.length > 0) {
        sup.products.forEach((p) => {
          const itemRow = document.createElement("div");
          itemRow.className =
            "text-sm text-gray-600 flex justify-between max-w-xl items-center py-0.5";

          const leftSide = document.createElement("div");
          leftSide.className = "flex items-center";

          const skuBadge = document.createElement("span");
          skuBadge.className =
            "font-mono text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-semibold mr-2";
          skuBadge.textContent = p.sku;

          const prodName = document.createElement("span");
          prodName.className = "font-medium text-gray-800";
          prodName.textContent = p.name;

          leftSide.appendChild(skuBadge);
          leftSide.appendChild(prodName);

          const qtyTag = document.createElement("span");
          qtyTag.className =
            "text-gray-500 text-xs font-semibold bg-white border px-2 py-0.5 rounded shadow-sm";
          qtyTag.textContent = `Stock Qty: ${p.quantity}`;

          itemRow.appendChild(leftSide);
          itemRow.appendChild(qtyTag);
          listContainer.appendChild(itemRow);
        });
      } else {
        const structuralAlert = document.createElement("p");
        structuralAlert.className = "text-xs italic text-gray-400";
        structuralAlert.textContent =
          "No stock catalog entries currently registered under this fulfillment source profile.";
        listContainer.appendChild(structuralAlert);
      }

      drawerCell.appendChild(listContainer);
      drawerRow.appendChild(drawerCell);
      tableBody.appendChild(drawerRow);
    });
  } catch (error) {
    console.error(
      "Error drawing suppliers interface frame grid matrix:",
      error,
    );
  }
}

function toggleSuppliersDrawer(supplierId) {
  const drawer = document.getElementById(`sup-drawer-${supplierId}`);
  if (drawer) drawer.classList.toggle("hidden");
}
