# 🚀 Quick Setup Guide

## Step 1: Generate Icons

1. **Open the icon generator:**
   - Open `generate-icons.html` in your browser
   - You'll see 3 icons with purple gradient backgrounds

2. **Save the icons:**
   - Right-click the 16x16 icon → "Save image as..." → Save as `icon-16.png`
   - Right-click the 48x48 icon → "Save image as..." → Save as `icon-48.png`  
   - Right-click the 128x128 icon → "Save image as..." → Save as `icon-128.png`

3. **Place in icons folder:**
   - Put all 3 files in `extension/icons/` folder
   - Your folder should look like:
   ```
   extension/
   ├── icons/
   │   ├── icon-16.png
   │   ├── icon-48.png
   │   └── icon-128.png
   ├── manifest.json
   ├── popup.html
   └── ...
   ```

## Step 2: Configure API URL

1. **Edit `popup.js`:**
   - Change `API_URL` to your backend URL
   - For local development: `http://localhost:3001`
   - For production: `https://your-domain.com`

2. **Edit `background.js`:**
   - Change `API_URL` to match the same URL

## Step 3: Load Extension in Chrome

1. **Open Chrome Extensions:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

2. **Load the Extension:**
   - Click "Load unpacked"
   - Navigate to and select the `extension` folder
   - Click "Select Folder"

3. **Pin the Extension:**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Panna.ai - Quick Capture"
   - Click the pin icon to keep it visible

## Step 4: Test the Extension

1. **Click the extension icon** → Should open popup
2. **Login** with your Panna.ai credentials
3. **Create a note** → Should save to your account
4. **Test context menu:**
   - Highlight any text on any webpage
   - Right-click → "Save to Panna.ai"
   - Should save with source info

## 🎯 Troubleshooting

### "Could not load icon" error
- Make sure all 3 icon files are in `extension/icons/` folder
- Check filenames are exactly: `icon-16.png`, `icon-48.png`, `icon-128.png`

### "Failed to load extension" error
- Check that `manifest.json` is valid JSON
- Make sure all files are in the extension folder
- Try reloading the extension

### Login not working
- Verify `API_URL` is correct in both `popup.js` and `background.js`
- Check your backend is running
- Open DevTools on popup (right-click extension icon → Inspect)

### Notes not saving
- Check you're logged in (click extension icon)
- Verify backend API endpoints are working
- Check Network tab in DevTools for errors

## ✅ Success!

Once working, you'll have:
- ✅ Beautiful popup for quick notes
- ✅ Right-click context menu
- ✅ Page capture functionality
- ✅ Secure authentication
- ✅ Real-time sync with your Panna.ai account

**Ready for your interview! 🎉**
