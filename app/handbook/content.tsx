import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input, InputField } from "@/components/ui/input";
import { useHandbook } from "@/hooks/use-handbook";
import { toRoman } from "@/utils/helper";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

type TopicWithImage = {
  firstImage: string | null;
} & Topic;

const Main = () => {
  const { handbook } = useHandbook();
  const [topicsToRender, setTopicsToRender] = useState<
    (TopicWithImage | Topic)[] | null
  >(null);

  useEffect(() => {
    const filteredTopics =
      handbook?.topics.filter((t) => t.sections.length > 0) || [];

    const topicsWithSectionImage = filteredTopics.map((t) => {
      let firstImage: string | null = null;

      for (const section of t.sections) {
        if (section.medias) {
          for (const media of section.medias) {
            if (media.type === "image") {
              firstImage = media.url;
              break;
            }
          }
        }
        if (firstImage) break;
      }

      if (!firstImage) return t;

      return {
        ...t,
        firstImage,
      };
    });

    setTopicsToRender(topicsWithSectionImage);
  }, [handbook]);

  return (
    <View className="flex-1 bg-white pt-6">
      {/* Header */}
      <View className="px-6">
        <View className="flex-row items-center gap-4">
          {handbook?.logo?.url && (
            <Image
              source={{ uri: handbook.logo.url }}
              style={{ width: 40, height: 40 }}
            />
          )}

          <Text
            className="text-3xl font-bold"
            style={{ color: handbook?.color || "#111" }}
          >
            {handbook?.title}
          </Text>
        </View>

        {/* Search */}
        <View className="mt-6 flex-row items-center">
          <Input
            size="lg"
            className="flex-1 bg-white rounded-xl"
            style={{ borderColor: handbook?.color }}
          >
            <InputField placeholder="Search topics..." />
          </Input>

          <Button
            size="lg"
            className="ml-3 rounded-xl"
            style={{ backgroundColor: handbook?.color }}
          >
            <ButtonText style={{ color: "#fff" }}>Search</ButtonText>
          </Button>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 mt-8 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {topicsToRender?.map((topic, index) => (
          <Link key={topic._id} href={`/topic/${topic._id}`} asChild>
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
                  {/* Top accent bar */}
                  <View
                    style={{ backgroundColor: handbook?.color }}
                    className="h-2 w-full"
                  />

                  {/* Image */}
                  {"firstImage" in topic && topic.firstImage && (
                    <Image
                      source={{ uri: topic.firstImage }}
                      className="w-full h-56"
                      resizeMode="cover"
                    />
                  )}

                  {/* Content */}
                  <View className="px-5 py-4">
                    <Text className="text-2xl font-semibold text-gray-900">
                      {toRoman(index + 1)}. {topic.title}
                    </Text>

                    <Divider className="my-4 bg-gray-200" />

                    <View>
                      {topic.sections.map((section, i) => (
                        <View key={i} className="flex-row items-center mb-2">
                          <View
                            style={{
                              backgroundColor: handbook?.color,
                            }}
                            className="w-2 h-2 rounded-full mr-3 opacity-70"
                          />
                          <Text className="text-base text-gray-700">
                            {section.title}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
};

export default Main;
