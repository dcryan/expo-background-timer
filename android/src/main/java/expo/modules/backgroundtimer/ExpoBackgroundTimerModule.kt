package expo.modules.backgroundtimer

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Timer
import java.util.TimerTask


class ExpoBackgroundTimerModule : Module() {

    // Instead of a UIBackgroundTaskIdentifier, we use a wake lock to keep the CPU awake.
    private var wakeLock: PowerManager.WakeLock? = null

    // Store Timer instances keyed by timeoutId.
    private val timers = mutableMapOf<Int, Timer>()

    // Flag to enable/disable background execution.
    private var shouldRunInBackground = false

    override fun definition() = ModuleDefinition {
        Name("ExpoBackgroundTimer")

        // Define the events to be sent to JavaScript.
        Events(
            "backgroundTimer.taskStarted",
            "backgroundTimer.taskStopped",
            "backgroundTimer.started",
            "backgroundTimer.timeout",
            "backgroundTimer.timeoutCleared",
            "backgroundTimer.error"
        )

        // Trigger wake lock acquisition when the app goes background.
        OnActivityEntersBackground {
            if (shouldRunInBackground) {
                startBackgroundTask()
            }
        }

        // Release wake lock when the app comes to the foreground.
        OnActivityEntersForeground {
            if (shouldRunInBackground) {
                stopBackgroundTask()
            }
        }

        // Module functions
        Function("setBackgroundExecutionEnabled") { enabled: Boolean ->
            setBackgroundExecutionEnabled(enabled)
        }

        Function("setTimeout") { timeoutId: Int, duration: Double ->
            // Note: duration is expected in milliseconds.
            setTimeout(timeoutId, duration, repeats = false)
        }

        Function("setInterval") { timeoutId: Int, duration: Double ->
            setTimeout(timeoutId, duration, repeats = true)
        }

        Function("clearTimeout") { timeoutId: Int ->
            clearTimeout(timeoutId)
        }
    }

    private fun setBackgroundExecutionEnabled(enabled: Boolean) {
        shouldRunInBackground = enabled
    }

    private fun startBackgroundTask() {
        // Check if a wake lock is already held.
        if (wakeLock?.isHeld == true) {
            this@ExpoBackgroundTimerModule.sendEvent("backgroundTimer.error", mapOf("message" to "Background task is already running"))
            return
        }
        // Acquire a PARTIAL_WAKE_LOCK to keep the CPU running in the background.
        val powerManager = appContext.reactContext?.getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ExpoBackgroundTimer::Wakelock")
        // Acquire the wake lock for a limited time (e.g., 3 minutes).
        wakeLock?.acquire(3 * 60 * 1000L)
        if (wakeLock == null || !wakeLock!!.isHeld) {
            this@ExpoBackgroundTimerModule.sendEvent("backgroundTimer.error", mapOf("message" to "Failed to start background task"))
            return
        }
        this@ExpoBackgroundTimerModule.sendEvent("backgroundTimer.taskStarted", mapOf("status" to "running"))
    }

    private fun stopBackgroundTask() {
        if (wakeLock == null || !wakeLock!!.isHeld) {
            this@ExpoBackgroundTimerModule.sendEvent("backgroundTimer.error", mapOf("message" to "Background task is not running"))
            return
        }
        wakeLock?.release()
        wakeLock = null
        this@ExpoBackgroundTimerModule.sendEvent("backgroundTimer.taskStopped", mapOf("status" to "stopped"))
    }

    private fun setTimeout(timeoutId: Int, duration: Double, repeats: Boolean = false) {
        this@ExpoBackgroundTimerModule.sendEvent("backgroundTimer.started", mapOf("id" to timeoutId))
        val timer = Timer()
        val task = object : TimerTask() {
            override fun run() {
                // Post to the main thread to safely send events.
                Handler(Looper.getMainLooper()).post {
                    this@ExpoBackgroundTimerModule.sendEvent("backgroundTimer.timeout", mapOf("id" to timeoutId))
                }
                if (!repeats) {
                    timers.remove(timeoutId)
                    timer.cancel()
                }
            }
        }
        timers[timeoutId] = timer
        if (repeats) {
            timer.scheduleAtFixedRate(task, duration.toLong(), duration.toLong())
        } else {
            timer.schedule(task, duration.toLong())
        }
    }

    private fun clearTimeout(timeoutId: Int) {
        val timer = timers[timeoutId]
        if (timer == null) {
            this@ExpoBackgroundTimerModule.sendEvent("backgroundTimer.error", mapOf("message" to "Timeout $timeoutId is not found."))
            return
        }
        timer.cancel()
        timers.remove(timeoutId)
        this@ExpoBackgroundTimerModule.sendEvent("backgroundTimer.timeoutCleared", mapOf("id" to timeoutId))
    }
}
