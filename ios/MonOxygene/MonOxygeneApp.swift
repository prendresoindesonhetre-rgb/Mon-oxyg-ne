import SwiftUI
import UIKit

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        supportedInterfaceOrientationsFor window: UIWindow?
    ) -> UIInterfaceOrientationMask {
        .landscape
    }
}

enum LandscapeLock {
    static func enforce() {
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }

        for scene in scenes {
            if #available(iOS 16.0, *) {
                scene.requestGeometryUpdate(
                    .iOS(interfaceOrientations: .landscape)
                ) { _ in }
            }
        }

        UIViewController.attemptRotationToDeviceOrientation()
    }
}

@main
struct MonOxygeneApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup {
            RootView()
                .preferredColorScheme(.light)
                .persistentSystemOverlays(.hidden)
                .onAppear {
                    LandscapeLock.enforce()
                }
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)) { _ in
                    LandscapeLock.enforce()
                }
        }
    }
}
