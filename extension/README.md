# ⚡ CS-AI ASIN Hunter

A Chrome extension to extract ASINs from Amazon product pages and quickly look them up in CS-AI Command Center.

## Features

### 🎯 Floating Widget on Amazon Pages

When you're browsing Amazon, a sleek floating widget appears showing:

- **Current ASIN** - One-click copy to clipboard
- **Product Price** - Current listed price
- **Current Seller** - Buy Box winner
- **Quick Actions** - Dominator, Track Price, Monitor

### 📋 Popup Quick Access

Click the extension icon for:

- ASIN display from current page
- Product info summary
- Direct links to CS-AI tools

### 🖱️ Right-Click Context Menu

Select any 10-character ASIN on any webpage and right-click to:

- Look up ASIN in CS-AI
- Open in Buy Box Dominator
- Add to Price Tracker

## Installation

### Developer Mode (Recommended)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the `extension` folder from `/data/dev/td/cs-ai/extension`
5. The extension is now installed!

### Convert Icons to PNG (Optional)

Chrome requires PNG icons. Convert the SVG icons:

```bash
# If you have Inkscape:
inkscape icons/icon16.svg -w 16 -h 16 -o icons/icon16.png
inkscape icons/icon48.svg -w 48 -h 48 -o icons/icon48.png
inkscape icons/icon128.svg -w 128 -h 128 -o icons/icon128.png

# Or use ImageMagick:
convert icons/icon16.svg icons/icon16.png
convert icons/icon48.svg icons/icon48.png
convert icons/icon128.svg icons/icon128.png
```

## Configuration

1. Click the extension icon → ⚙️ Settings
2. Set your **CS-AI Command Center URL** (default: `http://localhost:3000`)
3. Save!

## Usage

### On Any Amazon Product Page

1. Navigate to any Amazon product page (e.g., `/dp/B08N5WRWNW`)
2. The **CS-AI widget** appears in the top-right corner
3. Click any action:
   - **⚡ Dominator** - Opens Buy Box Dominator with this ASIN
   - **💰 Track** - Adds to Price Tracker
   - **🏆 Monitor** - Opens Buy Box Monitor

### Using the Popup

1. Click the extension icon in Chrome toolbar
2. View current ASIN and product info
3. Click any quick action button

### Right-Click ASIN Lookup

1. Select any 10-character ASIN text on any webpage
2. Right-click → Choose CS-AI action
3. Opens CS-AI with that ASIN

## Supported Amazon Domains

- 🇺🇸 amazon.com
- 🇬🇧 amazon.co.uk
- 🇩🇪 amazon.de
- 🇨🇦 amazon.ca
- 🇫🇷 amazon.fr
- 🇮🇹 amazon.it
- 🇪🇸 amazon.es
- 🇯🇵 amazon.co.jp

## Widget Features

The floating widget is:

- **Draggable** - Move it anywhere on the page
- **Minimizable** - Click − to collapse
- **Non-intrusive** - Doesn't interfere with Amazon functionality

## Development

### File Structure

```
extension/
├── manifest.json          # Extension manifest (v3)
├── content/
│   ├── content.js         # Injected into Amazon pages
│   └── content.css        # Widget styles
├── popup/
│   ├── popup.html         # Extension popup
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── options/
│   ├── options.html       # Settings page
│   └── options.js         # Settings logic
├── background/
│   └── service-worker.js  # Background service worker
├── icons/
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md
```

### Permissions

- `activeTab` - Access current tab info
- `clipboardWrite` - Copy ASIN to clipboard
- `storage` - Save settings
- Host permissions for Amazon domains

---

**Team: Humans in the Loop**  
*Traject Data Hackathon 2025*
