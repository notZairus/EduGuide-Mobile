import { AuthenticatedUserProvider } from "@/components/AuthenticatedUserProvider";
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
          animation: "ios_from_right",
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="handbook-code"
          options={{
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="change-password"
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: "slide_from_bottom",
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
        <AuthenticatedUserProvider>
          <HandbookProvider>
            <RootLayoutNav />
          </HandbookProvider>
        </AuthenticatedUserProvider>
      </ToastProvider>
    </GluestackUIProvider>
  );
};

export default RootLayout;
