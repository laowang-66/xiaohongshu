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

  // 处理编辑保存
  const handleEditSave = (newText: string, newStyle: any) => {
    if (!editingElement || !textParserRef.current) return;

    // 更新文本元素
    const success = textParserRef.current.updateTextElement(
      editingElement.id,
      newText,
      newStyle
    );

    if (success) {
      // 触发内容变化回调
      if (onContentChange && containerRef.current) {
        onContentChange(containerRef.current.innerHTML);
      }
      
      console.log('Text updated successfully:', newText);
    } else {
      console.error('Failed to update text element');
    }

    setIsModalOpen(false);
    setEditingElement(null);
  };

  // 处理编辑取消
  const handleEditCancel = () => {
    setIsModalOpen(false);
    setEditingElement(null);
  };

  // 重置到原始内容
  const resetContent = () => {
    if (containerRef.current) {
      cleanupEditableFeatures();
      const decodedContent = decodeUnicode(htmlContent);
      containerRef.current.innerHTML = decodedContent;
      setTimeout(() => {
        setupEditableFeatures();
      }, 100);
    }
  };

  // 初始化内容
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 清理之前的状态
    cleanupEditableFeatures();
    
    // 解码并设置新内容
    const decodedContent = decodeUnicode(htmlContent);
    containerRef.current.innerHTML = decodedContent;
    
    // 短暂延迟后设置编辑功能
    const timer = setTimeout(() => {
      setupEditableFeatures();
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
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            data-download-container
            dangerouslySetInnerHTML={{ __html: processedContent }}
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