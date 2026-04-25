// =========================
// API
// =========================
const API_URL = "https://script.google.com/macros/s/AKfycbwVq3c-V2QVyN7vE6KdoQsNyD3kXR5ixjg_5lqdnR3K49lZFfzEHaiiboODrcZ549G8GQ/exec";

// =========================
// LOAD PRODUCTS (HOME PAGE)
// =========================
async function loadProducts() {
  const res = await fetch(API_URL);
  const products = await res.json();

  console.log("Products:", products);

  const container = document.getElementById("product-list");
  const emptyText = document.getElementById("no-products");

  if (!container) return;

  container.innerHTML = "";

  if (products.length === 0) {
    emptyText.style.display = "block";
    return;
  }

  products.forEach(p => {
    let img = p.image || "https://picsum.photos/300";

    container.innerHTML += `
      <div class="card" onclick="goToProduct(${p.id})">
        <img src="${img}">
        <h3>${p.name}</h3>
        <p>₹${p.price}</p>
      </div>
    `;
  });
}

loadProducts();

// =========================
// GO TO PRODUCT PAGE
// =========================
function goToProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

// =========================
// LOAD PRODUCT PAGE
// =========================
async function loadProductPage() {
  if (!window.location.pathname.includes("product.html")) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const res = await fetch(API_URL);
  const products = await res.json();

  const product = products.find(p => p.id == id);

  if (!product) return;

  let img = product.image || "https://picsum.photos/300";

  document.getElementById("product-name").innerText = product.name;
  document.getElementById("product-price").innerText = "₹" + product.price;
  document.getElementById("product-img").src = img;

  window.currentProduct = product;
}

loadProductPage();

// =========================
// CART COUNT
// =========================
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let count = cart.reduce((sum, item) => sum + item.qty, 0);

  let badge = document.querySelector(".cart-count");
  if (badge) badge.innerText = count;
}

updateCartCount();

// =========================
// ADD TO CART
// =========================
function addToCart() {
  const qty = parseInt(document.getElementById("qty").value);

  let product = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: currentProduct.price,
    qty
  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let existing = cart.find(p => p.id === product.id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  showToast("Added to cart");
}

// =========================
// BUY NOW
// =========================
function buyNow() {
  addToCart();
  window.location.href = "cart.html";
}

// =========================
// RENDER CART
// =========================
function renderCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let container = document.getElementById("cart-items");
  let total = 0;

  if (!container) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    document.getElementById("total").innerText = 0;
    return;
  }

  cart.forEach((item, index) => {
    total += item.price * item.qty;

    container.innerHTML += `
      <div class="cart-item">
        <div>
          <p>${item.name}</p>
          <p>₹${item.price}</p>
        </div>

        <div>
          <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
          ${item.qty}
          <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
        </div>
      </div>
    `;
  });

  total += 50;
  document.getElementById("total").innerText = total;
}

renderCart();

// =========================
// UPDATE QTY
// =========================
function updateQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart"));

  cart[index].qty += change;
  if (cart[index].qty < 1) cart[index].qty = 1;

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();
  updateCartCount();
}

// =========================
// CLEAR CART
// =========================
function clearCart() {
  localStorage.removeItem("cart");
  renderCart();
  updateCartCount();
}

// =========================
// PLACE ORDER (SHEET + WHATSAPP)
// =========================
async function placeOrder() {
  let name = document.getElementById("name").value;
  let phone = document.getElementById("phone").value;
  let address = document.getElementById("address").value;
  let city = document.getElementById("city").value;
  let pincode = document.getElementById("pincode").value;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!name || !phone || cart.length === 0) {
    showToast("Fill all details");
    return;
  }

  let itemsText = cart.map(p =>
    `${p.name} (Qty: ${p.qty})`
  ).join(", ");

  let total = cart.reduce((sum, p) => sum + p.price * p.qty, 0) + 50;

  // SEND TO GOOGLE SHEET
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      name,
      phone,
      address: `${address}, ${city} - ${pincode}`,
      items: itemsText,
      total
    })
  });

  // WHATSAPP
  let msg =
`🖼️ New Frame Order
Name: ${name}
Phone: ${phone}

Order:
${itemsText}

Total: ₹${total}

Address:
${address}, ${city} - ${pincode}`;

  window.location.href =
    `https://wa.me/919366349344?text=${encodeURIComponent(msg)}`;
}

// =========================
// SCROLL
// =========================
function scrollToProducts() {
  document.getElementById("products").scrollIntoView({
    behavior: "smooth"
  });
}

// =========================
// TOAST
// =========================
function showToast(msg) {
  let toast = document.createElement("div");
  toast.innerText = msg;
  toast.className = "toast";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// =========================
// SMOOTH AUTO SCROLL (FIXED)
// =========================
function autoScrollProducts() {
  const row = document.querySelector(".scroll-row");
  if (!row) return;

  let speed = 0.3;
  let isPaused = false;

  function scroll() {
    if (window.innerWidth <= 768 && !isPaused) {
      row.scrollLeft += speed;

      if (row.scrollLeft >= row.scrollWidth - row.clientWidth) {
        row.scrollLeft = 0;
      }
    }

    requestAnimationFrame(scroll);
  }

  row.addEventListener("touchstart", () => isPaused = true);
  row.addEventListener("touchend", () => isPaused = false);

  scroll();
}

autoScrollProducts();