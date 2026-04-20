import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { PaginatedResponse } from "@/types";
import type {
  UserProfileDto,
  UserReviewDto,
  UsersDataSource,
} from "../types/dataSource";

export const userApi: UsersDataSource = {
  async getCurrentProfile(): Promise<UserProfileDto> {
    const { data } = await axiosInstance.get<UserProfileDto>(
      API_ENDPOINTS.profile.getCurrentProfile,
    );
    return data;
  },

  async getPublicProfile(userId: string): Promise<UserProfileDto> {
    const { data } = await axiosInstance.get<UserProfileDto>(
      API_ENDPOINTS.users.getPublicProfile(userId),
    );
    return data;
  },

  async getUserReviews(
    userId: string,
    pageIndex = 1,
    pageSize = 10,
  ): Promise<PaginatedResponse<UserReviewDto>> {
    const { data } = await axiosInstance.get<PaginatedResponse<UserReviewDto>>(
      API_ENDPOINTS.users.getReviews(userId),
      {
        params: { pageIndex, pageSize },
      },
    );
    return data;
  },
};
