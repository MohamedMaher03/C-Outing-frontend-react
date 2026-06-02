import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionMember } from "../types/session.types";
import type { MemberAvatarSize } from "../constants/sessionPresentation";
import { MEMBER_AVATAR_DIMENSIONS } from "../constants/sessionPresentation";
import {
  deriveMemberInitials,
  resolveAvatarSwatch,
} from "../utils/sessionAvatarPresentation";

interface MemberAvatarProps {
  member: SessionMember;
  isHost: boolean;
  size?: MemberAvatarSize;
}

export function MemberAvatar({
  member,
  isHost,
  size = "md",
}: MemberAvatarProps) {
  const initials = deriveMemberInitials(member.name);

  return (
    <div className="relative flex-shrink-0">
      {member.avatarUrl ? (
        <img
          src={member.avatarUrl}
          alt={member.name}
          className={cn(
            "rounded-full object-cover ring-2 ring-border/60",
            MEMBER_AVATAR_DIMENSIONS[size],
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-border/60",
            resolveAvatarSwatch(member.id),
            MEMBER_AVATAR_DIMENSIONS[size],
          )}
        >
          {initials}
        </div>
      )}
      {isHost && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(38,42%,58%)] shadow-sm">
          <Crown className="h-2.5 w-2.5 text-white" />
        </span>
      )}
    </div>
  );
}
