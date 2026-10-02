/**
 * rebrand.config.js — Single source of truth for app identity.
 *
 * Edit this file to change the app name, bundle/application IDs, asset sources,
 * and Firebase config paths. Then run:
 *
 *   yarn rebrand          # both platforms
 *   yarn rebrand:ios      # iOS only
 *   yarn rebrand:android  # Android only
 *   yarn rebrand:dry      # dry-run preview (no files written)
 */

module.exports = {
  // Display name shown under the home screen icon
  appName: 'My M Safety',

  ios: {
    bundleId: 'com.merck.ocb',
    // Also update the *Tests target bundle ID (appends .Tests automatically)
    updateTestTarget: true,
  },

  android: {
    applicationId: 'com.merck.ocb',
    // Keep applicationIdSuffix ".debug" on debug builds — don't clobber it
    preserveDebugSuffix: true,
    // Full Java/Kotlin package rename — only set true if you ALSO need to rename
    // the namespace and move source files. Much larger operation; false is safe.
    renamePackage: false,
    oldPackage: 'com.todoapp',   // required only when renamePackage = true
    newPackage: 'com.merck.ocb', // required only when renamePackage = true
  },

  assets: {
    // Source icon: >= 1024x1024 px, square, no alpha (iOS rejects alpha).
    // Place your master PNG here before running rebrand.
    icon: 'branding/icon.png',
    // Source splash image for react-native-bootsplash
    splash: 'branding/splash.png',
    splashBackground: '#5B1D8A',
  },

  firebase: {
    // Download these from the Firebase Console after registering the new bundle ID.
    ios: 'branding/firebase/GoogleService-Info.plist',
    android: 'branding/firebase/google-services.json',
  },
};
