# Image Caption Manager

A Visual Studio Code extension for managing image-caption pairs for AI datasets. This extension helps you efficiently view and edit captions for images, making it ideal for machine learning dataset preparation.

## Features

- **Automatic Discovery**: Automatically scans your workspace for image-caption pairs (images with corresponding `.txt` files)
- **Side-by-Side View**: Display images and their captions side-by-side for easy editing
- **Navigation Controls**: Navigate between image-caption pairs with next/previous buttons
- **Live Editing**: Edit captions directly in the interface with auto-save functionality
- **File Watching**: Automatically detects new image-caption pairs or changes to existing ones
- **Keyboard Shortcuts**: Use keyboard shortcuts for quick navigation and saving
- **Status Bar Integration**: Shows the number of pairs found in the status bar

## Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.bmp`
- `.webp`

## Usage

1. Open a folder containing image-caption pairs in VS Code
2. Use the Command Palette (`Ctrl+Shift+P`) and search for "Open Image Caption Manager"
3. Or use the keyboard shortcut `Ctrl+Alt+I` (or `Cmd+Alt+I` on Mac)
4. Or click the "Caption Manager" button in the status bar

### Navigation

- **Next**: Click the "Next →" button or use `Ctrl+Alt+Right` (or `Cmd+Alt+Right` on Mac)
- **Previous**: Click the "← Previous" button or use `Ctrl+Alt+Left` (or `Cmd+Alt+Left` on Mac)
- **Save**: Click the "Save" button or use `Ctrl+S` (or `Cmd+S` on Mac)

### File Structure

Your workspace should contain image-caption pairs where each image has a corresponding text file with the same name:

```
workspace/
├── image1.jpg
├── image1.txt
├── image2.png
├── image2.txt
├── subfolder/
│   ├── image3.jpg
│   └── image3.txt
└── ...
```

## Commands

- `Image Caption Manager: Open Image Caption Manager` - Opens the main interface
- `Image Caption Manager: Refresh Image Caption Pairs` - Refreshes the list of pairs
- `Image Caption Manager: Next Image Caption Pair` - Navigate to next pair
- `Image Caption Manager: Previous Image Caption Pair` - Navigate to previous pair

## Keyboard Shortcuts

- `Ctrl+Alt+I` (or `Cmd+Alt+I` on Mac) - Open Image Caption Manager
- `Ctrl+Alt+Right` (or `Cmd+Alt+Right` on Mac) - Next image-caption pair
- `Ctrl+Alt+Left` (or `Cmd+Alt+Left` on Mac) - Previous image-caption pair
- `Ctrl+S` (or `Cmd+S` on Mac) - Save current caption (when in the caption editor)

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Image Caption Manager"
4. Click Install

## Development

To run the extension in development mode:

1. Clone the repository
2. Open in VS Code
3. Run `npm install` to install dependencies
4. Press `F5` to start debugging - this will open a new Extension Development Host window
5. Open a folder with image-caption pairs to test the extension

## Building

```bash
npm run compile    # Compile TypeScript
npm run watch      # Watch for changes and compile
npm run package    # Create production build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is released under the MIT License.

## Changelog

### 0.0.1

- Initial release
- Basic image-caption pair management
- Side-by-side view with editing capabilities
- Navigation controls
- File system watching
- Keyboard shortcuts
- Status bar integration

## Support

If you encounter any issues or have suggestions, please file an issue on the GitHub repository.
