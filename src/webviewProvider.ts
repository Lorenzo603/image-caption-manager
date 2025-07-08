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
                    padding: 20px;
                    box-sizing: border-box;
                }
                
                .container {
                    max-width: 1200px;
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
                    gap: 20px;
                    min-height: 0;
                }
                
                .image-panel {
                    flex: 1;
                    background-color: var(--vscode-panel-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 8px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .image-container {
                    max-width: 100%;
                    max-height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .image-display {
                    max-width: 100%;
                    max-height: 70vh;
                    object-fit: contain;
                    border-radius: 4px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                
                .image-info {
                    margin-top: 15px;
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    font-size: 12px;
                }
                
                .caption-panel {
                    flex: 1;
                    background-color: var(--vscode-panel-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 8px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
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
                    
                    const content = document.getElementById('content');
                    content.innerHTML = \`
                        <div class="image-panel">
                            <div class="image-container">
                                <img class="image-display" src="\${currentPair.imagePath}" alt="Image" />
                            </div>
                            <div class="image-info">
                                \${currentPair.baseName}
                            </div>
                        </div>
                        <div class="caption-panel">
                            <div class="caption-header">Caption</div>
                            <textarea class="caption-editor" id="captionEditor" placeholder="Enter caption for this image...">\${currentPair.caption}</textarea>
                            <div class="caption-actions">
                                <button class="save-button" id="saveButton" onclick="saveCaption()">Save</button>
                            </div>
                        </div>
                    \`;
                    
                    // Add event listener for caption changes
                    const captionEditor = document.getElementById('captionEditor');
                    captionEditor.addEventListener('input', () => {
                        isDirty = true;
                        updateSaveButton();
                    });
                    
                    // Add auto-save on blur
                    captionEditor.addEventListener('blur', () => {
                        if (isDirty) {
                            saveCaption();
                        }
                    });
                    
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
                    vscode.postMessage({ type: 'navigateNext' });
                }
                
                function navigatePrevious() {
                    if (isDirty) {
                        saveCaption();
                    }
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
                
                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        switch (e.key) {
                            case 's':
                                e.preventDefault();
                                saveCaption();
                                break;
                            case 'ArrowRight':
                                e.preventDefault();
                                navigateNext();
                                break;
                            case 'ArrowLeft':
                                e.preventDefault();
                                navigatePrevious();
                                break;
                        }
                    }
                });
            </script>
        </body>
        </html>`;
    }
}
