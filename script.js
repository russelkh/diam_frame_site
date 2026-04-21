// CHANGE IMAGE
function changeImage(el) {
  document.getElementById("main-img").src = el.src.replace("100", "500");
}

// ADD TO CART
function addToCart() {
  let product = {
    name: "Black Walnut A4 Frame",
    price: 999,
    qty: parseInt(document.getElementById("qty").value)
  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Added to cart!");
}

// BUY NOW
function buyNow() {
  addToCart();
  window.location.href = "cart.html";
}

// LOAD CART
if (document.getElementById("cart-items")) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;
  const container = document.getElementById("cart-items");

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

  total += 50; // delivery
  document.getElementById("total").innerText = total;
}

// UPDATE QTY
function updateQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart"));

  cart[index].qty += change;
  if (cart[index].qty < 1) cart[index].qty = 1;

  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload();
}

// PLACE ORDER
function placeOrder() {
  let name = document.getElementById("name").value;
  let phone = document.getElementById("phone").value;
  let address = document.getElementById("address").value;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let products = cart.map(p => `${p.name} x ${p.qty}`).join(", ");

  let msg = `New Frame Order\nCustomer: ${name}\nPhone: ${phone}\nProducts: ${products}\nAddress: ${address}`;

  window.location.href = `https://wa.me/919366349344?text=${encodeURIComponent(msg)}`;
  // SCROLL TO PRODUCTS
function scrollToProducts() {
  document.getElementById("products").scrollIntoView({
    behavior: "smooth"
  });
}

// HERO FADE ON SCROLL
window.addEventListener("scroll", () => {
  const hero = document.getElementById("hero");
  let scroll = window.scrollY;

  if (scroll > 50) {
    hero.classList.add("fade");
  } else {
    hero.classList.remove("fade");
  }
});
}