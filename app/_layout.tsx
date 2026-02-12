import { HandbookProvider } from "@/components/HandbookProvider";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { ToastProvider } from "@gluestack-ui/core/toast/creator";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const RootLayoutNav = () => {
  return (
    <>
      <SafeAreaView className="flex-1">
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
            }}
          />
          <Stack.Screen
            name="handbook"
            options={{
              animation: "slide_from_bottom", // slide up into handbook
            }}
          />
          <Stack.Screen
            name="topic"
            options={{
              animation: "slide_from_right", // slide in topic detail
            }}
          />
        </Stack>
      </SafeAreaView>
    </>
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
