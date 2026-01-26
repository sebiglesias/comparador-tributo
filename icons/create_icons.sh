#!/bin/bash
# Create simple SVG icons and convert to PNG using ImageMagick if available

# SVG content
SVG='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0066CC"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="white" text-anchor="middle">🧮</text>
</svg>'

# Create SVG file
echo "$SVG" > icon.svg

# Create a simple favicon
echo "$SVG" > favicon.svg

# If ImageMagick is available, convert to PNG
if command -v convert &> /dev/null; then
    convert -background none icon.svg -resize 72x72 icon-72x72.png
    convert -background none icon.svg -resize 96x96 icon-96x96.png
    convert -background none icon.svg -resize 128x128 icon-128x128.png
    convert -background none icon.svg -resize 144x144 icon-144x144.png
    convert -background none icon.svg -resize 152x152 icon-152x152.png
    convert -background none icon.svg -resize 192x192 icon-192x192.png
    convert -background none icon.svg -resize 384x384 icon-384x384.png
    convert -background none icon.svg -resize 512x512 icon-512x512.png
    convert -background none icon.svg -resize 32x32 favicon.png
    echo "Icons created successfully"
else
    echo "ImageMagick not available. Creating placeholder files."
    # Create placeholder files
    for size in 72 96 128 144 152 192 384 512; do
        touch icon-${size}x${size}.png
    done
    touch favicon.png
fi
