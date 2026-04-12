import { HandbookContext } from "@/contexts/handbookContext";
import { api } from "@/utils/api";
import { hasInternet } from "@/utils/helper";
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

  useEffect(() => {
    if (!handbook?.code) return;

    let isActive = true;
    let isFetching = false;

    const updateHandbook = async () => {
      if (isFetching) return;
      isFetching = true;

      try {
        const isOnline = await hasInternet();
        if (!isOnline) return;

        const res = await api.get(`/handbooks/code/${handbook.code}`);
        if (res.status === 200 && isActive) {
          setHandbook(res.data);
        }
      } catch (error) {
        console.error("Error polling handbook updates:", error);
      } finally {
        isFetching = false;
      }
    };

    updateHandbook();
    const intervalId = setInterval(updateHandbook, 10000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [handbook?.code]);

  return (
    <HandbookContext.Provider
      value={{ handbook, setHandbook, hydrated: !firstMount }}
    >
      {children}
    </HandbookContext.Provider>
  );
};
