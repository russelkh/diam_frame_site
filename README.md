# 🖼️ Diam Frames — Project README

A lightweight, mobile-friendly frame shop catalogue website. Customers browse frame sizes, choose a design, and place orders directly via WhatsApp. Stock and products are managed entirely from a Google Spreadsheet.

---

## 📁 File Structure

```
diam_frame_site/
├── index.html              ← Home page (size cards)
├── designs.html            ← Designs page (for chosen size)
├── product.html            ← Final order page
├── style.css               ← All styles for all pages
├── script.js               ← All JavaScript logic
├── google_apps_script.js   ← Paste this into Google Apps Script
└── daim logo.PNG           ← Your logo file
```

---

## 🔁 Customer Flow

```
Home Page (choose size)
    ↓
Designs Page (choose design)
    ↓
Product Page (fill name + phone → order via WhatsApp)
```

---

## 🛠️ Tech Stack

| Thing | What it is |
|---|---|
| HTML / CSS / JS | Vanilla — no frameworks |
| Google Sheets | Database for sizes, designs, orders |
| Google Apps Script | Backend API (GET sizes/designs, POST orders) |
| WhatsApp API | `wa.me` link for order messages |
| localStorage | Client-side caching (10 min TTL) |

---

## 🔤 Fonts (Google Fonts)

| Font | Usage | Weights |
|---|---|---|
| **Playfair Display** | Headings, card titles, product names | 600, 700, 700 italic |
| **DM Sans** | Body text, buttons, labels, form fields | 300, 400, 500, 600, 700 |

CDN link used:
```
https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap
```

---

## 🎨 Icons (Lucide Icons)

Loaded via CDN:
```
https://unpkg.com/lucide@latest
```

Initialized at bottom of `index.html`:
```html
<script>lucide.createIcons();</script>
```

Icons used in the **How It Works** section:

| Icon Name | Card |
|---|---|
| `ruler` | Pick Size |
| `paintbrush` | Choose Design |
| `message-circle` | Order via WhatsApp |
| `package` | Delivered |

Usage in HTML:
```html
<i data-lucide="ruler"></i>
```

---

## 🎨 Color Palette (CSS Variables)

| Variable | Value | Usage |
|---|---|---|
| `--gold` | `#C8A96B` | Primary accent, buttons, prices |
| `--gold-light` | `#e5c98b` | Hover states, description text |
| `--bg` | `#0e0f13` | Page background |
| `--surface` | `#17181e` | Cards, navbar |
| `--surface2` | `#1f2028` | Inputs, nested backgrounds |
| `--border` | `rgba(255,255,255,0.06)` | Card borders |
| `--text` | `#E8E9EF` | Main text |
| `--muted` | `rgba(232,233,239,0.5)` | Secondary text, labels |
| `--radius` | `14px` | Border radius for cards |

---

## 🗄️ Google Spreadsheet Structure

Spreadsheet name: **Diam Frames DB**

### Sheet 1 — `Sizes`
| Column | Name | Example |
|---|---|---|
| A | id | 1 |
| B | size_label | A4 |
| C | image | *(Google Drive image URL)* |
| D | description | Ideal for desk & tabletop |
| E | active | TRUE |

### Sheet 2 — `Designs`
| Column | Name | Example |
|---|---|---|
| A | id | 1 |
| B | size_id | 1 |
| C | design_name | Classic Black |
| D | image | *(Google Drive image URL)* |
| E | price | 499 |
| F | stock | 20 |
| G | active | TRUE |

### Sheet 3 — `Orders` *(auto-filled, never touch)*
| Column | Name |
|---|---|
| A | timestamp |
| B | name |
| C | phone |
| D | size |
| E | design |
| F | price |
| G | address |
| H | date |

---

## ⚙️ Google Apps Script API

Endpoints (all GET):

| URL | Returns |
|---|---|
| `?action=sizes` | All active sizes |
| `?action=designs&size_id=1` | All active designs for size ID 1 |

POST to same URL saves an order to the Orders sheet.

---

## 🗃️ Caching

Data is cached in `localStorage` with a **10 minute TTL** using a stale-while-revalidate strategy:

- **Fresh cache** → returns instantly, no network call
- **Stale cache** → returns old data instantly, fetches fresh in background
- **No cache** → fetches from API and saves to cache

Cache keys:
- `diam_sizes` — sizes list
- `diam_designs_1`, `diam_designs_2` etc. — designs per size

To clear cache manually (e.g. after owner updates sheet):
```js
// Open browser console and run:
clearCache()
```

---

## 📋 Order Form (Product Page)

| Field | Required | Validation |
|---|---|---|
| Full Name | ✅ Yes | Cannot be empty |
| Mobile Number | ✅ Yes | Must be exactly 10 digits |
| Address | ❌ Optional | — |
| City | ❌ Optional | — |
| Pincode | ❌ Optional | — |

---

## 📱 Responsive Layout

| Breakpoint | Layout |
|---|---|
| Desktop (> 768px) | Size cards → horizontal scroll row |
| Mobile (≤ 768px) | Size cards → 2-column vertical grid |
| Very small (≤ 360px) | Size cards → 1-column vertical grid |

---

## 🖼️ Images

- **Hero background** — `https://picsum.photos/seed/diamframes/1600/900?grayscale` (permanent, same image every load)
- **Size & Design cards** — owner adds Google Drive image URLs to the spreadsheet
- **Fallback** — if no image URL is set, a grey placeholder box with a 🖼️ icon shows

---

## 📲 WhatsApp Order

Orders are sent to the owner's WhatsApp number. To change the number, find this line in `script.js`:

```js
window.location.href = `https://wa.me/91XXXXXXXXXX?text=...`
```

Replace `91XXXXXXXXXX` with `91` + owner's 10-digit number.

---

## 🔧 How Owner Manages Stock

| Action | How |
|---|---|
| Add a new size | New row in Sizes sheet, `active = TRUE` |
| Hide a size | Set `active = FALSE` in Sizes sheet |
| Add a new design | New row in Designs sheet with correct `size_id` |
| Remove a design | Set `active = FALSE` or `stock = 0` |
| View orders | Check Orders sheet — fills automatically |

No code changes ever needed for day-to-day management. Everything is driven by the spreadsheet.

---

## 🚀 Deployment Checklist

- [ ] Paste `google_apps_script.js` into Google Apps Script
- [ ] Deploy as Web App (Execute as: Me, Access: Anyone)
- [ ] Copy the Web App URL into `script.js` line 4 (`API_URL`)
- [ ] Update WhatsApp number in `script.js`
- [ ] Update contact number in footer of all HTML files
- [ ] Add your logo as `daim logo.PNG`
- [ ] Add size images and design images in the spreadsheet
- [ ] Upload all files to your hosting (GitHub Pages, Netlify etc.)
