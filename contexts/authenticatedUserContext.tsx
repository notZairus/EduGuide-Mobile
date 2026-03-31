import React from "react";

export type AuthenticatedUser = {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
};

interface AuthenticatedUserContextType {
  authenticatedUser: AuthenticatedUser | null;
  setAuthenticatedUser: React.Dispatch<
    React.SetStateAction<AuthenticatedUser | null>
  >;
  hydrated?: boolean;
}

export const AuthenticatedUserContext =
  React.createContext<AuthenticatedUserContextType>({
    authenticatedUser: null,
    setAuthenticatedUser: () => {},
  });

export default AuthenticatedUserContext;
