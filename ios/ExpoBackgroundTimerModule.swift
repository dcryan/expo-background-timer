import UIKit
import ExpoModulesCore

public class ExpoBackgroundTimerModule: Module {
    private var bgTask: UIBackgroundTaskIdentifier = .invalid
    private var setTimeoutWorkItems: [Int: DispatchWorkItem] = [:]

    public func definition() -> ModuleDefinition {
        Name("ExpoBackgroundTimer")

        Events(
            "backgroundTimer.taskStarted",
            "backgroundTimer.taskStopped",
            "backgroundTimer.started",
            "backgroundTimer.timeout",
            "backgroundTimer.timeoutCleared",
            "backgroundTimer.error"
        )

        Function("startBackgroundTask") {
            self.startBackgroundTask()
        }

        Function("stopBackgroundTask") {
            self.stopBackgroundTask()
        }

        Function("setTimeout") { (timeoutId: Int, timeout: Double) in
            self.setTimeout(timeoutId: timeoutId, timeout: timeout)
        }

        Function("clearTimeout") { (timeoutId: Int) in
            self.clearTimeout(timeoutId: timeoutId)
        }
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

        DispatchQueue.main.async { [weak self] in
            self?.sendEvent(
                "backgroundTimer.taskStarted",
                ["status": "running"]
            )
        }
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

        DispatchQueue.main.async { [weak self] in
            self?.sendEvent(
                "backgroundTimer.taskStopped",
                ["status": "stopped"]
            )
        }
    }

    private func setTimeout(timeoutId: Int, timeout: Double) {
        guard bgTask != .invalid else {
            self.sendEvent(
                "backgroundTimer.error",
                ["message": "Background task is not running"]
            )
            return
        }

        self.sendEvent("backgroundTimer.started", ["id": timeoutId])

        setTimeoutWorkItems[timeoutId] = DispatchWorkItem { [weak self] in
            setTimeoutWorkItems.removeValue(forKey: timeoutId)

            self?.sendEvent("backgroundTimer.timeout", ["id": timeoutId])
        }

        let workItem = setTimeoutWorkItems[timeoutId]!

        DispatchQueue.main.asyncAfter(
            deadline: .now() + timeout / 1000,
            execute: workItem
        )
    }

    private func clearTimeout(timeoutId: Int) {
        guard bgTask != .invalid else {
            self.sendEvent(
                "backgroundTimer.error",
                ["message": "Background task is not running"]
            )
            return
        }

        guard setTimeoutWorkItems[timeoutId] != nil else {
            self.sendEvent(
                "backgroundTimer.error",
                ["message": "Timeout \(timeoutId) is not found."]
            )
            return
        }

        setTimeoutWorkItems[timeoutId]?.cancel()

        setTimeoutWorkItems.removeValue(forKey: timeoutId)

        self.sendEvent("backgroundTimer.timeoutCleared", ["id": timeoutId])
    }
}

