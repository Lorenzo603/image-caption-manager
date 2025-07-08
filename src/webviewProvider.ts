import * as vscode from 'vscode';
import * as path from 'path';
import { ImageCaptionPair, WebviewMessage, WebviewStateUpdate } from './types';

/**
 * Webview provider for displaying image-caption pairs
 */
export class WebviewProvider {
    private panel: vscode.WebviewPanel | undefined;
    private currentPair: ImageCaptionPair | undefined;
    private currentIndex: number = 0;
    private totalCount: number = 0;
    private onMessageCallback: ((message: WebviewMessage) => void) | undefined;
    
    constructor(private context: vscode.ExtensionContext) {}
    
    /**
     * Create or show the webview panel
     */
    public createOrShow(): void {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        
        this.panel = vscode.window.createWebviewPanel(
            'imageCaptionManager',
            'Image Caption Manager',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.context.extensionPath, 'media')),
                    vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 
                        ? vscode.workspace.workspaceFolders[0].uri 
                        : vscode.Uri.file('/')
                ]
            }
        );
        
        this.panel.webview.html = this.getWebviewContent();
        
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            (message: WebviewMessage) => {
                if (this.onMessageCallback) {
                    this.onMessageCallback(message);
                }
            },
            undefined,
            this.context.subscriptions
        );
        
        // Handle panel disposal
        this.panel.onDidDispose(
            () => {
                this.panel = undefined;
            },
            null,
            this.context.subscriptions
        );
    }
    
    /**
     * Update the webview with new data
     */
    public updateWebview(update: WebviewStateUpdate): void {
        if (!this.panel) {
            return;
        }
        
        if (update.type === 'updatePair' && update.payload.currentPair) {
            this.currentPair = update.payload.currentPair;
            // Convert image path to webview URI
            const imageUri = this.panel.webview.asWebviewUri(vscode.Uri.file(this.currentPair.imagePath));
            this.currentPair.imagePath = imageUri.toString();
        }
        
        if (update.payload.currentIndex !== undefined) {
            this.currentIndex = update.payload.currentIndex;
        }
        
        if (update.payload.totalCount !== undefined) {
            this.totalCount = update.payload.totalCount;
        }
        
        this.panel.webview.postMessage(update);
    }
    
    /**
     * Set the message callback for handling webview messages
     */
    public setMessageCallback(callback: (message: WebviewMessage) => void): void {
        this.onMessageCallback = callback;
    }
    
    /**
     * Dispose of the webview panel
     */
    public dispose(): void {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
    }
    
    /**
     * Get the HTML content for the webview
     */
    private getWebviewContent(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Image Caption Manager</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 10px;
                    box-sizing: border-box;
                }
                
                .container {
                    width: 100%;
                    margin: 0 auto;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                
                .header {
                    background-color: var(--vscode-panel-background);
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border: 1px solid var(--vscode-panel-border);
                }
                
                .title {
                    font-size: 18px;
                    font-weight: bold;
                    color: var(--vscode-titleBar-activeForeground);
                }
                
                .counter {
                    font-size: 14px;
                    color: var(--vscode-descriptionForeground);
                }
                
                .navigation {
                    display: flex;
                    gap: 10px;
                }
                
                .nav-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background-color 0.2s;
                }
                
                .nav-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .nav-button:disabled {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    cursor: not-allowed;
                }
                
                .content {
                    flex: 1;
                    display: flex;
                    gap: 0;
                    min-height: 0;
                    position: relative;
                }
                
                .image-panel {
                    flex: 2.5;
                    background-color: var(--vscode-panel-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 8px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    min-width: 300px;
                    margin-right: 10px;
                }
                
                .splitter {
                    width: 10px;
                    background-color: var(--vscode-panel-background);
                    cursor: col-resize;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }
                
                .splitter:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                
                .splitter::before {
                    content: '';
                    width: 2px;
                    height: 30px;
                    background-color: var(--vscode-panel-border);
                    border-radius: 1px;
                    position: absolute;
                }
                
                .image-controls {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 10px;
                    justify-content: center;
                    align-items: center;
                }
                
                .image-button {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: background-color 0.2s;
                }
                
                .image-button:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                
                .image-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .zoom-level {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    min-width: 50px;
                    text-align: center;
                }
                
                .image-container {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    border-radius: 4px;
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                    min-height: 300px;
                    cursor: grab;
                }
                
                .image-container:active {
                    cursor: grabbing;
                }
                
                .image-container.zoom-cursor {
                    cursor: zoom-in;
                }
                
                .image-viewport {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .image-display {
                    max-width: none;
                    max-height: none;
                    object-fit: contain;
                    border-radius: 4px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    user-select: none;
                    pointer-events: none;
                }
                
                .image-info {
                    margin-top: 15px;
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    font-size: 12px;
                }
                
                .caption-panel {
                    flex: 1;
                    max-width: none;
                    min-width: 250px;
                    background-color: var(--vscode-panel-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 8px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    margin-left: 10px;
                }
                
                .caption-header {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: var(--vscode-titleBar-activeForeground);
                }
                
                .caption-editor {
                    flex: 1;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                    padding: 12px;
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--vscode-editor-font-size);
                    resize: none;
                    outline: none;
                    min-height: 200px;
                }
                
                .caption-editor:focus {
                    border-color: var(--vscode-focusBorder);
                }
                
                .caption-actions {
                    margin-top: 15px;
                    display: flex;
                    gap: 10px;
                }
                
                .save-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .save-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .save-button.saved {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                
                .no-data {
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    font-size: 16px;
                    margin-top: 50px;
                }
                
                .loading {
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    font-size: 16px;
                    margin-top: 50px;
                }
                
                .error {
                    color: var(--vscode-errorForeground);
                    background-color: var(--vscode-inputValidation-errorBackground);
                    border: 1px solid var(--vscode-inputValidation-errorBorder);
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                }
                
                @media (max-width: 768px) {
                    .content {
                        flex-direction: column;
                    }
                    
                    .header {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .navigation {
                        justify-content: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <div class="title">Image Caption Manager</div>
                        <div class="counter" id="counter">No pairs found</div>
                    </div>
                    <div class="navigation">
                        <button class="nav-button" id="prevButton" onclick="navigatePrevious()">← Previous</button>
                        <button class="nav-button" id="nextButton" onclick="navigateNext()">Next →</button>
                        <button class="nav-button" id="refreshButton" onclick="refresh()">🔄 Refresh</button>
                    </div>
                </div>
                
                <div class="content" id="content">
                    <div class="loading">Loading image-caption pairs...</div>
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                let currentPair = null;
                let currentIndex = 0;
                let totalCount = 0;
                let isDirty = false;
                let isInitializingCaption = false;
                
                // Listen for messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.type) {
                        case 'updatePair':
                            updateDisplay(message.payload);
                            break;
                        case 'updateIndex':
                            updateNavigation(message.payload);
                            break;
                        case 'updateList':
                            updateList(message.payload);
                            break;
                    }
                });
                
                function updateDisplay(payload) {
                    if (payload.currentPair) {
                        currentPair = payload.currentPair;
                        // Reset flags when switching to a new pair
                        isDirty = false;
                        isInitializingCaption = true;
                        renderPair();
                    }
                    
                    if (payload.currentIndex !== undefined) {
                        currentIndex = payload.currentIndex;
                    }
                    
                    if (payload.totalCount !== undefined) {
                        totalCount = payload.totalCount;
                    }
                    
                    updateCounter();
                    updateNavigationButtons();
                }
                
                function updateNavigation(payload) {
                    if (payload.currentIndex !== undefined) {
                        currentIndex = payload.currentIndex;
                    }
                    
                    if (payload.totalCount !== undefined) {
                        totalCount = payload.totalCount;
                    }
                    
                    updateCounter();
                    updateNavigationButtons();
                }
                
                function updateList(payload) {
                    if (payload.totalCount !== undefined) {
                        totalCount = payload.totalCount;
                    }
                    
                    updateCounter();
                    updateNavigationButtons();
                    
                    if (totalCount === 0) {
                        showNoData();
                    }
                }
                
                function renderPair() {
                    if (!currentPair) {
                        showNoData();
                        return;
                    }
                    
                    // Mark that we're initializing a new caption
                    isInitializingCaption = true;
                    
                    const content = document.getElementById('content');
                    content.innerHTML = \`
                        <div class="image-panel">
                            <div class="image-controls">
                                <button class="image-button" id="zoomOutButton" onclick="zoomOut()">-</button>
                                <span class="zoom-level" id="zoomLevel">100%</span>
                                <button class="image-button" id="zoomInButton" onclick="zoomIn()">+</button>
                                <button class="image-button" id="resetZoomButton" onclick="resetZoom()">Fit</button>
                                <button class="image-button" id="actualSizeButton" onclick="actualSize()">1:1</button>
                            </div>
                            <div class="image-container" id="imageContainer">
                                <div class="image-viewport" id="imageViewport">
                                    <img class="image-display" id="imageDisplay" src="\${currentPair.imagePath}" alt="Image" />
                                </div>
                            </div>
                            <div class="image-info">
                                \${currentPair.baseName}
                            </div>
                        </div>
                        <div class="splitter" id="splitter"></div>
                        <div class="caption-panel">
                            <div class="caption-header">Caption</div>
                            <textarea class="caption-editor" id="captionEditor" placeholder="Enter caption for this image...">\${currentPair.caption}</textarea>
                            <div class="caption-actions">
                                <button class="save-button" id="saveButton" onclick="saveCaption()">Save</button>
                            </div>
                        </div>
                    \`;
                    
                    // Initialize image viewer
                    initializeImageViewer();
                    
                    // Initialize splitter
                    initializeSplitter();
                    
                    // Add event listener for caption changes
                    const captionEditor = document.getElementById('captionEditor');
                    
                    captionEditor.addEventListener('input', () => {
                        // Don't send updates during initial rendering
                        if (isInitializingCaption) {
                            return;
                        }
                        
                        isDirty = true;
                        updateSaveButton();
                        
                        // Send update message to extension
                        vscode.postMessage({
                            type: 'updateCaption',
                            payload: { caption: captionEditor.value }
                        });
                    });
                    
                    // Add auto-save on blur
                    captionEditor.addEventListener('blur', () => {
                        // Don't auto-save during initialization
                        if (isInitializingCaption) {
                            return;
                        }
                        
                        if (isDirty) {
                            saveCaption();
                        }
                    });
                    
                    // Focus the caption editor for immediate editing
                    setTimeout(() => {
                        captionEditor.focus();
                        // Move cursor to end of text
                        captionEditor.setSelectionRange(captionEditor.value.length, captionEditor.value.length);
                        // Mark initialization as complete after focusing
                        isInitializingCaption = false;
                    }, 150); // Increased timeout slightly
                    
                    isDirty = false;
                    updateSaveButton();
                }
                
                function showNoData() {
                    const content = document.getElementById('content');
                    content.innerHTML = '<div class="no-data">No image-caption pairs found in the current workspace.</div>';
                }
                
                function updateCounter() {
                    const counter = document.getElementById('counter');
                    if (totalCount === 0) {
                        counter.textContent = 'No pairs found';
                    } else {
                        counter.textContent = \`\${currentIndex + 1} of \${totalCount} pairs\`;
                    }
                }
                
                function updateNavigationButtons() {
                    const prevButton = document.getElementById('prevButton');
                    const nextButton = document.getElementById('nextButton');
                    
                    if (prevButton) {
                        prevButton.disabled = currentIndex <= 0;
                    }
                    
                    if (nextButton) {
                        nextButton.disabled = currentIndex >= totalCount - 1;
                    }
                }
                
                function updateSaveButton() {
                    const saveButton = document.getElementById('saveButton');
                    if (saveButton) {
                        if (isDirty) {
                            saveButton.textContent = 'Save';
                            saveButton.className = 'save-button';
                        } else {
                            saveButton.textContent = 'Saved';
                            saveButton.className = 'save-button saved';
                        }
                    }
                }
                
                function navigateNext() {
                    if (isDirty) {
                        saveCaption();
                    }
                    // Reset dirty flag before navigation
                    isDirty = false;
                    updateSaveButton();
                    vscode.postMessage({ type: 'navigateNext' });
                }
                
                function navigatePrevious() {
                    if (isDirty) {
                        saveCaption();
                    }
                    // Reset dirty flag before navigation
                    isDirty = false;
                    updateSaveButton();
                    vscode.postMessage({ type: 'navigatePrevious' });
                }
                
                function saveCaption() {
                    const captionEditor = document.getElementById('captionEditor');
                    if (captionEditor) {
                        const caption = captionEditor.value;
                        vscode.postMessage({
                            type: 'saveCaption',
                            payload: { caption }
                        });
                        isDirty = false;
                        updateSaveButton();
                    }
                }
                
                function refresh() {
                    vscode.postMessage({ type: 'refresh' });
                }
                
                // Image viewer functionality
                let currentZoom = 1;
                let panX = 0;
                let panY = 0;
                let isDragging = false;
                let lastMouseX = 0;
                let lastMouseY = 0;
                let originalImageWidth = 0;
                let originalImageHeight = 0;
                
                function initializeImageViewer() {
                    const imageDisplay = document.getElementById('imageDisplay');
                    const imageContainer = document.getElementById('imageContainer');
                    const imageViewport = document.getElementById('imageViewport');
                    
                    if (!imageDisplay || !imageContainer || !imageViewport) return;
                    
                    // Wait for image to load to get dimensions
                    imageDisplay.onload = () => {
                        originalImageWidth = imageDisplay.naturalWidth;
                        originalImageHeight = imageDisplay.naturalHeight;
                        // Initialize zoom to fit the container
                        resetZoom();
                    };
                    
                    // Mouse wheel zoom
                    imageContainer.addEventListener('wheel', (e) => {
                        e.preventDefault();
                        const delta = e.deltaY > 0 ? 0.9 : 1.1;
                        zoomToPoint(delta, e.clientX, e.clientY);
                    });
                    
                    // Mouse drag panning
                    imageContainer.addEventListener('mousedown', (e) => {
                        if (e.button === 0) { // Left mouse button
                            isDragging = true;
                            lastMouseX = e.clientX;
                            lastMouseY = e.clientY;
                            imageContainer.style.cursor = 'grabbing';
                        }
                    });
                    
                    document.addEventListener('mousemove', (e) => {
                        if (isDragging) {
                            const deltaX = e.clientX - lastMouseX;
                            const deltaY = e.clientY - lastMouseY;
                            panX += deltaX;
                            panY += deltaY;
                            lastMouseX = e.clientX;
                            lastMouseY = e.clientY;
                            updateImageTransform();
                        }
                    });
                    
                    document.addEventListener('mouseup', () => {
                        if (isDragging) {
                            isDragging = false;
                            imageContainer.style.cursor = 'grab';
                        }
                    });
                    
                    // Double-click to fit
                    imageContainer.addEventListener('dblclick', (e) => {
                        e.preventDefault();
                        if (Math.abs(currentZoom - 1) < 0.1) {
                            resetZoom();
                        } else {
                            actualSize();
                        }
                    });
                    
                    // Keyboard shortcuts for image
                    document.addEventListener('keydown', (e) => {
                        if (e.target.tagName === 'TEXTAREA') return; // Don't interfere with caption editing
                        
                        switch (e.key) {
                            case '+':
                            case '=':
                                e.preventDefault();
                                zoomIn();
                                break;
                            case '-':
                                e.preventDefault();
                                zoomOut();
                                break;
                            case '0':
                                e.preventDefault();
                                resetZoom();
                                break;
                            case '1':
                                e.preventDefault();
                                actualSize();
                                break;
                        }
                    });
                }
                
                function zoomIn() {
                    currentZoom = Math.min(currentZoom * 1.2, 10);
                    updateImageTransform();
                    updateZoomLevel();
                }
                
                function zoomOut() {
                    currentZoom = Math.max(currentZoom / 1.2, 0.1);
                    updateImageTransform();
                    updateZoomLevel();
                }
                
                function zoomToPoint(factor, mouseX, mouseY) {
                    const imageContainer = document.getElementById('imageContainer');
                    const rect = imageContainer.getBoundingClientRect();
                    
                    // Calculate mouse position relative to container
                    const x = mouseX - rect.left;
                    const y = mouseY - rect.top;
                    
                    // Calculate the point we're zooming to
                    const beforeZoomX = (x - panX) / currentZoom;
                    const beforeZoomY = (y - panY) / currentZoom;
                    
                    currentZoom = Math.max(0.1, Math.min(currentZoom * factor, 10));
                    
                    // Adjust pan to keep the zoom point in the same place
                    panX = x - beforeZoomX * currentZoom;
                    panY = y - beforeZoomY * currentZoom;
                    
                    updateImageTransform();
                    updateZoomLevel();
                }
                
                function resetZoom() {
                    const imageContainer = document.getElementById('imageContainer');
                    const imageDisplay = document.getElementById('imageDisplay');
                    
                    if (!imageContainer || !imageDisplay) return;
                    
                    const containerRect = imageContainer.getBoundingClientRect();
                    const containerWidth = containerRect.width;
                    const containerHeight = containerRect.height;
                    
                    if (originalImageWidth && originalImageHeight) {
                        const scaleX = containerWidth / originalImageWidth;
                        const scaleY = containerHeight / originalImageHeight;
                        currentZoom = Math.min(scaleX, scaleY, 1);
                    } else {
                        currentZoom = 1;
                    }
                    
                    panX = 0;
                    panY = 0;
                    updateImageTransform();
                    updateZoomLevel();
                }
                
                function actualSize() {
                    currentZoom = 1;
                    panX = 0;
                    panY = 0;
                    updateImageTransform();
                    updateZoomLevel();
                }
                
                function updateImageTransform() {
                    const imageDisplay = document.getElementById('imageDisplay');
                    if (imageDisplay) {
                        imageDisplay.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${currentZoom})\`;
                    }
                }
                
                function updateZoomLevel() {
                    const zoomLevel = document.getElementById('zoomLevel');
                    if (zoomLevel) {
                        zoomLevel.textContent = \`\${Math.round(currentZoom * 100)}%\`;
                    }
                }
                
                // Splitter functionality
                function initializeSplitter() {
                    const splitter = document.getElementById('splitter');
                    const imagePanel = document.querySelector('.image-panel');
                    const captionPanel = document.querySelector('.caption-panel');
                    const content = document.getElementById('content');
                    
                    if (!splitter || !imagePanel || !captionPanel || !content) return;
                    
                    let isResizing = false;
                    let startX = 0;
                    let startImageWidth = 0;
                    let startCaptionWidth = 0;
                    
                    splitter.addEventListener('mousedown', (e) => {
                        isResizing = true;
                        startX = e.clientX;
                        
                        const contentRect = content.getBoundingClientRect();
                        const imageRect = imagePanel.getBoundingClientRect();
                        const captionRect = captionPanel.getBoundingClientRect();
                        
                        startImageWidth = imageRect.width;
                        startCaptionWidth = captionRect.width;
                        
                        document.body.style.cursor = 'col-resize';
                        document.body.style.userSelect = 'none';
                        
                        e.preventDefault();
                    });
                    
                    document.addEventListener('mousemove', (e) => {
                        if (!isResizing) return;
                        
                        const deltaX = e.clientX - startX;
                        const contentRect = content.getBoundingClientRect();
                        const totalWidth = contentRect.width - 20; // Account for splitter width
                        
                        const newImageWidth = startImageWidth + deltaX;
                        const newCaptionWidth = startCaptionWidth - deltaX;
                        
                        // Enforce minimum widths
                        const minImageWidth = 300;
                        const minCaptionWidth = 250;
                        
                        if (newImageWidth >= minImageWidth && newCaptionWidth >= minCaptionWidth) {
                            const imageFlexBasis = (newImageWidth / totalWidth) * 100;
                            const captionFlexBasis = (newCaptionWidth / totalWidth) * 100;
                            
                            imagePanel.style.flex = \`0 0 \${imageFlexBasis}%\`;
                            captionPanel.style.flex = \`0 0 \${captionFlexBasis}%\`;
                        }
                        
                        e.preventDefault();
                    });
                    
                    document.addEventListener('mouseup', () => {
                        if (isResizing) {
                            isResizing = false;
                            document.body.style.cursor = '';
                            document.body.style.userSelect = '';
                        }
                    });
                    
                    // Double-click to reset to default proportions
                    splitter.addEventListener('dblclick', () => {
                        imagePanel.style.flex = '2.5';
                        captionPanel.style.flex = '1';
                    });
                }
                
                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        switch (e.key) {
                            case 's':
                                e.preventDefault();
                                saveCaption();
                                break;
                            case 'r':
                                e.preventDefault();
                                vscode.postMessage({ type: 'refresh' });
                                break;
                            // Removed ArrowLeft and ArrowRight to avoid conflicts with text editing
                        }
                    }
                    
                    // Navigation shortcuts (Ctrl+Shift+Arrow or Cmd+Shift+Arrow)
                    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                        switch (e.key) {
                            case 'ArrowLeft':
                                e.preventDefault();
                                vscode.postMessage({ type: 'navigatePrevious' });
                                break;
                            case 'ArrowRight':
                                e.preventDefault();
                                vscode.postMessage({ type: 'navigateNext' });
                                break;
                        }
                    }
                });
            </script>
        </body>
        </html>`;
    }
}
