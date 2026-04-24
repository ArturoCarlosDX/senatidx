const form = document.getElementById("product-form");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const stockInput = document.getElementById("stock");
const tableBody = document.getElementById("products-table-body");
const cancelEditButton = document.getElementById("cancel-edit");

let currentEditId = null;

const fetchProducts = async () => {
  const response = await fetch("/api/products");
  const products = await response.json();
  renderProducts(products);
};

const renderProducts = (products) => {
  tableBody.innerHTML = "";
  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${Number(product.price).toFixed(2)}</td>
      <td>${product.stock}</td>
      <td>
        <div class="actions-row">
          <button class="btn btn-warning" data-action="edit" data-id="${product.id}">Editar</button>
          <button class="btn btn-danger" data-action="delete" data-id="${product.id}">Eliminar</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
};

const resetForm = () => {
  currentEditId = null;
  form.reset();
  cancelEditButton.classList.add("hidden");
};

const fillFormForEdit = (product) => {
  currentEditId = product.id;
  nameInput.value = product.name;
  priceInput.value = product.price;
  stockInput.value = product.stock;
  cancelEditButton.classList.remove("hidden");
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const productData = {
    name: nameInput.value.trim(),
    price: Number(priceInput.value),
    stock: Number(stockInput.value),
  };

  if (
    !productData.name ||
    isNaN(productData.price) ||
    isNaN(productData.stock)
  ) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  try {
    if (currentEditId) {
      await fetch(`/api/products/${currentEditId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
    }
    resetForm();
    await fetchProducts();
  } catch (error) {
    alert("Ocurrió un error al guardar el producto.");
  }
});

cancelEditButton.addEventListener("click", () => {
  resetForm();
});

tableBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === "edit") {
    const response = await fetch("/api/products");
    const products = await response.json();
    const product = products.find((item) => item.id === Number(id));
    if (product) fillFormForEdit(product);
  }

  if (action === "delete") {
    const confirmed = confirm("¿Eliminar este producto?");
    if (!confirmed) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await fetchProducts();
  }
});

fetchProducts();
