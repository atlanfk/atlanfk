export type UserRole = "Badmin" | "Sadmin" | "Guest";

export interface AdminUser {
  username: string;
  passwordHash: string;
  role: UserRole;
}

const ADMINS_KEY = "atilan_admins";
const PLAYERS_KEY = "atilan_players";
const SUBSTITUTES_KEY = "atilan_substitutes";

// SHA-256 hashing helper
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function loadAdmins(): AdminUser[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(ADMINS_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as AdminUser[];
  } catch {
    return [];
  }
}

export function saveAdmins(admins: AdminUser[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

export function ensureDefaultBadmin(defaultHash: string) {
  const current = loadAdmins();
  if (!current.find((a) => a.username === "Badmin")) {
    const updated: AdminUser[] = [
      ...current,
      {
        username: "Badmin",
        passwordHash: defaultHash,
        role: "Badmin",
      },
    ];
    saveAdmins(updated);
  }
}

export interface Player {
  id: string;
  name: string;
  number: number;
  x: number;
  y: number;
}

export interface Substitute {
  id: string;
  name: string;
}

export function loadPlayers(): Player[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(PLAYERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Player[];
  } catch {
    return [];
  }
}

export function savePlayers(players: Player[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

export function loadSubstitutes(): Substitute[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(SUBSTITUTES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Substitute[];
  } catch {
    return [];
  }
}

export function saveSubstitutes(substitutes: Substitute[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SUBSTITUTES_KEY, JSON.stringify(substitutes));
}


