import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";
import type { Player, Substitute } from "../auth/storage";
import { loadPlayers, loadSubstitutes, savePlayers, saveSubstitutes } from "../auth/storage";

const createDefaultPlayers = (): Player[] => {
  const names = [
    "Qapıçı",
    "Müdafiəçi 1",
    "Müdafiəçi 2",
    "Müdafiəçi 3",
    "Müdafiəçi 4",
    "Yarım müdafiəçi 1",
    "Yarım müdafiəçi 2",
    "Yarım müdafiəçi 3",
    "Hücumçu 1",
    "Hücumçu 2",
    "Hücumçu 3",
  ];
  const base: { x: number; y: number }[] = [
    { x: 50, y: 90 },
    { x: 15, y: 70 },
    { x: 40, y: 70 },
    { x: 60, y: 70 },
    { x: 85, y: 70 },
    { x: 20, y: 50 },
    { x: 40, y: 50 },
    { x: 60, y: 50 },
    { x: 30, y: 25 },
    { x: 50, y: 20 },
    { x: 70, y: 25 },
  ];
  return names.map((name, idx) => ({
    id: `p-${idx}`,
    name,
    number: idx + 1,
    x: base[idx].x,
    y: base[idx].y,
  }));
};

export const PitchPage: React.FC = () => {
  const { role } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [subs, setSubs] = useState<Substitute[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const pitchRef = useRef<HTMLDivElement>(null);

  const canEdit = role === "Badmin" || role === "Sadmin";

  useEffect(() => {
    const p = loadPlayers();
    const s = loadSubstitutes();
    // Eski verilerde number yoksa ekle
    const playersWithNumbers = p.length
      ? p.map((player, idx) => ({
          ...player,
          number: player.number || idx + 1,
        }))
      : createDefaultPlayers();
    setPlayers(playersWithNumbers);
    setSubs(s);
  }, []);

  useEffect(() => {
    savePlayers(players);
  }, [players]);

  useEffect(() => {
    saveSubstitutes(subs);
  }, [subs]);

  const onDrag = (id: string, event: any, info: any) => {
    if (!canEdit || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    // Mouse/touch pozisyonunu al
    const clientX = info.point.x;
    const clientY = info.point.y;
    // Pitch içinde mi kontrol et
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      return;
    }
    // Yüzde olarak hesapla - milimetrik hassasiyet için ondalık kullan
    const centerX = clientX - rect.left;
    const centerY = clientY - rect.top;
    const x = Math.max(5, Math.min(95, Number(((centerX / rect.width) * 100).toFixed(2))));
    const y = Math.max(5, Math.min(95, Number(((centerY / rect.height) * 100).toFixed(2))));
    // Gerçek zamanlı olarak badge pozisyonunu güncelle
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  };

  const onDragEnd = (id: string, event: any, info: any) => {
    if (!canEdit || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    // Mouse/touch pozisyonunu al
    const clientX = info.point.x;
    const clientY = info.point.y;
    // Pitch içinde mi kontrol et
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      return;
    }
    // Yüzde olarak hesapla - milimetrik hassasiyet için ondalık kullan
    const centerX = clientX - rect.left;
    const centerY = clientY - rect.top;
    const x = Math.max(5, Math.min(95, Number(((centerX / rect.width) * 100).toFixed(2))));
    const y = Math.max(5, Math.min(95, Number(((centerY / rect.height) * 100).toFixed(2))));
    // Final pozisyonu kaydet
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  };

  const onPlayerNameChange = (id: string, name: string) => {
    if (!canEdit) return;
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const onPlayerNumberChange = (id: string, number: number) => {
    if (!canEdit) return;
    const num = Math.max(1, Math.min(99, number || 1));
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, number: num } : p)));
  };

  const addSub = () => {
    if (!canEdit) return;
    const name = newSubName.trim();
    if (!name) return;
    setSubs((prev) => [...prev, { id: `s-${Date.now()}`, name }]);
    setNewSubName("");
  };

  const removeSub = (id: string) => {
    if (!canEdit) return;
    setSubs((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSubName = (id: string, name: string) => {
    if (!canEdit) return;
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const resetPitch = () => {
    if (!canEdit) return;
    const confirmed = window.confirm("Meydançanı sıfırlamaq istədiyinizə əminsiniz? Bütün oyunçu mövqeləri ilkin vəziyyətə qayıdacaq.");
    if (confirmed) {
      const defaultPlayers = createDefaultPlayers();
      setPlayers(defaultPlayers);
      savePlayers(defaultPlayers);
    }
  };

  const removePlayer = (id: string) => {
    if (!canEdit) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const addPlayerFromSub = (sub: Substitute, x: number, y: number) => {
    if (!canEdit) return;
    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      name: sub.name,
      number: players.length + 1,
      x,
      y,
    };
    setPlayers((prev) => [...prev, newPlayer]);
    setSubs((prev) => prev.filter((s) => s.id !== sub.id));
  };

  const onSubDragEnd = (sub: Substitute, event: any, info: any) => {
    if (!canEdit || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const clientX = info.point.x;
    const clientY = info.point.y;
    // Pitch içinde mi kontrol et
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      const centerX = clientX - rect.left;
      const centerY = clientY - rect.top;
      const x = Math.max(8, Math.min(92, (centerX / rect.width) * 100));
      const y = Math.max(8, Math.min(92, (centerY / rect.height) * 100));
      addPlayerFromSub(sub, x, y);
    }
  };

  return (
    <div className="page pitch-page">
      <div className="pitch-layout">
        <section className="pitch-card glass">
          <div className="section-header">
            <div>
              <h1 className="page-title">İlk 11</h1>
              <p className="page-subtitle">
                Meydançada oyunçuları sürüşdürə, adlarını və forma nömrələrini yaza bilərsiniz.
              </p>
            </div>
            {canEdit && (
              <button className="btn outline small" onClick={resetPitch}>
                🔄 Sıfırla
              </button>
            )}
          </div>
          <div className="pitch" ref={pitchRef}>
            <div className="pitch-line pitch-center-line" />
            <div className="pitch-circle" />
            <div className="pitch-box pitch-box-top" />
            <div className="pitch-box pitch-box-bottom" />
            {players.map((player) => (
              <div
                key={player.id}
                className={
                  "player-badge" + (selectedPlayerId === player.id ? " player-badge-active" : "")
                }
                style={{
                  left: `${player.x}%`,
                  top: `${player.y}%`,
                }}
                onMouseDown={() => setSelectedPlayerId(player.id)}
              >
                {canEdit ? (
                  <input
                    type="number"
                    min="1"
                    max="99"
                    className="player-number-input"
                    value={player.number}
                    onChange={(e) => onPlayerNumberChange(player.id, parseInt(e.target.value) || 1)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="player-number">
                    {String(player.number).padStart(2, "0")}
                  </div>
                )}
                <input
                  className="player-name-input"
                  value={player.name}
                  onChange={(e) => onPlayerNameChange(player.id, e.target.value)}
                  readOnly={!canEdit}
                  onMouseDown={(e) => e.stopPropagation()}
                />
                {canEdit && (
                  <motion.div
                    className="player-drag-handle"
                    drag={true}
                    dragMomentum={false}
                    dragElastic={0}
                    onDrag={(event, info) => {
                      onDrag(player.id, event, info);
                    }}
                    onDragEnd={(event, info) => {
                      onDragEnd(player.id, event, info);
                      // Drag bittiğinde tutma yerinin pozisyonunu sıfırla
                      const element = event.target as HTMLElement;
                      element.style.setProperty('transform', 'translate(0, 0)', 'important');
                    }}
                    whileDrag={{ scale: 1.2, opacity: 0.8 }}
                    style={{ position: "relative", x: 0, y: 0 }}
                  >
                    ⋮⋮
                  </motion.div>
                )}
                {canEdit && (
                  <button
                    className="player-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlayer(player.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {!canEdit && (
            <div className="info-banner">
              Qonaq və ya Sadmin olmayan istifadəçilər yalnız heyətə baxa bilər, dəyişiklik edə
              bilməz.
            </div>
          )}
        </section>
        <aside className="subs-card glass">
          <h2 className="subs-title">Ehtiyat oyunçular</h2>
          <p className="subs-subtitle">
            Burada ehtiyat oyunçuların siyahısını yaza, yeniləyə və silə bilərsiniz.
          </p>
          <div className="subs-list">
            {subs.map((sub) => (
              <motion.div
                key={sub.id}
                className="subs-item"
                drag={canEdit}
                dragMomentum={false}
                onDragEnd={(event, info) => onSubDragEnd(sub, event, info)}
                style={{ cursor: canEdit ? "grab" : "default" }}
              >
                {editingSubId === sub.id ? (
                  <input
                    className="input small"
                    value={sub.name}
                    onChange={(e) => updateSubName(sub.id, e.target.value)}
                    onBlur={() => setEditingSubId(null)}
                    readOnly={!canEdit}
                    autoFocus
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className={canEdit ? "subs-name editable" : "subs-name"}
                    onClick={() => canEdit && setEditingSubId(sub.id)}
                  >
                    {sub.name}
                  </span>
                )}
                {canEdit && (
                  <button
                    className="btn icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSub(sub.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            ))}
            {subs.length === 0 && (
              <div className="subs-empty">Hələ ehtiyat oyunçu əlavə edilməyib.</div>
            )}
          </div>
          <div className="subs-add">
            <input
              className="input small"
              placeholder="Yeni ehtiyat oyunçu adı"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              readOnly={!canEdit}
            />
            {canEdit && (
              <button className="btn primary small" onClick={addSub}>
                Əlavə et
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};


