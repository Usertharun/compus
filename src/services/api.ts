/**
 * Compus REST API Client Service
 * Connects the React Frontend to the NestJS Production Backend
 */

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

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
      username?: string;
      avatarUrl?: string;
      department?: string;
    };
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: string;
    profile?: {
      name?: string;
      bio?: string;
      avatarUrl?: string;
      department?: string;
    };
  };
}

export const apiService = {
  getApiUrl() {
    return API_BASE;
  },

  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<AuthResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Invalid email or password');
      }
      const json = await res.json();
      return json.data || json;
    } catch (err: any) {
      throw err;
    }
  },

  async requestOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to send OTP verification code');
      }
      return await res.json();
    } catch (err: any) {
      throw err;
    }
  },

  async verifyOtp(email: string, otp: string): Promise<{ valid: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Invalid or expired OTP code');
      }
      return await res.json();
    } catch (err: any) {
      throw err;
    }
  },

  async registerWithOtp(email: string, password: string, otp: string): Promise<AuthResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/register-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Registration failed');
      }
      const json = await res.json();
      return json.data || json;
    } catch (err: any) {
      throw err;
    }
  },

  async getLatestFeed(): Promise<ApiPost[]> {
    try {
      const res = await fetch(`${API_BASE}/feed/latest`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json || [];
    } catch {
      return [];
    }
  },

  async createPost(content: string, mediaUrls: string[] = []): Promise<ApiPost | null> {
    try {
      const token = localStorage.getItem('compus_access_token');
      const res = await fetch(`${API_BASE}/feed/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content, mediaUrls }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || json;
    } catch {
      return null;
    }
  },

  async getDiscovery() {
    try {
      const res = await fetch(`${API_BASE}/search/discovery`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || json;
    } catch {
      return null;
    }
  },

  async getOpportunities() {
    try {
      const res = await fetch(`${API_BASE}/opportunities/latest`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json || [];
    } catch {
      return [];
    }
  },

  async getEvents() {
    try {
      const res = await fetch(`${API_BASE}/events/upcoming`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json || [];
    } catch {
      return [];
    }
  }
};
