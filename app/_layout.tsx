import { HandbookProvider } from "@/components/HandbookProvider";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { ToastProvider } from "@gluestack-ui/core/toast/creator";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RootLayoutNav = () => {
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="handbook-code"
          options={{
            animation: "fade", // fade into handbook code
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="handbook"
          options={{
            animation: "slide_from_bottom", // slide up into handbook
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="topic"
          options={{
            animation: "slide_from_right", // slide in topic detail
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="section"
          options={{
            animation: "slide_from_right", // slide in topic detail
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaView>
  );
};

const RootLayout = () => {
  return (
    <GluestackUIProvider mode="dark">
      <ToastProvider>
        <HandbookProvider>
          <RootLayoutNav />
        </HandbookProvider>
      </ToastProvider>
    </GluestackUIProvider>
  );
};

export default RootLayout;
