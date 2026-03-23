/**
 * Notifications Mock Implementation
 *
 * Drop-in replacement for notificationsApi — mirrors the same interface so it
 * can be swapped in notificationsService.ts without changing any other code:
 *
 *   // notificationsService.ts — swap this one line:
 *   import { notificationsMock as notificationsApi } from "../mocks/notificationsMock";
 *
 * Simulates realistic network latency and in-memory notifications storage.
 */

import type {
  Notification,
  NotificationsResponse,
  NotificationActionResponse,
} from "../types";

// ── Seed data ───────────────────────────────────────────────

const now = new Date();

const todayMinus = (minutes: number) =>
  new Date(now.getTime() - 1000 * 60 * minutes).toISOString();

const yesterdayMinus = (hours: number) => {
  const d = new Date(now);
  d.setDate(now.getDate() - 1);
  return new Date(d.getTime() - 1000 * 60 * 60 * hours).toISOString();
};

const earlierMinus = (days: number) => {
  const d = new Date(now);
  d.setDate(now.getDate() - days);
  return d.toISOString();
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  // ── Today ───────────────────────────────────────────────
  {
    id: "n1",
    type: "recommendation",
    title: "New place just for you 🌟",
    message:
      "Based on your vibe settings, you might love Ovio Rooftop in Zamalek. Check it out before it gets crowded!",
    isRead: false,
    createdAt: todayMinus(25),
    actionUrl: "/venue/ovio-rooftop",
  },
  {
    id: "n2",
    type: "like",
    title: "Ahmed liked your review",
    message: "Your review on Sequoia Restaurant was liked by Ahmed Hassan.",
    isRead: false,
    createdAt: todayMinus(90),
    actionUrl: "/venue/sequoia",
  },
  {
    id: "n3",
    type: "review_response",
    title: "New reply on your review",
    message:
      'The owner of Cairo Jazz Club replied: "Thank you for your kind words! We look forward to seeing you again."',
    isRead: false,
    createdAt: todayMinus(180),
    actionUrl: "/venue/cairo-jazz-club",
  },
  // ── Yesterday ────────────────────────────────────────────
  {
    id: "n4",
    type: "favorite_update",
    title: "Sequoia updated its hours",
    message:
      "A place you saved has changed its opening hours. Now open until 2:00 AM on weekends.",
    isRead: true,
    createdAt: yesterdayMinus(2),
    actionUrl: "/venue/sequoia",
  },
  {
    id: "n5",
    type: "new_place",
    title: "New spot in Zamalek! 🗺️",
    message:
      "BABEL Rooftop & Lounge just opened nearby and matches your weekend vibe perfectly.",
    isRead: false,
    createdAt: yesterdayMinus(5),
    actionUrl: "/venue/babel-rooftop",
  },
  {
    id: "n6",
    type: "like",
    title: "3 people liked your review",
    message:
      "Your review on Kazoku Sushi received 3 new likes in the last 24 hours.",
    isRead: true,
    createdAt: yesterdayMinus(9),
    actionUrl: "/venue/kazoku-sushi",
  },
  // ── Earlier ───────────────────────────────────────────────
  {
    id: "n7",
    type: "system",
    title: "Welcome to C-Outing 2.0! 🎉",
    message:
      "We've launched AI-powered recommendations, a refreshed design, and smarter search. Explore what's new!",
    isRead: true,
    createdAt: earlierMinus(4),
    actionUrl: undefined,
  },
  {
    id: "n8",
    type: "recommendation",
    title: "5 weekend places picked for you",
    message:
      "Friday evening hotspots are trending in Maadi. Tap to see your curated weekend list.",
    isRead: true,
    createdAt: earlierMinus(5),
    actionUrl: "/",
  },
  {
    id: "n9",
    type: "favorite_update",
    title: "Kazoku Sushi is now fully booked",
    message:
      "A saved place of yours has no available slots this weekend. Consider exploring similar spots.",
    isRead: true,
    createdAt: earlierMinus(6),
    actionUrl: "/venue/kazoku-sushi",
  },
];

// ── In-memory mock store ─────────────────────────────────────

let mockNotifications: Notification[] = [...MOCK_NOTIFICATIONS];

// ── Helper ───────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Mock Notifications API ───────────────────────────────────
// Interface intentionally mirrors notificationsApi so they are interchangeable.

export const notificationsMock = {
  /**
   * Mock GET /users/:userId/notifications
   */
  async getNotifications(): Promise<NotificationsResponse> {
    await delay(600);
    return {
      items: [...mockNotifications],
      pageIndex: 1,
      pageSize: mockNotifications.length,
      totalCount: mockNotifications.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  },

  /**
   * Mock GET /api/v1/Notification/unread
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    await delay(250);
    return mockNotifications.filter((n) => !n.isRead);
  },

  /**
   * Mock GET /api/v1/Notification/unread-count
   */
  async getUnreadCount(): Promise<number> {
    await delay(150);
    return mockNotifications.filter((n) => !n.isRead).length;
  },

  /**
   * Mock PATCH /notifications/:notificationId/read
   */
  async markAsRead(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    await delay(200);
    mockNotifications = mockNotifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n,
    );
    return "Notification marked as read";
  },

  /**
   * Mock PATCH /users/:userId/notifications/read-all
   */
  async markAllAsRead(): Promise<NotificationActionResponse> {
    await delay(300);
    mockNotifications = mockNotifications.map((n) => ({ ...n, isRead: true }));
    return "All notifications marked as read";
  },

  /**
   * Mock DELETE /notifications/:notificationId
   */
  async deleteNotification(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    await delay(250);
    mockNotifications = mockNotifications.filter(
      (n) => n.id !== notificationId,
    );
    return "Notification deleted";
  },
};
