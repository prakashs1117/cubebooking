const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertImageToSplash(inputImagePath) {
  console.log(`🔄 Converting ${inputImagePath} to splash screen formats...`);

  // Check if input file exists
  if (!fs.existsSync(inputImagePath)) {
    console.error(`❌ Input file not found: ${inputImagePath}`);
    console.log('\n💡 Usage examples:');
    console.log('node convert_image_to_splash.js your_image.jpg');
    console.log(
      'node convert_image_to_splash.js src/assets/images/splash/templates/blue_android.jpg',
    );
    return;
  }

  try {
    // Define output paths and dimensions
    const outputs = [
      // Android
      {
        path: 'android/app/src/main/res/drawable/splash_screen.png',
        width: 1080,
        height: 1920,
        format: 'png',
        desc: 'Android drawable',
      },
      // iOS
      {
        path: 'ios/TodoAppRN/Images.xcassets/SplashScreen.imageset/splash.png',
        width: 375,
        height: 667,
        format: 'png',
        desc: 'iOS 1x',
      },
      {
        path: 'ios/TodoAppRN/Images.xcassets/SplashScreen.imageset/splash@2x.png',
        width: 750,
        height: 1334,
        format: 'png',
        desc: 'iOS 2x',
      },
      {
        path: 'ios/TodoAppRN/Images.xcassets/SplashScreen.imageset/splash@3x.png',
        width: 1125,
        height: 2436,
        format: 'png',
        desc: 'iOS 3x',
      },
    ];

    console.log('📱 Processing image for all platforms...');

    for (const output of outputs) {
      // Ensure directory exists
      const dir = path.dirname(output.path);
      fs.mkdirSync(dir, { recursive: true });

      // Process and save image
      await sharp(inputImagePath)
        .resize(output.width, output.height, {
          fit: 'cover', // This will crop if needed to maintain aspect ratio
          position: 'center',
        })
        .png() // Always output as PNG for splash screens
        .toFile(output.path);

      console.log(`✅ Created ${output.desc}: ${output.path}`);
    }

    console.log('\n🎉 All splash screen images generated successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test your app: npm run android && npm run ios');
    console.log(
      '2. Adjust colors in android/app/src/main/res/values/colors.xml if needed',
    );
    console.log('3. Update LaunchScreen.storyboard background color if needed');
  } catch (error) {
    console.error('❌ Error converting image:', error.message);
    console.log('\n💡 Tips:');
    console.log(
      '• Make sure your image is high resolution (at least 1125x2436)',
    );
    console.log('• Use JPG or PNG format');
    console.log('• Ensure the image has good contrast for visibility');
  }
}

// Get input file from command line argument
const inputFile = process.argv[2];

if (!inputFile) {
  console.log('🎨 Image to Splash Screen Converter');
  console.log('');
  console.log('📋 Usage:');
  console.log('node convert_image_to_splash.js <input_image_path>');
  console.log('');
  console.log('📝 Examples:');
  console.log('node convert_image_to_splash.js my_logo.jpg');
  console.log(
    'node convert_image_to_splash.js src/assets/images/splash/templates/blue_android.jpg',
  );
  console.log('node convert_image_to_splash.js ~/Desktop/company_logo.png');
  console.log('');
  console.log('📁 Available template images:');

  const templatesDir = 'src/assets/images/splash/templates';
  if (fs.existsSync(templatesDir)) {
    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.jpg'));
    files.forEach(file => console.log(`  • ${templatesDir}/${file}`));
  }

  process.exit(1);
}

// Run the conversion
convertImageToSplash(inputFile);
