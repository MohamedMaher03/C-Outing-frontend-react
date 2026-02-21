/**
 * Shared Hooks — Cross-feature utilities
 *
 * Feature-specific hooks live inside their feature:
 *   @/features/auth/hooks/useLogin
 *   @/features/auth/hooks/useSignUp
 *   @/features/home/hooks/useHome
 *   @/features/favorites/hooks/useFavorites
 *   @/features/place-detail/hooks/usePlaceDetail
 *   @/features/onboarding/hooks/useOnboarding
 *   @/features/profile/hooks/useProfile
 */
export { useGeolocation } from "./useGeolocation";
export { useAsync } from "./useAsync";
export { useLocalStorage } from "./useLocalStorage";
