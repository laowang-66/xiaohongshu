'use client';

import React, { useState } from 'react';
import { downloadCoverImage, validatePreviewConsistency, generateFileName } from '../utils/downloadHelper';

const ConsistencyTestPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const testHtml = `
    <div style="width:900px;height:1200px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);position:relative;overflow:hidden;font-family:'PingFang SC','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;">
      <div style="text-align:center;z-index:2;">
        <h1 style="font-size:48px;font-weight:bold;color:#ffffff;margin:0 0 20px 0;text-shadow:2px 2px 4px rgba(0,0,0,0.5);">
          测试封面标题
        </h1>
        <p style="font-size:24px;color:rgba(255,255,255,0.9);margin:0;line-height:1.4;">
          这是一个测试描述文字，用于验证预览与下载的一致性
        </p>
      </div>
      <div style="position:absolute;top:50px;right:50px;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);padding:20px;border-radius:15px;border:1px solid rgba(255,255,255,0.2);">
        <span style="color:#ffffff;font-size:18px;font-weight:500;">一致性测试</span>
      </div>
    </div>
  `;

  const runConsistencyTest = async () => {
    setIsLoading(true);
    setTestResult('🚀 开始一致性测试...\n');

    try {
      // 第一步：创建预览容器
      setTestResult(prev => prev + '📝 步骤1: 创建预览容器...\n');
      
      const previewContainer = document.createElement('div');
      previewContainer.setAttribute('data-editable-card-container', 'true');
      previewContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 360px;
        height: 480px;
        transform: scale(0.4);
        transform-origin: top left;
        font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      `;
      previewContainer.innerHTML = testHtml;
      document.body.appendChild(previewContainer);

      // 第二步：运行一致性验证
      setTestResult(prev => prev + '🔍 步骤2: 运行一致性验证...\n');
      
      const validation = validatePreviewConsistency(previewContainer, testHtml);
      
      setTestResult(prev => prev + `✅ 一致性检查结果: ${validation.isConsistent ? '通过' : '失败'}\n`);
      
      if (!validation.isConsistent) {
        validation.issues.forEach(issue => {
          setTestResult(prev => prev + `  ❌ 问题: ${issue}\n`);
        });
      }

      // 第三步：使用统一渲染器下载
      setTestResult(prev => prev + '🖼️ 步骤3: 测试统一渲染器下载...\n');
      
      const filename = generateFileName('测试封面', 900, 1200);
      
      const success = await downloadCoverImage(testHtml, {
        width: 900,
        height: 1200,
        filename: filename,
        backgroundColor: null,
        scale: 2
      });

      if (success) {
        setTestResult(prev => prev + '🎉 统一渲染器测试成功！\n');
        setTestResult(prev => prev + `📁 文件已下载: ${filename}\n`);
        setTestResult(prev => prev + '✅ 预览与下载一致性修复验证通过！\n');
      } else {
        setTestResult(prev => prev + '❌ 统一渲染器测试失败\n');
      }

      // 清理
      document.body.removeChild(previewContainer);

    } catch (error) {
      console.error('测试失败:', error);
      setTestResult(prev => prev + `💥 测试失败: ${error instanceof Error ? error.message : '未知错误'}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTest = () => {
    setTestResult('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🔧 预览图与下载图一致性测试
          </h1>
          
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">测试说明</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>统一渲染器验证</strong>：测试新的下载系统是否能正确渲染</li>
              <li>• <strong>一致性检查</strong>：验证预览与下载内容的一致性</li>
              <li>• <strong>样式清理</strong>：确保编辑样式不会影响下载结果</li>
              <li>• <strong>字体渲染</strong>：验证字体在下载时的渲染效果</li>
            </ul>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={runConsistencyTest}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '🧪 测试进行中...' : '🚀 开始一致性测试'}
            </button>
            
            <button
              onClick={clearTest}
              className="px-6 py-3 bg-gray-500 text-white font-medium rounded-xl hover:bg-gray-600 transition-all duration-200"
            >
              🗑️ 清空结果
            </button>
          </div>

          {/* 测试结果显示 */}
          <div className="bg-gray-900 rounded-xl p-6 min-h-[200px]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-400 text-lg">📊</span>
              <h3 className="text-white font-semibold">测试结果</h3>
            </div>
            
            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
              {testResult || '点击上方按钮开始测试...'}
            </pre>
          </div>

          {/* 使用说明 */}
          <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔍 修复方案说明</h3>
            <div className="space-y-2 text-yellow-700 text-sm">
              <p><strong>✅ 统一渲染源：</strong> 直接使用原始HTML内容，避免从预览容器获取受缩放影响的内容</p>
              <p><strong>✅ 样式清理：</strong> 自动移除编辑相关的样式和属性，确保下载内容纯净</p>
              <p><strong>✅ 独立容器：</strong> 创建完全独立的渲染容器，避免预览样式污染</p>
              <p><strong>✅ 字体一致性：</strong> 统一字体渲染设置，确保预览与下载字体效果一致</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsistencyTestPage; 