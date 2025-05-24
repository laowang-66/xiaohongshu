import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topic, platform, style, duration, additionalRequirements } = body

    // 这里可以添加实际的AI生成逻辑
    // 目前返回一个示例脚本
    const script = generateShortVideoScript(topic, platform, style, duration, additionalRequirements)

    return NextResponse.json({ script })
  } catch (error) {
    return NextResponse.json(
      { error: '生成脚本时发生错误' },
      { status: 500 }
    )
  }
}

function generateShortVideoScript(
  topic: string,
  platform: string,
  style: string,
  duration: string,
  additionalRequirements: string
) {
  // 根据不同的平台生成不同的开场白
  const platformOpenings = {
    douyin: [
      `抖音的朋友们好！今天给大家分享${topic}～\n\n`,
      `哈喽，抖音的小伙伴们！今天给大家带来${topic}的分享～\n\n`,
      `抖音的朋友们，今天给大家分享一个${topic}的小技巧！\n\n`,
      `大家好，今天给大家分享${topic}，超实用的！\n\n`
    ],
    kuaishou: [
      `快手的老铁们，今天给大家带来${topic}！\n\n`,
      `老铁们好！今天给大家分享${topic}，超实用的！\n\n`,
      `快手的朋友们，今天给大家带来${topic}的干货！\n\n`,
      `老铁们，今天给大家分享${topic}，学会了记得点赞！\n\n`
    ],
    xiaohongshu: [
      `小红书的姐妹们，今天分享一个${topic}的小技巧～\n\n`,
      `姐妹们好！今天给大家分享${topic}，超实用的！\n\n`,
      `小红书的姐妹们，今天给大家带来${topic}的分享～\n\n`,
      `姐妹们，今天给大家分享${topic}，学会了记得收藏！\n\n`
    ],
    bilibili: [
      `B站的小伙伴们，今天给大家带来${topic}的分享！\n\n`,
      `大家好，今天给大家分享${topic}，超实用的！\n\n`,
      `B站的朋友们，今天给大家带来${topic}的干货！\n\n`,
      `小伙伴们，今天给大家分享${topic}，学会了记得三连！\n\n`
    ]
  }

  const platformOpeningList = platformOpenings[platform as keyof typeof platformOpenings] || platformOpenings.douyin
  const opening = platformOpeningList[Math.floor(Math.random() * platformOpeningList.length)]

  // 根据风格生成不同的内容结构
  const styleTemplates = {
    trendy: {
      intro: ['最近超火的', '超流行的', '超火的', '超时尚的'],
      transition: ['快来看看', '赶紧学起来', '超实用的', '超简单的'],
      ending: ['赶紧试试吧！', '学会了记得点赞！', '超实用的！', '超简单的！']
    },
    funny: {
      intro: ['超搞笑的', '笑死我了', '太搞笑了', '超有趣的'],
      transition: ['笑死我了', '太搞笑了', '超有趣的', '太有意思了'],
      ending: ['太有意思了！', '笑死我了！', '超搞笑的！', '太搞笑了！']
    },
    educational: {
      intro: ['超实用的', '超简单的', '超详细的', '超全面的'],
      transition: ['学会了吗', '掌握了吗', '理解了吗', '记住了吗'],
      ending: ['记得收藏哦！', '学会了记得点赞！', '超实用的！', '超简单的！']
    },
    lifestyle: {
      intro: ['超治愈的', '超舒服的', '超享受的', '超美好的'],
      transition: ['太舒服了', '太治愈了', '太享受了', '太美好了'],
      ending: ['生活真美好！', '太治愈了！', '超舒服的！', '超享受的！']
    }
  }

  const styleTemplate = styleTemplates[style as keyof typeof styleTemplates] || styleTemplates.trendy
  const intro = styleTemplate.intro[Math.floor(Math.random() * styleTemplate.intro.length)]
  const transition = styleTemplate.transition[Math.floor(Math.random() * styleTemplate.transition.length)]
  const ending = styleTemplate.ending[Math.floor(Math.random() * styleTemplate.ending.length)]

  // 根据时长调整内容结构
  const durationStructure = {
    '15s': {
      sections: 2,
      pointsPerSection: 1,
      maxWordsPerPoint: 10
    },
    '30s': {
      sections: 3,
      pointsPerSection: 1,
      maxWordsPerPoint: 15
    },
    '60s': {
      sections: 3,
      pointsPerSection: 2,
      maxWordsPerPoint: 20
    },
    '90s': {
      sections: 4,
      pointsPerSection: 2,
      maxWordsPerPoint: 25
    }
  }

  const structure = durationStructure[duration as keyof typeof durationStructure] || durationStructure['30s']

  // 生成脚本内容
  let script = `${opening}【开场】\n${intro}${topic}，${transition}！\n\n`

  // 添加主要内容
  script += '【主要内容】\n'
  for (let i = 1; i <= structure.sections; i++) {
    script += `${i}. ${getRandomPoint(topic, style, structure.maxWordsPerPoint)}\n`
    if (structure.pointsPerSection > 1) {
      script += `   - ${getRandomSubPoint(topic, style, structure.maxWordsPerPoint / 2)}\n`
    }
  }

  // 添加互动环节
  script += '\n【互动环节】\n'
  script += getInteractionByPlatform(platform)

  // 添加结束语
  script += '\n【结束语】\n'
  script += `${ending}\n`

  // 添加额外要求
  if (additionalRequirements) {
    script += `\n【额外要求】\n${additionalRequirements}`
  }

  return script
}

function getRandomPoint(topic: string, style: string, maxWords: number): string {
  const points = {
    trendy: [
      `分享${topic}的最新玩法`,
      `揭秘${topic}的隐藏技巧`,
      `超火的${topic}教程`,
      `${topic}的正确打开方式`,
      `超流行的${topic}玩法`,
      `超时尚的${topic}技巧`,
      `超火的${topic}方法`,
      `${topic}的超简单教程`
    ],
    funny: [
      `笑死！${topic}还能这样玩`,
      `震惊！${topic}居然这么简单`,
      `太搞笑了！${topic}新玩法`,
      `${topic}还能这样？笑死我了`,
      `超搞笑的${topic}教程`,
      `笑死！${topic}还能这样`,
      `太搞笑了！${topic}还能这样玩`,
      `${topic}还能这样？太搞笑了`
    ],
    educational: [
      `${topic}的必备知识`,
      `${topic}的实用技巧`,
      `${topic}的注意事项`,
      `${topic}的进阶玩法`,
      `${topic}的详细教程`,
      `${topic}的完整攻略`,
      `${topic}的实用方法`,
      `${topic}的进阶技巧`
    ],
    lifestyle: [
      `治愈系${topic}分享`,
      `超舒服的${topic}体验`,
      `${topic}的慢生活`,
      `${topic}的精致生活`,
      `超治愈的${topic}分享`,
      `超享受的${topic}体验`,
      `${topic}的美好生活`,
      `${topic}的舒适生活`
    ]
  }

  const stylePoints = points[style as keyof typeof points] || points.trendy
  const point = stylePoints[Math.floor(Math.random() * stylePoints.length)]
  
  // 根据最大字数限制调整内容
  if (point.length > maxWords) {
    return point.substring(0, maxWords) + '...'
  }
  return point
}

function getRandomSubPoint(topic: string, style: string, maxWords: number): string {
  const subPoints = {
    trendy: [
      '超多人在用',
      '赶紧学起来',
      '太实用了',
      '收藏备用',
      '超流行的',
      '超时尚的',
      '超火的',
      '超简单的'
    ],
    funny: [
      '笑死我了',
      '太搞笑了',
      '绝了',
      '太有意思了',
      '笑死我了',
      '太搞笑了',
      '超搞笑的',
      '太搞笑了'
    ],
    educational: [
      '学会了吗',
      '记住了吗',
      '掌握了吗',
      '理解了吗',
      '学会了吗',
      '记住了吗',
      '掌握了吗',
      '理解了吗'
    ],
    lifestyle: [
      '太舒服了',
      '太治愈了',
      '太享受了',
      '太美好了',
      '超舒服的',
      '超治愈的',
      '超享受的',
      '超美好的'
    ]
  }

  const styleSubPoints = subPoints[style as keyof typeof subPoints] || subPoints.trendy
  const subPoint = styleSubPoints[Math.floor(Math.random() * styleSubPoints.length)]
  
  // 根据最大字数限制调整内容
  if (subPoint.length > maxWords) {
    return subPoint.substring(0, maxWords) + '...'
  }
  return subPoint
}

function getInteractionByPlatform(platform: string): string {
  const interactions = {
    douyin: [
      '点赞关注，下期更精彩！',
      '点赞收藏，下期更精彩！',
      '点赞关注，下期更精彩！',
      '点赞收藏，下期更精彩！'
    ],
    kuaishou: [
      '双击666，关注不迷路！',
      '双击666，下期更精彩！',
      '双击666，关注不迷路！',
      '双击666下期更精彩！'
    ],
    xiaohongshu: [
      '点赞收藏，分享给更多朋友！',
      '点赞收藏，下期更精彩！',
      '点赞收藏，分享给更多朋友！',
      '点赞收藏，下期更精彩！'
    ],
    bilibili: [
      '一键三连，下期更精彩！',
      '一键三连，关注不迷路！',
      '一键三连，下期更精彩！',
      '一键三连，关注不迷路！'
    ]
  }

  const platformInteractions = interactions[platform as keyof typeof interactions] || interactions.douyin
  return platformInteractions[Math.floor(Math.random() * platformInteractions.length)]
} 