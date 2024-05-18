import { StyleSheet, Text, View } from 'react-native';

import * as ExpoBackgroundTimer from 'expo-background-timer';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{ExpoBackgroundTimer.hello()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
