import { NextRequest, NextResponse } from 'next/server';

// 从环境变量获取API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 支持的语言配置
const SUPPORTED_LANGUAGES = {
  zh: { name: '中文', code: 'zh-CN' },
  en: { name: 'English', code: 'en' },
  ja: { name: '日本語', code: 'ja' },
  ko: { name: '한국어', code: 'ko' },
  fr: { name: 'Français', code: 'fr' },
  de: { name: 'Deutsch', code: 'de' },
  es: { name: 'Español', code: 'es' },
  it: { name: 'Italiano', code: 'it' },
  pt: { name: 'Português', code: 'pt' },
  ru: { name: 'Русский', code: 'ru' },
  ar: { name: 'العربية', code: 'ar' },
  th: { name: 'ไทย', code: 'th' },
  vi: { name: 'Tiếng Việt', code: 'vi' },
};

// 智能语言检测
function detectLanguage(text: string): string {
  // 中文检测
  if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
  
  // 日文检测（平假名、片假名、汉字）
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
  
  // 韩文检测
  if (/[\uac00-\ud7af]/.test(text)) return 'ko';
  
  // 阿拉伯文检测
  if (/[\u0600-\u06ff]/.test(text)) return 'ar';
  
  // 俄文检测
  if (/[\u0400-\u04ff]/.test(text)) return 'ru';
  
  // 泰文检测
  if (/[\u0e00-\u0e7f]/.test(text)) return 'th';
  
  // 越南文检测（带声调的拉丁字母）
  if (/[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(text)) return 'vi';
  
  // 西班牙文特征检测
  if (/[ñáéíóúü]/i.test(text)) return 'es';
  
  // 法文特征检测
  if (/[àâäçéèêëïîôöùûüÿ]/i.test(text)) return 'fr';
  
  // 德文特征检测
  if (/[äöüßÄÖÜ]/.test(text)) return 'de';
  
  // 意大利文特征检测
  if (/[àèéìíîòóù]/i.test(text)) return 'it';
  
  // 葡萄牙文特征检测
  if (/[ãâáàêéíôóõú]/i.test(text)) return 'pt';
  
  // 默认英文
  return 'en';
}

// 生成翻译提示词
function generateTranslationPrompt(text: string, fromLang: string, toLang: string): string {
  const fromLanguage = SUPPORTED_LANGUAGES[fromLang as keyof typeof SUPPORTED_LANGUAGES];
  const toLanguage = SUPPORTED_LANGUAGES[toLang as keyof typeof SUPPORTED_LANGUAGES];
  
  return `你是一位专业的翻译专家，精通多种语言之间的翻译。请将以下${fromLanguage?.name || '原文'}内容准确翻译成${toLanguage?.name || '目标语言'}：

**翻译要求：**
1. 保持原文的语气和风格
2. 确保专业术语的准确性
3. 保持文本的格式和结构
4. 如果有特殊含义或文化背景，请在翻译中体现
5. 保持自然流畅的表达方式

**原文内容：**
${text}

**翻译指南：**
- 如果是小红书、抖音等社交媒体内容，保持活泼生动的语言风格
- 如果是技术文档，保持专业严谨的表达
- 如果是营销文案，保持吸引力和感召力
- 如果有emoji表情符号，请保留

请只返回翻译结果，不要包含其他解释或说明：`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, fromLang, toLang, autoDetect = true } = body;

    console.log('📥 收到翻译请求:', { text: text?.substring(0, 50), fromLang, toLang, autoDetect });

    if (!text) {
      return NextResponse.json({ error: '翻译内容不能为空' }, { status: 400 });
    }

    // 自动检测源语言
    const detectedFromLang = autoDetect ? detectLanguage(text) : (fromLang || 'auto');
    const targetLang = toLang || (detectedFromLang === 'zh' ? 'en' : 'zh');

    console.log('🔍 语言检测结果:', { detectedFromLang, targetLang });

    // 检查语言是否支持
    if (!SUPPORTED_LANGUAGES[detectedFromLang as keyof typeof SUPPORTED_LANGUAGES] && detectedFromLang !== 'auto') {
      return NextResponse.json({ error: '不支持的源语言' }, { status: 400 });
    }

    if (!SUPPORTED_LANGUAGES[targetLang as keyof typeof SUPPORTED_LANGUAGES]) {
      return NextResponse.json({ error: '不支持的目标语言' }, { status: 400 });
    }

    // 如果源语言和目标语言相同，直接返回原文
    if (detectedFromLang === targetLang) {
      return NextResponse.json({
        originalText: text,
        translatedText: text,
        fromLanguage: detectedFromLang,
        toLanguage: targetLang,
        detectedLanguage: detectedFromLang,
        message: '源语言和目标语言相同，无需翻译'
      });
    }

    // API调用
    if (!DEEPSEEK_API_KEY) {
      console.error('❌ 缺少DEEPSEEK_API_KEY环境变量');
      return NextResponse.json({ 
        error: 'API key未配置，请设置DEEPSEEK_API_KEY环境变量',
        originalText: text,
        translatedText: `[翻译功能需要配置API密钥] ${text}`,
        fromLanguage: detectedFromLang,
        toLanguage: targetLang,
        detectedLanguage: detectedFromLang
      });
    }

    console.log('🚀 调用AI翻译API...');
    const translationPrompt = generateTranslationPrompt(text, detectedFromLang, targetLang);

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
              content: '你是一位专业的多语言翻译专家，能够准确、自然地在不同语言之间进行翻译。请确保翻译结果保持原文的语气、风格和含义。'
            },
            {
              role: 'user',
              content: translationPrompt
            }
          ],
          temperature: 0.3, // 较低的温度确保翻译的一致性
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 翻译API调用失败:', response.status, errorText);
        
        return NextResponse.json({
          error: `翻译API调用失败: ${response.status}`,
          originalText: text,
          translatedText: `[翻译失败] ${text}`,
          fromLanguage: detectedFromLang,
          toLanguage: targetLang,
          detectedLanguage: detectedFromLang
        });
      }

      const data = await response.json();
      const translatedText = data.choices?.[0]?.message?.content;

      if (!translatedText) {
        throw new Error('API未返回有效翻译结果');
      }

      console.log('✅ 翻译成功');
      console.log('翻译结果预览:', translatedText.substring(0, 100) + '...');

      return NextResponse.json({
        originalText: text,
        translatedText: translatedText.trim(),
        fromLanguage: detectedFromLang,
        toLanguage: targetLang,
        detectedLanguage: detectedFromLang,
        fromLanguageName: SUPPORTED_LANGUAGES[detectedFromLang as keyof typeof SUPPORTED_LANGUAGES]?.name || detectedFromLang,
        toLanguageName: SUPPORTED_LANGUAGES[targetLang as keyof typeof SUPPORTED_LANGUAGES]?.name || targetLang,
        success: true
      });

    } catch (fetchError) {
      console.error('❌ 翻译网络请求错误:', fetchError);
      
      return NextResponse.json({
        error: `翻译网络请求失败: ${fetchError instanceof Error ? fetchError.message : '未知错误'}`,
        originalText: text,
        translatedText: `[网络错误] ${text}`,
        fromLanguage: detectedFromLang,
        toLanguage: targetLang,
        detectedLanguage: detectedFromLang
      });
    }

  } catch (error) {
    console.error('❌ 处理翻译请求时出错:', error);
    return NextResponse.json(
      { error: `处理翻译请求时出错: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}

// GET请求返回支持的语言列表
export async function GET() {
  return NextResponse.json({
    supportedLanguages: SUPPORTED_LANGUAGES,
    message: '支持的翻译语言列表'
  });
} 