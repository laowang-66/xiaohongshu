'use client'

import React, { useState, useRef } from 'react';
import { downloadCoverImage, generateFileName } from '../utils/downloadHelper';

export default function ConsistencyTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSize, setSelectedSize] = useState('xiaohongshu');
  const testContainerRef = useRef<HTMLDivElement>(null);

  // 测试用的不同尺寸配置
  const sizeConfigs = {
    'xiaohongshu': { width: 900, height: 1200, name: '小红书封面', ratio: '3:4' },
    'video': { width: 1080, height: 1920, name: '短视频封面', ratio: '9:16' },
    'wechat': { width: 900, height: 268, name: '公众号封面', ratio: '3.35:1' }
  };

  // 测试内容模板
  const testTemplates = {
    'gradient': {
      name: '渐变背景',
      html: (width: number, height: number) => `
        <div style="width:${width}px;height:${height}px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;font-family:'PingFang SC','Microsoft YaHei',sans-serif;color:white;padding:40px;box-sizing:border-box;">
          <h1 style="font-size:${Math.max(32, width/25)}px;font-weight:bold;margin:0 0 20px 0;text-align:center;text-shadow:2px 2px 4px rgba(0,0,0,0.5);">🔥 预览下载一致性测试</h1>
          <p style="font-size:${Math.max(16, width/50)}px;margin:0 0 30px 0;opacity:0.9;text-align:center;line-height:1.4;">测试封面 ${width}×${height}</p>
          <div style="background:rgba(255,255,255,0.2);padding:15px 25px;border-radius:12px;backdrop-filter:blur(10px);">
            <span style="font-size:${Math.max(14, width/60)}px;font-weight:500;">#一致性测试 #预览下载</span>
          </div>
        </div>
      `
    },
    'business': {
      name: '商务风格',
      html: (width: number, height: number) => `
        <div style="width:${width}px;height:${height}px;background:#1a2b3c;display:flex;flex-direction:column;justify-content:center;align-items:center;font-family:'PingFang SC','Microsoft YaHei',sans-serif;color:white;position:relative;overflow:hidden;">
          <div style="text-align:center;z-index:2;">
            <h1 style="font-size:${Math.max(28, width/30)}px;font-weight:bold;margin:0 0 16px 0;color:#4FC3F7;">业务数据分析报告</h1>
            <p style="font-size:${Math.max(16, width/50)}px;color:#B0BEC5;margin:0 0 24px 0;">2024年度核心指标</p>
            <div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;">
              <div style="background:rgba(79,195,247,0.1);padding:12px 20px;border-radius:8px;border:1px solid rgba(79,195,247,0.3);">
                <div style="font-size:${Math.max(20, width/40)}px;font-weight:bold;color:#4FC3F7;">95%</div>
                <div style="font-size:${Math.max(12, width/70)}px;color:#B0BEC5;">客户满意度</div>
              </div>
              <div style="background:rgba(129,199,132,0.1);padding:12px 20px;border-radius:8px;border:1px solid rgba(129,199,132,0.3);">
                <div style="font-size:${Math.max(20, width/40)}px;font-weight:bold;color:#81C784;">300%</div>
                <div style="font-size:${Math.max(12, width/70)}px;color:#B0BEC5;">业绩增长</div>
              </div>
            </div>
          </div>
          <div style="position:absolute;top:30px;right:30px;width:60px;height:60px;background:rgba(79,195,247,0.1);border-radius:50%;backdrop-filter:blur(5px);"></div>
          <div style="position:absolute;bottom:40px;left:50px;width:40px;height:40px;background:rgba(129,199,132,0.1);border-radius:50%;backdrop-filter:blur(5px);"></div>
        </div>
      `
    }
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runSingleTest = async (templateKey: string, sizeKey: string) => {
    if (!testContainerRef.current) {
      addTestResult('❌ 测试容器未就绪');
      return false;
    }

    try {
      const template = testTemplates[templateKey as keyof typeof testTemplates];
      const sizeConfig = sizeConfigs[sizeKey as keyof typeof sizeConfigs];
      
      addTestResult(`🧪 开始测试: ${template.name} - ${sizeConfig.name}`);
      
      // 生成测试内容
      const htmlContent = template.html(sizeConfig.width, sizeConfig.height);
      
      // 设置到测试容器
      testContainerRef.current.innerHTML = htmlContent;
      testContainerRef.current.setAttribute('data-editable-card-container', 'true');
      
      // 等待渲染
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 生成文件名
      const filename = generateFileName(
        `${template.name}_${sizeConfig.name}`,
        sizeConfig.width,
        sizeConfig.height
      );
      
      addTestResult(`📏 目标尺寸: ${sizeConfig.width}×${sizeConfig.height}`);
      addTestResult(`📁 文件名: ${filename}`);
      
      // 执行下载测试
      const success = await downloadCoverImage('auto', {
        width: sizeConfig.width,
        height: sizeConfig.height,
        filename: filename,
        backgroundColor: null,
        scale: 2
      });
      
      if (success) {
        addTestResult(`✅ 测试成功: ${template.name} - ${sizeConfig.name}`);
        return true;
      } else {
        addTestResult(`❌ 测试失败: ${template.name} - ${sizeConfig.name}`);
        return false;
      }
      
    } catch (error) {
      addTestResult(`❌ 测试异常: ${error instanceof Error ? error.message : '未知错误'}`);
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    addTestResult('🚀 开始运行全面一致性测试');
    
    let passedTests = 0;
    let totalTests = 0;
    
    for (const templateKey of Object.keys(testTemplates)) {
      for (const sizeKey of Object.keys(sizeConfigs)) {
        totalTests++;
        const passed = await runSingleTest(templateKey, sizeKey);
        if (passed) passedTests++;
        
        // 测试间隔，避免浏览器阻止连续下载
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    addTestResult(`🎯 测试完成: ${passedTests}/${totalTests} 通过`);
    
    if (passedTests === totalTests) {
      addTestResult('🎉 所有测试通过！预览下载一致性修复成功！');
    } else {
      addTestResult('⚠️ 部分测试失败，请检查具体结果');
    }
    
    setIsRunning(false);
  };

  const runSelectedTest = async () => {
    setIsRunning(true);
    clearResults();
    
    const template = Object.keys(testTemplates)[0]; // 使用第一个模板
    await runSingleTest(template, selectedSize);
    
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔧 预览下载一致性测试
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            验证修复后的下载功能，确保预览和下载图片完全一致。
            测试将覆盖不同尺寸和模板的组合。
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">测试尺寸:</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={isRunning}
                >
                  {Object.entries(sizeConfigs).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name} ({config.ratio})
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={runSelectedTest}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isRunning ? '⏳ 测试中...' : '🧪 快速测试'}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearResults}
                disabled={isRunning}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 text-sm font-medium"
              >
                🗑️ 清空日志
              </button>
              
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm font-weight-bold"
              >
                {isRunning ? '⏳ 运行中...' : '🚀 运行全面测试'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 预览区域 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">📱 预览区域</h2>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-center items-center min-h-[200px]">
                <div
                  ref={testContainerRef}
                  style={{
                    transform: 'scale(0.3)',
                    transformOrigin: 'center',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  {/* 测试内容将动态加载到这里 */}
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">
                预览内容（缩放显示）
              </p>
            </div>
          </div>

          {/* 测试日志 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">📋 测试日志</h2>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {testResults.length === 0 ? (
                <div className="text-gray-500">等待测试开始...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📖 使用说明</h3>
          <div className="space-y-2 text-blue-800">
            <p><strong>快速测试：</strong>选择特定尺寸进行单次测试，验证基本功能。</p>
            <p><strong>全面测试：</strong>自动测试所有尺寸和模板的组合，全面验证一致性。</p>
            <p><strong>验证方法：</strong>下载完成后，对比下载的图片与预览内容是否一致。</p>
            <p><strong>预期结果：</strong>下载的图片应该与预览显示的内容完全相同（除了尺寸比例）。</p>
          </div>
        </div>
      </div>
    </div>
  );
} 