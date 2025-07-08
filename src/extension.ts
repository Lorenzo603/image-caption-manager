// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ImageCaptionManager } from './imageCaptionManager';

let imageCaptionManager: ImageCaptionManager;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Image Caption Manager extension is now active!');
	
	// Initialize the image caption manager
	imageCaptionManager = new ImageCaptionManager(context);
	
	// Register commands
	const openCommand = vscode.commands.registerCommand('imageCaptionManager.open', () => {
		imageCaptionManager.openManager();
	});
	
	const refreshCommand = vscode.commands.registerCommand('imageCaptionManager.refresh', async () => {
		await imageCaptionManager.initialize();
		vscode.window.showInformationMessage('Image-caption pairs refreshed');
	});
	
	const nextCommand = vscode.commands.registerCommand('imageCaptionManager.next', async () => {
		// This could be used for keyboard shortcuts
		imageCaptionManager.openManager();
	});
	
	const previousCommand = vscode.commands.registerCommand('imageCaptionManager.previous', async () => {
		// This could be used for keyboard shortcuts
		imageCaptionManager.openManager();
	});
	
	// Add commands to subscriptions
	context.subscriptions.push(openCommand);
	context.subscriptions.push(refreshCommand);
	context.subscriptions.push(nextCommand);
	context.subscriptions.push(previousCommand);
	
	// Initialize the manager
	imageCaptionManager.initialize().catch(error => {
		console.error('Error initializing Image Caption Manager:', error);
		vscode.window.showErrorMessage('Failed to initialize Image Caption Manager: ' + error.message);
	});
	
	// Show welcome message
	vscode.window.showInformationMessage('Image Caption Manager is ready! Open a folder with image-caption pairs to get started.');
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (imageCaptionManager) {
		imageCaptionManager.dispose();
	}
}
