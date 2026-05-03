// =========================
// API — replace with your deployed Apps Script URL
// =========================
const API_URL = "https://script.google.com/macros/s/AKfycbzTlShoK-zC9YQG5Bl3tcfbIkydMiMfNEpG7OLqK_yW9QQBXZkQndkwj05YkLjaunZamA/exec";

// =========================
// SECRET TOKEN
// Change this to any word/phrase you want — must match the one in Apps Script
// =========================
const SECRET = "diam104secret";

// =========================
// CACHE — stale-while-revalidate
// Data shows instantly from cache, then silently refreshes in background
// Cache expires after 10 minutes
// =========================
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in ms

async function fetchWithCache(url, cacheKey) {
  const now = Date.now();

  // Try to read from cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = now - timestamp;

      if (age < CACHE_TTL) {
        // Fresh cache — return immediately, no network call
        return data;
      } else {
        // Stale cache — return it immediately for fast display,
        // then fetch fresh data in background
        fetchAndCache(url, cacheKey);
        return data;
      }
    }
  } catch (_) {}

  // No cache — must fetch and wait
  return await fetchAndCache(url, cacheKey);
}

async function fetchAndCache(url, cacheKey) {
  const res  = await fetch(url);
  const data = await res.json();
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (_) {}
  return data;
}

// Call this after owner updates the sheet to clear old cache
function clearCache() {
  Object.keys(localStorage)
    .filter(k => k.startsWith("diam_"))
    .forEach(k => localStorage.removeItem(k));
}

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
    const sizes = await fetchWithCache(`${API_URL}?action=sizes&token=${SECRET}`, "diam_sizes");

    grid.innerHTML = "";

    if (!sizes || sizes.length === 0) {
      grid.innerHTML = `<div class="empty-state">No sizes available right now 😔</div>`;
      return;
    }

    sizes.forEach(s => {
      const imgHtml = s.image
        ? `<img src="${s.image}" loading="lazy" alt="${s.size_label}"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="img-placeholder" style="display:none;">🖼️<span>${s.size_label}</span></div>`
        : `<div class="img-placeholder">🖼️<span>${s.size_label}</span></div>`;

      grid.innerHTML += `
        <div class="size-card" onclick="goToDesigns(${s.id}, '${encodeURIComponent(s.size_label)}')">
          <div class="size-card-img-wrap">
            ${imgHtml}
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
    const designs = await fetchWithCache(`${API_URL}?action=designs&size_id=${sizeId}&token=${SECRET}`, `diam_designs_${sizeId}`);

    grid.innerHTML = "";

    if (!designs || designs.length === 0) {
      grid.innerHTML = `<div class="empty-state">No designs available for this size yet 😔</div>`;
      return;
    }

    designs.forEach(d => {
      const stockColor = d.stock <= 5 ? "#facc15" : "var(--muted)";
      const stockText  = d.stock <= 5 ? `Only ${d.stock} left!` : "In Stock";
      const imgHtml    = d.image
        ? `<img src="${d.image}" loading="lazy" alt="${d.design_name}"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="img-placeholder" style="display:none;">🖼️<span>${d.design_name}</span></div>`
        : `<div class="img-placeholder">🖼️<span>${d.design_name}</span></div>`;

      // encode image URL for passing to product page
      const imgParam = d.image ? encodeURIComponent(d.image) : "";

      grid.innerHTML += `
        <div class="design-card" onclick="goToProduct(
          '${encodeURIComponent(d.design_name)}',
          '${imgParam}',
          ${d.price},
          '${encodeURIComponent(sizeLabel)}',
          ${d.stock},
          ${sizeId}
        )">
          <div class="design-card-img-wrap" style="position:relative; height:200px; background:var(--surface2); overflow:hidden;">
            ${imgHtml}
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
  imgEl.onload  = () => imgEl.style.background = "none";
  imgEl.onerror = () => {
    imgEl.style.display = "none";
    const wrap = imgEl.parentElement;
    wrap.style.background = "var(--surface2)";
    wrap.style.minHeight = "300px";
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.justifyContent = "center";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "10px";
    wrap.style.color = "var(--muted)";
    wrap.innerHTML = `<span style="font-size:3rem;">🖼️</span><span style="font-size:0.8rem;">${designName}</span>`;
  };
  if (img) {
    imgEl.src = img;
  } else {
    imgEl.dispatchEvent(new Event("error"));
  }

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
        token: SECRET,
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
`🖼 *NEW ORDER — DIAM FRAMES*
―――――――――――――――――
*Name:* ${name}
*Phone:* ${phone}
―――――――――――――――――
*Size:* ${sizeLabel}
*Design:* ${designName}
*Price:* ₹${price}
―――――――――――――――――${addrLine ? `\n*Address:* ${addrLine}\n―――――――――――――――――` : ""}`;

  window.location.href = `https://wa.me/919366349344?text=${encodeURIComponent(msg)}`;
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