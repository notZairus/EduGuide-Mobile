import { useHandbook } from "@/hooks/use-handbook";
import { isDarkColor } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const Header = ({ text }: { text: string }) => {
  const { handbook } = useHandbook();

  return (
    <View
      style={{ backgroundColor: handbook?.color }}
      className="px-6 py-5 flex-row items-center gap-4"
    >
      <Pressable
        onPress={() => {
          router.back();
        }}
      >
        <Ionicons
          name="chevron-back"
          size={24}
          style={{
            color: isDarkColor(handbook?.color as string) ? "#fff" : "#000",
          }}
        />
      </Pressable>
      <Text
        className="text-2xl font-semibold w-3/4"
        style={{
          color: isDarkColor(handbook?.color as string) ? "#fff" : "#000",
        }}
      >
        {text}
      </Text>
    </View>
  );
};

export default Header;
