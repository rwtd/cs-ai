# 🚀 CS-AI Hackathon - Quick Start Guide

## Team: Humans in the Loop

**Richie Waugh** • **Nova Recla** • **Bhushan Dasari**

---

## 🔐 Credentials

| What | Value |
|------|-------|
| **Live Site** | <https://cs-ai.waugh.cloud> |
| **Login** | Your first name (lowercase) |
| **Password** | `C5-@I-hackathon` |
| **GitHub Repo** | <https://github.com/rwtd/cs-ai> |

---

## ⚡ 5-Minute Setup

### 1. Clone the repo

```bash
git clone https://github.com/rwtd/cs-ai.git
cd cs-ai
```

### 2. Switch to your branch

**Nova:**

```bash
git checkout nova/components
```

**Bhushan:**

```bash
git checkout bhushan/components
```

### 3. Install & run locally

```bash
npm install
npm start
```

Open <http://localhost:3000> and login with your name + password.

---

## 🛠️ Building Your Component

### Step 1: Create your file

```bash
# Example for Nova
touch components/product-lookup.js
```

### Step 2: Use this template

```javascript
/**
 * [Your Tool Name]
 * Author: [Your Name]
 */
ComponentRegistry.register('product-lookup', {
    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>📦 Product Lookup</h1>
                <p class="page-subtitle">Amazon product data via Rainforest API</p>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Search Product</h3>
            </div>
            <div style="padding: 24px;">
                <input type="text" id="asinInput" placeholder="Enter ASIN (e.g., B08N5WRWNW)" 
                       style="width: 100%; padding: 12px; background: rgba(139,92,246,0.1); 
                              border: 1px solid rgba(167,139,250,0.3); border-radius: 8px; 
                              color: white; font-size: 1rem;">
                <button id="lookupBtn" class="btn btn-primary" style="margin-top: 16px;">
                    🔍 Lookup Product
                </button>
                <div id="results" style="margin-top: 24px;"></div>
            </div>
        </div>
    `,
    
    init: () => {
        document.getElementById('lookupBtn')?.addEventListener('click', async () => {
            const asin = document.getElementById('asinInput').value;
            const resultsDiv = document.getElementById('results');
            
            if (!asin) {
                resultsDiv.innerHTML = '<p style="color: var(--accent-red);">Please enter an ASIN</p>';
                return;
            }
            
            resultsDiv.innerHTML = '<p>Loading...</p>';
            
            try {
                const response = await fetch(`/api/rainforest/product?asin=${asin}`);
                const data = await response.json();
                
                if (data.error) {
                    resultsDiv.innerHTML = `<p style="color: var(--accent-amber);">${data.error}</p>`;
                } else {
                    // Display your results here!
                    resultsDiv.innerHTML = `<pre style="color: var(--text-secondary); overflow: auto;">${JSON.stringify(data, null, 2)}</pre>`;
                }
            } catch (err) {
                resultsDiv.innerHTML = `<p style="color: var(--accent-red);">Error: ${err.message}</p>`;
            }
        });
    }
});
```

### Step 3: Add to index.html

Add this line before `</body>`:

```html
<script src="components/product-lookup.js"></script>
```

### Step 4: Test locally

Refresh your browser - your component should appear in the sidebar!

---

## 📡 Available API Endpoints

### SerpWow (Google Search)

```javascript
// Search Google
fetch('/api/serpwow/search?q=best+headphones&num=10')
```

### Rainforest (Amazon)

```javascript
// Product details
fetch('/api/rainforest/product?asin=B08N5WRWNW')

// Reviews
fetch('/api/rainforest/reviews?asin=B08N5WRWNW')

// Offers/Buy Box
fetch('/api/rainforest/offers?asin=B08N5WRWNW')
```

---

## 🎨 Styling Cheat Sheet

Use these CSS variables for consistent styling:

```css
--text-primary: #ffffff      /* White text */
--text-secondary: #c8d1e0    /* Gray text */
--accent-purple: #8b5cf6     /* Purple accent */
--accent-green: #10b981      /* Success green */
--accent-red: #ef4444        /* Error red */
--accent-amber: #f59e0b      /* Warning amber */
```

Use these classes:

- `.card` - Glass card container
- `.btn .btn-primary` - Purple gradient button
- `.btn .btn-secondary` - Subtle button

---

## 📤 Committing Your Work

```bash
# Add your changes
git add .

# Commit with a message
git commit -m "✨ Add product lookup component"

# Push to your branch
git push origin nova/components   # or bhushan/components
```

Then create a **Pull Request** on GitHub to merge into `main`.

---

## 🚀 Component Ideas

| Tool | API | Description |
|------|-----|-------------|
| Product Lookup | Rainforest | Enter ASIN → Get product details |
| Reviews Analyzer | Rainforest | Show review sentiment/stats |
| Price Tracker | Rainforest | Show price history |
| Buy Box Monitor | Rainforest | Who has the buy box? |
| SERP Checker | SerpWow | Check Google rankings |
| AI Overview | SerpWow | Show Google AI answers |

---

## 📚 Full Docs

- **Component Spec**: `COMPONENT_SPEC.md` (detailed templates)
- **SerpWow API**: <https://serpwow.com/docs>
- **Rainforest API**: <https://rainforestapi.com/docs>

---

## 💬 Need Help?

Ask Richie or check the existing `components/serp-search.js` for a working example!

**Let's build something awesome! 🎉**
