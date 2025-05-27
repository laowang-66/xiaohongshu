'use client'

import React, { useState, useEffect } from 'react';

interface TextStyle {
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}

interface EditModalProps {
  isOpen: boolean;
  value: string;
  style: TextStyle;
  onSave: (value: string, style: TextStyle) => void;
  onCancel: () => void;
  maxLength?: number;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  value,
  style,
  onSave,
  onCancel,
  maxLength = 150
}) => {
  const [textValue, setTextValue] = useState(value);
  const [textStyle, setTextStyle] = useState<TextStyle>(style);

  useEffect(() => {
    if (isOpen) {
      setTextValue(value);
      setTextStyle(style);
    }
  }, [isOpen, value, style]);

  const handleSave = () => {
    onSave(textValue.trim(), textStyle);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const presetColors = [
    '#000000', '#333333', '#666666', '#999999', '#FFFFFF',
    '#FF4757', '#FF6B95', '#FF9A8B', '#FFA502', '#FFD700',
    '#2ED573', '#00D2D3', '#5352ED', '#3742FA', '#A4B0BE'
  ];

  const presetSizes = [
    { label: '小', value: 14 },
    { label: '正常', value: 18 },
    { label: '中', value: 24 },
    { label: '大', value: 32 },
    { label: '特大', value: 48 },
    { label: '超大', value: 64 }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">编辑文字</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 实时预览 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">预览效果：</div>
            <div
              style={{
                fontSize: `${textStyle.fontSize}px`,
                color: textStyle.color,
                fontWeight: textStyle.fontWeight,
                textAlign: textStyle.textAlign,
                fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
                lineHeight: 1.4,
                minHeight: '2em',
                wordBreak: 'break-word'
              }}
            >
              {textValue || '请输入文字内容...'}
            </div>
          </div>

          {/* 文字输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文字内容 ({textValue.length}/{maxLength})
            </label>
            <textarea
              value={textValue}
              onChange={(e) => {
                if (e.target.value.length <= maxLength) {
                  setTextValue(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="输入您的文字内容..."
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              autoFocus
            />
            <div className="text-xs text-gray-500 mt-1">
              按 Ctrl+Enter (Mac: Cmd+Enter) 快速保存
            </div>
          </div>

          {/* 样式控制 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">样式设置</h4>
            
            {/* 字体大小 */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">
                字体大小: {textStyle.fontSize}px
              </label>
              <div className="flex gap-2 mb-3">
                {presetSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setTextStyle(prev => ({ ...prev, fontSize: size.value }))}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      textStyle.fontSize === size.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="12"
                max="80"
                value={textStyle.fontSize}
                onChange={(e) => setTextStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 字体颜色 */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">字体颜色</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setTextStyle(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      textStyle.color === color
                        ? 'border-blue-500 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={textStyle.color}
                onChange={(e) => setTextStyle(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>

            {/* 字体粗细和对齐 */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-2">字体粗细</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTextStyle(prev => ({ ...prev, fontWeight: 'normal' }))}
                    className={`flex-1 py-2 text-sm rounded transition-colors ${
                      textStyle.fontWeight === 'normal'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    正常
                  </button>
                  <button
                    onClick={() => setTextStyle(prev => ({ ...prev, fontWeight: 'bold' }))}
                    className={`flex-1 py-2 text-sm rounded transition-colors font-bold ${
                      textStyle.fontWeight === 'bold'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    粗体
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-2">文字对齐</label>
                <div className="flex gap-1">
                  {[
                    { value: 'left', icon: '⬅️', label: '左对齐' },
                    { value: 'center', icon: '↔️', label: '居中' },
                    { value: 'right', icon: '➡️', label: '右对齐' }
                  ].map((align) => (
                    <button
                      key={align.value}
                      onClick={() => setTextStyle(prev => ({ ...prev, textAlign: align.value as 'left' | 'center' | 'right' }))}
                      className={`flex-1 py-2 text-sm rounded transition-colors ${
                        textStyle.textAlign === align.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={align.label}
                    >
                      {align.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!textValue.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            保存修改
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal; 