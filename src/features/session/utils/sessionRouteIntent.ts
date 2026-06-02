export type SessionBootstrapIntent =
  | { kind: "create" }
  | { kind: "join"; code: string }
  | { kind: "restore"; code: string }
  | { kind: "pending" };

export const resolveSessionBootstrapIntent = (
  searchParams: URLSearchParams,
  routeCode?: string,
): SessionBootstrapIntent => {
  const action = searchParams.get("action");

  if (action === "create") return { kind: "create" };

  if (action === "join") {
    const joinCode = searchParams.get("code") ?? "";
    return joinCode ? { kind: "join", code: joinCode } : { kind: "pending" };
  }

  return routeCode ? { kind: "restore", code: routeCode } : { kind: "pending" };
};
