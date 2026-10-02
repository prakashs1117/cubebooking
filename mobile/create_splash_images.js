const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createSplashScreenImages() {
  console.log('🎨 Creating splash screen images...');

  // Create directories
  const androidDrawableDir = 'android/app/src/main/res/drawable';
  const iosImageSetDir = 'ios/TodoAppRN/Images.xcassets/SplashScreen.imageset';
  const assetsDir = 'src/assets/images/splash';

  // Ensure directories exist
  [androidDrawableDir, iosImageSetDir, assetsDir].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  });

  // Create a clean, professional SVG splash screen
  const createSVG = (width, height) => `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>

      <!-- Main Icon Circle -->
      <circle cx="${width / 2}" cy="${
    height / 2 - 60
  }" r="60" fill="white" filter="url(#shadow)"/>

      <!-- App Icon (Simple Design) -->
      <circle cx="${width / 2}" cy="${height / 2 - 60}" r="40" fill="#667eea"/>
      <rect x="${width / 2 - 15}" y="${
    height / 2 - 75
  }" width="30" height="30" rx="4" fill="white"/>

      <!-- App Name -->
      <text x="${width / 2}" y="${height / 2 + 40}"
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="28"
            font-weight="bold"
            fill="white">Your App Name</text>

      <!-- Subtitle -->
      <text x="${width / 2}" y="${height / 2 + 80}"
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="16"
            fill="rgba(255,255,255,0.8)">Welcome to your app</text>
    </svg>
  `;

  try {
    // Generate images for Android
    console.log('📱 Generating Android splash screen...');
    const androidSVG = createSVG(1080, 1920);
    await sharp(Buffer.from(androidSVG))
      .png()
      .toFile(path.join(androidDrawableDir, 'splash_screen.png'));

    // Generate images for iOS (different resolutions)
    console.log('🍎 Generating iOS splash screens...');

    // iPhone SE (1x)
    await sharp(Buffer.from(createSVG(375, 667)))
      .png()
      .toFile(path.join(iosImageSetDir, 'splash.png'));

    // iPhone 8 (2x)
    await sharp(Buffer.from(createSVG(750, 1334)))
      .png()
      .toFile(path.join(iosImageSetDir, 'splash@2x.png'));

    // iPhone X/11/12 (3x)
    await sharp(Buffer.from(createSVG(1125, 2436)))
      .png()
      .toFile(path.join(iosImageSetDir, 'splash@3x.png'));

    // Save source image for reference
    await sharp(Buffer.from(createSVG(1080, 1920)))
      .png()
      .toFile(path.join(assetsDir, 'splash_source.png'));

    console.log('✅ All splash screen images created successfully!');
    console.log('\n📋 Files created:');
    console.log(`   📱 Android: ${androidDrawableDir}/splash_screen.png`);
    console.log(
      `   🍎 iOS: ${iosImageSetDir}/splash.png, splash@2x.png, splash@3x.png`,
    );
    console.log(`   📦 Source: ${assetsDir}/splash_source.png`);
  } catch (error) {
    console.error('❌ Error creating splash images:', error.message);
    process.exit(1);
  }
}

// Run the function
createSplashScreenImages();
