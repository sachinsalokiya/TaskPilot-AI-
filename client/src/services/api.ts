import axios from "axios";
import { TOKEN_KEY } from "../utils/constants";
import type { AuthResponse, MeResponse } from "../types/auth";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error;
    if (typeof message === "string") {
      return message;
    }
  }
  return "Something went wrong. Please try again.";
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/api/auth/register", {
      name,
      email,
      password,
    });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/api/auth/login", {
      email,
      password,
    });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMe(): Promise<MeResponse> {
  try {
    const { data } = await api.get<MeResponse>("/api/auth/me");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
