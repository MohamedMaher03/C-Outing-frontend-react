import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type {
  BatchInteractionResponse,
  RecordInteractionRequest,
} from "@/features/interactions/types";

export const interactionsApi = {
  async recordInteraction(payload: RecordInteractionRequest): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.interactions.record, payload);
  },
  async recordInteractionBatch(
    interactions: RecordInteractionRequest[],
  ): Promise<BatchInteractionResponse> {
    const response = await axiosInstance.post<BatchInteractionResponse>(
      API_ENDPOINTS.interactions.recordBatch,
      { interactions },
    );
    return response.data;
  },
};
