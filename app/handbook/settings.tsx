import { Button, ButtonText } from "@/components/ui/button";
import { useHandbook } from "@/hooks/use-handbook";
import { navigate } from "expo-router/build/global-state/routing";
import React from "react";
import { View } from "react-native";

const SettingsPage = () => {
  const { setHandbook } = useHandbook();
  return (
    <View>
      <Button
        onPress={() => {
          setHandbook(null);
          navigate("/handbook-code");
        }}
      >
        <ButtonText>Back to code</ButtonText>
      </Button>
    </View>
  );
};

export default SettingsPage;
