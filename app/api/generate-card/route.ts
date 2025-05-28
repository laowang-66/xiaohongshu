import { NextRequest, NextResponse } from 'next/server';
import { ENHANCED_TEMPLATES, getEnhancedTemplate, recommendTemplateByContent, convertToMarkdown, parseMarkdownStructure, optimizeCoverContent } from '../../utils/enhancedTemplates';
import { cache, cacheUtils } from '../../utils/cache';

// 从环境变量获取API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// ⚡ 性能优化配置
const PERFORMANCE_CONFIG = {
  // 快速模式配置
  FAST_API_TIMEOUT: 8000, // 8秒快速超时
  STANDARD_API_TIMEOUT: 15000, // 15秒标准超时
  MAX_RETRIES: 1, // 减少重试次数提升响应速度
  ENABLE_FAST_MODE: true, // 启用快速模式
  ENABLE_PARALLEL_PROCESSING: true, // 启用并行处理
  ENABLE_PREGENERATION: true, // 启用预生成
};

// 封面尺寸配置
const coverSizes = {
  xiaohongshu: {
    name: '小红书封面',
    width: 900,
    height: 1200,
    ratio: '3:4',
    description: '小红书图文封面，垂直布局',
  },
  video: {
    name: '短视频封面',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    description: '抖音/快手/视频号封面，竖屏布局',
  },
  wechat: {
    name: '公众号封面',
    width: 900,
    height: 268,
    ratio: '3.35:1',
    description: '微信公众号文章封面，横向布局',
    special: true,
  },
};

// ⚡ 性能优化：请求去重映射
const requestDeduplication = new Map<string, Promise<any>>();

// ⚡ 超时控制的fetch函数 - 优化版
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

// ⚡ 快速AI调用 - 优化提示词和参数
async function fastAICall(prompt: string): Promise<string> {
  console.log('🚀 快速AI调用开始...');
  
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
          content: `你是专业封面设计师。要求：1.快速响应 2.必须返回完整HTML 3.内联样式 4.美观实用。只返回HTML代码，无其他文字。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // ⚡ 降低随机性提升速度
      max_tokens: 1000, // ⚡ 减少token数量提升速度
      top_p: 0.8, // ⚡ 优化参数提升响应速度
    }),
  }, PERFORMANCE_CONFIG.FAST_API_TIMEOUT);

  if (!response.ok) {
    throw new Error(`AI调用失败: ${response.status}`);
  }

  const data = await response.json();
  const htmlContent = data.choices?.[0]?.message?.content;

  if (!htmlContent) {
    throw new Error('AI未返回有效内容');
  }

  console.log('✅ 快速AI调用完成');
  return htmlContent;
}

// ⚡ 并行AI调用 - 同时生成多个版本
async function parallelAICall(prompts: string[]): Promise<string[]> {
  console.log(`🔄 并行生成${prompts.length}个版本...`);
  
  try {
    const promises = prompts.map(prompt => fastAICall(prompt));
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.warn(`⚠️ 版本${index + 1}生成失败:`, result.reason);
        return ''; // 返回空字符串，后续处理
      }
    }).filter(Boolean); // 过滤掉失败的结果
  } catch (error) {
    console.error('❌ 并行生成失败:', error);
    throw error;
  }
}

// ⚡ 生成简化的快速提示词
function generateFastPrompt(text: string, sizeConfig: any, templateStyle: string): string {
  const sizeInstructions = {
    'xiaohongshu': `宽度${sizeConfig.width}px 高度${sizeConfig.height}px 垂直布局 小红书风格`,
    'video': `宽度${sizeConfig.width}px 高度${sizeConfig.height}px 竖屏布局 短视频风格`,
    'wechat': `宽度${sizeConfig.width}px 高度${sizeConfig.height}px 横向布局 公众号风格`
  };

  return `创建${sizeInstructions[sizeConfig.key as keyof typeof sizeInstructions]}封面。
内容："${text}"
要求：${templateStyle}主题，现代设计，清晰字体，美观配色。
必须包含完整HTML结构，所有样式内联。严格按照指定尺寸。`;
}

// ⚡ 预生成常用模板 - 后台预热
const pregeneratedTemplates = new Map<string, string>();

async function pregenerateTemplate(text: string, size: string, template: string): Promise<void> {
  const key = `${text.slice(0, 20)}_${size}_${template}`;
  
  if (!pregeneratedTemplates.has(key)) {
    try {
      const sizeConfig = { ...coverSizes[size as keyof typeof coverSizes], key: size };
      const selectedTemplate = getEnhancedTemplate(template) || getEnhancedTemplate('scene_photo_xiaohongshu');
      if (!selectedTemplate) return;
      
      const prompt = generateFastPrompt(text, sizeConfig, selectedTemplate.name);
      
      const html = await fastAICall(prompt);
      if (html) {
        pregeneratedTemplates.set(key, html);
        console.log(`🔥 预生成完成: ${key.slice(0, 30)}...`);
      }
    } catch (error) {
      console.log(`⚠️ 预生成失败: ${key}`);
    }
  }
}

// ⚡ 性能优化的HTML验证和清理
function fastValidateAndCleanHtml(htmlContent: string, sizeConfig: any): { isValid: boolean; cleanedHtml: string; errors: string[] } {
  const errors: string[] = [];
  let cleanedHtml = htmlContent.trim();

  // 快速验证
  if (!cleanedHtml.includes('<div')) {
    errors.push('缺少div标签');
    return { isValid: false, cleanedHtml: '', errors };
  }

  if (!cleanedHtml.includes(`width:${sizeConfig.width}px`) && !cleanedHtml.includes(`width: ${sizeConfig.width}px`)) {
    // 快速修复尺寸
    cleanedHtml = cleanedHtml.replace(
      /style="([^"]*)"/, 
      `style="width:${sizeConfig.width}px;height:${sizeConfig.height}px;$1"`
    );
  }

  return {
    isValid: cleanedHtml.length > 100 && !errors.length,
    cleanedHtml,
    errors
  };
}

// ⚡ 快速降级HTML生成
function createFastFallbackHtml(sizeConfig: any, text: string, templateName: string): string {
  const gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const fontSize = Math.max(24, sizeConfig.width / 30);
  
  return `<div style="width:${sizeConfig.width}px;height:${sizeConfig.height}px;background:${gradient};display:flex;align-items:center;justify-content:center;font-family:'PingFang SC',sans-serif;color:#fff;font-size:${fontSize}px;text-align:center;padding:40px;box-sizing:border-box">
    <div style="max-width:90%">
      <h1 style="margin:0;font-size:${fontSize * 1.5}px;margin-bottom:20px;text-shadow:2px 2px 4px rgba(0,0,0,0.3)">${text}</h1>
      <p style="margin:0;font-size:${fontSize * 0.6}px;opacity:0.8;background:rgba(255,255,255,0.1);padding:10px 20px;border-radius:20px">${templateName}</p>
    </div>
  </div>`;
}

// ⚡ 处理单个请求的异步函数
async function processRequest(text: string, sizeKey: string, templateKey: string, startTime: number) {
  try {
    // ⚡ 检查缓存（包括预生成缓存）
    const cacheKey = { text: text.trim(), template: templateKey, size: sizeKey };
    let cachedResult = cacheUtils.getCoverCache(cacheKey);
    
    // 检查预生成缓存
    if (!cachedResult) {
      const pregenKey = `${text.slice(0, 20)}_${sizeKey}_${templateKey}`;
      const pregenHtml = pregeneratedTemplates.get(pregenKey);
      if (pregenHtml) {
        console.log('🔥 使用预生成模板');
        const sizeConfig = { ...coverSizes[sizeKey as keyof typeof coverSizes], key: sizeKey };
        const selectedTemplate = getEnhancedTemplate(templateKey) || getEnhancedTemplate('scene_photo_xiaohongshu');
        
        if (selectedTemplate) {
          cachedResult = {
            html: pregenHtml,
            template: selectedTemplate.key,
            templateName: selectedTemplate.name,
            size: sizeKey,
            sizeConfig,
            cached: true,
            pregenerated: true
          };
        }
      }
    }
    
    if (cachedResult) {
      console.log('⚡ 缓存命中，快速返回');
      return NextResponse.json({
        ...cachedResult,
        generationTime: Date.now() - startTime
      });
    }

    // 获取配置
    const sizeConfig = { ...coverSizes[sizeKey as keyof typeof coverSizes], key: sizeKey };
    if (!sizeConfig) {
      return NextResponse.json({ error: '不支持的封面尺寸' }, { status: 400 });
    }

    // 智能模板选择
    const recommendedTemplate = recommendTemplateByContent(text, sizeKey);
    const selectedTemplate = getEnhancedTemplate(templateKey) || 
                             (recommendedTemplate ? recommendedTemplate : null) ||
                             getEnhancedTemplate('scene_photo_xiaohongshu');

    if (!selectedTemplate) {
      return NextResponse.json({ error: '无法确定合适的模板' }, { status: 400 });
    }

    // API调用检查
    if (!DEEPSEEK_API_KEY) {
      const fallbackHtml = createFastFallbackHtml(sizeConfig, text, selectedTemplate.name);
      return NextResponse.json({
        error: 'API key未配置',
        html: fallbackHtml,
        template: selectedTemplate.key,
        templateName: selectedTemplate.name,
        size: sizeKey,
        sizeConfig,
        generationTime: Date.now() - startTime
      });
    }

    try {
      console.log('🚀 开始快速AI生成...');
      
      // ⚡ 生成快速提示词
      const fastPrompt = generateFastPrompt(text, sizeConfig, selectedTemplate.name);
      
      // ⚡ 并行生成（如果启用）
      let htmlContent: string;
      
      if (PERFORMANCE_CONFIG.ENABLE_PARALLEL_PROCESSING && text.length > 10) {
        // 生成两个轻微不同的提示词并行处理
        const prompts = [
          fastPrompt,
          fastPrompt.replace('现代设计', '简约设计')
        ];
        
        const results = await parallelAICall(prompts);
        htmlContent = results[0] || results[1]; // 使用第一个成功的结果
        
        if (!htmlContent) {
          throw new Error('并行生成全部失败');
        }
      } else {
        // 单个快速生成
        htmlContent = await fastAICall(fastPrompt);
      }

      console.log('✅ 快速生成完成');
      
      // ⚡ 快速验证和清理
      const { isValid, cleanedHtml, errors } = fastValidateAndCleanHtml(htmlContent, sizeConfig);

      let finalHtml = cleanedHtml;

      if (!isValid) {
        console.log('⚠️ 快速验证失败，使用优化降级方案');
        finalHtml = createFastFallbackHtml(sizeConfig, text, selectedTemplate.name);
      }

      const result = {
        html: finalHtml,
        template: selectedTemplate.key,
        templateName: selectedTemplate.name,
        size: sizeKey,
        sizeConfig,
        generationTime: Date.now() - startTime,
        optimized: true,
        debug: {
          originalLength: htmlContent?.length || 0,
          cleanedLength: finalHtml.length,
          validationPassed: isValid,
          errors: errors
        }
      };

      // ⚡ 异步缓存（不阻塞响应）
      if (isValid) {
        setTimeout(() => {
          cacheUtils.setCoverCache(cacheKey, result);
          console.log('💾 异步缓存完成');
        }, 0);
      }

      // ⚡ 异步预生成相关模板（不阻塞响应）
      if (PERFORMANCE_CONFIG.ENABLE_PREGENERATION && isValid) {
        setTimeout(() => {
          const variations = ['scene_photo_xiaohongshu', 'minimal_grid', 'flowing_tech_blue'];
          variations.forEach(template => {
            if (template !== templateKey) {
              pregenerateTemplate(text, sizeKey, template).catch(() => {});
            }
          });
        }, 100);
      }

      console.log(`⚡ 快速生成完成，总耗时: ${Date.now() - startTime}ms`);
      return NextResponse.json(result);

    } catch (aiError) {
      console.error('❌ 快速AI调用失败:', aiError);
      
      // 快速降级响应
      const fallbackHtml = createFastFallbackHtml(sizeConfig, text, selectedTemplate.name);
      return NextResponse.json({
        error: `快速生成失败: ${aiError instanceof Error ? aiError.message : '未知错误'}`,
        html: fallbackHtml,
        template: selectedTemplate.key,
        templateName: selectedTemplate.name,
        size: sizeKey,
        sizeConfig,
        generationTime: Date.now() - startTime,
        fallback: true
      });
    }

  } catch (error) {
    console.error('❌ 处理请求过程出错:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const { text, size: sizeKey = 'xiaohongshu', template: templateKey } = body;

    console.log('📥 快速生成请求:', { text: text?.substring(0, 30), sizeKey, templateKey });

    if (!text) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    // ⚡ 性能优化：请求去重
    const requestKey = `${text.trim()}_${sizeKey}_${templateKey}`;
    if (requestDeduplication.has(requestKey)) {
      console.log('🔄 检测到重复请求，等待现有请求完成...');
      return await requestDeduplication.get(requestKey)!;
    }

    // 创建去重的Promise
    const processingPromise = processRequest(text, sizeKey, templateKey, startTime).finally(() => {
      // 清理去重记录
      requestDeduplication.delete(requestKey);
    });
    
    requestDeduplication.set(requestKey, processingPromise);

    // 设置5分钟后清理去重记录（防止内存泄漏）
    setTimeout(() => {
      requestDeduplication.delete(requestKey);
    }, 5 * 60 * 1000);

    return await processingPromise;

  } catch (error) {
    console.error('❌ 快速处理请求出错:', error);
    
    return NextResponse.json(
      { 
        error: `处理请求出错: ${error instanceof Error ? error.message : '未知错误'}`,
        generationTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}
