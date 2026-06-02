import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#f7f8fb" },
          headerShadowVisible: false,
          headerTitleStyle: { color: "#172033" },
          contentStyle: { backgroundColor: "#f7f8fb" }
        }}
      >
        <Stack.Screen name="index" options={{ title: "Today" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
