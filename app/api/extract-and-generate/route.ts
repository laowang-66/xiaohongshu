import { NextRequest, NextResponse } from 'next/server';
import { Search1APIUtil } from '@/app/utils/search1api-util';

// 建议实际部署时用 process.env 存储密钥
const SEARCH1API_KEY = '8457E41B-EF17-462A-83D7-4B4FAE7F3FED'; // Search1API Key
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { link, mode, style, referenceContent } = await req.json();
    if (!link) {
      return NextResponse.json({ error: 1, message: '缺少链接' }, { status: 400 });
    }

    // 验证模式参数
    if (mode === 'reference' && !referenceContent) {
      return NextResponse.json(
        { error: 1, message: '参考爆款模式下需要提供参考内容' },
        { status: 400 }
      );
    }

    // 1. 使用 Search1API 抓取内容（使用基础 crawl 方法获取单个页面）
    const searchUtil = new Search1APIUtil(SEARCH1API_KEY);
    const crawlResult = await searchUtil.crawl(link);
    console.log('Crawl completed:', crawlResult);

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

    // 2. 根据模式生成不同的 prompt
    let prompt = '';

    if (mode === 'reference') {
      // 参考爆款模式
      prompt = `请参考以下爆款小红书笔记的风格和结构，基于提供的原文内容生成一篇新的小红书笔记：

参考爆款风格：
${referenceContent}

要求：
1. 保持参考内容的写作风格、语气和结构特点
2. 使用类似的emoji和表达方式
3. 适合小红书平台，有吸引力
4. 去除AI痕迹，让内容更自然
5. 基于原文信息，不要编造内容

原文内容：
${rawContent}`;
    } else {
      // 预设风格模式
      prompt = `请将以下内容提炼为一篇风格为「${style}」的小红书爆款笔记，要求：
1. 内容要有吸引力，结构清晰
2. 适当使用emoji和分点
3. 适合小红书平台
4. 去除AI痕迹，让内容更自然
5. 保持原文的核心信息

原文内容：
${rawContent}`;
    }

    const deepseekRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个资深的新媒体内容创作者，擅长写爆款小红书笔记。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 1024,
      }),
    });

    const deepseekData = await deepseekRes.json();
    const note = deepseekData?.choices?.[0]?.message?.content || '';

    if (!note) {
      return NextResponse.json({ error: 3, message: '内容生成失败' }, { status: 500 });
    }

    return NextResponse.json({ note });
  } catch (e) {
    console.error('Error:', e);
    return NextResponse.json({ error: 500, message: '服务器异常' }, { status: 500 });
  }
}
