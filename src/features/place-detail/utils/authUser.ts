interface AuthUserRecord {
  userId?: unknown;
  id?: unknown;
  name?: unknown;
  avatar?: unknown;
  avatarUrl?: unknown;
  imageUrl?: unknown;
}

export interface AuthUserSnapshot {
  userId: string | null;
  userName: string | null;
  userAvatar: string | null;
}

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const parseAuthUserRecord = (raw: string): AuthUserRecord | null => {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as AuthUserRecord;
  } catch {
    return null;
  }
};

export const readAuthUserSnapshot = (): AuthUserSnapshot => {
  try {
    const raw = localStorage.getItem("authUser");
    if (!raw) {
      return { userId: null, userName: null, userAvatar: null };
    }

    const record = parseAuthUserRecord(raw);
    if (!record) {
      return { userId: null, userName: null, userAvatar: null };
    }

    return {
      userId: asNonEmptyString(record.userId) ?? asNonEmptyString(record.id),
      userName: asNonEmptyString(record.name),
      userAvatar:
        asNonEmptyString(record.avatar) ??
        asNonEmptyString(record.avatarUrl) ??
        asNonEmptyString(record.imageUrl),
    };
  } catch {
    return { userId: null, userName: null, userAvatar: null };
  }
};

export const getCurrentAuthUserId = (): string | null =>
  readAuthUserSnapshot().userId;

export const getCurrentAuthUserProfile = (): {
  userId?: string;
  userName?: string;
  userAvatar?: string;
} => {
  const snapshot = readAuthUserSnapshot();
  return {
    userId: snapshot.userId ?? undefined,
    userName: snapshot.userName ?? undefined,
    userAvatar: snapshot.userAvatar ?? undefined,
  };
};
