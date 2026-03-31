import { AuthenticatedUserContext } from "@/contexts/authenticatedUserContext";
import { useContext } from "react";

export const useAuthenticatedUser = () => {
  const context = useContext(AuthenticatedUserContext);
  if (!context) {
    throw new Error(
      "authenticated user context is used outside of its provider.",
    );
  }

  return context;
};
