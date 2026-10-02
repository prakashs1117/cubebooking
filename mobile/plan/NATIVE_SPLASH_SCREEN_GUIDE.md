# Native Splash Screen Implementation Guide

## 🎯 Overview

This project implements **native splash screens** for both iOS and Android platforms. This approach is more reliable, performant, and compatible with React Native's new architecture compared to third-party libraries.

## ✨ Benefits of Native Splash Screens

- ✅ **Zero Dependencies**: No additional npm packages required
- ✅ **Better Performance**: Native implementation is faster
- ✅ **New Architecture Compatible**: Works with React Native's new architecture
- ✅ **OS Standard**: Uses platform-specific splash screen systems
- ✅ **Reliable**: No JavaScript bridge required
- ✅ **Easy to Replace**: Simple file replacement for different projects

## 📱 Current Implementation

### Beautiful Design Features:

- **Professional Gradient**: Blue to purple gradient background
- **Clean Icon**: Modern circular icon design
- **Customizable Text**: App name and subtitle
- **Smooth Transitions**: OS-handled show/hide animations
- **Multi-Resolution**: Perfect scaling on all devices

## 🖼️ File Structure

```
📦 Project
├── 🤖 Android Implementation
│   ├── android/app/src/main/res/drawable/
│   │   ├── splash_screen.png           # Main splash image (1080x1920)
│   │   └── launch_screen_background.xml # Background configuration
│   ├── android/app/src/main/res/layout/
│   │   └── launch_screen.xml           # Layout definition
│   └── android/app/src/main/res/values/
│       └── colors.xml                  # Color definitions
│
├── 🍎 iOS Implementation
│   ├── ios/TodoAppRN/LaunchScreen.storyboard # Main storyboard
│   └── ios/TodoAppRN/Images.xcassets/SplashScreen.imageset/
│       ├── Contents.json               # Asset configuration
│       ├── splash.png                  # 375x667 (1x)
│       ├── splash@2x.png              # 750x1334 (2x)
│       └── splash@3x.png              # 1125x2436 (3x)
│
└── 📦 Source Assets
    └── src/assets/images/splash/
        └── splash_source.png           # Source reference image
```

## 🔄 How to Replace Images for Different Projects

### 🚀 Super Easy Method (Recommended)

**Step 1: Use the JPG Converter**

```bash
# Option A: Use provided color templates
node convert_image_to_splash.js src/assets/images/splash/templates/blue_android.jpg

# Option B: Use your own image
node convert_image_to_splash.js path/to/your/image.jpg
```

**Step 2: Test**

```bash
npm run android && npm run ios
```

**That's it!** ✅ See [JPG_REPLACEMENT_GUIDE.md](./JPG_REPLACEMENT_GUIDE.md) for detailed instructions.

### 📁 Available Ready-to-Use Templates

We've provided color-coded JPG templates for instant replacement:

| Color     | File                     | Best For                |
| --------- | ------------------------ | ----------------------- |
| 🔵 Blue   | `templates/blue_*.jpg`   | Professional, Corporate |
| 🟣 Purple | `templates/purple_*.jpg` | Creative, Tech          |
| 🟢 Green  | `templates/green_*.jpg`  | Health, Finance         |
| 🟠 Orange | `templates/orange_*.jpg` | Energy, Food            |
| 🔴 Red    | `templates/red_*.jpg`    | Entertainment, Bold     |
| ⚫ Gray   | `templates/gray_*.jpg`   | Minimal, Clean          |

### 🛠️ Advanced Method (For Custom Designs)

Use the provided script to generate all required sizes:

```bash
# 1. Update the create_splash_images.js file with your design
# 2. Modify the SVG in the script:
#    - Change colors: Update the gradient stops
#    - Change text: Update "Your App Name" and subtitle
#    - Change icon: Modify the icon design
# 3. Run the generator
node create_splash_images.js
```

**Or manually create images:**

**Android (1 image needed):**

- `android/app/src/main/res/drawable/splash_screen.png`
- Size: **1080x1920px** (or any 16:9 ratio)

**iOS (3 images needed):**

- `ios/TodoAppRN/Images.xcassets/SplashScreen.imageset/splash.png` - **375x667px**
- `ios/TodoAppRN/Images.xcassets/SplashScreen.imageset/splash@2x.png` - **750x1334px**
- `ios/TodoAppRN/Images.xcassets/SplashScreen.imageset/splash@3x.png` - **1125x2436px**

### Step 3: Update Colors (Optional)

**Android Colors:**
Edit `android/app/src/main/res/values/colors.xml`:

```xml
<color name="splash_background">#YourBrandColor</color>
```

**iOS Colors:**
Edit `ios/TodoAppRN/LaunchScreen.storyboard` background color:

- Open in Xcode or text editor
- Find `backgroundColor` and update RGB values

### Step 4: Test Your Changes

```bash
# Test Android
npm run android

# Test iOS
npm run ios
```

## 🛠️ Customization Options

### 1. Change Background Color

**Android:**

```xml
<!-- android/app/src/main/res/values/colors.xml -->
<color name="splash_background">#667eea</color>
```

**iOS:**
Update the `backgroundColor` in `LaunchScreen.storyboard`:

```xml
<color key="backgroundColor" red="0.4" green="0.49" blue="0.91" alpha="1"/>
```

### 2. Adjust Image Scaling

**Android:**
Edit `android/app/src/main/res/layout/launch_screen.xml`:

```xml
<!-- Options: centerCrop, fitCenter, centerInside -->
<ImageView android:scaleType="centerCrop" />
```

**iOS:**
Edit `LaunchScreen.storyboard`:

```xml
<!-- Options: scaleAspectFill, scaleAspectFit, scaleToFill -->
<imageView contentMode="scaleAspectFill" />
```

### 3. Image Positioning

**Android:**

```xml
<!-- Center, top, bottom, etc. -->
<LinearLayout android:gravity="center" />
```

**iOS:**
Adjust constraints in the storyboard for positioning.

## 🎨 Design Templates

### Template 1: Brand Logo + Text

```svg
<!-- Circular logo with brand colors -->
<circle cx="center" cy="center" r="60" fill="brandColor"/>
<text>Brand Name</text>
```

### Template 2: Minimal Icon

```svg
<!-- Simple geometric icon -->
<rect rx="8" fill="white"/>
<text>App Name</text>
```

### Template 3: Full Brand

```svg
<!-- Full brand treatment -->
<image href="logo.svg"/>
<text>Full Brand Name</text>
<text>Tagline</text>
```

## 🚀 Performance Tips

1. **Optimize Images**:

   - Use PNG with optimized compression
   - Keep file size under 200KB per image
   - Use tools like ImageOptim or TinyPNG

2. **Fast Loading**:

   - Simple designs load faster
   - Avoid complex gradients in images
   - Use solid colors when possible

3. **Memory Usage**:
   - Don't create unnecessarily large images
   - Stick to recommended dimensions

## 🔧 Troubleshooting

### Common Issues:

1. **Images not showing on Android**:

   - Check file name: `splash_screen.png` (no spaces, lowercase)
   - Verify image is in `drawable` folder
   - Check `launch_screen.xml` references correct filename

2. **Images not showing on iOS**:

   - Verify all 3 image sizes exist
   - Check `Contents.json` is properly formatted
   - Ensure `LaunchScreen.storyboard` references "SplashScreen"

3. **Images appear stretched**:

   - Check image aspect ratios match target device ratios
   - Adjust `scaleType` (Android) or `contentMode` (iOS)

4. **Colors don't match**:
   - Use color picker to get exact RGB values
   - Convert hex colors to RGB for iOS storyboard

### Build Issues:

```bash
# Clean builds if images don't update
# Android
cd android && ./gradlew clean && cd ..

# iOS
cd ios && xcodebuild clean && cd ..
```

## 📋 Project Migration Checklist

When moving this splash screen to a different project:

- [ ] Copy all splash screen image files
- [ ] Copy Android layout and drawable XML files
- [ ] Copy iOS storyboard and imageset
- [ ] Update `colors.xml` with new brand colors
- [ ] Test on both platforms
- [ ] Update app name in images if needed
- [ ] Verify image scaling on different devices

## 🎯 Best Practices

1. **Consistent Branding**: Use the same design language as your app
2. **Fast Recognition**: Make your brand/app immediately identifiable
3. **Simple Design**: Complex designs can slow down launch time
4. **Platform Guidelines**: Follow iOS and Android design guidelines
5. **Testing**: Test on multiple device sizes and orientations
6. **Accessibility**: Ensure sufficient color contrast

## 📚 Resources

- [iOS Launch Screen Guidelines](https://developer.apple.com/design/human-interface-guidelines/launching)
- [Android Splash Screen API](https://developer.android.com/develop/ui/views/launch/splash-screen)
- [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)

---

## 🎉 Ready to Use!

Your splash screen is now fully configured and ready for production. The native implementation provides the best user experience with zero dependencies and maximum compatibility.

**Need to customize for a different project?** Just replace the images and update colors - it's that simple! 🚀
