/**
 * 智能内容优化引擎 - 专注于提升内容吸引力
 * 基于爆款案例分析、用户心理学和平台算法偏好
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
  attractionTactics: AttractionTactic[];
}

export interface AttractionTactic {
  name: string;
  description: string;
  keywords: string[];
  effectiveness: number; // 0-1
  examples: string[];
}

// 基于真实爆款案例的吸引力策略
const ATTRACTION_TACTICS: Record<string, AttractionTactic[]> = {
  xiaohongshu: [
    {
      name: '数字冲击',
      description: '使用具体数字制造视觉冲击',
      keywords: ['天', '块', '倍', '万', '次', '年', '分钟'],
      effectiveness: 0.9,
      examples: ['7天瘦10斤', '30块买到大牌质感', '3分钟学会']
    },
    {
      name: '身份认同',
      description: '创造目标群体的身份认同感',
      keywords: ['学生党', '上班族', '宝妈', '姐妹们', '集美', '打工人'],
      effectiveness: 0.85,
      examples: ['学生党必看', '上班族救星', '宝妈实测有效']
    },
    {
      name: '紧迫感制造',
      description: '营造稀缺性和紧迫感',
      keywords: ['最后', '限时', '错过', '马上', '立刻', '赶紧'],
      effectiveness: 0.8,
      examples: ['最后3天', '错过等一年', '马上收藏']
    },
    {
      name: '反差对比',
      description: '通过前后对比制造反差感',
      keywords: ['之前vs现在', '便宜vs贵', '国产vs进口', '学生vs白领'],
      effectiveness: 0.88,
      examples: ['花200=花2000的效果', '学生价享受贵妇待遇']
    },
    {
      name: '情感共鸣',
      description: '触发强烈的情感共鸣',
      keywords: ['心疼', '感动', '扎心', '太真实', 'emo', '破防'],
      effectiveness: 0.82,
      examples: ['看完心疼了', '太扎心了', '破防了姐妹们']
    },
    {
      name: '秘密揭露',
      description: '满足用户的窥探欲和好奇心',
      keywords: ['内幕', '秘密', '不敢说', '终于', '真相', '爆料'],
      effectiveness: 0.86,
      examples: ['品牌不敢说的秘密', '终于有人说出真相']
    }
  ],
  video: [
    {
      name: '震撼开场',
      description: '3秒内抓住注意力',
      keywords: ['震惊', '绝了', '疯了', '炸了', '逆天', '离谱'],
      effectiveness: 0.92,
      examples: ['绝了！这也太离谱', '震惊！竟然还能这样']
    },
    {
      name: '悬念设置',
      description: '制造强烈的悬念感',
      keywords: ['结果', '最后', '没想到', '竟然', '居然', '万万没想到'],
      effectiveness: 0.89,
      examples: ['结果万万没想到', '最后一秒惊呆了']
    },
    {
      name: '极值表达',
      description: '使用极限词汇增强冲击',
      keywords: ['史上最', '全网最', '世界第一', '前所未有', '史无前例'],
      effectiveness: 0.85,
      examples: ['史上最离谱', '全网最强攻略']
    }
  ],
  wechat: [
    {
      name: '权威背书',
      description: '建立专业权威感',
      keywords: ['专家', '研究', '数据', '报告', '权威', '官方'],
      effectiveness: 0.78,
      examples: ['专家研究发现', '权威数据显示']
    },
    {
      name: '深度思考',
      description: '体现思辨价值',
      keywords: ['深度', '思考', '洞察', '解析', '透视', '反思'],
      effectiveness: 0.82,
      examples: ['深度解析', '独家洞察']
    },
    {
      name: '趋势预判',
      description: '展现前瞻性和价值感',
      keywords: ['趋势', '未来', '预测', '风口', '机遇', '变化'],
      effectiveness: 0.8,
      examples: ['2024年新趋势', '把握时代机遇']
    }
  ]
};

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
    attractionTactics: ATTRACTION_TACTICS.xiaohongshu,
    optimizationPrompt: `你是小红书爆款内容专家，分析过10万+高点击量封面。请根据用户内容生成3个超具吸引力的标题版本。

## 核心要求：
1. 每个标题都要有明确的吸引力策略（数字冲击、身份认同、反差对比等）
2. 主标题12-20字，要在2秒内抓住眼球
3. 副标题8-15字，强化核心卖点
4. 必须包含情感触发词，让用户产生"点击冲动"

## 吸引力公式：
- 数字化表达：具体数字比模糊表达效果高300%
- 身份标签：精准定位目标群体
- 情感共鸣：触发用户内心痛点或欲望
- 稀缺紧迫：制造FOMO（错失恐惧）心理
- 反差冲击：违背常识或超出预期

## 请为每个版本详细说明：
- 采用的吸引力策略
- 目标用户心理分析
- 预期点击诱因
- 情感触发机制

原始内容：{content}

请严格按照以下格式输出：

版本1：
主标题：[标题内容]
副标题：[副标题内容]
吸引力策略：[使用的策略名称]
心理分析：[目标用户心理]
情感触发：[触发的情感]

版本2：
[同上格式]

版本3：
[同上格式]`
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
    attractionTactics: ATTRACTION_TACTICS.video,
    optimizationPrompt: `你是短视频爆款专家，研究过千万播放量视频的封面规律。请生成3个极具爆点的短视频标题。

## 3秒法则：
用户只会给你3秒决定是否观看，标题必须在3秒内：
1. 制造强烈视觉冲击
2. 激发极度好奇心
3. 触发情感共鸣

## 爆款公式：
- 震撼开场：用极限词汇制造冲击
- 悬念钩子：让用户"不看不舒服"
- 数字魔法：具体数字增强可信度
- 情绪放大：将情绪推到极致

## 输出要求：
- 标题≤15字，每个字都有存在价值
- 必须包含强情感词汇
- 要有明确的"看点"预期

原始内容：{content}

请按格式输出：

版本1：
标题：[≤15字]
情绪强度：[1-10分]
核心钩子：[吸引点]
预期效果：[用户反应]

版本2：
[同上格式]

版本3：
[同上格式]`
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
    attractionTactics: ATTRACTION_TACTICS.wechat,
    optimizationPrompt: `你是公众号内容专家，擅长创作高转发、高收藏的深度内容标题。请生成3个有深度且具吸引力的标题。

## 公众号用户画像：
- 追求有价值的深度内容
- 希望获得认知升级
- 愿意花时间阅读长文
- 重视权威性和专业度

## 吸引力策略：
- 权威背书：建立可信度
- 价值承诺：明确阅读收益
- 认知冲突：挑战固有认知
- 趋势洞察：提供前瞻价值

## 输出要求：
- 主标题体现深度和价值
- 副标题补充关键信息
- 避免哗众取宠，保持专业调性

原始内容：{content}

请按格式输出：

版本1：
主标题：[体现核心价值]
副标题：[关键信息补充]
价值定位：[读者收益]
目标人群：[精准用户]

版本2：
[同上格式]

版本3：
[同上格式]`
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
    attractionScore: number; // 新增：吸引力评分
    strategy: string; // 新增：使用的策略
    targetEmotion: string; // 新增：目标情感
  }[];
  platformInsights: {
    contentType: string;
    recommendedStyle: string;
    keyOptimizations: string[];
    attractionAnalysis: {
      currentScore: number;
      improvementPotential: number;
      keyWeaknesses: string[];
      strengthAreas: string[];
    };
  };
}

/**
 * 智能内容吸引力分析
 */
export function analyzeContentAttraction(content: string, platform: string): {
  currentScore: number;
  improvementPotential: number;
  keyWeaknesses: string[];
  strengthAreas: string[];
} {
  const config = getPlatformConfig(platform);
  if (!config) {
    return {
      currentScore: 50,
      improvementPotential: 30,
      keyWeaknesses: ['平台配置未找到'],
      strengthAreas: []
    };
  }

  let score = 0;
  const weaknesses: string[] = [];
  const strengths: string[] = [];
  
  // 检查字数合适性
  if (content.length <= config.contentRules.maxTitleLength) {
    score += 15;
    strengths.push('标题长度合适');
  } else {
    weaknesses.push('标题过长，影响阅读');
  }
  
  // 检查数字使用
  const hasNumbers = /\d+/.test(content);
  if (hasNumbers) {
    score += 20;
    strengths.push('包含具体数字，增强可信度');
  } else {
    weaknesses.push('缺少具体数字，说服力不足');
  }
  
  // 检查情感词汇
  const emotionalWords = ['震惊', '绝了', '太牛', '心疼', '感动', '扎心', '破防', '必看', '真实', '超好用'];
  const hasEmotion = emotionalWords.some(word => content.includes(word));
  if (hasEmotion) {
    score += 25;
    strengths.push('包含情感触发词');
  } else {
    weaknesses.push('缺少情感触发词，吸引力不足');
  }
  
  // 检查平台特色词汇
  const platformWords = config.contentRules.preferredKeywords;
  const hasPlatformWords = platformWords.some(word => content.includes(word));
  if (hasPlatformWords) {
    score += 20;
    strengths.push('符合平台特色');
  } else {
    weaknesses.push('未使用平台热词');
  }
  
  // 检查吸引力策略
  const tactics = config.attractionTactics;
  let hasStrategy = false;
  for (const tactic of tactics) {
    if (tactic.keywords.some(keyword => content.includes(keyword))) {
      score += 20;
      strengths.push(`使用了"${tactic.name}"策略`);
      hasStrategy = true;
      break;
    }
  }
  
  if (!hasStrategy) {
    weaknesses.push('未使用有效的吸引力策略');
  }
  
  const improvementPotential = Math.min(100 - score, 50);
  
  return {
    currentScore: Math.min(score, 100),
    improvementPotential,
    keyWeaknesses: weaknesses,
    strengthAreas: strengths
  };
}

/**
 * 分析内容类型（更精准的分类）
 */
export function analyzeContentType(content: string): string {
  const categories = [
    { keywords: ['教程', '步骤', '方法', '如何', '怎么', '学会', '掌握'], type: '教程指南', weight: 3 },
    { keywords: ['测评', '对比', '实测', '评测', '体验', '试用'], type: '产品测评', weight: 3 },
    { keywords: ['分享', '经验', '心得', '感受', '推荐', '种草'], type: '经验分享', weight: 2 },
    { keywords: ['揭秘', '真相', '内幕', '爆料', '解密', '秘密'], type: '揭秘爆料', weight: 4 },
    { keywords: ['攻略', '指南', '清单', '合集', '盘点', '总结'], type: '攻略盘点', weight: 2 },
    { keywords: ['避坑', '踩雷', '注意', '警惕', '千万别'], type: '避坑提醒', weight: 3 },
    { keywords: ['变化', '对比', '之前', '现在', 'vs'], type: '前后对比', weight: 4 }
  ];

  let maxScore = 0;
  let resultType = '综合内容';
  
  for (const category of categories) {
    const matches = category.keywords.filter(keyword => content.includes(keyword)).length;
    const score = matches * category.weight;
    
    if (score > maxScore) {
      maxScore = score;
      resultType = category.type;
    }
  }
  
  return resultType;
}

/**
 * 获取平台配置
 */
export function getPlatformConfig(platformKey: string): PlatformConfig | null {
  return PLATFORM_CONFIGS[platformKey] || null;
}

/**
 * 生成基于吸引力分析的优化建议
 */
export function generateOptimizationSuggestions(content: string, platformKey: string): string[] {
  const config = getPlatformConfig(platformKey);
  if (!config) return [];

  const suggestions: string[] = [];
  const contentType = analyzeContentType(content);
  const attractionAnalysis = analyzeContentAttraction(content, platformKey);

  // 基于弱点提供针对性建议
  attractionAnalysis.keyWeaknesses.forEach(weakness => {
    switch (weakness) {
      case '标题过长，影响阅读':
        suggestions.push(`将标题压缩到${config.contentRules.maxTitleLength}字以内，突出核心卖点`);
        break;
      case '缺少具体数字，说服力不足':
        suggestions.push('添加具体数字，如时间、数量、价格等，增强可信度');
        break;
      case '缺少情感触发词，吸引力不足':
        suggestions.push('使用情感强烈的词汇，如"震惊"、"绝了"、"心疼"等');
        break;
      case '未使用平台热词':
        suggestions.push(`加入平台热词：${config.contentRules.preferredKeywords.slice(0, 3).join('、')}`);
        break;
      case '未使用有效的吸引力策略':
        const topTactic = config.attractionTactics[0];
        suggestions.push(`尝试"${topTactic.name}"策略：${topTactic.description}`);
        break;
    }
  });

  // 基于内容类型的专业建议
  switch (contentType) {
    case '教程指南':
      suggestions.push('强调学习成果和时间效率，如"3分钟学会"、"零基础也能懂"');
      break;
    case '产品测评':
      suggestions.push('突出测试结果的震撼性，如"结果惊人"、"效果绝了"');
      break;
    case '揭秘爆料':
      suggestions.push('加强神秘感和独家性，如"首次曝光"、"内部消息"');
      break;
    case '避坑提醒':
      suggestions.push('强化警示语气，如"千万注意"、"别再踩雷"');
      break;
  }

  return suggestions.slice(0, 5); // 最多返回5个建议
}

/**
 * 深度内容分析（用于增强模板系统）
 */
export function analyzeContentInDepth(content: string): {
  coreValue: string;
  keywordPairs: string[];
  emotionalHooks: string[];
  targetPoints: string[];
} {
  // 核心价值分析
  const valueKeywords = ['学习', '技能', '方法', '秘诀', '攻略', '指南', '经验'];
  const coreValue = valueKeywords.find(keyword => content.includes(keyword)) || '知识分享';
  
  // 关键词组合
  const keywords = content.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  const keywordPairs = keywords.slice(0, 3);
  
  // 情感触发词
  const emotionalWords = ['秘诀', '绝招', '必备', '必看', '神器', '神技', '震撼', '惊艳'];
  const emotionalHooks = emotionalWords.filter(word => content.includes(word));
  
  // 目标卖点
  const numbers = content.match(/\d+/g) || [];
  const targetPoints = numbers.length > 0 ? [`${numbers[0]}天速成`, '实用技巧'] : ['实用技巧', '实战经验'];
  
  return {
    coreValue,
    keywordPairs,
    emotionalHooks: emotionalHooks.length > 0 ? emotionalHooks : ['实用', '有效'],
    targetPoints
  };
}

/**
 * 智能优化提示词生成
 */
export function generateSmartOptimizationPrompt(content: string, platform: string): string {
  const analysis = analyzeContentInDepth(content);
  const attractionAnalysis = analyzeContentAttraction(content, platform);
  
  return `
基于智能分析的优化建议：
- 核心价值：${analysis.coreValue}
- 关键词组合：${analysis.keywordPairs.join('、')}
- 情感触发：${analysis.emotionalHooks.join('、')}
- 目标卖点：${analysis.targetPoints.join('、')}
- 当前吸引力：${attractionAnalysis.currentScore}/100分
- 改进建议：${attractionAnalysis.keyWeaknesses.join('；')}
  `.trim();
} 