// =========================
// API — replace with your deployed Apps Script URL
// =========================
const API_URL = "https://script.google.com/macros/s/AKfycbwJzaCmRwlJE3h3vscx-5ACPl-e5cCKcU1D-y5u3Vza3ptVXpP_fvgRZ5--xLCYM73F/exec";

// =========================
// TOAST
// =========================
function showToast(msg) {
  document.querySelectorAll(".toast").forEach(t => t.remove());
  const t = document.createElement("div");
  t.className = "toast";
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

// =========================
// HOME PAGE — load size cards
// =========================
async function loadHomePage() {
  const grid = document.getElementById("sizes-grid");
  if (!grid) return;

  // Skeletons while loading
  grid.innerHTML = [1,2,3,4].map(() => `
    <div class="size-card">
      <div class="skeleton" style="height:220px;"></div>
      <div style="padding:20px; display:flex; flex-direction:column; gap:10px;">
        <div class="skeleton" style="height:18px; width:50%; border-radius:6px;"></div>
        <div class="skeleton" style="height:13px; width:75%; border-radius:6px;"></div>
      </div>
    </div>
  `).join("");

  try {
    const res = await fetch(`${API_URL}?action=sizes`);
    const sizes = await res.json();

    grid.innerHTML = "";

    if (!sizes || sizes.length === 0) {
      grid.innerHTML = `<div class="empty-state">No sizes available right now 😔</div>`;
      return;
    }

    sizes.forEach(s => {
      const img = s.image || `https://picsum.photos/seed/size${s.id}/600/400`;
      grid.innerHTML += `
        <div class="size-card" onclick="goToDesigns(${s.id}, '${encodeURIComponent(s.size_label)}')">
          <div class="size-card-img-wrap">
            <img
              src="${img}"
              loading="lazy"
              alt="${s.size_label}"
              onerror="this.src='https://picsum.photos/seed/size${s.id}/600/400'"
            >
          </div>
          <div class="size-card-body">
            <div class="size-card-info">
              <h3>${s.size_label}</h3>
              <p>${s.description || "Tap to see designs"}</p>
            </div>
            <div class="size-card-arrow">→</div>
          </div>
        </div>
      `;
    });

  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Couldn't load sizes. Please try again.</div>`;
  }
}

// =========================
// GO TO DESIGNS PAGE
// =========================
function goToDesigns(sizeId, sizeLabel) {
  window.location.href = `designs.html?size_id=${sizeId}&size=${sizeLabel}`;
}

// =========================
// DESIGNS PAGE — load designs for chosen size
// =========================
async function loadDesignsPage() {
  const grid = document.getElementById("designs-grid");
  if (!grid) return;

  const params    = new URLSearchParams(window.location.search);
  const sizeId    = params.get("size_id");
  const sizeLabel = decodeURIComponent(params.get("size") || "");

  // Set page title & breadcrumb
  document.title = `${sizeLabel} Designs – Diam Frames`;
  const bcSize    = document.getElementById("bc-size");
  const pageTitle = document.getElementById("page-title");
  if (bcSize)    bcSize.innerText    = sizeLabel;
  if (pageTitle) pageTitle.innerText = `${sizeLabel} Designs`;

  // Skeletons
  grid.innerHTML = [1,2,3,4].map(() => `
    <div class="design-card">
      <div class="skeleton" style="height:200px; border-radius:0;"></div>
      <div style="padding:14px; display:flex; flex-direction:column; gap:8px;">
        <div class="skeleton" style="height:14px; width:65%; border-radius:6px;"></div>
        <div class="skeleton" style="height:14px; width:40%; border-radius:6px;"></div>
      </div>
    </div>
  `).join("");

  try {
    const res     = await fetch(`${API_URL}?action=designs&size_id=${sizeId}`);
    const designs = await res.json();

    grid.innerHTML = "";

    if (!designs || designs.length === 0) {
      grid.innerHTML = `<div class="empty-state">No designs available for this size yet 😔</div>`;
      return;
    }

    designs.forEach(d => {
      const img        = d.image || `https://picsum.photos/seed/d${d.id}/600/400`;
      const stockColor = d.stock <= 5 ? "#facc15" : "var(--muted)";
      const stockText  = d.stock <= 5 ? `Only ${d.stock} left!` : "In Stock";

      grid.innerHTML += `
        <div class="design-card" onclick="goToProduct(
          '${encodeURIComponent(d.design_name)}',
          '${encodeURIComponent(img)}',
          ${d.price},
          '${encodeURIComponent(sizeLabel)}',
          ${d.stock},
          ${sizeId}
        )">
          <div class="design-card-img-wrap">
            <img
              src="${img}"
              loading="lazy"
              alt="${d.design_name}"
              onerror="this.src='https://picsum.photos/seed/d${d.id}/600/400'"
            >
          </div>
          <div class="design-card-body">
            <p class="design-card-name">${d.design_name}</p>
            <p class="design-card-price">₹${d.price}</p>
            <p class="design-card-stock" style="color:${stockColor};">${stockText}</p>
          </div>
        </div>
      `;
    });

  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Couldn't load designs. Please try again.</div>`;
  }
}

// =========================
// GO TO FINAL PRODUCT PAGE
// =========================
function goToProduct(designName, img, price, sizeLabel, stock, sizeId) {
  const p = new URLSearchParams({
    design: designName,
    img,
    price,
    size:    sizeLabel,
    stock,
    size_id: sizeId
  });
  window.location.href = `product.html?${p.toString()}`;
}

// =========================
// FINAL PRODUCT PAGE — fill in details
// =========================
function loadProductPage() {
  const imgEl = document.getElementById("product-img");
  if (!imgEl) return;

  const params     = new URLSearchParams(window.location.search);
  const designName = decodeURIComponent(params.get("design") || "");
  const img        = decodeURIComponent(params.get("img")    || "");
  const price      = params.get("price")   || "";
  const sizeLabel  = decodeURIComponent(params.get("size")   || "");
  const stock      = parseInt(params.get("stock") || "0");
  const sizeId     = params.get("size_id") || "";

  document.title = `${designName} – Diam Frames`;

  document.getElementById("product-name").innerText  = designName;
  document.getElementById("product-price").innerText = `₹${price}`;
  document.getElementById("final-size").innerText    = sizeLabel;
  document.getElementById("bc-design").innerText     = designName;

  // Back link goes to designs page for this size
  const bcBack = document.getElementById("bc-back");
  if (bcBack) {
    bcBack.innerText = sizeLabel;
    bcBack.href = `designs.html?size_id=${sizeId}&size=${encodeURIComponent(sizeLabel)}`;
  }

  // Stock tag
  const stockTag = document.getElementById("stock-tag");
  if (stockTag) {
    if (stock <= 5) {
      stockTag.innerText = `Only ${stock} left!`;
      stockTag.style.color = "#facc15";
      stockTag.style.borderColor = "rgba(250,204,21,0.3)";
    } else {
      stockTag.innerText = "In Stock";
    }
  }

  // Image with skeleton fallback
  imgEl.style.background = "var(--surface2)";
  imgEl.onload  = () => imgEl.style.background = "none";
  imgEl.onerror = () => { imgEl.src = "https://picsum.photos/600/400"; };
  imgEl.src = img;

  // Store for order
  window.currentOrder = { designName, price, sizeLabel };
}

// =========================
// PLACE ORDER
// =========================
async function placeOrder() {
  const nameEl  = document.getElementById("name");
  const phoneEl = document.getElementById("phone");

  const name    = nameEl.value.trim();
  const phone   = phoneEl.value.trim();
  const address = document.getElementById("address")?.value.trim() || "";
  const city    = document.getElementById("city")?.value.trim()    || "";
  const pincode = document.getElementById("pincode")?.value.trim() || "";

  let valid = true;

  // Validate name
  const nameHint = document.getElementById("name-hint");
  if (!name) {
    nameEl.classList.add("error");
    nameHint.classList.add("show");
    valid = false;
  } else {
    nameEl.classList.remove("error");
    nameHint.classList.remove("show");
  }

  // Validate phone — exactly 10 digits
  const phoneHint = document.getElementById("phone-hint");
  if (!/^\d{10}$/.test(phone)) {
    phoneEl.classList.add("error");
    phoneHint.classList.add("show");
    valid = false;
  } else {
    phoneEl.classList.remove("error");
    phoneHint.classList.remove("show");
  }

  if (!valid) return;

  const { designName, price, sizeLabel } = window.currentOrder || {};
  const addrLine = [address, city, pincode].filter(Boolean).join(", ");

  // Save to Google Sheet (fire and forget)
  try {
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        name, phone,
        size:    sizeLabel,
        design:  designName,
        price,
        address: addrLine
      })
    });
  } catch (_) {}

  // WhatsApp message
  const msg =
`🖼️ *New Frame Order — Diam Frames*

👤 *Name:* ${name}
📞 *Phone:* ${phone}

🛍️ *Order:*
• Size: ${sizeLabel}
• Design: ${designName}
• Price: ₹${price}
${addrLine ? `\n📍 *Address:* ${addrLine}` : ""}`;

  window.location.href = `https://wa.me/919366518356?text=${encodeURIComponent(msg)}`;
}

// =========================
// ROUTE — run correct function per page
// =========================
const path = window.location.pathname;

if (path.includes("designs.html")) {
  loadDesignsPage();
} else if (path.includes("product.html")) {
  loadProductPage();
} else {
  loadHomePage();
}