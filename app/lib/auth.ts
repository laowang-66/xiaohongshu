// 认证和激活码管理工具函数
import { apiClient, User, ActivationInfo, ActivationCodeInfo, LocalActivationState } from './api-client';

// ==================== 认证相关函数 ====================

// 检查用户是否已登录
export function isAuthenticated(): boolean {
  return apiClient.isAuthenticated();
}

// 获取认证token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// 登出
export function logout(): void {
  apiClient.logout();
  // 如果在浏览器环境，跳转到首页
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

// 用户登录
export async function login(phone: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const response = await apiClient.login(phone, password);
    if (response.success) {
      return {
        success: true,
        message: response.message,
        user: response.data?.user,
      };
    } else {
      return {
        success: false,
        message: response.message || '登录失败',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '网络错误，请稍后重试',
    };
  }
}

// 用户注册
export async function register(phone: string, password: string, nickname: string): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const response = await apiClient.register(phone, password, nickname);
    if (response.success) {
      return {
        success: true,
        message: response.message,
        user: response.data?.user,
      };
    } else {
      return {
        success: false,
        message: response.message || '注册失败',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '网络错误，请稍后重试',
    };
  }
}

// ==================== 用户信息相关函数 ====================

// 获取当前用户信息
export function getCurrentUser(): User | null {
  return apiClient.getStoredUserInfo();
}

// 获取用户信息（从服务器）
export async function fetchUserProfile(): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const response = await apiClient.getUserProfile();
    if (response.success) {
      return {
        success: true,
        user: response.data?.user,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取用户信息失败',
    };
  }
}

// 更新用户信息
export async function updateUserProfile(nickname?: string, avatar?: string): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const response = await apiClient.updateUserProfile(nickname, avatar);
    if (response.success) {
      return {
        success: true,
        user: response.data?.user,
        message: response.message,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '更新用户信息失败',
    };
  }
}

// ==================== 激活码管理相关函数 ====================

// 获取激活信息
export function getActivationInfo(): ActivationInfo | null {
  return apiClient.getStoredActivationInfo();
}

// 获取本地激活状态
export function getLocalActivationState(): LocalActivationState | null {
  return apiClient.getLocalActivationState();
}

// 检查是否已激活
export function isActivated(): boolean {
  return apiClient.isActivated();
}

// 使用激活码
export async function useActivationCode(code: string): Promise<{ success: boolean; message: string; activationInfo?: ActivationInfo }> {
  try {
    const response = await apiClient.useActivationCode(code);
    if (response.success) {
      return {
        success: true,
        message: response.message,
        activationInfo: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || '激活码使用失败',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '网络错误，请稍后重试',
    };
  }
}

// 获取激活状态（从服务器）
export async function fetchActivationStatus(): Promise<{ success: boolean; isActivated?: boolean; activationInfo?: ActivationInfo | null; message?: string }> {
  try {
    const response = await apiClient.getActivationStatus();
    if (response.success) {
      return {
        success: true,
        isActivated: response.data?.isActivated,
        activationInfo: response.data?.activation,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取激活状态失败',
    };
  }
}

// 查询激活码信息（无需登录）
export async function checkActivationCode(code: string): Promise<{ success: boolean; codeInfo?: ActivationCodeInfo; message?: string }> {
  try {
    const response = await apiClient.checkActivationCode(code);
    if (response.success) {
      return {
        success: true,
        codeInfo: response.data,
        message: response.message,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '查询激活码失败',
    };
  }
}

// 消费API调用次数
export function consumeApiCall(): boolean {
  return apiClient.consumeApiCall();
}

// 获取激活状态信息
export function getActivationStatus(): {
  isActivated: boolean;
  remainingCalls: number;
  daysLeft: number;
  expiresAt: Date | null;
} {
  const localState = apiClient.getLocalActivationState();
  
  if (!localState || !localState.isActivated) {
    return {
      isActivated: false,
      remainingCalls: 0,
      daysLeft: 0,
      expiresAt: null,
    };
  }

  const expiresAt = localState.expiresAt ? new Date(localState.expiresAt) : null;
  const now = new Date();
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return {
    isActivated: apiClient.isActivated(),
    remainingCalls: localState.remainingCalls,
    daysLeft,
    expiresAt,
  };
}

// ==================== API调用相关函数 ====================

// 带激活检查的API调用
export async function apiCall(url: string, options: RequestInit = {}): Promise<Response> {
  // 检查是否已激活
  if (!isActivated()) {
    throw new Error('请先激活账户才能使用此功能');
  }

  // 消费API调用次数
  if (!consumeApiCall()) {
    throw new Error('API调用次数已用完或激活已过期');
  }

  // 执行API调用
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// ==================== 工具函数 ====================

// 格式化激活码显示
export function formatActivationCode(code: string): string {
  if (!code) return '';
  // 隐藏中间部分，只显示前4位和后4位
  if (code.length <= 8) return code;
  const start = code.substring(0, 4);
  const end = code.substring(code.length - 4);
  return `${start}****${end}`;
}

// 格式化剩余天数
export function formatDaysLeft(days: number): string {
  if (days < 0) return '已过期';
  if (days === 0) return '今天过期';
  if (days === 1) return '1天';
  return `${days}天`;
}

// 格式化调用次数
export function formatCallsCount(count: number): string {
  if (count < 0) return '0';
  return count.toString();
}

// 验证手机号格式
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 检查密码强度
export function checkPasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} {
  if (password.length < 6) {
    return {
      isValid: false,
      strength: 'weak',
      message: '密码长度至少6位',
    };
  }

  if (password.length < 8) {
    return {
      isValid: true,
      strength: 'weak',
      message: '密码强度较弱，建议使用8位以上',
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (strengthCount >= 3) {
    return {
      isValid: true,
      strength: 'strong',
      message: '密码强度很强',
    };
  } else if (strengthCount >= 2) {
    return {
      isValid: true,
      strength: 'medium',
      message: '密码强度中等',
    };
  } else {
    return {
      isValid: true,
      strength: 'weak',
      message: '密码强度较弱，建议包含大小写字母、数字和特殊字符',
    };
  }
}

// 导出API客户端实例，方便直接使用
export { apiClient }; 