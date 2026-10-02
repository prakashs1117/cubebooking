#!/usr/bin/env node
/**
 * Generate gold wave-M splash logo PNGs at all required densities.
 *
 * Source: assets/bootsplash_logo.svg (fill color patched from red to gold)
 * Output: JS, Android, iOS assets at correct pixel sizes
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SVG_SOURCE = path.join(ROOT, 'assets', 'bootsplash_logo.svg');

// Gold color for Merck brand
const GOLD_HEX = '#F5B700';

// Define all output targets: [outputPath, widthPx, heightPx, description]
const outputs = [
  // JS assets (assets/bootsplash/ — these are the primary active assets)
  [path.join(ROOT, 'assets/bootsplash/logo.png'), 120, 120, 'JS 1x'],
  [path.join(ROOT, 'assets/bootsplash/logo@1,5x.png'), 180, 180, 'JS 1.5x'],
  [path.join(ROOT, 'assets/bootsplash/logo@2x.png'), 240, 240, 'JS 2x'],
  [path.join(ROOT, 'assets/bootsplash/logo@3x.png'), 360, 360, 'JS 3x'],
  [path.join(ROOT, 'assets/bootsplash/logo@4x.png'), 480, 480, 'JS 4x'],

  // JS assets (src/assets/bootsplash/ — backup/legacy location)
  [path.join(ROOT, 'src/assets/bootsplash/logo.png'), 120, 120, 'JS legacy 1x'],
  [path.join(ROOT, 'src/assets/bootsplash/logo@2x.png'), 240, 240, 'JS legacy 2x'],
  [path.join(ROOT, 'src/assets/bootsplash/logo@3x.png'), 360, 360, 'JS legacy 3x'],

  // Android native (square assets)
  [path.join(ROOT, 'android/app/src/main/res/drawable-mdpi/bootsplash_logo.png'), 288, 288, 'Android mdpi'],
  [path.join(ROOT, 'android/app/src/main/res/drawable-hdpi/bootsplash_logo.png'), 432, 432, 'Android hdpi'],
  [path.join(ROOT, 'android/app/src/main/res/drawable-xhdpi/bootsplash_logo.png'), 576, 576, 'Android xhdpi'],
  [path.join(ROOT, 'android/app/src/main/res/drawable-xxhdpi/bootsplash_logo.png'), 864, 864, 'Android xxhdpi'],
  [path.join(ROOT, 'android/app/src/main/res/drawable-xxxhdpi/bootsplash_logo.png'), 1152, 1152, 'Android xxxhdpi'],

  // iOS native
  [path.join(ROOT, 'ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/180.png'), 180, 180, 'iOS 1x'],
  [path.join(ROOT, 'ios/TodoAppRN/Images.xcassets/BootSplashLogo-87d228.imageset/1024.png'), 1024, 1024, 'iOS 3x'],
];

async function generateLogos() {
  try {
    // Read SVG source
    let svgContent = fs.readFileSync(SVG_SOURCE, 'utf8');

    // Patch fill color: red (#D94A49) → gold (#F5B700)
    svgContent = svgContent.replace(/#D94A49/g, GOLD_HEX);

    console.log('✓ SVG patched: red → gold');

    // Generate all PNG outputs
    for (const [outPath, w, h, desc] of outputs) {
      // Ensure output directory exists
      const dir = path.dirname(outPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Rasterize SVG to PNG
      await sharp(Buffer.from(svgContent), { density: 150 })
        .png()
        .resize(w, h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(outPath);

      console.log(`✓ Generated: ${desc} (${w}×${h}) → ${outPath}`);
    }

    console.log('\n✅ All logo assets generated successfully');
  } catch (error) {
    console.error('❌ Error generating logos:', error);
    process.exit(1);
  }
}

generateLogos();
