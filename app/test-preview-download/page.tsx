'use client'

import React, { useState, useRef } from 'react';
import { downloadCoverImage, generateFileName } from '../utils/downloadHelper';

export default function TestPreviewDownload() {
  const [testHtml, setTestHtml] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadContainerRef = useRef<HTMLDivElement>(null);

  // 测试用的样本HTML
  const sampleHtmls = [
    {
      name: '小红书风格',
      html: `<div style="width: 900px; height: 1200px; background: linear-gradient(135deg, #ff7e5f, #feb47b); display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'PingFang SC', sans-serif; color: white; padding: 60px 40px; box-sizing: border-box;">
        <h1 style="font-size: 48px; font-weight: bold; margin: 0 0 20px 0; text-align: center; line-height: 1.2;">🔥 测试封面标题</h1>
        <p style="font-size: 24px; margin: 0 0 30px 0; opacity: 0.9; text-align: center;">这是一个测试封面副标题</p>
        <div style="font-size: 18px; opacity: 0.8;">#测试标签 #预览一致性</div>
      </div>`
    },
    {
      name: '短视频风格',
      html: `<div style="width: 1080px; height: 1920px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'PingFang SC', sans-serif; color: white; padding: 120px 60px 200px 60px; box-sizing: border-box;">
        <h1 style="font-size: 64px; font-weight: bold; margin: 0 0 30px 0; text-align: center; line-height: 1.1; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">短视频</h1>
        <p style="font-size: 32px; margin: 0; opacity: 0.9; text-align: center;">测试封面</p>
      </div>`
    },
    {
      name: '公众号风格',
      html: `<div style="width: 900px; height: 268px; background: #2c3e50; display: flex; font-family: 'PingFang SC', sans-serif; box-sizing: border-box;">
        <div style="width: 632px; height: 268px; display: flex; flex-direction: column; justify-content: center; padding: 0 25px; color: white;">
          <h1 style="font-size: 36px; font-weight: bold; margin: 0 0 10px 0; line-height: 1.2;">公众号测试标题</h1>
          <p style="font-size: 18px; margin: 0; opacity: 0.8;">这是测试副标题</p>
        </div>
        <div style="width: 268px; height: 268px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #34495e; color: white;">
          <div style="font-size: 32px; font-weight: bold; line-height: 1.2; text-align: center;">测试<br/>封面</div>
        </div>
      </div>`
    }
  ];

  const handleTestDownload = async (html: string, name: string) => {
    if (!downloadContainerRef.current) return;

    setIsDownloading(true);
    try {
      // 设置测试内容
      downloadContainerRef.current.innerHTML = html;
      
      // 等待DOM更新
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 获取尺寸信息
      const firstChild = downloadContainerRef.current.firstElementChild as HTMLElement;
      if (!firstChild) {
        console.error('找不到内容元素');
        return;
      }

      const width = parseInt(firstChild.style.width) || firstChild.offsetWidth;
      const height = parseInt(firstChild.style.height) || firstChild.offsetHeight;
      
      console.log('🎯 测试下载参数:', { name, width, height });

      const filename = generateFileName(name, width, height);
      
      const success = await downloadCoverImage(downloadContainerRef.current, {
        width,
        height,
        filename,
        backgroundColor: null,
        scale: 2
      });

      if (success) {
        console.log('✅ 测试下载成功:', name);
      } else {
        console.error('❌ 测试下载失败:', name);
      }

    } catch (error) {
      console.error('❌ 测试下载错误:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCustomTest = async () => {
    if (!testHtml.trim()) {
      alert('请输入测试HTML');
      return;
    }

    await handleTestDownload(testHtml, '自定义测试');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 预览下载一致性测试
          </h1>
          <p className="text-gray-600">
            测试不同尺寸和风格的封面，验证预览和下载是否完全一致
          </p>
        </div>

        {/* 样本测试 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🎨 样本测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleHtmls.map((sample, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-2">{sample.name}</h3>
                <div 
                  className="bg-gray-100 rounded p-2 mb-3"
                  style={{ 
                    transform: 'scale(0.1)', 
                    transformOrigin: 'top left',
                    width: '900px',
                    height: '120px',
                    overflow: 'hidden'
                  }}
                  dangerouslySetInnerHTML={{ __html: sample.html }}
                />
                <button
                  onClick={() => handleTestDownload(sample.html, sample.name)}
                  disabled={isDownloading}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isDownloading ? '下载中...' : '测试下载'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 自定义测试 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">🛠 自定义测试</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测试HTML代码
              </label>
              <textarea
                value={testHtml}
                onChange={(e) => setTestHtml(e.target.value)}
                placeholder="输入要测试的HTML代码..."
                className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleCustomTest}
              disabled={isDownloading || !testHtml.trim()}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {isDownloading ? '测试中...' : '测试自定义HTML'}
            </button>
          </div>
        </div>

        {/* 状态显示 */}
        {isDownloading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>正在测试下载...</span>
              </div>
            </div>
          </div>
        )}

        {/* 隐藏的下载容器 */}
        <div
          ref={downloadContainerRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            visibility: 'hidden'
          }}
          data-download-container
        />
      </div>
    </div>
  );
} 