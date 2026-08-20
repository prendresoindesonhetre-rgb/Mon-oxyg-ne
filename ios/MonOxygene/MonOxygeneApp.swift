import SwiftUI

@main
struct MonOxygeneApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
                .preferredColorScheme(.light)
                .persistentSystemOverlays(.hidden)
        }
    }
}
