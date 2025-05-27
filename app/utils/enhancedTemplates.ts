/**
 * 增强的模板系统 - 提供更精美和现代化的设计模板
 */

import { analyzeContentAndRecommend } from './aiContentAnalyzer';

export interface EnhancedTemplate {
  key: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  getPrompt: (sizeConfig: any, text: string) => string;
  colorPalette: string[];
  features: string[];
}

// 新增精美模板
export const ENHANCED_TEMPLATES: EnhancedTemplate[] = [
  {
    key: 'modern_gradient_card',
    name: '现代渐变卡片',
    description: '使用时尚渐变和磨砂玻璃效果，适合时尚、科技类内容',
    category: '现代时尚',
    preview: '🌈✨',
    colorPalette: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
    features: ['渐变背景', '磨砂玻璃效果', '动态阴影', '现代字体'],
    getPrompt: (sizeConfig, text) => generateModernGradientPrompt(sizeConfig, text)
  },
  {
    key: 'neon_cyber_style',
    name: '霓虹赛博风格',
    description: '未来感霓虹色彩设计，适合科技、游戏、潮流内容',
    category: '未来科技',
    preview: '🔮⚡',
    colorPalette: ['#00d2ff', '#3a47d5', '#ff0080', '#00ff88'],
    features: ['霓虹发光效果', '几何图形', '对比色彩', '未来字体'],
    getPrompt: (sizeConfig, text) => generateNeonCyberPrompt(sizeConfig, text)
  },
  {
    key: 'elegant_minimal',
    name: '优雅极简风',
    description: '简约而不简单，精致的排版和留白，适合高端品牌和文艺内容',
    category: '极简优雅',
    preview: '🤍📐',
    colorPalette: ['#f8f9fa', '#e9ecef', '#6c757d', '#495057'],
    features: ['极简布局', '精致排版', '优雅留白', '经典配色'],
    getPrompt: (sizeConfig, text) => generateElegantMinimalPrompt(sizeConfig, text)
  },
  {
    key: 'organic_nature',
    name: '有机自然风',
    description: '自然曲线和有机形状，温暖舒适的色彩，适合生活、健康、环保类内容',
    category: '自然生活',
    preview: '🌿🍃',
    colorPalette: ['#81c784', '#a5d6a7', '#c8e6c9', '#e8f5e8'],
    features: ['有机曲线', '自然色彩', '温暖质感', '生态元素'],
    getPrompt: (sizeConfig, text) => generateOrganicNaturePrompt(sizeConfig, text)
  },
  {
    key: 'retro_vintage',
    name: '复古怀旧风',
    description: '经典复古色调和怀旧元素，适合品牌故事、文化、艺术类内容',
    category: '复古经典',
    preview: '📻🎞️',
    colorPalette: ['#d4a574', '#c19a6b', '#a67c5a', '#8b6f47'],
    features: ['复古色调', '怀旧元素', '经典字体', '质感纹理'],
    getPrompt: (sizeConfig, text) => generateRetroVintagePrompt(sizeConfig, text)
  },
  {
    key: 'playful_dynamic',
    name: '活力动感风',
    description: '充满活力的色彩和动感元素，适合年轻化、娱乐、运动类内容',
    category: '活力青春',
    preview: '🎨🎪',
    colorPalette: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'],
    features: ['活力色彩', '动感元素', '青春活泼', '趣味图形'],
    getPrompt: (sizeConfig, text) => generatePlayfulDynamicPrompt(sizeConfig, text)
  }
];

// 现代渐变卡片模板提示词
function generateModernGradientPrompt(sizeConfig: any, text: string): string {
  // 使用AI分析来优化设计
  const analysis = analyzeContentAndRecommend(text, sizeConfig.key);
  
  return `
请创建一个现代渐变卡片风格的封面，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🎨 设计理念：现代时尚 + 视觉冲击
- 使用先进的CSS渐变技术和现代设计语言
- 融入磨砂玻璃(Glassmorphism)效果
- 创造层次丰富的视觉体验

📐 布局规范：
- 主容器：使用多层渐变背景，从深色到浅色的平滑过渡
- 内容卡片：半透明白色背景，backdrop-filter模糊效果
- 文字排版：现代无衬线字体，清晰的层次结构
- 装饰元素：几何图形、渐变线条、动态阴影

🌈 色彩系统：
- 主渐变：从 #667eea 到 #764ba2
- 次渐变：从 #f093fb 到 #f5576c  
- 文字色：#ffffff (主标题) #f8f9fa (副标题) #e9ecef (正文)
- 装饰色：rgba(255,255,255,0.2) 半透明白色

✨ 特效要求：
- 背景：双层渐变 + 动态球形装饰
- 卡片：backdrop-filter: blur(10px) + box-shadow
- 文字：适当的text-shadow增强可读性
- 装饰：CSS transform创造空间感

📝 文字处理：
- 主标题：48-60px，font-weight: 700，突出核心信息
- 副标题：24-28px，font-weight: 500，补充说明
- 正文：18-20px，font-weight: 400，详细描述
- 特殊强调：使用渐变文字效果

内容文案：${text}

请生成完整的HTML代码，包含所有内联CSS样式，确保视觉效果现代时尚且具有强烈的吸引力。
  `.trim();
}

// 霓虹赛博风格模板提示词  
function generateNeonCyberPrompt(sizeConfig: any, text: string): string {
  return `
请创建一个霓虹赛博风格的封面，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🔮 设计理念：未来科技 + 霓虹美学
- 暗黑背景配合霓虹发光效果
- 几何线条和科技元素
- 强烈的对比色彩

🎨 色彩系统：
- 背景：深黑色 #000000 到 #1a1a2e 渐变
- 霓虹色：#00d2ff (蓝色光) #ff0080 (粉色光) #00ff88 (绿色光)
- 文字：#ffffff (主) #00d2ff (强调) #cccccc (辅助)

✨ 视觉效果：
- 霓虹发光：box-shadow 多层叠加创造发光效果
- 扫描线：伪元素创造赛博感
- 几何装饰：三角形、六边形、线条
- 故障效果：轻微的位移和色彩分离

📐 布局特点：
- 非对称布局增加动感
- 大胆的字体选择
- 装饰线条引导视线
- 适当的留白平衡视觉

内容文案：${text}

请生成完整的HTML代码，营造强烈的未来科技感。
  `.trim();
}

// 优雅极简风格模板提示词
function generateElegantMinimalPrompt(sizeConfig: any, text: string): string {
  return `
请创建一个优雅极简风格的封面，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🤍 设计理念：Less is More + 精致品质
- 大量留白创造呼吸感
- 精准的排版和对齐
- 克制的色彩使用
- 高品质的视觉表达

🎨 色彩系统：
- 主背景：#f8f9fa 到 #ffffff 微妙渐变
- 文字色：#212529 (标题) #6c757d (正文) #adb5bd (辅助)
- 装饰色：#e9ecef (分割线) #dee2e6 (背景元素)

📐 布局原则：
- 黄金比例分割
- 左对齐或居中对齐
- 统一的行高和间距
- 简洁的几何装饰

✨ 细节处理：
- 微妙的阴影增加层次
- 细线条装饰元素
- 优雅的字体选择
- 精确的对齐和间距

内容文案：${text}

请生成完整的HTML代码，体现极简而优雅的设计美学。
  `.trim();
}

// 有机自然风格模板提示词
function generateOrganicNaturePrompt(sizeConfig: any, text: string): string {
  return `
请创建一个有机自然风格的封面，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🌿 设计理念：回归自然 + 温暖舒适
- 有机曲线替代直角
- 自然色彩和质感
- 温暖亲和的视觉感受
- 生态环保的设计语言

🎨 色彩系统：
- 背景：#e8f5e8 到 #c8e6c9 柔和渐变
- 主色：#81c784 (自然绿) #a5d6a7 (嫩绿)
- 文字：#2e7d32 (深绿) #388e3c (中绿) #66bb6a (浅绿)

🍃 设计元素：
- 有机形状背景
- 叶子、水滴等自然图标
- 圆角和曲线设计
- 纸张质感效果

📐 布局特色：
- 流畅的曲线布局
- 自然的不规则形状
- 温暖的间距设计
- 亲和的视觉层次

内容文案：${text}

请生成完整的HTML代码，传达自然温暖的生活美学。
  `.trim();
}

// 复古怀旧风格模板提示词
function generateRetroVintagePrompt(sizeConfig: any, text: string): string {
  return `
请创建一个复古怀旧风格的封面，尺寸：${sizeConfig.width}×${sizeConfig.height}px

📻 设计理念：经典回溯 + 怀旧情怀
- 经典的设计元素和排版
- 怀旧的色彩搭配
- 复古的装饰图案
- 时光沉淀的质感

🎨 色彩系统：
- 背景：#f5f1eb 温暖米白色
- 主色：#d4a574 (复古金) #c19a6b (古铜色) #a67c5a (棕褐色)
- 文字：#8b6f47 (深棕) #5d4e37 (咖啡色)

📐 设计元素：
- 经典边框和装饰线
- 复古图案和纹理
- 老式字体排版
- 做旧质感效果

✨ 视觉特色：
- 纸质纹理背景
- 印章和标签元素
- 经典排版网格
- 怀旧色彩处理

内容文案：${text}

请生成完整的HTML代码，营造经典怀旧的时光感。
  `.trim();
}

// 活力动感风格模板提示词
function generatePlayfulDynamicPrompt(sizeConfig: any, text: string): string {
  return `
请创建一个活力动感风格的封面，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🎪 设计理念：青春活力 + 动感节拍
- 鲜艳活泼的色彩组合
- 动感的图形元素
- 年轻化的设计语言
- 充满活力的视觉节奏

🎨 色彩系统：
- 背景：多色彩渐变或几何拼接
- 主色：#ff6b6b (活力红) #4ecdc4 (清新蓝) #45b7d1 (天空蓝) #f9ca24 (阳光黄)
- 文字：#2c3e50 (深蓝) #ffffff (白色)

🎨 设计元素：
- 几何图形组合
- 动感线条和箭头
- 活泼的图标元素
- 不规则形状拼接

📐 布局特色：
- 动态不对称布局
- 活泼的角度和旋转
- 层次丰富的元素
- 强烈的视觉冲击

内容文案：${text}

请生成完整的HTML代码，展现青春活力的动感美学。
  `.trim();
}

// 获取增强模板的函数
export function getEnhancedTemplate(templateKey: string): EnhancedTemplate | null {
  return ENHANCED_TEMPLATES.find(template => template.key === templateKey) || null;
}

// 根据内容智能推荐增强模板
export function recommendEnhancedTemplate(text: string, platform: string): EnhancedTemplate {
  const analysis = analyzeContentAndRecommend(text, platform);
  
  // 基于AI分析结果推荐合适的增强模板
  const contentType = analysis.reasons[0] || '';
  
  if (contentType.includes('tech') || contentType.includes('科技')) {
    return ENHANCED_TEMPLATES.find(t => t.key === 'neon_cyber_style') || ENHANCED_TEMPLATES[0];
  }
  
  if (contentType.includes('beauty') || contentType.includes('时尚')) {
    return ENHANCED_TEMPLATES.find(t => t.key === 'modern_gradient_card') || ENHANCED_TEMPLATES[0];
  }
  
  if (contentType.includes('knowledge') || contentType.includes('专业')) {
    return ENHANCED_TEMPLATES.find(t => t.key === 'elegant_minimal') || ENHANCED_TEMPLATES[0];
  }
  
  if (contentType.includes('food') || contentType.includes('自然')) {
    return ENHANCED_TEMPLATES.find(t => t.key === 'organic_nature') || ENHANCED_TEMPLATES[0];
  }
  
  if (contentType.includes('young') || contentType.includes('活力')) {
    return ENHANCED_TEMPLATES.find(t => t.key === 'playful_dynamic') || ENHANCED_TEMPLATES[0];
  }
  
  // 默认推荐现代渐变卡片
  return ENHANCED_TEMPLATES[0];
} 