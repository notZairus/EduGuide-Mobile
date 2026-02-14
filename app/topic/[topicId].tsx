import { useHandbook } from "@/hooks/use-handbook";
import { isDarkColor } from "@/utils/helper";
import { Link, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

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

      <ScrollView
        className="flex-1 bg-white px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {topic &&
          topic.sections.map((section, index) => (
            <Link href={`/section/${section._id}`} key={section._id} asChild>
              <Pressable className="mb-6">
                {({ pressed }) => (
                  <View
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      shadowColor: "#000",
                      shadowOpacity: 0.15,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 6 },
                      elevation: 6,
                    }}
                  >
                    {/* Accent bar */}
                    <View
                      style={{ backgroundColor: handbook?.color }}
                      className="h-2 w-full"
                    />

                    {/* Image */}
                    {section.medias && section.medias.length > 0 && (
                      <Image
                        source={{ uri: section.medias[0].url }}
                        className="w-full h-24"
                        resizeMode="cover"
                      />
                    )}

                    {/* Content */}
                    <View className="px-5 py-4">
                      <Text className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </Text>

                      {/* Optional index label */}
                      <Text
                        className="mt-1 text-sm"
                        style={{ color: handbook?.color }}
                      >
                        Section {index + 1}
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            </Link>
          ))}
      </ScrollView>
    </>
  );
};

export default TopicContent;
