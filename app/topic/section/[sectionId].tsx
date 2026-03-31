import Header from "@/components/Header";
import { useHandbook } from "@/hooks/use-handbook";
import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHTML from "react-native-render-html";

const SectionContent = () => {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const { handbook } = useHandbook();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<"content" | "summary">("content");

  const allSections = handbook?.topics.flatMap((topic) => topic.sections) || [];

  const section = allSections.find((s) => s._id === sectionId);

  return (
    <View className="flex-1">
      <Header text={section?.title || "Section"} />
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: handbook?.color + "10" }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        {section?.medias && section.medias.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 20,
            }}
          >
            {section.medias.length > 1 &&
              section.medias.map((media, index) => (
                <View
                  key={index}
                  style={{
                    width: width * 0.75,
                    height: width * 0.5,
                    marginRight: 16,
                    borderRadius: 16,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 5,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  {media.type === "image" && (
                    <Image
                      source={{ uri: media.url }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  )}

                  {media.type === "video" && (
                    <Video
                      source={{ uri: media.url }}
                      style={{ width: "100%", height: "100%" }}
                      shouldPlay
                      isLooping
                      isMuted={false}
                      useNativeControls
                      resizeMode={"cover" as ResizeMode}
                    />
                  )}
                </View>
              ))}

            {section.medias.length === 1 && (
              <View
                style={{
                  width: width - 40,
                  height: (width - 40) * 0.8,
                  borderRadius: 16,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 5,
                  backgroundColor: "#FFFFFF",
                }}
              >
                {section.medias[0].type === "image" && (
                  <Image
                    source={{ uri: section.medias[0].url }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                )}

                {section.medias[0].type === "video" && (
                  <Video
                    source={{ uri: section.medias[0].url }}
                    style={{ width: "100%", height: "100%" }}
                    shouldPlay
                    isLooping
                    isMuted={false}
                    useNativeControls
                    resizeMode={"cover" as ResizeMode}
                  />
                )}
              </View>
            )}
          </ScrollView>
        )}

        {section?.content && (
          <View>
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
                backgroundColor: "#FFFFFF",
              }}
              className="rounded-xl"
            >
              <Pressable
                onPress={() => setActiveTab("content")}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  marginHorizontal: 10,
                  borderBottomWidth: activeTab === "content" ? 3 : 0,
                  borderBottomColor:
                    activeTab === "content" ? handbook?.color : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: activeTab === "content" ? "600" : "500",
                    color: activeTab === "content" ? handbook?.color : "#666",
                    textAlign: "center",
                  }}
                >
                  Content
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab("summary")}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  marginHorizontal: 10,
                  borderBottomWidth: activeTab === "summary" ? 3 : 0,
                  borderBottomColor:
                    activeTab === "summary" ? handbook?.color : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: activeTab === "summary" ? "600" : "500",
                    color: activeTab === "summary" ? handbook?.color : "#666",
                    textAlign: "center",
                  }}
                >
                  Key Takeaways
                </Text>
              </Pressable>
            </View>

            {activeTab === "content" && (
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingTop: 24,
                  paddingBottom: 24,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <RenderHTML
                  contentWidth={width - 40}
                  source={{ html: section?.content || "" }}
                  baseStyle={{
                    color: "#1a1a1a",
                  }}
                  tagsStyles={{
                    p: {
                      fontSize: 16,
                      lineHeight: 26,
                      marginBottom: 18,
                      textAlign: "justify",
                    },
                    strong: {
                      fontWeight: "700",
                    },
                    em: {
                      fontStyle: "italic",
                    },
                    ul: {
                      paddingLeft: 22,
                      marginBottom: 16,
                    },
                    ol: {
                      paddingLeft: 22,
                      marginBottom: 16,
                    },
                    li: {
                      fontSize: 17,
                      lineHeight: 26,
                      marginBottom: 8,
                    },
                    h1: {
                      fontSize: 30,
                      fontWeight: "700",
                      marginBottom: 16,
                      marginTop: 12,
                    },
                    h2: {
                      fontSize: 26,
                      fontWeight: "700",
                      marginBottom: 14,
                      marginTop: 10,
                    },
                    h3: {
                      fontSize: 22,
                      fontWeight: "600",
                      marginBottom: 12,
                      marginTop: 8,
                    },
                    h4: {
                      fontSize: 20,
                      fontWeight: "600",
                      marginBottom: 10,
                      marginTop: 6,
                    },
                    h5: {
                      fontSize: 18,
                      fontWeight: "600",
                      marginBottom: 8,
                    },
                    h6: {
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 6,
                    },
                  }}
                />
              </View>
            )}

            {activeTab === "summary" && (
              <View
                style={{
                  minHeight: 635,
                  paddingHorizontal: 20,
                  paddingTop: 24,
                  paddingBottom: 24,
                  backgroundColor: "#FFFFFF",
                }}
              >
                {section?.summaries && section.summaries.length > 0 ? (
                  section.summaries.map((summary, index) => (
                    <View
                      key={index}
                      className="mb-6 flex flex-row items-start gap-4"
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          lineHeight: 20,
                          marginBottom: 4,
                          borderLeftColor: handbook?.color,
                          borderLeftWidth: 2,
                          paddingLeft: 12,
                          color: "#333",
                          textAlign: "justify",
                        }}
                      >
                        {summary}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ fontSize: 15, color: "#333" }}>
                    {`No key takeaways available for this section. It might be that the content of this section is concise enough that it doesn't require a summary, or that the summary is still being generated.`}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SectionContent;
