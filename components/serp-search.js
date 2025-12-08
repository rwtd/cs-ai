/**
 * Example Component: SERP Search Tool
 * Team: Humans in the Loop
 * Author: [Your Name Here]
 * 
 * This is an example component showing how to build
 * a plug-and-play tool for the CS-AI Command Center.
 */

ComponentRegistry.register('serp-search', {
    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>🔍 SERP Lookup Tool</h1>
                <p class="page-subtitle">Search Google results in real-time using SerpWow API</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-secondary" id="serpHistoryBtn">
                    <span>📜</span> History
                </button>
            </div>
        </div>

        <div class="card" style="max-width: 900px; margin-bottom: 24px;">
            <div class="card-header">
                <h3>🌐 Google Search Query</h3>
                <span class="card-badge">SerpWow API</span>
            </div>
            <div style="padding: 24px;">
                <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                    <input type="text" id="serpQueryInput" 
                           class="search-input" 
                           placeholder="Enter search query (e.g., 'best wireless headphones 2024')"
                           style="flex: 1; padding: 14px 18px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-md); color: var(--text-primary); font-size: 1rem;">
                    <button class="btn btn-primary" id="serpSearchBtn">
                        <span>🔍</span> Search
                    </button>
                </div>
                
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.85rem;">
                        <select id="serpLocation" style="padding: 8px 12px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); color: var(--text-primary);">
                            <option value="us">🇺🇸 United States</option>
                            <option value="uk">🇬🇧 United Kingdom</option>
                            <option value="ca">🇨🇦 Canada</option>
                            <option value="de">🇩🇪 Germany</option>
                            <option value="fr">🇫🇷 France</option>
                        </select>
                        Location
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.85rem;">
                        <select id="serpDevice" style="padding: 8px 12px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); color: var(--text-primary);">
                            <option value="desktop">🖥️ Desktop</option>
                            <option value="mobile">📱 Mobile</option>
                        </select>
                        Device
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.85rem;">
                        <input type="number" id="serpNum" value="10" min="1" max="100" 
                               style="width: 60px; padding: 8px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); color: var(--text-primary);">
                        Results
                    </label>
                </div>
            </div>
        </div>

        <div id="serpResultsContainer"></div>
    `,

    init: () => {
        const searchBtn = document.getElementById('serpSearchBtn');
        const queryInput = document.getElementById('serpQueryInput');
        const resultsContainer = document.getElementById('serpResultsContainer');

        // Enter key to search
        queryInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchBtn?.click();
        });

        // Search button click
        searchBtn?.addEventListener('click', async () => {
            const query = queryInput.value.trim();
            if (!query) {
                window.app.showToast('⚠️ Please enter a search query');
                return;
            }

            const location = document.getElementById('serpLocation').value;
            const device = document.getElementById('serpDevice').value;
            const num = document.getElementById('serpNum').value;

            // Show loading state
            resultsContainer.innerHTML = `
                <div class="card">
                    <div style="padding: 60px; text-align: center;">
                        <div style="font-size: 3rem; animation: float 2s ease-in-out infinite;">🔍</div>
                        <p style="color: var(--text-secondary); margin-top: 16px;">Searching Google for "${query}"...</p>
                    </div>
                </div>
            `;

            // Simulate API call (replace with real SerpWow API)
            setTimeout(() => {
                // Mock results for demo
                const mockResults = [
                    { position: 1, title: `${query} - Top Result | Expert Reviews`, url: 'https://example.com/1', snippet: `Find the best ${query} with our comprehensive guide. Updated for 2024 with expert recommendations.` },
                    { position: 2, title: `Best ${query} of 2024 - Buyer's Guide`, url: 'https://example2.com/2', snippet: `Compare top-rated ${query}. Read reviews, check prices, and find the perfect match for your needs.` },
                    { position: 3, title: `${query} Reviews & Ratings`, url: 'https://example3.com/3', snippet: `Trusted reviews from verified buyers. See what customers are saying about ${query}.` },
                    { position: 4, title: `Amazon.com: ${query}`, url: 'https://amazon.com/search', snippet: `Shop ${query} at Amazon. Free shipping on qualified orders. Great deals every day.` },
                    { position: 5, title: `${query} - Wikipedia`, url: 'https://wikipedia.org/wiki', snippet: `${query} is a term that refers to... Learn more about the history and details.` }
                ];

                resultsContainer.innerHTML = `
                    <div class="stats-grid" style="margin-bottom: 24px;">
                        <div class="stat-card gradient-purple">
                            <div class="stat-icon">📊</div>
                            <div class="stat-content">
                                <span class="stat-value">${mockResults.length}</span>
                                <span class="stat-label">Results Found</span>
                            </div>
                        </div>
                        <div class="stat-card gradient-blue">
                            <div class="stat-icon">⏱️</div>
                            <div class="stat-content">
                                <span class="stat-value">0.42s</span>
                                <span class="stat-label">Response Time</span>
                            </div>
                        </div>
                        <div class="stat-card gradient-pink">
                            <div class="stat-icon">🌍</div>
                            <div class="stat-content">
                                <span class="stat-value">${location.toUpperCase()}</span>
                                <span class="stat-label">Location</span>
                            </div>
                        </div>
                        <div class="stat-card gradient-amber">
                            <div class="stat-icon">${device === 'mobile' ? '📱' : '🖥️'}</div>
                            <div class="stat-content">
                                <span class="stat-value">${device}</span>
                                <span class="stat-label">Device</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3>🔗 Organic Results for "${query}"</h3>
                            <span class="card-badge">Mock Data</span>
                        </div>
                        <div style="padding: 16px;">
                            ${mockResults.map(r => `
                                <div class="ticket-item" style="cursor: pointer;" onclick="window.open('${r.url}', '_blank')">
                                    <div style="width: 40px; height: 40px; background: var(--gradient-hero); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">${r.position}</div>
                                    <div class="ticket-content" style="flex: 1;">
                                        <span class="ticket-title" style="color: var(--accent-blue); font-weight: 600;">${r.title}</span>
                                        <span style="font-size: 0.75rem; color: var(--accent-green);">${r.url}</span>
                                        <span class="ticket-meta" style="display: block; margin-top: 4px;">${r.snippet}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="margin-top: 16px; padding: 16px; background: rgba(139, 92, 246, 0.1); border-radius: var(--radius-md); border: 1px dashed var(--glass-border);">
                        <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center;">
                            💡 <strong>Note:</strong> This is mock data. Connect your SerpWow API key in Settings → API Keys to get real results.
                        </p>
                    </div>
                `;

                window.app.showToast(`✅ Found ${mockResults.length} results for "${query}"`);
            }, 1500);
        });

        // History button
        document.getElementById('serpHistoryBtn')?.addEventListener('click', () => {
            window.app.showToast('📜 Search history coming soon!');
        });

        // Focus input on load
        queryInput?.focus();
    }
});

console.log('✅ SERP Search component loaded');
