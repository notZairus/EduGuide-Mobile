import { useHandbook } from "@/hooks/use-handbook";
import { isDarkColor } from "@/utils/helper";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

const TopicContent = () => {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { handbook } = useHandbook();

  const topic = handbook?.topics.find((t) => t._id === topicId);

  return (
    <>
      <StatusBar
        backgroundColor={handbook?.color}
        style={isDarkColor(handbook?.color as string) ? "light" : "dark"}
      />
      <ScrollView className="flex-1 px-8 pt-4 pb-8">
        {topic &&
          topic.sections.map((section) => (
            <View
              key={section._id}
              style={{
                backgroundColor: handbook?.color,
                borderColor: handbook?.color,
                borderWidth: 1,
              }}
              className="rounded mt-4 shadow-md overflow-hidden"
            >
              {/* Media Section */}
              {section.medias && section.medias.length > 0 && (
                <View className="w-full h-40 bg-gray-200 shadow-xl">
                  <Image
                    source={{ uri: section.medias[0].url }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Content Section */}
              <View className="p-5">
                <Text
                  className="text-xl"
                  style={{
                    color: isDarkColor(handbook?.color as string)
                      ? "#FFFFFF"
                      : "#000000",
                  }}
                >
                  {section.title}
                </Text>
              </View>
            </View>
          ))}
        <View className="h-20" />
      </ScrollView>
    </>
  );
};

export default TopicContent;
