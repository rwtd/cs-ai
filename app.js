/**
 * CS-AI Command Center - Core Framework
 * Team: Humans in the Loop
 * Hackathon: Traject Data Customer Support AI
 * 
 * Authors: Richie Waugh, Nova Recla, Bhushan Dasari
 * 
 * WHAT'S REAL:
 * ✅ Navigation system
 * ✅ Component registry (plug-and-play)
 * ✅ Page routing
 * ✅ Toast notifications
 * ✅ Theme system
 * 
 * NEEDS BUILDING:
 * ⏳ API integrations (SerpWow, Rainforest)
 * ⏳ Actual tools in each slot
 * ⏳ Backend/data persistence
 */

// ============================================
// Navigation Configuration
// ============================================
const NAV_CONFIG = [
    {
        section: 'Overview',
        items: [
            { id: 'dashboard', icon: '🏠', label: 'Home' }
        ]
    },
    {
        section: '🔍 SerpWow Tools',
        items: [
            { id: 'serp-search', icon: '🌐', label: 'SERP Lookup' },
            { id: 'trends', icon: '📰', label: 'Trends & News' }
        ]
    },
    {
        section: '🌧️ Rainforest Tools',
        items: [
            { id: 'product-lookup', icon: '📦', label: 'Product Lookup' },
            { id: 'pricing', icon: '💰', label: 'Price Tracker' },
            { id: 'buybox', icon: '🏆', label: 'Buy Box Monitor' },
            { id: 'buybox-dominator', icon: '⚡', label: 'Dominator Mode', badge: { type: 'new', text: 'NEW' } }
        ]
    },
    {
        section: '⚙️ Settings',
        items: [
            { id: 'api-config', icon: '🔑', label: 'API Keys' },
            { id: 'admin', icon: '🛡️', label: 'Admin Panel' }
        ]
    }
];

// ============================================
// Component Registry - For plug-and-play tools
// ============================================
const ComponentRegistry = {
    components: new Map(),

    register(id, component) {
        this.components.set(id, component);
        console.log(`✅ Component registered: ${id}`);
    },

    get(id) {
        return this.components.get(id);
    },

    getAll() {
        return Array.from(this.components.entries());
    }
};

// ============================================
// Page Content Templates
// ============================================
const PAGE_TEMPLATES = {
    dashboard: () => `
        <div class="page-header">
            <div class="page-title">
                <h1>🏠 Humans in the Loop</h1>
                <p class="page-subtitle">Traject Data Customer Support AI • Hackathon 2025</p>
            </div>
        </div>
        
        <div class="card" style="max-width: 800px; margin-bottom: 24px;">
            <div class="card-header">
                <h3>👥 Team</h3>
            </div>
            <div style="padding: 24px; display: flex; gap: 20px; flex-wrap: wrap;">
                <div class="team-member">🧑‍💻 <strong>Richie Waugh</strong></div>
                <div class="team-member">🧑‍💻 <strong>Nova Recla</strong></div>
                <div class="team-member">🧑‍💻 <strong>Bhushan Dasari</strong></div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3>✅ What's Working</h3>
                <span class="card-badge">Real</span>
            </div>
            <div style="padding: 24px;">
                <ul style="list-style: none; display: grid; gap: 12px;">
                    <li>✅ <strong>Navigation System</strong> - Click sidebar items to switch pages</li>
                    <li>✅ <strong>Component Registry</strong> - Plug-and-play tool system</li>
                    <li>✅ <strong>Page Routing</strong> - Each nav item loads its page</li>
                    <li>✅ <strong>Toast Notifications</strong> - app.showToast('message')</li>
                    <li>✅ <strong>Theme/Design System</strong> - CSS variables, glassmorphism</li>
                    <li>✅ <strong>SERP Lookup Tool</strong> - Example component (click sidebar)</li>
                </ul>
            </div>
        </div>

        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3>🛠️ Tool Slots Available</h3>
                <span class="card-badge">Build These!</span>
            </div>
            <div class="api-grid" style="padding: 24px;">
                <button class="api-action serpwow" data-api="serp-search" onclick="app.navigateTo('serp-search')">
                    <div class="api-icon">🌐</div>
                    <span class="api-name">SERP Lookup</span>
                    <span class="api-desc" style="color: var(--accent-green);">✓ Has Example</span>
                </button>
                <button class="api-action serpwow" data-api="ai-overview" onclick="app.navigateTo('ai-overview')">
                    <div class="api-icon">🤖</div>
                    <span class="api-name">AI Overview</span>
                    <span class="api-desc">Empty Slot</span>
                </button>
                <button class="api-action rainforest" data-api="product-lookup" onclick="app.navigateTo('product-lookup')">
                    <div class="api-icon">📦</div>
                    <span class="api-name">Product Lookup</span>
                    <span class="api-desc">Empty Slot</span>
                </button>
                <button class="api-action rainforest" data-api="reviews" onclick="app.navigateTo('reviews')">
                    <div class="api-icon">⭐</div>
                    <span class="api-name">Reviews</span>
                    <span class="api-desc">Empty Slot</span>
                </button>
                <button class="api-action rainforest" data-api="buybox" onclick="app.navigateTo('buybox')">
                    <div class="api-icon">🏆</div>
                    <span class="api-name">Buy Box</span>
                    <span class="api-desc">Empty Slot</span>
                </button>
                <button class="api-action rainforest" data-api="pricing" onclick="app.navigateTo('pricing')">
                    <div class="api-icon">💰</div>
                    <span class="api-name">Pricing</span>
                    <span class="api-desc">Empty Slot</span>
                </button>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3>📋 How to Add a Tool</h3>
            </div>
            <div style="padding: 24px;">
                <pre style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 0.85rem; color: var(--text-secondary);"><code>// Create: components/my-tool.js

ComponentRegistry.register('product-lookup', {
    render: () => \`
        &lt;div class="page-header"&gt;
            &lt;h1&gt;📦 My Tool&lt;/h1&gt;
        &lt;/div&gt;
        &lt;div class="card"&gt;
            &lt;!-- Your UI here --&gt;
        &lt;/div&gt;
    \`,
    init: () => {
        // Setup event listeners
    }
});

// Then add to index.html:
// &lt;script src="components/my-tool.js"&gt;&lt;/script&gt;</code></pre>
            </div>
        </div>
    `,

    placeholder: (icon, title, desc) => `
        <div class="placeholder-content">
            <div class="placeholder-icon">${icon}</div>
            <h2>${title}</h2>
            <p>Empty slot - ready for your component!</p>
            <span class="placeholder-tag">Use ComponentRegistry.register('${title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}', {...})</span>
        </div>
    `
};

// ============================================
// Application Class
// ============================================
class CSAIApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.renderNav();
        this.navigateTo('dashboard');
        this.bindEvents();
        this.initKeyboardShortcuts();
        console.log('🚀 CS-AI Command Center initialized');
        console.log('👥 Team: Humans in the Loop');
        console.log('📋 Richie Waugh | Nova Recla | Bhushan Dasari');
    }

    renderNav() {
        const navMenu = document.getElementById('navMenu');
        navMenu.innerHTML = NAV_CONFIG.map(section => `
            <div class="nav-section">
                <span class="nav-section-title">${section.section}</span>
                ${section.items.map(item => `
                    <a href="#" class="nav-item ${item.id === this.currentPage ? 'active' : ''}" data-page="${item.id}">
                        <span class="nav-icon">${item.icon}</span>
                        <span class="nav-label">${item.label}</span>
                        ${item.badge ? `<span class="nav-badge ${item.badge.type}">${item.badge.text}</span>` : ''}
                        ${item.count ? `<span class="nav-count">${item.count}</span>` : ''}
                    </a>
                `).join('')}
            </div>
        `).join('');
    }

    navigateTo(pageId) {
        this.currentPage = pageId;
        const contentArea = document.getElementById('contentArea');

        // Check for registered component first
        const component = ComponentRegistry.get(pageId);
        if (component && typeof component.render === 'function') {
            contentArea.innerHTML = `<section class="page active">${component.render()}</section>`;
            if (typeof component.init === 'function') component.init();
        } else if (pageId === 'dashboard') {
            contentArea.innerHTML = `<section class="page active">${PAGE_TEMPLATES.dashboard()}</section>`;
            this.renderDashboardWidgets();
        } else {
            const pageConfig = this.findPageConfig(pageId);
            const icon = pageConfig?.icon || '🔧';
            const label = pageConfig?.label || 'Tool';
            contentArea.innerHTML = `<section class="page active">${PAGE_TEMPLATES.placeholder(icon, label, `Powered by Traject Data APIs`)}</section>`;
        }

        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageId);
        });
    }

    findPageConfig(pageId) {
        for (const section of NAV_CONFIG) {
            const item = section.items.find(i => i.id === pageId);
            if (item) return item;
        }
        return null;
    }

    renderDashboardWidgets() {
        // Dashboard is now self-contained in the template
        // No dynamic widgets needed for the skeleton
    }

    bindEvents() {
        // Navigation clicks
        document.getElementById('navMenu').addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                this.navigateTo(navItem.dataset.page);
            }
        });

        // API action buttons
        document.getElementById('contentArea').addEventListener('click', (e) => {
            const apiAction = e.target.closest('.api-action');
            if (apiAction) {
                this.showToast(`🚀 ${apiAction.dataset.api} - Coming soon!`);
            }
        });

        // Theme toggle - cycles through themes
        const themes = [
            { id: null, name: 'Ethereal Purple', icon: '💜' },
            { id: 'cyber', name: 'Cyber Blue', icon: '💎' },
            { id: 'rose', name: 'Rose Gold', icon: '🌸' },
            { id: 'matrix', name: 'Matrix Green', icon: '🌲' },
            { id: 'light', name: 'Cloud White', icon: '☁️' },
            { id: 'sunrise', name: 'Sunrise', icon: '🌅' }
        ];
        let currentThemeIndex = 0;

        // Load saved theme
        const savedTheme = localStorage.getItem('cs-ai-theme');
        if (savedTheme) {
            const idx = themes.findIndex(t => t.id === savedTheme);
            if (idx !== -1) {
                currentThemeIndex = idx;
                if (themes[idx].id) {
                    document.documentElement.setAttribute('data-theme', themes[idx].id);
                }
            }
        }

        document.getElementById('themeToggle')?.addEventListener('click', () => {
            // Move to next theme
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            const theme = themes[currentThemeIndex];

            // Apply theme
            if (theme.id) {
                document.documentElement.setAttribute('data-theme', theme.id);
            } else {
                document.documentElement.removeAttribute('data-theme');
            }

            // Save preference
            localStorage.setItem('cs-ai-theme', theme.id || '');

            // Show toast with theme info
            this.showToast(`${theme.icon} Theme: ${theme.name}`);
        });

        // ASIN Search Bar functionality
        this.initAsinSearch();
    }

    initAsinSearch() {
        const container = document.getElementById('asinSearchContainer');
        const input = document.getElementById('asinSearchInput');
        const searchBtn = document.getElementById('asinSearchBtn');
        const marketplace = document.getElementById('asinMarketplace');
        const quickActions = document.getElementById('asinQuickActions');

        if (!input || !searchBtn) return;

        // Track current ASIN
        let currentAsin = '';

        // Validate and format ASIN as user types
        input.addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (value.length > 10) value = value.substring(0, 10);
            e.target.value = value;

            // Toggle quick actions visibility
            const isValidAsin = /^[A-Z0-9]{10}$/.test(value);
            if (isValidAsin) {
                container.classList.add('has-asin');
                currentAsin = value;
            } else {
                container.classList.remove('has-asin');
                currentAsin = '';
            }
        });

        // Handle paste - extract ASIN from Amazon URLs
        input.addEventListener('paste', (e) => {
            setTimeout(() => {
                let value = input.value.trim();

                // Check if it's an Amazon URL
                const urlPatterns = [
                    /\/dp\/([A-Z0-9]{10})/i,
                    /\/gp\/product\/([A-Z0-9]{10})/i,
                    /\/product\/([A-Z0-9]{10})/i,
                    /\/ASIN\/([A-Z0-9]{10})/i
                ];

                for (const pattern of urlPatterns) {
                    const match = value.match(pattern);
                    if (match) {
                        input.value = match[1].toUpperCase();
                        input.dispatchEvent(new Event('input'));
                        this.showToast('📦 ASIN extracted from URL!');
                        return;
                    }
                }

                // Just clean up the value
                input.value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
                input.dispatchEvent(new Event('input'));
            }, 0);
        });

        // Enter key to search
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && currentAsin) {
                this.openAsinInTool(currentAsin, marketplace.value, 'buybox-dominator');
            }
        });

        // Main search button - opens Dominator by default
        searchBtn.addEventListener('click', () => {
            if (currentAsin) {
                this.openAsinInTool(currentAsin, marketplace.value, 'buybox-dominator');
            } else {
                this.showToast('⚠️ Please enter a valid 10-character ASIN');
            }
        });

        // Quick action buttons
        quickActions?.addEventListener('click', (e) => {
            const btn = e.target.closest('.asin-quick-btn');
            if (btn && currentAsin) {
                const action = btn.dataset.action;
                const pageMap = {
                    'dominator': 'buybox-dominator',
                    'pricing': 'pricing',
                    'buybox': 'buybox',
                    'product-lookup': 'product-lookup'
                };
                this.openAsinInTool(currentAsin, marketplace.value, pageMap[action] || 'buybox-dominator');
            }
        });
    }

    openAsinInTool(asin, marketplace, toolId) {
        // Store ASIN for the component to pick up
        window.pendingAsin = {
            asin: asin,
            marketplace: marketplace,
            timestamp: Date.now()
        };

        // Also store in localStorage for persistence
        localStorage.setItem('cs-ai-pending-asin', JSON.stringify(window.pendingAsin));

        // Navigate to the tool
        this.navigateTo(toolId);

        // Try to auto-fill the ASIN in the tool after a short delay
        setTimeout(() => {
            this.autoFillAsin(asin, marketplace, toolId);
        }, 100);

        this.showToast(`📦 Opening ${asin} in ${toolId.replace('-', ' ')}`);
    }

    autoFillAsin(asin, marketplace, toolId) {
        // Map tool IDs to their input field IDs
        const inputMap = {
            'buybox-dominator': 'domAsinInput',
            'pricing': 'priceAsinInput',
            'buybox': 'bbAsinInput',
            'product-lookup': 'productAsinInput'
        };

        const marketplaceMap = {
            'buybox-dominator': 'domMarketplace',
            'pricing': 'priceMarketplace',
            'buybox': 'bbMarketplace',
            'product-lookup': 'productMarketplace'
        };

        const inputId = inputMap[toolId];
        const marketplaceId = marketplaceMap[toolId];

        if (inputId) {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = asin;
                input.dispatchEvent(new Event('input'));
            }
        }

        if (marketplaceId) {
            const select = document.getElementById(marketplaceId);
            if (select) {
                select.value = marketplace;
            }
        }

        // For Dominator, auto-analyze
        if (toolId === 'buybox-dominator') {
            const analyzeBtn = document.getElementById('domAnalyzeBtn');
            if (analyzeBtn) {
                setTimeout(() => analyzeBtn.click(), 200);
            }
        }
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('asinSearchInput')?.focus();
            }
        });
    }

    showToast(message, duration = 3000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }
}

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CSAIApp();
    window.ComponentRegistry = ComponentRegistry;
});

// ============================================
// Example Component Registration (for team reference)
// ============================================
/*
ComponentRegistry.register('serp-search', {
    render: () => `
        <div class="page-header">
            <h1>🔍 SERP Search Tool</h1>
        </div>
        <div class="card">
            <div class="card-header"><h3>Search Google Results</h3></div>
            <div style="padding: 24px;">
                <input type="text" placeholder="Enter search query..." style="width: 100%; padding: 12px;">
                <button class="btn btn-primary" style="margin-top: 12px;">Search</button>
            </div>
        </div>
    `,
    init: () => {
        console.log('SERP Search component initialized');
    }
});
*/
