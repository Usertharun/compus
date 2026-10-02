import { createHttpClient, type Tokens } from "./http";
export { ApiError } from "./http";
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3000/api/v1" : "");
const SESSION_KEY = "compus_session";
export const sessionStore = {
  read(): Tokens | null {
    try {
      const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      return value?.accessToken && value?.refreshToken ? value : null;
    } catch {
      return null;
    }
  },
  write(tokens: Tokens) {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }),
    );
  },
  clear() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("compus_auth");
    localStorage.removeItem("compus_access_token");
    window.dispatchEvent(new Event("compus:session-ended"));
  },
};
const http = createHttpClient(API_BASE, sessionStore);
export const apiRequest = <T>(path: string, method = "GET", data?: unknown) =>
  http.request<T>(
    path,
    { method, ...(data === undefined ? {} : { body: JSON.stringify(data) }) },
    true,
  );
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  onboardingCompleted: boolean;
  profile?: {
    name: string;
    department?: string;
    year?: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    campusLocation?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
}
export interface AuthResponse extends Tokens {
  user: AuthUser;
}
export interface ApiPost {
  id: string;
  content: string;
  mediaUrls?: string[];
  category?: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: {
    id: string;
    email: string;
    profile?: {
      fullName?: string;
      name?: string;
      username?: string;
      avatarUrl?: string;
      department?: string;
    };
  };
}
const post = <T>(path: string, data: unknown, authenticated = false) =>
  http.request<T>(
    path,
    { method: "POST", body: JSON.stringify(data) },
    authenticated,
  );
export const apiService = {
  getApiUrl: () => API_BASE,
  getHealth: () => http.request<{ status: string }>("/health"),
  login: (email: string, password: string) =>
    post<AuthResponse>("/auth/login", { email, password }),
  requestOtp: (email: string) =>
    post<{ message: string }>("/auth/request-otp", { email }),
  registerWithOtp: (
    email: string,
    password: string,
    otp: string,
    name: string,
  ) =>
    post<AuthResponse>("/auth/register-with-otp", {
      email,
      password,
      otp,
      name,
    }),
  getMe: () => http.request<AuthUser>("/auth/me", {}, true),
  logout: () => post<{ message: string }>("/auth/logout", {}, true),
  completeOnboarding: (data: {
    name: string;
    department: string;
    year: string;
    goals: string[];
  }) => post<AuthUser>("/users/onboarding/complete", data, true),
  forgotPassword: (email: string) =>
    post<{ message: string }>("/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) =>
    post<{ message: string }>("/auth/reset-password", { token, newPassword }),
  async getLatestFeed(): Promise<ApiPost[]> {
    const result = await http.request<{ items: ApiPost[] }>("/feed/latest");
    return result.items;
  },
  createPost: (content: string, mediaUrls: string[] = []) =>
    post<ApiPost>(
      "/feed/posts",
      { content, media: mediaUrls.map((url) => ({ url, type: "IMAGE" })) },
      true,
    ),
};
