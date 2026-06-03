import type { ReactNode } from "react";
import { useSession } from "../hooks/useSession";
import { SessionContext } from "./sessionContextStore";

export function SessionProvider({ children }: { children: ReactNode }) {
  const value = useSession();
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
