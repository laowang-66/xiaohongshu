import { NextRequest, NextResponse } from 'next/server';
import { Search1APIUtil } from '@/app/utils/search1api-util';

// 建议实际部署时用 process.env 存储密钥
const SEARCH1API_KEY = '8457E41B-EF17-462A-83D7-4B4FAE7F3FED'; // Search1API Key
const DEEPSEEK_API_KEY = 'sk-28c73a6d126d45ae9d5237427ba65bde'; // DeepSeek API Key

export async function POST(req: NextRequest) {
  try {
    const { url, title, searchType = 'google' } = await req.json();

    if (!url || !url.trim()) {
      return NextResponse.json({ error: 1, message: '缺少链接地址' }, { status: 400 });
    }

    console.log('Crawling URL:', url);

    // 使用 Search1API 抓取链接内容
    const searchUtil = new Search1APIUtil(SEARCH1API_KEY);
    const crawlResult = await searchUtil.crawl(url);

    console.log('Crawl completed for URL:', url);

    // 检查爬取结果并提取内容
    let rawContent = '';

    if (crawlResult?.results?.content) {
      rawContent = crawlResult.results.content;
    } else if (crawlResult?.content) {
      rawContent = crawlResult.content;
    } else if (crawlResult?.data) {
      rawContent = crawlResult.data;
    }

    if (!rawContent || rawContent.trim().length === 0) {
      console.error('No content extracted from crawl result:', crawlResult);
      return NextResponse.json(
        {
          error: 2,
          message: '抓取内容失败或内容为空',
          debug: crawlResult,
        },
        { status: 500 }
      );
    }

    // 搜索类型中文名映射
    const searchTypeName: Record<string, string> = {
      google: 'Google',
      wechat: '微信公众号',
      zhihu: '知乎',
      xiaohongshu: '小红书',
      douyin: '抖音',
      weibo: '微博',
      github: 'GitHub',
      twitter: 'Twitter',
    };

    const typeName = searchTypeName[searchType] || 'Google';

    // 使用 DeepSeek API 将抓取的内容转换为小红书笔记
    const prompt = `基于以下${typeName}文章内容，创作一篇小红书爆款笔记，要求：

1. 标题要吸引眼球，使用emoji增强视觉效果
2. 内容结构清晰，使用分点和emoji
3. 语言生动有趣，贴近小红书用户喜好
4. 适当添加个人体验感和真实感
5. 包含实用价值和可操作性
6. 控制在适合的长度，不要过长
7. 去除AI痕迹，让内容更自然
8. 保持原文的核心信息和价值点

文章标题：${title || '未知标题'}
文章来源：${typeName}
文章链接：${url}

文章内容：
${rawContent}

请创作成一篇完整的小红书笔记：`;

    console.log('Generating Xiaohongshu note from single URL content...');

    const deepseekRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是一个资深的小红书内容创作者，擅长将各种优质文章转换成吸引人的小红书笔记。你的内容总是能获得很高的点赞和收藏。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 1500,
      }),
    });

    if (!deepseekRes.ok) {
      console.error('DeepSeek API error:', deepseekRes.status, deepseekRes.statusText);
      return NextResponse.json({ error: 3, message: 'AI服务异常，请稍后重试' }, { status: 502 });
    }

    const deepseekData = await deepseekRes.json();
    const note = deepseekData?.choices?.[0]?.message?.content || '';

    if (!note || note.trim().length === 0) {
      console.error('Empty note result:', deepseekData);
      return NextResponse.json({ error: 4, message: '笔记生成失败，请重试' }, { status: 500 });
    }

    console.log('Xiaohongshu note generated successfully from URL');

    return NextResponse.json({
      note: note.trim(),
      sourceUrl: url,
      sourceTitle: title,
      sourceType: typeName,
    });
  } catch (error) {
    console.error('Generate from URL API error:', error);

    // 根据错误类型返回不同的错误信息
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 401, message: 'API密钥无效' }, { status: 401 });
      }
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 429, message: '请求过于频繁，请稍后重试' },
          { status: 429 }
        );
      }
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 502, message: '网络连接异常，请稍后重试' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ error: 500, message: '生成服务异常，请稍后重试' }, { status: 500 });
  }
}
