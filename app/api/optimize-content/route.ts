import { NextRequest, NextResponse } from 'next/server';
import { cacheUtils } from '../../utils/cache';

// ⚡ 性能优化配置
const PERFORMANCE_CONFIG = {
  FAST_API_TIMEOUT: 8000, // 8秒快速超时
  STANDARD_API_TIMEOUT: 15000, // 15秒标准超时
  MAX_RETRIES: 1, // 减少重试次数
  ENABLE_SMART_PROMPT: true, // 启用智能提示词优化
  ENABLE_RESULT_STREAMING: true, // 启用结果流式返回
  ENABLE_CONTENT_CACHE: true, // 启用内容缓存
};

// 获取环境变量
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// ⚡ 请求去重映射
const optimizeRequestDeduplication = new Map<string, Promise<any>>();

// ⚡ 快速超时控制
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`请求超时（${timeout/1000}秒）`);
    }
    throw error;
  }
}

// ⚡ 智能提示词生成 - 基于notepad专业prompt模板
function generateFastPrompt(content: string, platform: string): string {
  const prompts = {
    xiaohongshu: `你是一位专业的小红书标题优化专家。请根据用户输入的内容提炼精简生成，生成1-3个高转化率的爆款标题。

## 核心评判标准
1. 点击率：3秒内引发点击欲望
2. 转化率：内容价值明确清晰
3. 互动率：促进评论和收藏
4. 传播率：激发分享意愿

## 标题硬性要求
- 字数：严格控制在15字以内
- 结构：人群+痛点+解决方案
- 情绪：至少1个情绪触发词
- 差异：对比同类有明显特色
- SEO：包含搜索高频词

## 标题公式
[人群身份]+[场景/痛点]+[解决方案]+[情绪价值]+[差异点]

## 质量检查项
✓ 吸引力：首句是否足够吸引眼球
✓ 价值感：核心利益是否清晰可见
✓ 真实性：是否避免夸大和虚假
✓ 规范性：是否符合平台规则
✓ 时效性：是否结合当前热点
✓ 互动性：是否易于引发互动

## 禁用词清单（高风险）
- 营销类：免费、最全、独家、首发
- 诱导类：速来、必看、赶紧、速领
- 夸大类：最强、最优、最好、最美
- 负面类：死、丑、烂、垃圾、难看
- 违规类：隐私、投机、暴力、情色

原始内容："${content}"

请严格按照以下格式输出：

版本1：
主标题：[≤15字爆款标题]
标题类型：[数字型/情感型/解决方案型/反差型/专业型]
核心元素：[使用的关键元素]
适用场景：[什么时候适合用这个版本]

版本2：
主标题：[≤15字爆款标题]
标题类型：[数字型/情感型/解决方案型/反差型/专业型]
核心元素：[使用的关键元素]
适用场景：[什么时候适合用这个版本]`,

    video: `你是短视频爆款专家，研究过千万播放量视频的封面规律。请根据用户输入的内容提炼精简生成，生成1-3个极具爆点的短视频标题。

## 视频封面标题特点
1. 极度简洁：通常5-10个字，最多不超过12字
2. 视觉冲击：使用强烈对比和醒目表达
3. 关键词优先：核心卖点必须突出
4. 悬念设计：引发好奇心和点击欲望

## 3秒法则：
用户只会给你3秒决定是否观看，标题必须在3秒内：
1. 制造强烈视觉冲击
2. 激发极度好奇心
3. 触发情感共鸣

## 标题核心要素
- 直击痛点或兴趣点
- 创造紧迫感或稀缺感
- 承诺明确价值或结果
- 利用情绪触发词增强效果

## 高效标题类型
- 【悬念型】：制造好奇和疑问
- 【对比型】：展示前后/对错差异
- 【数字型】：具体数字增加可信度
- 【情感型】：触发强烈情绪反应
- 【惊喜型】：打破常规认知

原始内容："${content}"

请严格按照以下格式输出：

版本1：
标题：[≤12字]
情绪强度：[1-10分]
核心钩子：[吸引点]
预期效果：[用户反应]

版本2：
标题：[≤12字]
情绪强度：[1-10分]
核心钩子：[吸引点]
预期效果：[用户反应]`,

    wechat: `你是公众号内容专家，擅长创作高转发、高收藏的深度内容标题。请根据用户输入的内容提炼精简生成1-3个有深度且具吸引力的标题。

## 公众号用户画像：
- 追求有价值的深度内容
- 希望获得认知升级
- 愿意花时间阅读长文
- 重视权威性和专业度

## 公众号标题特点
1. 标题长度：通常15-25字，微信显示约为两行
2. 重视首屏：前10个字至关重要，决定打开率
3. 排版特色：可使用emoji表情、数字序号增强视觉效果
4. 互动性强：问句、悬念和共鸣型表达效果好

## 标题核心要素
- 清晰表达文章主题和核心价值
- 引发读者好奇心和阅读欲望
- 符合目标受众的阅读习惯和兴趣
- 避免过度营销和标题党

## 高效标题模式
- 【干货型】：实用技巧、方法论、步骤指南
- 【观点型】：独特视角、评论、预测、思考
- 【故事型】：案例分享、经历讲述、情感共鸣
- 【问题型】：解答疑惑、解决痛点
- 【数据型】：研究报告、行业洞察、趋势分析

## 标题增强元素
- 数字：具体数字增加可信度（3个方法、5步骤）
- 时间：创造紧迫感（今日必读、最新发布）
- 问句：直接与读者对话（你知道吗？为什么？）
- 对比：突出差异（从小白到专家、误区vs正解）
- 情感词：触发共鸣（震惊、惊喜、感动）

## 吸引力策略：
- 权威背书：建立可信度
- 价值承诺：明确阅读收益
- 认知冲突：挑战固有认知
- 趋势洞察：提供前瞻价值

原始内容："${content}"

请严格按照以下格式输出：

版本1：
主标题：[15-25字体现核心价值]
副标题：[关键信息补充]
价值定位：[读者收益]
目标人群：[精准用户]

版本2：
主标题：[15-25字体现核心价值]
副标题：[关键信息补充]
价值定位：[读者收益]
目标人群：[精准用户]`
  };

  return prompts[platform as keyof typeof prompts] || prompts.xiaohongshu;
}

// ⚡ 快速AI调用
async function fastOptimizeCall(prompt: string): Promise<string> {
  const response = await fetchWithTimeout('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是专业内容策略师。快速精准提取关键信息，严格按格式输出，不添加多余文字。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2, // ⚡ 提高确定性，减少生成时间
      max_tokens: 600, // ⚡ 限制输出长度
      top_p: 0.8,
    }),
  }, PERFORMANCE_CONFIG.FAST_API_TIMEOUT);

  if (!response.ok) {
    throw new Error(`AI调用失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// 🔍 快速解析AI回复 - 升级版，支持多种格式和平台特征
function fastParseAIResponse(content: string): Array<{ [key: string]: string }> {
  console.log('🔍 开始解析AI回复内容');
  
  const results: Array<{ [key: string]: string }> = [];
  
  try {
    // 预处理：清理和标准化内容
    const cleanContent = content.replace(/```[\s\S]*?```/g, '').trim();
    
    // 策略1: 基于"版本"关键词的分割解析
    const versionMatches = cleanContent.split(/版本\s*\d+[：:]/).filter(v => v.trim());
    
    if (versionMatches.length > 1) {
      console.log(`📋 使用版本分割策略，找到 ${versionMatches.length} 个版本`);
      
      for (let i = 1; i < versionMatches.length; i++) {
        const versionContent = versionMatches[i].trim();
        const parsed = parseVersionContent(versionContent);
        if (parsed && Object.keys(parsed).length > 0) {
          results.push(parsed);
        }
      }
    }
    
    // 策略2: 基于平台特征的解析
    if (results.length === 0) {
      console.log('🔄 尝试平台特征解析');
      
      // 小红书特征解析
      if (content.includes('主标题') && content.includes('标题类型')) {
        const xiaohongshuResults = parseXiaohongshuFormat(cleanContent);
        results.push(...xiaohongshuResults);
      }
      
      // 短视频特征解析
      if (content.includes('标题：') && content.includes('情绪强度')) {
        const videoResults = parseVideoFormat(cleanContent);
        results.push(...videoResults);
      }
      
      // 公众号特征解析
      if (content.includes('主标题') && content.includes('价值定位')) {
        const wechatResults = parseWechatFormat(cleanContent);
        results.push(...wechatResults);
      }
    }
    
    // 策略3: 兜底解析 - 基于行分割
    if (results.length === 0) {
      console.log('🚨 使用兜底解析策略');
      const fallbackResult = fallbackParseResponse(cleanContent);
      results.push(...fallbackResult);
    }
    
    console.log(`✅ 解析完成，共获得 ${results.length} 个版本`);
    return results.slice(0, 3); // 最多返回3个版本
    
  } catch (error) {
    console.error('❌ 解析失败:', error);
    return fallbackParseResponse(content);
  }
}

// 解析版本内容的通用函数
function parseVersionContent(content: string): { [key: string]: string } | null {
  const result: { [key: string]: string } = {};
  
  // 通用字段解析
  const fieldPatterns = [
    { key: 'title', patterns: ['主标题[：:](.+)', '标题[：:](.+)', '核心标题[：:](.+)'] },
    { key: 'subtitle', patterns: ['副标题[：:](.+)', '关键信息补充[：:](.+)'] },
    { key: 'type', patterns: ['标题类型[：:](.+)', '类型[：:](.+)'] },
    { key: 'emotion', patterns: ['情绪强度[：:](.+)', '情感标签[：:](.+)'] },
    { key: 'hook', patterns: ['核心钩子[：:](.+)', '核心元素[：:](.+)'] },
    { key: 'effect', patterns: ['预期效果[：:](.+)', '适用场景[：:](.+)'] },
    { key: 'value', patterns: ['价值定位[：:](.+)', '核心卖点[：:](.+)'] },
    { key: 'target', patterns: ['目标人群[：:](.+)', '目标读者[：:](.+)'] }
  ];
  
  for (const field of fieldPatterns) {
    for (const pattern of field.patterns) {
      const regex = new RegExp(pattern, 'i');
      const match = content.match(regex);
      if (match) {
        result[field.key] = match[1].trim();
        break;
      }
    }
  }
  
  return Object.keys(result).length > 0 ? result : null;
}

// 小红书格式专用解析
function parseXiaohongshuFormat(content: string): Array<{ [key: string]: string }> {
  const results: Array<{ [key: string]: string }> = [];
  const sections = content.split(/版本\s*\d+[：:]/).filter(s => s.trim());
  
  sections.forEach(section => {
    const result: { [key: string]: string } = {};
    
    const titleMatch = section.match(/主标题[：:](.+)/);
    const typeMatch = section.match(/标题类型[：:](.+)/);
    const elementMatch = section.match(/核心元素[：:](.+)/);
    const sceneMatch = section.match(/适用场景[：:](.+)/);
    
    if (titleMatch) result.title = titleMatch[1].trim();
    if (typeMatch) result.type = typeMatch[1].trim();
    if (elementMatch) result.hook = elementMatch[1].trim();
    if (sceneMatch) result.effect = sceneMatch[1].trim();
    
    if (Object.keys(result).length > 0) {
      results.push(result);
    }
  });
  
  return results;
}

// 短视频格式专用解析
function parseVideoFormat(content: string): Array<{ [key: string]: string }> {
  const results: Array<{ [key: string]: string }> = [];
  const sections = content.split(/版本\s*\d+[：:]/).filter(s => s.trim());
  
  sections.forEach(section => {
    const result: { [key: string]: string } = {};
    
    const titleMatch = section.match(/标题[：:](.+)/);
    const emotionMatch = section.match(/情绪强度[：:](.+)/);
    const hookMatch = section.match(/核心钩子[：:](.+)/);
    const effectMatch = section.match(/预期效果[：:](.+)/);
    
    if (titleMatch) result.title = titleMatch[1].trim();
    if (emotionMatch) result.emotion = emotionMatch[1].trim();
    if (hookMatch) result.hook = hookMatch[1].trim();
    if (effectMatch) result.effect = effectMatch[1].trim();
    
    if (Object.keys(result).length > 0) {
      results.push(result);
    }
  });
  
  return results;
}

// 公众号格式专用解析
function parseWechatFormat(content: string): Array<{ [key: string]: string }> {
  const results: Array<{ [key: string]: string }> = [];
  const sections = content.split(/版本\s*\d+[：:]/).filter(s => s.trim());
  
  sections.forEach(section => {
    const result: { [key: string]: string } = {};
    
    const titleMatch = section.match(/主标题[：:](.+)/);
    const subtitleMatch = section.match(/副标题[：:](.+)/);
    const valueMatch = section.match(/价值定位[：:](.+)/);
    const targetMatch = section.match(/目标人群[：:](.+)/);
    
    if (titleMatch) result.title = titleMatch[1].trim();
    if (subtitleMatch) result.subtitle = subtitleMatch[1].trim();
    if (valueMatch) result.value = valueMatch[1].trim();
    if (targetMatch) result.target = targetMatch[1].trim();
    
    if (Object.keys(result).length > 0) {
      results.push(result);
    }
  });
  
  return results;
}

// ⚡ 智能降级响应
function createFallbackResponse(content: string, platform: string): Array<{ [key: string]: string }> {
  const fallbacks = {
    xiaohongshu: {
      主标题: content.slice(0, 12) + (content.length > 12 ? '...' : ''),
      副标题: '智能生成的标题',
      标签: '#干货分享',
      情感词: '必看',
      适用理由: '简洁明了，适合小红书用户快速浏览'
    },
    video: {
      核心标题: content.slice(0, 8) + (content.length > 8 ? '' : ''),
      关键数字: '100%',
      情绪词汇: '震撼',
      核心卖点: '值得收藏',
      适用理由: '简短有力，适合短视频封面'
    },
    wechat: {
      主标题: content.slice(0, 18) + (content.length > 18 ? '...' : ''),
      副标题: '深度解析',
      权威背景: '专业分析',
      核心价值: '获得实用知识',
      适用理由: '专业严谨，适合公众号读者'
    }
  };

  const base = fallbacks[platform as keyof typeof fallbacks] || fallbacks.xiaohongshu;
  
  // 创建备选版本，处理不同平台的属性名差异
  const alternativeVersion = { ...base };
  const baseAny = base as any;
  if (baseAny.主标题) {
    (alternativeVersion as any).主标题 = baseAny.主标题 + '(备选)';
  } else if (baseAny.核心标题) {
    (alternativeVersion as any).核心标题 = baseAny.核心标题 + '(备选)';
  }
  
  return [base, alternativeVersion];
}

// ⚡ 智能内容预处理 - 支持长文处理
function intelligentContentPreprocess(content: string, platform: string): string {
  const trimmedContent = content.trim();
  
  // 定义不同平台的合理长度限制
  const platformLimits = {
    xiaohongshu: 600,  // 小红书可以处理更长的内容
    video: 400,        // 短视频保持简洁
    wechat: 1000       // 公众号支持最长内容
  };
  
  const maxLength = platformLimits[platform as keyof typeof platformLimits] || 600;
  
  if (trimmedContent.length <= maxLength) {
    return trimmedContent;
  }
  
  console.log(`⚡ 内容过长(${trimmedContent.length}字)，开始智能处理...`);
  
  // 智能分段处理
  return smartContentExtraction(trimmedContent, maxLength, platform);
}

// 智能内容提取 - 增强版本
function smartContentExtraction(content: string, maxLength: number, platform: string): string {
  // 平台关键词优先级 - 基于notepad中的专业prompt
  const platformKeywords = {
    xiaohongshu: {
      // 高优先级词汇
      high: ['种草', '实测', '推荐', '分享', '干货', '攻略', '必看', '真实', '体验', '好用', '绝了', '神器', '宝藏'],
      // 情感触发词
      emotion: ['超爱', '超好用', '太惊喜', '强推', '必入', '心动', '爱了', '绝绝子', 'yyds', '无敌了'],
      // 平台特色词
      platform: ['姐妹们', '宝宝们', '集美', '小仙女', '冲冲冲', '蹲一个', '求链接'],
      // 避免词汇 
      avoid: ['免费', '最全', '独家', '首发', '速来', '必看', '赶紧', '速领']
    },
    video: {
      high: ['震惊', '揭秘', '必看', '爆料', '秘密', '真相', '方法', '技巧', '绝了', '超级', '惊呆', '不敢相信'],
      emotion: ['太离谱', '绝了', '震撼', '炸裂', '牛逼', '厉害', '666', '卧槽', '我天'],
      platform: ['老铁', '家人们', '双击', '点赞', '关注', '走一波'],
      avoid: ['标题党', '假的', '骗人', '垃圾']
    },
    wechat: {
      high: ['分析', '深度', '解读', '洞察', '思考', '趋势', '专业', '权威', '研究', '价值', '方法论', '案例'],
      emotion: ['深入', '透彻', '精辟', '独到', '前瞻', '深刻', '犀利', '到位'],
      platform: ['深度分析', '专业解读', '行业洞察', '权威发布', '独家观点', '深度思考'],
      avoid: ['震惊', '不敢相信', '太离谱', '绝了']
    }
  };
  
  const keywords = platformKeywords[platform as keyof typeof platformKeywords] || platformKeywords.xiaohongshu;
  
  // 方法1：段落优先 - 增强评分算法
  const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 10);
  
  if (paragraphs.length > 1) {
    let bestParagraph = '';
    let maxScore = 0;
    let scoreDetails: any = {};
    
    paragraphs.forEach((para, paraIndex) => {
      if (para.length > maxLength) return;
      
      let score = 0;
      const details: any = { paragraph: paraIndex, scores: {} };
      
      // 1. 高优先级关键词匹配 (权重: 5)
      const highMatches = keywords.high.filter(keyword => para.includes(keyword));
      const highScore = highMatches.length * 5;
      score += highScore;
      details.scores.highKeywords = { count: highMatches.length, score: highScore, words: highMatches };
      
      // 2. 情感词汇匹配 (权重: 4)
      const emotionMatches = keywords.emotion.filter(keyword => para.includes(keyword));
      const emotionScore = emotionMatches.length * 4;
      score += emotionScore;
      details.scores.emotionWords = { count: emotionMatches.length, score: emotionScore, words: emotionMatches };
      
      // 3. 平台特色词汇 (权重: 3)
      const platformMatches = keywords.platform.filter(keyword => para.includes(keyword));
      const platformScore = platformMatches.length * 3;
      score += platformScore;
      details.scores.platformWords = { count: platformMatches.length, score: platformScore, words: platformMatches };
      
      // 4. 数字信息价值 (权重: 3)
      const numbers = para.match(/\d+(\.\d+)?[%％万亿千百十]?/g) || [];
      const numberScore = Math.min(numbers.length * 3, 15); // 最多15分
      score += numberScore;
      details.scores.numbers = { count: numbers.length, score: numberScore, examples: numbers.slice(0, 3) };
      
      // 5. 标点符号密度 - 信息丰富度 (权重: 1)
      const punctuation = para.match(/[！？。：；、,]/g) || [];
      const punctScore = Math.min(punctuation.length, 10);
      score += punctScore;
      details.scores.punctuation = { count: punctuation.length, score: punctScore };
      
      // 6. 位置权重 (开头段落更重要)
      const positionScore = Math.max(0, 8 - paraIndex * 2);
      score += positionScore;
      details.scores.position = { index: paraIndex, score: positionScore };
      
      // 7. 长度适中性 (权重: 2)
      const lengthScore = para.length >= 20 && para.length <= maxLength * 0.8 ? 4 : 
                         para.length >= 10 && para.length <= maxLength ? 2 : 0;
      score += lengthScore;
      details.scores.length = { length: para.length, score: lengthScore };
      
      // 8. 避免词汇惩罚 (权重: -3)
      const avoidMatches = keywords.avoid.filter(keyword => para.includes(keyword));
      const avoidPenalty = avoidMatches.length * -3;
      score += avoidPenalty;
      details.scores.avoidPenalty = { count: avoidMatches.length, score: avoidPenalty, words: avoidMatches };
      
      // 9. 平台特异性评分
      if (platform === 'xiaohongshu') {
        // 小红书喜欢个人化表达
        if (para.includes('我') || para.includes('亲测') || para.includes('真的')) {
          score += 3;
          details.scores.personalTouch = 3;
        }
      } else if (platform === 'video') {
        // 短视频喜欢冲突和对比
        if (para.includes('vs') || para.includes('对比') || para.includes('差别')) {
          score += 4;
          details.scores.contrast = 4;
        }
      } else if (platform === 'wechat') {
        // 公众号喜欢数据和引用
        if (para.includes('数据') || para.includes('报告') || para.includes('研究')) {
          score += 4;
          details.scores.authority = 4;
        }
      }
      
      details.totalScore = score;
      
      if (score > maxScore) {
        maxScore = score;
        bestParagraph = para;
        scoreDetails = details;
      }
    });
    
    if (bestParagraph && bestParagraph.length <= maxLength) {
      console.log(`✅ 智能段落选择成功`);
      console.log(`📊 最佳段落得分: ${maxScore}`);
      console.log(`🎯 评分详情:`, JSON.stringify(scoreDetails.scores, null, 2));
      return bestParagraph;
    }
  }
  
  // 方法2：关键句提取 - 增强版
  console.log(`🔄 段落分析无效，启用智能句子提取...`);
  return extractKeySentences(content, maxLength, [...keywords.high, ...keywords.emotion]);
}

// 提取关键句子
function extractKeySentences(content: string, maxLength: number, keywords: string[]): string {
  // 句子分割
  const sentences = content.split(/[。！？\n]/).filter(s => s.trim().length > 5);
  
  // 计算句子重要性
  const scoredSentences = sentences.map(sentence => {
    let score = 0;
    
    // 关键词匹配
    keywords.forEach(keyword => {
      if (sentence.includes(keyword)) score += 4;
    });
    
    // 数字信息
    if (/\d+/.test(sentence)) score += 3;
    
    // 长度适中加分
    if (sentence.length >= 15 && sentence.length <= 80) score += 2;
    
    // 情感词汇
    const emotionalWords = ['超级', '特别', '非常', '绝对', '必须', '一定', '真的', '超'];
    emotionalWords.forEach(word => {
      if (sentence.includes(word)) score += 1;
    });
    
    return { sentence: sentence.trim(), score };
  }).sort((a, b) => b.score - a.score);
  
  // 组合高分句子
  let result = '';
  let currentLength = 0;
  
  for (const item of scoredSentences) {
    const newLength = currentLength + item.sentence.length + 1;
    if (newLength <= maxLength) {
      result += (result ? '。' : '') + item.sentence;
      currentLength = newLength;
    } else {
      break;
    }
  }
  
  // 如果提取结果太短，补充开头内容
  if (result.length < maxLength * 0.5) {
    const beginning = content.substring(0, maxLength - result.length - 10);
    const lastPunctuation = Math.max(
      beginning.lastIndexOf('。'),
      beginning.lastIndexOf('！'),
      beginning.lastIndexOf('？')
    );
    
    if (lastPunctuation > beginning.length * 0.7) {
      result = beginning.substring(0, lastPunctuation + 1) + (result ? '\n' + result : '');
    }
  }
  
  console.log(`✅ 关键句提取完成，原长度: ${content.length} → 处理后: ${result.length}`);
  return result || content.substring(0, maxLength - 3) + '...';
}

// 🏃‍♂️ 短内容快速处理 - 基于notepad专业模板
function createSimpleVersionsForShortContent(content: string, platform: string): Array<{ [key: string]: string }> {
  const baseContent = content.trim();
  
  if (platform === 'xiaohongshu') {
    return [
      {
        title: baseContent.length <= 15 ? baseContent : `${baseContent.slice(0, 12)}...`,
        type: '情感型',
        hook: '简洁直接，易懂易记',
        effect: '适合快速传播，用户容易记住'
      },
      {
        title: baseContent.length <= 13 ? `✨${baseContent}✨` : `✨${baseContent.slice(0, 10)}...✨`,
        type: '装饰型',
        hook: '视觉亮点，增强吸引力',
        effect: '提升视觉效果，更有小红书风格'
      }
    ];
  }
  
  if (platform === 'video') {
    return [
      {
        title: baseContent.length <= 12 ? baseContent : baseContent.slice(0, 10),
        emotion: '7分',
        hook: '简洁有力，一目了然',
        effect: '用户快速理解，立即产生兴趣'
      },
      {
        title: baseContent.length <= 10 ? `${baseContent}!` : `${baseContent.slice(0, 9)}!`,
        emotion: '8分',
        hook: '增强冲击力，提升紧迫感',
        effect: '更强的视觉冲击，提高点击率'
      }
    ];
  }
  
  if (platform === 'wechat') {
    return [
      {
        title: baseContent.length <= 25 ? baseContent : `${baseContent.slice(0, 22)}...`,
        subtitle: '专业分析',
        value: '获得核心见解，提升认知水平',
        target: '关注行业发展的专业人士'
      },
      {
        title: baseContent.length <= 23 ? `${baseContent}：值得思考` : `${baseContent.slice(0, 18)}：深度解读`,
        subtitle: '权威解读',
        value: '深入理解问题本质，获得专业观点',
        target: '需要专业知识和深度思考的读者'
      }
    ];
  }
  
  // 默认返回小红书格式
  return [
    {
      title: baseContent.length <= 15 ? baseContent : `${baseContent.slice(0, 12)}...`,
      type: '简洁型',
      hook: '直接明了',
      effect: '快速传达信息'
    }
  ];
}

// 标准化字段名函数
function normalizeFieldName(fieldName: string): string {
  const fieldMap: { [key: string]: string } = {
    // 新格式字段映射
    'title': 'title',
    'subtitle': 'subtitle', 
    'type': 'type',
    'emotion': 'emotion',
    'hook': 'hook',
    'effect': 'effect',
    'value': 'value',
    'target': 'target',
    
    // 旧格式兼容映射
    '主标题': 'title',
    '副标题': 'subtitle',
    '标题类型': 'type',
    '情绪强度': 'emotion',
    '核心钩子': 'hook',
    '预期效果': 'effect',
    '价值定位': 'value',
    '目标人群': 'target'
  };
  
  return fieldMap[fieldName] || fieldName;
}

// 降级解析函数
function fallbackParseResponse(content: string): Array<{ [key: string]: string }> {
  const versions: Array<{ [key: string]: string }> = [];
  
  try {
    // 按行分割并清理
    const lines = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 5);
    
    if (lines.length === 0) return versions;
    
    // 尝试提取第一个有效版本
    const version1: { [key: string]: string } = {};
    
    // 查找标题相关内容
    const titleLine = lines.find(line => 
      line.includes('标题') || 
      line.includes('主题') || 
      line.includes('文案')
    );
    
    if (titleLine) {
      const titleMatch = titleLine.match(/[：:](.+)$/);
      if (titleMatch) {
        version1['title'] = titleMatch[1].trim();
      }
    }
    
    // 查找其他有价值的信息
    lines.forEach(line => {
      if (line.includes('副') || line.includes('补充')) {
        const match = line.match(/[：:](.+)$/);
        if (match) version1['subtitle'] = match[1].trim();
      }
      else if (line.includes('标签') || line.includes('分类')) {
        const match = line.match(/[：:](.+)$/);
        if (match) version1['type'] = match[1].trim();
      }
    });
    
    // 如果找到了有效内容，创建版本
    if (Object.keys(version1).length > 0) {
      // 确保有主标题
      if (!version1['title'] && lines.length > 0) {
        version1['title'] = lines[0].replace(/^[^：:]*[：:]/, '').trim() || lines[0];
      }
      
      versions.push(version1);
      
      // 创建第二个备选版本
      const version2 = { ...version1 };
      if (version2['title']) {
        version2['title'] = version2['title'] + '(备选)';
      }
      versions.push(version2);
    }
    
  } catch (error) {
    console.error('❌ 降级解析失败:', error);
  }
  
  return versions;
}

// 📊 内容质量评估函数
function evaluateContentQuality(versions: Array<{ [key: string]: string }>, platform: string, originalContent: string) {
  const metrics = {
    overallScore: 0,
    titleQuality: 0,
    platformFit: 0,
    completeness: 0,
    diversity: 0,
    details: {} as any
  };

  if (versions.length === 0) {
    return metrics;
  }

  // 1. 标题质量评估
  const titleScores = versions.map(version => {
    const title = version['title'] || '';
    let score = 0;

    // 长度适宜性
    if (platform === 'xiaohongshu' && title.length >= 6 && title.length <= 15) score += 20;
    else if (platform === 'video' && title.length >= 4 && title.length <= 12) score += 20;
    else if (platform === 'wechat' && title.length >= 15 && title.length <= 25) score += 20;
    else score += 10;

    // 是否包含数字
    if (/\d+/.test(title)) score += 10;

    // 是否包含情感词
    const emotionWords = ['超', '必', '神', '绝', '爱', '震', '惊', '深度', '专业', '权威'];
    if (emotionWords.some(word => title.includes(word))) score += 15;

    // 避免禁用词
    const bannedWords = ['免费', '最全', '独家', '首发'];
    if (!bannedWords.some(word => title.includes(word))) score += 15;

    return Math.min(score, 100);
  });

  metrics.titleQuality = Math.round(titleScores.reduce((a, b) => a + b, 0) / titleScores.length);

  // 2. 平台适配度评估
  let platformScore = 0;
  const platformKeywords = {
    xiaohongshu: ['种草', '分享', '推荐', '干货', '攻略'],
    video: ['震惊', '揭秘', '方法', '技巧', '绝了'],
    wechat: ['分析', '深度', '解读', '洞察', '专业']
  };

  const keywords = platformKeywords[platform as keyof typeof platformKeywords] || [];
  const allText = versions.map(v => Object.values(v).join(' ')).join(' ');
  const matchCount = keywords.filter(keyword => allText.includes(keyword)).length;
  platformScore = Math.min((matchCount / keywords.length) * 100, 100);
  metrics.platformFit = Math.round(platformScore);

  // 3. 完整性评估
  const expectedFields = {
    xiaohongshu: ['title', 'type', 'hook', 'effect'],
    video: ['title', 'emotion', 'hook', 'effect'],
    wechat: ['title', 'subtitle', 'value', 'target']
  };

  const fields = expectedFields[platform as keyof typeof expectedFields] || expectedFields.xiaohongshu;
  const completenessScores = versions.map(version => {
    const presentFields = fields.filter(field => version[field] && version[field].length > 0);
    return (presentFields.length / fields.length) * 100;
  });
  metrics.completeness = Math.round(completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length);

  // 4. 多样性评估
  if (versions.length >= 2) {
    const title1 = versions[0]['title'] || '';
    const title2 = versions[1]['title'] || '';
    
    // 简单的相似度检测
    const similarity = calculateSimilarity(title1, title2);
    metrics.diversity = Math.round((1 - similarity) * 100);
  } else {
    metrics.diversity = 0;
  }

  // 5. 综合评分
  metrics.overallScore = Math.round(
    (metrics.titleQuality * 0.3 + 
     metrics.platformFit * 0.25 + 
     metrics.completeness * 0.25 + 
     metrics.diversity * 0.2)
  );

  // 详细信息
  metrics.details = {
    versionCount: versions.length,
    avgTitleLength: Math.round(versions.reduce((sum, v) => {
      const title = v['title'] || '';
      return sum + title.length;
    }, 0) / versions.length),
    platformKeywordMatches: matchCount,
    originalContentLength: originalContent.length,
    processingSuccess: versions.length > 0
  };

  return metrics;
}

// 简单相似度计算
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);
  
  if (maxLen === 0) return 1;
  
  // 计算编辑距离
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  return distance / maxLen;
}

// ⚡ 处理单个优化请求
async function processOptimizeRequest(content: string, platform: string, startTime: number) {
  try {
    // ⚡ 检查缓存
    if (PERFORMANCE_CONFIG.ENABLE_CONTENT_CACHE) {
      const cacheKey = { content: content.trim(), platform };
      const cachedResult = cacheUtils.getOptimizationCache?.(cacheKey);
      if (cachedResult) {
        console.log('⚡ 内容优化缓存命中');
        return {
          ...cachedResult,
          generationTime: Date.now() - startTime,
          cached: true
        };
      }
    }

    // ⚡ 智能内容预处理（替换原来的简单截取）
    const trimmedContent = content.trim();
    if (trimmedContent.length < 5) {
      throw new Error('内容太短，无法提取有效信息');
    }

    // 📏 检查内容长度，20字以下直接返回简单处理结果
    if (trimmedContent.length <= 20) {
      console.log(`📏 内容较短(${trimmedContent.length}字)，跳过AI提取，直接返回简单处理结果`);
      
      // 为短内容创建简单的标题版本
      const simpleVersions = createSimpleVersionsForShortContent(trimmedContent, platform);
      
      const result = {
        success: true,
        versions: simpleVersions,
        count: simpleVersions.length,
        platform,
        generationTime: Date.now() - startTime,
        shortContent: true, // 标记为短内容处理
        qualityMetrics: {
          overallScore: 75, // 短内容给一个中等分数
          titleQuality: 70,
          platformFit: 80,
          completeness: 75,
          diversity: 70,
          details: {
            versionCount: simpleVersions.length,
            avgTitleLength: trimmedContent.length,
            platformKeywordMatches: 0,
            originalContentLength: trimmedContent.length,
            processingSuccess: true,
            shortContentProcessing: true
          }
        },
        debug: {
          originalLength: trimmedContent.length,
          processedLength: trimmedContent.length,
          shortContentProcessing: true,
          skippedAI: true
        }
      };
      
      console.log(`✅ 短内容处理完成，生成版本数: ${simpleVersions.length}`);
      return result;
    }

    // 使用智能处理而不是简单截取
    const processedContent = intelligentContentPreprocess(trimmedContent, platform);
    
    console.log(`📝 内容处理完成: ${trimmedContent.length} → ${processedContent.length} 字符`);

    // 检查API可用性
    if (!DEEPSEEK_API_KEY) {
      const fallbackVersions = createFallbackResponse(processedContent, platform);
      return {
        success: true,
        versions: fallbackVersions,
        count: fallbackVersions.length,
        platform,
        fallback: true,
        generationTime: Date.now() - startTime,
        message: 'API未配置，使用智能降级方案',
        debug: {
          originalLength: trimmedContent.length,
          processedLength: processedContent.length,
          intelligentProcessing: true
        }
      };
    }

    // ⚡ 快速AI生成
    console.log(`🚀 开始快速AI内容优化 - 平台: ${platform}`);
    const prompt = generateFastPrompt(processedContent, platform);
    
    // 📊 添加性能和质量监控
    const aiStartTime = Date.now();
    console.log(`📝 Prompt长度: ${prompt.length} 字符`);
    console.log(`🎯 处理内容长度: ${processedContent.length} 字符`);
    
    const aiResponse = await fastOptimizeCall(prompt);
    const aiDuration = Date.now() - aiStartTime;
    
    if (!aiResponse) {
      throw new Error('AI返回空内容');
    }

    console.log(`🤖 AI调用耗时: ${aiDuration}ms`);
    console.log(`🤖 AI响应长度: ${aiResponse.length} 字符`);
    console.log(`📝 AI响应预览: ${aiResponse.slice(0, 150)}...`);

    // ⚡ 快速解析结果
    const parseStartTime = Date.now();
    let versions = fastParseAIResponse(aiResponse);
    const parseDuration = Date.now() - parseStartTime;
    
    console.log(`⚡ 解析耗时: ${parseDuration}ms`);
    console.log(`📋 解析成功版本数: ${versions.length}`);
    
    if (versions.length === 0) {
      console.log('⚠️ AI解析失败，使用降级方案');
      versions = createFallbackResponse(processedContent, platform);
    }

    // 📊 质量评估
    const qualityMetrics = evaluateContentQuality(versions, platform, processedContent);
    console.log(`📊 内容质量评估:`, qualityMetrics);

    const result = {
      success: true,
      versions,
      count: versions.length,
      platform,
      generationTime: Date.now() - startTime,
      qualityMetrics, // 新增质量指标
      debug: {
        aiResponseLength: aiResponse.length,
        parsedVersions: versions.length,
        originalLength: trimmedContent.length,
        processedLength: processedContent.length,
        intelligentProcessing: true,
        aiCallDuration: aiDuration,
        parseDuration: parseDuration,
        promptLength: prompt.length
      }
    };

    // ⚡ 异步缓存 - 使用原始内容作为缓存键
    if (PERFORMANCE_CONFIG.ENABLE_CONTENT_CACHE && versions.length > 0) {
      setTimeout(() => {
        const cacheKey = { content: trimmedContent, platform }; // 使用原始内容
        if (cacheUtils.setOptimizationCache) {
          cacheUtils.setOptimizationCache(cacheKey, result);
          console.log('💾 内容优化结果已缓存');
        }
      }, 0);
    }

    console.log(`✅ 封面内容提取完成，生成版本数: ${versions.length}`);
    return result;

  } catch (error) {
    console.error('❌ 内容优化错误:', error);
    
    // ⚡ 智能错误处理 + 降级 - 使用处理后的内容
    const trimmedContent = content.trim();
    const processedContent = intelligentContentPreprocess(trimmedContent, platform);
    const fallbackVersions = createFallbackResponse(processedContent, platform);
    
    let errorMessage = '内容优化失败';
    if (error instanceof Error) {
      if (error.message.includes('超时')) {
        errorMessage = '处理超时，已生成基础版本';
      } else if (error.message.includes('API')) {
        errorMessage = 'API调用失败，已生成基础版本';
      }
    }

    return {
      success: true, // 因为有降级版本，仍视为成功
      versions: fallbackVersions,
      count: fallbackVersions.length,
      platform,
      fallback: true,
      error: errorMessage,
      generationTime: Date.now() - startTime,
      debug: {
        originalLength: trimmedContent.length,
        processedLength: processedContent.length,
        intelligentProcessing: true,
        errorFallback: true
      }
    };
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const { content, platform = 'xiaohongshu' } = body;

    console.log(`🎯 封面内容提取 - 平台: ${platform}`);

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    // ⚡ 请求去重
    const requestKey = `${content.trim()}_${platform}`;
    if (optimizeRequestDeduplication.has(requestKey)) {
      console.log('🔄 检测到重复优化请求，复用结果...');
      const result = await optimizeRequestDeduplication.get(requestKey)!;
      return NextResponse.json(result);
    }

    // 创建去重Promise
    const processingPromise = processOptimizeRequest(content, platform, startTime).finally(() => {
      optimizeRequestDeduplication.delete(requestKey);
    });

    optimizeRequestDeduplication.set(requestKey, processingPromise);

    // 5分钟后清理
    setTimeout(() => {
      optimizeRequestDeduplication.delete(requestKey);
    }, 5 * 60 * 1000);

    const result = await processingPromise;
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ 请求处理错误:', error);
    
    // 特殊处理内容太短的错误
    if (error instanceof Error && error.message.includes('内容太短')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { 
        error: `请求处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
        generationTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}