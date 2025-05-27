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

      // 增强模板预览
      case 'modern_gradient_card':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '12px',
              height: '12px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '50%'
            }}></div>
            <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
              🌈 现代渐变
            </div>
            <div style={{ fontSize: '6px', opacity: 0.9, textAlign: 'center', lineHeight: 1.2 }}>
              时尚科技<br/>玻璃质感
            </div>
          </div>
        );

      case 'neon_cyber_style':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
            padding: '8px',
            color: '#00d2ff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            border: '1px solid #00d2ff'
          }}>
            <div style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '8px',
              height: '8px',
              background: '#ff0080',
              borderRadius: '50%',
              boxShadow: '0 0 10px #ff0080'
            }}></div>
            <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '4px', textShadow: '0 0 5px #00d2ff' }}>
              🔮 霓虹赛博
            </div>
            <div style={{ fontSize: '6px', color: '#00ff88', textAlign: 'center', lineHeight: 1.2 }}>
              未来科技<br/>电子光影
            </div>
          </div>
        );

      case 'elegant_minimal':
        return (
          <div style={{
            ...baseStyle,
            background: '#f8f9fa',
            padding: '12px',
            color: '#495057',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              width: '40px',
              height: '1px',
              background: '#6c757d',
              marginBottom: '8px'
            }}></div>
            <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '6px', textAlign: 'center', letterSpacing: '1px' }}>
              优雅极简
            </div>
            <div style={{ fontSize: '5px', color: '#6c757d', textAlign: 'center' }}>
              简约之美
            </div>
          </div>
        );

      case 'organic_nature':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
            padding: '8px',
            color: '#2e7d32',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '20px'
          }}>
            <div style={{ fontSize: '10px', marginBottom: '4px' }}>🌿</div>
            <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '3px', textAlign: 'center' }}>
              有机自然
            </div>
            <div style={{ fontSize: '6px', color: '#388e3c', textAlign: 'center', lineHeight: 1.2 }}>
              温暖生活<br/>自然曲线
            </div>
          </div>
        );

      case 'retro_vintage':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)',
            padding: '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '50%'
            }}></div>
            <div style={{ fontSize: '9px', marginBottom: '4px' }}>📻</div>
            <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '3px' }}>
              复古怀旧
            </div>
            <div style={{ fontSize: '5px', opacity: 0.9, lineHeight: 1.2 }}>
              经典质感<br/>岁月印记
            </div>
          </div>
        );

      case 'playful_dynamic':
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
            padding: '8px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '8px solid #f9ca24'
            }}></div>
            <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
              🎨 活力动感
            </div>
            <div style={{ fontSize: '6px', textAlign: 'center', lineHeight: 1.2 }}>
              青春活泼<br/>趣味图形
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