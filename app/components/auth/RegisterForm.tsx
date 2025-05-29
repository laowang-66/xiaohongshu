'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import { isValidPhone } from '../../lib/auth';

interface FormData {
  phone: string;
  password: string;
  confirmPassword: string;
  nickname: string;
}

interface FormErrors {
  phone?: string;
  password?: string;
  confirmPassword?: string;
  nickname?: string;
  general?: string;
}

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 手机号验证
    if (!formData.phone) {
      newErrors.phone = '请输入手机号';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = '请输入有效的手机号';
    }

    // 昵称验证（必填）
    if (!formData.nickname) {
      newErrors.nickname = '请输入昵称';
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = '昵称至少需要2个字符';
    } else if (formData.nickname.length > 20) {
      newErrors.nickname = '昵称不能超过20个字符';
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6位';
    } else if (formData.password.length > 20) {
      newErrors.password = '密码不能超过20位';
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await register(formData.phone, formData.password, formData.nickname);
      
      if (!result.success) {
        setErrors({
          general: result.message || '注册失败，请重试'
        });
      } else {
        // 注册成功，调用成功回调
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : '注册失败，请重试'
      });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          手机号
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
            errors.phone ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="请输入手机号"
          disabled={loading}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
          昵称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nickname"
          value={formData.nickname}
          onChange={(e) => handleInputChange('nickname', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
            errors.nickname ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="请输入昵称"
          disabled={loading}
        />
        {errors.nickname && (
          <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          密码
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
            errors.password ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="请输入密码（6-20位）"
          disabled={loading}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          确认密码
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
            errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="请再次输入密码"
          disabled={loading}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '注册中...' : '注册'}
      </button>

      {/* 切换到登录 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          已有账户？{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-pink-600 hover:text-pink-500 font-medium"
          >
            立即登录
          </button>
        </p>
      </div>
    </form>
  );
} 