import UIKit
import UserNotifications
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
// import FirebaseMessaging
import RNBootSplash

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  // Firebase disabled - MessagingDelegate removed
  // class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()

    // Set delegates for APNs + FCM
    UNUserNotificationCenter.current().delegate = self
//    Messaging.messaging().delegate = self

    // Register with APNs — required for FCM token generation on iOS
    application.registerForRemoteNotifications()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "TodoAppRN",
      in: window,
      launchOptions: launchOptions
    )

    // Initialize BootSplash — keeps splash visible until JS calls BootSplash.hide()
    RNBootSplash.initWithStoryboard("BootSplash", rootView: window?.rootViewController?.view)

    return true
  }

  // MARK: - APNs token registration

  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    // Firebase disabled - no-op
    // Forward the APNs token to Firebase so it can exchange it for an FCM token
    // Messaging.messaging().apnsToken = deviceToken
  }

  func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("❌ APNs registration failed: \(error.localizedDescription)")
  }

  // MARK: - FCM token refresh (MessagingDelegate)
  // Firebase disabled - MessagingDelegate methods removed

  /* Firebase disabled - uncomment when Firebase packages are reinstalled
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("📱 FCM token refreshed: \(fcmToken ?? "nil")")
    // The JS layer (pushNotificationService.ts) also listens via onTokenRefresh —
    // no further action needed here unless you want to send it to your backend directly.
  }
  */

  // MARK: - UNUserNotificationCenterDelegate

  // Called when a notification arrives while the app is in the foreground.
  // Passing .banner + .sound lets the system show the notification visually
  // (the JS onMessage handler in pushNotificationService.ts also fires).
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler([.banner, .sound, .badge])
  }

  // Called when the user taps a notification (foreground or background).
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    completionHandler()
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
