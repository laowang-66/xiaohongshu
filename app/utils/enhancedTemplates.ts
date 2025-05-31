/**
 * 增强的模板系统 - 提供更精美和现代化的设计模板
 * 专注于三个核心：内容提炼优化、内容规范适配、模板美化套用
 * 新增：Markdown结构分析，提供更精准的内容理解和设计建议
 */

import { analyzeContentAndRecommend } from './aiContentAnalyzer';
import { analyzeContentInDepth, generateSmartOptimizationPrompt } from './contentOptimizer';
import { 
  convertToMarkdown, 
  parseMarkdownStructure, 
  optimizeCoverContent,
  type MarkdownStructure,
  type OptimizedCoverContent 
} from './markdownContentAnalyzer';

export interface EnhancedTemplate {
  key: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  getPrompt: (sizeConfig: any, text: string) => string;
  colorPalette: string[] | { primary: string; secondary: string; accent?: string };
  features: string[];
  contentRules: {
    titleMaxLength: number;
    subtitleMaxLength: number;
    optimalWordCount: number;
    layoutType: 'card' | 'full' | 'split' | 'overlay';
    designPrinciples: string[];
  };
}

// 新增精美模板系统 - 基于用户提供的11个设计风格
export const ENHANCED_TEMPLATES: EnhancedTemplate[] = [
  // ============= 原有模板（保留） =============
  {
    key: 'soft_tech_card',
    name: '柔和科技风',
    description: '渐变背景，现代感图标，适合科技类内容',
    category: '科技',
    preview: '蓝紫渐变背景，科技感图标装饰',
    features: ['渐变背景', '现代图标', '科技感', '清新配色'],
    colorPalette: ['#f8f4ff', '#e8d5ff', '#ffbdbd', '#f5f5dc'],
    contentRules: {
      titleMaxLength: 20,
      subtitleMaxLength: 15,
      optimalWordCount: 30,
      layoutType: 'card',
      designPrinciples: ['友好亲和', '科技质感', '简约设计', '视觉舒适']
    },
    getPrompt: (sizeConfig, text) => generateSoftTechCardPrompt(sizeConfig, text)
  },
  {
    key: 'modern_business_news',
    name: '现代商务资讯卡片风',
    description: '深绿深红色调象征专业，网格底纹增强科技感，商务应用美学',
    category: '商务专业',
    preview: '💼📊',
    colorPalette: ['#2d5a27', '#8b1538', '#f5f5f5', '#ffffff'],
    features: ['色彩情绪编码', '主题色块', '网格底纹', '三级信息层级', '功能导向'],
    contentRules: {
      titleMaxLength: 18,
      subtitleMaxLength: 12,
      optimalWordCount: 25,
      layoutType: 'card',
      designPrinciples: ['专业权威', '信息效率', '商务美学', '层次分明']
    },
    getPrompt: (sizeConfig, text) => generateModernBusinessNewsPrompt(sizeConfig, text)
  },
  {
    key: 'flowing_tech_blue_style',
    name: '流动科技蓝风格',
    description: '现代简约科技风，蓝白渐变配合流线型曲线，营造动态科技感',
    category: '科技动感',
    preview: '🌊💙',
    colorPalette: ['#4682b4', '#87ceeb', '#ffffff', '#f0f8ff'],
    features: ['蓝色系主体', '流线曲线', '圆角矩形', '光影柔和', '折纸元素'],
    contentRules: {
      titleMaxLength: 22,
      subtitleMaxLength: 16,
      optimalWordCount: 35,
      layoutType: 'overlay',
      designPrinciples: ['科技未来', '流动美学', '简约现代', '视觉动感']
    },
    getPrompt: (sizeConfig, text) => generateFlowingTechBlueStylePrompt(sizeConfig, text)
  },
  {
    key: 'minimal_grid_master',
    name: '极简格栅主义封面风格',
    description: '黑白极简配合强烈几何感，网格系统布局，工业风格装饰',
    category: '极简格栅',
    preview: '⬛📐',
    colorPalette: ['#000000', '#ffffff', '#00ff00', '#cccccc'],
    features: ['黑白对比', '几何元素', '网格布局', '留白艺术', '工业装饰'],
    contentRules: {
      titleMaxLength: 16,
      subtitleMaxLength: 10,
      optimalWordCount: 20,
      layoutType: 'full',
      designPrinciples: ['极简主义', '几何美学', '工业设计', '视觉冲击']
    },
    getPrompt: (sizeConfig, text) => generateMinimalGridMasterPrompt(sizeConfig, text)
  },
  {
    key: 'digital_ticket_style',
    name: '数字极简票券风',
    description: '黑白对比主导，票券化布局，东西方美学融合，数字界面映射',
    category: '数字票券',
    preview: '🎫💻',
    colorPalette: ['#000000', '#ffffff', '#f0f0f0', '#333333'],
    features: ['票券布局', '几何分区', '留白艺术', '中英混排', '数字界面'],
    contentRules: {
      titleMaxLength: 18,
      subtitleMaxLength: 12,
      optimalWordCount: 25,
      layoutType: 'split',
      designPrinciples: ['东西融合', '极简设计', '工业感', '功能导向']
    },
    getPrompt: (sizeConfig, text) => generateDigitalTicketStylePrompt(sizeConfig, text)
  },
  {
    key: 'constructivist_teaching',
    name: '新构成主义教学风',
    description: '黑红白三色系统，网格化精准排版，学术实验美学，日式现代主义',
    category: '教学学术',
    preview: '📚🔴',
    colorPalette: ['#000000', '#ff0000', '#ffffff', '#f5f5f5'],
    features: ['三色系统', '网格排版', '学术美学', '教学图解', '红线引导'],
    contentRules: {
      titleMaxLength: 20,
      subtitleMaxLength: 15,
      optimalWordCount: 30,
      layoutType: 'split',
      designPrinciples: ['学术权威', '实验美学', '现代主义', '教育功能']
    },
    getPrompt: (sizeConfig, text) => generateConstructivistTeachingPrompt(sizeConfig, text)
  },
  {
    key: 'luxury_natural_mood',
    name: '奢华自然意境风',
    description: '高级沉稳色调配合意境式呈现，东西方美学融合，沉浸式体验',
    category: '奢华意境',
    preview: '✨🍃',
    colorPalette: ['#2f4f4f', '#8fbc8f', '#f5f5dc', '#daa520'],
    features: ['沉稳色调', '意境呈现', '空间层次', '摄影级光影', '水墨意境'],
    contentRules: {
      titleMaxLength: 24,
      subtitleMaxLength: 18,
      optimalWordCount: 38,
      layoutType: 'overlay',
      designPrinciples: ['奢华内敛', '自然和谐', '意境深远', '品质追求']
    },
    getPrompt: (sizeConfig, text) => generateLuxuryNaturalMoodPrompt(sizeConfig, text)
  },
  {
    key: 'industrial_rebellion_style',
    name: '新潮工业反叛风',
    description: '黑底强对比美学，地下文化气质，后现代解构主义，数字朋克气息',
    category: '工业反叛',
    preview: '⚡🖤',
    colorPalette: ['#000000', '#ffffff', '#ffff00', '#ff0080'],
    features: ['强对比', '地下文化', '解构主义', '荧光元素', '实验排版'],
    contentRules: {
      titleMaxLength: 16,
      subtitleMaxLength: 10,
      optimalWordCount: 20,
      layoutType: 'full',
      designPrinciples: ['反叛精神', '工业美学', '朋克文化', '视觉冲击']
    },
    getPrompt: (sizeConfig, text) => generateIndustrialRebellionStylePrompt(sizeConfig, text)
  },
  {
    key: 'cute_knowledge_card',
    name: '软萌知识卡片风',
    description: '柔和色彩基调，圆角卡片结构，情感化设计，Q版表情角色',
    category: '软萌可爱',
    preview: '🌸😊',
    colorPalette: ['#ffb6c1', '#fffacd', '#e6e6fa', '#f0f8ff'],
    features: ['柔和色彩', '圆角设计', '情感化', 'Q版角色', '亲和友好'],
    contentRules: {
      titleMaxLength: 22,
      subtitleMaxLength: 16,
      optimalWordCount: 35,
      layoutType: 'card',
      designPrinciples: ['温暖治愈', '亲和可爱', '情感表达', '轻松友好']
    },
    getPrompt: (sizeConfig, text) => generateCuteKnowledgeCardPrompt(sizeConfig, text)
  },
  {
    key: 'business_simple_clean',
    name: '商务简约信息卡片风',
    description: '极简背景设计，高对比度呈现，方正几何布局，功能性优先',
    category: '商务简约',
    preview: '📋⚪',
    colorPalette: ['#f5f5f5', '#ffffff', '#2c3e50', '#27ae60'],
    features: ['极简背景', '高对比度', '几何布局', '功能优先', '问答式结构'],
    contentRules: {
      titleMaxLength: 20,
      subtitleMaxLength: 15,
      optimalWordCount: 30,
      layoutType: 'card',
      designPrinciples: ['功能至上', '简约高效', '专业品质', '清晰易读']
    },
    getPrompt: (sizeConfig, text) => generateBusinessSimpleCleanPrompt(sizeConfig, text)
  },
  {
    key: 'fresh_illustration_style',
    name: '清新插画风信息卡片风',
    description: '马卡龙色系基调，手绘插画主导，不规则布局，轻量装饰元素',
    category: '清新插画',
    preview: '🎨🌈',
    colorPalette: ['#ffc0cb', '#98fb98', '#87ceeb', '#fff8dc'],
    features: ['马卡龙色系', '手绘插画', '不规则布局', '植物元素', '贴纸标签'],
    contentRules: {
      titleMaxLength: 24,
      subtitleMaxLength: 18,
      optimalWordCount: 38,
      layoutType: 'overlay',
      designPrinciples: ['清新治愈', '插画美学', '创意自由', '温暖亲和']
    },
    getPrompt: (sizeConfig, text) => generateFreshIllustrationStylePrompt(sizeConfig, text)
  }
];

export function recommendTemplateByContent(text: string, platform: string): EnhancedTemplate {
  // 先进行Markdown分析
  const markdown = convertToMarkdown(text);
  const structure = parseMarkdownStructure(markdown);
  const optimized = optimizeCoverContent(structure);
  
  // 传统分析作为补充
  const contentAnalysis = analyzeContentInDepth(text);
  const aiAnalysis = analyzeContentAndRecommend(text, platform);
  
  console.log('🧠 Markdown结构分析:', {
    contentType: structure.contentType,
    layoutType: structure.designHints.layoutType,
    templateRecommendation: optimized.templateRecommendation,
    hasStructure: structure.designHints.hasStructure,
    codeBlocks: structure.codeBlocks.length,
    lists: structure.lists.allItems.length
  });
  
  // 优先使用Markdown分析的模板推荐
  if (optimized.templateRecommendation && optimized.templateRecommendation !== 'premium_glass_morphism') {
    const recommended = ENHANCED_TEMPLATES.find(t => t.key === optimized.templateRecommendation);
    if (recommended) {
      console.log('✅ 使用Markdown推荐模板:', recommended.name);
      return recommended;
    }
  }
  
  // 基于内容类型进行精确推荐
  switch (structure.contentType) {
    case 'technical':
      return ENHANCED_TEMPLATES.find(t => t.key === 'tech_cyber_neon') || ENHANCED_TEMPLATES[0];
    
    case 'tutorial':
      return ENHANCED_TEMPLATES.find(t => t.key === 'vibrant_3d_card') || ENHANCED_TEMPLATES[0];
    
    case 'review':
      return ENHANCED_TEMPLATES.find(t => t.key === 'elegant_serif_magazine') || ENHANCED_TEMPLATES[0];
    
    case 'story':
      return ENHANCED_TEMPLATES.find(t => t.key === 'warm_story_telling') || ENHANCED_TEMPLATES[0];
    
    case 'list':
      if (structure.lists.allItems.length > 5) {
        return ENHANCED_TEMPLATES.find(t => t.key === 'nature_organic_flow') || ENHANCED_TEMPLATES[0];
      }
      return ENHANCED_TEMPLATES.find(t => t.key === 'vibrant_3d_card') || ENHANCED_TEMPLATES[0];
  }
  
  // 基于布局类型推荐
  switch (structure.designHints.layoutType) {
    case 'hierarchical':
      return ENHANCED_TEMPLATES.find(t => t.key === 'elegant_serif_magazine') || ENHANCED_TEMPLATES[0];
    
    case 'timeline':
      return ENHANCED_TEMPLATES.find(t => t.key === 'vibrant_3d_card') || ENHANCED_TEMPLATES[0];
    
    case 'grid':
      return ENHANCED_TEMPLATES.find(t => t.key === 'nature_organic_flow') || ENHANCED_TEMPLATES[0];
  }
  
  // 回退到传统推荐逻辑
  if (contentAnalysis.emotionalHooks.some(hook => hook.includes('excitement') || hook.includes('amazing'))) {
    return ENHANCED_TEMPLATES.find(t => t.key === 'vibrant_3d_card') || ENHANCED_TEMPLATES[0];
  }
  
  if (contentAnalysis.emotionalHooks.some(hook => hook.includes('trust') || hook.includes('professional'))) {
    return ENHANCED_TEMPLATES.find(t => t.key === 'elegant_serif_magazine') || ENHANCED_TEMPLATES[0];
  }
  
  // 高端内容默认使用玻璃质感
  if (text.length > 30 && aiAnalysis.confidence > 0.7) {
    return ENHANCED_TEMPLATES.find(t => t.key === 'premium_glass_morphism') || ENHANCED_TEMPLATES[0];
  }
  
  // 默认推荐活力3D卡片
  console.log('🔄 使用默认推荐模板');
  return ENHANCED_TEMPLATES.find(t => t.key === 'vibrant_3d_card') || ENHANCED_TEMPLATES[0];
}

/**
 * 导出Markdown分析功能供外部使用
 */
export { convertToMarkdown, parseMarkdownStructure, optimizeCoverContent };

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

// ============= 新增的专业提示词生成函数 =============

// 1. 柔和科技卡片风格提示词生成器
function generateSoftTechCardPrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  const markdown = convertToMarkdown(text);
  const structure = parseMarkdownStructure(markdown);
  const optimized = optimizeCoverContent(structure);
  
  return `你是一位专精于科技美学的UI/UX设计师，擅长创造友好温暖的科技感设计。

## 设计风格：柔和科技卡片风
### 设计特征
- 圆角卡片布局：使用大圆角白色或彩色卡片作为信息容器，创造友好亲和感
- 轻柔色彩系统：主要采用淡紫#f8f4ff、浅黄#fffacd、粉色#ffbdbd、米色#f5f5dc等柔和色调，避免强烈视觉刺激
- 极简留白设计：大量留白空间增强可读性，减少视觉疲劳
- 阴影微立体：subtle阴影效果(box-shadow: 0 2px 12px rgba(0,0,0,0.08))赋予界面轻微的立体感
- 功能美学主义：设计服务于功能，没有多余装饰元素
- 网格化布局：基于明确的网格系统排列卡片，保持整体秩序感
- 渐变色点缀：部分界面使用柔和渐变作为背景，如米色到蓝色的过渡，增加现代感

### 文字排版风格
- 数据突显处理：关键数字信息使用超大字号和加粗处理
- 层级分明排版：标题36-42px加粗、说明文字18-22px、数据、注释等使用明确的字号层级区分
- 简约无衬线字体：全部采用"PingFang SC", "Microsoft YaHei", sans-serif
- 重点色彩标识：使用蓝色#4682b4等高对比度颜色标记重要术语

### 视觉元素风格
- 微妙图标系统：使用简约线性或填充图标，大小适中不喧宾夺主
- 进度可视化：使用环形或条状图表直观展示进度
- 色彩编码信息：不同卡片使用不同色彩，便于快速区分功能模块
- 组件一致性：按钮、标签、选项卡等元素保持统一风格，提升系统感

## 内容文案
${text}

## 尺寸要求
${sizeConfig.width}×${sizeConfig.height}px

## 内容优化
- 主标题：${optimized.title}
- 副标题：${optimized.subtitle || ''}
- 关键词：${optimized.highlights.join('、')}

请生成完整的HTML代码，体现柔和科技的友好质感和现代设计美学。

🚨 **重要：直接返回纯HTML代码，绝对不要用markdown或代码块包裹！从<div>直接开始！**
  `;
}

// 2. 现代商务资讯卡片风格提示词生成器
function generateModernBusinessNewsPrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `你是一位优秀的商务视觉设计师，专精于金融科技和企业应用的视觉设计。

## 设计风格：现代商务资讯卡片风
### 设计特征
- 色彩情绪编码：使用深绿#2d5a27与深红#8b1538分别象征金融稳健与企业活力
- 主题色块构成：整体采用大面积单一色调作为背景，营造专业稳重氛围
- 卡片式设计：内容以圆角8px卡片形式呈现，现代简约且边界感明确
- 商务应用美学：符合金融科技类应用的视觉设计规范与审美
- 微妙渐变处理：背景色采用细腻渐变效果，增强层次感
- 网格底纹肌理：融入轻微网格线与点阵纹理，提升科技感与专业度
- 功能导向设计：布局与元素安排以提升信息获取效率为首要目标

### 文字排版风格
- 三级信息层级：通过明确的字号和粗细区分头条标签、主标题和辅助信息
- 大标题强调：主要新闻标题占据视觉中心，字号32-38px且加粗
- 左对齐规整排版：所有文字元素保持左对齐，结构严谨有序
- 无衬线字体选用：采用"PingFang SC", "Microsoft YaHei", sans-serif，提高可读性和专业感
- 标题分行处理：长标题采用多行排版，每行字数适中，便于快速阅读
- 日期位置固定：日期信息位置统一，作为时效性标识

### 视觉元素风格
- 指向性图标：右上角箭头图标暗示可点击进入详情的交互性质
- 点阵背景纹理：背景中的微妙点阵增加设计深度，避免平面单调
- 进度指示条：底部的分段线条作为浏览进度或内容分区指示
- 主题色彩区隔：不同主题采用不同色调区分（金融绿色/科技红色）
- 高对比度文字：浅色文字在深色背景上形成强烈对比，确保可读性

## 内容文案
${text}

## 尺寸要求
${sizeConfig.width}×${sizeConfig.height}px

请生成完整的HTML代码，体现商务专业和资讯权威。

🚨 **重要：直接返回纯HTML代码，绝对不要用markdown或代码块包裹！从<div>直接开始！**
  `;
}

// 3. 流动科技蓝风格提示词生成器
function generateFlowingTechBlueStylePrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `你是一位专业的科技产品视觉设计师，精通现代科技美学和未来感设计。

## 设计风格：流动科技蓝风格
### 设计特征
- 现代简约科技风，以蓝色系#4682b4、#87ceeb为主体色调
- 大量使用蓝白渐变(linear-gradient(135deg, #4682b4 0%, #87ceeb 50%, #f0f8ff 100%))，营造轻盈通透感
- 背景多采用极简白底或浅色调#f0f8ff
- 运用流线型曲线创造动态视觉效果(border-radius: 50% 20% / 10% 40%)
- 圆角矩形作为基础框架(border-radius: 16px)，增加友好感
- 整体布局干净有序，空间感强
- 光影效果柔和(box-shadow: 0 4px 20px rgba(70, 130, 180, 0.15))，营造科技感与未来感

### 文字排版风格
- 标题简洁有力，使用700字重的无衬线字体
- 显著的标题层级对比，主标题42-52px，副标题24-28px
- 中英文混排，增加国际化视觉效果
- 关键信息放大处理，辅助文字精简至16-18px
- 日期、标签等信息排版整齐规范
- 数字与文本搭配得当，注重整体平衡

### 视觉元素风格
- 流动曲线是主要装饰元素，表现科技流动感
- 半透明蓝色波纹或螺旋形状贯穿多个设计
- 几何抽象形状作为点缀（圆环、三角形等）
- 轻量级图标和按钮设计，简洁明了
- 折纸元素（如纸飞机）象征传递与连接
- 光效处理柔和，形成层次感
- 整体视觉元素与科技、数据、信息等主题高度契合

## 内容文案
${text}

## 尺寸要求
${sizeConfig.width}×${sizeConfig.height}px

请生成完整的HTML代码，体现现代科技感和流动美学。

🚨 **重要：直接返回纯HTML代码，绝对不要用markdown或代码块包裹！从<div>直接开始！**
  `;
}

// 4. 极简格栅主义封面风格提示词生成器
function generateMinimalGridMasterPrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `你是一位极简主义设计大师，深谙几何美学和格栅系统设计理论。

## 设计风格：极简格栅主义封面风格
### 设计特征
- 黑白极简风格：以纯黑#000000背景和纯白#ffffff内容区形成鲜明对比
- 强烈的几何感：使用简洁的线条、方框和圆形等基础几何元素
- 网格系统布局：遵循严格的12列网格排版规则，结构清晰有序
- 留白有度：大量留白创造呼吸感，同时保持视觉重心
- 摄影与排版结合：真实场景照片与极简排版形成互补
- 工业风格装饰：细线箭头(border: 1px solid #00ff00)、指示线条等元素增添设计感
- 微妙的色彩点缀：小面积绿色#00ff00等强调色打破黑白单调

### 文字排版风格
- 大胆字号对比：核心标题72-96px极大化处理，形成主视觉
- 几何式分割标题：将主标题分解成独立区块，增强辨识度
- 纵横组合排版：文字既有横排也有竖排，创造韵律感
- 字体粗细对比强烈：主标题采用900字重，副文本则为300字重
- 多层级信息排列：活动名称、日期、宣传语清晰分级
- 严格的文字对齐：所有文字元素依循严格的网格对齐原则
- 中英文混排：英文作为装饰性元素增添国际设计感

### 视觉元素风格
- 裁切的摄影图像：图片经过精心裁切，凸显主题
- 指示性线条：箭头、曲线和直线作为引导性视觉元素
- 框架式强调：使用方框、底色块等元素强调关键信息
- 简洁图形符号：最小化的视觉符号传达核心信息
- 构图对称与不对称并存：整体结构有序但细节处理不拘一格
- 空间层次感：通过元素大小、位置创造前后层次关系
- 数字图形化处理：日期数字被赋予视觉设计感

## 内容文案
${text}

## 尺寸要求
${sizeConfig.width}×${sizeConfig.height}px

请生成完整的HTML代码，体现极简主义和几何美学。

🚨 **重要：直接返回纯HTML代码，绝对不要用markdown或代码块包裹！从<div>直接开始！**
  `;
}

// 5. 数字极简票券风格提示词生成器
function generateDigitalTicketStylePrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个数字极简票券风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🎨 设计风格：数字极简票券风
- 黑白对比主导：高度对比的黑白配色方案，形成强烈视觉冲击
- 票券化布局：类似登机牌、门票或电子凭证的结构设计
- 几何分区明确：画面被精确划分为信息区块，井然有序
- 留白艺术运用：大量有效留白提升整体通透感和优雅度
- 数字界面映射：模拟电子屏幕或应用界面的信息呈现方式

📝 文字排版风格：
- 中英混排对比：中英文字体混合使用，创造文化融合感
- 尺寸层级分明：主标题大号处理，副文本精致小巧
- 多向排列组合：包含横排、竖排、斜排等多方向文字布局
- 间距精确控制：字符间距和行距经过精心计算，保持呼吸感
- 符号化装饰：括号、下划线、箭头融入文字设计

🎯 视觉元素风格：
- 功能性指示符：各类箭头、星号作为视觉引导和强调
- UI元素借鉴："CHECK IN"、"@"等数字界面元素的平面化应用
- 边框与分割线：简洁线条用于区隔不同信息区域
- 简约图形符号：最小化的设计符号传达核心信息
- 负空间利用：将空白区域视为积极设计元素的一部分

内容文案：${text}

请生成完整的HTML代码，体现东西方美学融合和数字界面美学。

🚨 **重要：直接返回纯HTML代码，绝对不要用markdown或代码块包裹！从<div>直接开始！**
  `.trim();
}

// 6. 新构成主义教学风格提示词生成器
function generateConstructivistTeachingPrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个新构成主义教学风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🎨 设计风格：新构成主义教学风
- 黑红白三色系统：以黑白强对比为基调，点缀醒目红色#ff0000形成视觉冲击力
- 网格化精准排版：严谨的网格系统控制整体构图，传达专业设计感
- 学术实验美学：融合学术研究与实验性设计的双重特质
- 日式现代主义：汲取日本设计美学，注重留白与紧凑并存的张力
- 教学图解风格：设计元素同时承载教育功能

📝 文字排版风格：
- 中英双语对照：专业设计术语同时以中英文呈现，增强学术性
- 极端对比字阶：超大号标题与小号解释文字形成强烈视觉节奏
- 多向文字排布：结合横排、竖排和径向排列的文字方向实验
- 标点符号设计化：将问号、括号等符号放大或突出作为视觉元素
- 注释系统完备：学术化的引用、说明和注解系统，增强专业可信度

🎯 视觉元素风格：
- 红线贯穿引导：红色线条作为视觉引导和强调，贯穿整体设计
- 几何形符号系统：三角形、圆点等几何符号作为辅助设计语言
- 教学指示标记：箭头、下划线等元素具有明确的指向性和教育性
- 区块分明信息区：内容被清晰划分为不同信息区块，层次分明
- 签名式认证标记：作者标识，成为设计的权威来源认证

内容文案：${text}

请生成完整的HTML代码，体现学术权威和实验美学。

🚨 **重要：直接返回纯HTML代码，绝对不要用markdown或代码块包裹！从<div>直接开始！**
  `.trim();
}

// 7. 奢华自然意境风格提示词生成器
function generateLuxuryNaturalMoodPrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个奢华自然意境风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🎨 设计风格：奢华自然意境风
- 高级沉稳色调：暗调景观背景配以细腻光影，营造高端内敛氛围
- 意境式呈现：不仅展示实景，更表达一种与自然共融的精神状态
- 奢华隐喻元素：通过构图和文字暗示高端生活方式与品质追求
- 空间层次丰富：通过前景、中景、远景的搭配创造空间深度感
- 东西方美学融合：中式意境与西方现代摄影美学的和谐结合

📝 文字排版风格：
- 悬浮式标题定位：文字悬浮于景观之上，形成虚实对比
- 中西文混合排版：英文与中文标题组合使用，增强国际化气质
- 层级分明的字阶：主标题、副标题和说明文字尺寸差异明显
- 优雅字体选择：英文多用细腻的衬线体，中文选用简约现代字体
- 留白与文字平衡：大面积留白中点缀核心文字，强化重点信息

🎯 视觉元素风格：
- 摄影级光影处理：专业摄影级别的光线捕捉，展现自然光影魅力
- 景深虚化技巧：背景适度虚化，突出主体，增强画面层次感
- 半透明叠加处理：文字与背景间常有微妙的半透明效果
- 隐性品牌符号：品牌元素融入自然场景，不刻意张扬
- 水墨意境渲染：部分元素带有东方水墨画的意境处理

内容文案：${text}

请生成完整的HTML代码，体现奢华内敛和自然意境。

🚨 **重要：直接返回纯HTML代码，绝对不要用markdown或代码块包裹！从<div>直接开始！**
  `.trim();
}

// 8. 新潮工业反叛风格提示词生成器
function generateIndustrialRebellionStylePrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个新潮工业反叛风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🎨 设计风格：新潮工业反叛风
- 黑底强对比美学：纯黑#000000背景配以白色#ffffff和荧光黄#ffff00元素，形成极强视觉冲击力
- 地下文化气质：类似独立音乐海报或前卫艺术展的反主流美学
- 工业印刷风格：模拟工业标识和手册的粗犷实用主义
- 后现代解构主义：打破传统设计规则，强调不规则性与碎片化
- 数字朋克气息：融合数字时代的视觉元素与朋克文化的反抗精神

📝 文字排版风格：
- 巨型中文标题：超大号汉字形成强烈的视觉重心
- 轮廓线英文：英文采用线条勾勒的空心字体，增强现代感
- 多向阅读结构：文字横向、纵向、分散排列，打破常规阅读习惯
- 拆分重组文本：将词语拆解并重新组合排版
- 极端字号对比：从超大到极小的文字尺寸变化，创造丰富层次

🎯 视觉元素风格：
- 线条图形符号：简笔画风格的图形作为核心视觉标识和概念象征
- 星号装饰点缀：使用"*"符号作为点缀元素，增添活力
- 几何框架结构：L形、方块、椭圆等简单几何形状构建画面架构
- 荧光高亮区域：使用荧光黄突出关键内容
- 重复元素韵律：通过元素重复创造视觉节奏和连续性

内容文案：${text}

请生成完整的HTML代码，体现反叛精神和工业美学。

🚨 **重要：直接返回纯HTML代码，绝对不要用markdown或代码块包裹！从<div>直接开始！**
  `.trim();
}

// 9. 软萌知识卡片风格提示词生成器
function generateCuteKnowledgeCardPrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个软萌知识卡片风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🎨 设计风格：软萌知识卡片风
- 柔和色彩基调：以粉色#ffb6c1、米黄#fffacd、淡紫#e6e6fa等温和色调为主，营造轻松友好氛围
- 圆角卡片结构：所有内容采用大圆角矩形或椭圆形容器，没有尖锐边角
- 简约留白处理：适当留白增强可读性，避免视觉拥挤感
- 渐变色背景：部分卡片使用柔和渐变背景，增加层次感和温暖感
- 情感化设计：整体风格偏向亲和、轻松，不过分严肃正式

📝 文字排版风格：
- 大字号标题：标题文字加粗加大，吸引第一眼注意
- 紧凑段落布局：正文内容分段清晰，段落间距适中
- 感叹号点缀：频繁使用感叹号增强情感表达和亲近感
- 表情符号融入：在文字中加入特殊符号增加表现力
- 重点句加粗：关键信息或总结性内容加粗处理
- 自然语言表达：采用口语化、对话式的表达方式，降低阅读门槛

🎯 视觉元素风格：
- Q版表情角色：底部配置可爱的emoji表情或形象，增加亲和力
- 表情丰富多样：使用惊讶、思考、无奈等多种表情，与文本内容情感呼应
- 场景化呈现：如电脑前工作的人物、阅读书本的角色等场景化表达
- 点缀型装饰：适量使用小装饰元素，如笔记本边缘的圆点标记
- 拟人化处理：将抽象概念通过卡通形象拟人化，增强理解和记忆

内容文案：${text}

请生成完整的HTML代码，体现温暖治愈和亲和可爱。

🚨 **重要：直接返回纯HTML代码，绝对不要用markdown或代码块包裹！从<div>直接开始！**
  `.trim();
}

// 10. 商务简约信息卡片风格提示词生成器
function generateBusinessSimpleCleanPrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个商务简约信息卡片风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🎨 设计风格：商务简约信息卡片风
- 极简背景设计：采用浅灰色#f5f5f5或白色#ffffff背景，减少视觉干扰
- 高对比度呈现：黑色#2c3e50文字与浅色背景形成强烈对比，提升可读性
- 方正几何布局：整体结构方正规整，遵循严格的网格系统
- 功能性优先：设计服务于内容传达，摒弃多余装饰元素
- 色块分区设计：通过彩色#27ae60方块标识不同信息点，便于快速识别

📝 文字排版风格：
- 问答式标题结构：以问题开头引发共鸣
- 解决方案副标题：紧随问题后给出简洁有力的解决方案
- 字体层级鲜明：通过明确的字号变化区分标题、副标题和正文
- 短句精炼表达：多用简短有力的句子，以句号结尾，节奏感强
- 加粗重点处理：核心词汇或短语加粗处理，引导视线焦点
- 要点式内容组织：将功能特点和优势以简短条目形式呈现

🎯 视觉元素风格：
- 产品实物展示：在卡片下方放置产品包装实物照片，真实直观
- 功能性图标：如"居家模式"的房屋图标，增强视觉识别度
- 开关按钮元素：采用可交互感的UI组件表现，如模式开关按钮
- 数字编号标识：使用彩色背景数字标记不同要点，提升可读性
- 色彩编码系统：使用绿色、黄色等不同色彩区分不同信息模块
- 简约线条边框：适当使用线条框架划分内容区域，结构清晰

内容文案：${text}

请生成完整的HTML代码，体现功能至上和简约高效。

🚨 **重要：直接返回纯HTML代码，绝对不要用markdown或代码块包裹！从<div>直接开始！**
  `.trim();
}

// 11. 清新插画风信息卡片风格提示词生成器
function generateFreshIllustrationStylePrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个清新插画风信息卡片风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🎨 设计风格：清新插画风信息卡片风
- 马卡龙色系基调：采用淡粉#ffc0cb、薄荷绿#98fb98、浅蓝#87ceeb等低饱和色彩，营造柔和治愈氛围
- 手绘插画主导：以扁平插画替代实景图，人物/植物/物件风格统一且富有童趣
- 不规则布局设计：打破严格网格限制，元素呈自然散落式分布，增加灵动感
- 轻量装饰元素：点缀星星、气泡、光斑等微小图案，增强画面趣味性
- 圆形构图偏好：核心内容用圆形或椭圆形容器承载，视觉焦点集中

📝 文字排版风格：
- 手写字体标题：主标题采用圆润手写字体，搭配卡通符号前缀（如🌸、✨）
- 趣味断行设计：长句拆分为富有节奏的短行，部分词汇用插画元素替代
- 字体混搭对比：标题用手写体，副标题用无衬线体，正文用细体字，层级差异明显
- 关键词图形化：核心数据或概念用彩色插画框标注
- 对话框式引用：用户评价等内容用Speech Bubble对话框呈现，增强互动感
- 文字阴影处理：标题文字添加1px浅色投影，提升立体感但保持轻盈

🎯 视觉元素风格：
- 插画场景叙事：每个卡片围绕一个主题构建微型插画场景
- 动态矢量图标：按钮、导航等交互元素采用可微动的SVG图标
- 渐变色彩点缀：在插画的高光区域添加柔和渐变，增加层次感
- 贴纸式标签设计：促销信息、新品标签等用带阴影的贴纸形式呈现，模拟手账质感
- 植物元素贯穿：蕨类叶片、蒲公英、多肉植物等绿植插画作为通用装饰元素
- 品牌IP形象植入：将品牌吉祥物以小尺寸插画形式融入场景角落

内容文案：${text}

请生成完整的HTML代码，体现清新治愈和插画美学。

🚨 **重要：直接返回纯HTML代码，绝对不要用markdown或代码块包裹！从<div>直接开始！**
  `.trim();
} 