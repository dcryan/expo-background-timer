export type ChangeEventPayload = {
  value: string;
};

export type ExpoBackgroundTimerViewProps = {
  name: string;
};

export type BackgroundTimerError = {
  message: string;
};

export type BackgroundTimerTimeoutEvent = {
  id: number;
};

export type BackgroundTimerTimeoutClearedEvent = {
  id: number;
};

export type BackgroundTaskEvent = {
  status: "running" | "stopped";
};
