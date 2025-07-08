import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';
import { ImageCaptionPair, SUPPORTED_IMAGE_EXTENSIONS } from './types';

/**
 * Utility functions for file system operations
 */
export class FileSystemUtils {
    
    /**
     * Scan a directory for image-caption pairs
     * @param folderPath Path to the folder to scan
     * @returns Promise<ImageCaptionPair[]> Array of found pairs
     */
    public static async scanForImageCaptionPairs(folderPath: string): Promise<ImageCaptionPair[]> {
        const pairs: ImageCaptionPair[] = [];
        
        try {
            const files = await fs.readdir(folderPath);
            
            // Group files by base name (without extension)
            const filesByBaseName = new Map<string, { imagePath?: string; captionPath?: string }>();
            
            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const stat = await fs.stat(filePath);
                
                if (!stat.isFile()) {
                    continue;
                }
                
                const ext = path.extname(file).toLowerCase();
                const baseName = path.basename(file, ext);
                
                if (!filesByBaseName.has(baseName)) {
                    filesByBaseName.set(baseName, {});
                }
                
                const entry = filesByBaseName.get(baseName)!;
                
                if (SUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
                    entry.imagePath = filePath;
                } else if (ext === '.txt') {
                    entry.captionPath = filePath;
                }
            }
            
            // Create pairs for files that have both image and caption
            for (const [baseName, entry] of filesByBaseName) {
                if (entry.imagePath && entry.captionPath) {
                    const caption = await this.readCaptionFile(entry.captionPath);
                    pairs.push({
                        imagePath: entry.imagePath,
                        captionPath: entry.captionPath,
                        baseName,
                        caption,
                        isDirty: false
                    });
                }
            }
            
            // Sort pairs by base name for consistent ordering
            pairs.sort((a, b) => a.baseName.localeCompare(b.baseName));
            
        } catch (error) {
            console.error('Error scanning for image-caption pairs:', error);
        }
        
        return pairs;
    }
    
    /**
     * Read the content of a caption file
     * @param captionPath Path to the caption file
     * @returns Promise<string> Content of the caption file
     */
    public static async readCaptionFile(captionPath: string): Promise<string> {
        try {
            const content = await fs.readFile(captionPath, 'utf8');
            return content.trim();
        } catch (error) {
            console.error(`Error reading caption file ${captionPath}:`, error);
            return '';
        }
    }
    
    /**
     * Write content to a caption file
     * @param captionPath Path to the caption file
     * @param content Content to write
     * @returns Promise<boolean> Success status
     */
    public static async writeCaptionFile(captionPath: string, content: string): Promise<boolean> {
        try {
            await fs.writeFile(captionPath, content, 'utf8');
            return true;
        } catch (error) {
            console.error(`Error writing caption file ${captionPath}:`, error);
            vscode.window.showErrorMessage(`Failed to save caption file: ${path.basename(captionPath)}`);
            return false;
        }
    }
    
    /**
     * Convert a file path to a vscode.Uri
     * @param filePath File path to convert
     * @returns vscode.Uri
     */
    public static pathToUri(filePath: string): vscode.Uri {
        return vscode.Uri.file(filePath);
    }
    
    /**
     * Check if a file exists
     * @param filePath Path to check
     * @returns Promise<boolean> Whether the file exists
     */
    public static async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Get the workspace folder path
     * @returns string | undefined The workspace folder path
     */
    public static getWorkspaceFolder(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        return workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri.fsPath : undefined;
    }
    
    /**
     * Create a file system watcher for image and caption files
     * @param folderPath Path to watch
     * @param callback Callback function for file changes
     * @returns vscode.FileSystemWatcher
     */
    public static createFileWatcher(folderPath: string, callback: () => void): vscode.FileSystemWatcher {
        const pattern = new vscode.RelativePattern(folderPath, '**/*.{jpg,jpeg,png,gif,bmp,webp,txt}');
        const watcher = vscode.workspace.createFileSystemWatcher(pattern);
        
        watcher.onDidCreate(callback);
        watcher.onDidChange(callback);
        watcher.onDidDelete(callback);
        
        return watcher;
    }
}
