import { useHandbook } from "@/hooks/use-handbook";
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
            backgroundColor: "#FFFFFF",
            height: 72,
            paddingTop: 8,
          },
          tabBarActiveTintColor: handbook?.color,
          tabBarInactiveTintColor: handbook?.color,
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
                color={focused ? handbook?.color : handbook?.color + "90"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: false,
            tabBarIcon: ({ focused, size = 24 }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={size}
                color={focused ? handbook?.color : handbook?.color + "90"}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default MainLayout;
