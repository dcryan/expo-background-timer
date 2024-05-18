import * as React from 'react';

import { ExpoBackgroundTimerViewProps } from './ExpoBackgroundTimer.types';

export default function ExpoBackgroundTimerView(props: ExpoBackgroundTimerViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
