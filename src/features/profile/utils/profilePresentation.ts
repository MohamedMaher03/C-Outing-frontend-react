import type { UserProfile } from "@/features/profile/types";
import { buildDefaultAvatarDataUrl } from "@/features/profile/utils/defaultAvatar";

export interface ProfileHeaderView {
  avatarSrc: string;
  displayName: string;
  email: string;
  bio: string;
  hasBio: boolean;
  phoneLabel: string;
  ageLabel: string;
  interactionCountLabel: string;
  isBanned: boolean;
}

export const buildProfileHeaderView = (
  profile: UserProfile | null,
  formatNumber: (value: number) => string,
  fallbackName: string,
  phoneMissingLabel: string,
): ProfileHeaderView => {
  const displayName = profile?.name || fallbackName;
  const avatarSrc =
    profile?.avatarUrl ?? buildDefaultAvatarDataUrl(displayName);
  const bio = profile?.bio?.trim() ?? "";

  return {
    avatarSrc,
    displayName,
    email: profile?.email ?? "user@couting.app",
    bio,
    hasBio: bio.length > 0,
    phoneLabel: profile?.phoneNumber || phoneMissingLabel,
    ageLabel: profile?.age != null ? formatNumber(profile.age) : "-",
    interactionCountLabel: formatNumber(profile?.totalInteractions ?? 0),
    isBanned: Boolean(profile?.isBanned),
  };
};

export const resolveAccountChevronClass = (
  direction: "ltr" | "rtl",
): string =>
  direction === "rtl"
    ? "h-4 w-4 shrink-0 text-muted-foreground rotate-180"
    : "h-4 w-4 shrink-0 text-muted-foreground";

export const resolveValidationSectionRing = (
  hasIssue: boolean,
): string =>
  hasIssue
    ? "rounded-2xl ring-2 ring-destructive/50 ring-offset-2 ring-offset-background"
    : "";
