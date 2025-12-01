import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AdminPanelModal } from "../pages/AdminPanelModal";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, user, logout } = useAuth();
  const [showAdmin, setShowAdmin] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  const isOnLogin = location.pathname === "/login";

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo-title">
          <img src="/atlanlogo.png" alt="Atlan FK" className="club-logo" />
          <div>
            <div className="club-name">Atlan FK</div>
            <div className="club-subtitle">Sinif futbol klubu</div>
          </div>
        </div>
        <nav className="nav-links">
          <Link to="/" className={!isOnLogin ? "nav-link active" : "nav-link"}>
            İlk 11
          </Link>
          {!user && (
            <Link to="/login" className={isOnLogin ? "nav-link active" : "nav-link"}>
              Giriş
            </Link>
          )}
        </nav>
        <div className="user-area">
          <span className="role-pill">
            Rol: <strong>{role}</strong>
          </span>
          {user ? (
            <>
              <span className="username">👤 {user.username}</span>
              {role === "Badmin" && (
                <button className="btn subtle" onClick={() => setShowAdmin(true)}>
                  Admin paneli
                </button>
              )}
              <button className="btn outline" onClick={onLogout}>
                Çıxış
              </button>
            </>
          ) : (
            <span className="guest-label">Qonaq rejimi</span>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
      {showAdmin && <AdminPanelModal onClose={() => setShowAdmin(false)} />}
    </div>
  );
};


