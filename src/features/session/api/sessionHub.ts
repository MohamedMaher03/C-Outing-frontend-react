import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import { AUTH_STORAGE_KEYS } from "@/features/auth/constants";
import type { Session, SessionVotes } from "../types/session.types";
import {
  normalizeSession,
  normalizeSessionVotes,
} from "../utils/normalizeSessionPayload";
import { resolveSessionHubUrl } from "../utils/sessionHubUrl";

export interface SessionHubHandlers {
  onSessionState: (session: Session) => void;
  onSessionVotes: (votes: SessionVotes) => void;
  onSessionEnded: (code: string) => void;
}

const readStoredAuthToken = (): string | null => {
  const localToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  if (localToken) return localToken;
  return sessionStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
};

const noopHandlers: SessionHubHandlers = {
  onSessionState: () => undefined,
  onSessionVotes: () => undefined,
  onSessionEnded: () => undefined,
};

const safeInvoke = <T>(handler: (payload: T) => void, payload: T): void => {
  try {
    handler(payload);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[session-hub] Handler error:", error);
    }
  }
};

export class SessionHubClient {
  private connection: HubConnection | null = null;
  private subscribedCode: string | null = null;
  private handlersBound = false;
  private connectPromise: Promise<void> | null = null;
  private readonly handlersRef: { current: SessionHubHandlers } = {
    current: noopHandlers,
  };

  setHandlers(handlers: SessionHubHandlers): void {
    this.handlersRef.current = handlers;
  }

  private ensureConnection(): HubConnection {
    if (this.connection) return this.connection;

    this.connection = new HubConnectionBuilder()
      .withUrl(resolveSessionHubUrl(), {
        accessTokenFactory: () => readStoredAuthToken() ?? "",
        transport:
          HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        withCredentials: false,
        skipNegotiation: false,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.onreconnected(async () => {
      if (!this.subscribedCode) return;
      try {
        await this.connection?.invoke(
          "SubscribeToSession",
          this.subscribedCode,
        );
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn(
            "[session-hub] Re-subscribe after reconnect failed; HTTP sync will continue.",
            error,
          );
        }
      }
    });

    return this.connection;
  }

  private bindHandlersOnce(): void {
    if (this.handlersBound) return;

    const connection = this.ensureConnection();
    connection.on("ReceiveSessionState", (payload: unknown) => {
      const session = normalizeSession(payload);
      if (!session) return;
      safeInvoke(this.handlersRef.current.onSessionState, session);
    });
    connection.on("ReceiveSessionVotes", (payload: unknown) => {
      const votes = normalizeSessionVotes(payload);
      if (!votes) return;
      safeInvoke(this.handlersRef.current.onSessionVotes, votes);
    });
    connection.on("ReceiveSessionEnded", (payload: unknown) => {
      const code =
        typeof payload === "string"
          ? payload
          : normalizeSession(payload)?.code ??
            (typeof payload === "object" &&
            payload !== null &&
            "code" in payload &&
            typeof (payload as { code: unknown }).code === "string"
              ? (payload as { code: string }).code
              : null);
      if (!code) return;
      safeInvoke(this.handlersRef.current.onSessionEnded, code);
    });
    this.handlersBound = true;
  }

  async connect(handlers: SessionHubHandlers): Promise<void> {
    this.setHandlers(handlers);
    this.bindHandlersOnce();

    if (this.connectPromise) {
      await this.connectPromise;
      return;
    }

    const connection = this.ensureConnection();
    if (connection.state === HubConnectionState.Connected) return;

    this.connectPromise = (async () => {
      if (connection.state === HubConnectionState.Connecting) {
        await this.waitForConnected(connection);
        return;
      }
      try {
        await connection.start();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn(
            "[session-hub] Realtime unavailable; HTTP sync will continue.",
            error,
          );
        }
        throw error;
      }
    })();

    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  private waitForConnected(connection: HubConnection): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        connection.off("close", onClose);
        reject(new Error("SignalR connection timed out."));
      }, 15_000);

      const onClose = () => {
        window.clearTimeout(timeout);
        reject(new Error("SignalR connection closed before connecting."));
      };

      const poll = window.setInterval(() => {
        if (connection.state === HubConnectionState.Connected) {
          window.clearInterval(poll);
          window.clearTimeout(timeout);
          connection.off("close", onClose);
          resolve();
        }
        if (connection.state === HubConnectionState.Disconnected) {
          window.clearInterval(poll);
          window.clearTimeout(timeout);
          connection.off("close", onClose);
          reject(new Error("SignalR failed to connect."));
        }
      }, 100);
    });
  }

  async subscribe(code: string): Promise<void> {
    const connection = this.ensureConnection();
    if (connection.state !== HubConnectionState.Connected) {
      await this.connect(this.handlersRef.current);
    }

    if (this.subscribedCode && this.subscribedCode !== code) {
      await this.unsubscribe(this.subscribedCode);
    }

    await connection.invoke("SubscribeToSession", code);
    this.subscribedCode = code;
  }

  async unsubscribe(code: string): Promise<void> {
    const connection = this.connection;
    if (!connection || connection.state !== HubConnectionState.Connected) return;

    try {
      await connection.invoke("UnsubscribeFromSession", code);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[session-hub] Unsubscribe failed:", error);
      }
      return;
    } finally {
      if (this.subscribedCode === code) {
        this.subscribedCode = null;
      }
    }
  }

  async disconnect(): Promise<void> {
    const connection = this.connection;
    if (!connection) return;

    const code = this.subscribedCode;
    this.subscribedCode = null;

    if (code && connection.state === HubConnectionState.Connected) {
      try {
        await connection.invoke("UnsubscribeFromSession", code);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn(
            "[session-hub] Unsubscribe during disconnect failed:",
            error,
          );
        }
      }
    }

    try {
      await connection.stop();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[session-hub] Stop during disconnect failed:", error);
      }
    } finally {
      this.connection = null;
      this.handlersBound = false;
      this.handlersRef.current = noopHandlers;
    }
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }
}

export const sessionHubClient = new SessionHubClient();
