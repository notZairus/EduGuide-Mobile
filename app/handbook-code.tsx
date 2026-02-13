import { Button, ButtonText } from "@/components/ui/button";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { useHandbook } from "@/hooks/use-handbook";
import { api } from "@/utils/api";
import { navigate } from "expo-router/build/global-state/routing";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, Text, TextInput, View } from "react-native";
import "../global.css";

const HandbookCodePage = () => {
  const [handbookCode, setHandbookCode] = React.useState("");
  const { setHandbook } = useHandbook();
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      const res = await api.post(`/handbooks/code/${handbookCode}`, {
        code: handbookCode,
      });

      if (res.status === 200) {
        setTimeout(() => {
          setHandbook(res.data);
          navigate("/handbook/content");
        }, 3000);

        toast.show({
          placement: "top",
          duration: 3000,
          render: () => (
            <Toast action="success">
              <ToastTitle className="text-green-500">
                Handbook code accepted.
              </ToastTitle>
              <ToastDescription>
                You will be redirected shortly.
              </ToastDescription>
            </Toast>
          ),
        });
      }
    } catch (e) {
      toast.show({
        placement: "top",
        duration: 3000,
        render: () => (
          <Toast action="error">
            <ToastTitle className="text-red-500">
              Invalid handbook code.
            </ToastTitle>
            <ToastDescription>
              Please check the code and try again.
            </ToastDescription>
          </Toast>
        ),
      });
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#142e67" />
      <View className="flex-1 gap-8 bg-[#142e67] items-center justify-center">
        <View className="p-4 bg-white w-10/12 min-h-20 shadow border border-gray-100 rounded ">
          <View>
            <Text>{process.env.EXPO_PUBLIC_API_URL}</Text>
          </View>
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
            <Button
              size="lg"
              className="bg-[#142e67] border rounded  mt-4"
              onPress={() => handleSubmit()}
            >
              <ButtonText className="text-white text-center">Submit</ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </>
  );
};

export default HandbookCodePage;
