/**
 * API Service Layer
 * High-level API functions wrapping apiClient for specific features
 */

export { apiClient } from "./client";

// Export individual service modules
export * from "./authService";
export * from "./userService";
export * from "./venueService";
export * from "./recommendationService";
export * from "./interactionService";
export * from "./homeService";
export * from "./onboardingService";
