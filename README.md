# Image Caption Manager

A Visual Studio Code extension for managing image-caption pairs for AI datasets. This extension helps you efficiently view and edit captions for images, making it ideal for machine learning dataset preparation.

![extension screenshot](image-caption-manager-screenshot01-full.png)

## Features

- **Automatic Discovery**: Automatically scans your workspace for image-caption pairs (images with corresponding `.txt` files)
- **Side-by-Side View**: Display images and their captions side-by-side for easy editing
- **Advanced Image Viewer**: Professional image viewing with zoom, pan, and fit-to-window capabilities
- **Navigation Controls**: Navigate between image-caption pairs with next/previous buttons
- **Live Editing**: Edit captions directly in the interface with auto-save functionality
- **Manual Refresh**: Use the refresh button or keyboard shortcut to rescan for new image-caption pairs
- **Keyboard Shortcuts**: Use keyboard shortcuts for quick navigation and saving
- **Status Bar Integration**: Shows the number of pairs found in the status bar
- **Token Counter**: Displays the number of tokens in the caption using GPT tokenization

## Image Viewer Features

The enhanced image viewer includes:

- **Zoom Controls**: Zoom in/out with buttons, mouse wheel, or keyboard shortcuts
- **Pan Support**: Click and drag to pan around zoomed images
- **Fit to Window**: Automatically fit image to the available space
- **Actual Size**: View image at 100% scale
- **Smart Zoom**: Zoom to cursor position when using mouse wheel
- **Toolbar**: Professional toolbar with all image controls
- **Keyboard Shortcuts**: 
  - `+` or `=`: Zoom in
  - `-`: Zoom out
  - `0`: Fit to window
  - `1`: Actual size (100%)
  - `Ctrl+Alt+Left/Right` (or `Cmd+Alt+Left/Right` on Mac): Navigate between pairs
  - `Ctrl+R` (or `Cmd+R` on Mac): Refresh pairs
  - `Ctrl+S` (or `Cmd+S` on Mac): Save caption

## Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.bmp`
- `.webp`

## Installation

### From VSIX file

1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X`)
4. Click the "..." menu and select "Install from VSIX..."
5. Choose the downloaded `.vsix` file

### From Marketplace (coming soon)

Search for "Image Caption Manager" in the VS Code Extensions marketplace.

## Usage

1. Open a folder containing image-caption pairs in VS Code
2. Use the Command Palette (`Ctrl+Shift+P`) and search for "Open Image Caption Manager"
3. Or use the keyboard shortcut `Ctrl+Alt+I` (or `Cmd+Alt+I` on Mac)
4. Or click the "Caption Manager" button in the status bar

### Navigation

- **Next**: Click the "Next →" button or use `Ctrl+Alt+Right` (or `Cmd+Alt+Right` on Mac)
- **Previous**: Click the "← Previous" button or use `Ctrl+Alt+Left` (or `Cmd+Alt+Left` on Mac)
- **Jump Forward**: Click "+10 →" to jump 10 pairs forward, or "+100 →" to jump 100 pairs forward
- **Jump Backward**: Click "← -10" to jump 10 pairs backward, or "← -100" to jump 100 pairs backward
- **Save**: Click the "Save" button or use `Ctrl+S` (or `Cmd+S` on Mac)
- **Refresh**: Click the "Refresh" button to rescan for new pairs

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
- `Image Caption Manager: Next 10 Image Caption Pairs` - Jump 10 pairs forward
- `Image Caption Manager: Previous 10 Image Caption Pairs` - Jump 10 pairs backward
- `Image Caption Manager: Next 100 Image Caption Pairs` - Jump 100 pairs forward
- `Image Caption Manager: Previous 100 Image Caption Pairs` - Jump 100 pairs backward

## Keyboard Shortcuts

- `Ctrl+Alt+I` (or `Cmd+Alt+I` on Mac) - Open Image Caption Manager
- `Ctrl+Alt+Right` (or `Cmd+Alt+Right` on Mac) - Next image-caption pair
- `Ctrl+Alt+Left` (or `Cmd+Alt+Left` on Mac) - Previous image-caption pair
- `Ctrl+R` (or `Cmd+R` on Mac) - Refresh image-caption pairs
- `Ctrl+S` (or `Cmd+S` on Mac) - Save current caption (when in the caption editor)

## Development

To run the extension in development mode:

1. Clone the repository
2. Open in VS Code
3. Run `npm install` to install dependencies
4. Press `F5` to start debugging - this will open a new Extension Development Host window
5. Open a folder with image-caption pairs to test the extension

## Building and Distribution

### Building the Extension

1. Install dependencies: `npm install`
2. Build the extension: `npm run package`
3. Package for distribution: `vsce package`

### Local Installation from VSIX

1. Build the `.vsix` file using `vsce package`
2. Install locally using `code --install-extension image-caption-manager-<version>.vsix`
3. Or use VS Code's "Install from VSIX..." option in the Extensions view


## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions, please visit the [GitHub repository](https://github.com/Lorenzo603/image-caption-manager).

## Changelog

### 1.0.3
- Major bugfixes (image loading)

### 1.0.2
- Added token counter with GPT tokenization
- Fixed double keybindings bug
- Added jump navigation: +10/-10 and +100/-100 buttons for faster navigation through large datasets

### 1.0.1
- Usability improvements with keybindings

### 1.0.0
- Initial release
- Image-caption pair discovery and management
- Professional image viewer with zoom and pan capabilities
- Keyboard shortcuts for efficient navigation
- Auto-save functionality
- Status bar integration

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
