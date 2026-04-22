import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL, 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Mensagem do corpo JSON do backend (ex.: `/auth/login`, `/users/me`). */
export function getBackendErrorMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const data = error.response?.data;
  if (!data) return undefined;

  if (typeof data === "string" && data.trim()) return data;

  if (typeof data === "object") {
    const candidateKeys = ["mensagem", "message", "error", "detail", "title"] as const;
    for (const key of candidateKeys) {
      const msg = (data as Record<string, unknown>)[key];
      if (typeof msg === "string" && msg.trim()) return msg;
    }

    const errors = (data as { errors?: unknown }).errors;
    if (Array.isArray(errors)) {
      const messages = errors
        .map((item) => {
          if (!item || typeof item !== "object") return undefined;
          const record = item as Record<string, unknown>;
          const msg = record.defaultMessage ?? record.message ?? record.mensagem;
          return typeof msg === "string" && msg.trim() ? msg : undefined;
        })
        .filter((msg): msg is string => Boolean(msg));

      if (messages.length > 0) return messages.join("; ");
    }
  }
  return undefined;
}

export default api;
