/**
 * API Keys Configuration Component
 * Manage API keys for Rainforest, SerpWow, and AI services
 */

ComponentRegistry.register('api-config', {
    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>🔑 API Configuration</h1>
                <p class="page-subtitle">Manage your API keys and service connections</p>
            </div>
        </div>

        <div class="api-config-grid">
            <!-- Rainforest API -->
            <div class="card api-config-card">
                <div class="card-header">
                    <div class="api-header-content">
                        <span class="api-logo">🌧️</span>
                        <div class="api-header-text">
                            <h3>Rainforest API</h3>
                            <span class="api-url">rainforestapi.com</span>
                        </div>
                    </div>
                    <span class="connection-status" id="rainforestStatus">
                        <span class="status-dot"></span>
                        <span class="status-text">Not configured</span>
                    </span>
                </div>
                <div class="api-config-body">
                    <p class="api-desc">Access Amazon product data, Buy Box information, offers, and seller details.</p>
                    <div class="api-input-group">
                        <label for="rainforestKey">API Key</label>
                        <div class="api-input-row">
                            <input type="password" id="rainforestKey" class="api-key-input" 
                                   placeholder="Enter your Rainforest API key">
                            <button class="btn-icon" id="toggleRainforest" title="Show/Hide">👁️</button>
                        </div>
                    </div>
                    <div class="api-actions">
                        <button class="btn btn-primary" id="saveRainforest">💾 Save</button>
                        <button class="btn btn-ghost" id="testRainforest">🔍 Test</button>
                        <a href="https://www.rainforestapi.com/docs" target="_blank" class="btn btn-ghost">📖 Docs</a>
                    </div>
                </div>
            </div>

            <!-- SerpWow API -->
            <div class="card api-config-card">
                <div class="card-header">
                    <div class="api-header-content">
                        <span class="api-logo">🔍</span>
                        <div class="api-header-text">
                            <h3>SerpWow API</h3>
                            <span class="api-url">serpwow.com</span>
                        </div>
                    </div>
                    <span class="connection-status" id="serpwowStatus">
                        <span class="status-dot"></span>
                        <span class="status-text">Not configured</span>
                    </span>
                </div>
                <div class="api-config-body">
                    <p class="api-desc">Google SERP results, AI Overviews, trends, and local search data.</p>
                    <div class="api-input-group">
                        <label for="serpwowKey">API Key</label>
                        <div class="api-input-row">
                            <input type="password" id="serpwowKey" class="api-key-input" 
                                   placeholder="Enter your SerpWow API key">
                            <button class="btn-icon" id="toggleSerpwow" title="Show/Hide">👁️</button>
                        </div>
                    </div>
                    <div class="api-actions">
                        <button class="btn btn-primary" id="saveSerpwow">💾 Save</button>
                        <button class="btn btn-ghost" id="testSerpwow">🔍 Test</button>
                        <a href="https://serpwow.com/docs" target="_blank" class="btn btn-ghost">📖 Docs</a>
                    </div>
                </div>
            </div>

            <!-- Gemini AI -->
            <div class="card api-config-card">
                <div class="card-header">
                    <div class="api-header-content">
                        <span class="api-logo">🤖</span>
                        <div class="api-header-text">
                            <h3>Google Gemini</h3>
                            <span class="api-url">ai.google.dev</span>
                        </div>
                    </div>
                    <span class="connection-status" id="geminiStatus">
                        <span class="status-dot"></span>
                        <span class="status-text">Not configured</span>
                    </span>
                </div>
                <div class="api-config-body">
                    <p class="api-desc">AI-powered analysis and natural language processing for advanced insights.</p>
                    <div class="api-input-group">
                        <label for="geminiKey">API Key</label>
                        <div class="api-input-row">
                            <input type="password" id="geminiKey" class="api-key-input" 
                                   placeholder="Enter your Gemini API key">
                            <button class="btn-icon" id="toggleGemini" title="Show/Hide">👁️</button>
                        </div>
                    </div>
                    <div class="api-input-group">
                        <label for="geminiModel">Model <button class="btn-icon-sm" id="refreshGeminiModels" title="Refresh models from API">🔄</button></label>
                        <select id="geminiModel" class="api-select">
                            <option value="">-- Select or refresh to load models --</option>
                        </select>
                        <span id="geminiModelCount" style="font-size: 0.75rem; color: var(--text-muted);"></span>
                    </div>
                    <div class="api-actions">
                        <button class="btn btn-primary" id="saveGemini">💾 Save</button>
                        <button class="btn btn-ghost" id="testGemini">🔍 Test</button>
                        <a href="https://ai.google.dev/docs" target="_blank" class="btn btn-ghost">📖 Docs</a>
                    </div>
                </div>
            </div>

            <!-- OpenRouter (AI Fallback) -->
            <div class="card api-config-card">
                <div class="card-header">
                    <div class="api-header-content">
                        <span class="api-logo">🔀</span>
                        <div class="api-header-text">
                            <h3>OpenRouter</h3>
                            <span class="api-url">openrouter.ai</span>
                        </div>
                    </div>
                    <span class="connection-status" id="openrouterStatus">
                        <span class="status-dot"></span>
                        <span class="status-text">Not configured</span>
                    </span>
                </div>
                <div class="api-config-body">
                    <p class="api-desc">Access 100+ AI models with one API key. Fallback when Gemini is unavailable.</p>
                    <div class="api-input-group">
                        <label for="openrouterKey">API Key</label>
                        <div class="api-input-row">
                            <input type="password" id="openrouterKey" class="api-key-input" 
                                   placeholder="Enter your OpenRouter API key">
                            <button class="btn-icon" id="toggleOpenrouter" title="Show/Hide">👁️</button>
                        </div>
                    </div>
                    <div class="api-input-group">
                        <label for="openrouterModel">Default Model <button class="btn-icon-sm" id="refreshOpenrouterModels" title="Refresh models from API">🔄</button></label>
                        <select id="openrouterModel" class="api-select">
                            <option value="">-- Refresh to load 400+ models --</option>
                        </select>
                        <span id="openrouterModelCount" style="font-size: 0.75rem; color: var(--text-muted);"></span>
                    </div>
                    <div class="api-actions">
                        <button class="btn btn-primary" id="saveOpenrouter">💾 Save</button>
                        <button class="btn btn-ghost" id="testOpenrouter">🔍 Test</button>
                        <a href="https://openrouter.ai/docs" target="_blank" class="btn btn-ghost">📖 Docs</a>
                    </div>
                </div>
            </div>

            <!-- Amazon SP-API (Future) -->
            <div class="card api-config-card coming-soon">
                <div class="card-header">
                    <div class="api-header-content">
                        <span class="api-logo">📦</span>
                        <div class="api-header-text">
                            <h3>Amazon SP-API</h3>
                            <span class="api-url">sellercentral.amazon.com</span>
                        </div>
                    </div>
                    <span class="connection-status coming">
                        <span class="status-text">Coming Soon</span>
                    </span>
                </div>
                <div class="api-config-body">
                    <p class="api-desc">Direct Seller Central integration for real-time inventory, pricing, and order management.</p>
                    <div class="coming-soon-overlay">
                        <span>🚀 Coming Soon</span>
                        <p>SP-API integration for live price adjustments</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 24px;">
            <div class="card-header">
                <h3>ℹ️ About API Keys</h3>
            </div>
            <div class="api-info-body">
                <div class="info-item">
                    <span class="info-icon">🔒</span>
                    <div class="info-text">
                        <strong>Stored Locally</strong>
                        <p>API keys are stored in your browser's localStorage. They never leave your device.</p>
                    </div>
                </div>
                <div class="info-item">
                    <span class="info-icon">🎮</span>
                    <div class="info-text">
                        <strong>Demo Mode</strong>
                        <p>Without API keys, tools run in demo mode with simulated data.</p>
                    </div>
                </div>
                <div class="info-item">
                    <span class="info-icon">💡</span>
                    <div class="info-text">
                        <strong>Get API Keys</strong>
                        <p>Sign up at each provider's website to get your API keys.</p>
                    </div>
                </div>
            </div>
        </div>
    `,

    init: () => {
        const component = ComponentRegistry.get('api-config');
        component.loadSavedKeys();
        component.bindEvents();
    },

    loadSavedKeys: function () {
        // Load and check Rainforest
        const rainforestKey = localStorage.getItem('rainforest_api_key');
        if (rainforestKey) {
            document.getElementById('rainforestKey').value = '••••••••' + rainforestKey.slice(-4);
            this.updateStatus('rainforestStatus', true);
        }

        // Load and check SerpWow
        const serpwowKey = localStorage.getItem('serpwow_api_key');
        if (serpwowKey) {
            document.getElementById('serpwowKey').value = '••••••••' + serpwowKey.slice(-4);
            this.updateStatus('serpwowStatus', true);
        }

        // Load and check Gemini
        const geminiKey = localStorage.getItem('gemini_api_key');
        if (geminiKey) {
            document.getElementById('geminiKey').value = '••••••••' + geminiKey.slice(-4);
            this.updateStatus('geminiStatus', true);
        }

        // Load Gemini model preference
        const geminiModel = localStorage.getItem('gemini_model');
        if (geminiModel) {
            document.getElementById('geminiModel').value = geminiModel;
        }
    },

    updateStatus: function (elementId, connected) {
        const status = document.getElementById(elementId);
        if (!status) return;

        const dot = status.querySelector('.status-dot');
        const text = status.querySelector('.status-text');

        if (connected) {
            dot.classList.add('connected');
            text.textContent = 'Connected';
            status.classList.add('connected');
        } else {
            dot.classList.remove('connected');
            text.textContent = 'Not configured';
            status.classList.remove('connected');
        }
    },

    bindEvents: function () {
        // Toggle visibility buttons
        this.setupToggle('toggleRainforest', 'rainforestKey');
        this.setupToggle('toggleSerpwow', 'serpwowKey');
        this.setupToggle('toggleGemini', 'geminiKey');

        // Save buttons
        document.getElementById('saveRainforest')?.addEventListener('click', () => {
            this.saveKey('rainforestKey', 'rainforest_api_key', 'rainforestStatus');
        });

        document.getElementById('saveSerpwow')?.addEventListener('click', () => {
            this.saveKey('serpwowKey', 'serpwow_api_key', 'serpwowStatus');
        });

        document.getElementById('saveGemini')?.addEventListener('click', () => {
            this.saveKey('geminiKey', 'gemini_api_key', 'geminiStatus');
            // Also save model preference
            const model = document.getElementById('geminiModel').value;
            localStorage.setItem('gemini_model', model);
        });

        // Test buttons
        document.getElementById('testRainforest')?.addEventListener('click', () => {
            this.testRainforest();
        });

        document.getElementById('testSerpwow')?.addEventListener('click', () => {
            this.testSerpwow();
        });

        document.getElementById('testGemini')?.addEventListener('click', () => {
            this.testGemini();
        });

        // Model refresh buttons
        document.getElementById('refreshGeminiModels')?.addEventListener('click', () => {
            this.loadGeminiModels();
        });

        document.getElementById('refreshOpenrouterModels')?.addEventListener('click', () => {
            this.loadOpenrouterModels();
        });

        // Auto-load models if we have keys
        if (localStorage.getItem('gemini_api_key')) {
            this.loadGeminiModels();
        }
        if (localStorage.getItem('openrouter_api_key')) {
            this.loadOpenrouterModels();
        }
    },

    loadGeminiModels: async function () {
        const apiKey = localStorage.getItem('gemini_api_key');
        const select = document.getElementById('geminiModel');
        const countSpan = document.getElementById('geminiModelCount');

        if (!apiKey) {
            window.app.showToast('⚠️ Enter and save your Gemini API key first');
            return;
        }

        select.innerHTML = '<option value="">🔄 Loading models...</option>';

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            const models = data.models || [];
            const generativeModels = models.filter(m =>
                m.supportedGenerationMethods?.includes('generateContent')
            );

            // Group models by type
            const groups = {
                'gemini-2': [],
                'gemini-1.5': [],
                'gemini-1.0': [],
                'other': []
            };

            generativeModels.forEach(m => {
                const name = m.name.replace('models/', '');
                const displayName = m.displayName || name;

                if (name.includes('gemini-2') || name.includes('2.0')) {
                    groups['gemini-2'].push({ value: name, label: displayName });
                } else if (name.includes('gemini-1.5') || name.includes('1.5')) {
                    groups['gemini-1.5'].push({ value: name, label: displayName });
                } else if (name.includes('gemini-1.0') || name.includes('gemini-pro')) {
                    groups['gemini-1.0'].push({ value: name, label: displayName });
                } else {
                    groups['other'].push({ value: name, label: displayName });
                }
            });

            select.innerHTML = '';

            if (groups['gemini-2'].length) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = '🚀 Gemini 2.x';
                groups['gemini-2'].forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.value;
                    opt.textContent = m.label;
                    optgroup.appendChild(opt);
                });
                select.appendChild(optgroup);
            }

            if (groups['gemini-1.5'].length) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = '⚡ Gemini 1.5';
                groups['gemini-1.5'].forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.value;
                    opt.textContent = m.label;
                    optgroup.appendChild(opt);
                });
                select.appendChild(optgroup);
            }

            if (groups['gemini-1.0'].length) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = '🔬 Gemini 1.0/Pro';
                groups['gemini-1.0'].forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.value;
                    opt.textContent = m.label;
                    optgroup.appendChild(opt);
                });
                select.appendChild(optgroup);
            }

            // Restore saved selection
            const savedModel = localStorage.getItem('gemini_model');
            if (savedModel) select.value = savedModel;

            countSpan.textContent = `${generativeModels.length} models available`;
            window.app.showToast(`✅ Loaded ${generativeModels.length} Gemini models`);

        } catch (error) {
            select.innerHTML = '<option value="">❌ Failed to load</option>';
            countSpan.textContent = error.message;
            window.app.showToast(`❌ ${error.message}`);
        }
    },

    loadOpenrouterModels: async function () {
        const apiKey = localStorage.getItem('openrouter_api_key');
        const select = document.getElementById('openrouterModel');
        const countSpan = document.getElementById('openrouterModelCount');

        select.innerHTML = '<option value="">🔄 Loading models...</option>';

        try {
            const headers = {};
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const response = await fetch('https://openrouter.ai/api/v1/models', { headers });
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || data.error);
            }

            const models = data.data || [];

            // Group by provider
            const groups = {};
            models.forEach(m => {
                const [provider] = m.id.split('/');
                const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
                if (!groups[providerName]) groups[providerName] = [];

                const pricing = m.pricing?.prompt ? `$${(parseFloat(m.pricing.prompt) * 1000000).toFixed(2)}/1M` : '';
                groups[providerName].push({
                    value: m.id,
                    label: `${m.name || m.id}${pricing ? ` (${pricing})` : ''}`
                });
            });

            select.innerHTML = '';

            // Priority providers first
            const priorityProviders = ['Google', 'Anthropic', 'Openai', 'Meta-llama', 'Mistralai', 'Deepseek'];
            const sortedProviders = [
                ...priorityProviders.filter(p => groups[p]),
                ...Object.keys(groups).filter(p => !priorityProviders.includes(p)).sort()
            ];

            sortedProviders.forEach(provider => {
                if (!groups[provider]?.length) return;

                const optgroup = document.createElement('optgroup');
                optgroup.label = provider;
                groups[provider].slice(0, 20).forEach(m => { // Limit per provider
                    const opt = document.createElement('option');
                    opt.value = m.value;
                    opt.textContent = m.label;
                    optgroup.appendChild(opt);
                });
                select.appendChild(optgroup);
            });

            // Restore saved selection
            const savedModel = localStorage.getItem('openrouter_model');
            if (savedModel) select.value = savedModel;

            countSpan.textContent = `${models.length} models available`;
            window.app.showToast(`✅ Loaded ${models.length} OpenRouter models`);

        } catch (error) {
            select.innerHTML = '<option value="">❌ Failed to load</option>';
            countSpan.textContent = error.message;
            window.app.showToast(`❌ ${error.message}`);
        }
    },

    setupToggle: function (btnId, inputId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (!btn || !input) return;

        btn.addEventListener('click', () => {
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        });
    },

    saveKey: function (inputId, storageKey, statusId) {
        const input = document.getElementById(inputId);
        let value = input.value.trim();

        // Don't save if it's the masked value
        if (value.startsWith('••••')) {
            window.app.showToast('ℹ️ Key already saved. Enter a new key to update.');
            return;
        }

        if (!value) {
            // Clear the key
            localStorage.removeItem(storageKey);
            this.updateStatus(statusId, false);
            window.app.showToast('🗑️ API key removed');

            // Update global instance if Rainforest
            if (storageKey === 'rainforest_api_key' && window.rainforestApi) {
                window.rainforestApi.setApiKey(null);
            }
            return;
        }

        // Save the key
        localStorage.setItem(storageKey, value);
        this.updateStatus(statusId, true);

        // Mask the input
        input.value = '••••••••' + value.slice(-4);
        input.type = 'password';

        // Update global instance if Rainforest
        if (storageKey === 'rainforest_api_key' && window.rainforestApi) {
            window.rainforestApi.setApiKey(value);
        }

        // Update AI Engine if Gemini
        if (storageKey === 'gemini_api_key' && window.aiEngine) {
            window.aiEngine.setApiKey(value);
        }

        window.app.showToast('✅ API key saved!');
    },

    testRainforest: async function () {
        const key = localStorage.getItem('rainforest_api_key');
        if (!key) {
            window.app.showToast('⚠️ No Rainforest API key configured');
            return;
        }

        window.app.showToast('🔍 Testing Rainforest API...');

        try {
            const response = await fetch(`https://api.rainforestapi.com/request?api_key=${key}&type=product&asin=B08N5WRWNW&amazon_domain=amazon.com`);
            const data = await response.json();

            if (data.request_info?.success) {
                window.app.showToast('✅ Rainforest API connected successfully!');
                this.updateStatus('rainforestStatus', true);
            } else {
                throw new Error(data.request_info?.message || 'Unknown error');
            }
        } catch (error) {
            window.app.showToast(`❌ Rainforest test failed: ${error.message}`);
            this.updateStatus('rainforestStatus', false);
        }
    },

    testSerpwow: async function () {
        const key = localStorage.getItem('serpwow_api_key');
        if (!key) {
            window.app.showToast('⚠️ No SerpWow API key configured');
            return;
        }

        window.app.showToast('🔍 Testing SerpWow API...');

        try {
            const response = await fetch(`https://api.serpwow.com/live/search?api_key=${key}&q=test&num=1`);
            const data = await response.json();

            if (data.request_info?.success) {
                window.app.showToast('✅ SerpWow API connected successfully!');
                this.updateStatus('serpwowStatus', true);
            } else {
                throw new Error(data.request_info?.message || 'Unknown error');
            }
        } catch (error) {
            window.app.showToast(`❌ SerpWow test failed: ${error.message}`);
            this.updateStatus('serpwowStatus', false);
        }
    },

    testGemini: async function () {
        const key = localStorage.getItem('gemini_api_key');
        if (!key) {
            window.app.showToast('⚠️ No Gemini API key configured');
            return;
        }

        window.app.showToast('🔍 Testing Gemini API...');

        try {
            const model = localStorage.getItem('gemini_model') || 'gemini-2.0-flash';
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'Say "API connected!" in exactly 2 words' }] }]
                })
            });
            const data = await response.json();

            if (data.candidates && data.candidates[0]) {
                window.app.showToast('✅ Gemini API connected successfully!');
                this.updateStatus('geminiStatus', true);
            } else if (data.error) {
                throw new Error(data.error.message);
            } else {
                throw new Error('Unknown response format');
            }
        } catch (error) {
            window.app.showToast(`❌ Gemini test failed: ${error.message}`);
            this.updateStatus('geminiStatus', false);
        }
    },

    testOpenrouter: async function () {
        const key = localStorage.getItem('openrouter_api_key');
        if (!key) {
            window.app.showToast('⚠️ No OpenRouter API key configured');
            return;
        }

        window.app.showToast('🔍 Testing OpenRouter API...');

        try {
            const model = localStorage.getItem('openrouter_model') || 'google/gemini-2.0-flash-exp:free';
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'CS-AI Command Center'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: 'Say "connected" in one word' }],
                    max_tokens: 10
                })
            });
            const data = await response.json();

            if (data.choices && data.choices[0]) {
                window.app.showToast('✅ OpenRouter API connected successfully!');
                this.updateStatus('openrouterStatus', true);
            } else if (data.error) {
                throw new Error(data.error.message);
            } else {
                throw new Error('Unknown response format');
            }
        } catch (error) {
            window.app.showToast(`❌ OpenRouter test failed: ${error.message}`);
            this.updateStatus('openrouterStatus', false);
        }
    }
});

// Add OpenRouter bindings after component loads
(function () {
    const originalInit = ComponentRegistry.get('api-config').init;
    ComponentRegistry.get('api-config').init = function () {
        originalInit.call(this);
        const comp = ComponentRegistry.get('api-config');

        // Load OpenRouter key
        const openrouterKey = localStorage.getItem('openrouter_api_key');
        if (openrouterKey) {
            const input = document.getElementById('openrouterKey');
            if (input) input.value = '••••••••' + openrouterKey.slice(-4);
            comp.updateStatus('openrouterStatus', true);
        }

        // Load OpenRouter model
        const openrouterModel = localStorage.getItem('openrouter_model');
        if (openrouterModel) {
            const select = document.getElementById('openrouterModel');
            if (select) select.value = openrouterModel;
        }

        // Bind OpenRouter events
        comp.setupToggle('toggleOpenrouter', 'openrouterKey');

        document.getElementById('saveOpenrouter')?.addEventListener('click', () => {
            comp.saveKey('openrouterKey', 'openrouter_api_key', 'openrouterStatus');
            const model = document.getElementById('openrouterModel')?.value;
            if (model) localStorage.setItem('openrouter_model', model);
        });

        document.getElementById('testOpenrouter')?.addEventListener('click', () => {
            comp.testOpenrouter();
        });
    };
})();
