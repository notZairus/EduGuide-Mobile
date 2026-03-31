import Header from "@/components/Header";
import { Divider } from "@/components/ui/divider";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useHandbook } from "@/hooks/use-handbook";
import { isDarkColor } from "@/utils/helper";
import { Link, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

const TopicContent = () => {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { handbook } = useHandbook();
  const { authenticatedUser } = useAuthenticatedUser();

  const topic = handbook?.topics.find((t) => t._id === topicId);
  const activeQuiz = topic?.active_quiz;
  const userRole =
    typeof authenticatedUser?.role === "string"
      ? authenticatedUser.role.toLowerCase()
      : "";
  const isInstructor = userRole === "instructor";

  return (
    <>
      <StatusBar
        backgroundColor={handbook?.color}
        style={isDarkColor(handbook?.color as string) ? "light" : "dark"}
      />

      <View className="flex-1">
        {/* Header */}
        <Header text={topic?.title || "Topic"} />

        <ScrollView
          className="flex-1 bg-white px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {topic &&
            topic.sections.map((section, index) => (
              <Link
                href={`/topic/section/${section._id}`}
                key={section._id}
                asChild
              >
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

          {topic?.active_quiz && !isInstructor && (
            <>
              <Divider
                className="mt-8 mb-5 opacity-25"
                orientation="horizontal"
              />

              <View
                className="mb-8 rounded-2xl overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 6,
                }}
              >
                <View
                  style={{ backgroundColor: handbook?.color || "#111" }}
                  className="px-5 py-4"
                >
                  <Text className="text-white text-base font-medium">
                    Active Quiz
                  </Text>
                  <Text className="text-white text-2xl font-bold mt-1">
                    {activeQuiz?.title || `${topic?.title || "Topic"} Quiz`}
                  </Text>
                </View>

                <View className="bg-white px-5 py-4">
                  <Text className="text-gray-700 text-base leading-6">
                    {activeQuiz?.description ||
                      "Test what you learned from this topic. Complete all sections, then start the quiz to check your understanding."}
                  </Text>

                  <Link href={`/topic/quiz/${topic._id}`} asChild>
                    <Pressable className="mt-4">
                      {({ pressed }) => (
                        <View
                          className="rounded-xl px-4 py-3"
                          style={{
                            backgroundColor: handbook?.color || "#111",
                            opacity: pressed ? 0.85 : 1,
                          }}
                        >
                          <Text className="text-white font-semibold text-center">
                            Start Quiz
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  </Link>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
};

export default TopicContent;
