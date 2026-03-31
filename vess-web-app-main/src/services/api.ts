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

/** Mensagem do corpo JSON do backend (ex.: /auth/login — campo `mensagem`). */
export function getBackendErrorMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const data = error.response?.data;
  if (data && typeof data === "object" && "mensagem" in data) {
    const msg = (data as { mensagem?: unknown }).mensagem;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return undefined;
}

export default api;
