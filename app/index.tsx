import { useHandbook } from "@/hooks/use-handbook";
import { api } from "@/utils/api";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

const HandbookCodePage = () => {
  const [handbookCode, setHandbookCode] = React.useState("");
  const { handbook, setHandbook } = useHandbook();

  console.log(handbook && handbook.title);

  const handleSubmit = async () => {
    try {
      const res = await api.post(`/handbooks/code/${handbookCode}`, {
        code: handbookCode,
      });
      setHandbook(res.data);
    } catch (error) {
      console.error("Error submitting handbook code:", error);
      throw error;
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar backgroundColor="#142e67" />
      <View className="flex-1 gap-8 bg-[#142e67] items-center justify-center">
        <View className="p-4 bg-white w-10/12 min-h-20 shadow border border-gray-100 rounded ">
          <View className="w-full items-center">
            <Image
              source={require("../assets/images/eg_logo.png")}
              className="w-24 h-24 rounded-full"
            />
          </View>
          <View className="mt-4">
            <Text className="text-xl text-center">Handbook Code:</Text>
            <TextInput
              className="border border-gray-300 rounded p-2 mt-2 text-center text-xl"
              placeholder="Enter handbook code"
              value={handbookCode}
              onChangeText={(text) => setHandbookCode(text)}
            />
            <TouchableOpacity
              className="bg-[#142e67] border border-gray-200 rounded p-2 mt-4"
              onPress={() => handleSubmit()}
            >
              <Text className="text-white text-center text-xl">Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HandbookCodePage;
