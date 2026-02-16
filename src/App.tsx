import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { ProtectedRoute, PublicRoute } from "./routes";
import LoginForm from "./components/auth/LoginForm";
import SignUpPage from "./pages/SignUpPage";
import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";

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
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <div>
                <h1>Home Page</h1>
                <p>To be implemented</p>
              </div>
            </PublicRoute>
          }
        />
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

        <Route
          //just for test routes under this should be removed
          path="/home"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />
        {/* Protected Routes */}
        {/* <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        /> */}
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
              <div>
                <h1>Venue Details Page</h1>
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
              <div>
                <h1>Profile Page</h1>
                <p>To be implemented</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <div>
                <h1>Favorites Page</h1>
                <p>To be implemented</p>
              </div>
            </ProtectedRoute>
          }
        />
        {/* 404 Not Found Route */}
        <Route
          path="*"
          element={
            <div>
              <h1>404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
