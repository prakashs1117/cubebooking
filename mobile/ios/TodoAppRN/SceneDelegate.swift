import UIKit
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = (scene as? UIWindowScene) else { return }

    let appDelegate = UIApplication.shared.delegate as? AppDelegate
    let window = UIWindow(windowScene: windowScene)

    // Initialize React Native
    if appDelegate?.reactNativeFactory == nil {
      let delegate = ReactNativeDelegate()
      let factory = RCTReactNativeFactory(delegate: delegate)
      delegate.dependencyProvider = RCTAppDependencyProvider()

      appDelegate?.reactNativeDelegate = delegate
      appDelegate?.reactNativeFactory = factory

      factory.startReactNative(
        withModuleName: "TodoAppRN",
        in: window,
        launchOptions: connectionOptions.userActivities.first.flatMap { activity in
          return [UIApplication.LaunchOptionsKey.userActivityDictionary: [UIApplication.LaunchOptionsKey.userActivityType: activity.activityType]]
        }
      )

      // Initialize BootSplash — keeps splash visible until JS calls BootSplash.hide()
      RNBootSplash.initWithStoryboard("BootSplash", rootView: window.rootViewController?.view)
    }

    window.makeKeyAndVisible()
    self.window = window
  }
}
