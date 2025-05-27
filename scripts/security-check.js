#!/usr/bin/env node

/**
 * 安全检查脚本
 * 用于检查项目中的安全问题和生产环境配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始安全检查...\n');

const issues = [];
const warnings = [];

// 检查环境变量文件
function checkEnvFiles() {
  console.log('📋 检查环境变量配置...');
  
  const envFiles = ['.env', '.env.local', '.env.production'];
  let hasEnvConfig = false;
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      hasEnvConfig = true;
      console.log(`  ✅ 找到环境变量文件: ${file}`);
    }
  });
  
  if (!fs.existsSync('.env.example')) {
    warnings.push('缺少 .env.example 文件，建议创建环境变量示例文件');
  } else {
    console.log('  ✅ .env.example 存在');
  }
  
  if (!hasEnvConfig) {
    issues.push('未找到任何环境变量文件，请创建 .env.local 文件');
  }
  
  console.log('');
}

// 检查硬编码的敏感信息
function checkHardcodedSecrets() {
  console.log('🔐 检查硬编码的敏感信息...');
  
  const sensitivePatterns = [
    /sk-[a-zA-Z0-9]{32,}/g, // API keys
    /['"]\w{32,}['"]/g, // Long strings that might be secrets
    /password.*[=:]\s*['"][^'"]{8,}/gi, // Passwords
    /secret.*[=:]\s*['"][^'"]{8,}/gi, // Secrets
    /token.*[=:]\s*['"][^'"]{8,}/gi, // Tokens
  ];
  
  const excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build'];
  const includeExts = ['.ts', '.tsx', '.js', '.jsx', '.json'];
  
  function checkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !excludeDirs.includes(file)) {
        checkDirectory(filePath);
      } else if (stat.isFile() && includeExts.some(ext => file.endsWith(ext))) {
        checkFile(filePath);
      }
    });
  }
  
  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    sensitivePatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push(`在 ${filePath} 中发现可能的硬编码敏感信息: ${match.substring(0, 20)}...`);
        });
      }
    });
  }
  
  try {
    checkDirectory('.');
    console.log('  ✅ 敏感信息检查完成');
  } catch (error) {
    warnings.push(`敏感信息检查时出错: ${error.message}`);
  }
  
  console.log('');
}

// 检查Git忽略配置
function checkGitIgnore() {
  console.log('📝 检查 .gitignore 配置...');
  
  if (!fs.existsSync('.gitignore')) {
    issues.push('缺少 .gitignore 文件');
    return;
  }
  
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  const requiredIgnores = ['.env', '.env.local', '.env.production', 'node_modules'];
  
  requiredIgnores.forEach(ignore => {
    if (!gitignoreContent.includes(ignore)) {
      issues.push(`${ignore} 未在 .gitignore 中忽略`);
    } else {
      console.log(`  ✅ ${ignore} 已忽略`);
    }
  });
  
  console.log('');
}

// 检查调试日志
function checkDebugLogs() {
  console.log('🐛 检查调试日志...');
  
  const logPatterns = [
    /console\.log\(/g,
    /console\.debug\(/g,
    /console\.info\(/g,
    /console\.warn\(/g,
    /console\.error\(/g,
  ];
  
  const sourceFiles = [];
  
  function findSourceFiles(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !['node_modules', '.git', '.next'].includes(file)) {
        findSourceFiles(filePath);
      } else if (stat.isFile() && ['.ts', '.tsx', '.js', '.jsx'].some(ext => file.endsWith(ext))) {
        sourceFiles.push(filePath);
      }
    });
  }
  
  findSourceFiles('app');
  
  let logCount = 0;
  sourceFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    logPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        logCount += matches.length;
      }
    });
  });
  
  if (logCount > 0) {
    warnings.push(`发现 ${logCount} 个调试日志语句，建议在生产环境中移除`);
  } else {
    console.log('  ✅ 未发现调试日志');
  }
  
  console.log('');
}

// 执行所有检查
checkEnvFiles();
checkHardcodedSecrets();
checkGitIgnore();
checkDebugLogs();

// 输出检查结果
console.log('📊 安全检查结果:\n');

if (issues.length === 0) {
  console.log('✅ 未发现严重安全问题');
} else {
  console.log('❌ 发现以下安全问题:');
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
}

if (warnings.length > 0) {
  console.log('\n⚠️  警告:');
  warnings.forEach((warning, index) => {
    console.log(`  ${index + 1}. ${warning}`);
  });
}

console.log('\n🔒 安全建议:');
console.log('  1. 确保在生产环境中使用环境变量存储敏感信息');
console.log('  2. 定期轮换API密钥');
console.log('  3. 移除生产环境中的调试日志');
console.log('  4. 确保 .env 文件不被提交到版本控制');
console.log('  5. 使用HTTPS协议部署应用');

process.exit(issues.length > 0 ? 1 : 0); 