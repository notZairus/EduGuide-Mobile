import { useContext } from "react";
import { HandbookContext } from "../contexts/handbookContext";

export const useHandbook = () => {
  const context = useContext(HandbookContext);
  if (!context)
    throw new Error("handbook context is used outside of its provider.");
  return context;
};
