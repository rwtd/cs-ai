/**
 * Product Lookup Component
 * Amazon Product Search via Rainforest API
 */

ComponentRegistry.register('product-lookup', {
    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>📦 Product Lookup</h1>
                <p class="page-subtitle">Search Amazon products and get detailed information via Rainforest API</p>
            </div>
            <span class="api-badge" id="productApiStatus">Checking API...</span>
        </div>

        <div class="card">
            <div class="card-header">
                <h3>🔍 Search Products</h3>
                <div class="search-type-tabs">
                    <button class="serp-type-btn active" data-type="search">🔍 Keyword</button>
                    <button class="serp-type-btn" data-type="asin">📦 ASIN</button>
                    <button class="serp-type-btn" data-type="category">📂 Category</button>
                </div>
            </div>
            <div style="padding: 24px;">
                <!-- Search Input -->
                <div class="search-row" style="display: flex; gap: 12px; margin-bottom: 20px;">
                    <input type="text" id="productQuery" class="search-input" 
                           placeholder="Search for products or enter ASIN..." 
                           style="flex: 1;">
                    <button class="btn btn-primary" id="productSearchBtn">🔍 Search</button>
                    <button class="btn btn-ghost" id="productClearBtn">🗑️ Clear</button>
                </div>
                
                <!-- Quick Options -->
                <div class="serp-options" style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
                    <label class="serp-option">
                        <span>Marketplace:</span>
                        <select id="productDomain">
                            <option value="amazon.com">🇺🇸 Amazon.com</option>
                            <option value="amazon.co.uk">🇬🇧 Amazon.co.uk</option>
                            <option value="amazon.de">🇩🇪 Amazon.de</option>
                            <option value="amazon.ca">🇨🇦 Amazon.ca</option>
                            <option value="amazon.fr">🇫🇷 Amazon.fr</option>
                            <option value="amazon.es">🇪🇸 Amazon.es</option>
                            <option value="amazon.it">🇮🇹 Amazon.it</option>
                            <option value="amazon.co.jp">🇯🇵 Amazon.co.jp</option>
                            <option value="amazon.in">🇮🇳 Amazon.in</option>
                            <option value="amazon.com.au">🇦🇺 Amazon.com.au</option>
                        </select>
                    </label>
                    <label class="serp-option">
                        <span>Sort By:</span>
                        <select id="productSort">
                            <option value="relevance">Relevance</option>
                            <option value="price_low_to_high">Price: Low → High</option>
                            <option value="price_high_to_low">Price: High → Low</option>
                            <option value="reviews">Avg. Reviews</option>
                            <option value="newest">Newest</option>
                        </select>
                    </label>
                    <label class="serp-option">
                        <span>Results:</span>
                        <select id="productNum">
                            <option value="10">10</option>
                            <option value="20" selected>20</option>
                            <option value="50">50</option>
                        </select>
                    </label>
                    
                    <button class="btn btn-ghost" id="toggleProductAdvanced" style="margin-left: auto;">
                        ⚙️ Advanced <span id="productAdvancedArrow">▼</span>
                    </button>
                </div>
                
                <!-- Advanced Options (collapsed by default) -->
                <div id="productAdvancedOptions" class="advanced-options" style="display: none;">
                    <div class="advanced-grid">
                        <div class="advanced-group">
                            <h4>💰 Price Range</h4>
                            <div style="display: flex; gap: 8px;">
                                <label class="serp-option-full" style="flex: 1;">
                                    <span>Min Price</span>
                                    <input type="number" id="productMinPrice" placeholder="0">
                                </label>
                                <label class="serp-option-full" style="flex: 1;">
                                    <span>Max Price</span>
                                    <input type="number" id="productMaxPrice" placeholder="1000">
                                </label>
                            </div>
                        </div>
                        
                        <div class="advanced-group">
                            <h4>⭐ Ratings Filter</h4>
                            <label class="serp-option-full">
                                <span>Min Rating</span>
                                <select id="productMinRating">
                                    <option value="">Any</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="3">3+ Stars</option>
                                    <option value="2">2+ Stars</option>
                                </select>
                            </label>
                        </div>
                        
                        <div class="advanced-group">
                            <h4>📦 Availability</h4>
                            <label class="serp-option-full">
                                <span>Prime Only</span>
                                <select id="productPrime">
                                    <option value="">All Products</option>
                                    <option value="true">Prime Only</option>
                                </select>
                            </label>
                        </div>
                        
                        <div class="advanced-group">
                            <h4>🏷️ Condition</h4>
                            <label class="serp-option-full">
                                <span>Product Condition</span>
                                <select id="productCondition">
                                    <option value="">All</option>
                                    <option value="new">New</option>
                                    <option value="used">Used</option>
                                    <option value="renewed">Renewed</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Quick Links -->
                    <div class="docs-links" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--glass-border);">
                        <span style="color: var(--text-muted); font-size: 0.85rem; margin-right: 12px;">📚 Quick Links:</span>
                        <a href="https://www.rainforestapi.com/docs/product-data-api/overview" target="_blank">Overview</a>
                        <a href="https://www.rainforestapi.com/docs/product-data-api/parameters/search" target="_blank">Search Params</a>
                        <a href="https://www.rainforestapi.com/docs/product-data-api/parameters/product" target="_blank">Product Params</a>
                        <a href="https://www.rainforestapi.com/docs/product-data-api/results/search" target="_blank">Results Schema</a>
                    </div>
                </div>
            </div>
        </div>

        <div id="productResultsContainer"></div>
    `,

    init: function () {
        const searchBtn = document.getElementById('productSearchBtn');
        const clearBtn = document.getElementById('productClearBtn');
        const queryInput = document.getElementById('productQuery');
        const resultsContainer = document.getElementById('productResultsContainer');
        const apiStatus = document.getElementById('productApiStatus');

        let currentSearchType = 'search';
        let requestStartTime = null;

        // Check API
        fetch('/api/status')
            .then(r => r.json())
            .then(data => {
                if (data.apis?.rainforest) {
                    apiStatus.textContent = '✅ API Ready';
                    apiStatus.style.background = 'rgba(16, 185, 129, 0.2)';
                    apiStatus.style.color = 'var(--accent-green)';
                } else {
                    apiStatus.textContent = '⚠️ Configure API Key';
                    apiStatus.style.background = 'rgba(245, 158, 11, 0.2)';
                    apiStatus.style.color = 'var(--accent-amber)';
                }
            });

        // Search type tabs
        document.querySelectorAll('.serp-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.serp-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSearchType = btn.dataset.type;

                // Update placeholder
                const placeholders = {
                    'search': 'Search for products...',
                    'asin': 'Enter ASIN (e.g., B08N5WRWNW)',
                    'category': 'Enter category (e.g., Electronics)'
                };
                queryInput.placeholder = placeholders[currentSearchType] || placeholders['search'];
                window.app.showToast(`🔍 Search type: ${btn.textContent.trim()}`);
            });
        });

        // Advanced toggle
        const toggleAdvanced = document.getElementById('toggleProductAdvanced');
        const advancedOptions = document.getElementById('productAdvancedOptions');
        const advancedArrow = document.getElementById('productAdvancedArrow');

        toggleAdvanced?.addEventListener('click', () => {
            const isVisible = advancedOptions.style.display !== 'none';
            advancedOptions.style.display = isVisible ? 'none' : 'block';
            advancedArrow.textContent = isVisible ? '▼' : '▲';
        });

        // Enter to search
        queryInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchBtn?.click();
        });

        // Clear
        clearBtn?.addEventListener('click', () => {
            resultsContainer.innerHTML = '';
            queryInput.value = '';
            queryInput.focus();
        });

        // Search
        searchBtn?.addEventListener('click', async () => {
            const query = queryInput.value.trim();
            if (!query) {
                window.app.showToast('⚠️ Please enter a search query or ASIN');
                return;
            }

            const domain = document.getElementById('productDomain').value;
            const sortBy = document.getElementById('productSort').value;
            const num = document.getElementById('productNum').value;

            // Show loading
            resultsContainer.innerHTML = `
                <div class="card">
                    <div style="padding: 60px; text-align: center;">
                        <div style="font-size: 3rem; animation: float 2s ease-in-out infinite;">📦</div>
                        <p style="color: var(--text-secondary); margin-top: 16px;">Searching Amazon for "${query}"...</p>
                        <p style="color: var(--text-muted); font-size: 0.85rem;">Calling Rainforest API...</p>
                    </div>
                </div>
            `;

            requestStartTime = performance.now();

            try {
                let endpoint, params;

                if (currentSearchType === 'asin' || /^B0[A-Z0-9]{8}$/i.test(query)) {
                    // ASIN lookup
                    endpoint = '/api/rainforest/product';
                    params = new URLSearchParams({
                        asin: query.toUpperCase(),
                        amazon_domain: domain
                    });
                } else {
                    // Keyword search - would need a search endpoint
                    // For now, show that we'd need this API endpoint
                    const responseTime = ((performance.now() - requestStartTime) / 1000).toFixed(2);

                    resultsContainer.innerHTML = `
                        <div class="card">
                            <div class="card-header">
                                <h3>🔍 Search: "${query}"</h3>
                                <span class="card-badge">⏱️ ${responseTime}s</span>
                            </div>
                            <div style="padding: 40px; text-align: center;">
                                <div style="font-size: 2rem; margin-bottom: 16px;">💡</div>
                                <p style="color: var(--text-primary); font-weight: 600;">Keyword Search Coming Soon!</p>
                                <p style="color: var(--text-muted); max-width: 500px; margin: 12px auto;">
                                    Enter an ASIN (like B08N5WRWNW) to get detailed product info, 
                                    or use the search bar at the top to quickly look up products.
                                </p>
                                <div style="margin-top: 24px;">
                                    <button class="btn btn-primary" onclick="document.getElementById('productQuery').value='B08N5WRWNW'; document.getElementById('productSearchBtn').click();">
                                        📦 Try Demo ASIN
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    return;
                }

                const response = await fetch(`${endpoint}?${params}`);
                const data = await response.json();
                const responseTime = ((performance.now() - requestStartTime) / 1000).toFixed(2);

                if (data.error) {
                    throw new Error(data.error);
                }

                const product = data.product || data;

                resultsContainer.innerHTML = `
                    <div class="stats-grid" style="margin-bottom: 24px;">
                        <div class="stat-card gradient-purple">
                            <div class="stat-icon">⏱️</div>
                            <div class="stat-content">
                                <span class="stat-value">${responseTime}s</span>
                                <span class="stat-label">Response Time</span>
                            </div>
                        </div>
                        <div class="stat-card gradient-blue">
                            <div class="stat-icon">🏪</div>
                            <div class="stat-content">
                                <span class="stat-value">${domain}</span>
                                <span class="stat-label">Marketplace</span>
                            </div>
                        </div>
                        <div class="stat-card gradient-pink">
                            <div class="stat-icon">📦</div>
                            <div class="stat-content">
                                <span class="stat-value">${product.asin || query}</span>
                                <span class="stat-label">ASIN</span>
                            </div>
                        </div>
                        <div class="stat-card gradient-amber">
                            <div class="stat-icon">⭐</div>
                            <div class="stat-content">
                                <span class="stat-value">${product.rating || 'N/A'}</span>
                                <span class="stat-label">Rating</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3>📦 Product Details</h3>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-ghost btn-sm" onclick="window.app.navigateTo('pricing')">💰 Track Price</button>
                                <button class="btn btn-ghost btn-sm" onclick="window.app.navigateTo('buybox')">🏆 Monitor Buy Box</button>
                            </div>
                        </div>
                        <div style="padding: 24px;">
                            <div style="display: grid; grid-template-columns: 200px 1fr; gap: 24px;">
                                ${product.main_image?.link ? `
                                    <div>
                                        <img src="${product.main_image.link}" alt="${product.title}" 
                                             style="width: 100%; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                                    </div>
                                ` : '<div style="width: 200px; height: 200px; background: var(--glass-bg); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 3rem;">📦</div>'}
                                <div>
                                    <h2 style="margin: 0 0 12px 0; color: var(--text-primary);">${product.title || 'Product Title'}</h2>
                                    ${product.brand ? `<p style="color: var(--text-muted); margin-bottom: 12px;">By <strong>${product.brand}</strong></p>` : ''}
                                    
                                    <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                                        ${product.buybox_winner?.price?.raw ? `
                                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-green);">${product.buybox_winner.price.raw}</div>
                                        ` : product.price?.raw ? `
                                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-green);">${product.price.raw}</div>
                                        ` : ''}
                                        ${product.rating ? `
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <span style="font-size: 1.2rem;">⭐ ${product.rating}</span>
                                                ${product.ratings_total ? `<span style="color: var(--text-muted);">(${product.ratings_total.toLocaleString()} reviews)</span>` : ''}
                                            </div>
                                        ` : ''}
                                    </div>
                                    
                                    ${product.feature_bullets?.length ? `
                                        <div style="margin-top: 16px;">
                                            <h4 style="color: var(--text-secondary); margin-bottom: 8px;">Key Features:</h4>
                                            <ul style="color: var(--text-secondary); padding-left: 20px;">
                                                ${product.feature_bullets.slice(0, 5).map(b => `<li style="margin-bottom: 4px;">${b}</li>`).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
                                    
                                    ${product.buybox_winner ? `
                                        <div style="margin-top: 16px; padding: 16px; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md);">
                                            <h4 style="color: var(--accent-green); margin: 0 0 8px 0;">🏆 Buy Box Winner</h4>
                                            <p style="color: var(--text-secondary); margin: 0;">
                                                ${product.buybox_winner.is_amazon_fresh ? '🍎 Amazon Fresh' : ''}
                                                ${product.buybox_winner.is_prime ? '✅ Prime' : ''}
                                                ${product.buybox_winner.fulfillment?.type ? `• ${product.buybox_winner.fulfillment.type}` : ''}
                                            </p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 16px;">
                        <button class="btn btn-ghost" onclick="console.log(${JSON.stringify(JSON.stringify(data))})">📋 Log Raw Data</button>
                        <a href="https://${domain}/dp/${product.asin || query}" target="_blank" class="btn btn-ghost">🔗 View on Amazon</a>
                    </div>
                `;

                window.app.showToast(`✅ Found product: ${product.title?.substring(0, 50)}...`);

            } catch (error) {
                const responseTime = ((performance.now() - requestStartTime) / 1000).toFixed(2);
                resultsContainer.innerHTML = `
                    <div class="card">
                        <div style="padding: 40px; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 16px;">❌</div>
                            <p style="color: var(--accent-red);">Error: ${error.message}</p>
                            <p style="color: var(--text-muted); font-size: 0.85rem;">Response time: ${responseTime}s</p>
                        </div>
                    </div>
                `;
            }
        });

        queryInput?.focus();
    }
});

console.log('✅ Product Lookup component loaded');
