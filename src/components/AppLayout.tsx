import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, User, LogOut } from "lucide-react";
import { cn } from "../libs/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/logo2.png";

const NAV_ITEMS = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/favorites", label: "Saved", icon: Heart },
  { path: "/profile", label: "Profile", icon: User },
];

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Top Nav */}
      <header className="hidden md:flex items-center justify-between px-8 py-3 bg-card border-b border-border sticky top-0 z-50">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <img src={logo} alt="C-Outing" className="h-9 w-auto rounded-lg" />
          <span className="text-xl font-bold text-foreground tracking-tight">
            C-OUTING
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ml-2 border border-destructive/30"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </header>

      {/* Page Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[60px]",
                  active ? "text-secondary" : "text-muted-foreground",
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", active && "fill-secondary/20")}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[60px] text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
