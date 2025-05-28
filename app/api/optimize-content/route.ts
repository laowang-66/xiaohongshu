import { NextRequest, NextResponse } from 'next/server';
import { getPlatformConfig, analyzeContentType, generateOptimizationSuggestions, OptimizationResult } from '../../utils/contentOptimizer';

export async function POST(request: NextRequest) {
  try {
    const { content, platform } = await request.json();

    if (!content || !platform) {
      return NextResponse.json(
        { error: '内容和平台参数都是必需的' },
        { status: 400 }
      );
    }

    const platformConfig = getPlatformConfig(platform);
    if (!platformConfig) {
      return NextResponse.json(
        { error: '不支持的平台类型' },
        { status: 400 }
      );
    }

    // 分析内容类型
    const contentType = analyzeContentType(content);
    
    // 生成优化建议
    const suggestions = generateOptimizationSuggestions(content, platform);

    // 调用DeepSeek API进行内容优化
    const prompt = platformConfig.optimizationPrompt.replace('{content}', content);
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的内容营销专家，擅长根据不同平台特性优化内容标题和文案。请严格按照要求的格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('AI 返回空响应');
    }

    // 解析AI响应并结构化
    const optimizedVersions = parseAIResponse(aiResponse, platform);

    const result: OptimizationResult = {
      platform: platformConfig.name,
      originalContent: content,
      optimizedVersions,
      platformInsights: {
        contentType,
        recommendedStyle: platformConfig.contentRules.emotionalTone,
        keyOptimizations: suggestions
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('内容优化失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '内容优化失败',
        details: '请检查输入内容并重试'
      },
      { status: 500 }
    );
  }
}

/**
 * 解析AI响应，提取优化版本
 */
function parseAIResponse(aiResponse: string, platform: string): OptimizationResult['optimizedVersions'] {
  const versions: OptimizationResult['optimizedVersions'] = [];
  
  try {
    // 简单的文本解析，实际项目中可以要求AI返回JSON格式
    const lines = aiResponse.split('\n').filter(line => line.trim());
    let currentVersion: any = {};
    let versionCount = 0;

    for (const line of lines) {
      if (line.includes('版本') || line.includes('方案') || line.match(/\d+[\.\、]/)) {
        if (currentVersion.mainTitle) {
          versions.push({
            version: versionCount + 1,
            mainTitle: currentVersion.mainTitle || '',
            subtitle: currentVersion.subtitle,
            emotionalTone: currentVersion.emotionalTone || '友好',
            reasoning: currentVersion.reasoning || '优化建议',
            confidence: 0.8
          });
          versionCount++;
        }
        currentVersion = {};
      } else if (line.includes('主标题') || line.includes('标题')) {
        currentVersion.mainTitle = extractTitle(line);
      } else if (line.includes('副标题')) {
        currentVersion.subtitle = extractTitle(line);
      } else if (line.includes('推荐理由') || line.includes('说明')) {
        currentVersion.reasoning = extractContent(line);
      } else if (line.includes('情感') || line.includes('标签')) {
        currentVersion.emotionalTone = extractContent(line);
      }
    }

    // 添加最后一个版本
    if (currentVersion.mainTitle) {
      versions.push({
        version: versionCount + 1,
        mainTitle: currentVersion.mainTitle,
        subtitle: currentVersion.subtitle,
        emotionalTone: currentVersion.emotionalTone || '友好',
        reasoning: currentVersion.reasoning || '优化建议',
        confidence: 0.8
      });
    }

    // 如果解析失败，返回基础版本
    if (versions.length === 0) {
      const platformConfig = getPlatformConfig(platform);
      const maxLength = platformConfig?.contentRules.maxTitleLength || 20;
      
      versions.push({
        version: 1,
        mainTitle: aiResponse.substring(0, maxLength),
        emotionalTone: '友好',
        reasoning: '基于AI生成的优化建议',
        confidence: 0.6
      });
    }

  } catch (error) {
    console.error('解析AI响应失败:', error);
    // 返回默认版本
    versions.push({
      version: 1,
      mainTitle: '优化后的标题',
      emotionalTone: '友好',
      reasoning: '解析失败，请手动调整',
      confidence: 0.3
    });
  }

  return versions.slice(0, 3); // 最多返回3个版本
}

function extractTitle(line: string): string {
  // 提取冒号后的内容，去除标点符号
  const match = line.match(/[:：](.*)/);
  if (match) {
    return match[1].trim().replace(/[「」""]/g, '');
  }
  return line.trim();
}

function extractContent(line: string): string {
  const match = line.match(/[:：](.*)/);
  return match ? match[1].trim() : line.trim();
} 