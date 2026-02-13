import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input, InputField } from "@/components/ui/input";
import { useHandbook } from "@/hooks/use-handbook";
import { isDarkColor } from "@/utils/helper";
import { Link } from "expo-router";
import React, { useEffect } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

type TopicWithImage = {
  firstImage: string | null;
} & Topic;

const Main = () => {
  const { handbook } = useHandbook();
  const [topicsToRender, setTopicsToRender] = React.useState<
    (TopicWithImage | Topic)[] | null
  >(null);

  useEffect(() => {
    const filteredTopics =
      handbook?.topics.filter((t) => t.sections.length > 0) || [];
    const topicsWithSectionImage = filteredTopics.map((t) => {
      let firstImage = null;

      for (const section of t.sections) {
        if (section.medias) {
          for (const media of section.medias) {
            if (media.type === "image") {
              firstImage = media.url;
              break; // breaks out of the inner loop
            }
          }
        }
        if (firstImage) break; // breaks out of the outer loop once an image is found
      }

      if (!firstImage) return t;

      return {
        ...t,
        firstImage,
      };
    });

    setTopicsToRender(topicsWithSectionImage);
  }, [setTopicsToRender, handbook]);

  return (
    <View className="flex-1 px-8 pt-4 bg-white">
      {/* Header */}
      <View>
        <View className="gap-4 flex-row items-center">
          <View>
            <Image
              source={{ uri: handbook?.logo?.url }}
              style={{ width: 36, height: 36 }}
            />
          </View>
          <Text
            className="text-4xl font-medium"
            style={{
              color: isDarkColor(handbook?.color as string)
                ? handbook?.color
                : "#000000",
            }}
          >
            {handbook?.title}
          </Text>
        </View>
        <View className="w-full mt-2">
          <View className="flex-row items-center py-4">
            <Input
              size="lg"
              className="flex-1 bg-white"
              style={{ borderColor: handbook?.color }}
            >
              <InputField placeholder="Enter Text here..." />
            </Input>

            <Button
              size="lg"
              className="ml-2"
              variant="solid"
              style={{ backgroundColor: handbook?.color }}
            >
              <ButtonText
                style={{
                  color: isDarkColor(handbook?.color as string)
                    ? "#FFFFFF"
                    : "#000000",
                }}
              >
                Search
              </ButtonText>
            </Button>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 mt-4 ">
        {topicsToRender?.map((topic) => (
          <Link key={topic._id} href={`/topic/${topic._id}`} asChild>
            <Pressable>
              <View
                style={{
                  backgroundColor: handbook?.color,
                  boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.2)",
                }}
                className="w-full pb-4 rounded"
              >
                {"firstImage" in topic && topic.firstImage && (
                  <View className="p-1">
                    <Image
                      source={{ uri: topic.firstImage }}
                      className="w-full h-40"
                      resizeMode="cover"
                    />
                  </View>
                )}
                <View className="px-4">
                  <View className="mt-2">
                    <Text
                      style={{
                        color: isDarkColor(handbook?.color as string)
                          ? "#FFFFFF"
                          : "#000000",
                      }}
                      className="text-3xl font-medium"
                    >
                      {topic.title}
                    </Text>
                  </View>

                  <Divider
                    style={{
                      backgroundColor: isDarkColor(handbook?.color)
                        ? "#FFFFFF70"
                        : "#00000070",
                    }}
                    className="mt-3 mb-2"
                  />

                  <View>
                    {topic.sections.map((section, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          marginBottom: 2,
                          paddingLeft: 8,
                          paddingRight: 8,
                        }}
                      >
                        <Text
                          className="text-lg"
                          style={{
                            marginRight: 6,
                            color: isDarkColor(handbook?.color as string)
                              ? "#FFFFFF"
                              : "#000000",
                            opacity: 0.9,
                          }}
                        >
                          --
                        </Text>
                        <Text
                          className="text-lg"
                          style={{
                            color: isDarkColor(handbook?.color as string)
                              ? "#FFFFFF"
                              : "#000000",
                            opacity: 0.9,
                          }}
                        >
                          {section.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
};

export default Main;
