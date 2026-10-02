# 📸 Easy JPG Image Replacement Guide

## 🎯 Quick Start - Replace Splash Screen in 2 Steps

### Step 1: Choose Your Method

**Method A: Use Provided Templates (Fastest)**

```bash
# Copy any template and use the conversion script
node convert_image_to_splash.js src/assets/images/splash/templates/blue_android.jpg
```

**Method B: Use Your Own Image**

```bash
# Convert your own image
node convert_image_to_splash.js path/to/your/image.jpg
```

### Step 2: Test Your App

```bash
npm run android  # Test on Android
npm run ios      # Test on iOS
```

**That's it! Your splash screen is updated.** 🎉

---

## 📁 Reference Files Structure

```
📦 src/assets/images/splash/
├── 🎨 templates/          # Ready-to-use color templates
│   ├── blue_android.jpg   # Professional blue (1080x1920)
│   ├── blue_ios_1x.jpg    # Professional blue (375x667)
│   ├── blue_ios_2x.jpg    # Professional blue (750x1334)
│   ├── blue_ios_3x.jpg    # Professional blue (1125x2436)
│   ├── purple_*.jpg       # Creative purple templates
│   ├── green_*.jpg        # Fresh green templates
│   ├── orange_*.jpg       # Energy orange templates
│   ├── red_*.jpg          # Bold red templates
│   └── gray_*.jpg         # Minimal gray templates
│
├── 📐 reference/          # Size guides and current designs
│   ├── current_splash.jpg     # Your current splash screen
│   ├── current_splash@2x.jpg  # Current design 2x
│   ├── current_splash@3x.jpg  # Current design 3x
│   ├── size_guide_android.jpg # Android size reference
│   ├── size_guide_ios_1x.jpg  # iOS 1x size reference
│   ├── size_guide_ios_2x.jpg  # iOS 2x size reference
│   └── size_guide_ios_3x.jpg  # iOS 3x size reference
│
└── 🖼️ splash_source.png   # Original high-quality source
```

## 🎨 Available Color Templates

| Template       | Color Code | Best For                          |
| -------------- | ---------- | --------------------------------- |
| `blue_*.jpg`   | #3B82F6    | Professional, Corporate, Business |
| `purple_*.jpg` | #8B5CF6    | Creative, Tech, Modern            |
| `green_*.jpg`  | #10B981    | Health, Finance, Growth           |
| `orange_*.jpg` | #F97316    | Energy, Food, Fitness             |
| `red_*.jpg`    | #EF4444    | Entertainment, Gaming, Bold       |
| `gray_*.jpg`   | #6B7280    | Minimal, Clean, Elegant           |

## 🔧 Advanced Customization

### Using Your Own Logo/Image

1. **Prepare your image**:

   - Format: JPG, PNG, or SVG
   - Resolution: At least 1125x2436 pixels (highest iOS resolution)
   - Aspect ratio: Vertical orientation recommended

2. **Convert using the script**:

   ```bash
   node convert_image_to_splash.js your_company_logo.jpg
   ```

3. **The script automatically**:
   - Resizes to all required dimensions
   - Crops from center if needed
   - Converts to PNG format
   - Places in correct directories

### Manual Replacement (Advanced Users)

If you prefer manual control:

**Android (1 file needed):**

```bash
# Replace this file:
android/app/src/main/res/drawable/splash_screen.png
# Dimensions: 1080x1920 pixels
```

**iOS (3 files needed):**

```bash
# Replace these files:
ios/TodoAppRN/Images.xcassets/SplashScreen.imageset/splash.png     # 375x667
ios/TodoAppRN/Images.xcassets/SplashScreen.imageset/splash@2x.png  # 750x1334
ios/TodoAppRN/Images.xcassets/SplashScreen.imageset/splash@3x.png  # 1125x2436
```

## 🎭 Design Tips for Great Splash Screens

### ✅ Best Practices

- **Keep it simple**: Complex designs slow loading
- **Use high contrast**: Ensure logo/text is visible
- **Brand consistency**: Match your app's design language
- **Test on devices**: Check on various screen sizes
- **Fast recognition**: Make your brand immediately identifiable

### 🚫 What to Avoid

- Small text (won't be readable)
- Complex gradients (may look pixelated)
- Too many colors (keep it clean)
- Landscape-oriented designs (apps launch in portrait)
- Copyright images (use your own content)

## 🏗️ Project-Specific Customization

### For Different App Types

**E-commerce App:**

```bash
# Use warm, trustworthy colors
node convert_image_to_splash.js src/assets/images/splash/templates/blue_android.jpg
```

**Fitness App:**

```bash
# Use energetic, motivational colors
node convert_image_to_splash.js src/assets/images/splash/templates/green_android.jpg
```

**Creative App:**

```bash
# Use vibrant, inspiring colors
node convert_image_to_splash.js src/assets/images/splash/templates/purple_android.jpg
```

### Customizing Background Colors

After replacing images, you can adjust background colors:

**Android:**
Edit `android/app/src/main/res/values/colors.xml`:

```xml
<color name="splash_background">#YourHexColor</color>
```

**iOS:**
Edit the background color in `ios/TodoAppRN/LaunchScreen.storyboard`:

```xml
<color key="backgroundColor" red="0.4" green="0.5" blue="0.9" alpha="1"/>
```

## 🛠️ Troubleshooting

### Common Issues

**"Image looks stretched"**

- Solution: Use the converter script - it maintains aspect ratios
- Alternative: Manually crop your image to match target dimensions

**"Colors don't match between platforms"**

- Solution: Update background colors in both Android and iOS configs
- Use a color picker to get exact hex values

**"Image is blurry"**

- Solution: Use higher resolution source images (minimum 1125x2436)
- Ensure your original image is sharp and high-quality

**"Script not working"**

```bash
# Make sure you're in the project root directory
pwd  # Should show: .../todoApp

# Make sure Sharp is installed
npm list sharp

# If not installed:
npm install --save-dev sharp
```

### Testing Your Changes

```bash
# Clean builds if images don't update immediately
cd android && ./gradlew clean && cd ..  # Android clean
cd ios && xcodebuild clean && cd ..     # iOS clean

# Then rebuild
npm run android
npm run ios
```

## 📱 Device-Specific Considerations

### Android

- Uses one image scaled for all devices
- Background color from `colors.xml` shows during loading
- Image is centered and scaled to fit

### iOS

- Uses different images for different screen densities
- LaunchScreen.storyboard handles layout
- Images should match exact dimensions for best quality

## 🚀 Production Checklist

Before releasing your app:

- [ ] Test splash screen on multiple devices
- [ ] Verify images are not pixelated
- [ ] Check loading time (should be instant)
- [ ] Ensure brand consistency with app design
- [ ] Test in both light and dark device themes
- [ ] Verify colors match your brand guidelines
- [ ] Check that text/logos are readable at all sizes

## 📚 Additional Resources

### Design Tools

- **Figma**: Free design tool with templates
- **Canva**: Easy-to-use online design platform
- **Adobe XD**: Professional design software

### Image Optimization

- **TinyPNG**: Compress PNG files
- **ImageOptim**: Mac app for image optimization
- **Squoosh**: Google's web-based image compressor

### Color Tools

- **Coolors.co**: Color palette generator
- **Adobe Color**: Professional color tools
- **Material Design Colors**: Google's color system

---

## 🎉 You're All Set!

With these tools and templates, replacing splash screen images is now as simple as running one command. Whether you're using the provided color templates or your own custom designs, your app will have a professional, polished splash screen that loads instantly and looks great on all devices.

**Happy coding!** 🚀
