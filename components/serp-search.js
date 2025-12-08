/**
 * SERP Search Tool - Real API Version with Preview
 * Team: Humans in the Loop
 * 
 * Features:
 * - Real SerpWow API integration
 * - Beautiful results display
 * - Google-style SERP preview with screenshot
 * - Raw JSON response viewer
 * - Editable request for re-execution
 */

ComponentRegistry.register('serp-search', {
    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>🔍 SERP Lookup Tool</h1>
                <p class="page-subtitle">Search Google results in real-time using SerpWow API</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-secondary" id="serpClearBtn">
                    <span>🗑️</span> Clear
                </button>
            </div>
        </div>

        <div class="card" style="max-width: 1200px; margin-bottom: 24px;">
            <div class="card-header">
                <h3>🌐 Google Search Query</h3>
                <span class="card-badge" id="apiStatusBadge">Checking API...</span>
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
                            <option value="United States">🇺🇸 United States</option>
                            <option value="United Kingdom">🇬🇧 United Kingdom</option>
                            <option value="Canada">🇨🇦 Canada</option>
                            <option value="Germany">🇩🇪 Germany</option>
                            <option value="France">🇫🇷 France</option>
                            <option value="Australia">🇦🇺 Australia</option>
                        </select>
                        Location
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.85rem;">
                        <select id="serpDevice" style="padding: 8px 12px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); color: var(--text-primary);">
                            <option value="desktop">🖥️ Desktop</option>
                            <option value="mobile">📱 Mobile</option>
                            <option value="tablet">📱 Tablet</option>
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
        const clearBtn = document.getElementById('serpClearBtn');
        const queryInput = document.getElementById('serpQueryInput');
        const resultsContainer = document.getElementById('serpResultsContainer');
        const apiStatusBadge = document.getElementById('apiStatusBadge');

        // Store last request/response for debugging
        let lastRequest = null;
        let lastResponse = null;
        let requestStartTime = null;

        // Check API status on load
        fetch('/api/status')
            .then(r => r.json())
            .then(data => {
                if (data.apis?.serpwow) {
                    apiStatusBadge.textContent = '✅ API Ready';
                    apiStatusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
                    apiStatusBadge.style.color = 'var(--accent-green)';
                } else {
                    apiStatusBadge.textContent = '⚠️ API Key Missing';
                    apiStatusBadge.style.background = 'rgba(245, 158, 11, 0.2)';
                    apiStatusBadge.style.color = 'var(--accent-amber)';
                }
            })
            .catch(() => {
                apiStatusBadge.textContent = '❌ API Error';
                apiStatusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
                apiStatusBadge.style.color = 'var(--accent-red)';
            });

        // Enter key to search
        queryInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchBtn?.click();
        });

        // Clear button
        clearBtn?.addEventListener('click', () => {
            resultsContainer.innerHTML = '';
            queryInput.value = '';
            queryInput.focus();
            lastRequest = null;
            lastResponse = null;
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

            // Build request object
            lastRequest = {
                endpoint: '/api/serpwow/search',
                params: { q: query, location, device, num },
                fullUrl: `/api/serpwow/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&device=${device}&num=${num}`,
                timestamp: new Date().toISOString()
            };

            // Show loading state
            resultsContainer.innerHTML = `
                <div class="card">
                    <div style="padding: 60px; text-align: center;">
                        <div style="font-size: 3rem; animation: float 2s ease-in-out infinite;">🔍</div>
                        <p style="color: var(--text-secondary); margin-top: 16px;">Searching Google for "${query}"...</p>
                        <p style="color: var(--text-muted); font-size: 0.85rem;">Calling SerpWow API...</p>
                    </div>
                </div>
            `;

            requestStartTime = performance.now();

            try {
                const response = await fetch(lastRequest.fullUrl);
                const data = await response.json();
                const responseTime = ((performance.now() - requestStartTime) / 1000).toFixed(2);

                lastResponse = data;

                if (data.error) {
                    resultsContainer.innerHTML = `
                        <div class="card">
                            <div style="padding: 40px; text-align: center;">
                                <div style="font-size: 3rem;">⚠️</div>
                                <h3 style="color: var(--accent-amber); margin: 16px 0;">API Error</h3>
                                <p style="color: var(--text-secondary);">${data.error}</p>
                                ${data.hint ? `<p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 8px;">${data.hint}</p>` : ''}
                            </div>
                        </div>
                    `;
                    return;
                }

                // Get results
                const organicResults = data.organic_results || [];
                const searchInfo = data.search_information || {};
                const aiOverview = data.ai_overview;
                const ads = data.ads || [];
                const relatedSearches = data.related_searches || [];
                const knowledgeGraph = data.knowledge_graph;

                // Render results with tabs
                resultsContainer.innerHTML = `
                    <!-- Stats Cards -->
                    <div class="stats-grid" style="margin-bottom: 24px;">
                        <div class="stat-card gradient-purple">
                            <div class="stat-icon">📊</div>
                            <div class="stat-content">
                                <span class="stat-value">${organicResults.length}</span>
                                <span class="stat-label">Results Returned</span>
                            </div>
                        </div>
                        <div class="stat-card gradient-blue">
                            <div class="stat-icon">⏱️</div>
                            <div class="stat-content">
                                <span class="stat-value">${responseTime}s</span>
                                <span class="stat-label">Response Time</span>
                            </div>
                        </div>
                        <div class="stat-card gradient-pink">
                            <div class="stat-icon">🔢</div>
                            <div class="stat-content">
                                <span class="stat-value">${searchInfo.total_results ? (searchInfo.total_results / 1000000).toFixed(1) + 'M' : 'N/A'}</span>
                                <span class="stat-label">Total Results</span>
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

                    <!-- Tab Navigation -->
                    <div class="card" style="margin-bottom: 24px;">
                        <div style="display: flex; border-bottom: 1px solid var(--glass-border); flex-wrap: wrap;">
                            <button class="serp-tab active" data-tab="results" style="flex: 1; min-width: 100px; padding: 16px; background: none; border: none; color: var(--text-primary); cursor: pointer; font-weight: 600; border-bottom: 2px solid var(--theme-accent);">
                                🔗 Results
                            </button>
                            <button class="serp-tab" data-tab="preview" style="flex: 1; min-width: 100px; padding: 16px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-weight: 600; border-bottom: 2px solid transparent;">
                                🖼️ SERP Preview
                            </button>
                            <button class="serp-tab" data-tab="json" style="flex: 1; min-width: 100px; padding: 16px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-weight: 600; border-bottom: 2px solid transparent;">
                                📄 JSON
                            </button>
                            <button class="serp-tab" data-tab="request" style="flex: 1; min-width: 100px; padding: 16px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-weight: 600; border-bottom: 2px solid transparent;">
                                🛠️ Request
                            </button>
                        </div>

                        <!-- Results Tab -->
                        <div class="serp-tab-content" data-content="results" style="padding: 16px;">
                            ${aiOverview ? `
                                <div style="padding: 16px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1)); border-radius: var(--radius-md); margin-bottom: 16px; border: 1px solid var(--glass-border);">
                                    <h4 style="margin-bottom: 8px; color: var(--text-primary);">🤖 AI Overview</h4>
                                    <p style="color: var(--text-secondary); font-size: 0.9rem;">${aiOverview.text || aiOverview.answer || 'AI overview available in response'}</p>
                                </div>
                            ` : ''}
                            
                            ${organicResults.map((r, i) => `
                                <div class="ticket-item" style="cursor: pointer;" onclick="window.open('${r.link}', '_blank')">
                                    <div style="width: 40px; height: 40px; background: var(--gradient-hero); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">${r.position || i + 1}</div>
                                    <div class="ticket-content" style="flex: 1; min-width: 0;">
                                        <span class="ticket-title" style="color: var(--accent-blue); font-weight: 600;">${r.title}</span>
                                        <span style="font-size: 0.75rem; color: var(--accent-green); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${r.link}</span>
                                        <span class="ticket-meta" style="display: block; margin-top: 4px;">${r.snippet || ''}</span>
                                    </div>
                                </div>
                            `).join('')}
                            
                            ${organicResults.length === 0 ? `
                                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                    <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
                                    <p>No organic results found. Check the JSON tab for full response.</p>
                                </div>
                            ` : ''}
                        </div>

                        <!-- SERP Preview Tab (Google-style) -->
                        <div class="serp-tab-content" data-content="preview" style="display: none; padding: 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-tertiary); border-bottom: 1px solid var(--glass-border);">
                                <span style="color: var(--text-secondary); font-size: 0.85rem;">Google SERP Preview</span>
                                <div style="display: flex; gap: 8px;">
                                    <button id="screenshotBtn" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.85rem;">
                                        📸 Screenshot
                                    </button>
                                    <button id="openGoogleBtn" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.85rem;">
                                        🔗 Open in Google
                                    </button>
                                </div>
                            </div>
                            <div id="serpPreviewContainer" style="background: #ffffff; padding: 20px; max-height: 600px; overflow-y: auto;">
                                <!-- Google-style SERP -->
                                <div style="max-width: 652px; font-family: Arial, sans-serif;">
                                    <!-- Search box -->
                                    <div style="margin-bottom: 20px; padding: 12px 16px; border: 1px solid #dfe1e5; border-radius: 24px; display: flex; align-items: center; gap: 12px;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                        <span style="color: #202124; font-size: 16px;">${query}</span>
                                    </div>
                                    
                                    <!-- Results count -->
                                    <div style="color: #70757a; font-size: 14px; margin-bottom: 20px;">
                                        About ${searchInfo.total_results?.toLocaleString() || 'N/A'} results (${responseTime} seconds)
                                    </div>

                                    ${ads.length > 0 ? `
                                        <!-- Ads -->
                                        ${ads.slice(0, 2).map(ad => `
                                            <div style="margin-bottom: 24px;">
                                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                                    <span style="font-size: 12px; color: #202124; background: #f1f3f4; padding: 2px 6px; border-radius: 4px; font-weight: 500;">Ad</span>
                                                    <span style="color: #202124; font-size: 14px;">${ad.displayed_link || ad.link}</span>
                                                </div>
                                                <a href="#" style="color: #1a0dab; font-size: 20px; text-decoration: none; display: block; margin-bottom: 4px;">${ad.title}</a>
                                                <p style="color: #4d5156; font-size: 14px; line-height: 1.58; margin: 0;">${ad.description || ad.snippet || ''}</p>
                                            </div>
                                        `).join('')}
                                    ` : ''}

                                    ${knowledgeGraph ? `
                                        <!-- Knowledge Panel hint -->
                                        <div style="float: right; width: 300px; margin-left: 20px; padding: 16px; border: 1px solid #dfe1e5; border-radius: 8px; margin-bottom: 20px;">
                                            <h3 style="color: #202124; font-size: 20px; margin: 0 0 8px 0;">${knowledgeGraph.title || query}</h3>
                                            <p style="color: #4d5156; font-size: 14px; margin: 0;">${knowledgeGraph.description || 'Knowledge panel available'}</p>
                                        </div>
                                    ` : ''}

                                    <!-- Organic Results -->
                                    ${organicResults.map(r => `
                                        <div style="margin-bottom: 24px; clear: ${knowledgeGraph ? 'none' : 'both'};">
                                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
                                                <img src="https://www.google.com/s2/favicons?domain=${new URL(r.link).hostname}&sz=32" 
                                                     style="width: 28px; height: 28px; border-radius: 50%;" 
                                                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2228%22 height=%2228%22><circle cx=%2214%22 cy=%2214%22 r=%2214%22 fill=%22%234285f4%22/></svg>'">
                                                <div>
                                                    <div style="color: #202124; font-size: 14px;">${r.displayed_link || new URL(r.link).hostname}</div>
                                                    <div style="color: #4d5156; font-size: 12px;">${r.link}</div>
                                                </div>
                                            </div>
                                            <a href="${r.link}" target="_blank" style="color: #1a0dab; font-size: 20px; text-decoration: none; display: block; margin-bottom: 4px;">${r.title}</a>
                                            <p style="color: #4d5156; font-size: 14px; line-height: 1.58; margin: 0;">${r.snippet || ''}</p>
                                        </div>
                                    `).join('')}

                                    ${relatedSearches.length > 0 ? `
                                        <!-- Related Searches -->
                                        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #dfe1e5;">
                                            <h4 style="color: #202124; font-size: 18px; margin-bottom: 16px;">Related searches</h4>
                                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                                ${relatedSearches.slice(0, 8).map(rs => `
                                                    <span style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f8f9fa; border-radius: 100px; color: #1a0dab; font-size: 14px;">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                                        ${rs.query || rs}
                                                    </span>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>

                        <!-- JSON Tab -->
                        <div class="serp-tab-content" data-content="json" style="display: none; padding: 16px;">
                            <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
                                <button id="copyJsonBtn" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.85rem;">
                                    📋 Copy JSON
                                </button>
                            </div>
                            <pre id="jsonOutput" style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); overflow: auto; max-height: 500px; font-size: 0.8rem; color: var(--text-secondary); white-space: pre-wrap; word-wrap: break-word;"></pre>
                        </div>

                        <!-- Request Tab -->
                        <div class="serp-tab-content" data-content="request" style="display: none; padding: 16px;">
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 8px;">API Endpoint</label>
                                <input type="text" id="requestEndpoint" value="${lastRequest.fullUrl}" 
                                       style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: var(--radius-md); color: var(--text-primary); font-family: monospace; font-size: 0.85rem;">
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 8px;">Request Parameters (Editable JSON)</label>
                                <textarea id="requestParams" rows="8" 
                                          style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: var(--radius-md); color: var(--text-primary); font-family: monospace; font-size: 0.85rem; resize: vertical;"></textarea>
                            </div>
                            
                            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                <button id="reExecuteBtn" class="btn btn-primary">
                                    🚀 Re-Execute Request
                                </button>
                                <button id="copyRequestBtn" class="btn btn-secondary">
                                    📋 Copy as cURL
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                // Initialize JSON viewer
                const jsonOutput = document.getElementById('jsonOutput');
                jsonOutput.textContent = JSON.stringify(data, null, 2);

                // Initialize request params
                const requestParams = document.getElementById('requestParams');
                requestParams.value = JSON.stringify(lastRequest.params, null, 2);

                // Screenshot functionality - opens editor with annotation tools
                document.getElementById('screenshotBtn')?.addEventListener('click', async () => {
                    const previewEl = document.getElementById('serpPreviewContainer');

                    // Store original scroll position and scroll to top
                    const originalScrollTop = previewEl.scrollTop;
                    previewEl.scrollTop = 0;

                    // Store original styles and expand for full-page capture
                    const originalMaxHeight = previewEl.style.maxHeight;
                    const originalOverflow = previewEl.style.overflowY;
                    previewEl.style.maxHeight = 'none';
                    previewEl.style.overflowY = 'visible';

                    // Also expand the parent wrapper
                    const wrapper = previewEl.parentElement;
                    const wrapperMaxHeight = wrapper?.style.maxHeight;
                    if (wrapper) {
                        wrapper.style.maxHeight = 'none';
                        wrapper.style.overflow = 'visible';
                    }

                    // Small delay to let DOM reflow
                    await new Promise(r => setTimeout(r, 100));

                    window.app.showToast('📸 Capturing full page...');

                    if (window.screenshotEditor) {
                        await window.screenshotEditor.capture(
                            previewEl,
                            `serp-${query.replace(/\s+/g, '-')}`
                        );
                    } else {
                        window.app.showToast('❌ Screenshot editor not loaded');
                    }

                    // Restore original styles and scroll position
                    previewEl.style.maxHeight = originalMaxHeight;
                    previewEl.style.overflowY = originalOverflow;
                    previewEl.scrollTop = originalScrollTop;
                    if (wrapper) wrapper.style.maxHeight = wrapperMaxHeight || '';
                });

                // Open in Google button
                document.getElementById('openGoogleBtn')?.addEventListener('click', () => {
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                });

                // Tab switching
                document.querySelectorAll('.serp-tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        // Update tab styles
                        document.querySelectorAll('.serp-tab').forEach(t => {
                            t.style.color = 'var(--text-muted)';
                            t.style.borderBottom = '2px solid transparent';
                        });
                        tab.style.color = 'var(--text-primary)';
                        tab.style.borderBottom = '2px solid var(--theme-accent)';

                        // Show correct content
                        document.querySelectorAll('.serp-tab-content').forEach(c => c.style.display = 'none');
                        document.querySelector(`[data-content="${tab.dataset.tab}"]`).style.display = 'block';
                    });
                });

                // Copy JSON button
                document.getElementById('copyJsonBtn')?.addEventListener('click', () => {
                    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                    window.app.showToast('📋 JSON copied to clipboard!');
                });

                // Copy as cURL button
                document.getElementById('copyRequestBtn')?.addEventListener('click', () => {
                    const curl = `curl -X GET "${window.location.origin}${lastRequest.fullUrl}"`;
                    navigator.clipboard.writeText(curl);
                    window.app.showToast('📋 cURL command copied!');
                });

                // Re-execute button
                document.getElementById('reExecuteBtn')?.addEventListener('click', () => {
                    try {
                        const params = JSON.parse(requestParams.value);
                        queryInput.value = params.q || '';
                        document.getElementById('serpLocation').value = params.location || 'United States';
                        document.getElementById('serpDevice').value = params.device || 'desktop';
                        document.getElementById('serpNum').value = params.num || 10;
                        searchBtn.click();
                    } catch (e) {
                        window.app.showToast('❌ Invalid JSON in request params');
                    }
                });

                window.app.showToast(`✅ Found ${organicResults.length} results for "${query}"`);

            } catch (err) {
                resultsContainer.innerHTML = `
                    <div class="card">
                        <div style="padding: 40px; text-align: center;">
                            <div style="font-size: 3rem;">❌</div>
                            <h3 style="color: var(--accent-red); margin: 16px 0;">Request Failed</h3>
                            <p style="color: var(--text-secondary);">${err.message}</p>
                        </div>
                    </div>
                `;
                window.app.showToast('❌ API request failed');
            }
        });

        // Focus input on load
        queryInput?.focus();
    }
});

console.log('✅ SERP Search component loaded (Live API with Preview)');
