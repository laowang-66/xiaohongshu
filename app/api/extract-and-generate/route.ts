import { NextRequest, NextResponse } from 'next/server'
import { Search1APIUtil } from '@/app/utils/search1api-util'

// 建议实际部署时用 process.env 存储密钥
const SEARCH1API_KEY = 'A58A8C36-74B1-4F92-A27D-0DAAE8D307BD' // Search1API Key
const DEEPSEEK_API_KEY = 'sk-28c73a6d126d45ae9d5237427ba65bde' // DeepSeek API Key

export async function POST(req: NextRequest) {
  try {
    const { link, style } = await req.json()
    if (!link) {
      return NextResponse.json({ error: 1, message: '缺少链接' }, { status: 400 })
    }

    // 1. 使用 Search1API 抓取内容
    const searchUtil = new Search1APIUtil(SEARCH1API_KEY)
    const crawlResult = await searchUtil.deepCrawl({
      url: link,
      max_pages: 1,
      max_depth: 1
    })
    console.log('crawlResult', crawlResult);

    if (!crawlResult?.results?.content) {
      return NextResponse.json({ error: 2, message: '抓取内容失败' }, { status: 500 })
    }

    const rawContent = crawlResult.results.content

    // 2. 使用 DeepSeek API 生成爆款笔记
    const prompt = `请将以下内容提炼为一篇风格为「${style}」的小红书爆款笔记，要求：
1. 内容要有吸引力，结构清晰
2. 适当使用emoji和分点
3. 适合小红书平台
4. 去除AI痕迹，让内容更自然
5. 保持原文的核心信息

原文内容：
${rawContent}`

    const deepseekRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个资深的新媒体内容创作者，擅长写爆款小红书笔记。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.85,
        max_tokens: 1024
      })
    })

    const deepseekData = await deepseekRes.json()
    const note = deepseekData?.choices?.[0]?.message?.content || ''
    
    if (!note) {
      return NextResponse.json({ error: 3, message: '内容生成失败' }, { status: 500 })
    }

    return NextResponse.json({ note })
  } catch (e) {
    console.error('Error:', e)
    return NextResponse.json({ error: 500, message: '服务器异常' }, { status: 500 })
  }
} 