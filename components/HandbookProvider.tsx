import { HandbookContext } from "@/contexts/handbookContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";

export const HandbookProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [handbook, setHandbook] = React.useState<Handbook | null>(null);
  const firstMount = React.useRef(true);

  useEffect(() => {
    async function loadHandbookFromStorage() {
      try {
        const storedHandbook = await AsyncStorage.getItem("handbook");
        if (storedHandbook) {
          setHandbook(JSON.parse(storedHandbook));
        }
      } catch (error) {
        console.error("Error loading handbook from storage:", error);
      }
    }

    loadHandbookFromStorage();
  }, []);

  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }

    async function saveHandbookToStorage() {
      if (handbook) {
        try {
          await AsyncStorage.setItem("handbook", JSON.stringify(handbook));
        } catch (error) {
          console.error("Error saving handbook to storage:", error);
        }
      } else {
        try {
          await AsyncStorage.removeItem("handbook");
        } catch (error) {
          console.error("Error removing handbook from storage:", error);
        }
      }
    }

    saveHandbookToStorage();
  }, [handbook, firstMount]);

  return (
    <HandbookContext.Provider
      value={{ handbook, setHandbook, hydrated: !firstMount }}
    >
      {children}
    </HandbookContext.Provider>
  );
};
