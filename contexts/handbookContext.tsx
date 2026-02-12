import React from "react";

interface HandbookContextType {
  handbook: Handbook | null;
  setHandbook: React.Dispatch<React.SetStateAction<Handbook | null>>;
  hydrated?: boolean;
}

export const HandbookContext = React.createContext<HandbookContextType>({
  handbook: null,
  setHandbook: () => {},
});

export default HandbookContext;
