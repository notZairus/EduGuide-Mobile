import { useHandbook } from "@/hooks/use-handbook";
import { isDarkColor } from "@/utils/helper";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

const TopicLayout = () => {
  const { handbook } = useHandbook();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();

  if (!handbook) {
    return null;
  }

  const topic = handbook.topics.find((topic) => topic._id === topicId);

  return (
    <Stack
      screenOptions={{
        animation: "ios_from_right",
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
        title: topic?.title,
        headerStyle: { backgroundColor: handbook?.color },
        headerTintColor: isDarkColor(handbook?.color as string)
          ? "#FFFFFF"
          : "#000000",
        headerBackVisible: true,
        headerShown: false,
      }}
    />
  );
};

export default TopicLayout;
