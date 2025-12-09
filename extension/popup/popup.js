/**
 * CS-AI ASIN Hunter - Popup Script
 */

class PopupController {
    constructor() {
        this.csAiUrl = 'http://localhost:3000';
        this.currentAsin = null;
        this.productInfo = null;
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.getCurrentTabInfo();
        this.bindEvents();
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

    async getCurrentTabInfo() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab || !this.isAmazonUrl(tab.url)) {
                this.showNoAsin();
                return;
            }

            // Try to get ASIN from content script
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'getASIN' });
                if (response && response.asin) {
                    this.currentAsin = response.asin;
                    this.productInfo = response.productInfo;
                    this.showAsin();
                    return;
                }
            } catch (e) {
                // Content script not loaded, try URL extraction
            }

            // Fallback: Extract ASIN from URL
            const asin = this.extractAsinFromUrl(tab.url);
            if (asin) {
                this.currentAsin = asin;
                this.productInfo = { asin, marketplace: this.getMarketplace(tab.url) };
                this.showAsin();
            } else {
                this.showNoAsin();
            }
        } catch (e) {
            console.error('Error getting tab info:', e);
            this.showNoAsin();
        }
    }

    isAmazonUrl(url) {
        return url && url.includes('amazon.');
    }

    extractAsinFromUrl(url) {
        const patterns = [
            /\/dp\/([A-Z0-9]{10})/i,
            /\/gp\/product\/([A-Z0-9]{10})/i,
            /\/product\/([A-Z0-9]{10})/i,
            /\/ASIN\/([A-Z0-9]{10})/i
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1].toUpperCase();
        }
        return null;
    }

    getMarketplace(url) {
        if (url.includes('amazon.com')) return 'amazon.com';
        if (url.includes('amazon.co.uk')) return 'amazon.co.uk';
        if (url.includes('amazon.de')) return 'amazon.de';
        if (url.includes('amazon.ca')) return 'amazon.ca';
        if (url.includes('amazon.fr')) return 'amazon.fr';
        if (url.includes('amazon.it')) return 'amazon.it';
        if (url.includes('amazon.es')) return 'amazon.es';
        if (url.includes('amazon.co.jp')) return 'amazon.co.jp';
        return 'amazon.com';
    }

    showAsin() {
        document.getElementById('asin-value').textContent = this.currentAsin;
        document.getElementById('asin-section').classList.remove('hidden');
        document.getElementById('no-asin').classList.add('hidden');

        if (this.productInfo) {
            const infoSection = document.getElementById('product-info');

            if (this.productInfo.title) {
                document.getElementById('product-title').textContent =
                    this.productInfo.title.substring(0, 40) + (this.productInfo.title.length > 40 ? '...' : '');
            }
            if (this.productInfo.price) {
                document.getElementById('product-price').textContent = this.productInfo.price;
            }
            if (this.productInfo.seller) {
                document.getElementById('product-seller').textContent = this.productInfo.seller;
            }
            if (this.productInfo.marketplace) {
                document.getElementById('product-marketplace').textContent = this.productInfo.marketplace;
            }

            if (this.productInfo.title || this.productInfo.price || this.productInfo.seller) {
                infoSection.classList.remove('hidden');
            }
        }
    }

    showNoAsin() {
        document.getElementById('asin-section').classList.add('hidden');
        document.getElementById('no-asin').classList.remove('hidden');
        document.getElementById('product-info').classList.add('hidden');
    }

    bindEvents() {
        // Copy ASIN
        document.getElementById('copy-asin').addEventListener('click', () => {
            if (this.currentAsin) {
                navigator.clipboard.writeText(this.currentAsin);
                document.getElementById('copy-asin').textContent = '✓';
                setTimeout(() => {
                    document.getElementById('copy-asin').textContent = '📋';
                }, 1000);
            }
        });

        // Main actions
        document.getElementById('open-dominator').addEventListener('click', () => {
            this.openCSAI('buybox-dominator');
        });

        document.getElementById('open-price-tracker').addEventListener('click', () => {
            this.openCSAI('pricing');
        });

        document.getElementById('open-buybox').addEventListener('click', () => {
            this.openCSAI('buybox');
        });

        // Quick actions
        document.getElementById('open-lookup').addEventListener('click', () => {
            this.openCSAI('product-lookup');
        });

        document.getElementById('open-reviews').addEventListener('click', () => {
            this.openCSAI('reviews');
        });

        document.getElementById('open-sellers').addEventListener('click', () => {
            this.openCSAI('sellers');
        });

        document.getElementById('open-settings').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    }

    openCSAI(page) {
        if (!this.currentAsin) {
            window.open(this.csAiUrl, '_blank');
            return;
        }

        const marketplace = this.productInfo?.marketplace || 'amazon.com';
        const url = `${this.csAiUrl}/#${page}?asin=${this.currentAsin}&marketplace=${marketplace}`;

        // Store for CS-AI to pick up
        chrome.storage.local.set({
            pendingAsin: {
                asin: this.currentAsin,
                marketplace: marketplace,
                page: page,
                productInfo: this.productInfo,
                timestamp: Date.now()
            }
        });

        window.open(url, '_blank');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});
