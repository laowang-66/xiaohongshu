import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API响应的统一格式
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details: string;
  };
  timestamp: string;
}

// 用户信息接口
export interface User {
  id: string;
  name: string;
  phone: string;
  nickname?: string;
  avatar?: string;
  status: string;
  createTime?: string;
  updateTime?: string;
}

// 激活信息接口
export interface ActivationInfo {
  activationCode: string;
  status: 'active' | 'expired';
  activatedAt: string;
  expiresAt: string;
}

// 激活历史记录接口
export interface ActivationHistory {
  activationCode: string;
  status: 'active' | 'expired';
  activatedAt: string;
  expiresAt: string;
  createTime: string;
}

// 激活码查询结果接口
export interface ActivationCodeInfo {
  code: string;
  status: 'available' | 'used' | 'expired';
  expiresAt: string;
  usedBy: string | null;
  usedAt: string | null;
  description: string;
  createTime: string;
  isAvailable: boolean;
  isExpired: boolean;
}

// 本地存储的激活状态
export interface LocalActivationState {
  isActivated: boolean;
  expiresAt: string | null;
  remainingCalls: number;
  lastSyncTime: string;
}

// 替换原来的KeyInfo接口
export interface KeyInfo extends ActivationInfo {
  id: string;
  type: string;
  totalCalls: number;
  remainingCalls: number;
  daysLeft?: number;
}

// 密钥模板接口
export interface KeyTemplate {
  id: string;
  type: string;
  name: string;
  description: string;
  totalCalls: number;
  durationDays: number;
  price: number;
  features: string[];
  status: string;
}

// 使用记录接口
export interface UsageRecord {
  id: string;
  actionType: string;
  remainingCalls: number;
}

// 内容生成相关接口
export interface ContentExtractRequest {
  link: string;
  mode?: string;
  style?: string;
  referenceContent?: string;
}

// 内容类型
export type ContentType = 'note' | 'video' | 'live' | 'article';

// 内容接口
export interface Content {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  status: 'published' | 'draft' | 'archived';
  url?: string;
  tags?: string[];
  viewCount?: number;
  likeCount?: number;
  createdAt: string;
  updatedAt: string;
}

// 内容列表响应
export interface ContentListResponse {
  contents: Content[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

// 内容查询参数
export interface ContentQueryParams {
  page?: number;
  limit?: number;
  type?: ContentType;
  status?: 'published' | 'draft' | 'archived';
  search?: string;
}

// 内容更新参数
export interface ContentUpdateParams {
  title?: string;
  description?: string;
  status?: 'published' | 'draft' | 'archived';
  tags?: string[];
}

export interface ContentSearchRequest {
  query: string;
  searchType?: string;
  limit?: number;
}

export interface ContentRewriteRequest {
  text: string;
  style: string;
}

export interface CoverGenerateRequest {
  text: string;
  template?: string;
  coverSize?: string;
}

export interface InfoCardGenerateRequest {
  content: string;
}

export interface VoiceGenerateRequest {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
  format?: string;
}

export interface ScriptGenerateRequest {
  topic: string;
  style?: string;
  duration?: number;
  targetAudience?: string;
}

export interface ShortVideoGenerateRequest {
  topic: string;
  platform?: string;
  duration?: number;
  style?: string;
}

// API客户端类
class XiaohongshuAPIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://114.215.187.208:3000') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: `${baseURL}/api/v1/xiaohongshu`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30秒超时
    });

    // 请求拦截器 - 自动添加认证头
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器 - 统一处理错误和响应格式
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // 处理嵌套的响应格式
        if (response.data && response.data.data && typeof response.data.data === 'object' && 'success' in response.data.data) {
          // 如果响应被包装在data字段中，提取内层数据
          response.data = response.data.data;
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token过期，清除本地存储并跳转到登录页
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 获取存储的认证token
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  // 设置认证token
  private setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }

  // 清除认证信息
  private clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('activation_info');
    localStorage.removeItem('local_activation_state');
  }

  // 保存用户信息
  private saveUserInfo(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_info', JSON.stringify(user));
  }

  // ==================== 认证相关API ====================

  // 用户注册
  async register(phone: string, password: string, nickname: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/user/register', {
      phone,
      password,
      nickname,
    });

    if (response.data.success && response.data.data) {
      this.setAuthToken(response.data.data.token);
      this.saveUserInfo(response.data.data.user);
    }

    return response.data;
  }

  // 用户登录
  async login(phone: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/user/login', {
      phone,
      password,
    });

    if (response.data.success && response.data.data) {
      this.setAuthToken(response.data.data.token);
      this.saveUserInfo(response.data.data.user);
    }

    return response.data;
  }

  // 刷新Token
  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    const response = await this.client.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');

    if (response.data.success && response.data.data) {
      this.setAuthToken(response.data.data.accessToken);
    }

    return response.data;
  }

  // 登出
  logout(): void {
    this.clearAuth();
  }

  // ==================== 激活码管理API ====================

  // 使用激活码
  async useActivationCode(code: string): Promise<ApiResponse<ActivationInfo>> {
    const response = await this.client.post<ApiResponse<ActivationInfo>>('/activation/use', {
      code,
    });

    if (response.data.success && response.data.data) {
      this.saveActivationInfo(response.data.data);
      // 初始化本地状态
      this.initLocalActivationState(response.data.data);
    }

    return response.data;
  }

  // 查询激活状态
  async getActivationStatus(): Promise<ApiResponse<{ isActivated: boolean; activation: ActivationInfo | null }>> {
    const response = await this.client.get<ApiResponse<{ isActivated: boolean; activation: ActivationInfo | null }>>('/activation/status');

    if (response.data.success && response.data.data?.activation) {
      this.saveActivationInfo(response.data.data.activation);
      // 同步本地状态
      this.syncLocalActivationState(response.data.data.activation, response.data.data.isActivated);
    }

    return response.data;
  }

  // 获取激活历史
  async getActivationHistory(): Promise<ApiResponse<{ history: ActivationHistory[] }>> {
    const response = await this.client.get<ApiResponse<{ history: ActivationHistory[] }>>('/activation/history');
    return response.data;
  }

  // 查询激活码信息（无需登录）
  async checkActivationCode(code: string): Promise<ApiResponse<ActivationCodeInfo>> {
    const response = await this.client.get<ApiResponse<ActivationCodeInfo>>(`/activation/check?code=${encodeURIComponent(code)}`);
    return response.data;
  }

  // ==================== 本地状态管理 ====================

  // 保存激活信息
  private saveActivationInfo(activationInfo: ActivationInfo): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('activation_info', JSON.stringify(activationInfo));
  }

  // 获取存储的激活信息
  getStoredActivationInfo(): ActivationInfo | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('activation_info');
    return stored ? JSON.parse(stored) : null;
  }

  // 初始化本地激活状态
  private initLocalActivationState(activationInfo: ActivationInfo): void {
    if (typeof window === 'undefined') return;
    
    const localState: LocalActivationState = {
      isActivated: true,
      expiresAt: activationInfo.expiresAt,
      remainingCalls: 1000, // 初始1000次
      lastSyncTime: new Date().toISOString(),
    };
    
    localStorage.setItem('local_activation_state', JSON.stringify(localState));
  }

  // 同步本地激活状态
  private syncLocalActivationState(activationInfo: ActivationInfo, isActivated: boolean): void {
    if (typeof window === 'undefined') return;
    
    const existingState = this.getLocalActivationState();
    const localState: LocalActivationState = {
      isActivated,
      expiresAt: activationInfo.expiresAt,
      remainingCalls: existingState?.remainingCalls ?? 1000, // 保持现有次数或重置为1000
      lastSyncTime: new Date().toISOString(),
    };
    
    localStorage.setItem('local_activation_state', JSON.stringify(localState));
  }

  // 获取本地激活状态
  getLocalActivationState(): LocalActivationState | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('local_activation_state');
    return stored ? JSON.parse(stored) : null;
  }

  // 检查是否已激活且有效
  isActivated(): boolean {
    const localState = this.getLocalActivationState();
    if (!localState || !localState.isActivated || !localState.expiresAt) {
      return false;
    }
    
    // 检查是否过期
    const now = new Date();
    const expiresAt = new Date(localState.expiresAt);
    return now < expiresAt && localState.remainingCalls > 0;
  }

  // 消费API调用次数
  consumeApiCall(): boolean {
    if (!this.isActivated()) return false;
    
    const localState = this.getLocalActivationState();
    if (!localState || localState.remainingCalls <= 0) return false;
    
    localState.remainingCalls -= 1;
    localStorage.setItem('local_activation_state', JSON.stringify(localState));
    return true;
  }

  // 获取剩余天数
  getRemainingDays(): number {
    const localState = this.getLocalActivationState();
    if (!localState || !localState.expiresAt) return 0;
    
    const now = new Date();
    const expiresAt = new Date(localState.expiresAt);
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // 获取剩余调用次数
  getRemainingCalls(): number {
    const localState = this.getLocalActivationState();
    if (!localState) return 0;
    return Math.max(0, localState.remainingCalls);
  }

  // ==================== 内容创作API ====================

  // 内容提炼生成
  async extractContent(params: ContentExtractRequest): Promise<ApiResponse<{ note: string; sourceInfo: any; usageRecord: UsageRecord }>> {
    const response = await this.client.post<ApiResponse<{ note: string; sourceInfo: any; usageRecord: UsageRecord }>>('/content/extract', params);
    return response.data;
  }

  // 全网搜索
  async searchContent(params: ContentSearchRequest): Promise<ApiResponse<{ note: string; searchResults: any[]; searchParameters: any; usageRecord: UsageRecord }>> {
    const response = await this.client.post<ApiResponse<{ note: string; searchResults: any[]; searchParameters: any; usageRecord: UsageRecord }>>('/content/search', params);
    return response.data;
  }

  // 基于URL生成笔记
  async generateFromUrl(url: string, title?: string, searchType?: string): Promise<ApiResponse<{ note: string; sourceUrl: string; sourceTitle: string; sourceType: string; usageRecord: UsageRecord }>> {
    const response = await this.client.post<ApiResponse<{ note: string; sourceUrl: string; sourceTitle: string; sourceType: string; usageRecord: UsageRecord }>>('/content/generate-from-url', {
      url,
      title,
      searchType,
    });
    return response.data;
  }

  // 内容改写
  async rewriteContent(params: ContentRewriteRequest): Promise<ApiResponse<{ result: string; originalLength: number; rewrittenLength: number; style: string; usageRecord: UsageRecord }>> {
    const response = await this.client.post<ApiResponse<{ result: string; originalLength: number; rewrittenLength: number; style: string; usageRecord: UsageRecord }>>('/content/rewrite', params);
    return response.data;
  }

  // 封面生成
  async generateCover(params: CoverGenerateRequest): Promise<ApiResponse<{ result: string; coverSize: string; template: string; dimensions: any; usageRecord: UsageRecord }>> {
    const response = await this.client.post<ApiResponse<{ result: string; coverSize: string; template: string; dimensions: any; usageRecord: UsageRecord }>>('/content/generate-cover', params);
    return response.data;
  }

  // 信息卡片生成
  async generateInfoCard(params: InfoCardGenerateRequest): Promise<ApiResponse<{ cards: any[]; totalCards: number; usageRecord: UsageRecord }>> {
    const response = await this.client.post<ApiResponse<{ cards: any[]; totalCards: number; usageRecord: UsageRecord }>>('/content/generate-info-card', params);
    return response.data;
  }

  // ==================== 内容管理API ====================

  // 获取内容列表
  async getContents(params: ContentQueryParams = {}): Promise<ApiResponse<ContentListResponse>> {
    const response = await this.client.get<ApiResponse<ContentListResponse>>('/content', { params });
    return response.data;
  }

  // 获取单个内容详情
  async getContent(contentId: string): Promise<ApiResponse<{ content: Content }>> {
    const response = await this.client.get<ApiResponse<{ content: Content }>>(`/content/${contentId}`);
    return response.data;
  }

  // 创建内容
  async createContent(content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<{ content: Content }>> {
    const response = await this.client.post<ApiResponse<{ content: Content }>>('/content', content);
    return response.data;
  }

  // 更新内容
  async updateContent(contentId: string, updates: ContentUpdateParams): Promise<ApiResponse<{ content: Content }>> {
    const response = await this.client.put<ApiResponse<{ content: Content }>>(`/content/${contentId}`, updates);
    return response.data;
  }

  // 删除内容
  async deleteContent(contentId: string): Promise<ApiResponse<{}>> {
    const response = await this.client.delete<ApiResponse<{}>>(`/content/${contentId}`);
    return response.data;
  }

  // ==================== 语音配音API ====================

  // 语音配音生成
  async generateVoice(params: VoiceGenerateRequest): Promise<ApiResponse<{ audioUrl: string; duration: number; fileSize: number; format: string; usageRecord: UsageRecord }>> {
    const response = await this.client.post<ApiResponse<{ audioUrl: string; duration: number; fileSize: number; format: string; usageRecord: UsageRecord }>>('/voice/generate', params);
    return response.data;
  }

  // ==================== 脚本生成API ====================

  // 口播脚本生成
  async generateScript(params: ScriptGenerateRequest): Promise<ApiResponse<{ script: string; estimatedDuration: number; wordCount: number; style: string; usageRecord: UsageRecord }>> {
    const response = await this.client.post<ApiResponse<{ script: string; estimatedDuration: number; wordCount: number; style: string; usageRecord: UsageRecord }>>('/script/generate', params);
    return response.data;
  }

  // 短视频脚本生成
  async generateShortVideo(params: ShortVideoGenerateRequest): Promise<ApiResponse<{ script: string; scenes: any[]; totalDuration: number; platform: string; usageRecord: UsageRecord }>> {
    const response = await this.client.post<ApiResponse<{ script: string; scenes: any[]; totalDuration: number; platform: string; usageRecord: UsageRecord }>>('/short-video/generate', params);
    return response.data;
  }

  // ==================== 用户管理API ====================

  // 获取用户信息
  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.client.get<ApiResponse<{ user: User }>>('/user/info');

    if (response.data.success && response.data.data) {
      this.saveUserInfo(response.data.data.user);
    }

    return response.data;
  }

  // 更新用户信息
  async updateUserProfile(nickname?: string, avatar?: string): Promise<ApiResponse<{ user: User }>> {
    const response = await this.client.put<ApiResponse<{ user: User }>>('/user/profile', {
      nickname,
      avatar,
    });

    if (response.data.success && response.data.data) {
      this.saveUserInfo(response.data.data.user);
    }

    return response.data;
  }

  // ==================== 使用统计API ====================

  // 获取使用统计
  async getUsageStats(period?: string, startDate?: string, endDate?: string): Promise<ApiResponse<{ totalCalls: number; remainingCalls: number; usageByFeature: any; dailyUsage: any[] }>> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await this.client.get<ApiResponse<{ totalCalls: number; remainingCalls: number; usageByFeature: any; dailyUsage: any[] }>>(`/usage/stats?${params.toString()}`);
    return response.data;
  }

  // ==================== 工具方法 ====================

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // 获取本地存储的用户信息
  getStoredUserInfo(): User | null {
    if (typeof window === 'undefined') return null;
    const userInfoStr = localStorage.getItem('user_info');
    if (!userInfoStr) return null;
    try {
      return JSON.parse(userInfoStr);
    } catch {
      return null;
    }
  }
}

// 创建全局API客户端实例
export const apiClient = new XiaohongshuAPIClient();

// 导出API客户端类，以便在需要时创建新实例
export default XiaohongshuAPIClient; 