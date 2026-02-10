import { HandbookContext } from "@/contexts/handbookContext";
import React from "react";

export const HandbookProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [handbook, setHandbook] = React.useState<Handbook | null>(null);

  return (
    <HandbookContext.Provider value={{ handbook, setHandbook }}>
      {children}
    </HandbookContext.Provider>
  );
};
