/**
 * Backend-connected store for the Society Maintenance Tracker frontend.
 * Communicates with the Node.js + Express + MongoDB backend.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  Notice,
  Priority,
  Settings,
  User,
  Role,
} from "./types";

const API_BASE = "http://localhost:5000/api";

// Helper for API calls
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? window.sessionStorage.getItem("smt.token") : null;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = "An error occurred";
    try {
      const data = await res.json();
      errMsg = data.message || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

type AppContextValue = {
  currentUser: User | null;
  users: User[]; // kept for compatibility, remains empty/unused
  complaints: Complaint[];
  notices: Notice[];
  settings: Settings;

  // auth
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (u: Omit<User, "id">) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  updateProfile: (patch: Pick<User, "name" | "flat" | "phone">) => Promise<void>;

  // complaints
  createComplaint: (input: {
    category: ComplaintCategory;
    description: string;
    photo: string | null;
  }) => Promise<Complaint>;
  updateStatus: (id: string, status: ComplaintStatus, note?: string) => Promise<void>;
  setPriority: (id: string, priority: Priority) => Promise<void>;
  toggleManualOverdue: (id: string) => Promise<void>;

  // notices
  createNotice: (input: { title: string; body: string; important: boolean }) => Promise<void>;
  updateNotice: (
    id: string,
    input: { title: string; body: string; important: boolean },
  ) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;

  // settings
  updateSettings: (s: Settings) => Promise<void>;

  // derived
  isOverdue: (c: Complaint) => boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [settings, setSettings] = useState<Settings>({ overdueDays: 7 });

  // Fetch all application data
  const fetchAppData = useCallback(async (role: Role) => {
    try {
      // 1. Fetch settings
      const settingsData = await apiFetch<{ overdueDays: number }>("/settings");
      setSettings(settingsData);

      // 2. Fetch notices
      const noticesData = await apiFetch<Notice[]>("/notices");
      setNotices(noticesData);

      // 3. Fetch complaints
      let complaintsData: Complaint[] = [];
      if (role === "admin") {
        complaintsData = await apiFetch<Complaint[]>("/complaints");
      } else {
        complaintsData = await apiFetch<Complaint[]>("/complaints/mine");
      }
      setComplaints(complaintsData);
    } catch (err) {
      console.error("Failed to load application data from API:", err);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("smt.token");
      window.sessionStorage.removeItem("smt.user");
    }
    setCurrentUser(null);
    setComplaints([]);
    setNotices([]);
  }, []);

  // Hydrate session on load
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const token = window.sessionStorage.getItem("smt.token");
    const rawUser = window.sessionStorage.getItem("smt.user");
    
    if (token && rawUser) {
      try {
        const parsedUser = JSON.parse(rawUser) as User;
        setCurrentUser(parsedUser);
        fetchAppData(parsedUser.role);
      } catch (e) {
        console.error("Failed to parse user session, logging out.", e);
        logout();
      }
    }
  }, [fetchAppData, logout]);

  const isOverdue = useCallback(
    (c: Complaint) => {
      if (c.status === "Resolved") return false;
      if (c.manualOverdue) return true;
      const ageDays = (Date.now() - new Date(c.createdAt).getTime()) / 86400_000;
      return ageDays > settings.overdueDays;
    },
    [settings.overdueDays],
  );

  const login: AppContextValue["login"] = async (email, password) => {
    try {
      const res = await apiFetch<{ token: string; role: Role; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("smt.token", res.token);
        window.sessionStorage.setItem("smt.user", JSON.stringify(res.user));
      }
      
      setCurrentUser(res.user);
      await fetchAppData(res.role);
      return { ok: true as const };
    } catch (err: any) {
      return { ok: false as const, error: err.message || "Incorrect email or password" };
    }
  };

  const register: AppContextValue["register"] = async (input) => {
    try {
      const res = await apiFetch<{ token: string; role: Role; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("smt.token", res.token);
        window.sessionStorage.setItem("smt.user", JSON.stringify(res.user));
      }
      
      setCurrentUser(res.user);
      await fetchAppData(res.role);
      return { ok: true as const };
    } catch (err: any) {
      return { ok: false as const, error: err.message || "An account with that email already exists" };
    }
  };

  const updateProfile: AppContextValue["updateProfile"] = async (patch) => {
    try {
      const res = await apiFetch<{ ok: boolean; user: User }>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("smt.user", JSON.stringify(res.user));
      }
      setCurrentUser(res.user);
    } catch (err: any) {
      console.error("Profile update error:", err);
      throw err;
    }
  };

  const createComplaint: AppContextValue["createComplaint"] = async ({
    category,
    description,
    photo,
  }) => {
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("description", description);

      if (photo) {
        // Convert base64 data URL string back to a file blob for multer
        const response = await fetch(photo);
        const blob = await response.blob();
        formData.append("photo", blob, "photo.jpg");
      }

      const res = await apiFetch<{ ok: boolean; complaint: Complaint }>("/complaints", {
        method: "POST",
        body: formData,
      });

      const newComplaint = res.complaint;
      setComplaints((prev) => [newComplaint, ...prev]);
      return newComplaint;
    } catch (err: any) {
      console.error("Create complaint error:", err);
      throw err;
    }
  };

  const updateStatus: AppContextValue["updateStatus"] = async (id, status, note) => {
    try {
      const res = await apiFetch<{ ok: boolean; complaint: Complaint }>(`/complaints/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      });

      setComplaints((prev) => prev.map((c) => (c.id === id ? res.complaint : c)));
    } catch (err: any) {
      console.error("Update status error:", err);
      throw err;
    }
  };

  const setPriority: AppContextValue["setPriority"] = async (id, priority) => {
    try {
      const res = await apiFetch<{ ok: boolean; complaint: Complaint }>(`/complaints/${id}/priority`, {
        method: "PATCH",
        body: JSON.stringify({ priority }),
      });

      setComplaints((prev) => prev.map((c) => (c.id === id ? res.complaint : c)));
    } catch (err: any) {
      console.error("Set priority error:", err);
      throw err;
    }
  };

  const toggleManualOverdue: AppContextValue["toggleManualOverdue"] = async (id) => {
    try {
      const res = await apiFetch<{ ok: boolean; complaint: Complaint }>(`/complaints/${id}/manual-overdue`, {
        method: "PATCH",
      });

      setComplaints((prev) => prev.map((c) => (c.id === id ? res.complaint : c)));
    } catch (err: any) {
      console.error("Toggle manual overdue error:", err);
      throw err;
    }
  };

  const createNotice: AppContextValue["createNotice"] = async ({ title, body, important }) => {
    try {
      const res = await apiFetch<{ ok: boolean; notice: Notice }>("/notices", {
        method: "POST",
        body: JSON.stringify({ title, body, important }),
      });

      setNotices((prev) => [res.notice, ...prev]);
    } catch (err: any) {
      console.error("Create notice error:", err);
      throw err;
    }
  };

  const updateNotice: AppContextValue["updateNotice"] = async (id, input) => {
    try {
      const res = await apiFetch<{ ok: boolean; notice: Notice }>(`/notices/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });

      setNotices((prev) => prev.map((n) => (n.id === id ? res.notice : n)));
    } catch (err: any) {
      console.error("Update notice error:", err);
      throw err;
    }
  };

  const deleteNotice: AppContextValue["deleteNotice"] = async (id) => {
    try {
      await apiFetch<void>(`/notices/${id}`, {
        method: "DELETE",
      });

      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      console.error("Delete notice error:", err);
      throw err;
    }
  };

  const updateSettings: AppContextValue["updateSettings"] = async (s) => {
    try {
      const res = await apiFetch<{ ok: boolean; settings: Settings }>("/settings", {
        method: "PATCH",
        body: JSON.stringify(s),
      });

      setSettings(res.settings);
    } catch (err: any) {
      console.error("Update settings error:", err);
      throw err;
    }
  };

  const value: AppContextValue = {
    currentUser,
    users: [], // unused, kept for type compatibility
    complaints,
    notices,
    settings,
    login,
    register,
    logout,
    updateProfile,
    createComplaint,
    updateStatus,
    setPriority,
    toggleManualOverdue,
    createNotice,
    updateNotice,
    deleteNotice,
    updateSettings,
    isOverdue,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
