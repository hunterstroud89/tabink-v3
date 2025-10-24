#!/bin/bash
# Quick icon converter - Run this if you have ImageMagick installed

cd "$(dirname "$0")/assets/icons"

echo "🎨 Tabink Icon Converter"
echo "========================"
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found"
    echo ""
    echo "Install with:"
    echo "  macOS:   brew install imagemagick"
    echo "  Ubuntu:  sudo apt install imagemagick"
    echo "  Windows: choco install imagemagick"
    echo ""
    echo "Or use online converter:"
    echo "  https://www.pwabuilder.com/imagegenerator"
    exit 1
fi

# Check if SVG files exist
if [ ! -f "icon-192.svg" ] || [ ! -f "icon-512.svg" ]; then
    echo "❌ SVG files not found"
    echo "Expected: icon-192.svg and icon-512.svg"
    exit 1
fi

# Convert SVG to PNG
echo "Converting icon-192.svg → icon-192.png..."
convert icon-192.svg icon-192.png

echo "Converting icon-512.svg → icon-512.png..."
convert icon-512.svg icon-512.png

# Verify files were created
if [ -f "icon-192.png" ] && [ -f "icon-512.png" ]; then
    echo ""
    echo "✅ Icons converted successfully!"
    echo ""
    echo "Created files:"
    ls -lh icon-*.png
    echo ""
    echo "Next steps:"
    echo "1. Update manifest.json to use .png instead of .svg"
    echo "2. Test manifest in Chrome DevTools (Application → Manifest)"
    echo "3. Deploy to PWA Builder!"
else
    echo ""
    echo "❌ Conversion failed"
    echo "Try using: https://www.pwabuilder.com/imagegenerator"
fi
