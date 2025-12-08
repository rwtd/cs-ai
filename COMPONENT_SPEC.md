# 🧩 Component Specification Guide

## Team: **Humans in the Loop**
**Hackathon:** Traject Data Customer Support AI Tools  
**Authors:** Richie Waugh • Nova Recla • Bhushan Dasari

---

## 📋 Overview

This guide enables team members to create **plug-and-play components** that integrate seamlessly with the CS-AI Command Center dashboard. Use your favorite vibe coding tools (Cursor, Claude, Copilot, etc.) to generate components following this spec.

---

## 🏗️ Component Architecture

### Component Structure

Each component must implement this interface:

```javascript
{
    id: string,           // Unique identifier (e.g., 'serp-search')
    render: () => string, // Returns HTML string
    init: () => void,     // Called after render (optional)
    destroy: () => void   // Cleanup function (optional)
}
```

### Registration

```javascript
ComponentRegistry.register('your-component-id', {
    render: () => `<div>Your HTML here</div>`,
    init: () => { /* Setup event listeners, fetch data, etc. */ }
});
```

---

## 🎨 Design Tokens

### CSS Variables (use these!)

```css
/* Backgrounds */
--bg-primary: #0A0E27;
--bg-secondary: #0f1433;
--bg-tertiary: #151a3d;
--glass-bg: rgba(99, 102, 241, 0.1);
--glass-border: rgba(167, 139, 250, 0.2);

/* Text */
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--text-muted: #64748b;

/* Accents */
--accent-purple: #8b5cf6;
--accent-blue: #3b82f6;
--accent-pink: #ec4899;
--accent-green: #10b981;
--accent-amber: #f59e0b;
--accent-red: #ef4444;

/* Gradients */
--gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
--gradient-purple: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Spacing */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
```

---

## 📦 Component Templates

### Template 1: Basic Tool Page

```javascript
ComponentRegistry.register('my-tool', {
    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>🔧 My Tool Name</h1>
                <p class="page-subtitle">Tool description here</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-primary" id="myToolAction">
                    <span>⚡</span> Action Button
                </button>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>📊 Tool Content</h3>
            </div>
            <div class="card-body" style="padding: 24px;">
                <!-- Your content here -->
            </div>
        </div>
    `,
    init: () => {
        document.getElementById('myToolAction')?.addEventListener('click', () => {
            window.app.showToast('🎉 Action triggered!');
        });
    }
});
```

### Template 2: API Lookup Tool (SerpWow/Rainforest)

```javascript
ComponentRegistry.register('product-lookup', {
    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>📦 Amazon Product Lookup</h1>
                <p class="page-subtitle">Search products using Rainforest API</p>
            </div>
        </div>
        
        <div class="card" style="max-width: 800px;">
            <div class="card-header">
                <h3>🔍 Enter ASIN or Search Query</h3>
            </div>
            <div style="padding: 24px;">
                <div class="input-group">
                    <input type="text" id="asinInput" class="tool-input" 
                           placeholder="Enter ASIN (e.g., B08XYZ123)">
                    <button class="btn btn-primary" id="lookupBtn">
                        <span>🔍</span> Lookup
                    </button>
                </div>
                <div id="resultArea" class="result-container"></div>
            </div>
        </div>
    `,
    init: () => {
        const btn = document.getElementById('lookupBtn');
        const input = document.getElementById('asinInput');
        const resultArea = document.getElementById('resultArea');
        
        btn?.addEventListener('click', async () => {
            const asin = input.value.trim();
            if (!asin) {
                window.app.showToast('⚠️ Please enter an ASIN');
                return;
            }
            
            resultArea.innerHTML = '<div class="loading">🔄 Loading...</div>';
            
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/rainforest/product?asin=${asin}`);
            // const data = await response.json();
            
            // Mock response for demo
            setTimeout(() => {
                resultArea.innerHTML = `
                    <div class="result-card">
                        <h4>Product Found!</h4>
                        <p><strong>ASIN:</strong> ${asin}</p>
                        <p><strong>Status:</strong> ✅ Active</p>
                        <p class="text-muted">Connect to Rainforest API for real data</p>
                    </div>
                `;
            }, 1000);
        });
    }
});
```

### Template 3: Data Display Card

```javascript
ComponentRegistry.register('reviews', {
    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>⭐ Reviews Analysis</h1>
                <p class="page-subtitle">Analyze Amazon product reviews</p>
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card gradient-purple">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                    <span class="stat-value">4.2</span>
                    <span class="stat-label">Avg Rating</span>
                </div>
            </div>
            <div class="stat-card gradient-blue">
                <div class="stat-icon">📝</div>
                <div class="stat-content">
                    <span class="stat-value">1,247</span>
                    <span class="stat-label">Total Reviews</span>
                </div>
            </div>
            <div class="stat-card gradient-pink">
                <div class="stat-icon">😊</div>
                <div class="stat-content">
                    <span class="stat-value">78%</span>
                    <span class="stat-label">Positive</span>
                </div>
            </div>
            <div class="stat-card gradient-amber">
                <div class="stat-icon">⚠️</div>
                <div class="stat-content">
                    <span class="stat-value">12</span>
                    <span class="stat-label">Needs Attention</span>
                </div>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="card" style="grid-column: span 12;">
                <div class="card-header">
                    <h3>📋 Recent Reviews</h3>
                </div>
                <div id="reviewsList" style="padding: 20px;"></div>
            </div>
        </div>
    `,
    init: () => {
        // Populate reviews list
        const reviewsList = document.getElementById('reviewsList');
        const mockReviews = [
            { rating: 5, text: 'Great product! Exactly as described.', date: '2 hours ago' },
            { rating: 4, text: 'Good quality, fast shipping.', date: '5 hours ago' },
            { rating: 2, text: 'Product arrived damaged.', date: '1 day ago' }
        ];
        
        reviewsList.innerHTML = mockReviews.map(r => `
            <div class="ticket-item priority-${r.rating >= 4 ? 'low' : r.rating >= 3 ? 'medium' : 'high'}">
                <div class="ticket-priority"></div>
                <div class="ticket-content">
                    <span class="ticket-id">${'⭐'.repeat(r.rating)}</span>
                    <span class="ticket-title">${r.text}</span>
                    <span class="ticket-meta">${r.date}</span>
                </div>
            </div>
        `).join('');
    }
});
```

---

## 🔌 API Integration Patterns

### SerpWow API Call

```javascript
async function serpwowSearch(query) {
    const API_KEY = 'YOUR_SERPWOW_API_KEY'; // Store in config
    const response = await fetch(
        `https://api.serpwow.com/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&engine=google`
    );
    return response.json();
}
```

### Rainforest API Call

```javascript
async function rainforestProduct(asin) {
    const API_KEY = 'YOUR_RAINFOREST_API_KEY'; // Store in config
    const response = await fetch(
        `https://api.rainforestapi.com/request?api_key=${API_KEY}&type=product&asin=${asin}&amazon_domain=amazon.com`
    );
    return response.json();
}
```

---

## 🎯 Available Page Slots

Register your component to these page IDs:

| Page ID | Icon | Description |
|---------|------|-------------|
| `serp-search` | 🌐 | Google SERP lookup tool |
| `ai-overview` | 🤖 | Google AI Overview analysis |
| `trends` | 📰 | Google Trends & News |
| `maps` | 📍 | Maps & Local business lookup |
| `product-lookup` | 📦 | Amazon product lookup |
| `reviews` | ⭐ | Reviews analysis tool |
| `pricing` | 💰 | Price tracking tool |
| `buybox` | 🏆 | Buy Box monitoring |
| `sellers` | 🏪 | Seller intelligence |
| `tickets` | 🎫 | Ticket management |
| `analytics` | 📈 | Analytics dashboard |

---

## 📝 Vibe Coding Prompts

Copy these prompts into Cursor/Claude/Copilot:

### For SerpWow Tool:
```
Create a component for CS-AI Command Center that:
- Searches Google using SerpWow API
- Shows search results in a card layout
- Use CSS variables: --bg-primary, --glass-bg, --accent-purple, --text-primary
- Follow the ComponentRegistry.register() pattern
- Include loading states and error handling
```

### For Rainforest Tool:
```
Create a component for CS-AI Command Center that:
- Looks up Amazon products by ASIN using Rainforest API
- Displays product details (title, price, rating, reviews)
- Shows Buy Box status
- Use the glassmorphism card style
- Include a stat-card grid for key metrics
```

### For Data Visualization:
```
Create a component for CS-AI Command Center that:
- Displays API usage charts
- Uses the gradient color scheme: #667eea, #764ba2, #f093fb
- Includes animated stat cards
- Shows real-time updates with pulse animation
```

---

## ✅ Component Checklist

Before submitting your component:

- [ ] Uses CSS variables (not hardcoded colors)
- [ ] Implements `render()` function returning HTML string
- [ ] Implements `init()` for event binding
- [ ] Shows loading states during API calls
- [ ] Handles errors gracefully with toast messages
- [ ] Works on mobile (responsive)
- [ ] Uses existing CSS classes (`.card`, `.btn`, `.stat-card`)
- [ ] Registered with `ComponentRegistry.register()`

---

## 🚀 Quick Start

1. Create a new file: `components/my-component.js`
2. Copy a template from above
3. Modify for your use case
4. Add `<script src="components/my-component.js"></script>` to `index.html`
5. Navigate to your page in the sidebar!

---

**Let's build amazing CS tools together! 🎉**

*Team Humans in the Loop - Traject Data Hackathon 2025*
