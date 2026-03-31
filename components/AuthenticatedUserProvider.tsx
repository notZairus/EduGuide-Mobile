import {
  AuthenticatedUserContext,
  type AuthenticatedUser,
} from "@/contexts/authenticatedUserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";

const AUTHENTICATED_USER_STORAGE_KEY = "authenticatedUser";

export const AuthenticatedUserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [authenticatedUser, setAuthenticatedUser] =
    React.useState<AuthenticatedUser | null>(null);
  const firstMount = React.useRef(true);

  useEffect(() => {
    async function loadAuthenticatedUserFromStorage() {
      try {
        const storedUser = await AsyncStorage.getItem(
          AUTHENTICATED_USER_STORAGE_KEY,
        );

        if (storedUser) {
          setAuthenticatedUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading authenticated user from storage:", error);
      }
    }

    loadAuthenticatedUserFromStorage();
  }, []);

  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }

    async function saveAuthenticatedUserToStorage() {
      if (authenticatedUser) {
        try {
          await AsyncStorage.setItem(
            AUTHENTICATED_USER_STORAGE_KEY,
            JSON.stringify(authenticatedUser),
          );
        } catch (error) {
          console.error("Error saving authenticated user to storage:", error);
        }
      } else {
        try {
          await AsyncStorage.removeItem(AUTHENTICATED_USER_STORAGE_KEY);
        } catch (error) {
          console.error(
            "Error removing authenticated user from storage:",
            error,
          );
        }
      }
    }

    saveAuthenticatedUserToStorage();
  }, [authenticatedUser, firstMount]);

  return (
    <AuthenticatedUserContext.Provider
      value={{
        authenticatedUser,
        setAuthenticatedUser,
        hydrated: !firstMount.current,
      }}
    >
      {children}
    </AuthenticatedUserContext.Provider>
  );
};
