/**
 * Price Tracker Component for CS-AI
 * Monitor and compare product prices across sellers
 * Powered by Rainforest API
 */

ComponentRegistry.register('pricing', {
    trackedProducts: [],

    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>💰 Price Tracker</h1>
                <p class="page-subtitle">Monitor Amazon product prices in real-time</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-ghost" id="refreshPrices">
                    <span>🔄</span> Refresh All
                </button>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card gradient-purple">
                <div class="stat-icon">📦</div>
                <div class="stat-content">
                    <span class="stat-value" id="trackedCount">0</span>
                    <span class="stat-label">Tracked Products</span>
                </div>
            </div>
            <div class="stat-card gradient-blue">
                <div class="stat-icon">📉</div>
                <div class="stat-content">
                    <span class="stat-value" id="priceDrops">0</span>
                    <span class="stat-label">Price Drops</span>
                </div>
            </div>
            <div class="stat-card gradient-green">
                <div class="stat-icon">💵</div>
                <div class="stat-content">
                    <span class="stat-value" id="avgSavings">$0</span>
                    <span class="stat-label">Avg Savings</span>
                </div>
            </div>
            <div class="stat-card gradient-amber">
                <div class="stat-icon">⏱️</div>
                <div class="stat-content">
                    <span class="stat-value" id="lastCheck">--</span>
                    <span class="stat-label">Last Check</span>
                </div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3>🔍 Track New Product</h3>
            </div>
            <div style="padding: 24px;">
                <div class="input-group-horizontal">
                    <input type="text" id="priceAsinInput" class="tool-input" 
                           placeholder="Enter ASIN (e.g., B08XYZ123)" style="flex: 2;">
                    <select id="priceMarketplace" class="tool-select" style="flex: 1;">
                        <option value="amazon.com">🇺🇸 US</option>
                        <option value="amazon.co.uk">🇬🇧 UK</option>
                        <option value="amazon.de">🇩🇪 DE</option>
                        <option value="amazon.ca">🇨🇦 CA</option>
                    </select>
                    <input type="number" id="targetPrice" class="tool-input" 
                           placeholder="Alert below $" style="flex: 1;">
                    <button class="btn btn-primary" id="addTrackedProduct">
                        <span>➕</span> Track
                    </button>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3>📊 Tracked Products</h3>
                <span class="card-badge" id="statusBadge">Live</span>
            </div>
            <div id="trackedProductsList" style="padding: 0;">
                <div class="empty-state" style="padding: 40px; text-align: center;">
                    <span style="font-size: 3rem;">📦</span>
                    <p style="color: var(--text-secondary); margin-top: 12px;">No products tracked yet</p>
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Add an ASIN above to start tracking prices</p>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 24px;">
            <div class="card-header">
                <h3>📈 Price History</h3>
            </div>
            <div id="priceHistory" style="padding: 24px;">
                <div class="empty-state" style="text-align: center;">
                    <span style="font-size: 2rem;">📊</span>
                    <p style="color: var(--text-secondary);">Select a product to view price history</p>
                </div>
            </div>
        </div>
    `,

    init: () => {
        const component = ComponentRegistry.get('pricing');
        component.loadTrackedProducts();
        component.bindEvents();
    },

    loadTrackedProducts: function () {
        const saved = localStorage.getItem('cs-ai-tracked-prices');
        this.trackedProducts = saved ? JSON.parse(saved) : [];
        this.renderTrackedList();
        this.updateStats();
    },

    saveTrackedProducts: function () {
        localStorage.setItem('cs-ai-tracked-prices', JSON.stringify(this.trackedProducts));
    },

    bindEvents: function () {
        const addBtn = document.getElementById('addTrackedProduct');
        const asinInput = document.getElementById('priceAsinInput');
        const refreshBtn = document.getElementById('refreshPrices');

        addBtn?.addEventListener('click', () => this.addProduct());
        asinInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addProduct();
        });
        refreshBtn?.addEventListener('click', () => this.refreshAll());
    },

    addProduct: async function () {
        const asin = document.getElementById('priceAsinInput').value.trim().toUpperCase();
        const marketplace = document.getElementById('priceMarketplace').value;
        const targetPrice = parseFloat(document.getElementById('targetPrice').value) || null;

        if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
            window.app.showToast('⚠️ Please enter a valid 10-character ASIN');
            return;
        }

        if (this.trackedProducts.find(p => p.asin === asin)) {
            window.app.showToast('ℹ️ This product is already being tracked');
            return;
        }

        window.app.showToast('🔍 Fetching product data...');

        try {
            let data;
            if (window.rainforestApi?.isConfigured()) {
                data = await window.rainforestApi.getProduct(asin, marketplace);
            } else {
                data = await window.rainforestApi.getMockProduct(asin);
            }

            const product = data.product || data;
            const price = product?.buybox_winner?.price?.value
                || product?.price?.value
                || product?.price
                || 0;

            this.trackedProducts.push({
                asin,
                marketplace,
                title: product?.title || `Product ${asin}`,
                image: product?.main_image?.link || product?.main_image,
                currentPrice: price,
                originalPrice: price,
                targetPrice,
                lastChecked: new Date().toISOString(),
                priceHistory: [{ price, timestamp: new Date().toISOString() }]
            });

            this.saveTrackedProducts();
            this.renderTrackedList();
            this.updateStats();

            document.getElementById('priceAsinInput').value = '';
            document.getElementById('targetPrice').value = '';

            window.app.showToast(`✅ Now tracking ${asin}`);
        } catch (error) {
            console.error('Price tracking error:', error);
            window.app.showToast(`❌ Failed to add product: ${error.message}`);
        }
    },

    refreshAll: async function () {
        if (this.trackedProducts.length === 0) {
            window.app.showToast('ℹ️ No products to refresh');
            return;
        }

        window.app.showToast('🔄 Refreshing prices...');

        for (const product of this.trackedProducts) {
            try {
                let data;
                if (window.rainforestApi?.isConfigured()) {
                    data = await window.rainforestApi.getProduct(product.asin, product.marketplace);
                } else {
                    data = await window.rainforestApi.getMockProduct(product.asin);
                }

                const productData = data.product || data;
                const newPrice = productData?.buybox_winner?.price?.value
                    || productData?.price?.value
                    || product.currentPrice;

                product.currentPrice = newPrice;
                product.lastChecked = new Date().toISOString();
                product.priceHistory.push({ price: newPrice, timestamp: new Date().toISOString() });

                // Keep last 30 price points
                if (product.priceHistory.length > 30) {
                    product.priceHistory = product.priceHistory.slice(-30);
                }

                // Check for price target alert
                if (product.targetPrice && newPrice <= product.targetPrice) {
                    window.app.showToast(`🎉 Price Alert! ${product.asin} is now $${newPrice}!`);
                }
            } catch (error) {
                console.error(`Failed to refresh ${product.asin}:`, error);
            }
        }

        this.saveTrackedProducts();
        this.renderTrackedList();
        this.updateStats();

        document.getElementById('lastCheck').textContent = 'Now';
        window.app.showToast('✅ Prices refreshed!');
    },

    removeProduct: function (asin) {
        this.trackedProducts = this.trackedProducts.filter(p => p.asin !== asin);
        this.saveTrackedProducts();
        this.renderTrackedList();
        this.updateStats();
        window.app.showToast(`🗑️ Removed ${asin} from tracking`);
    },

    renderTrackedList: function () {
        const container = document.getElementById('trackedProductsList');
        if (!container) return;

        if (this.trackedProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 40px; text-align: center;">
                    <span style="font-size: 3rem;">📦</span>
                    <p style="color: var(--text-secondary); margin-top: 12px;">No products tracked yet</p>
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Add an ASIN above to start tracking prices</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.trackedProducts.map(product => {
            const priceChange = product.currentPrice - product.originalPrice;
            const priceChangePercent = ((priceChange / product.originalPrice) * 100).toFixed(1);
            const isDown = priceChange < 0;
            const isUp = priceChange > 0;
            const atTarget = product.targetPrice && product.currentPrice <= product.targetPrice;

            return `
                <div class="price-tracker-item ${atTarget ? 'at-target' : ''}" data-asin="${product.asin}">
                    <div class="price-tracker-image">
                        <img src="${product.image || 'https://via.placeholder.com/60x60/1a1a24/8b5cf6?text=📦'}" 
                             alt="${product.title}" 
                             onerror="this.src='https://via.placeholder.com/60x60/1a1a24/8b5cf6?text=📦'">
                    </div>
                    <div class="price-tracker-details">
                        <div class="price-tracker-title">${product.title?.substring(0, 50) || product.asin}...</div>
                        <div class="price-tracker-meta">
                            <span class="asin-badge">${product.asin}</span>
                            <span class="marketplace-badge">${product.marketplace}</span>
                            ${product.targetPrice ? `<span class="target-badge">Target: $${product.targetPrice}</span>` : ''}
                        </div>
                    </div>
                    <div class="price-tracker-price">
                        <div class="current-price">$${product.currentPrice?.toFixed(2) || '--'}</div>
                        <div class="price-change ${isDown ? 'down' : isUp ? 'up' : ''}">
                            ${isDown ? '📉' : isUp ? '📈' : '➡️'} 
                            ${isDown ? '' : isUp ? '+' : ''}${priceChangePercent}%
                        </div>
                    </div>
                    <div class="price-tracker-actions">
                        <button class="btn btn-ghost btn-sm" onclick="ComponentRegistry.get('pricing').showHistory('${product.asin}')">
                            📊
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="ComponentRegistry.get('pricing').removeProduct('${product.asin}')">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    showHistory: function (asin) {
        const product = this.trackedProducts.find(p => p.asin === asin);
        if (!product) return;

        const historyContainer = document.getElementById('priceHistory');
        if (!historyContainer || !product.priceHistory || product.priceHistory.length === 0) return;

        const maxPrice = Math.max(...product.priceHistory.map(h => h.price));
        const minPrice = Math.min(...product.priceHistory.map(h => h.price));
        const range = maxPrice - minPrice || 1;

        historyContainer.innerHTML = `
            <div class="price-history-header">
                <h4>${product.title?.substring(0, 40)}... (${asin})</h4>
                <div class="price-range">
                    <span class="min">Low: $${minPrice.toFixed(2)}</span>
                    <span class="max">High: $${maxPrice.toFixed(2)}</span>
                </div>
            </div>
            <div class="price-chart">
                ${product.priceHistory.map((point, i) => {
            const height = ((point.price - minPrice) / range) * 100;
            return `
                        <div class="chart-bar" style="height: ${Math.max(5, height)}%;" 
                             title="$${point.price.toFixed(2)} - ${new Date(point.timestamp).toLocaleDateString()}">
                        </div>
                    `;
        }).join('')}
            </div>
            <div class="price-history-list">
                ${product.priceHistory.slice().reverse().slice(0, 10).map(point => `
                    <div class="history-item">
                        <span class="history-date">${new Date(point.timestamp).toLocaleDateString()}</span>
                        <span class="history-price">$${point.price.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    updateStats: function () {
        const trackedCount = document.getElementById('trackedCount');
        const priceDrops = document.getElementById('priceDrops');
        const avgSavings = document.getElementById('avgSavings');

        if (trackedCount) trackedCount.textContent = this.trackedProducts.length;

        const drops = this.trackedProducts.filter(p => p.currentPrice < p.originalPrice).length;
        if (priceDrops) priceDrops.textContent = drops;

        const totalSavings = this.trackedProducts
            .filter(p => p.currentPrice < p.originalPrice)
            .reduce((sum, p) => sum + (p.originalPrice - p.currentPrice), 0);
        const avg = drops > 0 ? totalSavings / drops : 0;
        if (avgSavings) avgSavings.textContent = `$${avg.toFixed(2)}`;
    }
});
