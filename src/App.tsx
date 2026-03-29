import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import {
  ProtectedRoute,
  PublicRoute,
  RoleBasedRoute,
  OnboardingRoute,
} from "@/routes";
import AppLayout from "@/components/layout/AppLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import type { DashboardNavItem } from "@/components/layout/DashboardLayout";
import RoleBasedLayout from "./components/layout/RoleBasedLayout";

// Admin pages
import {
  LayoutDashboard,
  Users,
  MapPin,
  MessageSquare,
  Tags,
  Settings,
  ShieldAlert,
} from "lucide-react";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const SignUpPage = lazy(() => import("@/features/auth/pages/SignUpPage"));
const VerifyEmailPage = lazy(
  () => import("@/features/auth/pages/VerifyEmailPage"),
);
const ForgotPasswordPage = lazy(
  () => import("@/features/auth/pages/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(
  () => import("@/features/auth/pages/ResetPasswordPage"),
);
const OnboardingPage = lazy(
  () => import("@/features/onboarding/pages/OnboardingPage"),
);
const HomePage = lazy(() => import("@/features/home/pages/HomePage"));
const HomeSeeAllPage = lazy(
  () => import("@/features/home/pages/HomeSeeAllPage"),
);
const FavoritesPage = lazy(
  () => import("@/features/favorites/pages/FavoritesPage"),
);
const PlaceDetailPage = lazy(
  () => import("@/features/place-detail/pages/PlaceDetailPage"),
);
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));
const EditProfilePage = lazy(
  () => import("@/features/profile/pages/EditProfilePage"),
);
const NotificationsPage = lazy(
  () => import("@/features/profile/pages/NotificationsPage"),
);
const PrivacyPage = lazy(() => import("@/features/profile/pages/PrivacyPage"));
const HelpSupportPage = lazy(
  () => import("@/features/profile/pages/HelpSupportPage"),
);
const PublicProfilePage = lazy(
  () => import("@/features/users/pages/PublicProfilePage"),
);
const NotFound = lazy(() => import("@/pages/NotFound"));

const AdminDashboardPage = lazy(
  () => import("@/features/admin/pages/AdminDashboardPage"),
);
const ManageUsersPage = lazy(
  () => import("@/features/admin/pages/ManageUsersPage"),
);
const ManagePlacesPage = lazy(
  () => import("@/features/admin/pages/ManagePlacesPage"),
);
const ManageReviewsPage = lazy(
  () => import("@/features/admin/pages/ManageReviewsPage"),
);
const ManageCategoriesPage = lazy(
  () => import("@/features/admin/pages/ManageCategoriesPage"),
);
const SystemSettingsPage = lazy(
  () => import("@/features/admin/pages/SystemSettingsPage"),
);

const ModeratorDashboardPage = lazy(
  () => import("@/features/moderator/pages/ModeratorDashboardPage"),
);
const ModerateReviewsPage = lazy(
  () => import("@/features/moderator/pages/ModerateReviewsPage"),
);
const ModeratePlacesPage = lazy(
  () => import("@/features/moderator/pages/ModeratePlacesPage"),
);
const ReportedContentPage = lazy(
  () => import("@/features/moderator/pages/ReportedContentPage"),
);

// ── Nav Configs ──────────────────────────────────────────────

const adminNavItems: DashboardNavItem[] = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/users", label: "Manage Users", icon: Users },
  { path: "/admin/places", label: "Manage Places", icon: MapPin },
  { path: "/admin/reviews", label: "Manage Reviews", icon: MessageSquare },
  { path: "/admin/categories", label: "Categories", icon: Tags },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const moderatorNavItems: DashboardNavItem[] = [
  { path: "/moderator", label: "Dashboard", icon: LayoutDashboard },
  {
    path: "/moderator/reviews",
    label: "Moderate Reviews",
    icon: MessageSquare,
  },
  { path: "/moderator/places", label: "Moderate Places", icon: MapPin },
  { path: "/moderator/reports", label: "Reported Content", icon: ShieldAlert },
];

/**
 * Main App Component with Routing
 *
 * Wraps the application with Router and defines route structure.
 * Context providers (Auth, Theme) should be added here for global state.
 */
function App() {
  return (
    <Router>
      <Suspense
        fallback={
          <PageLoading
            text="Discovering Cairo"
            subText="Finding the best places for you..."
          />
        }
      >
        <Routes>
          {/* Public Routes - No Layout */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Onboarding — only for users who haven't completed it yet */}
          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <OnboardingPage />
              </OnboardingRoute>
            }
          />

          {/* App Routes with AppLayout - all require authentication */}
          {/* ── User Routes (ONLY user role) ───────────────────────── */}

          <Route
            element={
              <RoleBasedRoute allowedRoles={["user"]} redirectTo="/not-found">
                <AppLayout />
              </RoleBasedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route
              path="/home/see-all/:collection"
              element={<HomeSeeAllPage />}
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route
              path="/profile/notifications"
              element={<NotificationsPage />}
            />
            <Route path="/profile/privacy" element={<PrivacyPage />} />
            <Route path="/profile/help" element={<HelpSupportPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route
              path="/notifications"
              element={<Navigate to="/" replace />}
            />
          </Route>

          {/* ── Protected Routes (ANY authenticated user) ──────────────────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <RoleBasedLayout
                  adminNavItems={adminNavItems}
                  moderatorNavItems={moderatorNavItems}
                />
              </ProtectedRoute>
            }
          >
            <Route path="/venue/:id" element={<PlaceDetailPage />} />
            <Route path="/users/:id" element={<PublicProfilePage />} />
            <Route path="/not-found" element={<NotFound />} />
          </Route>

          {/* ── Admin Routes ──────────────────────────────── */}
          <Route
            element={
              <RoleBasedRoute allowedRoles={["admin"]} redirectTo="/not-found">
                <DashboardLayout navItems={adminNavItems} title="Admin Panel" />
              </RoleBasedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<ManageUsersPage />} />
            <Route path="/admin/places" element={<ManagePlacesPage />} />
            <Route path="/admin/reviews" element={<ManageReviewsPage />} />
            <Route
              path="/admin/categories"
              element={<ManageCategoriesPage />}
            />
            <Route path="/admin/settings" element={<SystemSettingsPage />} />
          </Route>

          {/* ── Moderator Routes ──────────────────────────── */}
          <Route
            element={
              <RoleBasedRoute
                allowedRoles={["moderator"]}
                redirectTo="/not-found"
              >
                <DashboardLayout
                  navItems={moderatorNavItems}
                  title="Moderator"
                />
              </RoleBasedRoute>
            }
          >
            <Route path="/moderator" element={<ModeratorDashboardPage />} />
            <Route
              path="/moderator/reviews"
              element={<ModerateReviewsPage />}
            />
            <Route path="/moderator/places" element={<ModeratePlacesPage />} />
            <Route
              path="/moderator/reports"
              element={<ReportedContentPage />}
            />
          </Route>

          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
