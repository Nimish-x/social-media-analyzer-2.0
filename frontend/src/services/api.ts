/**
 * API Service for Social Leaf Backend
 * Connects frontend to FastAPI backend
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('🔌 API URL:', API_BASE_URL); // Debugging connection

// Types
export interface AnalyticsOverview {
  total_impressions: number;
  engagement_rate: number;
  total_comments: number;
  total_shares: number;
  growth_rate: number;
}

export interface PlatformMetrics {
  platform: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
}

export interface Insight {
  type: string;
  summary: string;
  title?: string;
}

export interface Recommendation {
  type: string;
  content: string;
  title?: string;
  priority: number;
}

export interface BestTimes {
  instagram: Record<string, string[]>;
  youtube: Record<string, string[]>;
  twitter: Record<string, string[]>;
  linkedin: Record<string, string[]>;
}

export interface DashboardData {
  overview: AnalyticsOverview;
  platforms: PlatformMetrics[];
  insights: Insight[];
  recommendations: Recommendation[];
  best_times: BestTimes;
}

export interface PostPreviewResponse {
  caption: string;
  hashtags: string[];
  cta: string;
  style: string;
  optimized_image_paths: string[];
  auto_post: boolean;
}

export interface ReportAnalysis {
  executive_summary: string;
  engagement_graph_analysis: string;
  content_graph_analysis: string;
  platform_graph_analysis: string;
}


// Helper function for API calls
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (options?.body instanceof FormData) {
      // @ts-ignore
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

// Demo endpoints (no auth required)
export const demoApi = {
  // Get full dashboard data
  getFullDashboard: () => fetchApi<DashboardData>('/demo/full-dashboard'),

  // Get analytics overview
  getAnalytics: () => fetchApi<AnalyticsOverview>('/demo/analytics'),

  // Get platform-specific metrics
  getPlatformMetrics: (platform: string) =>
    fetchApi<PlatformMetrics>(`/demo/platform/${platform}`),

  // Get AI insights
  getInsights: () => fetchApi<Insight[]>('/demo/insights'),

  // Get recommendations
  getRecommendations: () => fetchApi<Recommendation[]>('/demo/recommendations'),

  // Get best posting times
  getBestTimes: () => fetchApi<BestTimes>('/demo/best-times'),

  // Get content comparison
  getContentComparison: () => fetchApi<any>('/demo/content-comparison'),

  // Get report summary
  getReport: () => fetchApi<any>('/demo/report'),

  // Get best time for specific platform
  getBestTimeForPlatform: (platform: string) =>
    fetchApi<any>(`/demo/best-time/${platform}`),
};

// Authenticated endpoints
export const api = {
  // Analytics
  getAnalyticsOverview: (token: string, days = 30) =>
    fetchApi<AnalyticsOverview>(`/api/analytics/overview?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getPlatformAnalytics: (token: string, platform: string) =>
    fetchApi<PlatformMetrics>(`/api/analytics/platform/${platform}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  compareplatforms: (token: string) =>
    fetchApi<any>('/api/analytics/compare', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getReal: (platform: string, ytHandle?: string, igHandle?: string) => {
    let url = `/api/real/${platform}`;
    const params = new URLSearchParams();
    if (ytHandle) params.append('yt_handle', ytHandle);
    if (igHandle) params.append('ig_handle', igHandle);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    return fetchApi<any>(url);
  },

  // AI
  queryAI: (token: string, question: string, platform?: string, handle?: string) =>
    fetchApi<{ answer: string }>('/api/ai/query', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question, platform: platform || 'all', handle }),
    }),

  getInsights: (token: string) =>
    fetchApi<Insight[]>('/api/ai/insights', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  generateInsights: (token: string) =>
    fetchApi<any>('/api/ai/generate-insights', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getRecommendations: (token: string) =>
    fetchApi<Recommendation[]>('/api/ai/recommendations', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Reports
  getReportSummary: (token: string, days = 30) =>
    fetchApi<any>(`/api/reports/summary?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getBestTimeToPost: (token: string, platform?: string) =>
    fetchApi<any>(`/api/reports/best-time${platform ? `?platform=${platform}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getReportAnalysis: (token: string, metrics: any) =>
    fetchApi<{ analysis: ReportAnalysis }>('/api/reports/analysis', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ metrics }),
    }),

  // Platforms
  getConnectedPlatforms: (token: string) =>
    fetchApi<any[]>('/api/platforms/', {
      headers: { Authorization: `Bearer ${token}` },
    }),


  // Posts
  generatePost: (token: string, formData: FormData) =>
    fetchApi<PostPreviewResponse>('/api/post/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData, // FormData handles content-type automatically
    }),

  publishToInstagram: (token: string, payload: { image_url: string; caption: string }) =>
    fetchApi<any>('/api/instagram/publish', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),

  // Competitor Spy
  analyzeCompetitor: (token: string, query: string) =>
    fetchApi<any>('/api/competitors/analyze', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query }),
    }),

  // AI Audience Persona
  getAudiencePersona: (token: string) => {
    if (!token) return Promise.reject(new Error("No auth token provided"));
    return fetchApi<any>('/api/ai/audience-persona', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default api;
