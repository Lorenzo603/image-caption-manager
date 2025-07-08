import * as vscode from 'vscode';
import { ImageCaptionPair, ImageCaptionManagerState, WebviewMessage } from './types';
import { FileSystemUtils } from './fileSystemUtils';
import { WebviewProvider } from './webviewProvider';

/**
 * Main class for managing image-caption pairs
 */
export class ImageCaptionManager {
    private state: ImageCaptionManagerState;
    private webviewProvider: WebviewProvider;
    private fileWatcher: vscode.FileSystemWatcher | undefined;
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
        
        // Set up file watcher
        this.setupFileWatcher();
        
        // Initial scan
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
     * Set up file system watcher
     */
    private setupFileWatcher(): void {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
        
        if (!this.state.rootFolder) {
            return;
        }
        
        this.fileWatcher = FileSystemUtils.createFileWatcher(
            this.state.rootFolder,
            () => {
                // Debounce the scan to avoid excessive updates
                setTimeout(() => {
                    this.scanForPairs();
                }, 1000);
            }
        );
        
        this.context.subscriptions.push(this.fileWatcher);
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
                
            case 'saveCaption':
                if (message.payload && message.payload.caption !== undefined) {
                    await this.saveCaption(message.payload.caption);
                }
                break;
                
            case 'refresh':
                await this.scanForPairs();
                break;
        }
    }
    
    /**
     * Navigate to the next image-caption pair
     */
    private async navigateNext(): Promise<void> {
        if (this.state.currentIndex < this.state.pairs.length - 1) {
            this.state.currentIndex++;
            this.updateWebview();
        }
    }
    
    /**
     * Navigate to the previous image-caption pair
     */
    private async navigatePrevious(): Promise<void> {
        if (this.state.currentIndex > 0) {
            this.state.currentIndex--;
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
            vscode.window.showInformationMessage(`Caption saved for ${currentPair.baseName}`, {
                modal: false
            });
        } else {
            vscode.window.showErrorMessage(`Failed to save caption for ${currentPair.baseName}`);
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
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
        this.webviewProvider.dispose();
        this.statusBarItem.dispose();
    }
}
