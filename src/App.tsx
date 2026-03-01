import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { ProtectedRoute, PublicRoute, OnboardingRoute } from "@/routes";
import AppLayout from "@/components/layout/AppLayout";
import LoginForm from "@/features/auth/components/LoginForm";
import SignUpPage from "@/features/auth/pages/SignUpPage";
import OnboardingPage from "@/features/onboarding/pages/OnboardingPage";
import HomePage from "@/features/home/pages/HomePage";
import FavoritesPage from "@/features/favorites/pages/FavoritesPage";
import PlaceDetailPage from "@/features/place-detail/pages/PlaceDetailPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import EditProfilePage from "@/features/profile/pages/EditProfilePage";
import NotificationsPage from "@/features/profile/pages/NotificationsPage";
import PrivacyPage from "@/features/profile/pages/PrivacyPage";
import HelpSupportPage from "@/features/profile/pages/HelpSupportPage";
import PublicProfilePage from "@/features/users/pages/PublicProfilePage";
import NotFound from "@/pages/NotFound";

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

        {/* App Routes with AppLayout - all require authentication */}
        <Route element={<AppLayout />}>
          {/* Onboarding - only for users who haven't completed it yet */}
          <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <OnboardingPage />
              </OnboardingRoute>
            }
          />

          {/* Home Page */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <div>
                  <h1>Recommendations Page</h1>
                  <p>To be implemented</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/venue/:id"
            element={
              <ProtectedRoute>
                <PlaceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <div>
                  <h1>Map Page</h1>
                  <p>To be implemented</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <div>
                  <h1>Search Page</h1>
                  <p>To be implemented</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/privacy"
            element={
              <ProtectedRoute>
                <PrivacyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/help"
            element={
              <ProtectedRoute>
                <HelpSupportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          {/* Public user profile (read-only) */}
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <PublicProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
