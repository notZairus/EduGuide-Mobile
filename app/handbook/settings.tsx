import { Button, ButtonText } from "@/components/ui/button";
import { useHandbook } from "@/hooks/use-handbook";
import { navigate } from "expo-router/build/global-state/routing";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsPage = () => {
  const { setHandbook } = useHandbook();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Button
        onPress={() => {
          setHandbook(null);
          navigate("/handbook-code");
        }}
      >
        <ButtonText>Back to code</ButtonText>
      </Button>
    </SafeAreaView>
  );
};

export default SettingsPage;
