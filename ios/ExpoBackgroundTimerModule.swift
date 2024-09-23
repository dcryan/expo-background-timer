import UIKit
import ExpoModulesCore

public class ExpoBackgroundTimerModule: Module {
    private var bgTask: UIBackgroundTaskIdentifier = .invalid
    private var timers: [Int: Timer] = [:]
    private var shouldRunInBackground = false

    public func definition() -> ModuleDefinition {
        Name("ExpoBackgroundTimer")

        OnAppEntersBackground {
            if self.shouldRunInBackground {
                self.startBackgroundTask()
            }
        }

        OnAppBecomesActive {
            if self.shouldRunInBackground {
                self.stopBackgroundTask()
            }
        }

        Events(
            "backgroundTimer.taskStarted",
            "backgroundTimer.taskStopped",
            "backgroundTimer.started",
            "backgroundTimer.timeout",
            "backgroundTimer.timeoutCleared",
            "backgroundTimer.error"
        )

        Function("setBackgroundExecutionEnabled") { (enabled: Bool) in
            self.setBackgroundExecutionEnabled(enabled: enabled)
        }

        Function("setTimeout") { (timeoutId: Int, duration: Double) in
            self.setTimeout(timeoutId: timeoutId, duration: duration, repeats: false)
        }

        Function("setInterval") { (timeoutId: Int, duration: Double) in
            self.setTimeout(timeoutId: timeoutId, duration: duration, repeats: true)
        }

        Function("clearTimeout") { (timeoutId: Int) in
            self.clearTimeout(timeoutId: timeoutId)
        }
    }

    private func setBackgroundExecutionEnabled(enabled: Bool) {
        self.shouldRunInBackground = enabled
    }

    private func startBackgroundTask() {
        guard bgTask == .invalid else {
            self.sendEvent(
                "backgroundTimer.error",
                ["message": "Background task is already running"]
            )
            return
        }

        bgTask = UIApplication.shared.beginBackgroundTask(withName: "RNBackgroundTimer") { [weak self] in
            self?.stopBackgroundTask()
        }

        if bgTask == .invalid {
            self.sendEvent("backgroundTimer.error", ["message": "Failed to start background task"])
            return
        }

        self.sendEvent(
            "backgroundTimer.taskStarted",
            ["status": "running"]
        )
    }

    private func stopBackgroundTask() {
        guard bgTask != .invalid else {
            self.sendEvent(
                "backgroundTimer.error",
                ["message": "Background task is not running"]
            )
            return
        }

        UIApplication.shared.endBackgroundTask(self.bgTask)
        bgTask = .invalid

        self.sendEvent(
            "backgroundTimer.taskStopped",
            ["status": "stopped"]
        )
    }

    private func setTimeout(timeoutId: Int, duration: Double, repeats: Bool = false) {
        self.sendEvent("backgroundTimer.started", ["id": timeoutId])

        let timer = Timer.scheduledTimer(withTimeInterval: duration / 1000, repeats: repeats) { _ in
            self.sendEvent("backgroundTimer.timeout", ["id": timeoutId])

            if !repeats {
                self.timers.removeValue(forKey: timeoutId)
            }
        }

        RunLoop.main.add(timer, forMode: .common)
        self.timers[timeoutId] = timer
    }

    private func clearTimeout(timeoutId: Int) {
        guard let timer = self.timers[timeoutId] else {
            self.sendEvent(
                "backgroundTimer.error",
                ["message": "Timeout \(timeoutId) is not found."]
            )
            return
        }

        timer.invalidate()
        self.timers.removeValue(forKey: timeoutId)
        self.sendEvent("backgroundTimer.timeoutCleared", ["id": timeoutId])
    }
}

