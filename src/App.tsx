import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { ProtectedRoute, PublicRoute } from "./routes";
import AppLayout from "./components/AppLayout";
import LoginForm from "./components/auth/LoginForm";
import SignUpPage from "../src/pages/auth/SignUpPage";
import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";
import FavoritesPage from "./pages/FavoritesPage";
import PlaceDetailPage from "./pages/PlaceDetailPage";
import ProfilePage from "./pages/profile/ProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import NotificationsPage from "./pages/profile/NotificationsPage";
import PrivacyPage from "./pages/profile/PrivacyPage";
import HelpSupportPage from "./pages/profile/HelpSupportPage";
import NotFound from "./pages/NotFound";

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
        <Route element={<AppLayout />}>
          {/* Home Page */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            }
          />
        </Route>
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
        <Route
          path="/onboarding"
          element={
            <PublicRoute>
              <OnboardingPage />
            </PublicRoute>
          }
        />

        {/* App Routes with AppLayout */}
        <Route element={<AppLayout />}>
          {/* Home Page */}
          <Route
            path="/home"
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
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
              <PublicRoute>
                <PlaceDetailPage />
              </PublicRoute>
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
              <PublicRoute>
                <ProfilePage />
              </PublicRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <PublicRoute>
                <EditProfilePage />
              </PublicRoute>
            }
          />
          <Route
            path="/profile/notifications"
            element={
              <PublicRoute>
                <NotificationsPage />
              </PublicRoute>
            }
          />
          <Route
            path="/profile/privacy"
            element={
              <PublicRoute>
                <PrivacyPage />
              </PublicRoute>
            }
          />
          <Route
            path="/profile/help"
            element={
              <PublicRoute>
                <HelpSupportPage />
              </PublicRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <PublicRoute>
                <FavoritesPage />
              </PublicRoute>
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
