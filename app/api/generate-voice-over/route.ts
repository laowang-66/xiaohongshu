import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topic, platform, style, duration, additionalRequirements } = body

    // 这里可以添加实际的AI生成逻辑
    // 目前返回一个示例脚本
    const script = generateVoiceOverScript(topic, platform, style, duration, additionalRequirements)

    return NextResponse.json({ script })
  } catch (error) {
    return NextResponse.json(
      { error: '生成脚本时发生错误' },
      { status: 500 }
    )
  }
}

function generateVoiceOverScript(
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
    professional: {
      intro: ['专业的', '权威的', '系统的', '全面的'],
      transition: ['让我们来看看', '接下来介绍', '下面讲解', '现在分享'],
      ending: ['以上就是今天的分享，希望对大家有帮助！', '感谢观看，下期再见！', '如果觉得有帮助，请点赞关注！', '更多精彩内容，敬请期待！']
    },
    casual: {
      intro: ['轻松的', '简单的', '有趣的', '实用的'],
      transition: ['我们来看看', '接下来是', '下面分享', '现在介绍'],
      ending: ['今天的分享就到这里，下期再见！', '希望对你有帮助，记得点赞哦！', '如果喜欢，请点赞关注！', '更多精彩内容，敬请期待！']
    },
    energetic: {
      intro: ['充满活力的', '激情四射的', '活力满满的', '充满激情的'],
      transition: ['让我们一起来看', '接下来是重点', '下面分享干货', '现在开始分享'],
      ending: ['今天的分享就到这里，下期更精彩！', '如果觉得有帮助，请点赞关注！', '更多精彩内容，敬请期待！', '下期再见！']
    },
    emotional: {
      intro: ['感人的', '温暖的', '治愈的', '温馨的'],
      transition: ['让我们一起感受', '接下来分享', '下面讲述', '现在开始'],
      ending: ['今天的分享就到这里，希望对你有所启发！', '如果喜欢，请点赞关注！', '更多精彩内容，敬请期待！', '下期再见！']
    }
  }

  const styleTemplate = styleTemplates[style as keyof typeof styleTemplates] || styleTemplates.professional
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
    professional: [
      `专业的${topic}讲解`,
      `系统的${topic}分析`,
      `权威的${topic}解读`,
      `全面的${topic}介绍`,
      `详细的${topic}说明`,
      `深入的${topic}探讨`,
      `完整的${topic}讲解`,
      `专业的${topic}分享`
    ],
    casual: [
      `轻松的${topic}分享`,
      `简单的${topic}介绍`,
      `有趣的${topic}讲解`,
      `实用的${topic}技巧`,
      `好玩的${topic}分享`,
      `简单的${topic}方法`,
      `有趣的${topic}玩法`,
      `实用的${topic}技巧`
    ],
    energetic: [
      `充满活力的${topic}分享`,
      `激情四射的${topic}讲解`,
      `活力满满的${topic}介绍`,
      `充满激情的${topic}分享`,
      `充满活力的${topic}讲解`,
      `激情四射的${topic}分享`,
      `活力满满的${topic}讲解`,
      `充满激情的${topic}介绍`
    ],
    emotional: [
      `感人的${topic}分享`,
      `温暖的${topic}讲解`,
      `治愈的${topic}介绍`,
      `温馨的${topic}分享`,
      `感人的${topic}讲解`,
      `温暖的${topic}分享`,
      `治愈的${topic}讲解`,
      `温馨的${topic}介绍`
    ]
  }

  const stylePoints = points[style as keyof typeof points] || points.professional
  const point = stylePoints[Math.floor(Math.random() * stylePoints.length)]
  
  // 根据最大字数限制调整内容
  if (point.length > maxWords) {
    return point.substring(0, maxWords) + '...'
  }
  return point
}

function getRandomSubPoint(topic: string, style: string, maxWords: number): string {
  const subPoints = {
    professional: [
      '专业讲解',
      '系统分析',
      '权威解读',
      '全面介绍',
      '详细说明',
      '深入探讨',
      '完整讲解',
      '专业分享'
    ],
    casual: [
      '轻松分享',
      '简单介绍',
      '有趣讲解',
      '实用技巧',
      '好玩分享',
      '简单方法',
      '有趣玩法',
      '实用技巧'
    ],
    energetic: [
      '充满活力',
      '激情四射',
      '活力满满',
      '充满激情',
      '充满活力',
      '激情四射',
      '活力满满',
      '充满激情'
    ],
    emotional: [
      '感人分享',
      '温暖讲解',
      '治愈介绍',
      '温馨分享',
      '感人讲解',
      '温暖分享',
      '治愈讲解',
      '温馨介绍'
    ]
  }

  const styleSubPoints = subPoints[style as keyof typeof subPoints] || subPoints.professional
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