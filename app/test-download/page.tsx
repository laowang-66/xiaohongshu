'use client';

import React, { useState } from 'react';
import { downloadCoverImage, generateFileName } from '../utils/downloadHelper';

const TestDownloadPage: React.FC = () => {
  const [status, setStatus] = useState<string>('准备就绪');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const testDownload = async () => {
    setIsLoading(true);
    setStatus('🚀 开始测试下载...');
    
    try {
      // 获取测试容器
      const testContainer = document.getElementById('test-container');
      if (!testContainer) {
        throw new Error('找不到测试容器');
      }

      const filename = generateFileName('测试封面', 900, 1200);
      
      setStatus('🖼️ 正在生成图片...');
      
      const success = await downloadCoverImage(testContainer, {
        width: 900,
        height: 1200,
        filename: filename,
        backgroundColor: '#ffffff',
        scale: 2
      });

      if (success) {
        setStatus('✅ 下载成功！');
      } else {
        setStatus('❌ 下载失败');
      }
    } catch (error) {
      console.error('测试下载失败:', error);
      setStatus('❌ 错误: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        marginBottom: '20px',
        color: '#333'
      }}>
        📸 下载功能测试
      </h1>
      
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
          当前状态: <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{status}</span>
        </p>
        
        <button
          onClick={testDownload}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#94a3b8' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {isLoading ? '⏳ 处理中...' : '🔽 测试下载'}
        </button>
      </div>

      {/* 测试容器 - 模拟真实的封面内容 */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
          📋 预览内容（这个将被下载）:
        </h2>
        
        <div
          id="test-container"
          data-editable-card-container="true"
          style={{
            width: '450px', // 预览时缩放到50%
            height: '600px',
            transform: 'scale(0.5)',
            transformOrigin: 'top left',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* 实际内容 - 900x1200 */}
          <div style={{
            width: '900px',
            height: '1200px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
          }}>
            <div style={{ textAlign: 'center', zIndex: 2 }}>
              <h1 style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: '0 0 30px 0',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                测试封面
              </h1>
              <p style={{
                fontSize: '28px',
                color: '#f1f5f9',
                margin: '0 0 40px 0',
                lineHeight: '1.6',
                maxWidth: '600px'
              }}>
                这是一个测试封面，用于验证下载功能。
                预览显示为缩放版本，下载应该是完整尺寸。
              </p>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '20px 30px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <p style={{
                  fontSize: '20px',
                  color: '#ffffff',
                  margin: '0',
                  fontWeight: '500'
                }}>
                  📏 实际尺寸: 900×1200px
                </p>
              </div>
            </div>
            
            {/* 装饰性元素 */}
            <div style={{
              position: 'absolute',
              top: '50px',
              right: '50px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(5px)'
            }} />
            
            <div style={{
              position: 'absolute',
              bottom: '100px',
              left: '60px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(5px)'
            }} />
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
          🔧 测试说明:
        </h3>
        <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
          <li>上方的封面在预览中显示为缩放版本 (50%)</li>
          <li>下载的图片应该是完整的 900×1200 像素</li>
          <li>如果下载正常，文件名会包含时间戳</li>
          <li>检查下载的图片是否与预览内容一致（除了尺寸）</li>
        </ul>
      </div>
    </div>
  );
};

export default TestDownloadPage; 