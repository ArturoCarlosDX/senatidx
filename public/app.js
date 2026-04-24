// Matrix Background Effect
const initializeMatrixBackground = () => {
  const matrixPattern = document.getElementById("matrix-pattern");
  if (!matrixPattern) return;
  
  const japaneseChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴァィゥェォャュョッ";
  const allChars = japaneseChars + "0123456789";
  const columnCount = Math.ceil(window.innerWidth / 30);

  for (let i = 0; i < columnCount; i++) {
    const column = document.createElement("div");
    column.className = "matrix-column";
    column.style.left = (i * 30) + "px";
    column.style.animationDuration = (4 + Math.random() * 4) + "s";
    column.style.animationDelay = -(Math.random() * 6) + "s";
    
    // Create repeated characters for continuous fall effect
    let text = "";
    for (let j = 0; j < 30; j++) {
      text += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    column.textContent = text;
    matrixPattern.appendChild(column);
  }
};

// Initialize Matrix on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeMatrixBackground);
} else {
  initializeMatrixBackground();
}

// Re-initialize on window resize
window.addEventListener("resize", () => {
  const matrixPattern = document.getElementById("matrix-pattern");
  if (matrixPattern) {
    matrixPattern.innerHTML = "";
    initializeMatrixBackground();
  }
});

let form;
let nameInput;
let priceInput;
let stockInput;
let tableBody;
let cancelEditButton;

let currentEditId = null;

// Initialize DOM elements when document is ready
const initializeDOMElements = () => {
  form = document.getElementById("product-form");
  nameInput = document.getElementById("name");
  priceInput = document.getElementById("price");
  stockInput = document.getElementById("stock");
  tableBody = document.getElementById("products-table-body");
  cancelEditButton = document.getElementById("cancel-edit");
  
  // Fetch products on load
  fetchProducts();
  
  // Setup event listeners
  form.addEventListener("submit", handleFormSubmit);
  cancelEditButton.addEventListener("click", resetForm);
  tableBody.addEventListener("click", handleTableClick);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDOMElements);
} else {
  initializeDOMElements();
}

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

const handleFormSubmit = async (event) => {
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
};

const handleTableClick = async (event) => {
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
};
