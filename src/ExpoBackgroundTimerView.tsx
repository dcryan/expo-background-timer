import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { ExpoBackgroundTimerViewProps } from './ExpoBackgroundTimer.types';

const NativeView: React.ComponentType<ExpoBackgroundTimerViewProps> =
  requireNativeViewManager('ExpoBackgroundTimer');

export default function ExpoBackgroundTimerView(props: ExpoBackgroundTimerViewProps) {
  return <NativeView {...props} />;
}
