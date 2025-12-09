/**
 * CS-AI ASIN Hunter - Background Service Worker
 */

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openOptions') {
        chrome.runtime.openOptionsPage();
    }

    if (message.action === 'openCSAI') {
        chrome.storage.sync.get(['csAiUrl'], (result) => {
            const baseUrl = result.csAiUrl || 'http://localhost:3000';
            const url = `${baseUrl}/#${message.page}?asin=${message.asin}&marketplace=${message.marketplace}`;
            chrome.tabs.create({ url });
        });
    }

    return true;
});

// Context menu for ASIN lookup
chrome.runtime.onInstalled.addListener(() => {
    // Create context menu items
    chrome.contextMenus.create({
        id: 'csai-lookup-asin',
        title: '🔍 Look up ASIN in CS-AI',
        contexts: ['selection']
    });

    chrome.contextMenus.create({
        id: 'csai-dominator',
        title: '⚡ Open in Buy Box Dominator',
        contexts: ['selection']
    });

    chrome.contextMenus.create({
        id: 'csai-track-price',
        title: '💰 Track Price',
        contexts: ['selection']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const selectedText = info.selectionText?.trim().toUpperCase();

    // Validate ASIN format
    if (!selectedText || !/^[A-Z0-9]{10}$/.test(selectedText)) {
        return;
    }

    chrome.storage.sync.get(['csAiUrl'], (result) => {
        const baseUrl = result.csAiUrl || 'http://localhost:3000';
        let page = 'product-lookup';

        if (info.menuItemId === 'csai-dominator') {
            page = 'buybox-dominator';
        } else if (info.menuItemId === 'csai-track-price') {
            page = 'pricing';
        }

        // Get marketplace from current tab URL
        let marketplace = 'amazon.com';
        if (tab.url) {
            if (tab.url.includes('amazon.co.uk')) marketplace = 'amazon.co.uk';
            else if (tab.url.includes('amazon.de')) marketplace = 'amazon.de';
            else if (tab.url.includes('amazon.ca')) marketplace = 'amazon.ca';
        }

        const url = `${baseUrl}/#${page}?asin=${selectedText}&marketplace=${marketplace}`;
        chrome.tabs.create({ url });
    });
});

// Handle extension icon click on non-Amazon pages
chrome.action.onClicked.addListener((tab) => {
    // This won't fire if popup is set, but keeping for future use
    chrome.storage.sync.get(['csAiUrl'], (result) => {
        const baseUrl = result.csAiUrl || 'http://localhost:3000';
        chrome.tabs.create({ url: baseUrl });
    });
});

console.log('CS-AI ASIN Hunter service worker initialized');
