import { useHandbook } from "@/hooks/use-handbook";
import { isDarkColor } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

const MainLayout = () => {
  const { handbook } = useHandbook();

  return (
    <>
      <StatusBar backgroundColor={"transparent"} style={"dark"} />
      <Tabs
        screenOptions={{
          animation: "fade",
          headerShown: true,
          tabBarStyle: {
            backgroundColor: handbook?.color,
            height: 72,
            paddingTop: 8,
          },
          tabBarActiveTintColor: isDarkColor(handbook?.color as string)
            ? "#fff"
            : "#000",
          tabBarInactiveTintColor: isDarkColor(handbook?.color as string)
            ? "rgba(255, 255, 255, 0.5)"
            : "rgba(0, 0, 0, 0.5)",
        }}
      >
        <Tabs.Screen
          name="content"
          options={{
            title: "Content",
            headerShown: false,
            tabBarIcon: ({ focused, size = 24 }) => (
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                size={size}
                color={
                  focused
                    ? isDarkColor(handbook?.color as string)
                      ? "#fff"
                      : "#000"
                    : isDarkColor(handbook?.color as string)
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.5)"
                }
              />
            ),
          }}
        />
        <Tabs.Screen name="settings" options={{ headerShown: false }} />
      </Tabs>
    </>
  );
};

export default MainLayout;
