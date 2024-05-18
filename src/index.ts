import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to ExpoBackgroundTimer.web.ts
// and on native platforms to ExpoBackgroundTimer.ts
import ExpoBackgroundTimerModule from './ExpoBackgroundTimerModule';
import ExpoBackgroundTimerView from './ExpoBackgroundTimerView';
import { ChangeEventPayload, ExpoBackgroundTimerViewProps } from './ExpoBackgroundTimer.types';

// Get the native constant value.
export const PI = ExpoBackgroundTimerModule.PI;

export function hello(): string {
  return ExpoBackgroundTimerModule.hello();
}

export async function setValueAsync(value: string) {
  return await ExpoBackgroundTimerModule.setValueAsync(value);
}

const emitter = new EventEmitter(ExpoBackgroundTimerModule ?? NativeModulesProxy.ExpoBackgroundTimer);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { ExpoBackgroundTimerView, ExpoBackgroundTimerViewProps, ChangeEventPayload };
