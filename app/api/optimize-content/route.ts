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

// ⚡ 智能提示词生成 - 大幅简化和优化
function generateFastPrompt(content: string, platform: string): string {
  const prompts = {
    xiaohongshu: `提取小红书封面关键信息，返回2个版本：
【格式要求】严格按照以下格式输出，每个版本4-6行：
版本1：
主标题：[6-12字]
副标题：[补充说明]
标签：[2-3个#标签]
情感词：[1个强化词]
数字亮点：[关键数字]
适用理由：[1句话说明]

原内容："${content}"
要求：主标题吸引眼球，标签精准，体现小红书风格。`,

    video: `提取短视频封面关键信息，返回2个版本：
【格式要求】严格按照以下格式输出，每个版本4-6行：
版本1：
核心标题：[4-8字]
关键数字：[突出数据]
情绪词汇：[强烈表达]
核心卖点：[简短描述]
视觉建议：[设计提示]
适用理由：[1句话说明]

原内容："${content}"
要求：标题简短有力，数字醒目，适合竖屏显示。`,

    wechat: `提取公众号封面关键信息，返回2个版本：
【格式要求】严格按照以下格式输出，每个版本5-7行：
版本1：
主标题：[8-18字]
副标题：[补充说明]
权威背景：[可信来源]
核心价值：[明确收益]
专业标签：[3-5个标签]
适用理由：[1句话说明]

原内容："${content}"
要求：标题专业权威，适合横版布局，突出专业性。`
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

// ⚡ 智能内容解析 - 快速版本
function fastParseAIResponse(content: string): Array<{ [key: string]: string }> {
  const versions: Array<{ [key: string]: string }> = [];
  
  // 快速分割版本
  const versionBlocks = content.split(/版本\d+[:：]/).slice(1);
  
  versionBlocks.forEach((block, index) => {
    if (index >= 3) return; // 最多处理3个版本
    
    const version: { [key: string]: string } = {};
    const lines = block.trim().split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const match = line.match(/^([^：:]+)[：:](.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        version[key] = value;
      }
    });
    
    if (Object.keys(version).length >= 3) { // 至少3个有效字段才算有效版本
      versions.push(version);
    }
  });
  
  return versions.slice(0, 2); // 最多返回2个版本
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

// ⚡ 处理单个优化请求
async function processOptimizeRequest(content: string, platform: string, startTime: number) {
  try {
    // ⚡ 检查缓存
    if (PERFORMANCE_CONFIG.ENABLE_CONTENT_CACHE) {
      const cacheKey = { content: content.trim(), platform };
      const cachedResult = cacheUtils.getOptimizationCache?.(cacheKey);
      if (cachedResult) {
        console.log('⚡ 内容优化缓存命中');
        return NextResponse.json({
          ...cachedResult,
          generationTime: Date.now() - startTime,
          cached: true
        });
      }
    }

    // ⚡ 内容预处理
    const trimmedContent = content.trim();
    if (trimmedContent.length < 5) {
      return NextResponse.json({ error: '内容太短，无法提取有效信息' }, { status: 400 });
    }

    if (trimmedContent.length > 200) {
      console.log('⚠️ 内容过长，截取前200字符');
      content = trimmedContent.slice(0, 200) + '...';
    }

    // 检查API可用性
    if (!DEEPSEEK_API_KEY) {
      const fallbackVersions = createFallbackResponse(content, platform);
      return NextResponse.json({
        success: true,
        versions: fallbackVersions,
        count: fallbackVersions.length,
        platform,
        fallback: true,
        generationTime: Date.now() - startTime,
        message: 'API未配置，使用智能降级方案'
      });
    }

    // ⚡ 快速AI生成
    console.log(`🚀 开始快速AI内容优化 - 平台: ${platform}`);
    const prompt = generateFastPrompt(content, platform);
    const aiResponse = await fastOptimizeCall(prompt);
    
    if (!aiResponse) {
      throw new Error('AI返回空内容');
    }

    console.log(`🤖 AI响应长度: ${aiResponse.length}`);
    console.log(`📝 AI响应预览: ${aiResponse.slice(0, 100)}...`);

    // ⚡ 快速解析结果
    let versions = fastParseAIResponse(aiResponse);
    
    if (versions.length === 0) {
      console.log('⚠️ AI解析失败，使用降级方案');
      versions = createFallbackResponse(content, platform);
    }

    const result = {
      success: true,
      versions,
      count: versions.length,
      platform,
      generationTime: Date.now() - startTime,
      debug: {
        aiResponseLength: aiResponse.length,
        parsedVersions: versions.length,
        contentLength: content.length
      }
    };

    // ⚡ 异步缓存
    if (PERFORMANCE_CONFIG.ENABLE_CONTENT_CACHE && versions.length > 0) {
      setTimeout(() => {
        const cacheKey = { content: content.trim(), platform };
        if (cacheUtils.setOptimizationCache) {
          cacheUtils.setOptimizationCache(cacheKey, result);
          console.log('💾 内容优化结果已缓存');
        }
      }, 0);
    }

    console.log(`✅ 封面内容提取完成，生成版本数: ${versions.length}`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ 内容优化错误:', error);
    
    // ⚡ 智能错误处理 + 降级
    const fallbackVersions = createFallbackResponse(content, platform);
    
    let errorMessage = '内容优化失败';
    if (error instanceof Error) {
      if (error.message.includes('超时')) {
        errorMessage = '处理超时，已生成基础版本';
      } else if (error.message.includes('API')) {
        errorMessage = 'API调用失败，已生成基础版本';
      }
    }

    return NextResponse.json({
      success: true, // 因为有降级版本，仍视为成功
      versions: fallbackVersions,
      count: fallbackVersions.length,
      platform,
      fallback: true,
      error: errorMessage,
      generationTime: Date.now() - startTime
    });
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
      return await optimizeRequestDeduplication.get(requestKey)!;
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

    return await processingPromise;

  } catch (error) {
    console.error('❌ 请求处理错误:', error);
    return NextResponse.json(
      { 
        error: `请求处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
        generationTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
} 