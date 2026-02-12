import { useHandbook } from "@/hooks/use-handbook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "expo-router/build/global-state/routing";
import { useEffect } from "react";
import { Text, View } from "react-native";
import "../global.css";

const IndexPage = () => {
  const { setHandbook } = useHandbook();

  useEffect(() => {
    AsyncStorage.getItem("handbook").then((handbook) => {
      if (handbook) {
        setHandbook(JSON.parse(handbook));
        navigate("/handbook/content");
      } else {
        navigate("/handbook-code");
      }
    });
  }, [setHandbook]);

  return (
    <View className={"flex-1 items-center justify-center"}>
      <Text>Loading...</Text>
    </View>
  );
};

export default IndexPage;
