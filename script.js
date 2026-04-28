// =========================
// API
// =========================
const API_URL = "https://script.google.com/macros/s/AKfycbwVq3c-V2QVyN7vE6KdoQsNyD3kXR5ixjg_5lqdnR3K49lZFfzEHaiiboODrcZ549G8GQ/exec";

// =========================
// LOAD PRODUCTS (HOME PAGE)
// =========================
async function loadProducts() {
  const container = document.getElementById("product-list");
  const emptyText = document.getElementById("no-products");

  if (!container) return;

  // Show skeleton cards while loading
  container.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    container.innerHTML += `
      <div class="card">
        <div class="skeleton" style="width:100%;height:180px;border-radius:10px;"></div>
        <div class="skeleton" style="width:70%;height:16px;margin:10px 0 6px;border-radius:6px;"></div>
        <div class="skeleton" style="width:40%;height:14px;border-radius:6px;"></div>
      </div>
    `;
  }

  try {
    const res = await fetch(API_URL);
    const products = await res.json();

    container.innerHTML = "";

    if (products.length === 0) {
      if (emptyText) emptyText.style.display = "block";
      return;
    }

    products.forEach(p => {
      let img = p.image || "https://picsum.photos/300";

      container.innerHTML += `
        <div class="card" onclick="goToProduct(${p.id})">
          <img src="${img}" loading="lazy" onerror="this.src='https://picsum.photos/300'" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>₹${p.price}</p>
        </div>
      `;
    });

  } catch (err) {
    container.innerHTML = "";
    if (emptyText) {
      emptyText.innerText = "Couldn't load products. Please try again.";
      emptyText.style.display = "block";
    }
  }
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

  const imgEl = document.getElementById("product-img");

  // Skeleton on image while loading
  if (imgEl) imgEl.classList.add("loading");

  try {
    const res = await fetch(API_URL);
    const products = await res.json();

    const product = products.find(p => p.id == id);
    if (!product) return;

    let img = product.image || "https://picsum.photos/300";

    document.getElementById("product-name").innerText = product.name;
    document.getElementById("product-price").innerText = "₹" + product.price;

    // Load image — remove skeleton once loaded
    imgEl.onload = () => imgEl.classList.remove("loading");
    imgEl.onerror = () => {
      imgEl.src = "https://picsum.photos/300";
      imgEl.classList.remove("loading");
    };
    imgEl.src = img;

    // Stock badge
    const badge = document.getElementById("stock-badge");
    if (badge) {
      if (product.stock > 10) {
        badge.innerHTML = `<span class="stock-badge in-stock">✓ In Stock</span>`;
      } else if (product.stock > 0) {
        badge.innerHTML = `<span class="stock-badge low-stock">⚠ Only ${product.stock} left!</span>`;
      } else {
        badge.innerHTML = `<span class="stock-badge out-of-stock">✕ Out of Stock</span>`;
      }
    }

    // Set max quantity to available stock
    const qtyInput = document.getElementById("qty");
    if (qtyInput) {
      qtyInput.max = product.stock;
      if (product.stock === 0) {
        qtyInput.disabled = true;
        document.querySelector(".btn").disabled = true;
        document.querySelector(".btn-outline").disabled = true;
        document.querySelector(".btn").style.opacity = "0.5";
        document.querySelector(".btn-outline").style.opacity = "0.5";
      }
    }

    // Clamp qty if user types beyond stock
    if (qtyInput) {
      qtyInput.addEventListener("input", () => {
        let val = parseInt(qtyInput.value);
        if (val > product.stock) {
          qtyInput.value = product.stock;
          showToast(`Only ${product.stock} in stock`);
        }
        if (val < 1 || isNaN(val)) qtyInput.value = 1;
      });
    }

    window.currentProduct = product;

  } catch (err) {
    if (imgEl) imgEl.classList.remove("loading");
    showToast("Couldn't load product.");
  }
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
  const qtyInput = document.getElementById("qty");
  const qty = parseInt(qtyInput.value);

  if (!window.currentProduct) return;

  // Enforce stock limit
  if (qty > window.currentProduct.stock) {
    showToast(`Only ${window.currentProduct.stock} in stock!`);
    qtyInput.value = window.currentProduct.stock;
    return;
  }

  if (qty < 1) {
    showToast("Quantity must be at least 1");
    return;
  }

  let product = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: currentProduct.price,
    stock: currentProduct.stock,
    qty
  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let existing = cart.find(p => p.id === product.id);

  if (existing) {
    let newQty = existing.qty + qty;
    if (newQty > product.stock) {
      showToast(`Can't add more. Only ${product.stock} in stock!`);
      existing.qty = product.stock;
    } else {
      existing.qty = newQty;
    }
  } else {
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showToast("Added to cart ✓");
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
    container.innerHTML = `<p style="opacity:0.6; padding: 10px 0;">Your cart is empty.</p>`;
    document.getElementById("total").innerText = 0;
    return;
  }

  cart.forEach((item, index) => {
    total += item.price * item.qty;

    container.innerHTML += `
      <div class="cart-item">
        <div>
          <p style="font-weight:600;">${item.name}</p>
          <p style="color:#C8A96B;">₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</p>
        </div>
        <div style="display:flex; align-items:center; gap:4px;">
          <button class="qty-btn" onclick="updateQty(${index}, -1)">−</button>
          <span style="min-width:24px; text-align:center;">${item.qty}</span>
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
// UPDATE QTY — removes item if goes below 1
// =========================
function updateQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart"));

  cart[index].qty += change;

  if (cart[index].qty < 1) {
    // Remove item from cart
    let removedName = cart[index].name;
    cart.splice(index, 1);
    showToast(`${removedName} removed`);
  } else {
    // Enforce stock limit on + press
    let item = cart[index];
    if (item.stock && item.qty > item.stock) {
      item.qty = item.stock;
      showToast(`Only ${item.stock} in stock!`);
    }
  }

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
  let name = document.getElementById("name").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let address = document.getElementById("address").value.trim();
  let city = document.getElementById("city").value.trim();
  let pincode = document.getElementById("pincode").value.trim();

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!name || !phone || !address || !city || !pincode) {
    showToast("Please fill all details");
    return;
  }

  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }

  let itemsText = cart.map(p => `${p.name} (Qty: ${p.qty})`).join(", ");
  let total = cart.reduce((sum, p) => sum + p.price * p.qty, 0) + 50;

  // Send to Google Sheet
  try {
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
  } catch (e) {
    // Still proceed to WhatsApp even if sheet fails
  }

  // WhatsApp message
  let msg =
`🖼️ *New Frame Order*
👤 Name: ${name}
📞 Phone: ${phone}

🛒 *Order:*
${cart.map(p => `• ${p.name} × ${p.qty} = ₹${p.price * p.qty}`).join("\n")}

🚚 Delivery: ₹50
💰 *Total: ₹${total}*

📍 *Address:*
${address}, ${city} - ${pincode}`;

  // Clear cart after order
  localStorage.removeItem("cart");
  updateCartCount();

  window.location.href = `https://wa.me/919366349344?text=${encodeURIComponent(msg)}`;
}

// =========================
// SCROLL TO PRODUCTS
// =========================
function scrollToProducts() {
  const el = document.getElementById("products");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

// =========================
// TOAST
// =========================
function showToast(msg) {
  // Remove existing toasts
  document.querySelectorAll(".toast").forEach(t => t.remove());

  let toast = document.createElement("div");
  toast.innerText = msg;
  toast.className = "toast";
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2500);
}

// =========================
// AUTO SCROLL (mobile only)
// =========================
function autoScrollProducts() {
  const row = document.querySelector(".scroll-row");
  if (!row) return;

  // Only run on desktop (mobile uses grid)
  if (window.innerWidth <= 768) return;

  let speed = 0.3;
  let isPaused = false;

  function scroll() {
    if (!isPaused) {
      row.scrollLeft += speed;
      if (row.scrollLeft >= row.scrollWidth - row.clientWidth) {
        row.scrollLeft = 0;
      }
    }
    requestAnimationFrame(scroll);
  }

  row.addEventListener("mouseenter", () => isPaused = true);
  row.addEventListener("mouseleave", () => isPaused = false);
  row.addEventListener("touchstart", () => isPaused = true);
  row.addEventListener("touchend", () => isPaused = false);

  scroll();
}

autoScrollProducts();