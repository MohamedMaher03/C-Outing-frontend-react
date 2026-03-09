import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import {
  ProtectedRoute,
  PublicRoute,
  RoleBasedRoute,
  OnboardingRoute,
} from "@/routes";
import AppLayout from "@/components/layout/AppLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoginForm from "@/features/auth/components/LoginForm";
import SignUpPage from "@/features/auth/pages/SignUpPage";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import OnboardingPage from "@/features/onboarding/pages/OnboardingPage";
import HomePage from "@/features/home/pages/HomePage";
import FavoritesPage from "@/features/favorites/pages/FavoritesPage";
import PlaceDetailPage from "@/features/place-detail/pages/PlaceDetailPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import EditProfilePage from "@/features/profile/pages/EditProfilePage";
import NotificationsPage from "@/features/profile/pages/NotificationsPage";
import NotificationsFeedPage from "@/features/notifications/pages/NotificationsPage";
import PrivacyPage from "@/features/profile/pages/PrivacyPage";
import HelpSupportPage from "@/features/profile/pages/HelpSupportPage";
import PublicProfilePage from "@/features/users/pages/PublicProfilePage";
import NotFound from "@/pages/NotFound";

// Admin pages
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import ManageUsersPage from "@/features/admin/pages/ManageUsersPage";
import ManagePlacesPage from "@/features/admin/pages/ManagePlacesPage";
import ManageReviewsPage from "@/features/admin/pages/ManageReviewsPage";
import ManageCategoriesPage from "@/features/admin/pages/ManageCategoriesPage";
import SystemSettingsPage from "@/features/admin/pages/SystemSettingsPage";

// Moderator pages
import ModeratorDashboardPage from "@/features/moderator/pages/ModeratorDashboardPage";
import ModerateReviewsPage from "@/features/moderator/pages/ModerateReviewsPage";
import ModeratePlacesPage from "@/features/moderator/pages/ModeratePlacesPage";
import ReportedContentPage from "@/features/moderator/pages/ReportedContentPage";

// Icons for dashboard nav
import {
  LayoutDashboard,
  Users,
  MapPin,
  MessageSquare,
  Tags,
  Settings,
  ShieldAlert,
} from "lucide-react";

import type { DashboardNavItem } from "@/components/layout/DashboardLayout";
import RoleBasedLayout from "./components/layout/RoleBasedLayout";

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
      <Routes>
        {/* Public Routes - No Layout */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route
            path="/profile/notifications"
            element={<NotificationsPage />}
          />
          <Route path="/profile/privacy" element={<PrivacyPage />} />
          <Route path="/profile/help" element={<HelpSupportPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/notifications" element={<NotificationsFeedPage />} />
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
          <Route path="/admin/categories" element={<ManageCategoriesPage />} />
          <Route path="/admin/settings" element={<SystemSettingsPage />} />
        </Route>

        {/* ── Moderator Routes ──────────────────────────── */}
        <Route
          element={
            <RoleBasedRoute
              allowedRoles={["moderator"]}
              redirectTo="/not-found"
            >
              <DashboardLayout navItems={moderatorNavItems} title="Moderator" />
            </RoleBasedRoute>
          }
        >
          <Route path="/moderator" element={<ModeratorDashboardPage />} />
          <Route path="/moderator/reviews" element={<ModerateReviewsPage />} />
          <Route path="/moderator/places" element={<ModeratePlacesPage />} />
          <Route path="/moderator/reports" element={<ReportedContentPage />} />
        </Route>

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
