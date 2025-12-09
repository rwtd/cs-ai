/**
 * Maps & Local Component
 * Google Maps and Local Business Search via SerpWow
 */

ComponentRegistry.register('maps', {
    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>📍 Maps & Local</h1>
                <p class="page-subtitle">Search local businesses and places via SerpWow Maps API</p>
            </div>
            <span class="api-badge" id="mapsApiStatus">Checking API...</span>
        </div>

        <div class="card">
            <div class="card-header">
                <h3>🔍 Local Business Search</h3>
            </div>
            <div style="padding: 24px;">
                <div class="search-row" style="display: flex; gap: 12px; margin-bottom: 20px;">
                    <input type="text" id="mapsQuery" class="search-input" 
                           placeholder="Search for businesses (e.g., 'coffee shops', 'plumbers')" 
                           style="flex: 1;">
                    <input type="text" id="mapsLocation" class="search-input" 
                           placeholder="Location (e.g., 'New York, NY')" 
                           style="width: 250px;">
                    <button class="btn btn-primary" id="mapsSearchBtn">🔍 Search</button>
                </div>
                
                <div class="maps-options" style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
                    <label class="serp-option">
                        <span>Radius:</span>
                        <select id="mapsRadius">
                            <option value="1">1 mile</option>
                            <option value="5" selected>5 miles</option>
                            <option value="10">10 miles</option>
                            <option value="25">25 miles</option>
                            <option value="50">50 miles</option>
                        </select>
                    </label>
                    <label class="serp-option">
                        <span>Results:</span>
                        <select id="mapsNum">
                            <option value="10">10</option>
                            <option value="20" selected>20</option>
                            <option value="50">50</option>
                        </select>
                    </label>
                </div>
            </div>
        </div>

        <div id="mapsResultsContainer"></div>
    `,

    init: function () {
        const searchBtn = document.getElementById('mapsSearchBtn');
        const queryInput = document.getElementById('mapsQuery');
        const locationInput = document.getElementById('mapsLocation');
        const resultsContainer = document.getElementById('mapsResultsContainer');
        const apiStatus = document.getElementById('mapsApiStatus');

        // Check API status
        fetch('/api/status')
            .then(r => r.json())
            .then(data => {
                if (data.apis?.serpwow) {
                    apiStatus.textContent = '✅ API Ready';
                    apiStatus.style.background = 'rgba(16, 185, 129, 0.2)';
                    apiStatus.style.color = 'var(--accent-green)';
                } else {
                    apiStatus.textContent = '⚠️ Configure API Key';
                    apiStatus.style.background = 'rgba(245, 158, 11, 0.2)';
                    apiStatus.style.color = 'var(--accent-amber)';
                }
            });

        // Enter to search
        queryInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchBtn?.click();
        });
        locationInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchBtn?.click();
        });

        // Search button
        searchBtn?.addEventListener('click', async () => {
            const query = queryInput.value.trim();
            const location = locationInput.value.trim();

            if (!query) {
                window.app.showToast('⚠️ Please enter a search query');
                return;
            }

            if (!location) {
                window.app.showToast('⚠️ Please enter a location');
                return;
            }

            const num = document.getElementById('mapsNum').value;

            // Show loading
            resultsContainer.innerHTML = `
                <div class="card">
                    <div style="padding: 60px; text-align: center;">
                        <div style="font-size: 3rem; animation: float 2s ease-in-out infinite;">📍</div>
                        <p style="color: var(--text-secondary); margin-top: 16px;">Searching for "${query}" near "${location}"...</p>
                    </div>
                </div>
            `;

            try {
                const params = new URLSearchParams({
                    q: `${query} near ${location}`,
                    search_type: 'places',
                    num: num
                });

                const response = await fetch(`/api/serpwow/search?${params}`);
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                const places = data.places_results || data.local_results || [];

                if (places.length === 0) {
                    resultsContainer.innerHTML = `
                        <div class="card">
                            <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                                <div style="font-size: 2rem;">🤷</div>
                                <p>No local results found for "${query}" near "${location}"</p>
                            </div>
                        </div>
                    `;
                    return;
                }

                resultsContainer.innerHTML = `
                    <div class="card">
                        <div class="card-header">
                            <h3>📍 ${places.length} Results Found</h3>
                        </div>
                        <div class="maps-results-grid">
                            ${places.map((place, i) => `
                                <div class="maps-result-card">
                                    <div class="maps-result-header">
                                        <span class="maps-result-rank">#${i + 1}</span>
                                        <h4>${place.title || place.name || 'Business'}</h4>
                                    </div>
                                    <div class="maps-result-details">
                                        ${place.rating ? `<span class="maps-rating">⭐ ${place.rating} ${place.reviews ? `(${place.reviews} reviews)` : ''}</span>` : ''}
                                        ${place.type || place.category ? `<span class="maps-type">${place.type || place.category}</span>` : ''}
                                        ${place.address ? `<p class="maps-address">📍 ${place.address}</p>` : ''}
                                        ${place.phone ? `<p class="maps-phone">📞 ${place.phone}</p>` : ''}
                                        ${place.hours ? `<p class="maps-hours">🕐 ${place.hours}</p>` : ''}
                                    </div>
                                    ${place.link ? `<a href="${place.link}" target="_blank" class="btn btn-ghost btn-sm">View on Google Maps →</a>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                window.app.showToast(`✅ Found ${places.length} local results`);

            } catch (error) {
                resultsContainer.innerHTML = `
                    <div class="card">
                        <div style="padding: 40px; text-align: center; color: var(--accent-red);">
                            <div style="font-size: 2rem;">❌</div>
                            <p>Error: ${error.message}</p>
                        </div>
                    </div>
                `;
            }
        });
    }
});

console.log('✅ Maps component loaded');
