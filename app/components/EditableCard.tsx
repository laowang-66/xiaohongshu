'use client'

import React, { useRef, useEffect, useState } from 'react';
import EditModal from './EditModal';
import { TextParser, addEditableHints, removeEditableHints } from '../utils/textParser';

interface EditableCardProps {
  htmlContent: string;
  dimensions: {
    width: number;
    height: number;
    ratio: string;
  };
  cardSize: string;
  onContentChange?: (newContent: string) => void;
}

interface EditingElement {
  id: string;
  text: string;
  style: {
    fontSize: number;
    color: string;
    fontWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
  };
}

const EditableCard: React.FC<EditableCardProps> = ({ 
  htmlContent, 
  dimensions, 
  cardSize, 
  onContentChange 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const downloadContainerRef = useRef<HTMLDivElement>(null);
  const textParserRef = useRef<TextParser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [editingElement, setEditingElement] = useState<EditingElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Unicode 解码函数
  const decodeUnicode = (str: string): string => {
    try {
      return str.replace(/\\u[\dA-F]{4}/gi, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
      });
    } catch (error) {
      console.warn('Unicode decode error:', error);
      return str;
    }
  };

  // 计算缩放比例和容器尺寸
  const getScaleAndContainerStyle = () => {
    const { width, height } = dimensions;
    
    // 定义最大显示尺寸
    const maxDisplayWidth = 400;
    const maxDisplayHeight = 500;
    
    // 计算缩放比例，确保内容完全在容器内
    const scaleX = maxDisplayWidth / width;
    const scaleY = maxDisplayHeight / height;
    const scale = Math.min(scaleX, scaleY, 1); // 取最小值确保不超出边界
    
    // 计算缩放后的实际显示尺寸
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    
    return {
      containerStyle: {
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        margin: '0 auto',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#f9fafb'
      },
      contentStyle: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${width}px`,
        height: `${height}px`,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      scale
    };
  };

  // 设置可编辑功能
  const setupEditableFeatures = () => {
    if (!containerRef.current) return;

    // 初始化文本解析器
    textParserRef.current = new TextParser(containerRef.current);
    const textElements = textParserRef.current.parseTextElements();
    
    if (textElements.length === 0) {
      console.warn('No editable text elements found');
      setIsReady(true); // 即使没有可编辑元素，也设置为ready状态
      return;
    }

    console.log(`Found ${textElements.length} editable text elements`);

    // 添加可视化提示
    addEditableHints(textElements);

    // 添加点击事件监听器
    textElements.forEach(textElement => {
      const { element, id, text, style } = textElement;
      
      const handleClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        setEditingElement({
          id,
          text,
          style
        });
        setIsModalOpen(true);
      };

      element.addEventListener('click', handleClick);
      
      // 保存清理函数
      (element as any).__removeClickHandler = () => {
        element.removeEventListener('click', handleClick);
      };
    });

    setIsReady(true);
  };

  // 清理编辑功能
  const cleanupEditableFeatures = () => {
    if (containerRef.current) {
      // 移除可视化提示
      removeEditableHints(containerRef.current);
      
      // 移除点击事件监听器
      const elements = containerRef.current.querySelectorAll('*');
      elements.forEach(element => {
        const cleanupFn = (element as any).__removeClickHandler;
        if (cleanupFn) {
          cleanupFn();
        }
      });
    }

    if (textParserRef.current) {
      textParserRef.current.reset();
      textParserRef.current = null;
    }
    
    setIsReady(false);
  };

  // 同步下载容器内容 - 改进版本
  const syncDownloadContainer = () => {
    if (containerRef.current && downloadContainerRef.current) {
      // 克隆编辑容器的内容
      const clonedContent = containerRef.current.cloneNode(true) as HTMLElement;
      
      // 更全面的样式清理函数
      const cleanEditingStyles = (element: HTMLElement) => {
        // 移除编辑相关的样式
        const stylesToRemove = [
          'cursor', 'transition', 'backgroundColor', 'outline', 
          'outlineOffset', 'border', 'borderRadius', 'padding', 
          'margin', 'boxShadow', 'opacity', 'transform'
        ];
        
        stylesToRemove.forEach(prop => {
          element.style.removeProperty(prop);
        });
        
        // 移除编辑相关的类名
        element.classList.remove('editable-element', 'editable-hint');
        
        // 移除data属性
        element.removeAttribute('data-editable-id');
        element.removeAttribute('data-text-element');
        
        // 确保保留原始的样式属性
        const originalStyle = element.getAttribute('style');
        if (originalStyle) {
          // 清理编辑相关的样式，但保留原始样式
          const cleanedStyle = originalStyle
            .replace(/cursor:\s*[^;]+;?/g, '')
            .replace(/transition:\s*[^;]+;?/g, '')
            .replace(/background-color:\s*rgba\(59,\s*130,\s*246[^)]*\);?/g, '')
            .replace(/outline[^:]*:\s*[^;]*rgba\(59,\s*130,\s*246[^)]*\)[^;]*;?/g, '')
            .replace(/box-shadow:\s*[^;]*rgba\(59,\s*130,\s*246[^)]*\)[^;]*;?/g, '')
            .replace(/;\s*;/g, ';')
            .replace(/^\s*;\s*/, '')
            .replace(/\s*;\s*$/, '');
          
          if (cleanedStyle.trim()) {
            element.setAttribute('style', cleanedStyle);
          } else {
            element.removeAttribute('style');
          }
        }
        
        // 递归清理子元素
        const children = element.children;
        for (let i = 0; i < children.length; i++) {
          cleanEditingStyles(children[i] as HTMLElement);
        }
      };
      
      // 清理所有编辑样式
      cleanEditingStyles(clonedContent);
      
      // 确保下载容器有正确的样式
      downloadContainerRef.current.style.width = `${dimensions.width}px`;
      downloadContainerRef.current.style.height = `${dimensions.height}px`;
      downloadContainerRef.current.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      downloadContainerRef.current.style.transform = 'none';
      downloadContainerRef.current.style.transformOrigin = 'initial';
      downloadContainerRef.current.style.position = 'absolute';
      downloadContainerRef.current.style.left = '-9999px';
      downloadContainerRef.current.style.top = '-9999px';
      downloadContainerRef.current.style.visibility = 'hidden';
      downloadContainerRef.current.style.overflow = 'hidden';
      
      // 设置下载容器的内容
      downloadContainerRef.current.innerHTML = clonedContent.innerHTML;
      
      console.log('✅ 下载容器内容已同步并清理样式');
      console.log('📏 下载容器尺寸:', dimensions.width, 'x', dimensions.height);
      console.log('📄 下载容器内容长度:', downloadContainerRef.current.innerHTML.length);
      
      // 验证同步结果
      const downloadHTML = downloadContainerRef.current.innerHTML;
      if (downloadHTML.includes('rgba(59, 130, 246') || downloadHTML.includes('editable-')) {
        console.warn('⚠️ 下载容器中仍包含编辑样式，需要进一步清理');
      } else {
        console.log('✅ 下载容器样式清理验证通过');
      }
    }
  };

  // 强制同步下载容器 - 新增方法
  const forceSyncDownloadContainer = () => {
    return new Promise<void>((resolve) => {
      // 多次尝试同步，确保稳定性
      let attempts = 0;
      const maxAttempts = 3;
      
      const attemptSync = () => {
        attempts++;
        syncDownloadContainer();
        
        if (attempts < maxAttempts) {
          setTimeout(attemptSync, 50);
        } else {
          console.log(`🔄 完成${maxAttempts}次同步尝试`);
          resolve();
        }
      };
      
      attemptSync();
    });
  };

  // 处理编辑保存 - 改进版本
  const handleEditSave = async (newText: string, newStyle: any) => {
    if (!editingElement || !textParserRef.current) return;

    console.log('🎨 开始保存编辑:', newText);

    // 更新文本元素
    const success = textParserRef.current.updateTextElement(
      editingElement.id,
      newText,
      newStyle
    );

    if (success) {
      console.log('✅ 文本更新成功，开始同步下载容器');
      
      // 使用改进的强制同步方法
      await forceSyncDownloadContainer();
      
      // 触发内容变化回调，使用下载容器的内容
      if (onContentChange && downloadContainerRef.current) {
        const syncedContent = downloadContainerRef.current.innerHTML;
        console.log('📤 触发内容变化回调，内容长度:', syncedContent.length);
        onContentChange(syncedContent);
      }
      
      console.log('🎯 编辑保存流程完成');
    } else {
      console.error('❌ 文本元素更新失败');
    }

    setIsModalOpen(false);
    setEditingElement(null);
  };

  // 处理编辑取消
  const handleEditCancel = () => {
    setIsModalOpen(false);
    setEditingElement(null);
  };

  // 重置到原始内容 - 改进版本
  const resetContent = async () => {
    if (containerRef.current) {
      console.log('🔄 开始重置内容');
      
      cleanupEditableFeatures();
      const decodedContent = decodeUnicode(htmlContent);
      containerRef.current.innerHTML = decodedContent;
      
      // 立即同步到下载容器
      if (downloadContainerRef.current) {
        downloadContainerRef.current.innerHTML = decodedContent;
        console.log('📄 重置时同步下载容器');
      }
      
      // 重新设置编辑功能
      setTimeout(async () => {
        setupEditableFeatures();
        // 编辑功能设置完成后，强制同步下载容器
        await forceSyncDownloadContainer();
        console.log('✅ 重置完成并重新同步');
      }, 100);
    }
  };

  // 初始化内容 - 改进版本
  useEffect(() => {
    if (!containerRef.current) return;
    
    console.log('🚀 开始初始化EditableCard内容');
    
    // 清理之前的状态
    cleanupEditableFeatures();
    
    // 解码并设置新内容
    const decodedContent = decodeUnicode(htmlContent);
    containerRef.current.innerHTML = decodedContent;
    
    // 立即同步到下载容器（使用清理后的内容）
    if (downloadContainerRef.current) {
      downloadContainerRef.current.innerHTML = decodedContent;
      console.log('📄 初始化时同步下载容器, 内容长度:', decodedContent.length);
    }
    
    // 短暂延迟后设置编辑功能并强制同步
    const timer = setTimeout(async () => {
      setupEditableFeatures();
      // 编辑功能设置完成后，使用强制同步确保稳定性
      await forceSyncDownloadContainer();
      console.log('✅ 初始化完成：编辑功能已启用，下载容器已同步');
    }, 200);
    
    return () => {
      clearTimeout(timer);
      cleanupEditableFeatures();
    };
  }, [htmlContent]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupEditableFeatures();
    };
  }, []);

  const processedContent = decodeUnicode(htmlContent);
  const { containerStyle, contentStyle, scale } = getScaleAndContainerStyle();

  return (
    <>
      <div className="space-y-4">
        {/* 编辑工具栏 */}
        <div className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 text-sm">
            {isReady ? (
              <>
                <div className="flex items-center gap-2 text-green-700">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">编辑模式已激活</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <span className="text-gray-600">点击任意文字进行编辑</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-yellow-700">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">正在准备编辑功能...</span>
                </div>
              </>
            )}
          </div>
          
          <button
            onClick={resetContent}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={!isReady}
          >
            🔄 重置内容
          </button>
        </div>

        {/* 可编辑封面内容 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <div style={containerStyle}>
              <div
                ref={containerRef}
                className="block"
                style={contentStyle}
                data-editable-card-container
              >
                {/* 内容将通过 innerHTML 动态设置 */}
              </div>
            </div>
          </div>
          
          {/* 隐藏的原尺寸版本，专门用于下载 */}
          <div
            style={{
              position: 'absolute',
              left: '-9999px',
              top: '-9999px',
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              visibility: 'hidden'
            }}
            data-download-container
            ref={downloadContainerRef}
          />
        </div>

        {/* 状态提示 */}
        <div className={`text-xs text-center p-3 rounded-lg ${
          isReady 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          {isReady 
            ? `🎨 编辑模式已启用：点击任何文字打开专业编辑器，支持实时修改内容和样式，下载时会自动应用您的编辑 (缩放比例: ${Math.round(scale * 100)}%)`
            : '⏳ 正在初始化编辑功能，请稍候...'
          }
        </div>
      </div>

      {/* 编辑弹窗 */}
      {editingElement && (
        <EditModal
          isOpen={isModalOpen}
          value={editingElement.text}
          style={editingElement.style}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          maxLength={150}
        />
      )}
    </>
  );
};

export default EditableCard; 