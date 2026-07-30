/**
 * Compus REST API Client Service
 * Connects the React Frontend to the NestJS Production Backend (http://localhost:3000/api/v1)
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

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

export const apiService = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
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
