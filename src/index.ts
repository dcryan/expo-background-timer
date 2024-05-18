import {
  EventEmitter,
  Subscription,
  requireNativeModule,
} from "expo-modules-core";

import {
  BackgroundTaskEvent,
  BackgroundTimerError,
  BackgroundTimerTimeoutClearedEvent,
  BackgroundTimerTimeoutEvent,
} from "./ExpoBackgroundTimer.types";
import ExpoBackgroundTimerModule from "./ExpoBackgroundTimerModule";

const emitter = new EventEmitter(
  ExpoBackgroundTimerModule ?? requireNativeModule("ExpoBackgroundTimer")
);

const callbacks: {
  [id: number]: {
    callback: () => void;
    interval: boolean;
    timeout: number;
  };
} = {};

let backgroundTaskStartedListener: Subscription | null = null;
function addBackgroundTimerListener() {
  return emitter.addListener(
    "backgroundTimer.timeout",
    (event: BackgroundTimerTimeoutEvent) => {
      if (__DEV__) console.log("backgroundTimer.timeout: ", event.id);

      if (!callbacks[event.id]) return;

      callbacks[event.id].callback();

      if (callbacks[event.id].interval) {
        ExpoBackgroundTimerModule.setTimeout(
          event.id,
          callbacks[event.id].timeout
        );
        return;
      }

      // Clear the callback
      delete callbacks[event.id];
    }
  );
}

export function startBackgroundTask() {
  return new Promise<BackgroundTaskEvent>((resolve, reject) => {
    const taskListener = emitter.addListener(
      "backgroundTimer.taskStarted",
      (event: BackgroundTaskEvent) => {
        try {
          if (__DEV__)
            console.log("backgroundTimer.taskStarted:", event.status);

          // Only listen for the first event
          taskListener.remove();

          // Add listener for timeout events
          backgroundTaskStartedListener = addBackgroundTimerListener();

          resolve(event);
        } catch (e) {
          reject(e);
        }
      }
    );

    ExpoBackgroundTimerModule.startBackgroundTask();
  });
}

export function stopBackgroundTask() {
  return new Promise<BackgroundTaskEvent>((resolve, reject) => {
    const taskListener = emitter.addListener(
      "backgroundTimer.taskStopped",
      (event: BackgroundTaskEvent) => {
        try {
          if (__DEV__)
            console.log("backgroundTimer.taskStopped:", event.status);

          // Only listen for the first event
          taskListener.remove();

          // Remove listener for timeout events
          backgroundTaskStartedListener?.remove();

          resolve(event);
        } catch (e) {
          reject(e);
        }
      }
    );

    ExpoBackgroundTimerModule.stopBackgroundTask();
  });
}

let uniqueId = 0;

export async function bgSetTimeout(
  callback: () => void,
  timeout: number,
  interval = false
) {
  uniqueId += 1;

  callbacks[uniqueId] = {
    callback,
    interval,
    timeout,
  };

  ExpoBackgroundTimerModule.setTimeout(uniqueId, timeout);

  return uniqueId;
}

export function bgSetInterval(callback: () => void, timeout: number) {
  return bgSetTimeout(callback, timeout, true);
}

export function bgClearTimeout(id: number) {
  delete callbacks[id];
  ExpoBackgroundTimerModule.clearTimeout(id);
}

export function bgClearInterval(id: number) {
  return bgClearTimeout(id);
}

if (__DEV__) {
  emitter.addListener(
    "backgroundTimer.error",
    (event: BackgroundTimerError) => {
      console.log("backgroundTimer.error: ", event.message);
    }
  );

  emitter.addListener(
    "backgroundTimer.started",
    (event: BackgroundTimerTimeoutClearedEvent) => {
      console.log("backgroundTimer.started: ", event.id);
    }
  );

  emitter.addListener(
    "backgroundTimer.timeoutCleared",
    (event: BackgroundTimerTimeoutClearedEvent) => {
      console.log("backgroundTimer.timeoutCleared: ", event.id);
    }
  );
}
