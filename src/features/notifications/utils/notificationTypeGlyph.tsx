import {
  Bell,
  Heart,
  MapPin,
  MessageSquare,
  Star,
  ThumbsUp,
} from "lucide-react";
import type { NotificationType } from "@/features/notifications/types";
import type { LucideIcon } from "lucide-react";

const NOTIFICATION_TYPE_GLYPH: Readonly<
  Partial<Record<NotificationType, LucideIcon>>
> = {
  recommendation: Star,
  favorite_update: Heart,
  review_response: MessageSquare,
  like: ThumbsUp,
  new_place: MapPin,
  system: Bell,
};

export const renderNotificationTypeGlyph = (
  type: NotificationType,
  className: string,
) => {
  const Glyph = NOTIFICATION_TYPE_GLYPH[type] ?? Bell;
  return <Glyph className={className} />;
};
