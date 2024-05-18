# Expo Background Timer Module

The Expo Background Timer Module allows you to schedule and manage timed tasks
in your Expo app, even when the app is running in the background. This module
supports both Android and iOS, providing a simple API to start and stop
background tasks, as well as to set and clear timeouts and intervals. There is
no need to eject your Expo app from an Expo Managed Workflow.

## Features

- Schedule and manage multiple timed tasks.
- Reliable execution of tasks in the background.
- Simple API for setting and clearing timers.

## Installation

To install the Expo Background Timer Module, run:

```sh
npm install expo-background-timer
```

## API

### `startBackgroundTask()`

Starts a background task. Returns a promise that resolves with the task status.

```ts
import { startBackgroundTask } from "expo-background-timer";

startBackgroundTask().then((event) => {
  console.log("Background task started:", event.status);
});
```

### `stopBackgroundTask()`

Stops the background task. Returns a promise that resolves with the task status.

```ts
import { stopBackgroundTask } from "expo-background-timer";

stopBackgroundTask().then((event) => {
  console.log("Background task stopped:", event.status);
});
```

### `bgSetTimeout(callback, timeout, interval = false)`

Sets a timeout to execute a callback function after a specified delay. Returns a
unique timeout ID.

```ts
import { bgSetTimeout } from "expo-background-timer";

const timeoutId = bgSetTimeout(() => {
  console.log("Timeout executed");
}, 5000); // 5 seconds
```

### `bgSetInterval(callback, timeout)`

Sets an interval to execute a callback function repeatedly after a specified
delay. Returns a unique interval ID.

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

## Example

Here is a complete example demonstrating how to use the Expo Background Timer Module:

```ts
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import {
  startBackgroundTask,
  stopBackgroundTask,
  bgSetTimeout,
  bgSetInterval,
  bgClearTimeout,
  bgClearInterval,
} from "expo-background-timer";

export default function App() {
  useEffect(() => {
    startBackgroundTask().then((event) => {
      console.log("Background task started:", event.status);

      const timeoutId = bgSetTimeout(() => {
        console.log("Timeout executed");
      }, 5000); // 5 seconds

      const intervalId = bgSetInterval(() => {
        console.log("Interval executed");
      }, 10000); // 10 seconds

      return () => {
        bgClearTimeout(timeoutId);
        bgClearInterval(intervalId);
        stopBackgroundTask().then((event) => {
          console.log("Background task stopped:", event.status);
        });
      };
    });

    return () => {
      stopBackgroundTask().then((event) => {
        console.log("Background task stopped:", event.status);
      });
    };
  }, []);

  return (
    <View>
      <Text>Expo Background Timer Module</Text>
    </View>
  );
}
```

## Acknowledgements

This module was heavily inspired by
[`react-native-background-timer`](https://github.com/ocetnik/react-native-background-timer).
Many thanks to the authors and contributors of that project for their hard work
and contributions to the community.

## License

This project is licensed under the MIT License.
