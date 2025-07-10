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
		await imageCaptionManager.rescanPairs();
		// Notification disabled: vscode.window.showInformationMessage('Image-caption pairs refreshed');
	});
	
	const nextCommand = vscode.commands.registerCommand('imageCaptionManager.next', async () => {
		// Navigate to next image-caption pair
		await imageCaptionManager.navigateNext();
	});
	
	const previousCommand = vscode.commands.registerCommand('imageCaptionManager.previous', async () => {
		// Navigate to previous image-caption pair
		await imageCaptionManager.navigatePrevious();
	});
	
	const next10Command = vscode.commands.registerCommand('imageCaptionManager.next10', async () => {
		// Navigate to next 10 image-caption pairs
		await imageCaptionManager.navigateNext(10);
	});
	
	const previous10Command = vscode.commands.registerCommand('imageCaptionManager.previous10', async () => {
		// Navigate to previous 10 image-caption pairs
		await imageCaptionManager.navigatePrevious(10);
	});
	
	const next100Command = vscode.commands.registerCommand('imageCaptionManager.next100', async () => {
		// Navigate to next 100 image-caption pairs
		await imageCaptionManager.navigateNext(100);
	});
	
	const previous100Command = vscode.commands.registerCommand('imageCaptionManager.previous100', async () => {
		// Navigate to previous 100 image-caption pairs
		await imageCaptionManager.navigatePrevious(100);
	});
	
	// Add commands to subscriptions
	context.subscriptions.push(openCommand);
	context.subscriptions.push(refreshCommand);
	context.subscriptions.push(nextCommand);
	context.subscriptions.push(previousCommand);
	context.subscriptions.push(next10Command);
	context.subscriptions.push(previous10Command);
	context.subscriptions.push(next100Command);
	context.subscriptions.push(previous100Command);
	
	// Initialize the manager
	imageCaptionManager.initialize().catch(error => {
		console.error('Error initializing Image Caption Manager:', error);
		vscode.window.showErrorMessage('Failed to initialize Image Caption Manager: ' + error.message);
	});
	
	// Welcome message disabled: vscode.window.showInformationMessage('Image Caption Manager is ready! Open a folder with image-caption pairs to get started.');
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (imageCaptionManager) {
		imageCaptionManager.dispose();
	}
}
