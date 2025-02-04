# Expo Background Timer Module

The Expo Background Timer Module allows you to schedule and manage timed tasks in your Expo app—even when the app is running in the background. This module supports both Android and iOS, providing a simple API to enable background execution and to set/clear timeouts and intervals.

**There is no need to eject your Expo app from an Expo Managed Workflow.**

## Features

- Schedule and manage multiple timed tasks.
- Reliable execution of tasks in the background.
- Simple API for enabling/disabling background execution and managing timers.
- Emits events to track task and timer status.

## Installation

To install the Expo Background Timer Module, run:

```sh
npm install expo-background-timer
```

## API

### `enableBackgroundExecution()`

Enables background execution. This sets an internal flag so that when the app enters the background, the module acquires a wake lock (Android) or begins a background task (iOS). Returns a promise that resolves with the task status.

```ts
import { enableBackgroundExecution } from "expo-background-timer";

enableBackgroundExecution().then((event) => {
  console.log("Background execution enabled:", event.status);
});
```

### `disableBackgroundExecution()`

Disables background execution. This stops the background task by releasing the wake lock or ending the background task. Returns a promise that resolves with the task status.

```ts
import { disableBackgroundExecution } from "expo-background-timer";

disableBackgroundExecution().then((event) => {
  console.log("Background execution disabled:", event.status);
});
```

### `bgSetTimeout(callback, timeout)`

Sets a timeout to execute a callback function after a specified delay (in milliseconds). Returns a unique timeout ID. The module emits an event when the timer starts and when it completes.

```ts
import { bgSetTimeout } from "expo-background-timer";

const timeoutId = bgSetTimeout(() => {
  console.log("Timeout executed");
}, 5000); // 5 seconds
```

### `bgSetInterval(callback, timeout)`

Sets an interval to execute a callback function repeatedly after a specified delay (in milliseconds). Returns a unique interval ID. The module emits an event each time the interval callback is executed.

```ts
import { bgSetInterval } from "expo-background-timer";

const intervalId = bgSetInterval(() => {
  console.log("Interval executed");
}, 10000); // 10 seconds
```

### `bgClearTimeout(id)`

Clears a timeout set by `bgSetTimeout`.

```ts
import { bgClearTimeout } from "expo-background-timer";

bgClearTimeout(timeoutId);
```

### `bgClearInterval(id)`

Clears an interval set by `bgSetInterval`.

```ts
import { bgClearInterval } from "expo-background-timer";

bgClearInterval(intervalId);
```

## Events

The module emits the following events to keep you informed about background task and timer status:

- **`backgroundTimer.taskStarted`**  
  Emitted when a background task is successfully started (e.g., when a wake lock is acquired).

- **`backgroundTimer.taskStopped`**  
  Emitted when the background task is stopped (e.g., when the wake lock is released).

- **`backgroundTimer.started`**  
  Emitted when a timer (timeout or interval) is initiated.

- **`backgroundTimer.timeout`**  
  Emitted when a timeout or interval callback is triggered.

- **`backgroundTimer.timeoutCleared`**  
  Emitted when a timeout or interval is cleared.

- **`backgroundTimer.error`**  
  Emitted when an error occurs (e.g., if a background task is already running or a timer cannot be found).

## Example

Below is a complete example demonstrating how to use the Expo Background Timer Module:

```tsx
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import {
  enableBackgroundExecution,
  disableBackgroundExecution,
  bgSetTimeout,
  bgSetInterval,
  bgClearTimeout,
  bgClearInterval,
} from "expo-background-timer";

let timerCounter = 0;

export default function App() {
  useEffect(() => {
    // Enable background execution when the app mounts.
    enableBackgroundExecution().then((event) => {
      console.log("Background execution enabled:", event.status);
    });

    return () => {
      // Disable background execution when the app unmounts.
      disableBackgroundExecution().then((event) => {
        console.log("Background execution disabled:", event.status);
      });
    };
  }, []);

  const [ids, setIds] = useState<number[]>([]);

  const onSetTimeout = () => {
    console.log("App - onSetTimeout");
    const timeoutId = bgSetTimeout(() => {
      // Remove the timeout ID from state after execution.
      setIds((prevIds) => prevIds.filter((i) => i !== timeoutId));
      console.log("Timeout executed");
    }, 3000); // 3 seconds

    setIds((prevIds) => [...prevIds, timeoutId]);
  };

  const onSetInterval = () => {
    console.log("App - onSetInterval");
    const intervalId = bgSetInterval(() => {
      timerCounter++;
      console.log("Interval executed:", timerCounter);
    }, 1000); // 1 second

    setIds((prevIds) => [...prevIds, intervalId]);
  };

  const onStop = (id: number) => {
    console.log("App - onStop", id);
    setIds((prevIds) => prevIds.filter((i) => i !== id));
    bgClearInterval(id);
  };

  return (
    <View style={styles.container}>
      <Button title="Set Timeout" onPress={onSetTimeout} />
      <Button title="Set Interval" onPress={onSetInterval} />
      {ids.map((id) => (
        <Button key={id} title={`Stop ${id}`} onPress={() => onStop(id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});
```

## Acknowledgements

This module was heavily inspired by
[`react-native-background-timer`](https://github.com/ocetnik/react-native-background-timer).
Many thanks to the authors and contributors of that project for their hard work and contributions to the community.

## License

This project is licensed under the MIT License.
