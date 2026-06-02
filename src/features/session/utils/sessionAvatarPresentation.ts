import { MEMBER_AVATAR_SWATCHES } from "../constants/sessionPresentation";

export const deriveMemberInitials = (displayName: string): string =>
  displayName
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const resolveAvatarSwatch = (memberId: string): string => {
  const hash = [...memberId].reduce(
    (accumulator, character) =>
      character.charCodeAt(0) + ((accumulator << 5) - accumulator),
    0,
  );
  return MEMBER_AVATAR_SWATCHES[
    Math.abs(hash) % MEMBER_AVATAR_SWATCHES.length
  ];
};
