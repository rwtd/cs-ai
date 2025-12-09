/**
 * CS-AI Command Center - Backend Server
 * Team: Humans in the Loop
 * 
 * This server:
 * 1. Serves static files (frontend)
 * 2. Proxies API calls to SerpWow & Rainforest (keeps keys secure)
 * 3. Ready for Railway deployment
 */

require('dotenv').config();
const express = require('express');
const basicAuth = require('express-basic-auth');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Basic Auth Configuration
// ============================================
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'C5-@I-hackathon';

const authMiddleware = basicAuth({
    users: {
        'richie': AUTH_PASSWORD,
        'nova': AUTH_PASSWORD,
        'bhushan': AUTH_PASSWORD
    },
    challenge: true,
    realm: 'CS-AI Command Center - Humans in the Loop'
});

// Middleware
app.use(cors());
app.use(express.json());

// Apply basic auth to all routes
app.use(authMiddleware);

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));

// ============================================
// API Status Endpoint
// ============================================
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        team: 'Humans in the Loop',
        members: ['Richie Waugh', 'Nova Recla', 'Bhushan Dasari'],
        apis: {
            serpwow: !!process.env.SERPWOW_API_KEY,
            rainforest: !!process.env.RAINFOREST_API_KEY
        },
        timestamp: new Date().toISOString()
    });
});

// ============================================
// SerpWow API Proxy
// ============================================
app.get('/api/serpwow/search', async (req, res) => {
    // Try env var first, then client-provided header
    const apiKey = process.env.SERPWOW_API_KEY || req.headers['x-serpwow-key'];

    if (!apiKey) {
        return res.status(503).json({
            error: 'SerpWow API key not configured',
            hint: 'Set your API key in Settings → API Keys, or set SERPWOW_API_KEY environment variable'
        });
    }

    const { q, location, device, num, search_type, engine, google_domain, hl, gl, time_period, safe, page, include_html } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Missing query parameter: q' });
    }

    try {
        const params = new URLSearchParams({
            api_key: apiKey,
            q: q,
            engine: engine || 'google',
            location: location || 'United States',
            device: device || 'desktop',
            num: num || '10'
        });

        // Add optional params
        if (search_type && search_type !== 'search') params.append('search_type', search_type);
        if (google_domain) params.append('google_domain', google_domain);
        if (hl) params.append('hl', hl);
        if (gl) params.append('gl', gl);
        if (time_period) params.append('time_period', time_period);
        if (safe) params.append('safe', safe);
        if (page && page !== '1') params.append('page', page);
        if (include_html === 'true') params.append('include_html', 'true');

        const response = await fetch(`https://api.serpwow.com/search?${params}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('SerpWow API error:', error);
        res.status(500).json({ error: 'Failed to fetch from SerpWow API' });
    }
});

// ============================================
// Rainforest API Proxy - Product Lookup
// ============================================
app.get('/api/rainforest/product', async (req, res) => {
    const apiKey = process.env.RAINFOREST_API_KEY;

    if (!apiKey) {
        return res.status(503).json({
            error: 'Rainforest API key not configured',
            hint: 'Set RAINFOREST_API_KEY environment variable in Railway'
        });
    }

    const { asin, amazon_domain } = req.query;

    if (!asin) {
        return res.status(400).json({ error: 'Missing query parameter: asin' });
    }

    try {
        const params = new URLSearchParams({
            api_key: apiKey,
            type: 'product',
            asin: asin,
            amazon_domain: amazon_domain || 'amazon.com'
        });

        const response = await fetch(`https://api.rainforestapi.com/request?${params}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Rainforest API error:', error);
        res.status(500).json({ error: 'Failed to fetch from Rainforest API' });
    }
});

// ============================================
// Rainforest API Proxy - Reviews
// ============================================
app.get('/api/rainforest/reviews', async (req, res) => {
    const apiKey = process.env.RAINFOREST_API_KEY;

    if (!apiKey) {
        return res.status(503).json({
            error: 'Rainforest API key not configured',
            hint: 'Set RAINFOREST_API_KEY environment variable in Railway'
        });
    }

    const { asin, amazon_domain } = req.query;

    if (!asin) {
        return res.status(400).json({ error: 'Missing query parameter: asin' });
    }

    try {
        const params = new URLSearchParams({
            api_key: apiKey,
            type: 'reviews',
            asin: asin,
            amazon_domain: amazon_domain || 'amazon.com'
        });

        const response = await fetch(`https://api.rainforestapi.com/request?${params}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Rainforest API error:', error);
        res.status(500).json({ error: 'Failed to fetch from Rainforest API' });
    }
});

// ============================================
// Rainforest API Proxy - Offers (Buy Box)
// ============================================
app.get('/api/rainforest/offers', async (req, res) => {
    const apiKey = process.env.RAINFOREST_API_KEY;

    if (!apiKey) {
        return res.status(503).json({
            error: 'Rainforest API key not configured',
            hint: 'Set RAINFOREST_API_KEY environment variable in Railway'
        });
    }

    const { asin, amazon_domain } = req.query;

    if (!asin) {
        return res.status(400).json({ error: 'Missing query parameter: asin' });
    }

    try {
        const params = new URLSearchParams({
            api_key: apiKey,
            type: 'offers',
            asin: asin,
            amazon_domain: amazon_domain || 'amazon.com'
        });

        const response = await fetch(`https://api.rainforestapi.com/request?${params}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Rainforest API error:', error);
        res.status(500).json({ error: 'Failed to fetch from Rainforest API' });
    }
});

// ============================================
// Database Services
// ============================================
const { UserService, SearchHistoryService, AsinService, ChatService, BatchService } = require('./db');

// --- Users API ---
app.get('/api/users', (req, res) => {
    try {
        const users = UserService.list();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', (req, res) => {
    try {
        const { email, name, role } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });
        const user = UserService.create(email, name, role);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/:id', (req, res) => {
    try {
        const user = UserService.getById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/:id', (req, res) => {
    try {
        const user = UserService.update(req.params.id, req.body);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/users/:id', (req, res) => {
    try {
        UserService.delete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Password update endpoint
app.put('/api/users/:id/password', (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        // In production, hash the password. For now, store directly in password_hash field
        const user = UserService.update(req.params.id, { password_hash: password });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logout endpoint - clears basic auth by returning 401
app.get('/logout', (req, res) => {
    res.status(401).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Logged Out</title></head>
        <body style="background: #0f0a1f; color: white; font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
                <h1>👋 Logged Out</h1>
                <p>You have been logged out successfully.</p>
                <a href="/" style="color: #a855f7;">← Return to CS-AI</a>
            </div>
        </body>
        </html>
    `);
});

// --- Search History API ---
app.get('/api/search-history', (req, res) => {
    try {
        const history = SearchHistoryService.getRecent(parseInt(req.query.limit) || 50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/search-history', (req, res) => {
    try {
        const { userId, searchType, query, params, responseSummary } = req.body;
        SearchHistoryService.add(userId, searchType, query, params, responseSummary);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Tracked ASINs API ---
app.get('/api/tracked-asins', (req, res) => {
    try {
        const userId = req.query.userId;
        const asins = userId ? AsinService.getByUser(userId) : [];
        res.json(asins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tracked-asins', (req, res) => {
    try {
        const { userId, asin, marketplace, title, notes, targetPrice } = req.body;
        if (!asin) return res.status(400).json({ error: 'ASIN required' });
        AsinService.track(userId, asin, marketplace, title, notes, targetPrice);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tracked-asins/:id', (req, res) => {
    try {
        AsinService.update(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tracked-asins/:id', (req, res) => {
    try {
        AsinService.delete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Price History API ---
app.get('/api/price-history/:asin', (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const history = AsinService.getPriceHistory(req.params.asin, days);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/price-history', (req, res) => {
    try {
        const { asin, marketplace, price, buyboxSeller, buyboxPrice, isBuyboxWinner } = req.body;
        AsinService.recordPrice(asin, marketplace, price, buyboxSeller, buyboxPrice, isBuyboxWinner);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Chat History API (AI Memory) ---
app.get('/api/chat/:sessionId', (req, res) => {
    try {
        const messages = ChatService.getSession(req.params.sessionId);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', (req, res) => {
    try {
        const { userId, sessionId, role, content, context } = req.body;
        ChatService.addMessage(userId, sessionId, role, content, context);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Batch Jobs API ---
app.get('/api/batch', (req, res) => {
    try {
        const userId = req.query.userId;
        const jobs = userId ? BatchService.getByUser(userId) : [];
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/batch/:id', (req, res) => {
    try {
        const job = BatchService.get(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/batch', (req, res) => {
    try {
        const { userId, jobType, inputData } = req.body;
        const id = BatchService.create(userId, jobType, inputData);
        res.json({ id, status: 'pending' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// Catch-all: Serve index.html for SPA routing
// ============================================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
    console.log('🚀 CS-AI Command Center running on port', PORT);
    console.log('👥 Team: Humans in the Loop');
    console.log('📋 Richie Waugh | Nova Recla | Bhushan Dasari');
    console.log('');
    console.log('📡 API Endpoints:');
    console.log('   GET /api/status');
    console.log('   GET /api/serpwow/search?q=query');
    console.log('   GET /api/rainforest/product?asin=B08XYZ');
    console.log('   GET /api/rainforest/offers?asin=B08XYZ');
    console.log('');
    console.log('💾 Database Endpoints:');
    console.log('   GET/POST /api/users');
    console.log('   GET/POST /api/search-history');
    console.log('   GET/POST /api/tracked-asins');
    console.log('   GET/POST /api/chat');
    console.log('   GET/POST /api/batch');
    console.log('');
    console.log('🔑 API Keys configured:');
    console.log('   SERPWOW_API_KEY:', process.env.SERPWOW_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('   RAINFOREST_API_KEY:', process.env.RAINFOREST_API_KEY ? '✅ Set' : '❌ Not set');
});

