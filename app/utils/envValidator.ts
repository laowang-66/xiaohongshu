/**
 * 环境变量验证工具
 * 用于统一管理和验证所有必需的环境变量
 */

export interface EnvConfig {
  DEEPSEEK_API_KEY?: string;
  SEARCH1API_KEY?: string;
  NODE_ENV?: string;
}

export interface ValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * 验证所有必需的环境变量
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // 检查必需的环境变量
  if (!process.env.DEEPSEEK_API_KEY) {
    missing.push('DEEPSEEK_API_KEY');
  }
  
  if (!process.env.SEARCH1API_KEY) {
    warnings.push('SEARCH1API_KEY - 搜索功能可能不可用');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * 获取验证过的环境变量配置
 */
export function getEnvConfig(): EnvConfig {
  return {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    SEARCH1API_KEY: process.env.SEARCH1API_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
}

/**
 * 验证特定的API密钥是否存在
 */
export function validateApiKey(keyName: keyof EnvConfig): boolean {
  const value = process.env[keyName];
  return value !== undefined && value !== '';
}

/**
 * 安全地获取API密钥，如果不存在则抛出错误
 */
export function getApiKey(keyName: keyof EnvConfig): string {
  const value = process.env[keyName];
  if (!value) {
    throw new Error(`Missing required environment variable: ${keyName}`);
  }
  return value;
}

/**
 * 生成环境变量状态报告
 */
export function generateEnvReport(): string {
  const validation = validateEnv();
  const config = getEnvConfig();
  
  let report = '🔧 环境变量状态报告\n\n';
  
  if (validation.isValid) {
    report += '✅ 所有必需的环境变量都已配置\n';
  } else {
    report += '❌ 缺少必需的环境变量:\n';
    validation.missing.forEach(key => {
      report += `  - ${key}\n`;
    });
  }
  
  if (validation.warnings.length > 0) {
    report += '\n⚠️ 警告:\n';
    validation.warnings.forEach(warning => {
      report += `  - ${warning}\n`;
    });
  }
  
  report += '\n📋 配置状态:\n';
  report += `  - DEEPSEEK_API_KEY: ${config.DEEPSEEK_API_KEY ? '✅ 已配置' : '❌ 未配置'}\n`;
  report += `  - SEARCH1API_KEY: ${config.SEARCH1API_KEY ? '✅ 已配置' : '❌ 未配置'}\n`;
  report += `  - NODE_ENV: ${config.NODE_ENV}\n`;
  
  return report;
} 