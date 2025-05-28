/**
 * Markdown内容分析器 - 将用户输入转换为结构化数据，优化封面生成
 * 通过Markdown语法识别内容结构，提供更精准的设计建议
 */

export interface MarkdownStructure {
  title: string;                    // 主标题（第一个#）
  subtitle?: string;                // 副标题（第一个##）
  headings: {                       // 所有标题
    level: number;                  // 1-6级
    text: string;
    position: number;
  }[];
  emphasis: {                       // 强调内容
    bold: string[];                 // **粗体**
    italic: string[];               // *斜体*
    code: string[];                 // `代码`
    highlights: string[];           // 所有强调内容合并
  };
  lists: {                          // 列表内容
    ordered: string[];              // 有序列表
    unordered: string[];            // 无序列表
    allItems: string[];             // 所有列表项
  };
  quotes: string[];                 // 引用内容
  codeBlocks: {                     // 代码块
    language?: string;
    content: string;
  }[];
  links: {                          // 链接
    text: string;
    url: string;
  }[];
  images: {                         // 图片
    alt: string;
    url: string;
  }[];
  contentType: 'tutorial' | 'review' | 'list' | 'technical' | 'story' | 'general';
  designHints: {                    // 设计建议
    hasStructure: boolean;          // 是否有清晰结构
    emphasizePoints: string[];      // 需要突出的要点
    visualElements: string[];       // 视觉元素建议
    layoutType: 'hierarchical' | 'card' | 'timeline' | 'grid';
  };
}

/**
 * 将普通文本智能转换为Markdown格式
 */
export function convertToMarkdown(text: string): string {
  if (!text) return '';
  
  // 如果已经包含Markdown语法，直接返回
  if (hasMarkdownSyntax(text)) {
    return text;
  }
  
  let markdown = text;
  
  // 1. 识别并转换标题（基于长度、位置、内容特征）
  markdown = convertTitles(markdown);
  
  // 2. 识别并转换列表项
  markdown = convertLists(markdown);
  
  // 3. 识别并转换强调内容
  markdown = convertEmphasis(markdown);
  
  // 4. 识别并转换数字要点
  markdown = convertNumberedPoints(markdown);
  
  // 5. 识别并转换问答格式
  markdown = convertQA(markdown);
  
  return markdown.trim();
}

/**
 * 检查文本是否已包含Markdown语法
 */
function hasMarkdownSyntax(text: string): boolean {
  const markdownPatterns = [
    /^#+\s/m,           // 标题
    /\*\*.*\*\*/,       // 粗体
    /\*.*\*/,           // 斜体
    /^[\s]*[-*+]\s/m,   // 无序列表
    /^\d+\.\s/m,        // 有序列表
    /^>\s/m,            // 引用
    /`.*`/,             // 行内代码
    /```[\s\S]*```/     // 代码块
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * 智能识别并转换标题
 */
function convertTitles(text: string): string {
  const lines = text.split('\n');
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行
    if (!line) {
      processedLines.push('');
      continue;
    }
    
    // 检查是否可能是标题
    if (isPossibleTitle(line, i, lines)) {
      const level = determineTitleLevel(line, i, lines);
      processedLines.push(`${'#'.repeat(level)} ${line}`);
    } else {
      processedLines.push(lines[i]);
    }
  }
  
  return processedLines.join('\n');
}

/**
 * 判断是否可能是标题
 */
function isPossibleTitle(line: string, index: number, allLines: string[]): boolean {
  // 标题特征
  const titleFeatures = [
    line.length < 30,                    // 相对较短
    index === 0,                         // 位于开头
    index < allLines.length * 0.3,      // 位于前30%
    /[？?！!：:]$/.test(line),          // 以标点结尾
    /^[0-9一二三四五六七八九十]+[、.]/.test(line), // 以数字开头
    /[教程指南方法技巧秘诀]/.test(line), // 包含指示性词汇
    line === line.toUpperCase(),         // 全大写
    /^【.*】/.test(line)                 // 带括号
  ];
  
  const score = titleFeatures.filter(Boolean).length;
  return score >= 2;
}

/**
 * 确定标题级别
 */
function determineTitleLevel(line: string, index: number, allLines: string[]): number {
  if (index === 0) return 1;           // 第一行通常是主标题
  if (line.length < 15) return 2;      // 短文本可能是副标题
  if (/^[0-9]+[、.]/.test(line)) return 3; // 数字开头是三级标题
  return 2;                            // 默认二级标题
}

/**
 * 转换列表项
 */
function convertLists(text: string): string {
  const lines = text.split('\n');
  const processedLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 数字开头的列表
    if (/^[0-9]+[、.]/.test(trimmed)) {
      const content = trimmed.replace(/^[0-9]+[、.]\s*/, '');
      processedLines.push(`1. ${content}`);
    }
    // 中文序号
    else if (/^[一二三四五六七八九十]+[、.]/.test(trimmed)) {
      const content = trimmed.replace(/^[一二三四五六七八九十]+[、.]\s*/, '');
      processedLines.push(`1. ${content}`);
    }
    // 其他可能的列表格式
    else if (/^[①②③④⑤⑥⑦⑧⑨⑩]/.test(trimmed)) {
      const content = trimmed.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, '');
      processedLines.push(`1. ${content}`);
    }
    // 以"第一"、"首先"等开头
    else if (/^(第[一二三四五六七八九十]+|首先|其次|然后|最后|另外)[，,、]/.test(trimmed)) {
      processedLines.push(`- ${trimmed}`);
    }
    else {
      processedLines.push(line);
    }
  }
  
  return processedLines.join('\n');
}

/**
 * 转换强调内容
 */
function convertEmphasis(text: string): string {
  // 识别重要关键词并加粗
  const importantPatterns = [
    /([0-9]+)(个|种|款|项|天|分钟|小时|倍|%)/g,
    /(最[好棒佳优]|超[棒好]|神器|必备|推荐)/g,
    /(免费|省钱|便宜|性价比|优惠)/g,
    /(秘诀|技巧|方法|攻略|教程)/g
  ];
  
  let result = text;
  
  for (const pattern of importantPatterns) {
    result = result.replace(pattern, '**$&**');
  }
  
  // 避免重复加粗
  result = result.replace(/\*\*\*\*(.*?)\*\*\*\*/g, '**$1**');
  
  return result;
}

/**
 * 转换数字要点
 */
function convertNumberedPoints(text: string): string {
  // 识别形如"3个技巧"、"5种方法"的模式
  return text.replace(
    /([0-9]+)(个|种|款|项)([^，,。.！!？?]*)/g,
    '**$1$2$3**'
  );
}

/**
 * 转换问答格式
 */
function convertQA(text: string): string {
  const lines = text.split('\n');
  const processedLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 问题格式
    if (/[？?]$/.test(trimmed) && trimmed.length < 50) {
      processedLines.push(`## ${trimmed}`);
    }
    // 答案格式
    else if (/^(答|解答|答案)[：:]/.test(trimmed)) {
      const content = trimmed.replace(/^(答|解答|答案)[：:]\s*/, '');
      processedLines.push(`> ${content}`);
    }
    else {
      processedLines.push(line);
    }
  }
  
  return processedLines.join('\n');
}

/**
 * 解析Markdown结构
 */
export function parseMarkdownStructure(markdown: string): MarkdownStructure {
  const structure: MarkdownStructure = {
    title: '',
    headings: [],
    emphasis: { bold: [], italic: [], code: [], highlights: [] },
    lists: { ordered: [], unordered: [], allItems: [] },
    quotes: [],
    codeBlocks: [],
    links: [],
    images: [],
    contentType: 'general',
    designHints: { hasStructure: false, emphasizePoints: [], visualElements: [], layoutType: 'card' }
  };
  
  // 解析标题
  const headingMatches = markdown.match(/^(#{1,6})\s+(.+)$/gm) || [];
  for (const match of headingMatches) {
    const level = match.match(/^#+/)?.[0].length || 1;
    const text = match.replace(/^#+\s+/, '');
    
    structure.headings.push({
      level,
      text,
      position: markdown.indexOf(match)
    });
    
    if (level === 1 && !structure.title) {
      structure.title = text;
    } else if (level === 2 && !structure.subtitle) {
      structure.subtitle = text;
    }
  }
  
  // 解析强调内容
  structure.emphasis.bold = extractMatches(markdown, /\*\*(.*?)\*\*/g);
  structure.emphasis.italic = extractMatches(markdown, /\*(.*?)\*/g);
  structure.emphasis.code = extractMatches(markdown, /`(.*?)`/g);
  structure.emphasis.highlights = [
    ...structure.emphasis.bold,
    ...structure.emphasis.italic,
    ...structure.emphasis.code
  ];
  
  // 解析列表
  structure.lists.ordered = extractMatches(markdown, /^\d+\.\s+(.+)$/gm);
  structure.lists.unordered = extractMatches(markdown, /^[-*+]\s+(.+)$/gm);
  structure.lists.allItems = [...structure.lists.ordered, ...structure.lists.unordered];
  
  // 解析引用
  structure.quotes = extractMatches(markdown, /^>\s+(.+)$/gm);
  
  // 解析代码块
  const codeBlockMatches = markdown.match(/```(\w+)?\n([\s\S]*?)```/g) || [];
  for (const match of codeBlockMatches) {
    const languageMatch = match.match(/```(\w+)/);
    const contentMatch = match.match(/```(?:\w+)?\n([\s\S]*?)```/);
    
    structure.codeBlocks.push({
      language: languageMatch?.[1],
      content: contentMatch?.[1] || ''
    });
  }
  
  // 解析链接
  const linkMatches = markdown.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  for (const match of linkMatches) {
    const parts = match.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (parts) {
      structure.links.push({ text: parts[1], url: parts[2] });
    }
  }
  
  // 解析图片
  const imageMatches = markdown.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
  for (const match of imageMatches) {
    const parts = match.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (parts) {
      structure.images.push({ alt: parts[1], url: parts[2] });
    }
  }
  
  // 分析内容类型
  structure.contentType = analyzeContentType(structure);
  
  // 生成设计建议
  structure.designHints = generateDesignHints(structure);
  
  return structure;
}

/**
 * 提取正则匹配结果
 */
function extractMatches(text: string, regex: RegExp): string[] {
  const matches: string[] = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      matches.push(match[1]);
    }
  }
  
  return matches;
}

/**
 * 分析内容类型
 */
function analyzeContentType(structure: MarkdownStructure): MarkdownStructure['contentType'] {
  const text = [
    structure.title,
    structure.subtitle || '',
    ...structure.headings.map(h => h.text),
    ...structure.lists.allItems,
    ...structure.emphasis.highlights
  ].join(' ').toLowerCase();
  
  if (structure.lists.ordered.length > 2 || /教程|步骤|方法|如何/.test(text)) {
    return 'tutorial';
  }
  
  if (structure.codeBlocks.length > 0 || /技术|代码|程序|API/.test(text)) {
    return 'technical';
  }
  
  if (/测评|评测|体验|对比|推荐/.test(text)) {
    return 'review';
  }
  
  if (structure.lists.allItems.length > 3 || /清单|列表|盘点|合集/.test(text)) {
    return 'list';
  }
  
  if (structure.quotes.length > 0 || /故事|经历|分享|感受/.test(text)) {
    return 'story';
  }
  
  return 'general';
}

/**
 * 生成设计建议
 */
function generateDesignHints(structure: MarkdownStructure): MarkdownStructure['designHints'] {
  const hasStructure = structure.headings.length > 1 || structure.lists.allItems.length > 2;
  
  const emphasizePoints = [
    ...structure.emphasis.bold,
    ...structure.headings.filter(h => h.level <= 2).map(h => h.text)
  ].slice(0, 3);
  
  const visualElements: string[] = [];
  
  if (structure.lists.allItems.length > 0) {
    visualElements.push('列表图标', '要点突出');
  }
  
  if (structure.emphasis.highlights.length > 3) {
    visualElements.push('重点标记', '色彩强调');
  }
  
  if (structure.codeBlocks.length > 0) {
    visualElements.push('代码风格', '技术感');
  }
  
  if (structure.quotes.length > 0) {
    visualElements.push('引用样式', '人文感');
  }
  
  // 确定布局类型
  let layoutType: MarkdownStructure['designHints']['layoutType'] = 'card';
  
  if (structure.headings.length > 3) {
    layoutType = 'hierarchical';
  } else if (structure.lists.allItems.length > 4) {
    layoutType = 'grid';
  } else if (structure.contentType === 'tutorial') {
    layoutType = 'timeline';
  }
  
  return {
    hasStructure,
    emphasizePoints,
    visualElements,
    layoutType
  };
}

/**
 * 基于Markdown结构优化封面内容
 */
export interface OptimizedCoverContent {
  title: string;
  subtitle?: string;
  highlights: string[];
  visualElements: string[];
  layoutSuggestion: string;
  colorScheme: string;
  templateRecommendation: string;
}

export function optimizeCoverContent(structure: MarkdownStructure): OptimizedCoverContent {
  // 优化标题
  let title = structure.title || structure.headings[0]?.text || '内容分享';
  if (title.length > 20) {
    title = title.substring(0, 17) + '...';
  }
  
  // 选择副标题
  const subtitle = structure.subtitle || 
                  (structure.emphasis.bold.length > 0 ? structure.emphasis.bold[0] : undefined);
  
  // 提取重点
  const highlights = structure.designHints.emphasizePoints;
  
  // 视觉元素建议
  const visualElements = structure.designHints.visualElements;
  
  // 布局建议
  const layoutSuggestion = getLayoutSuggestion(structure);
  
  // 配色方案
  const colorScheme = getColorScheme(structure);
  
  // 模板推荐
  const templateRecommendation = getTemplateRecommendation(structure);
  
  return {
    title,
    subtitle,
    highlights,
    visualElements,
    layoutSuggestion,
    colorScheme,
    templateRecommendation
  };
}

function getLayoutSuggestion(structure: MarkdownStructure): string {
  switch (structure.designHints.layoutType) {
    case 'hierarchical':
      return '层次化布局，突出标题层级';
    case 'grid':
      return '网格布局，展示多个要点';
    case 'timeline':
      return '时间线布局，展示步骤流程';
    default:
      return '卡片布局，简洁清爽';
  }
}

function getColorScheme(structure: MarkdownStructure): string {
  switch (structure.contentType) {
    case 'technical':
      return '科技蓝配色，体现专业感';
    case 'tutorial':
      return '渐变色彩，体现学习氛围';
    case 'review':
      return '对比色彩，突出评测结果';
    case 'story':
      return '温暖色调，营造情感共鸣';
    default:
      return '清新配色，通用性强';
  }
}

function getTemplateRecommendation(structure: MarkdownStructure): string {
  if (structure.codeBlocks.length > 0) {
    return 'tech_cyber_neon';
  }
  
  if (structure.contentType === 'tutorial') {
    return 'vibrant_3d_card';
  }
  
  if (structure.contentType === 'review') {
    return 'elegant_serif_magazine';
  }
  
  if (structure.contentType === 'story') {
    return 'warm_story_telling';
  }
  
  if (structure.lists.allItems.length > 3) {
    return 'nature_organic_flow';
  }
  
  return 'premium_glass_morphism';
} 