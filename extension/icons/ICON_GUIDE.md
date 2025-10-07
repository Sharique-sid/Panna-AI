# Icon Generation Guide

You need three icon sizes for the browser extension:

- **16x16px** - Shown in the browser toolbar
- **48x48px** - Shown in the Extensions page
- **128x128px** - Shown in the Chrome Web Store

## Quick Generation Methods

### Method 1: Using Canva (Free & Easy)

1. Go to [Canva.com](https://www.canva.com)
2. Create three custom designs (16x16, 48x48, 128x128)
3. Use your Panna.ai logo or create a simple 📝 emoji-based design
4. Download as PNG files
5. Rename to `icon-16.png`, `icon-48.png`, `icon-128.png`

### Method 2: Using Figma (Professional)

1. Open Figma
2. Create frames: 16x16, 48x48, 128x128
3. Design your icon
4. Export each frame as PNG @ 2x for retina displays
5. Place in this folder

### Method 3: Using ImageMagick (Command Line)

If you have a single high-res PNG (512x512 recommended):

```bash
# Install ImageMagick first
# https://imagemagick.org/script/download.php

# Generate all sizes
convert logo.png -resize 16x16 icon-16.png
convert logo.png -resize 48x48 icon-48.png
convert logo.png -resize 128x128 icon-128.png
```

### Method 4: Online Tools

Use any of these free tools:

- [Favicon.io](https://favicon.io/) - Generate from text/emoji
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [ICO Converter](https://www.icoconverter.com/)

## Temporary Placeholder

For development, you can use emoji-based icons:

1. Go to [Favicon.io](https://favicon.io/emoji-favicons/)
2. Choose the 📝 (memo) emoji
3. Download the generated files
4. Extract and rename:
   - `favicon-16x16.png` → `icon-16.png`
   - `favicon-48x48.png` → Create from 32x32
   - Use any 128px file as `icon-128.png`

## Design Tips

1. **Keep it simple** - Icons are small, complex details won't show
2. **High contrast** - Make sure it's visible in both light/dark toolbars
3. **Recognizable** - Should be identifiable at 16x16px
4. **Brand consistency** - Match your main Panna.ai branding
5. **Square format** - Don't use wide/tall formats

## Using Your Panna.ai Logo

If you have your existing logo:

1. Open in image editor
2. Crop to square (1:1 aspect ratio)
3. Export at 512x512px
4. Use ImageMagick method above to generate all sizes

## Color Recommendations

Based on Panna.ai's purple gradient theme:

- Primary: #667eea
- Secondary: #764ba2
- Background: White or transparent
- Icon color: Purple gradient or solid purple

## Quick Fix (No Icons Available)

The extension will still work without icons, but use these placeholders:

1. Create 3 solid purple squares in any image editor
2. Add white text "P" in center
3. Export at required sizes
4. This will work for development/testing

## Note

Once you have your icons, place them in this folder (`extension/icons/`) and the extension will automatically use them.

