import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(username.trim(), password);
    setLoading(false);
    if (res === "ok") {
      navigate("/");
    } else {
      setError("İstifadəçi adı və ya şifrə yanlışdır.");
    }
  };

  return (
    <div className="page login-page">
      <div className="card glass login-card">
        <h1 className="page-title">Giriş</h1>
        <p className="page-subtitle">Bura yalnız adminlər daxil ola bilər.</p>
        <form onSubmit={onSubmit} className="form-vertical">
          <label className="form-label">
            <span>İstifadəçi adı</span>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="form-label">
            <span>Şifrə</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <div className="error-text">{error}</div>}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Yüklənir..." : "Daxil ol"}
          </button>
        </form>
      </div>
    </div>
  );
};


