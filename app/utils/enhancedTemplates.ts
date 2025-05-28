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
  colorPalette: string[];
  features: string[];
  contentRules: {
    titleMaxLength: number;
    subtitleMaxLength: number;
    optimalWordCount: number;
    layoutType: 'card' | 'full' | 'split' | 'overlay';
    designPrinciples: string[];
  };
}

// 新增精美模板系统
export const ENHANCED_TEMPLATES: EnhancedTemplate[] = [
  {
    key: 'premium_glass_morphism',
    name: '高端玻璃质感',
    description: '磨砂玻璃效果配合高级渐变，适合高端品牌和奢华内容',
    category: '高端奢华',
    preview: '💎✨',
    colorPalette: ['#667eea', '#764ba2', 'rgba(255,255,255,0.1)', '#1a1a2e'],
    features: ['玻璃质感', '高级渐变', '精致阴影', '优雅字体', '层次丰富'],
    contentRules: {
      titleMaxLength: 18,
      subtitleMaxLength: 12,
      optimalWordCount: 25,
      layoutType: 'card',
      designPrinciples: ['极简主义', '高端质感', '精致细节', '品牌调性']
    },
    getPrompt: (sizeConfig, text) => generatePremiumGlassMorphismPrompt(sizeConfig, text)
  },
  {
    key: 'vibrant_3d_card',
    name: '活力3D卡片',
    description: '3D立体效果配合鲜活色彩，适合年轻时尚和潮流内容',
    category: '年轻潮流',
    preview: '🎨🎪',
    colorPalette: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57'],
    features: ['3D立体', '活力色彩', '动感元素', '年轻字体', '潮流设计'],
    contentRules: {
      titleMaxLength: 20,
      subtitleMaxLength: 15,
      optimalWordCount: 30,
      layoutType: 'card',
      designPrinciples: ['活力四射', '年轻态度', '潮流元素', '情感共鸣']
    },
    getPrompt: (sizeConfig, text) => generateVibrant3DCardPrompt(sizeConfig, text)
  },
  {
    key: 'elegant_serif_magazine',
    name: '优雅杂志风',
    description: '经典杂志排版风格，适合深度内容和专业文章',
    category: '专业经典',
    preview: '📖✒️',
    colorPalette: ['#2c3e50', '#34495e', '#ecf0f1', '#e74c3c'],
    features: ['杂志排版', '经典字体', '专业布局', '阅读友好', '权威感'],
    contentRules: {
      titleMaxLength: 25,
      subtitleMaxLength: 20,
      optimalWordCount: 40,
      layoutType: 'split',
      designPrinciples: ['专业权威', '阅读体验', '信息层次', '经典美感']
    },
    getPrompt: (sizeConfig, text) => generateElegantSerifMagazinePrompt(sizeConfig, text)
  },
  {
    key: 'nature_organic_flow',
    name: '自然有机流动',
    description: '自然流动的曲线和有机形状，适合生活方式和健康内容',
    category: '自然生活',
    preview: '🌿🌊',
    colorPalette: ['#27ae60', '#2ecc71', '#a8e6cf', '#f8fff8'],
    features: ['有机曲线', '自然质感', '流动元素', '舒适色彩', '生态友好'],
    contentRules: {
      titleMaxLength: 22,
      subtitleMaxLength: 16,
      optimalWordCount: 35,
      layoutType: 'overlay',
      designPrinciples: ['自然和谐', '有机美学', '生活态度', '健康理念']
    },
    getPrompt: (sizeConfig, text) => generateNatureOrganicFlowPrompt(sizeConfig, text)
  },
  {
    key: 'tech_cyber_neon',
    name: '科技赛博霓虹',
    description: '未来科技感配合霓虹发光效果，适合科技和创新内容',
    category: '未来科技',
    preview: '🔮⚡',
    colorPalette: ['#0f3460', '#16213e', '#00d2ff', '#ff0080'],
    features: ['霓虹发光', '科技线条', '未来感', '酷炫效果', '创新设计'],
    contentRules: {
      titleMaxLength: 16,
      subtitleMaxLength: 12,
      optimalWordCount: 25,
      layoutType: 'full',
      designPrinciples: ['未来科技', '创新思维', '酷炫视觉', '前沿感']
    },
    getPrompt: (sizeConfig, text) => generateTechCyberNeonPrompt(sizeConfig, text)
  },
  {
    key: 'warm_story_telling',
    name: '温暖故事叙述',
    description: '温暖的色彩和故事化的布局，适合个人分享和情感内容',
    category: '温暖情感',
    preview: '🌅📚',
    colorPalette: ['#f39c12', '#e67e22', '#f4d03f', '#fef9e7'],
    features: ['温暖色调', '故事布局', '情感表达', '亲和字体', '人文关怀'],
    contentRules: {
      titleMaxLength: 24,
      subtitleMaxLength: 18,
      optimalWordCount: 38,
      layoutType: 'split',
      designPrinciples: ['情感共鸣', '人文关怀', '故事性', '温暖治愈']
    },
    getPrompt: (sizeConfig, text) => generateWarmStoryTellingPrompt(sizeConfig, text)
  }
];

// 高端玻璃质感模板提示词 - 增强版
function generatePremiumGlassMorphismPrompt(sizeConfig: any, text: string): string {
  // 先转换为Markdown并分析结构
  const markdown = convertToMarkdown(text);
  const structure = parseMarkdownStructure(markdown);
  const optimized = optimizeCoverContent(structure);
  
  const contentAnalysis = analyzeContentInDepth(text);
  const smartPrompt = generateSmartOptimizationPrompt(text, sizeConfig.key);
  
  return `
请创建一个高端玻璃质感风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🎨 设计理念：奢华精致 + 现代科技
基于Markdown结构分析：
- 主标题：${optimized.title}
- 副标题：${optimized.subtitle || ''}
- 重点突出：${optimized.highlights.join(', ')}
- 内容类型：${structure.contentType}
- 布局建议：${optimized.layoutSuggestion}

传统内容分析：
- 核心价值：${contentAnalysis.coreValue}
- 关键词组合：${contentAnalysis.keywordPairs.join(', ')}
- 情感触发：${contentAnalysis.emotionalHooks.join(', ')}

💎 玻璃质感要求：
- 背景：深色渐变（#667eea 到 #764ba2）配合光效
- 主卡片：backdrop-filter: blur(20px) + rgba(255,255,255,0.1)
- 边框：1px solid rgba(255,255,255,0.2)
- 阴影：多层次阴影效果增强立体感
- 装饰：抽象几何光影元素

📐 结构化布局标准（基于Markdown分析）：
${structure.headings.length > 1 ? `
- 层次化标题：主标题 ${optimized.title}（48-58px）
- 副标题层级：${structure.headings.map(h => `${'#'.repeat(h.level)} ${h.text}`).join(', ')}
` : `
- 主标题：居中展示，${optimized.title}，字号48-58px，font-weight: 700
- 副标题：字号24-28px，opacity: 0.9
`}
- 内容卡片：80%宽度居中，圆角16px
- 边距：上下60px，左右40px

${structure.lists.allItems.length > 0 ? `
🎯 要点展示（基于列表结构）：
${structure.lists.allItems.map((item, index) => `- 要点${index + 1}：${item}`).join('\n')}
` : ''}

${structure.emphasis.highlights.length > 0 ? `
⭐ 重点强调元素：
${structure.emphasis.highlights.map(highlight => `- **${highlight}**`).join('\n')}
` : ''}

🌟 视觉细节：
- 文字颜色：主标题 #ffffff，副标题 #f8f9fa
- 强调元素：使用渐变文字效果突出重点内容
- 微交互：轻微的transform和过渡效果暗示
- 质感纹理：细微的噪点或纹理增强质感
- 视觉元素：${optimized.visualElements.join(', ')}

原始内容：${text}
结构化Markdown：
${markdown}

请生成完整的HTML代码，体现高端奢华的品牌调性和精致的设计品质，同时充分利用内容的结构化信息。
  `.trim();
}

// 活力3D卡片模板提示词 - 增强版
function generateVibrant3DCardPrompt(sizeConfig: any, text: string): string {
  const markdown = convertToMarkdown(text);
  const structure = parseMarkdownStructure(markdown);
  const optimized = optimizeCoverContent(structure);
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个活力3D卡片风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🎪 设计理念：青春活力 + 立体动感
基于Markdown结构分析：
- 优化标题：${optimized.title}
- 内容类型：${structure.contentType}
- 布局类型：${structure.designHints.layoutType}
- 重点要素：${optimized.highlights.join(', ')}

传统分析补充：
- 核心价值：${contentAnalysis.coreValue}
- 目标卖点：${contentAnalysis.targetPoints.join(', ')}

🎨 3D视觉效果：
- 背景：鲜活渐变 + 3D几何形状装饰
- 主卡片：transform: perspective(1000px) rotateX(5deg) rotateY(5deg)
- 立体阴影：box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 15px 25px rgba(0,0,0,0.08)
- 悬浮效果：多层卡片叠加创造景深
- 动感元素：波浪线、几何图形、色彩斑点

${structure.designHints.layoutType === 'timeline' ? `
📅 时间线布局（检测到教程步骤）：
${structure.lists.ordered.map((item, index) => `步骤${index + 1}：${item}`).join('\n')}
` : structure.designHints.layoutType === 'grid' ? `
🔲 网格布局（检测到多要点内容）：
${structure.lists.allItems.slice(0, 6).map((item, index) => `项目${index + 1}：${item}`).join('\n')}
` : ''}

🌈 色彩搭配：
- 主色调：#ff6b6b (活力红) #4ecdc4 (青春蓝)
- 辅助色：#45b7d1 (天空蓝) #feca57 (阳光黄)
- 文字色：#2c3e50 (深灰) #ffffff (强调)

📝 智能排版设计：
- 主标题：${optimized.title}，45-55px，加粗，可使用彩色渐变
- 副标题：${optimized.subtitle || '智能提取副标题'}，22-26px，活泼字体
- 装饰元素：emoji表情、几何图案、动感线条
- 布局：${optimized.layoutSuggestion}

${structure.emphasis.bold.length > 0 ? `
💪 粗体强调内容：
${structure.emphasis.bold.map(bold => `**${bold}**`).join(', ')}
` : ''}

原始内容：${text}
结构化内容：
${markdown}

请生成充满青春活力和立体感的HTML设计代码，充分体现内容的结构层次。
  `.trim();
}

// 优雅杂志风模板提示词 - 增强版
function generateElegantSerifMagazinePrompt(sizeConfig: any, text: string): string {
  const markdown = convertToMarkdown(text);
  const structure = parseMarkdownStructure(markdown);
  const optimized = optimizeCoverContent(structure);
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个优雅杂志风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

📖 设计理念：经典权威 + 专业品质
基于Markdown深度分析：
- 主标题：${optimized.title}
- 副标题：${optimized.subtitle || ''}
- 文章结构：${structure.headings.length}个层级标题
- 内容性质：${structure.contentType === 'technical' ? '技术专业' : structure.contentType === 'review' ? '评测分析' : '深度内容'}

传统内容分析：
- 核心价值：${contentAnalysis.coreValue}
- 内容结构：${JSON.stringify(contentAnalysis.contentStructure)}

✒️ 杂志排版标准：
- 字体选择：serif字体体现权威感，sans-serif辅助
- 主标题：${optimized.title}，Georgia或Times，50-60px，font-weight: 700
- 副标题：${optimized.subtitle || '智能生成'}，Helvetica或Arial，28-32px，font-weight: 400
- 正文：18-20px，行高1.6，阅读友好

📐 经典杂志布局：
${structure.headings.length > 2 ? `
- 层次化标题系统：
${structure.headings.map(h => `  ${h.level}级: ${h.text}`).join('\n')}
` : `
- 分栏设计：2/3主内容区 + 1/3装饰区
`}
- 网格系统：严格的对齐和比例关系
- 留白艺术：充足的空间感
- 层次感：通过字号、颜色、间距创造

${structure.quotes.length > 0 ? `
💬 引用内容突出：
${structure.quotes.map(quote => `"${quote}"`).join('\n')}
` : ''}

🎨 专业配色：
- 主色：#2c3e50 (专业深蓝)
- 辅色：#34495e (中性灰蓝)
- 背景：#ecf0f1 (优雅浅灰)
- 强调：#e74c3c (经典红)

📑 杂志元素：
- 装饰线条：细线分隔和装饰
- 标题装饰：下划线或侧边装饰条
- 页面编号：角落的细节元素
- 专业标识：品质印章或认证标记
- 内容分类：${structure.contentType}专栏标识

原始内容：${text}
Markdown结构：
${markdown}

请生成体现专业权威和经典美感的杂志风格HTML代码，充分利用内容的层次结构。
  `.trim();
}

// 科技赛博霓虹模板提示词 - 增强版
function generateTechCyberNeonPrompt(sizeConfig: any, text: string): string {
  const markdown = convertToMarkdown(text);
  const structure = parseMarkdownStructure(markdown);
  const optimized = optimizeCoverContent(structure);
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个科技赛博霓虹风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🔮 设计理念：未来科技 + 霓虹美学
基于Markdown技术分析：
- 标题：${optimized.title}
- 技术特征：${structure.codeBlocks.length > 0 ? '包含代码块' : '技术概念'}
- 重点内容：${optimized.highlights.join(', ')}
- 结构类型：${structure.designHints.layoutType}

${structure.codeBlocks.length > 0 ? `
💻 代码块检测：
${structure.codeBlocks.map((block, index) => `代码片段${index + 1}${block.language ? ` (${block.language})` : ''}`).join('\n')}
` : ''}

传统分析：
- 核心价值：${contentAnalysis.coreValue}
- 情感触发：${contentAnalysis.emotionalHooks.join(', ')}

⚡ 霓虹发光系统：
- 背景：深色科技感 (#0f3460 到 #16213e)
- 霓虹色：#00d2ff (电蓝) #ff0080 (霓虹粉) #00ff88 (数码绿)
- 发光效果：text-shadow和box-shadow多层叠加
- 扫描线：动态扫描线效果增强科技感
- 故障风格：轻微的color offset和distortion

🤖 科技元素：
- 几何线条：精确的数字化线条和网格
- 数据流：抽象的数据传输视觉
- 电路图案：简化的电路板装饰
- 全息效果：透明叠加层模拟全息投影
- 代码美学：等宽字体和代码风格元素

${structure.emphasis.code.length > 0 ? `
🔤 代码风格文字：
${structure.emphasis.code.map(code => `\`${code}\``).join(', ')}
` : ''}

🌌 未来布局（基于${structure.designHints.layoutType}）：
- 非对称设计：打破传统布局规则
- 浮动元素：悬浮的信息模块
- 透明层叠：多层信息的立体展示
- 动感暗示：暗示动态和交互的设计

🎯 赛博文字：
- 主标题：${optimized.title}，等宽或未来感字体，40-50px
- 发光文字：强烈的霓虹发光效果
- 数字强调：突出数字和关键数据
- 代码风格：部分文字采用代码美学

原始内容：${text}
技术结构：
${markdown}

请生成充满未来科技感和霓虹美学的HTML设计代码，突出技术内容的专业性。
  `.trim();
}

// 自然有机流动模板提示词
function generateNatureOrganicFlowPrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个自然有机流动风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🌿 设计理念：自然和谐 + 有机美学
基于内容分析：
- 核心价值：${contentAnalysis.coreValue}
- 关键词组合：${contentAnalysis.keywordPairs.join(', ')}

🌊 有机流动元素：
- 背景：自然渐变 + 有机曲线装饰
- 形状：圆润曲线替代尖锐直角
- 流动效果：波浪线、水波纹、云朵形状
- 自然纹理：叶子、水滴、阳光光斑
- 层次叠加：多层透明度创造深度

🍃 自然色彩：
- 主绿色：#27ae60 #2ecc71 (生命力)
- 辅助色：#a8e6cf (清新薄荷) #f8fff8 (纯净白)
- 装饰色：#f39c12 (阳光金) #3498db (天空蓝)

📐 有机布局：
- 非标准网格：跟随自然流动的布局
- 文字环绕：内容围绕有机形状排列
- 呼吸感：充分的留白模拟自然空间
- 视觉引导：曲线引导用户视线流动

🌸 自然装饰：
- 植物元素：抽象化的叶子、花朵、枝条
- 光影效果：自然光线的模拟
- 质感细节：自然材质的暗示
- 生态符号：环保和可持续的视觉元素

内容文案：${text}

请生成体现自然和谐与有机美学的HTML设计代码。
  `.trim();
}

// 温暖故事叙述模板提示词
function generateWarmStoryTellingPrompt(sizeConfig: any, text: string): string {
  const contentAnalysis = analyzeContentInDepth(text);
  
  return `
请创建一个温暖故事叙述风格的封面设计，尺寸：${sizeConfig.width}×${sizeConfig.height}px

🌅 设计理念：温暖治愈 + 故事情怀
基于内容分析：
- 核心价值：${contentAnalysis.coreValue}
- 内容结构：${JSON.stringify(contentAnalysis.contentStructure)}

📚 故事化布局：
- 分层叙述：上中下三段式故事结构
- 情感节奏：通过视觉元素控制阅读节奏
- 温暖包围：内容被温暖元素环绕
- 人文关怀：体现人与人之间的连接

🌻 温暖色彩系统：
- 主暖色：#f39c12 (温暖橙) #e67e22 (舒适棕)
- 辅助色：#f4d03f (柔和黄) #fef9e7 (温润白)
- 情感色：#e74c3c (温暖红) #3498db (信任蓝)

💕 情感设计元素：
- 圆润形状：温和的圆角和曲线
- 手绘感：略带手工质感的元素
- 生活细节：日常生活的温暖符号
- 情感符号：心形、拥抱、微笑等暖意元素

📖 叙述性排版：
- 标题：像书籍标题般的温雅字体
- 正文：易读的人文字体，行距宽松
- 装饰：装饰性的分隔线和ornament
- 层次：温和的对比度不刺眼

🏠 温馨装饰：
- 生活元素：咖啡杯、书本、植物等
- 光影效果：温暖的自然光线
- 质感细节：纸张、布料等温暖材质
- 人文符号：体现关爱和温暖的图案

内容文案：${text}

请生成充满温暖治愈感和故事情怀的HTML设计代码。
  `.trim();
}

// 智能模板推荐系统 - 增强版
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