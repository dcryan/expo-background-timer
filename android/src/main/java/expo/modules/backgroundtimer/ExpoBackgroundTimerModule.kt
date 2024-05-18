package expo.modules.backgroundtimer

import android.os.Handler
import android.os.Looper
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.events.EventName
import java.util.concurrent.ConcurrentHashMap
import android.os.PowerManager
import android.content.Context

class ExpoBackgroundTimerModule : Module() {

  private val handler = Handler(Looper.getMainLooper())
  private val setTimeoutWorkItems = ConcurrentHashMap<Int, Runnable>()
  private lateinit var wakeLock: PowerManager.WakeLock

  override fun definition() = ModuleDefinition {
    Name("ExpoBackgroundTimer")

    Events(
      "backgroundTimer.taskStarted",
      "backgroundTimer.taskStopped",
      "backgroundTimer.started",
      "backgroundTimer.timeout",
      "backgroundTimer.timeoutCleared",
      "backgroundTimer.error"
    )

    OnCreate {
      val powerManager = appContext.reactContext?.getSystemService(Context.POWER_SERVICE) as PowerManager
      wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakeLockTag")
    }

    OnDestroy {
      if (wakeLock.isHeld) wakeLock.release()
    }

    Function("startBackgroundTask") {
      startBackgroundTask()
    }

    Function("stopBackgroundTask") {
      stopBackgroundTask()
    }

    Function("setTimeout") { timeoutId: Int, timeout: Double ->
      setTimeout(timeoutId, timeout)
    }

    Function("clearTimeout") { timeoutId: Int ->
      clearTimeout(timeoutId)
    }
  }

  private fun startBackgroundTask() {
    if (!wakeLock.isHeld) wakeLock.acquire()

    sendEvent("backgroundTimer.taskStarted", mapOf("status" to "running"))
  }

  private fun stopBackgroundTask() {
    if (wakeLock.isHeld) wakeLock.release()

    setTimeoutWorkItems.values.forEach { handler.removeCallbacks(it) }
    setTimeoutWorkItems.clear()

    sendEvent("backgroundTimer.taskStopped", mapOf("status" to "stopped"))
  }

  private fun setTimeout(timeoutId: Int, timeout: Double) {
    val runnable = Runnable {
      setTimeoutWorkItems.remove(timeoutId)
      sendEvent("backgroundTimer.timeout", mapOf("id" to timeoutId))
    }

    setTimeoutWorkItems[timeoutId] = runnable

    handler.postDelayed(runnable, timeout.toLong())
  }

  private fun clearTimeout(timeoutId: Int) {
    if (!setTimeoutWorkItems.containsKey(timeoutId)) {
      sendEvent("backgroundTimer.error", mapOf("message" to "Timeout $timeoutId not found."))
      return
    }

    setTimeoutWorkItems[timeoutId]?.let { handler.removeCallbacks(it) }
    setTimeoutWorkItems.remove(timeoutId)

    sendEvent("backgroundTimer.timeoutCleared", mapOf("id" to timeoutId))
  }
}

