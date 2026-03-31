import { useHandbook } from "@/hooks/use-handbook";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

const MainLayout = () => {
  const { handbook } = useHandbook();
  const color = handbook?.color ?? "#000";

  const getColor = (focused) => (focused ? color : color + "90");

  return (
    <>
      <StatusBar backgroundColor="transparent" style="dark" />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            height: 72,
            paddingTop: 6,
          },
          tabBarActiveTintColor: color,
          tabBarInactiveTintColor: color + "90",
        }}
      >
        <Tabs.Screen
          name="handbook"
          options={{
            title: "Handbook",
            animation: "shift",
            tabBarIcon: ({ focused, size = 24 }) => (
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                size={size}
                color={getColor(focused)}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="classrooms"
          options={{
            title: "Classrooms",
            animation: "shift",
            tabBarIcon: ({ focused, size = 24 }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={size}
                color={getColor(focused)}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="me"
          options={{
            title: "Me",
            animation: "shift",
            tabBarIcon: ({ focused, size = 24 }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={getColor(focused)}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            animation: "shift",
            tabBarIcon: ({ focused, size = 24 }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={size}
                color={getColor(focused)}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default MainLayout;
