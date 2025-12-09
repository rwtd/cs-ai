/**
 * CS-AI ASIN Hunter - Options Script
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Load saved settings
    const result = await chrome.storage.sync.get(['csAiUrl']);
    if (result.csAiUrl) {
        document.getElementById('csai-url').value = result.csAiUrl;
    }

    // Handle form submission
    document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const csAiUrl = document.getElementById('csai-url').value.trim() || 'http://localhost:3000';

        await chrome.storage.sync.set({ csAiUrl });

        // Show success message
        const successMsg = document.getElementById('success-message');
        successMsg.classList.add('show');
        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 3000);
    });
});
