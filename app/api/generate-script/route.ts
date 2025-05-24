import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topic, audience, style, duration, additionalRequirements } = body

    // 这里可以添加实际的AI生成逻辑
    // 目前返回一个示例脚本
    const script = generateScript(topic, audience, style, duration, additionalRequirements)

    return NextResponse.json({ script })
  } catch (error) {
    return NextResponse.json(
      { error: '生成脚本时发生错误' },
      { status: 500 }
    )
  }
}

function generateScript(
  topic: string,
  audience: string,
  style: string,
  duration: string,
  additionalRequirements: string
) {
  // 根据不同的参数生成不同的脚本模板
  const templates = {
    casual: `大家好呀！今天给大家分享${topic}的小技巧～\n\n`,
    professional: `今天我们来深入探讨${topic}这个话题。\n\n`,
    funny: `嘿！今天我要跟大家分享一个超有趣的${topic}！\n\n`,
    emotional: `亲爱的朋友们，今天我想跟大家聊聊${topic}这个话题...\n\n`
  }

  const styleTemplate = templates[style as keyof typeof templates] || templates.casual

  // 根据时长调整内容长度
  const contentLength = {
    short: '简短',
    medium: '适中',
    long: '详细'
  }[duration] || '适中'

  // 根据受众调整语言风格
  const audienceStyle = {
    young: '年轻活力',
    middle: '成熟稳重',
    all: '通用'
  }[audience] || '通用'

  return `${styleTemplate}
【开场白】
${getOpeningByStyle(style)}

【主要内容】
1. 介绍${topic}的重要性
2. 分享3个实用技巧
3. 注意事项提醒

【互动环节】
如果你觉得有帮助，记得点赞关注哦！

【结束语】
${getClosingByStyle(style)}

${additionalRequirements ? `\n【额外要求】\n${additionalRequirements}` : ''}`
}

function getOpeningByStyle(style: string) {
  const openings = {
    casual: '最近发现了一个超实用的方法，忍不住要分享给大家！',
    professional: '作为一名专业人士，我想跟大家分享一些实用的经验。',
    funny: '今天我要分享一个超级搞笑又实用的方法！',
    emotional: '这个话题让我感触很深，希望能帮助到大家。'
  }
  return openings[style as keyof typeof openings] || openings.casual
}

function getClosingByStyle(style: string) {
  const closings = {
    casual: '好啦，今天的分享就到这里，我们下期再见！',
    professional: '以上就是今天的分享，希望对大家有所帮助。',
    funny: '是不是很简单？快去试试吧！',
    emotional: '希望今天的分享能给大家带来一些启发。'
  }
  return closings[style as keyof typeof closings] || closings.casual
} 