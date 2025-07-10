import * as vscode from 'vscode';
import { ImageCaptionPair, ImageCaptionManagerState, WebviewMessage } from './types';
import { FileSystemUtils } from './fileSystemUtils';
import { WebviewProvider } from './webviewProvider';
import { encode } from 'gpt-tokenizer';

/**
 * Main class for managing image-caption pairs
 */
export class ImageCaptionManager {
    private state: ImageCaptionManagerState;
    private webviewProvider: WebviewProvider;
    private statusBarItem: vscode.StatusBarItem;
    
    constructor(private context: vscode.ExtensionContext) {
        this.state = {
            pairs: [],
            currentIndex: 0,
            rootFolder: ''
        };
        
        this.webviewProvider = new WebviewProvider(context);
        this.webviewProvider.setMessageCallback(this.handleWebviewMessage.bind(this));
        
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.statusBarItem.command = 'imageCaptionManager.open';
        this.statusBarItem.text = '$(image) Caption Manager';
        this.statusBarItem.tooltip = 'Open Image Caption Manager';
        this.statusBarItem.show();
        
        context.subscriptions.push(this.statusBarItem);
        context.subscriptions.push(this.webviewProvider);
    }
    
    /**
     * Initialize the manager and scan for image-caption pairs
     */
    public async initialize(): Promise<void> {
        const workspaceFolder = FileSystemUtils.getWorkspaceFolder();
        
        if (!workspaceFolder) {
            vscode.window.showWarningMessage('No workspace folder is open. Please open a folder containing image-caption pairs.');
            return;
        }
        
        this.state.rootFolder = workspaceFolder;
        
        // Initial scan only - no file watcher to avoid jarring refreshes
        await this.scanForPairs();
        
        // Update status bar
        this.updateStatusBar();
    }
    
    /**
     * Open the image caption manager webview
     */
    public openManager(): void {
        this.webviewProvider.createOrShow();
        this.updateWebview();
    }
     /**
     * Scan for image-caption pairs in the workspace
     */
    private async scanForPairs(): Promise<void> {
        if (!this.state.rootFolder) {
            return;
        }

        try {
            const pairs = await FileSystemUtils.scanForImageCaptionPairs(this.state.rootFolder);
            this.state.pairs = pairs;
            
            // Reset index if it's out of bounds
            if (this.state.currentIndex >= pairs.length) {
                this.state.currentIndex = 0;
            }
            
            this.updateWebview();
            this.updateStatusBar();
            
            console.log(`Found ${pairs.length} image-caption pairs`);
            
        } catch (error) {
            console.error('Error scanning for pairs:', error);
            vscode.window.showErrorMessage('Error scanning for image-caption pairs: ' + error);
        }
    }

    /**
     * Manually rescan for image-caption pairs (called by refresh command)
     */
    public async rescanPairs(): Promise<void> {
        await this.scanForPairs();
    }
    
    /**
     * Handle messages from the webview
     */
    private async handleWebviewMessage(message: WebviewMessage): Promise<void> {
        switch (message.type) {
            case 'navigateNext':
                await this.navigateNext();
                break;
                
            case 'navigatePrevious':
                await this.navigatePrevious();
                break;
                
            case 'navigateNext10':
                await this.navigateNext(10);
                break;
                
            case 'navigatePrevious10':
                await this.navigatePrevious(10);
                break;
                
            case 'navigateNext100':
                await this.navigateNext(100);
                break;
                
            case 'navigatePrevious100':
                await this.navigatePrevious(100);
                break;
                
            case 'saveCaption':
                if (message.payload && message.payload.caption !== undefined) {
                    await this.saveCaption(message.payload.caption);
                }
                break;
                
            case 'updateCaption':
                if (message.payload && message.payload.caption !== undefined) {
                    this.updateCaptionInState(message.payload.caption);
                }
                break;
                
            case 'refresh':
                await this.rescanPairs();
                break;
                
            case 'countTokens':
                if (message.payload && message.payload.text !== undefined) {
                    const tokenCount = this.countTokens(message.payload.text);
                    this.webviewProvider.updateWebview({
                        type: 'tokenCount',
                        payload: { count: tokenCount }
                    });
                }
                break;
        }
    }
    
    /**
     * Navigate to the next image-caption pair
     */
    public async navigateNext(step: number = 1): Promise<void> {
        // Auto-save current caption before navigating
        await this.autoSaveCurrentCaption();
        
        const newIndex = Math.min(this.state.currentIndex + step, this.state.pairs.length - 1);
        if (newIndex !== this.state.currentIndex) {
            this.state.currentIndex = newIndex;
            this.updateWebview();
        }
    }
    
    /**
     * Navigate to the previous image-caption pair
     */
    public async navigatePrevious(step: number = 1): Promise<void> {
        // Auto-save current caption before navigating
        await this.autoSaveCurrentCaption();
        
        const newIndex = Math.max(this.state.currentIndex - step, 0);
        if (newIndex !== this.state.currentIndex) {
            this.state.currentIndex = newIndex;
            this.updateWebview();
        }
    }
    
    /**
     * Save the current caption
     */
    private async saveCaption(caption: string): Promise<void> {
        const currentPair = this.state.pairs[this.state.currentIndex];
        
        if (!currentPair) {
            return;
        }
        
        // Update the caption in our state
        currentPair.caption = caption;
        currentPair.isDirty = false;
        
        // Save to file
        const success = await FileSystemUtils.writeCaptionFile(currentPair.captionPath, caption);
        
        if (success) {
            // Notification disabled: vscode.window.showInformationMessage(`Caption saved for ${currentPair.baseName}`, { modal: false });
        } else {
            vscode.window.showErrorMessage(`Failed to save caption for ${currentPair.baseName}`);
        }
    }
    
    /**
     * Auto-save the current caption if it has been modified
     */
    private async autoSaveCurrentCaption(): Promise<void> {
        const currentPair = this.state.pairs[this.state.currentIndex];
        
        if (!currentPair || !currentPair.isDirty) {
            return;
        }
        
        // Save to file without showing notification message
        const success = await FileSystemUtils.writeCaptionFile(currentPair.captionPath, currentPair.caption);
        
        if (success) {
            currentPair.isDirty = false;
            console.log(`Auto-saved caption for ${currentPair.baseName}`);
        } else {
            console.error(`Failed to auto-save caption for ${currentPair.baseName}`);
        }
    }
    
    /**
     * Update the webview with current state
     */
    private updateWebview(): void {
        const currentPair = this.state.pairs[this.state.currentIndex];
        
        this.webviewProvider.updateWebview({
            type: 'updatePair',
            payload: {
                currentPair,
                currentIndex: this.state.currentIndex,
                totalCount: this.state.pairs.length
            }
        });
    }
    
    /**
     * Update the status bar item
     */
    private updateStatusBar(): void {
        const count = this.state.pairs.length;
        this.statusBarItem.text = `$(image) Caption Manager (${count} pairs)`;
        this.statusBarItem.tooltip = `Open Image Caption Manager - ${count} pairs found`;
    }
    
    /**
     * Get the current state
     */
    public getState(): ImageCaptionManagerState {
        return { ...this.state };
    }
    
    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.webviewProvider.dispose();
        this.statusBarItem.dispose();
    }
    
    /**
     * Update the caption in the current state and mark as dirty
     */
    private updateCaptionInState(caption: string): void {
        const currentPair = this.state.pairs[this.state.currentIndex];
        
        if (!currentPair) {
            return;
        }
        
        // Update the caption and mark as dirty
        currentPair.caption = caption;
        currentPair.isDirty = true;
    }
    
    /**
     * Count tokens in the given text using gpt-tokenizer
     */
    private countTokens(text: string): number {
        if (!text || text.trim().length === 0) {
            return 0;
        }
        
        try {
            const tokens = encode(text);
            return tokens.length;
        } catch (error) {
            console.error('Error counting tokens:', error);
            // Fallback to simple estimation
            const words = text.trim().split(/\s+/).length;
            return Math.max(1, Math.round(words * 1.3));
        }
    }
}
