import React from 'react';

// 信息卡片数据接口
interface InfoCardData {
  title: string;
  content: string[];
  highlights?: string[];
  summary?: string;
}

// 通用卡片容器样式
const CardContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="info-card-container"
    style={{
      width: '400px',
      minHeight: 'auto',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      margin: '0 auto',
    }}
  >
    {children}
  </div>
);

// 标题栏组件
const CardHeader: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      color: 'white',
      fontSize: '18px',
      fontWeight: '600',
      textAlign: 'center',
    }}
  >
    {title}
  </div>
);

// 内容区域组件
const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: '24px', flex: 1 }}>{children}</div>
);

// 重点文字组件
const HighlightText: React.FC<{ children: React.ReactNode; color?: string; weight?: string; bg?: string }> = ({ 
  children, 
  color = '#667eea',
  weight = '600',
  bg
}) => (
  <span style={{ 
    color, 
    fontWeight: weight,
    backgroundColor: bg,
    padding: bg ? '2px 6px' : '0',
    borderRadius: bg ? '4px' : '0'
  }}>
    {children}
  </span>
);

// 知识总结卡片模板 - 自然阅读流
export const KnowledgeSummaryTemplate: React.FC<{ data: InfoCardData }> = ({ data }) => (
  <CardContainer>
    <CardHeader title={data.title} />
    <CardContent>
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#333' }}>
        {data.content.map((paragraph, index) => (
          <p key={index} style={{ 
            marginBottom: '16px', 
            textAlign: 'justify',
            textIndent: '2em' // 首行缩进
          }}>
            {paragraph}
          </p>
        ))}
        
        {/* 重点内容自然融入 */}
        {data.highlights && data.highlights.length > 0 && (
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            backgroundColor: '#f8f9ff',
            borderRadius: '8px',
            borderLeft: '4px solid #667eea'
          }}>
            {data.highlights.map((highlight, index) => (
              <p key={index} style={{ 
                marginBottom: index === data.highlights!.length - 1 ? '0' : '12px',
                fontSize: '14px',
                lineHeight: '1.7'
              }}>
                <HighlightText color="#4c63d2" weight="600">📌 {highlight}</HighlightText>
              </p>
            ))}
          </div>
        )}

        {/* 总结自然呈现 */}
        {data.summary && (
          <div style={{ 
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%)',
            borderRadius: '8px',
            borderLeft: '4px solid #28a745'
          }}>
            <p style={{ 
              margin: '0',
              fontSize: '14px',
              lineHeight: '1.7',
              fontStyle: 'italic'
            }}>
              <HighlightText color="#155724" weight="600">💡 </HighlightText>
              {data.summary}
            </p>
          </div>
        )}
      </div>
    </CardContent>
  </CardContainer>
);

// 产品介绍卡片模板 - 产品故事化表达
export const ProductIntroTemplate: React.FC<{ data: InfoCardData }> = ({ data }) => (
  <CardContainer>
    <CardHeader title={data.title} />
    <CardContent>
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#333' }}>
        {data.content.map((content, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <p style={{ 
              textAlign: 'justify',
              position: 'relative',
              paddingLeft: '24px'
            }}>
              <span style={{
                position: 'absolute',
                left: '0',
                top: '0',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '10px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {index + 1}
              </span>
              {content}
            </p>
          </div>
        ))}

        {/* 推荐理由融入表达 */}
        {data.highlights && data.highlights.length > 0 && (
          <div style={{ 
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #fff8e1 0%, #fffef7 100%)',
            borderRadius: '8px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '16px',
              background: '#ffc107',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              ⭐ 值得推荐
            </div>
            <div style={{ paddingTop: '8px' }}>
              {data.highlights.map((reason, index) => (
                <p key={index} style={{ 
                  marginBottom: index === data.highlights!.length - 1 ? '0' : '10px',
                  fontSize: '14px',
                  lineHeight: '1.7'
                }}>
                  <HighlightText color="#d97706" weight="600">✓</HighlightText> {reason}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </CardContainer>
);

// 教程步骤卡片模板 - 流程化表达
export const TutorialStepsTemplate: React.FC<{ data: InfoCardData }> = ({ data }) => (
  <CardContainer>
    <CardHeader title={data.title} />
    <CardContent>
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#333' }}>
        {data.content.map((step, index) => (
          <div key={index} style={{ 
            marginBottom: '20px',
            position: 'relative',
            paddingLeft: '40px'
          }}>
            <div style={{
              position: 'absolute',
              left: '0',
              top: '0',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
            }}>
              {index + 1}
            </div>
            
            {/* 连接线 */}
            {index < data.content.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '13px',
                top: '28px',
                width: '2px',
                height: '32px',
                background: 'linear-gradient(180deg, #667eea 0%, #e5e7eb 100%)'
              }} />
            )}
            
            <p style={{ 
              margin: '0',
              textAlign: 'justify',
              backgroundColor: '#f8fafc',
              padding: '12px',
              borderRadius: '8px',
              marginLeft: '-8px'
            }}>
              {step}
            </p>
          </div>
        ))}

        {/* 贴心提示 */}
        {data.highlights && data.highlights.length > 0 && (
          <div style={{ 
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fff 100%)',
            borderRadius: '8px',
            borderLeft: '4px solid #f59e0b'
          }}>
            <p style={{ 
              margin: '0 0 12px 0',
              fontSize: '13px',
              fontWeight: '600',
              color: '#d97706'
            }}>
              💡 贴心提示
            </p>
            {data.highlights.map((tip, index) => (
              <p key={index} style={{ 
                marginBottom: index === data.highlights!.length - 1 ? '0' : '8px',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#7c2d12'
              }}>
                <HighlightText color="#ea580c">• </HighlightText>{tip}
              </p>
            ))}
          </div>
        )}
      </div>
    </CardContent>
  </CardContainer>
);

// 对比分析卡片模板 - 分析表达
export const ComparisonAnalysisTemplate: React.FC<{ data: InfoCardData }> = ({ data }) => (
  <CardContainer>
    <CardHeader title={data.title} />
    <CardContent>
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#333' }}>
        {data.content.map((analysis, index) => (
          <div key={index} style={{ 
            marginBottom: '16px',
            padding: '14px',
            backgroundColor: index % 2 === 0 ? '#f1f5f9' : '#fef7ff',
            borderRadius: '8px',
            borderLeft: `4px solid ${index % 2 === 0 ? '#3b82f6' : '#a855f7'}`
          }}>
            <p style={{ 
              margin: '0',
              textAlign: 'justify'
            }}>
              {analysis}
            </p>
          </div>
        ))}

        {/* 分析结论 */}
        {data.summary && (
          <div style={{ 
            marginTop: '20px',
            padding: '18px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
            borderRadius: '10px',
            border: '2px solid #0ea5e9'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>🎯</span>
              <HighlightText color="#0369a1" weight="700">分析结论</HighlightText>
            </div>
            <p style={{ 
              margin: '0',
              fontSize: '14px',
              lineHeight: '1.7',
              color: '#0c4a6e',
              fontWeight: '500'
            }}>
              {data.summary}
            </p>
          </div>
        )}
      </div>
    </CardContent>
  </CardContainer>
);

// 经验分享卡片模板 - 故事化表达
export const ExperienceSharingTemplate: React.FC<{ data: InfoCardData }> = ({ data }) => (
  <CardContainer>
    <CardHeader title={data.title} />
    <CardContent>
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#333' }}>
        {data.content.map((experience, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <p style={{ 
              textAlign: 'justify',
              textIndent: '2em',
              padding: '12px',
              backgroundColor: '#fefbff',
              borderRadius: '8px',
              borderLeft: '3px solid #a855f7',
              margin: '0'
            }}>
              {experience}
            </p>
          </div>
        ))}

        {/* 经验要点 */}
        {data.highlights && data.highlights.length > 0 && (
          <div style={{ 
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '16px', marginRight: '6px' }}>💎</span>
              <HighlightText color="#15803d" weight="600">精华要点</HighlightText>
            </div>
            {data.highlights.map((tip, index) => (
              <p key={index} style={{ 
                marginBottom: index === data.highlights!.length - 1 ? '0' : '10px',
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#166534'
              }}>
                <HighlightText color="#22c55e" weight="600">→ </HighlightText>{tip}
              </p>
            ))}
          </div>
        )}
      </div>
    </CardContent>
  </CardContainer>
);

// 时间线卡片模板 - 时间轴表达
export const EventTimelineTemplate: React.FC<{ data: InfoCardData }> = ({ data }) => (
  <CardContainer>
    <CardHeader title={data.title} />
    <CardContent>
      <div style={{ position: 'relative', paddingLeft: '24px' }}>
        {/* 主时间线 */}
        <div
          style={{
            position: 'absolute',
            left: '12px',
            top: '0',
            bottom: '0',
            width: '3px',
            background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '2px'
          }}
        />
        
        {data.content.map((event, index) => (
          <div key={index} style={{ 
            marginBottom: '24px', 
            position: 'relative',
            fontSize: '14px',
            lineHeight: '1.8',
            color: '#333'
          }}>
            {/* 时间点 */}
            <div
              style={{
                position: 'absolute',
                left: '-15px',
                top: '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              }}
            />
            
            {/* 事件内容 */}
            <div style={{ 
              paddingLeft: '16px',
              backgroundColor: '#f8fafc',
              padding: '12px',
              borderRadius: '8px',
              marginLeft: '8px'
            }}>
              <p style={{ 
                margin: '0',
                textAlign: 'justify'
              }}>
                {event}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </CardContainer>
);

// 模板映射
export const TEMPLATE_COMPONENTS = {
  knowledge_summary: KnowledgeSummaryTemplate,
  product_intro: ProductIntroTemplate,
  tutorial_steps: TutorialStepsTemplate,
  comparison_analysis: ComparisonAnalysisTemplate,
  experience_sharing: ExperienceSharingTemplate,
  event_timeline: EventTimelineTemplate,
}; 