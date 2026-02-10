import { HandbookProvider } from "@/components/HandbookProvider";
import { Stack } from "expo-router";
import React from "react";

const RootLayout = () => {
  return (
    <>
      <HandbookProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </HandbookProvider>
    </>
  );
};

export default RootLayout;
