import type { Session, SessionVotes, SessionVoteOption } from "../types/session.types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object";

const unwrapApiData = (payload: unknown): unknown => {
  if (!isRecord(payload)) return payload;
  if ("data" in payload && isRecord(payload.data)) return payload.data;
  return payload;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toOptionalString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeVoteOption = (raw: unknown): SessionVoteOption | null => {
  if (!isRecord(raw)) return null;
  const venueId = toOptionalString(raw.venueId ?? raw.VenueId);
  if (!venueId) return null;
  return {
    venueId,
    votes: toNumber(raw.votes ?? raw.Votes, 0),
  };
};

export const normalizeSessionVotes = (
  payload: unknown,
  fallbackCode?: string,
): SessionVotes | null => {
  const unwrapped = unwrapApiData(payload);
  if (!isRecord(unwrapped)) return null;

  const rawOptions = unwrapped.options ?? unwrapped.Options;
  const options = Array.isArray(rawOptions)
    ? rawOptions
        .map(normalizeVoteOption)
        .filter((option): option is SessionVoteOption => option !== null)
    : [];

  const code =
    toOptionalString(unwrapped.code ?? unwrapped.Code) ?? fallbackCode;
  if (!code) return null;

  return {
    code,
    totalMembers: toNumber(unwrapped.totalMembers ?? unwrapped.TotalMembers, 0),
    submittedVotes: toNumber(
      unwrapped.submittedVotes ?? unwrapped.SubmittedVotes,
      0,
    ),
    options,
    winningVenueId: toOptionalString(
      unwrapped.winningVenueId ?? unwrapped.WinningVenueId,
    ),
  };
};

export const normalizeSession = (payload: unknown): Session | null => {
  const unwrapped = unwrapApiData(payload);
  if (!isRecord(unwrapped)) return null;

  const code = toOptionalString(unwrapped.code ?? unwrapped.Code);
  if (!code) return null;

  const rawHost = unwrapped.host ?? unwrapped.Host;
  if (!isRecord(rawHost)) return null;

  const hostId = toOptionalString(rawHost.id ?? rawHost.Id);
  const hostName = toOptionalString(rawHost.name ?? rawHost.Name);
  if (!hostId || !hostName) return null;

  const rawMembers = unwrapped.members ?? unwrapped.Members;
  const members = Array.isArray(rawMembers)
    ? rawMembers
        .map((member) => {
          if (!isRecord(member)) return null;
          const id = toOptionalString(member.id ?? member.Id);
          const name = toOptionalString(member.name ?? member.Name);
          if (!id || !name) return null;
          const avatarUrl = toOptionalString(
            member.avatarUrl ?? member.AvatarUrl,
          );
          return avatarUrl ? { id, name, avatarUrl } : { id, name };
        })
        .filter((member): member is NonNullable<typeof member> => member !== null)
    : [];

  const rawMemberVotes = unwrapped.memberVotes ?? unwrapped.MemberVotes;
  let memberVotes: Record<string, string> | undefined;
  if (isRecord(rawMemberVotes)) {
    memberVotes = {};
    for (const [userId, venueId] of Object.entries(rawMemberVotes)) {
      const normalizedVenueId = toOptionalString(venueId);
      if (normalizedVenueId) memberVotes[userId] = normalizedVenueId;
    }
  }

  const statusRaw = toOptionalString(unwrapped.status ?? unwrapped.Status);
  const status: Session["status"] =
    statusRaw === "ready" ? "ready" : "waiting";

  const createdAt =
    toOptionalString(unwrapped.createdAt ?? unwrapped.CreatedAt) ??
    new Date().toISOString();

  return {
    code,
    host: { id: hostId, name: hostName },
    members,
    createdAt,
    status,
    memberVotes,
    winningVenueId: toOptionalString(
      unwrapped.winningVenueId ?? unwrapped.WinningVenueId,
    ),
  };
};

export const buildVoteCountMap = (
  votes: SessionVotes | null,
): Map<string, number> => {
  const map = new Map<string, number>();
  if (!votes?.options?.length) return map;

  for (const option of votes.options) {
    map.set(option.venueId.toLowerCase(), option.votes);
  }
  return map;
};

export const normalizeVenueId = (value: string | undefined | null): string =>
  (value ?? "").trim().toLowerCase();
