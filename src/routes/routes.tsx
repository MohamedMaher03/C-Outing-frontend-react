/**
 * Route Paths Configuration
 *
 * Central place for all route paths used across the application.
 * Helps maintain consistency and avoid typos.
 */

export const ROUTES = {
  // Public Routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",

  // Protected Routes
  RECOMMENDATIONS: "/recommendations",
  VENUE_DETAIL: (id: string) => `/venue/${id}`,
  SEARCH: "/search",
  PROFILE: "/profile",
  FAVORITES: "/favorites",

  // Error Routes
  NOT_FOUND: "*",
};

/**
 * Route Descriptions
 * Useful for breadcrumbs, navigation menus, etc.
 */
export const ROUTE_DESCRIPTIONS = {
  [ROUTES.HOME]: {
    path: ROUTES.HOME,
    title: "Home",
    description: "Welcome to HCARS",
  },
  [ROUTES.LOGIN]: {
    path: ROUTES.LOGIN,
    title: "Login",
    description: "Sign in to your account",
  },
  [ROUTES.REGISTER]: {
    path: ROUTES.REGISTER,
    title: "Register",
    description: "Create a new account",
  },
  [ROUTES.RECOMMENDATIONS]: {
    path: ROUTES.RECOMMENDATIONS,
    title: "Recommendations",
    description: "Personalized venue recommendations",
  },
  [ROUTES.SEARCH]: {
    path: ROUTES.SEARCH,
    title: "Search",
    description: "Search for venues",
  },
  [ROUTES.PROFILE]: {
    path: ROUTES.PROFILE,
    title: "Profile",
    description: "Your profile settings",
  },
  [ROUTES.FAVORITES]: {
    path: ROUTES.FAVORITES,
    title: "Favorites",
    description: "Your favorite venues",
  },
};
