import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input, InputField } from "@/components/ui/input";
import { useHandbook } from "@/hooks/use-handbook";
import { isDarkColor } from "@/utils/helper";
import { Link } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

const Main = () => {
  const { handbook } = useHandbook();

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
      <ScrollView className="flex-1 mt-4">
        {handbook?.topics
          .filter((t) => t.sections.length > 0)
          .map((topic) => (
            <Link
              href={`/topic/${topic._id}`}
              key={topic._id}
              style={{
                backgroundColor: handbook?.color,
                borderColor: handbook?.color,
                borderWidth: 1,
              }}
              className="rounded-lg mt-4  shadow-md p-4"
            >
              <View className="w-full bg-transparent">
                <Text
                  className="text-2xl font-semibold"
                  style={{
                    color: isDarkColor(handbook?.color as string)
                      ? "#FFFFFF"
                      : "#000000",
                  }}
                >
                  {topic.title}
                </Text>

                {topic.sections.length > 0 && (
                  <>
                    <Divider
                      style={{
                        backgroundColor: isDarkColor(handbook?.color as string)
                          ? "#FFFFFF70"
                          : "#00000070",
                      }}
                      className="my-2"
                    />
                    <View className="ml-2 mb-4 gap-1">
                      {topic.sections.slice(0, 3).map((section) => (
                        <Text
                          key={section._id}
                          style={{
                            color: isDarkColor(handbook?.color as string)
                              ? "#FFFFFF90"
                              : "#00000090",
                          }}
                          numberOfLines={1}
                        >
                          --{"\t"}
                          {section.title}
                        </Text>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </Link>
          ))}
      </ScrollView>
    </View>
  );
};

export default Main;
