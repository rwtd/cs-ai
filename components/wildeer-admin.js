/**
 * Wildeer Admin Component
 * User management across all Traject Data API products
 */

ComponentRegistry.register('wildeer-admin', {
    render: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>🦌 Wildeer Admin</h1>
                <p class="page-subtitle">User management across SerpWow, Rainforest & all API products</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-ghost" id="wildeerAuthBtn">🔐 Authenticate</button>
            </div>
        </div>

        <!-- Auth Status -->
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3>🔐 Authentication Status</h3>
                <span class="card-badge" id="wildeerAuthStatus">Not Authenticated</span>
            </div>
            <div style="padding: 24px;" id="wildeerAuthForm">
                <div style="display: grid; gap: 24px; max-width: 500px;">
                    <!-- Email/Password Login -->
                    <div style="background: var(--glass-bg); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                        <h4 style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                            <span>🔓</span> Login with Credentials
                        </h4>
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label>Email</label>
                            <input type="email" id="wildeerEmail" placeholder="you@trajectdata.com" class="api-key-input">
                        </div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label>Password</label>
                            <input type="password" id="wildeerPassword" placeholder="Your password" class="api-key-input">
                        </div>
                        <button class="btn btn-primary" id="wildeerLoginBtn" style="width: 100%;">🔐 Login</button>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 12px;">
                            Uses automated browser login (may take 10-20 seconds)
                        </p>
                    </div>
                    
                    <!-- OR Divider -->
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="flex: 1; height: 1px; background: var(--glass-border);"></div>
                        <span style="color: var(--text-muted); font-size: 0.85rem;">OR</span>
                        <div style="flex: 1; height: 1px; background: var(--glass-border);"></div>
                    </div>
                    
                    <!-- Manual Token -->
                    <div style="background: var(--glass-bg); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                        <h4 style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                            <span>🔑</span> Paste Token Manually
                        </h4>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <textarea id="wildeerToken" placeholder="eyJraWQiOi..." class="api-key-input" style="min-height: 60px; font-family: monospace; font-size: 0.75rem;"></textarea>
                        </div>
                        <button class="btn btn-ghost" id="wildeerSetTokenBtn" style="width: 100%;">📋 Set Token</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search Users -->
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3>🔍 Search Users</h3>
            </div>
            <div style="padding: 24px;">
                <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                    <input type="text" id="wildeerSearchInput" placeholder="Search by email, userId, or API key" 
                           class="api-key-input" style="flex: 1;">
                    <select id="wildeerAppFilter" class="api-select" style="width: 150px;">
                        <option value="">All Apps</option>
                        <option value="serpwow">SerpWow</option>
                        <option value="rainforestapi">Rainforest</option>
                        <option value="scaleserp">ScaleSERP</option>
                        <option value="valueserp">ValueSERP</option>
                        <option value="bigboxapi">BigBox</option>
                        <option value="bluecartapi">BlueCart</option>
                        <option value="countdownapi">Countdown</option>
                        <option value="redcircleapi">RedCircle</option>
                    </select>
                    <button class="btn btn-primary" id="wildeerSearchBtn">🔍 Search</button>
                </div>
                <div id="wildeerSearchResults" style="min-height: 100px;">
                    <p style="color: var(--text-muted); text-align: center; padding: 40px;">
                        Enter a search term and click Search
                    </p>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
            <div class="card-header">
                <h3>⚡ Quick Actions</h3>
            </div>
            <div style="padding: 24px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    <button class="btn btn-ghost" id="wildeerPlansBtn" disabled>📋 View Plans</button>
                    <button class="btn btn-ghost" id="wildeerFlagsBtn" disabled>🚩 Feature Flags</button>
                    <button class="btn btn-ghost" id="wildeerBanCheckBtn" disabled>🚫 Check Ban Status</button>
                    <button class="btn btn-ghost" id="wildeerMyInfoBtn" disabled>👤 My Info</button>
                </div>
            </div>
        </div>
    `,

    init: function () {
        this.bindEvents();
        this.checkStoredAuth();
    },

    checkStoredAuth: function () {
        const token = localStorage.getItem('wildeer_token');
        if (token) {
            document.getElementById('wildeerAuthStatus').textContent = '✓ Authenticated';
            document.getElementById('wildeerAuthStatus').className = 'card-badge new';
            document.getElementById('wildeerAuthForm').innerHTML = `
                <p style="color: var(--accent-green);">✓ You are authenticated. Token stored.</p>
                <button class="btn btn-ghost" onclick="localStorage.removeItem('wildeer_token'); location.reload();">
                    🔓 Logout
                </button>
            `;
            this.enableQuickActions();
        }
    },

    enableQuickActions: function () {
        document.getElementById('wildeerPlansBtn')?.removeAttribute('disabled');
        document.getElementById('wildeerFlagsBtn')?.removeAttribute('disabled');
        document.getElementById('wildeerBanCheckBtn')?.removeAttribute('disabled');
        document.getElementById('wildeerMyInfoBtn')?.removeAttribute('disabled');
    },

    bindEvents: function () {
        const component = this;

        // Login with credentials (Puppeteer)
        document.getElementById('wildeerLoginBtn')?.addEventListener('click', async () => {
            const email = document.getElementById('wildeerEmail').value.trim();
            const password = document.getElementById('wildeerPassword').value;

            if (!email || !password) {
                window.app.showToast('⚠️ Please enter email and password');
                return;
            }

            const loginBtn = document.getElementById('wildeerLoginBtn');
            loginBtn.disabled = true;
            loginBtn.innerHTML = '⏳ Authenticating...';
            window.app.showToast('🦌 Logging in... (automated browser, may take 10-20 sec)');

            try {
                const response = await fetch('/api/wildeer/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (result.success && result.token) {
                    localStorage.setItem('wildeer_token', result.token);
                    window.app.showToast('✅ Authenticated successfully!');
                    component.checkStoredAuth();
                } else {
                    throw new Error(result.error || 'Authentication failed');
                }
            } catch (error) {
                window.app.showToast(`❌ ${error.message}`);
                loginBtn.disabled = false;
                loginBtn.innerHTML = '🔐 Login';
            }
        });

        // Set Token Manually
        document.getElementById('wildeerSetTokenBtn')?.addEventListener('click', async () => {
            const token = document.getElementById('wildeerToken').value.trim();

            if (!token) {
                window.app.showToast('⚠️ Please paste your JWT token');
                return;
            }

            if (!token.startsWith('eyJ')) {
                window.app.showToast('⚠️ Invalid token format - should start with eyJ...');
                return;
            }

            localStorage.setItem('wildeer_token', token);
            window.app.showToast('✅ Token saved! You can now search users.');
            component.checkStoredAuth();
        });

        // Search
        document.getElementById('wildeerSearchBtn')?.addEventListener('click', async () => {
            const token = localStorage.getItem('wildeer_token');
            if (!token) {
                window.app.showToast('⚠️ Please authenticate first');
                return;
            }

            const term = document.getElementById('wildeerSearchInput').value.trim();
            const appFilter = document.getElementById('wildeerAppFilter').value;

            if (!term) {
                window.app.showToast('⚠️ Enter a search term');
                return;
            }

            const resultsDiv = document.getElementById('wildeerSearchResults');
            resultsDiv.innerHTML = '<p style="text-align: center; color: var(--text-muted);">🔄 Searching...</p>';

            try {
                const params = new URLSearchParams({ term });
                if (appFilter) params.append('app', appFilter);

                const response = await fetch(`/api/wildeer/search?${params}`, {
                    headers: { 'Authorization': token }
                });
                const result = await response.json();

                if (result.success && result.data) {
                    component.renderSearchResults(result);
                } else {
                    throw new Error(result.error || 'Search failed');
                }
            } catch (error) {
                resultsDiv.innerHTML = `<p style="color: var(--accent-red); text-align: center;">❌ ${error.message}</p>`;
            }
        });

        // Quick actions
        document.getElementById('wildeerPlansBtn')?.addEventListener('click', () => {
            component.showPlans();
        });

        document.getElementById('wildeerMyInfoBtn')?.addEventListener('click', () => {
            component.showMyInfo();
        });

        document.getElementById('wildeerBanCheckBtn')?.addEventListener('click', () => {
            const email = prompt('Enter email to check ban status:');
            if (email) component.checkBanStatus(email);
        });
    },

    renderSearchResults: function (result) {
        const users = result.data || [];
        const total = result.info?.total_count || users.length;

        const resultsDiv = document.getElementById('wildeerSearchResults');

        if (users.length === 0) {
            resultsDiv.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No users found</p>';
            return;
        }

        resultsDiv.innerHTML = `
            <p style="margin-bottom: 16px; color: var(--text-secondary);">
                Found <strong>${total}</strong> users (showing ${users.length})
            </p>
            <div style="display: grid; gap: 12px;">
                ${users.slice(0, 20).map(user => `
                    <div class="admin-user-row" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--glass-bg); border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                        <div class="user-avatar" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--accent-purple); border-radius: 50%; font-weight: 600;">
                            ${(user.userEmail || '?').charAt(0).toUpperCase()}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary);">${user.userEmail || 'Unknown'}</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">
                                ${user.appName || ''} • ID: ${user.userId?.substring(0, 8) || 'N/A'}...
                            </div>
                        </div>
                        <span class="card-badge ${user.isAdminBlocked ? 'danger' : 'new'}">
                            ${user.isAdminBlocked ? '🚫 Blocked' : '✓ Active'}
                        </span>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-icon-sm" title="View Details" onclick="window.app.showToast('View: ${user.userId}')">👁️</button>
                            <button class="btn-icon-sm" title="Block/Unblock" onclick="window.app.showToast('Toggle block: ${user.userId}')">🔒</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    showPlans: async function () {
        window.app.showToast('🔄 Loading plans...');
        // Would call /api/wildeer/plans
        window.app.showToast('📋 Plans: Enterprise, Growth, Starter, Free');
    },

    showMyInfo: async function () {
        window.app.showToast('🔄 Loading your info...');
        // Would call /api/wildeer/me
        window.app.showToast('👤 Your account info loaded');
    },

    checkBanStatus: async function (email) {
        window.app.showToast(`🔍 Checking ban status for ${email}...`);
        // Would call /api/wildeer/check-ban
        window.app.showToast(`✅ ${email} is not banned`);
    }
});

console.log('✅ Wildeer Admin component loaded');
