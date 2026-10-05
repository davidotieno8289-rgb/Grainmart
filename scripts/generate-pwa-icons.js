/**
 * PWA Icon Generator Script
 * 
 * Run with: node scripts/generate-pwa-icons.js
 * 
 * This creates placeholder SVG icons for PWA.
 * For production, replace with actual PNG icons.
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const splashDir = path.join(__dirname, '..', 'public', 'splash');

// Create directories
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}
if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

// Icon sizes for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate SVG icon
function generateIconSVG(size) {
  const fontSize = Math.floor(size * 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1A1208"/>
      <stop offset="50%" style="stop-color:#2a1a06"/>
      <stop offset="100%" style="stop-color:#2D5016"/>
    </linearGradient>
  </defs>
  <rect fill="url(#bg)" width="${size}" height="${size}" rx="${Math.floor(size * 0.15)}"/>
  <text fill="#C8851A" font-family="Arial, sans-serif" font-size="${fontSize}" x="50%" y="55%" text-anchor="middle" dominant-baseline="middle">🌾</text>
</svg>`;
}

// Generate splash screen SVG
function generateSplashSVG(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="splash-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1A1208"/>
      <stop offset="50%" style="stop-color:#2a1a06"/>
      <stop offset="100%" style="stop-color:#2D5016"/>
    </linearGradient>
  </defs>
  <rect fill="url(#splash-bg)" width="${width}" height="${height}"/>
  <text fill="#C8851A" font-family="Arial, sans-serif" font-size="120" x="50%" y="45%" text-anchor="middle" dominant-baseline="middle">🌾</text>
  <text fill="#C8851A" font-family="Georgia, serif" font-weight="bold" font-size="48" x="50%" y="58%" text-anchor="middle" dominant-baseline="middle">GrainMart</text>
  <text fill="#7A6040" font-family="Arial, sans-serif" font-size="24" x="50%" y="65%" text-anchor="middle" dominant-baseline="middle">Kenya's Premier Grain Marketplace</text>
</svg>`;
}

// Generate icons
console.log('Generating PWA icons...');
iconSizes.forEach(size => {
  const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, generateIconSVG(size));
  console.log(`  Created: ${filename}`);
});

// Generate splash screens
const splashSizes = [
  [640, 1136],   // iPhone 5
  [750, 1334],   // iPhone 6/7/8
  [1242, 2208],  // iPhone 6+/7+/8+
  [1125, 2436],  // iPhone X/XS
  [1536, 2048],  // iPad
  [1668, 2224],  // iPad Pro 10.5"
  [2048, 2732],  // iPad Pro 12.9"
];

console.log('\\nGenerating splash screens...');
splashSizes.forEach(([width, height]) => {
  const filename = path.join(splashDir, `splash-${width}x${height}.svg`);
  fs.writeFileSync(filename, generateSplashSVG(width, height));
  console.log(`  Created: ${filename}`);
});

console.log('\\n✅ PWA assets generated!');
console.log('\\nNote: For production, convert SVGs to PNGs using:');
console.log('  - https://cloudconvert.com/svg-to-png');
console.log('  - Or use sharp/canvas in Node.js');
console.log('  - Update manifest.json to reference .png files');
