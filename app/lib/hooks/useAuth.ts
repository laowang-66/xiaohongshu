'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  isAuthenticated, 
  getCurrentUser, 
  login as authLogin, 
  register as authRegister, 
  logout as authLogout,
  fetchUserProfile,
  apiClient
} from '../auth';
import type { User, ActivationInfo, ActivationCodeInfo, LocalActivationState } from '../api-client';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  activationInfo: ActivationInfo | null;
  localActivationState: LocalActivationState | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  // 认证操作
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (phone: string, password: string, nickname: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  
  // 用户操作
  refreshUserProfile: () => Promise<void>;
  updateProfile: (nickname?: string, avatar?: string) => Promise<{ success: boolean; message: string }>;
  
  // 激活码操作
  refreshActivationStatus: () => Promise<void>;
  useActivationCode: (code: string) => Promise<{ success: boolean; message: string }>;
  checkActivationCode: (code: string) => Promise<{ success: boolean; codeInfo?: ActivationCodeInfo; message?: string }>;
  
  // 工具方法
  clearError: () => void;
  isActivated: () => boolean;
  getRemainingDays: () => number;
  getRemainingCalls: () => number;
  consumeApiCall: () => boolean;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    activationInfo: null,
    localActivationState: null,
    loading: true,
    error: null,
  });

  // 初始化认证状态
  useEffect(() => {
    const initAuth = () => {
      try {
        const authenticated = isAuthenticated();
        const user = getCurrentUser();
        const activationInfo = apiClient.getStoredActivationInfo();
        const localActivationState = apiClient.getLocalActivationState();
        
        setState({
          isAuthenticated: authenticated,
          user,
          activationInfo,
          localActivationState,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: '初始化认证状态失败',
        }));
      }
    };

    initAuth();
  }, []);

  // 登录
  const login = useCallback(async (phone: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authLogin(phone, password);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: result.user || null,
          loading: false,
          error: null,
        }));
        
        // 登录成功后获取激活状态
        setTimeout(() => {
          refreshActivationStatus();
        }, 100);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.message,
        }));
      }
      
      return { success: result.success, message: result.message };
    } catch (error: any) {
      const message = error.message || '登录失败';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return { success: false, message };
    }
  }, []);

  // 注册
  const register = useCallback(async (phone: string, password: string, nickname: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authRegister(phone, password, nickname);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: result.user || null,
          loading: false,
          error: null,
        }));
        
        // 注册成功后获取激活状态
        setTimeout(() => {
          refreshActivationStatus();
        }, 100);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.message,
        }));
      }
      
      return { success: result.success, message: result.message };
    } catch (error: any) {
      const message = error.message || '注册失败';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return { success: false, message };
    }
  }, []);

  // 登出
  const logout = useCallback(() => {
    authLogout();
    setState({
      isAuthenticated: false,
      user: null,
      activationInfo: null,
      localActivationState: null,
      loading: false,
      error: null,
    });
  }, []);

  // 刷新用户信息
  const refreshUserProfile = useCallback(async () => {
    if (!state.isAuthenticated) return;
    
    try {
      const result = await fetchUserProfile();
      if (result.success && result.user) {
        setState(prev => ({
          ...prev,
          user: result.user!,
          error: null,
        }));
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  }, [state.isAuthenticated]);

  // 更新用户信息
  const updateProfile = useCallback(async (nickname?: string, avatar?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.updateUserProfile(nickname, avatar);
      
      if (response.success && response.data?.user) {
        setState(prev => ({
          ...prev,
          user: response.data!.user,
          loading: false,
          error: null,
        }));
        return { success: true, message: response.message };
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message,
        }));
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || '更新失败';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return { success: false, message };
    }
  }, []);

  // 刷新激活状态
  const refreshActivationStatus = useCallback(async () => {
    if (!state.isAuthenticated) return;
    
    try {
      const response = await apiClient.getActivationStatus();
      if (response.success && response.data) {
        const activationInfo = response.data.activation;
        const localActivationState = apiClient.getLocalActivationState();
        
        setState(prev => ({
          ...prev,
          activationInfo,
          localActivationState,
          error: null,
        }));
      }
    } catch (error) {
      console.error('刷新激活状态失败:', error);
    }
  }, [state.isAuthenticated]);

  // 使用激活码
  const useActivationCode = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.useActivationCode(code);
      
      if (response.success && response.data) {
        const activationInfo = response.data;
        const localActivationState = apiClient.getLocalActivationState();
        
        setState(prev => ({
          ...prev,
          activationInfo,
          localActivationState,
          loading: false,
          error: null,
        }));
        
        return { success: true, message: response.message };
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message,
        }));
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || '激活码使用失败';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return { success: false, message };
    }
  }, []);

  // 检查激活码信息（无需登录）
  const checkActivationCode = useCallback(async (code: string) => {
    try {
      const response = await apiClient.checkActivationCode(code);
      
      if (response.success && response.data) {
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
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 检查是否已激活
  const isActivated = useCallback(() => {
    return apiClient.isActivated();
  }, []);

  // 获取剩余天数
  const getRemainingDays = useCallback(() => {
    return apiClient.getRemainingDays();
  }, []);

  // 获取剩余调用次数
  const getRemainingCalls = useCallback(() => {
    const localState = apiClient.getLocalActivationState();
    return localState?.remainingCalls || 0;
  }, []);

  // 消费API调用次数
  const consumeApiCall = useCallback(() => {
    const success = apiClient.consumeApiCall();
    if (success) {
      // 更新本地状态
      const localActivationState = apiClient.getLocalActivationState();
      setState(prev => ({
        ...prev,
        localActivationState,
      }));
    }
    return success;
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    refreshUserProfile,
    updateProfile,
    refreshActivationStatus,
    useActivationCode,
    checkActivationCode,
    clearError,
    isActivated,
    getRemainingDays,
    getRemainingCalls,
    consumeApiCall,
  };
} 