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
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
    const apiKey = process.env.SERPWOW_API_KEY;

    if (!apiKey) {
        return res.status(503).json({
            error: 'SerpWow API key not configured',
            hint: 'Set SERPWOW_API_KEY environment variable in Railway'
        });
    }

    const { q, location, device, num } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Missing query parameter: q' });
    }

    try {
        const params = new URLSearchParams({
            api_key: apiKey,
            q: q,
            engine: 'google',
            location: location || 'United States',
            device: device || 'desktop',
            num: num || '10'
        });

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
    console.log('   GET /api/rainforest/reviews?asin=B08XYZ');
    console.log('   GET /api/rainforest/offers?asin=B08XYZ');
    console.log('');
    console.log('🔑 API Keys configured:');
    console.log('   SERPWOW_API_KEY:', process.env.SERPWOW_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('   RAINFOREST_API_KEY:', process.env.RAINFOREST_API_KEY ? '✅ Set' : '❌ Not set');
});
