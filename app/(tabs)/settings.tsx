import { Button, ButtonText } from "@/components/ui/button";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useHandbook } from "@/hooks/use-handbook";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsPage = () => {
  const { setAuthenticatedUser } = useAuthenticatedUser();
  const { setHandbook } = useHandbook();

  const handleChangeHandbook = () => {
    setAuthenticatedUser(null);
    setHandbook(null);
    router.replace("/handbook-code");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]">
      <View className="flex-1 px-6 pt-6 pb-8">
        <Text className="text-3xl font-bold text-slate-900">Settings</Text>
        <Text className="mt-1 text-sm text-slate-500">
          Manage your handbook connection.
        </Text>

        <View
          className="mt-8 rounded-3xl border p-5"
          style={{
            borderColor: "#E2E8F0",
            backgroundColor: "#FFFFFF",
            shadowColor: "#0F172A",
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <View className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Important
            </Text>
            <Text className="mt-2 text-sm leading-5 text-rose-800">
              Changing handbook will sign out your current account first. This
              ensures no authenticated user is carried over to a different
              handbook.
            </Text>
          </View>

          <Button
            className="mt-5 bg-[#142E67] rounded-xl"
            onPress={handleChangeHandbook}
          >
            <ButtonText className="text-white font-semibold">
              Change handbook
            </ButtonText>
          </Button>

          <Pressable
            className="mt-3"
            onPress={() => {
              router.back();
            }}
          >
            {({ pressed }) => (
              <View
                className="rounded-xl border px-4 py-3"
                style={{
                  borderColor: "#CBD5E1",
                  backgroundColor: pressed ? "#F1F5F9" : "#FFFFFF",
                }}
              >
                <Text className="text-center font-semibold text-slate-700">
                  Cancel
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingsPage;
