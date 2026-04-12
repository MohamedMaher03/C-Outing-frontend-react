/**
 * Notifications Service — Business Logic Layer
 *
 * Sits between hooks/components and the datasource layer.
 * This layer is intentionally framework-agnostic (no React imports).
 */

import {
  mapNotificationsPage,
  normalizeNotificationId,
  normalizePageIndex,
  normalizePageSize,
  normalizeUnreadCount,
} from "../mappers/notificationsMapper";
import { notificationsDataSource } from "./notificationsDataSource";
import type {
  NotificationsQueryParams,
  NotificationsResponse,
  NotificationActionResponse,
} from "../types";

const DEFAULT_FEED_PARAMS = {
  pageIndex: 1,
  pageSize: 50,
} satisfies Required<NotificationsQueryParams>;

const FEED_CACHE_TTL_MS = 30_000;
const UNREAD_COUNT_CACHE_TTL_MS = 20_000;

type FeedCacheEntry = {
  key: string;
  data: NotificationsResponse;
  expiresAt: number;
};

type CountCacheEntry = {
  value: number;
  expiresAt: number;
};

let feedCache: FeedCacheEntry | null = null;
let unreadCountCache: CountCacheEntry | null = null;

const inFlightFeedRequests = new Map<string, Promise<NotificationsResponse>>();
let inFlightUnreadCountRequest: Promise<number> | null = null;

const isCacheFresh = (expiresAt: number): boolean => Date.now() < expiresAt;

const makeFeedCacheKey = (params: Required<NotificationsQueryParams>): string =>
  `${params.pageIndex}:${params.pageSize}`;

const normalizeFeedParams = (
  params?: NotificationsQueryParams,
): Required<NotificationsQueryParams> => ({
  pageIndex: normalizePageIndex(
    params?.pageIndex ?? DEFAULT_FEED_PARAMS.pageIndex,
  ),
  pageSize: normalizePageSize(params?.pageSize ?? DEFAULT_FEED_PARAMS.pageSize),
});

const setFeedCache = (key: string, data: NotificationsResponse): void => {
  feedCache = {
    key,
    data,
    expiresAt: Date.now() + FEED_CACHE_TTL_MS,
  };
};

const setUnreadCountCache = (value: number): void => {
  unreadCountCache = {
    value,
    expiresAt: Date.now() + UNREAD_COUNT_CACHE_TTL_MS,
  };
};

const invalidateNotificationsCache = (): void => {
  feedCache = null;
  unreadCountCache = null;
};

interface NotificationsRequestOptions {
  forceRefresh?: boolean;
}

export const notificationsService = {
  defaultFeedParams: DEFAULT_FEED_PARAMS,

  invalidateCache: invalidateNotificationsCache,

  async getNotifications(
    params?: NotificationsQueryParams,
    options: NotificationsRequestOptions = {},
  ): Promise<NotificationsResponse> {
    const normalizedParams = normalizeFeedParams(params);
    const key = makeFeedCacheKey(normalizedParams);

    if (
      !options.forceRefresh &&
      feedCache &&
      feedCache.key === key &&
      isCacheFresh(feedCache.expiresAt)
    ) {
      return feedCache.data;
    }

    const inFlight = inFlightFeedRequests.get(key);
    if (inFlight) {
      return inFlight;
    }

    const request = notificationsDataSource
      .getNotifications(normalizedParams)
      .then((response) => {
        const mapped = mapNotificationsPage(response);
        setFeedCache(key, mapped);
        return mapped;
      })
      .finally(() => {
        inFlightFeedRequests.delete(key);
      });

    inFlightFeedRequests.set(key, request);
    return request;
  },

  async getUnreadCount(
    options: NotificationsRequestOptions = {},
  ): Promise<number> {
    if (
      !options.forceRefresh &&
      unreadCountCache &&
      isCacheFresh(unreadCountCache.expiresAt)
    ) {
      return unreadCountCache.value;
    }

    if (inFlightUnreadCountRequest) {
      return inFlightUnreadCountRequest;
    }

    inFlightUnreadCountRequest = notificationsDataSource
      .getUnreadCount()
      .then((count) => {
        const normalized = normalizeUnreadCount(count);
        setUnreadCountCache(normalized);
        return normalized;
      })
      .finally(() => {
        inFlightUnreadCountRequest = null;
      });

    return inFlightUnreadCountRequest;
  },

  async markAsRead(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    const response = await notificationsDataSource.markAsRead(
      normalizeNotificationId(notificationId),
    );
    invalidateNotificationsCache();
    return response;
  },

  async markAllAsRead(): Promise<NotificationActionResponse> {
    const response = await notificationsDataSource.markAllAsRead();
    invalidateNotificationsCache();
    return response;
  },

  async deleteNotification(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    const response = await notificationsDataSource.deleteNotification(
      normalizeNotificationId(notificationId),
    );
    invalidateNotificationsCache();
    return response;
  },
};

// Named exports kept for backward compatibility.
export const getNotifications = notificationsService.getNotifications;
export const getUnreadNotificationsCount = notificationsService.getUnreadCount;
export const markNotificationAsRead = notificationsService.markAsRead;
export const markAllNotificationsAsRead = notificationsService.markAllAsRead;
export const deleteNotification = notificationsService.deleteNotification;
