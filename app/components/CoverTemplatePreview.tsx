import React from 'react';

interface CoverTemplatePreviewProps {
  templateKey: string;
  isSelected: boolean;
  platform?: string; // 新增：适配不同平台
}

const CoverTemplatePreview: React.FC<CoverTemplatePreviewProps> = ({ 
  templateKey, 
  isSelected, 
  platform = 'xiaohongshu' 
}) => {
  
  // 根据平台调整预览尺寸比例
  const getPlatformStyle = () => {
    const baseWidth = 135;
    let height = 180;
    
    switch (platform) {
      case 'xiaohongshu':
        height = 180; // 3:4 比例
        break;
      case 'video':
        height = 240; // 9:16 比例
        break;
      case 'wechat':
        height = 40; // 3.35:1 比例
        break;
    }
    
    return {
      width: `${baseWidth}px`,
      height: `${height}px`,
      aspectRatio: platform === 'xiaohongshu' ? '3/4' : 
                   platform === 'video' ? '9/16' : 
                   platform === 'wechat' ? '3.35/1' : '3/4'
    };
  };

  const getFontSizes = () => {
    switch (platform) {
      case 'xiaohongshu':
        return {
          title: '10px',
          subtitle: '7px',
          body: '6px'
        };
      case 'video':
        return {
          title: '12px',
          subtitle: '8px',
          body: '7px'
        };
      case 'wechat':
        return {
          title: '8px',
          subtitle: '6px',
          body: '5px'
        };
      default:
        return {
          title: '10px',
          subtitle: '7px',
          body: '6px'
        };
    }
  };

  // 🎨 字符间距配置 - 根据平台优化
  const getTextSpacing = () => {
    switch (platform) {
      case 'xiaohongshu':
        return {
          letterSpacing: '0.05em',  // 小红书：适中间距
          wordSpacing: '0.1em',
          lineHeight: '1.4'
        };
      case 'video':
        return {
          letterSpacing: '0.08em',  // 短视频：较大间距，提升可读性
          wordSpacing: '0.15em',
          lineHeight: '1.3'
        };
      case 'wechat':
        return {
          letterSpacing: '0.06em',  // 公众号：平衡间距
          wordSpacing: '0.12em',
          lineHeight: '1.5'
        };
      default:
        return {
          letterSpacing: '0.05em',
          wordSpacing: '0.1em',
          lineHeight: '1.4'
        };
    }
  };

  const getPreviewContent = () => {
    const platformStyle = getPlatformStyle();
    const baseStyle = {
      ...platformStyle,
      borderRadius: '8px',
      overflow: 'hidden',
      fontSize: platform === 'wechat' ? '6px' : '8px',
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      position: 'relative' as const,
      cursor: 'pointer',
      boxSizing: 'border-box' as const
    };

    const fonts = getFontSizes();
    const spacing = getTextSpacing(); // 新增：获取间距配置

    switch (templateKey) {
      // ============= 增强模板预览（适配不同平台） =============
      
      case 'soft_tech_card':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #f8f4ff 0%, #e8d5ff 100%)',
            padding: platform === 'wechat' ? '6px' : '12px',
            color: '#6b46c1',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(107, 70, 193, 0.15)',
            border: '1px solid rgba(232, 213, 255, 0.3)'
          }}>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none', textAlign: 'center' }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold', 
                marginBottom: platform === 'wechat' ? '1px' : '4px',
                letterSpacing: spacing.letterSpacing,
                wordSpacing: spacing.wordSpacing
              }}>
                💜 柔和科技
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                color: '#8b5cf6',
                lineHeight: spacing.lineHeight,
                opacity: 0.9,
                letterSpacing: spacing.letterSpacing,
                wordSpacing: spacing.wordSpacing
              }}>
                圆角卡片 · 轻柔色彩
                {platform !== 'wechat' && <><br/>友好亲和 · 科技感</>}
              </div>
            </div>
          </div>
        );

      case 'modern_business_news':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #2d5a27 0%, #8b1538 100%)',
            padding: platform === 'wechat' ? '6px' : '10px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 16px)',
              pointerEvents: 'none'
            }}></div>
            <div style={{
              position: 'absolute',
              top: platform === 'wechat' ? '4px' : '6px',
              right: platform === 'wechat' ? '4px' : '6px',
              width: platform === 'wechat' ? '6px' : '12px',
              height: platform === 'wechat' ? '6px' : '12px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '2px'
            }}></div>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold', 
                marginBottom: platform === 'wechat' ? '1px' : '4px',
                letterSpacing: spacing.letterSpacing,
                wordSpacing: spacing.wordSpacing
              }}>
                📊 商务资讯
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                opacity: 0.9,
                lineHeight: spacing.lineHeight,
                letterSpacing: spacing.letterSpacing,
                wordSpacing: spacing.wordSpacing
              }}>
                专业权威 · 网格底纹
                {platform !== 'wechat' && <><br/>商务应用 · 金融科技</>}
              </div>
            </div>
          </div>
        );

      case 'flowing_tech_blue_style':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #4682b4 0%, #87ceeb 50%, #f0f8ff 100%)',
            padding: platform === 'wechat' ? '6px' : '10px',
            color: '#1e40af',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            borderRadius: '10px'
          }}>
            <div style={{
              position: 'absolute',
              top: platform === 'wechat' ? '4px' : '8px',
              right: platform === 'wechat' ? '4px' : '8px',
              width: platform === 'wechat' ? '10px' : '20px',
              height: platform === 'wechat' ? '10px' : '20px',
              background: 'rgba(30, 64, 175, 0.1)',
              borderRadius: '50%',
              border: '1px solid rgba(30, 64, 175, 0.2)'
            }}></div>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none', textAlign: 'center' }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold', 
                marginBottom: platform === 'wechat' ? '2px' : '4px'
              }}>
                🌊 流动科技
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                color: '#3b82f6',
                lineHeight: spacing.lineHeight,
                letterSpacing: spacing.letterSpacing,
                wordSpacing: spacing.wordSpacing
              }}>
                蓝白渐变 · 流线曲线
                {platform !== 'wechat' && <><br/>现代简约 · 科技未来</>}
              </div>
            </div>
          </div>
        );

      case 'minimal_grid_master':
        return (
          <div style={{
            ...baseStyle,
            background: '#000000',
            padding: platform === 'wechat' ? '6px' : '10px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            border: '1px solid #333333'
          }}>
            <div style={{
              position: 'absolute',
              top: platform === 'wechat' ? '4px' : '8px',
              left: platform === 'wechat' ? '4px' : '8px',
              width: platform === 'wechat' ? '6px' : '12px',
              height: platform === 'wechat' ? '6px' : '12px',
              background: '#00ff00',
              transform: 'rotate(45deg)'
            }}></div>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none', textAlign: 'center' }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold', 
                marginBottom: platform === 'wechat' ? '2px' : '6px'
              }}>
                ⬛ 极简格栅
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                color: '#cccccc',
                lineHeight: spacing.lineHeight
              }}>
                黑白对比 · 几何美学
                {platform !== 'wechat' && <><br/>网格系统 · 工业感</>}
              </div>
            </div>
          </div>
        );

      case 'digital_ticket_style':
        return (
          <div style={{
            ...baseStyle,
            background: '#ffffff',
            padding: platform === 'wechat' ? '6px' : '10px',
            color: '#000000',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'space-between',
            alignItems: platform === 'wechat' ? 'center' : 'stretch',
            border: '1px solid #000000',
            position: 'relative',
            borderRadius: '4px'
          }}>
            <div style={{
              position: 'absolute',
              top: platform === 'wechat' ? '3px' : '6px',
              right: platform === 'wechat' ? '3px' : '6px',
              width: platform === 'wechat' ? '3px' : '6px',
              height: platform === 'wechat' ? '3px' : '6px',
              background: '#000000',
              borderRadius: '1px'
            }}></div>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none' }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold', 
                marginBottom: platform === 'wechat' ? '1px' : '4px'
              }}>
                🎫 数字票券
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                color: '#666666',
                lineHeight: spacing.lineHeight
              }}>
                黑白对比 · 票券布局
                {platform !== 'wechat' && <><br/>几何分区 · 留白艺术</>}
              </div>
            </div>
            {platform !== 'wechat' && (
              <div style={{
                fontSize: fonts.body,
                color: '#000000',
                background: 'transparent',
                border: '1px solid #000000',
                padding: '2px 6px',
                alignSelf: 'flex-end',
                fontFamily: 'monospace'
              }}>
                ENTRY
              </div>
            )}
          </div>
        );

      case 'constructivist_teaching':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
            padding: platform === 'wechat' ? '6px' : '10px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'space-between',
            alignItems: platform === 'wechat' ? 'center' : 'stretch',
            position: 'relative',
            border: '2px solid #ff0000'
          }}>
            {platform !== 'wechat' && (
              <div style={{
                position: 'absolute',
                top: '20%',
                left: '25%',
                width: '30px',
                height: '2px',
                background: '#ff0000',
                transform: 'rotate(90deg)'
              }}></div>
            )}
            {platform !== 'wechat' && (
              <div style={{
                position: 'absolute',
                bottom: '15%',
                right: '20%',
                width: '20px',
                height: '2px',
                background: '#ff0000'
              }}></div>
            )}
            <div style={{ flex: platform === 'wechat' ? 1 : 'none', position: 'relative', zIndex: 1 }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold',
                marginBottom: platform === 'wechat' ? '1px' : '4px',
                color: '#ffffff'
              }}>
                🎓 构成主义
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                color: '#ff0000',
                lineHeight: spacing.lineHeight,
                fontWeight: 'normal'
              }}>
                学术实验美学
                {platform !== 'wechat' && <><br/>黑红白三色系统</>}
              </div>
            </div>
            {platform !== 'wechat' && (
              <div style={{
                fontSize: fonts.body,
                color: '#ffffff',
                background: '#ff0000',
                padding: '2px 4px',
                alignSelf: 'flex-end'
              }}>
                实验
              </div>
            )}
          </div>
        );

      case 'luxury_natural_mood':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #2f4f4f 0%, #8fbc8f 50%, #f5f5dc 100%)',
            padding: platform === 'wechat' ? '6px' : '12px',
            color: '#f5f5dc',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            borderRadius: '8px'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 70% 30%, rgba(218, 165, 32, 0.1) 0%, transparent 50%)',
              borderRadius: '8px',
              pointerEvents: 'none'
            }}></div>
            <div style={{
              position: 'absolute',
              top: platform === 'wechat' ? '5px' : '10px',
              right: platform === 'wechat' ? '5px' : '10px',
              fontSize: platform === 'wechat' ? '6px' : '8px',
              opacity: 0.7
            }}>✨</div>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold', 
                marginBottom: platform === 'wechat' ? '1px' : '4px',
                color: '#daa520'
              }}>
                🍃 奢华意境
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                color: '#f5f5dc',
                lineHeight: spacing.lineHeight,
                opacity: 0.9
              }}>
                沉稳色调 · 意境呈现
                {platform !== 'wechat' && <><br/>东方美学 · 品质追求</>}
              </div>
            </div>
          </div>
        );

      case 'industrial_rebellion_style':
        return (
          <div style={{
            ...baseStyle,
            background: '#000000',
            padding: platform === 'wechat' ? '6px' : '10px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: platform === 'wechat' ? 'center' : 'stretch',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: platform === 'wechat' ? '3px' : '6px',
              right: platform === 'wechat' ? '3px' : '6px',
              width: platform === 'wechat' ? '6px' : '12px',
              height: platform === 'wechat' ? '6px' : '12px',
              border: '1px solid #ffff00',
              transform: 'rotate(45deg)'
            }}></div>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none' }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold', 
                marginBottom: platform === 'wechat' ? '1px' : '4px',
                color: '#ffff00'
              }}>
                ⚡ 工业反叛
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                color: '#ff0080',
                lineHeight: spacing.lineHeight
              }}>
                强对比美学 · 地下文化
                {platform !== 'wechat' && <><br/>解构主义 · 朋克精神</>}
              </div>
            </div>
          </div>
        );

      case 'cute_knowledge_card':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #ffb6c1 0%, #fffacd 100%)',
            padding: platform === 'wechat' ? '6px' : '12px',
            color: '#d1477a',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '15px',
            boxShadow: '0 2px 8px rgba(255, 182, 193, 0.3)'
          }}>
            <div style={{ 
              fontSize: platform === 'wechat' ? '8px' : '12px', 
              marginBottom: platform === 'wechat' ? '0' : '4px',
              marginRight: platform === 'wechat' ? '4px' : '0'
            }}>😊</div>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none', textAlign: 'center' }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold', 
                marginBottom: platform === 'wechat' ? '1px' : '3px'
              }}>
                💖 软萌知识
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                color: '#ec4899',
                lineHeight: spacing.lineHeight
              }}>
                柔和色彩 · 圆角设计
                {platform !== 'wechat' && <><br/>温暖治愈 · Q版可爱</>}
              </div>
            </div>
          </div>
        );

      case 'business_simple_clean':
        return (
          <div style={{
            ...baseStyle,
            background: '#f5f5f5',
            padding: platform === 'wechat' ? '6px' : '10px',
            color: '#2c3e50',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #e0e0e0',
            borderRadius: '6px'
          }}>
            <div style={{
              width: platform === 'wechat' ? '12px' : '25px',
              height: platform === 'wechat' ? '1px' : '2px',
              background: '#27ae60',
              marginBottom: platform === 'wechat' ? '0' : '6px',
              marginRight: platform === 'wechat' ? '6px' : '0',
              borderRadius: '1px'
            }}></div>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none', textAlign: 'center' }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold', 
                marginBottom: platform === 'wechat' ? '1px' : '4px'
              }}>
                📋 简约商务
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                color: '#7f8c8d',
                lineHeight: spacing.lineHeight
              }}>
                极简背景 · 高对比度
                {platform !== 'wechat' && <><br/>功能至上 · 方正布局</>}
              </div>
            </div>
          </div>
        );

      case 'fresh_illustration_style':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #ffc0cb 0%, #98fb98 50%, #87ceeb 100%)',
            padding: platform === 'wechat' ? '6px' : '12px',
            color: '#2d5a87',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '12px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: platform === 'wechat' ? '4px' : '8px',
              left: platform === 'wechat' ? '4px' : '8px',
              fontSize: platform === 'wechat' ? '6px' : '8px'
            }}>🎨</div>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none', textAlign: 'center' }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold', 
                marginBottom: platform === 'wechat' ? '1px' : '3px'
              }}>
                🌈 清新插画
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                color: '#4a90e2',
                lineHeight: spacing.lineHeight
              }}>
                马卡龙色系 · 手绘风格
                {platform !== 'wechat' && <><br/>不规则布局 · 治愈氛围</>}
              </div>
            </div>
          </div>
        );

      // ============= 原有基础模板（适配不同平台） =============
      
      case 'scene_photo_xiaohongshu':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #fb923c, #fbbf24)',
            padding: platform === 'wechat' ? '6px' : '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'space-between',
            alignItems: platform === 'wechat' ? 'center' : 'stretch'
          }}>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none' }}>
              <div style={{ fontSize: fonts.title, fontWeight: 'bold', marginBottom: platform === 'wechat' ? '1px' : '4px' }}>
                震惊！一个月涨粉5000+！
              </div>
              <div style={{ fontSize: fonts.subtitle, opacity: 0.9 }}>
                我的公众号运营秘籍{platform === 'wechat' ? '' : '全在这！'}
              </div>
            </div>
            {platform !== 'wechat' && (
              <div style={{
                background: '#ffffff',
                color: '#fb923c',
                padding: '4px 8px',
                borderRadius: '10px',
                fontSize: fonts.body,
                fontWeight: 'bold',
                alignSelf: 'flex-end'
              }}>
                点击查看
              </div>
            )}
          </div>
        );

      case 'soft_rounded_card':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #ffb6c1 0%, #fffacd 100%)',
            padding: platform === 'wechat' ? '6px' : '12px',
            color: '#d1477a',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '15px',
            boxShadow: '0 2px 8px rgba(255, 182, 193, 0.3)'
          }}>
            <div style={{ 
              fontSize: platform === 'wechat' ? '8px' : '12px', 
              marginBottom: platform === 'wechat' ? '0' : '4px',
              marginRight: platform === 'wechat' ? '4px' : '0'
            }}>💜</div>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none', textAlign: 'center' }}>
              <div style={{ 
                fontSize: fonts.title, 
                fontWeight: 'bold', 
                marginBottom: platform === 'wechat' ? '1px' : '3px'
              }}>
                🌸 温柔圆角
              </div>
              <div style={{ 
                fontSize: fonts.subtitle, 
                color: '#ec4899',
                lineHeight: spacing.lineHeight
              }}>
                柔和色彩 · 圆角设计
                {platform !== 'wechat' && <><br/>温暖亲和 · 美妆时尚</>}
              </div>
            </div>
          </div>
        );

      // 其他模板也需要类似适配...
      default:
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            padding: platform === 'wechat' ? '6px' : '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: platform === 'wechat' ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ flex: platform === 'wechat' ? 1 : 'none' }}>
              <div style={{ fontSize: fonts.title, fontWeight: 'bold', marginBottom: platform === 'wechat' ? '1px' : '4px' }}>
                🎨 设计模板
              </div>
              <div style={{ fontSize: fonts.subtitle, opacity: 0.9 }}>
                选择样式模板
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      style={{
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.2s ease',
        filter: isSelected ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'none',
        border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
        borderRadius: '10px'
      }}
    >
      {getPreviewContent()}
    </div>
  );
};

export default CoverTemplatePreview; 
