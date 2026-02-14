import { useHandbook } from "@/hooks/use-handbook";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, useWindowDimensions, View } from "react-native";
import RenderHTML from "react-native-render-html";

const SectionContent = () => {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const { handbook } = useHandbook();
  const { width } = useWindowDimensions();

  const allSections = handbook?.topics.flatMap((topic) => topic.sections) || [];

  const section = allSections.find((s) => s._id === sectionId);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingBottom: 60,
      }}
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
                <Image
                  source={{ uri: media.url }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
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
              <Image
                source={{ uri: section.medias[0].url }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </View>
          )}
        </ScrollView>
      )}

      {/* HTML Content */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <RenderHTML
          contentWidth={width - 40}
          source={{ html: section?.content || "" }}
          baseStyle={{
            color: "#1a1a1a",
          }}
          tagsStyles={{
            p: {
              fontSize: 17,
              lineHeight: 26,
              marginBottom: 18,
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
    </ScrollView>
  );
};

export default SectionContent;
