import { useHandbook } from "@/hooks/use-handbook";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";

const SectionContent = () => {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const { handbook } = useHandbook();
  const { width } = useWindowDimensions();

  const allTopics = handbook?.topics.flatMap((topic) => topic.sections) || [];

  const section = allTopics.find((section) => section._id === sectionId);

  return (
    <ScrollView>
      <RenderHTML
        contentWidth={width}
        source={{ html: section?.content || "" }}
        baseStyle={{ margin: 20 }}
        tagsStyles={{
          p: {
            fontSize: 20,
            textAlign: "justify",
            marginBottom: 24,
            lineHeight: 30,
            letterSpacing: 36 / 100,
          },
          strong: {
            fontWeight: "bold",
          },
          ul: {
            paddingLeft: 32,
            marginBottom: 16,
          },
          ol: {
            paddingLeft: 32,
            marginBottom: 16,
          },
          li: {
            fontSize: 20,
            letterSpacing: 36 / 100,
          },
        }}
      />
    </ScrollView>
  );
};

export default SectionContent;
