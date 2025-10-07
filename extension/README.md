# Panna.ai Browser Extension

## 🚀 Quick Start

The extension is automatically packaged and available for download at:
**https://panna-ai-bice.vercel.app/panna-ai-extension.zip**

## 📦 Updating the Extension Package

When you make changes to the extension files, run:

```bash
npm run update-extension
```

This will:
1. Create a new `panna-ai-extension.zip` file
2. Place it in the `public/` directory
3. Make it available for download from your website

## 🔧 Manual Installation

Users can install the extension by:

1. **Download** the extension from your website
2. **Extract** the ZIP file
3. **Open Chrome** and go to `chrome://extensions/`
4. **Enable "Developer mode"** (toggle in top right)
5. **Click "Load unpacked"**
6. **Select** the extracted extension folder

## 📁 Extension Files

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup interface
- `popup.js` - Extension popup logic
- `background.js` - Background service worker
- `content-script.js` - Content script for web pages
- `icons/` - Extension icons (16px, 48px, 128px)
- `INSTALL.md` - Installation instructions for users

## 🔄 Development Workflow

1. Make changes to extension files
2. Test locally by loading the extension in Chrome
3. Run `npm run update-extension` to update the package
4. Commit and push changes
5. Users can download the updated extension from your website

## 🌐 Production

The extension package is served directly from your Vercel deployment, ensuring:
- ✅ Fast download speeds
- ✅ No GitHub repository access required
- ✅ Works with private repositories
- ✅ Professional user experience