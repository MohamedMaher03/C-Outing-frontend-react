import { createContext } from "react";
import type { useSession } from "../hooks/useSession";

export type SessionContextValue = ReturnType<typeof useSession>;

export const SessionContext = createContext<SessionContextValue | null>(null);
