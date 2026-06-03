import { useContext } from "react";
import {
  SessionContext,
  type SessionContextValue,
} from "./sessionContextStore";

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
