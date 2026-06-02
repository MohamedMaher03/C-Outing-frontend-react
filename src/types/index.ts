export type UserRole = "user" | "moderator" | "admin";

export interface User {
  userId: string;
  name: string;
  email: string;
  hasCompletedOnboarding: boolean;
  role: UserRole;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode?: number;
  data: T | null;
  message: string;
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface QueryParams {
  page?: number;
  count?: number;
}
