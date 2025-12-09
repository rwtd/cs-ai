/**
 * CS-AI ASIN Hunter - Content Script
 * Runs on Amazon product pages to extract ASINs and provide quick actions
 */

class ASINHunter {
    constructor() {
        this.asin = null;
        this.productInfo = null;
        this.csAiUrl = 'http://localhost:3000'; // Default, can be configured
        this.init();
    }

    async init() {
        // Load settings
        await this.loadSettings();

        // Extract ASIN
        this.asin = this.extractASIN();

        if (this.asin) {
            // Extract product info
            this.productInfo = this.extractProductInfo();

            // Create floating widget
            this.createWidget();

            console.log('🎯 CS-AI ASIN Hunter: Found ASIN', this.asin);
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['csAiUrl']);
            if (result.csAiUrl) {
                this.csAiUrl = result.csAiUrl;
            }
        } catch (e) {
            console.log('Using default CS-AI URL');
        }
    }

    extractASIN() {
        // Method 1: From URL path (/dp/ASIN or /gp/product/ASIN)
        const urlPatterns = [
            /\/dp\/([A-Z0-9]{10})/i,
            /\/gp\/product\/([A-Z0-9]{10})/i,
            /\/product\/([A-Z0-9]{10})/i,
            /\/ASIN\/([A-Z0-9]{10})/i
        ];

        for (const pattern of urlPatterns) {
            const match = window.location.href.match(pattern);
            if (match) return match[1].toUpperCase();
        }

        // Method 2: From page data attributes
        const asinElement = document.querySelector('[data-asin]');
        if (asinElement && asinElement.dataset.asin) {
            return asinElement.dataset.asin.toUpperCase();
        }

        // Method 3: From hidden input
        const asinInput = document.querySelector('input[name="ASIN"]');
        if (asinInput) {
            return asinInput.value.toUpperCase();
        }

        // Method 4: From product details table
        const detailsTable = document.getElementById('productDetails_detailBullets_sections1');
        if (detailsTable) {
            const rows = detailsTable.querySelectorAll('tr');
            for (const row of rows) {
                if (row.textContent.includes('ASIN')) {
                    const asinMatch = row.textContent.match(/[A-Z0-9]{10}/i);
                    if (asinMatch) return asinMatch[0].toUpperCase();
                }
            }
        }

        // Method 5: From canonical link
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            const match = canonical.href.match(/\/dp\/([A-Z0-9]{10})/i);
            if (match) return match[1].toUpperCase();
        }

        return null;
    }

    extractProductInfo() {
        const info = {
            asin: this.asin,
            title: '',
            price: '',
            rating: '',
            reviewCount: '',
            seller: '',
            image: '',
            marketplace: this.getMarketplace()
        };

        // Title
        const titleEl = document.getElementById('productTitle') ||
            document.querySelector('h1.a-size-large');
        if (titleEl) {
            info.title = titleEl.textContent.trim();
        }

        // Price
        const priceEl = document.querySelector('.a-price .a-offscreen') ||
            document.getElementById('priceblock_ourprice') ||
            document.getElementById('priceblock_dealprice') ||
            document.querySelector('[data-a-color="price"] .a-offscreen');
        if (priceEl) {
            info.price = priceEl.textContent.trim();
        }

        // Rating
        const ratingEl = document.querySelector('.a-icon-star .a-icon-alt') ||
            document.querySelector('[data-hook="rating-out-of-text"]');
        if (ratingEl) {
            info.rating = ratingEl.textContent.trim();
        }

        // Review count
        const reviewEl = document.getElementById('acrCustomerReviewText') ||
            document.querySelector('[data-hook="total-review-count"]');
        if (reviewEl) {
            info.reviewCount = reviewEl.textContent.trim();
        }

        // Seller (Buy Box winner)
        const sellerEl = document.getElementById('sellerProfileTriggerId') ||
            document.getElementById('merchant-info') ||
            document.querySelector('#tabular-buybox .tabular-buybox-text a');
        if (sellerEl) {
            info.seller = sellerEl.textContent.trim();
        }

        // Main image
        const imageEl = document.getElementById('landingImage') ||
            document.getElementById('imgBlkFront') ||
            document.querySelector('#main-image-container img');
        if (imageEl) {
            info.image = imageEl.src;
        }

        return info;
    }

    getMarketplace() {
        const hostname = window.location.hostname;
        if (hostname.includes('amazon.com')) return 'amazon.com';
        if (hostname.includes('amazon.co.uk')) return 'amazon.co.uk';
        if (hostname.includes('amazon.de')) return 'amazon.de';
        if (hostname.includes('amazon.ca')) return 'amazon.ca';
        if (hostname.includes('amazon.fr')) return 'amazon.fr';
        if (hostname.includes('amazon.it')) return 'amazon.it';
        if (hostname.includes('amazon.es')) return 'amazon.es';
        if (hostname.includes('amazon.co.jp')) return 'amazon.co.jp';
        return 'amazon.com';
    }

    createWidget() {
        // Remove existing widget if any
        const existing = document.getElementById('csai-asin-hunter');
        if (existing) existing.remove();

        const widget = document.createElement('div');
        widget.id = 'csai-asin-hunter';
        widget.innerHTML = `
            <div class="csai-widget-header">
                <span class="csai-logo">⚡</span>
                <span class="csai-title">CS-AI</span>
                <button class="csai-minimize" id="csai-minimize">−</button>
            </div>
            <div class="csai-widget-body" id="csai-body">
                <div class="csai-asin-display">
                    <span class="csai-label">ASIN</span>
                    <span class="csai-asin" id="csai-asin">${this.asin}</span>
                    <button class="csai-copy" id="csai-copy" title="Copy ASIN">📋</button>
                </div>
                ${this.productInfo.price ? `
                <div class="csai-info-row">
                    <span class="csai-label">Price</span>
                    <span class="csai-value">${this.productInfo.price}</span>
                </div>
                ` : ''}
                ${this.productInfo.seller ? `
                <div class="csai-info-row">
                    <span class="csai-label">Seller</span>
                    <span class="csai-value csai-seller">${this.productInfo.seller.substring(0, 20)}${this.productInfo.seller.length > 20 ? '...' : ''}</span>
                </div>
                ` : ''}
                <div class="csai-actions">
                    <button class="csai-btn csai-btn-primary" id="csai-dominator" title="Open in Buy Box Dominator">
                        ⚡ Dominator
                    </button>
                    <button class="csai-btn" id="csai-price-tracker" title="Add to Price Tracker">
                        💰 Track
                    </button>
                    <button class="csai-btn" id="csai-buybox" title="Open in Buy Box Monitor">
                        🏆 Monitor
                    </button>
                </div>
                <div class="csai-quick-actions">
                    <button class="csai-quick-btn" id="csai-lookup" title="Product Lookup">📦</button>
                    <button class="csai-quick-btn" id="csai-reviews" title="Reviews Analysis">⭐</button>
                    <button class="csai-quick-btn" id="csai-sellers" title="Seller Intel">🏪</button>
                    <button class="csai-quick-btn" id="csai-settings" title="Settings">⚙️</button>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
        this.bindEvents(widget);
    }

    bindEvents(widget) {
        // Minimize/expand
        const minimizeBtn = widget.querySelector('#csai-minimize');
        const body = widget.querySelector('#csai-body');
        let isMinimized = false;

        minimizeBtn.addEventListener('click', () => {
            isMinimized = !isMinimized;
            body.style.display = isMinimized ? 'none' : 'block';
            minimizeBtn.textContent = isMinimized ? '+' : '−';
            widget.classList.toggle('minimized', isMinimized);
        });

        // Copy ASIN
        widget.querySelector('#csai-copy').addEventListener('click', () => {
            this.copyToClipboard(this.asin);
            this.showToast('ASIN copied!');
        });

        // Dominator
        widget.querySelector('#csai-dominator').addEventListener('click', () => {
            this.openCSAI('buybox-dominator', this.asin);
        });

        // Price Tracker
        widget.querySelector('#csai-price-tracker').addEventListener('click', () => {
            this.openCSAI('pricing', this.asin);
        });

        // Buy Box Monitor
        widget.querySelector('#csai-buybox').addEventListener('click', () => {
            this.openCSAI('buybox', this.asin);
        });

        // Quick actions
        widget.querySelector('#csai-lookup').addEventListener('click', () => {
            this.openCSAI('product-lookup', this.asin);
        });

        widget.querySelector('#csai-reviews').addEventListener('click', () => {
            this.openCSAI('reviews', this.asin);
        });

        widget.querySelector('#csai-sellers').addEventListener('click', () => {
            this.openCSAI('sellers', this.asin);
        });

        widget.querySelector('#csai-settings').addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'openOptions' });
        });

        // Make draggable
        this.makeDraggable(widget);
    }

    makeDraggable(widget) {
        const header = widget.querySelector('.csai-widget-header');
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('csai-minimize')) return;
            isDragging = true;
            offsetX = e.clientX - widget.offsetLeft;
            offsetY = e.clientY - widget.offsetTop;
            widget.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            widget.style.left = (e.clientX - offsetX) + 'px';
            widget.style.top = (e.clientY - offsetY) + 'px';
            widget.style.right = 'auto';
            widget.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            widget.style.transition = '';
        });
    }

    openCSAI(page, asin) {
        const marketplace = this.productInfo.marketplace;
        const url = `${this.csAiUrl}/#${page}?asin=${asin}&marketplace=${marketplace}`;

        // Store the ASIN for the page to pick up
        localStorage.setItem('csai-pending-asin', JSON.stringify({
            asin: asin,
            marketplace: marketplace,
            page: page,
            productInfo: this.productInfo,
            timestamp: Date.now()
        }));

        window.open(url, '_blank');
        this.showToast(`Opening ${page}...`);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
        });
    }

    showToast(message) {
        const existing = document.querySelector('.csai-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'csai-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ASINHunter());
} else {
    new ASINHunter();
}
