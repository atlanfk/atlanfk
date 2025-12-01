import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

interface Props {
  onClose: () => void;
}

export const AdminPanelModal: React.FC<Props> = ({ onClose }) => {
  const { admins, createSadmin, deleteAdmin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!username.trim() || !password.trim()) {
      setError("İstifadəçi adı və şifrə mütləqdir.");
      return;
    }
    setLoading(true);
    try {
      await createSadmin(username.trim(), password);
      setSuccess("Kiçik admin uğurla yaradıldı.");
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setError(err?.message ?? "Xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Böyük admin paneli</h2>
          <button className="btn icon" onClick={onClose}>
            ✕
          </button>
        </header>
        <div className="modal-body">
          <section className="modal-section">
            <h3>Yeni kiçik admin yarat</h3>
            <form onSubmit={onSubmit} className="form-vertical">
              <label className="form-label">
                <span>İstifadəçi adı</span>
                <input
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
              <label className="form-label">
                <span>Şifrə</span>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {error && <div className="error-text">{error}</div>}
              {success && <div className="success-text">{success}</div>}
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? "Yaradılır..." : "Yarat"}
              </button>
            </form>
          </section>
          <section className="modal-section">
            <h3>Mövcud adminlər</h3>
            <div className="admin-list">
              {admins.map((a) => (
                <div key={a.username} className="admin-item">
                  <div>
                    <div className="admin-username">{a.username}</div>
                    <div className="admin-role">{a.role}</div>
                  </div>
                  {a.role !== "Badmin" && (
                    <button className="btn outline small" onClick={() => deleteAdmin(a.username)}>
                      Sil
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};


