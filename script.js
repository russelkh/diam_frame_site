// =========================
// PRODUCT PAGE LOAD
// =========================
if (window.location.pathname.includes("product.html")) {
  const params = new URLSearchParams(window.location.search);

  document.getElementById("product-name").innerText = params.get("name");
  document.getElementById("product-price").innerText = "₹" + params.get("price");
  document.getElementById("product-img").src = params.get("img");
}

// =========================
// NAVIGATION
// =========================
function goToProduct(name, price, img) {
  window.location.href =
    `product.html?name=${encodeURIComponent(name)}&price=${price}&img=${encodeURIComponent(img)}`;
}

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
  const params = new URLSearchParams(window.location.search);

  let product = {
    name: params.get("name"),
    price: parseInt(params.get("price")),
    qty: parseInt(document.getElementById("qty").value)
  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let existing = cart.find(p => p.name === product.name);

  if (existing) {
    existing.qty += product.qty;
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
// RENDER CART (🔥 KEY FUNCTION)
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

// run on load
renderCart();

// =========================
// UPDATE QTY (NO RELOAD 🔥)
// =========================
function updateQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart"));

  cart[index].qty += change;
  if (cart[index].qty < 1) cart[index].qty = 1;

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();        // smooth update
  updateCartCount();   // update navbar
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
// PLACE ORDER (WHATSAPP)
// =========================
function placeOrder() {
  let name = document.getElementById("name").value;
  let phone = document.getElementById("phone").value;
  let address = document.getElementById("address").value;
  let city = document.getElementById("city").value;
  let pincode = document.getElementById("pincode").value;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  let products = cart.map(p =>
    `${p.name} (Qty: ${p.qty}) - ₹${p.price * p.qty}`
  ).join("%0A");

  let total = cart.reduce((sum, p) => sum + p.price * p.qty, 0) + 50;

  let msg =
`🖼️ New Frame Order
Name: ${name}
Phone: ${phone}

Order:
${products}

Total: ₹${total}

Address:
${address}, ${city} - ${pincode}`;

  window.location.href = `https://wa.me/919366349344?text=${msg}`;
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
// TOAST (nice UX 🔥)
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