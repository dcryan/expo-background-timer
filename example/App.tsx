import * as ExpoBackgroundTimer from "expo-background-timer";
import { useState, useEffect } from "react";
import { Button, StyleSheet, View } from "react-native";

export default function App() {
  useEffect(() => {
    ExpoBackgroundTimer.startBackgroundTask();
    console.log("App started background task");

    return () => {
      ExpoBackgroundTimer.stopBackgroundTask();
      console.log("App stopped background task");
    };
  }, []);

  const [ids, setIds] = useState<number[]>([]);

  const onSetTimeout = async () => {
    console.log("App - onSetTimeout");
    const timerId = ExpoBackgroundTimer.bgSetTimeout(() => {
      setIds(ids.filter((i) => i !== timerId));
    }, 3000);

    setIds([...ids, timerId]);
  };

  const onSetInterval = async () => {
    console.log("App - onSetInterval");
    const timerId = ExpoBackgroundTimer.bgSetInterval(() => {}, 3000);

    setIds([...ids, timerId]);
  };

  const onStop = (id: number) => {
    console.log("App - onStop", id);
    setIds(ids.filter((i) => i !== id));
    ExpoBackgroundTimer.bgClearInterval(id);
  };

  return (
    <View style={styles.container}>
      <Button title="setTimeout" onPress={onSetTimeout} />
      <Button title="setInterval" onPress={onSetInterval} />
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
  },
});
