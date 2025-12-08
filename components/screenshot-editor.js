/**
 * Screenshot Editor - Lightweight Annotation Tool
 * Team: Humans in the Loop
 * 
 * Features:
 * - Capture HTML elements as screenshots
 * - Draw arrows, boxes, and text
 * - Copy to clipboard
 * - Save as PNG
 */

class ScreenshotEditor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentTool = 'arrow';
        this.currentColor = '#ef4444';
        this.startX = 0;
        this.startY = 0;
        this.history = [];
        this.baseImage = null;
        this.modal = null;
    }

    // Capture an element and open the editor
    async capture(element, filename = 'screenshot') {
        try {
            // Use html2canvas to capture
            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: true
            });

            this.baseImage = canvas;
            this.filename = filename;
            this.openEditor(canvas);

        } catch (err) {
            console.error('Screenshot capture failed:', err);
            window.app?.showToast?.('❌ Screenshot capture failed');
        }
    }

    // Open the editor modal
    openEditor(sourceCanvas) {
        // Create modal
        this.modal = document.createElement('div');
        this.modal.id = 'screenshotEditorModal';
        this.modal.innerHTML = `
            <div class="ss-editor-backdrop"></div>
            <div class="ss-editor-container">
                <div class="ss-editor-header">
                    <h3>📸 Screenshot Editor</h3>
                    <button class="ss-close-btn">&times;</button>
                </div>
                
                <div class="ss-editor-toolbar">
                    <div class="ss-tool-group">
                        <button class="ss-tool-btn active" data-tool="arrow" title="Arrow">➤</button>
                        <button class="ss-tool-btn" data-tool="rect" title="Rectangle">▢</button>
                        <button class="ss-tool-btn" data-tool="circle" title="Circle">○</button>
                        <button class="ss-tool-btn" data-tool="text" title="Text">T</button>
                        <button class="ss-tool-btn" data-tool="freehand" title="Freehand">✎</button>
                    </div>
                    <div class="ss-tool-group">
                        <input type="color" class="ss-color-picker" value="#ef4444" title="Color">
                        <select class="ss-stroke-width">
                            <option value="2">Thin</option>
                            <option value="4" selected>Medium</option>
                            <option value="6">Thick</option>
                        </select>
                    </div>
                    <div class="ss-tool-group">
                        <button class="ss-action-btn" id="ssUndo" title="Undo">↩️ Undo</button>
                        <button class="ss-action-btn" id="ssClear" title="Clear">🗑️ Clear</button>
                    </div>
                </div>
                
                <div class="ss-editor-canvas-wrapper">
                    <canvas id="ssEditorCanvas"></canvas>
                </div>
                
                <div class="ss-editor-footer">
                    <button class="btn btn-secondary" id="ssCopyBtn">📋 Copy to Clipboard</button>
                    <button class="btn btn-primary" id="ssSaveBtn">💾 Save PNG</button>
                </div>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.id = 'ssEditorStyles';
        styles.textContent = `
            #screenshotEditorModal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .ss-editor-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
            }
            .ss-editor-container {
                position: relative;
                background: var(--bg-secondary, #1a1a2e);
                border-radius: 16px;
                max-width: 95vw;
                max-height: 95vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                border: 1px solid var(--glass-border, rgba(255,255,255,0.1));
            }
            .ss-editor-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid var(--glass-border, rgba(255,255,255,0.1));
            }
            .ss-editor-header h3 {
                margin: 0;
                color: var(--text-primary, #fff);
            }
            .ss-close-btn {
                background: none;
                border: none;
                color: var(--text-muted, #888);
                font-size: 24px;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
            }
            .ss-close-btn:hover {
                background: rgba(255,255,255,0.1);
                color: var(--text-primary, #fff);
            }
            .ss-editor-toolbar {
                display: flex;
                gap: 16px;
                padding: 12px 20px;
                border-bottom: 1px solid var(--glass-border, rgba(255,255,255,0.1));
                flex-wrap: wrap;
                align-items: center;
            }
            .ss-tool-group {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            .ss-tool-btn {
                width: 40px;
                height: 40px;
                border: 1px solid var(--glass-border, rgba(255,255,255,0.2));
                background: var(--glass-bg, rgba(255,255,255,0.05));
                border-radius: 8px;
                color: var(--text-secondary, #aaa);
                font-size: 18px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .ss-tool-btn:hover, .ss-tool-btn.active {
                background: var(--theme-accent, #8b5cf6);
                color: white;
                border-color: var(--theme-accent, #8b5cf6);
            }
            .ss-color-picker {
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                padding: 2px;
            }
            .ss-stroke-width {
                padding: 8px 12px;
                background: var(--glass-bg, rgba(255,255,255,0.05));
                border: 1px solid var(--glass-border, rgba(255,255,255,0.2));
                border-radius: 8px;
                color: var(--text-primary, #fff);
            }
            .ss-action-btn {
                padding: 8px 16px;
                background: var(--glass-bg, rgba(255,255,255,0.05));
                border: 1px solid var(--glass-border, rgba(255,255,255,0.2));
                border-radius: 8px;
                color: var(--text-secondary, #aaa);
                cursor: pointer;
                font-size: 14px;
            }
            .ss-action-btn:hover {
                background: rgba(255,255,255,0.1);
                color: var(--text-primary, #fff);
            }
            .ss-editor-canvas-wrapper {
                flex: 1;
                overflow: auto;
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 300px;
                max-height: 60vh;
            }
            #ssEditorCanvas {
                border: 1px solid var(--glass-border, rgba(255,255,255,0.2));
                border-radius: 8px;
                cursor: crosshair;
                max-width: 100%;
                max-height: 100%;
            }
            .ss-editor-footer {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding: 16px 20px;
                border-top: 1px solid var(--glass-border, rgba(255,255,255,0.1));
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(this.modal);

        // Setup canvas
        this.canvas = document.getElementById('ssEditorCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size to match source
        this.canvas.width = sourceCanvas.width;
        this.canvas.height = sourceCanvas.height;

        // Draw the base image
        this.ctx.drawImage(sourceCanvas, 0, 0);
        this.history = [];
        this.saveState();

        // Bind events
        this.bindEvents();
    }

    saveState() {
        this.history.push(this.canvas.toDataURL());
        if (this.history.length > 20) this.history.shift();
    }

    undo() {
        if (this.history.length > 1) {
            this.history.pop();
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = this.history[this.history.length - 1];
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.baseImage, 0, 0);
        this.history = [];
        this.saveState();
    }

    bindEvents() {
        // Close button
        this.modal.querySelector('.ss-close-btn').addEventListener('click', () => this.close());
        this.modal.querySelector('.ss-editor-backdrop').addEventListener('click', () => this.close());

        // Tool selection
        this.modal.querySelectorAll('.ss-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.modal.querySelectorAll('.ss-tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });

        // Color picker
        this.modal.querySelector('.ss-color-picker').addEventListener('change', (e) => {
            this.currentColor = e.target.value;
        });

        // Stroke width
        this.strokeWidth = 4;
        this.modal.querySelector('.ss-stroke-width').addEventListener('change', (e) => {
            this.strokeWidth = parseInt(e.target.value);
        });

        // Undo/Clear
        document.getElementById('ssUndo').addEventListener('click', () => this.undo());
        document.getElementById('ssClear').addEventListener('click', () => this.clear());

        // Canvas drawing - scale coordinates for high DPI
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.isDrawing = true;
            this.startX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.startY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

            if (this.currentTool === 'text') {
                const text = prompt('Enter text:');
                if (text) {
                    this.ctx.font = `bold ${24 * (this.canvas.width / rect.width)}px Arial`;
                    this.ctx.fillStyle = this.currentColor;
                    this.ctx.fillText(text, this.startX, this.startY);
                    this.saveState();
                }
                this.isDrawing = false;
            }

            if (this.currentTool === 'freehand') {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.strokeStyle = this.currentColor;
                this.ctx.lineWidth = this.strokeWidth * (this.canvas.width / rect.width);
                this.ctx.lineCap = 'round';
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDrawing) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

            if (this.currentTool === 'freehand') {
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.isDrawing) return;
            this.isDrawing = false;

            const rect = this.canvas.getBoundingClientRect();
            const endX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const endY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            const scale = this.canvas.width / rect.width;

            this.ctx.strokeStyle = this.currentColor;
            this.ctx.fillStyle = this.currentColor;
            this.ctx.lineWidth = this.strokeWidth * scale;

            switch (this.currentTool) {
                case 'arrow':
                    this.drawArrow(this.startX, this.startY, endX, endY, scale);
                    break;
                case 'rect':
                    this.ctx.strokeRect(this.startX, this.startY, endX - this.startX, endY - this.startY);
                    break;
                case 'circle':
                    const radiusX = Math.abs(endX - this.startX) / 2;
                    const radiusY = Math.abs(endY - this.startY) / 2;
                    const centerX = this.startX + (endX - this.startX) / 2;
                    const centerY = this.startY + (endY - this.startY) / 2;
                    this.ctx.beginPath();
                    this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                    this.ctx.stroke();
                    break;
                case 'freehand':
                    this.ctx.closePath();
                    break;
            }

            if (this.currentTool !== 'text') {
                this.saveState();
            }
        });

        // Copy button
        document.getElementById('ssCopyBtn').addEventListener('click', async () => {
            try {
                const blob = await new Promise(resolve => this.canvas.toBlob(resolve, 'image/png'));
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                window.app?.showToast?.('📋 Copied to clipboard!');
            } catch (err) {
                // Fallback for browsers that don't support clipboard API
                window.app?.showToast?.('❌ Copy failed - try Save instead');
            }
        });

        // Save button
        document.getElementById('ssSaveBtn').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = `${this.filename}-${Date.now()}.png`;
            link.href = this.canvas.toDataURL('image/png');
            link.click();
            window.app?.showToast?.('💾 Screenshot saved!');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeydown = (e) => {
            if (e.key === 'Escape') this.close();
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
        });
    }

    drawArrow(fromX, fromY, toX, toY, scale) {
        const headLen = 20 * scale;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        // Line
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();

        // Arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
        this.ctx.closePath();
        this.ctx.fill();
    }

    close() {
        document.removeEventListener('keydown', this.handleKeydown);
        document.getElementById('ssEditorStyles')?.remove();
        this.modal?.remove();
        this.modal = null;
        this.canvas = null;
        this.ctx = null;
    }
}

// Global instance
window.screenshotEditor = new ScreenshotEditor();

console.log('✅ Screenshot Editor loaded');
