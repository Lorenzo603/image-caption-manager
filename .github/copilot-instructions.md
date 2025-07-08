# Copilot Instructions for Image Caption Manager Extension

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a VS Code extension project. Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.

## Project Context

This VSCode extension is designed to manage image-caption pairs for AI datasets. The extension should:

1. **Automatically scan workspace folders** for image-caption pairs (image files with corresponding .txt files of the same name)
2. **Display image-caption pairs** in a side-by-side layout with:
   - Image on the left
   - Caption text on the right (editable)
3. **Provide navigation controls** to move between image-caption pairs
4. **Support common image formats** (.jpg, .jpeg, .png, .gif, .bmp, .webp)
5. **Auto-save caption changes** when navigating or closing

## Architecture Guidelines

- Use webview panels for the image-caption display interface
- Implement file system watchers to detect changes in image-caption pairs
- Use TypeScript for type safety and better development experience
- Follow VS Code extension best practices for performance and user experience
- Implement proper error handling and user feedback

## File Structure

- `src/extension.ts` - Main extension entry point
- `src/imageCaptionManager.ts` - Core functionality for managing image-caption pairs
- `src/webviewProvider.ts` - Webview panel management
- `src/fileSystemUtils.ts` - File system operations and utilities
- `src/types.ts` - Type definitions

## Command Structure

The extension should register commands for:
- Opening the image-caption manager
- Navigating to next/previous pairs
- Saving current caption
- Refreshing the file list
