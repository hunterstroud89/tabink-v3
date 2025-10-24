# Creating App Icons for Tabink

You need two PNG icons for APK deployment:

## Required Icons

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

Place both files in `/assets/icons/` directory.

## Quick Options

### Option 1: Online Icon Generator (Easiest)
1. Go to: https://www.pwabuilder.com/imagegenerator
2. Upload a square image or logo
3. Generate icons
4. Download and place in `/assets/icons/`

### Option 2: Use a Template
Create a simple icon with:
- Background color: #e8e8e8 (matches theme)
- Text or symbol representing the app
- Keep it simple and readable at small sizes

### Option 3: Design Your Own
Use any image editor:
- Photoshop, GIMP, Figma, etc.
- Create 512x512 first (scale down for 192x192)
- Save as PNG with transparency
- Use simple, bold design

## Icon Design Tips

- **Keep it simple** - Will be viewed at small sizes
- **High contrast** - Works on light and dark backgrounds
- **No text** (or minimal) - Hard to read when small
- **Square canvas** - Will be masked to rounded corners automatically
- **Safe zone** - Keep important content within 80% center

## Quick Placeholder

If you need to deploy immediately, you can use a solid color square:
1. Open any image editor
2. Create 512x512 canvas with #e8e8e8 background
3. Add large letter "T" in center (#000000)
4. Save as icon-512.png
5. Resize to 192x192 and save as icon-192.png

## Verify Icons

After creating, verify:
- ✓ Files are exactly 192x192 and 512x512
- ✓ Files are PNG format
- ✓ Files are placed in `/assets/icons/`
- ✓ manifest.json references correct paths
