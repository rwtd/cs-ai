/**
 * Buy Box Monitor Component for CS-AI
 * Track who owns the Buy Box for monitored products
 * Powered by Rainforest API
 */

ComponentRegistry.register('buybox', {
    monitoredProducts: [],
    refreshInterval: null,

    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>🏆 Buy Box Monitor</h1>
                <p class="page-subtitle">Track Buy Box ownership in real-time</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-ghost" id="refreshBuyBox">
                    <span>🔄</span> Refresh
                </button>
                <button class="btn btn-primary" id="openDominator">
                    <span>⚡</span> Dominator Mode
                </button>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card gradient-purple">
                <div class="stat-icon">📦</div>
                <div class="stat-content">
                    <span class="stat-value" id="bbMonitoredCount">0</span>
                    <span class="stat-label">Monitored</span>
                </div>
            </div>
            <div class="stat-card gradient-green">
                <div class="stat-icon">🏆</div>
                <div class="stat-content">
                    <span class="stat-value" id="bbWinningCount">0</span>
                    <span class="stat-label">We Own</span>
                </div>
            </div>
            <div class="stat-card gradient-amber">
                <div class="stat-icon">⚔️</div>
                <div class="stat-content">
                    <span class="stat-value" id="bbCompetingCount">0</span>
                    <span class="stat-label">Competing</span>
                </div>
            </div>
            <div class="stat-card gradient-red">
                <div class="stat-icon">⚠️</div>
                <div class="stat-content">
                    <span class="stat-value" id="bbSuppressedCount">0</span>
                    <span class="stat-label">Suppressed</span>
                </div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3>🔍 Monitor New Product</h3>
            </div>
            <div style="padding: 24px;">
                <div class="input-group-horizontal">
                    <input type="text" id="bbAsinInput" class="tool-input" 
                           placeholder="Enter ASIN (e.g., B08XYZ123)" style="flex: 2;">
                    <select id="bbMarketplace" class="tool-select" style="flex: 1;">
                        <option value="amazon.com">🇺🇸 US</option>
                        <option value="amazon.co.uk">🇬🇧 UK</option>
                        <option value="amazon.de">🇩🇪 DE</option>
                        <option value="amazon.ca">🇨🇦 CA</option>
                    </select>
                    <input type="text" id="bbSellerId" class="tool-input" 
                           placeholder="Your Seller ID (optional)" style="flex: 1;">
                    <button class="btn btn-primary" id="addBBMonitor">
                        <span>➕</span> Monitor
                    </button>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3>📊 Buy Box Status</h3>
                <div class="header-actions">
                    <span class="live-indicator">
                        <span class="pulse"></span> Live
                    </span>
                </div>
            </div>
            <div id="buyboxList" style="padding: 0;">
                <div class="empty-state" style="padding: 40px; text-align: center;">
                    <span style="font-size: 3rem;">🏆</span>
                    <p style="color: var(--text-secondary); margin-top: 12px;">No products monitored</p>
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Add an ASIN above to start monitoring Buy Box</p>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 24px;">
            <div class="card-header">
                <h3>👥 Competition Analysis</h3>
            </div>
            <div id="competitorAnalysis" style="padding: 24px;">
                <div class="empty-state" style="text-align: center;">
                    <span style="font-size: 2rem;">📊</span>
                    <p style="color: var(--text-secondary);">Select a product to view competition</p>
                </div>
            </div>
        </div>
    `,

    init: () => {
        const component = ComponentRegistry.get('buybox');
        component.loadMonitoredProducts();
        component.bindEvents();
    },

    destroy: () => {
        const component = ComponentRegistry.get('buybox');
        if (component.refreshInterval) {
            clearInterval(component.refreshInterval);
        }
    },

    loadMonitoredProducts: function () {
        const saved = localStorage.getItem('cs-ai-buybox-monitors');
        this.monitoredProducts = saved ? JSON.parse(saved) : [];
        this.renderBuyBoxList();
        this.updateStats();
    },

    saveMonitoredProducts: function () {
        localStorage.setItem('cs-ai-buybox-monitors', JSON.stringify(this.monitoredProducts));
    },

    bindEvents: function () {
        const addBtn = document.getElementById('addBBMonitor');
        const asinInput = document.getElementById('bbAsinInput');
        const refreshBtn = document.getElementById('refreshBuyBox');
        const dominatorBtn = document.getElementById('openDominator');

        addBtn?.addEventListener('click', () => this.addMonitor());
        asinInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addMonitor();
        });
        refreshBtn?.addEventListener('click', () => this.refreshAll());
        dominatorBtn?.addEventListener('click', () => {
            window.app.navigateTo('buybox-dominator');
        });
    },

    addMonitor: async function () {
        const asin = document.getElementById('bbAsinInput').value.trim().toUpperCase();
        const marketplace = document.getElementById('bbMarketplace').value;
        const sellerId = document.getElementById('bbSellerId').value.trim();

        if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
            window.app.showToast('⚠️ Please enter a valid 10-character ASIN');
            return;
        }

        if (this.monitoredProducts.find(p => p.asin === asin)) {
            window.app.showToast('ℹ️ This product is already being monitored');
            return;
        }

        window.app.showToast('🔍 Fetching Buy Box data...');

        try {
            let data;
            if (window.rainforestApi?.isConfigured()) {
                data = await window.rainforestApi.getProduct(asin, marketplace);
            } else {
                data = await window.rainforestApi.getMockProduct(asin);
            }

            const product = data.product || data;
            const buybox = window.rainforestApi.extractBuyBox(data);
            const offers = window.rainforestApi.extractOffers(data);
            const competition = window.rainforestApi.analyzeCompetition(offers);

            // Check if our seller ID is the winner
            const isOurBuyBox = sellerId && buybox.sellerId === sellerId;

            this.monitoredProducts.push({
                asin,
                marketplace,
                sellerId,
                title: product?.title || `Product ${asin}`,
                image: product?.main_image?.link || product?.main_image,
                buybox: buybox,
                offers: offers,
                competition: competition,
                isOurBuyBox: isOurBuyBox,
                lastChecked: new Date().toISOString(),
                history: [{
                    winner: buybox.sellerName,
                    price: buybox.price,
                    timestamp: new Date().toISOString()
                }]
            });

            this.saveMonitoredProducts();
            this.renderBuyBoxList();
            this.updateStats();

            document.getElementById('bbAsinInput').value = '';

            window.app.showToast(`✅ Now monitoring ${asin} Buy Box`);
        } catch (error) {
            console.error('Buy Box monitoring error:', error);
            window.app.showToast(`❌ Failed to monitor: ${error.message}`);
        }
    },

    refreshAll: async function () {
        if (this.monitoredProducts.length === 0) {
            window.app.showToast('ℹ️ No products to refresh');
            return;
        }

        window.app.showToast('🔄 Refreshing Buy Box status...');

        for (const product of this.monitoredProducts) {
            try {
                let data;
                if (window.rainforestApi?.isConfigured()) {
                    data = await window.rainforestApi.getProduct(product.asin, product.marketplace);
                } else {
                    data = await window.rainforestApi.getMockProduct(product.asin);
                }

                const buybox = window.rainforestApi.extractBuyBox(data);
                const offers = window.rainforestApi.extractOffers(data);
                const competition = window.rainforestApi.analyzeCompetition(offers);

                // Detect Buy Box change
                if (product.buybox.sellerName !== buybox.sellerName) {
                    window.app.showToast(`🔔 Buy Box changed for ${product.asin}! New winner: ${buybox.sellerName}`);
                }

                product.buybox = buybox;
                product.offers = offers;
                product.competition = competition;
                product.isOurBuyBox = product.sellerId && buybox.sellerId === product.sellerId;
                product.lastChecked = new Date().toISOString();
                product.history.push({
                    winner: buybox.sellerName,
                    price: buybox.price,
                    timestamp: new Date().toISOString()
                });

                // Keep last 50 history entries
                if (product.history.length > 50) {
                    product.history = product.history.slice(-50);
                }
            } catch (error) {
                console.error(`Failed to refresh ${product.asin}:`, error);
            }
        }

        this.saveMonitoredProducts();
        this.renderBuyBoxList();
        this.updateStats();

        window.app.showToast('✅ Buy Box status refreshed!');
    },

    removeMonitor: function (asin) {
        this.monitoredProducts = this.monitoredProducts.filter(p => p.asin !== asin);
        this.saveMonitoredProducts();
        this.renderBuyBoxList();
        this.updateStats();
        window.app.showToast(`🗑️ Stopped monitoring ${asin}`);
    },

    renderBuyBoxList: function () {
        const container = document.getElementById('buyboxList');
        if (!container) return;

        if (this.monitoredProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 40px; text-align: center;">
                    <span style="font-size: 3rem;">🏆</span>
                    <p style="color: var(--text-secondary); margin-top: 12px;">No products monitored</p>
                    <p style="color: var(--text-muted); font-size: 0.875rem;">Add an ASIN above to start monitoring Buy Box</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.monitoredProducts.map(product => {
            const bb = product.buybox;
            const statusClass = !bb.available ? 'suppressed' :
                product.isOurBuyBox ? 'winning' :
                    'competing';

            return `
                <div class="buybox-monitor-item ${statusClass}" data-asin="${product.asin}">
                    <div class="buybox-item-image">
                        <img src="${product.image || 'https://via.placeholder.com/60x60/1a1a24/8b5cf6?text=📦'}" 
                             alt="${product.title}"
                             onerror="this.src='https://via.placeholder.com/60x60/1a1a24/8b5cf6?text=📦'">
                    </div>
                    <div class="buybox-item-details">
                        <div class="buybox-item-title">${product.title?.substring(0, 45) || product.asin}...</div>
                        <div class="buybox-item-meta">
                            <span class="asin-badge">${product.asin}</span>
                            <span class="badge ${bb.isPrime ? 'badge-prime' : ''}">${bb.isPrime ? '✓ Prime' : bb.fulfillment || 'N/A'}</span>
                            <span class="competitors-badge">👥 ${product.competition?.competitors || 0} sellers</span>
                        </div>
                    </div>
                    <div class="buybox-item-winner">
                        <div class="bb-status-badge ${statusClass}">
                            ${!bb.available ? '⚠️ Suppressed' :
                    product.isOurBuyBox ? '🏆 WE OWN IT!' :
                        '⚔️ ' + (bb.sellerName?.substring(0, 15) || 'Unknown')}
                        </div>
                        <div class="bb-price">${bb.available ? '$' + (bb.price?.toFixed(2) || '--') : '--'}</div>
                    </div>
                    <div class="buybox-item-actions">
                        <button class="btn btn-ghost btn-sm" onclick="ComponentRegistry.get('buybox').showCompetition('${product.asin}')">
                            📊
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="ComponentRegistry.get('buybox').removeMonitor('${product.asin}')">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    showCompetition: function (asin) {
        const product = this.monitoredProducts.find(p => p.asin === asin);
        if (!product || !product.offers) return;

        const container = document.getElementById('competitorAnalysis');
        if (!container) return;

        const comp = product.competition;

        container.innerHTML = `
            <div class="competition-header">
                <h4>${product.title?.substring(0, 40)}... (${asin})</h4>
                <div class="price-range-display">
                    <span class="range-low">$${comp.priceRange?.min?.toFixed(2) || '--'}</span>
                    <span class="range-separator">-</span>
                    <span class="range-high">$${comp.priceRange?.max?.toFixed(2) || '--'}</span>
                </div>
            </div>
            
            <div class="competition-stats">
                <div class="comp-stat">
                    <span class="comp-stat-value">${comp.competitors || 0}</span>
                    <span class="comp-stat-label">Total Sellers</span>
                </div>
                <div class="comp-stat">
                    <span class="comp-stat-value">${comp.fbaOffers || 0}</span>
                    <span class="comp-stat-label">FBA Offers</span>
                </div>
                <div class="comp-stat">
                    <span class="comp-stat-value">${comp.fbmOffers || 0}</span>
                    <span class="comp-stat-label">FBM Offers</span>
                </div>
                <div class="comp-stat">
                    <span class="comp-stat-value">$${comp.priceToBeat || '--'}</span>
                    <span class="comp-stat-label">Price to Beat</span>
                </div>
            </div>

            <div class="offers-table">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Seller</th>
                            <th>Price</th>
                            <th>Rating</th>
                            <th>Fulfillment</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${product.offers.slice(0, 10).map((offer, i) => `
                            <tr class="${offer.isBuyBox ? 'buybox-winner-row' : ''}">
                                <td>${i + 1}</td>
                                <td>${offer.sellerName?.substring(0, 20) || 'Unknown'}</td>
                                <td><strong>$${offer.price?.toFixed(2) || '--'}</strong></td>
                                <td>⭐ ${offer.sellerRating || '-'}</td>
                                <td><span class="badge ${offer.isPrime ? 'badge-prime' : 'badge-muted'}">${offer.fulfillment || 'FBM'}</span></td>
                                <td>${offer.isBuyBox ? '🏆' : ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    updateStats: function () {
        const monitored = document.getElementById('bbMonitoredCount');
        const winning = document.getElementById('bbWinningCount');
        const competing = document.getElementById('bbCompetingCount');
        const suppressed = document.getElementById('bbSuppressedCount');

        if (monitored) monitored.textContent = this.monitoredProducts.length;

        if (winning) {
            winning.textContent = this.monitoredProducts.filter(p => p.isOurBuyBox).length;
        }

        if (competing) {
            competing.textContent = this.monitoredProducts.filter(p =>
                p.buybox?.available && !p.isOurBuyBox
            ).length;
        }

        if (suppressed) {
            suppressed.textContent = this.monitoredProducts.filter(p =>
                !p.buybox?.available
            ).length;
        }
    }
});
