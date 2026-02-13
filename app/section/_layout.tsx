import { useHandbook } from "@/hooks/use-handbook";
import { isDarkColor } from "@/utils/helper";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

const SectionLayout = () => {
  const { handbook } = useHandbook();
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();

  if (!handbook) return null;

  const allTopics = handbook.topics.flatMap((topic) => topic.sections);
  const section = allTopics.find((section) => section._id === sectionId);

  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        headerShown: true,
        title: section?.title,
        headerStyle: { backgroundColor: handbook?.color },
        headerTintColor: isDarkColor(handbook?.color as string)
          ? "#FFFFFF"
          : "#000000",
        headerBackVisible: true,
      }}
    />
  );
};

export default SectionLayout;
