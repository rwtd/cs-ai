# 🚀 CS-AI Command Center

## Team: **Humans in the Loop** 🤝

**Hackathon:** Traject Data Customer Support AI Tools  
**Date:** December 2025

### Team Members

- **Richie Waugh**
- **Nova Recla**
- **Bhushan Dasari**

---

## 📖 Overview

The CS-AI Command Center is a modular dashboard framework for building customer support tools powered by Traject Data APIs:

- **🔍 SerpWow API** - Google Search, AI Overview, Trends, Maps, Shopping
- **🌧️ Rainforest API** - Amazon Products, Reviews, Pricing, Buy Box, Sellers

---

## 🏃 Quick Start

```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Use a local server (recommended)
python3 -m http.server 8080
# Then open http://localhost:8080
```

---

## 📁 Project Structure

```
cs-ai/
├── index.html          # Main application shell
├── styles.css          # Complete design system
├── app.js              # Core application logic
├── components/         # Plug-and-play tools
│   └── serp-search.js  # Example: SERP Search component
├── COMPONENT_SPEC.md   # Component development guide
└── README.md           # This file
```

---

## 🧩 Building Components

See [COMPONENT_SPEC.md](./COMPONENT_SPEC.md) for the complete guide.

### Quick Example

```javascript
// components/my-tool.js
ComponentRegistry.register('my-tool', {
    render: () => `
        <div class="page-header">
            <h1>🔧 My Custom Tool</h1>
        </div>
        <div class="card">
            <div class="card-header"><h3>Tool Content</h3></div>
            <div style="padding: 24px;">
                <!-- Your content here -->
            </div>
        </div>
    `,
    init: () => {
        console.log('Tool initialized!');
    }
});
```

Then add to `index.html`:

```html
<script src="components/my-tool.js"></script>
```

---

## 🎨 Design Theme

The dashboard uses an **ethereal purple** theme with glassmorphism:

- **Hero Gradient:** `#667eea → #764ba2 → #f093fb`
- **Background:** Deep space purple `#0A0E27`
- **Glass Effect:** Blur + semi-transparent purple

---

## 🔌 API Integration

### SerpWow API

```javascript
// In your component
const response = await fetch(
    `https://api.serpwow.com/search?api_key=${API_KEY}&q=${query}`
);
```

### Rainforest API

```javascript
// In your component
const response = await fetch(
    `https://api.rainforestapi.com/request?api_key=${API_KEY}&type=product&asin=${asin}`
);
```

---

## 📋 Available Page Slots

| ID | Icon | Description |
|----|------|-------------|
| `serp-search` | 🌐 | SERP lookup |
| `ai-overview` | 🤖 | AI Overview |
| `product-lookup` | 📦 | Amazon products |
| `reviews` | ⭐ | Review analysis |
| `pricing` | 💰 | Price tracking |
| `buybox` | 🏆 | Buy Box monitor |
| `sellers` | 🏪 | Seller intel |

---

## 🛠️ Tech Stack

- **HTML5** + **CSS3** (Custom properties, Grid, Flexbox)
- **Vanilla JavaScript** (No frameworks!)
- **Google Fonts** (Inter)

---

## 📄 License

Traject Data Hackathon 2025 - Internal Use

---

**Built with 💜 by Humans in the Loop**
