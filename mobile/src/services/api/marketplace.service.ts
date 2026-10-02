import apiClient from '@services/api/client';

export type PluginType = 'plugin' | 'skill' | 'agent';
export type PluginStatus = 'pending' | 'approved' | 'rejected';
export type ComponentType = 'agent' | 'skill' | 'hook' | 'command';
export type SafetyLevel = 'caution' | 'info' | 'warning';
export type FeedbackType = 'bug' | 'idea' | 'general';

export interface PluginComponent {
  componentType: ComponentType;
  name: string;
  invocation: string;
  description: string;
  tools: string[];
}

export interface SafetySignal {
  level: SafetyLevel;
  title: string;
  detail: string;
}

export interface Plugin {
  _id: string;
  name: string;
  pluginType: PluginType;
  category?: string;
  description: string;
  repositoryUrl: string;
  version?: string;
  license?: string;
  marketplaceCmd?: string;
  installCmd?: string;
  authorId: string;
  authorName: string;
  status: PluginStatus;
  tags: {
    technologies: string[];
    topics: string[];
    categories: string[];
    keywords: string[];
  };
  components: PluginComponent[];
  safetySignals: SafetySignal[];
  createdAt: string;
  updatedAt: string;
}

export interface PluginFeedback {
  _id: string;
  pluginId: string;
  userId: string;
  userName: string;
  type: FeedbackType;
  message: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListPluginsParams {
  status?: PluginStatus;
  pluginType?: PluginType;
  search?: string;
  page?: number;
  limit?: number;
}

export type PluginPayload = Omit<Plugin, '_id' | 'authorId' | 'authorName' | 'status' | 'createdAt' | 'updatedAt'>;

export const marketplaceService = {
  async list(params?: ListPluginsParams): Promise<{ plugins: Plugin[]; pagination: Pagination }> {
    const res = await apiClient.get<{ success: boolean; data: { plugins: Plugin[]; pagination: Pagination } }>(
      '/marketplace',
      { params: { status: 'approved', ...params } as any },
    );
    return res.data.data;
  },

  async getOne(id: string): Promise<Plugin> {
    const res = await apiClient.get<{ success: boolean; data: { plugin: Plugin } }>(`/marketplace/${id}`);
    return res.data.data.plugin;
  },

  async mine(): Promise<Plugin[]> {
    const res = await apiClient.get<{ success: boolean; data: { plugins: Plugin[] } }>('/marketplace/mine');
    return res.data.data.plugins;
  },

  async submit(payload: Partial<PluginPayload>): Promise<Plugin> {
    const res = await apiClient.post<{ success: boolean; data: { plugin: Plugin } }>('/marketplace', payload);
    return res.data.data.plugin;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/marketplace/${id}`);
  },

  async submitFeedback(pluginId: string, data: { type: FeedbackType; message: string }): Promise<PluginFeedback> {
    const res = await apiClient.post<{ success: boolean; data: { feedback: PluginFeedback } }>(
      `/marketplace/${pluginId}/feedback`,
      data,
    );
    return res.data.data.feedback;
  },

  async getFeedback(pluginId: string): Promise<PluginFeedback[]> {
    const res = await apiClient.get<{ success: boolean; data: { feedbacks: PluginFeedback[] } }>(
      `/marketplace/${pluginId}/feedback`,
    );
    return res.data.data.feedbacks;
  },
};
