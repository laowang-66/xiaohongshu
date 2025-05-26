import React from 'react';

interface CoverTemplatePreviewProps {
  templateKey: string;
  isSelected: boolean;
}

const CoverTemplatePreview: React.FC<CoverTemplatePreviewProps> = ({ templateKey, isSelected }) => {
  const getPreviewContent = () => {
    const baseStyle = {
      width: '135px',
      height: '180px',
      borderRadius: '8px',
      overflow: 'hidden',
      fontSize: '8px',
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      position: 'relative' as const,
      cursor: 'pointer'
    };

    switch (templateKey) {
      case 'scene_photo_xiaohongshu':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #fb923c, #fbbf24)',
            padding: '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>
                震惊！一个月涨粉5000+！
              </div>
              <div style={{ fontSize: '7px', opacity: 0.9 }}>
                我的公众号运营秘籍全在这！
              </div>
            </div>
            <div style={{
              background: '#ffffff',
              color: '#fb923c',
              padding: '4px 8px',
              borderRadius: '10px',
              fontSize: '6px',
              fontWeight: 'bold',
              alignSelf: 'flex-end'
            }}>
              点击查看
            </div>
          </div>
        );

      case 'flowing_tech_blue':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
            padding: '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '20px',
              height: '20px',
              background: '#06b6d4',
              borderRadius: '50%',
              opacity: 0.7
            }}></div>
            <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '4px' }}>
              🚀 AI技术革命
            </div>
            <div style={{ fontSize: '6px', opacity: 0.9, lineHeight: 1.2 }}>
              颠覆性创新<br/>改变未来
            </div>
          </div>
        );

      case 'soft_rounded_card':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #a855f7, #fbbf24)',
            padding: '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
              💜 温柔生活
            </div>
            <div style={{ fontSize: '6px', opacity: 0.9, textAlign: 'center', lineHeight: 1.3 }}>
              简约而不简单<br/>温暖每一天
            </div>
          </div>
        );

      case 'modern_business_info':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #1e40af, #10b981)',
            padding: '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '3px' }}>
                💼 商务资讯
              </div>
              <div style={{ fontSize: '6px', opacity: 0.9 }}>
                专业 • 权威 • 实用
              </div>
            </div>
            <div style={{ fontSize: '5px', opacity: 0.8 }}>
              📊 数据分析 | 📈 趋势预测
            </div>
          </div>
        );

      case 'minimal_grid':
        return (
          <div style={{
            ...baseStyle,
            background: '#000000',
            padding: '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              width: '30px',
              height: '2px',
              background: '#ffffff',
              marginBottom: '6px'
            }}></div>
            <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
              极简主义
            </div>
            <div style={{ fontSize: '5px', opacity: 0.8, textAlign: 'center' }}>
              少即是多
            </div>
            <div style={{
              width: '20px',
              height: '2px',
              background: '#ffffff',
              marginTop: '6px'
            }}></div>
          </div>
        );

      case 'industrial_rebellion':
        return (
          <div style={{
            ...baseStyle,
            background: '#000000',
            padding: '8px',
            color: '#ef4444',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '15px',
              height: '15px',
              border: '1px solid #10b981',
              transform: 'rotate(45deg)'
            }}></div>
            <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '4px' }}>
              ⚡ 反叛精神
            </div>
            <div style={{ fontSize: '6px', color: '#10b981' }}>
              打破常规<br/>重新定义
            </div>
          </div>
        );

      case 'tech_knowledge_sharing':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #1e293b, #06b6d4)',
            padding: '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '3px' }}>
                🔷 科技分享
              </div>
              <div style={{ fontSize: '6px', opacity: 0.9 }}>
                深度解析 • 前沿技术
              </div>
            </div>
            <div style={{
              fontSize: '5px',
              opacity: 0.7,
              fontFamily: 'monospace'
            }}>
              {'{ code: "innovation" }'}
            </div>
          </div>
        );

      case 'luxury_natural_artistic':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #78716c, #d97706)',
            padding: '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '9px', marginBottom: '4px' }}>✨</div>
            <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '3px' }}>
              奢华意境
            </div>
            <div style={{ fontSize: '6px', opacity: 0.9, lineHeight: 1.2 }}>
              东方美学<br/>自然之韵
            </div>
          </div>
        );

      default:
        return (
          <div style={{
            ...baseStyle,
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '6px', textAlign: 'center' }}>
              预览<br/>样式
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`transition-all duration-200 ${isSelected ? 'scale-105 ring-2 ring-primary ring-opacity-50' : 'hover:scale-102'}`}>
      {getPreviewContent()}
    </div>
  );
};

export default CoverTemplatePreview; 