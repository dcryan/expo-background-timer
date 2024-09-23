import { EventEmitter, requireNativeModule } from "expo-modules-core";

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
    duration: number;
  };
} = {};

export function enableBackgroundExecution() {
  return ExpoBackgroundTimerModule.setBackgroundExecutionEnabled(true);
}

export function disableBackgroundExecution() {
  return ExpoBackgroundTimerModule.setBackgroundExecutionEnabled(false);
}

let uniqueId = 0;

export function bgSetTimeout(
  callback: () => void,
  duration: number,
  interval = false
) {
  uniqueId += 1;

  callbacks[uniqueId] = {
    callback,
    interval,
    duration,
  };

  ExpoBackgroundTimerModule.setTimeout(uniqueId, duration);

  return uniqueId;
}

export function bgSetInterval(callback: () => void, duration: number) {
  return bgSetTimeout(callback, duration, true);
}

export function bgClearTimeout(id: number) {
  delete callbacks[id];
  ExpoBackgroundTimerModule.clearTimeout(id);
}

export function bgClearInterval(id: number) {
  return bgClearTimeout(id);
}

emitter.addListener(
  "backgroundTimer.timeout",
  (event: BackgroundTimerTimeoutEvent) => {
    if (__DEV__) console.log("backgroundTimer.timeout: ", event.id);

    if (!callbacks[event.id]) return;

    callbacks[event.id].callback();

    if (!callbacks[event.id].interval) {
      delete callbacks[event.id];
    }
  }
);

emitter.addListener(
  "backgroundTimer.timeoutCleared",
  (event: BackgroundTimerTimeoutClearedEvent) => {
    if (__DEV__) console.log("backgroundTimer.timeoutCleared: ", event.id);

    if (!callbacks[event.id]) return;

    delete callbacks[event.id];
  }
);

if (__DEV__) {
  emitter.addListener(
    "backgroundTimer.taskStarted",
    (event: BackgroundTaskEvent) => {
      console.log("backgroundTimer.taskStarted:", event.status);
    }
  );

  emitter.addListener(
    "backgroundTimer.taskStopped",
    (event: BackgroundTaskEvent) => {
      console.log("backgroundTimer.taskStopped:", event.status);
    }
  );

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
}
