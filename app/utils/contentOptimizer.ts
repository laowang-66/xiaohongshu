/**
 * 内容优化引擎 - 根据平台特性优化封面文案
 */

export interface PlatformConfig {
  name: string;
  key: string;
  dimensions: { width: number; height: number; ratio: string };
  contentRules: {
    maxTitleLength: number;
    maxSubtitleLength?: number;
    preferredKeywords: string[];
    emotionalTone: string;
    contentStructure: string[];
    avoidWords: string[];
  };
  optimizationPrompt: string;
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  xiaohongshu: {
    name: '小红书封面',
    key: 'xiaohongshu',
    dimensions: { width: 900, height: 1200, ratio: '3:4' },
    contentRules: {
      maxTitleLength: 20,
      maxSubtitleLength: 15,
      preferredKeywords: ['种草', '实测', '避坑', '干货', '必看', '真实', '超好用', '姐妹们', '宝子们', '分享'],
      emotionalTone: 'excited_friendly',
      contentStructure: ['主标题', '副标题或关键信息', '情感符号'],
      avoidWords: ['广告', '推广', '代言', '合作']
    },
    optimizationPrompt: `你是小红书内容优化专家。请根据用户输入的内容，生成3个适合小红书封面的标题版本。

小红书封面要求：
1. 主标题不超过20字，要有吸引力和话题性
2. 可以有副标题，不超过15字，补充关键信息
3. 语调要亲切友好，像朋友间的分享
4. 多使用"种草"、"实测"、"避坑"、"干货"等小红书热词
5. 适当使用emoji表情，但不要过多
6. 要能激发用户的好奇心和参与感
7. 避免过于商业化的词汇

请为每个版本提供：
- 主标题
- 副标题（可选）
- 适合的情感标签
- 推荐理由

原始内容：{content}`
  },

  video: {
    name: '短视频封面', 
    key: 'video',
    dimensions: { width: 1080, height: 1920, ratio: '9:16' },
    contentRules: {
      maxTitleLength: 15,
      preferredKeywords: ['震惊', '必看', '爆料', '揭秘', '真相', '秒懂', '绝了', '太牛了', '不看后悔'],
      emotionalTone: 'urgent_dramatic',
      contentStructure: ['超短主标题', '数字或符号突出', '强烈视觉冲击'],
      avoidWords: ['可能', '也许', '据说']
    },
    optimizationPrompt: `你是短视频内容优化专家。请根据用户输入的内容，生成3个适合短视频封面的标题版本。

短视频封面要求：
1. 标题要极其精简，最多15字
2. 要有强烈的视觉冲击力和紧迫感
3. 多使用数字、感叹号等抓眼球元素
4. 语调要有张力，制造悬念或震撼感
5. 适合竖屏显示，字要大而醒目
6. 要能在3秒内抓住用户注意力
7. 可以适度夸张，但不能虚假

请为每个版本提供：
- 超短主标题（≤15字）
- 关键数字或符号突出
- 情感强度评级
- 适用场景说明

原始内容：{content}`
  },

  wechat: {
    name: '公众号封面',
    key: 'wechat', 
    dimensions: { width: 900, height: 268, ratio: '3.35:1' },
    contentRules: {
      maxTitleLength: 30,
      maxSubtitleLength: 20,
      preferredKeywords: ['深度', '分析', '思考', '洞察', '解读', '专业', '权威', '独家', '重磅'],
      emotionalTone: 'professional_authoritative',
      contentStructure: ['主标题', '副标题', '作者或来源标识'],
      avoidWords: ['震惊', '不看后悔', '绝了']
    },
    optimizationPrompt: `你是公众号内容优化专家。请根据用户输入的内容，生成3个适合公众号封面的标题版本。

公众号封面要求：
1. 主标题可以较长，最多30字，要有深度和权威感
2. 副标题不超过20字，补充核心信息
3. 语调要专业、有深度，体现思考价值
4. 适合横版显示，左右布局合理
5. 要体现内容的价值和独特性
6. 避免过于情绪化或哗众取宠
7. 适合职场人士和知识分子阅读

请为每个版本提供：
- 主标题（体现深度和价值）
- 副标题（关键信息补充）
- 内容定位（如：深度分析/行业洞察/专业解读等）
- 目标读者群体

原始内容：{content}`
  }
};

export interface OptimizationResult {
  platform: string;
  originalContent: string;
  optimizedVersions: {
    version: number;
    mainTitle: string;
    subtitle?: string;
    emotionalTone: string;
    reasoning: string;
    confidence: number;
  }[];
  platformInsights: {
    contentType: string;
    recommendedStyle: string;
    keyOptimizations: string[];
  };
}

/**
 * 分析内容类型
 */
export function analyzeContentType(content: string): string {
  const testCases = [
    { keywords: ['教程', '步骤', '方法', '如何', '怎么'], type: '教程指南' },
    { keywords: ['测评', '对比', '实测', '评测', '体验'], type: '产品测评' },
    { keywords: ['分享', '经验', '心得', '感受', '推荐'], type: '经验分享' },
    { keywords: ['揭秘', '真相', '内幕', '爆料', '解密'], type: '揭秘爆料' },
    { keywords: ['攻略', '指南', '清单', '合集', '盘点'], type: '攻略盘点' },
    { keywords: ['思考', '观点', '分析', '解读', '深度'], type: '观点分析' },
    { keywords: ['新闻', '事件', '发生', '最新', '突发'], type: '新闻资讯' },
    { keywords: ['科普', '知识', '原理', '解释', '为什么'], type: '科普知识' }
  ];

  for (const testCase of testCases) {
    if (testCase.keywords.some(keyword => content.includes(keyword))) {
      return testCase.type;
    }
  }
  
  return '综合内容';
}

/**
 * 获取平台配置
 */
export function getPlatformConfig(platformKey: string): PlatformConfig | null {
  return PLATFORM_CONFIGS[platformKey] || null;
}

/**
 * 生成内容优化建议
 */
export function generateOptimizationSuggestions(content: string, platformKey: string): string[] {
  const config = getPlatformConfig(platformKey);
  if (!config) return [];

  const suggestions: string[] = [];
  const contentType = analyzeContentType(content);

  // 基于内容类型的建议
  switch (contentType) {
    case '教程指南':
      suggestions.push(`考虑添加步骤数量，如"3步教你..."、"5分钟学会..."`);
      if (platformKey === 'xiaohongshu') {
        suggestions.push(`使用"超详细"、"手把手"等词汇增加亲切感`);
      }
      break;
    case '产品测评':
      suggestions.push(`突出测评结果，如"真实测评"、"踩雷避坑"`);
      if (platformKey === 'video') {
        suggestions.push(`使用对比数字，如"5款对比"、"性价比第一"`);
      }
      break;
    case '经验分享':
      if (platformKey === 'xiaohongshu') {
        suggestions.push(`加入个人化表达，如"我的亲身经历"、"真心推荐"`);
      }
      break;
  }

  // 基于平台特性的建议
  if (config.contentRules.maxTitleLength < content.length) {
    suggestions.push(`标题过长，建议压缩到${config.contentRules.maxTitleLength}字以内`);
  }

  if (platformKey === 'wechat' && !content.includes('：')) {
    suggestions.push(`建议使用"主标题：副标题"的格式`);
  }

  return suggestions;
} 