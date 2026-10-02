const fs = require('fs');
const path = require('path');

const sourceDir = '/Users/M324550/Downloads/com.merck.ocb-firebase';
const androidDest = './android/app';
const iosDest = './ios/MMS';

const files = [
  { source: 'google-services.json', dest: androidDest, platform: 'Android' },
  { source: 'GoogleService-Info.plist', dest: iosDest, platform: 'iOS' }
];

console.log('Setting up Firebase configuration files...\n');

let success = true;
files.forEach(({ source, dest, platform }) => {
  const srcPath = path.join(sourceDir, source);
  const destPath = path.join(dest, source);

  if (!fs.existsSync(srcPath)) {
    console.error(`❌ Error: ${source} not found in ${sourceDir}`);
    success = false;
    return;
  }

  try {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ ${platform} config copied: ${destPath}`);
  } catch (err) {
    console.error(`❌ Failed to copy ${source}: ${err.message}`);
    success = false;
  }
});

if (success) {
  console.log('\n✅ Firebase configuration setup complete!');
  process.exit(0);
} else {
  process.exit(1);
}
