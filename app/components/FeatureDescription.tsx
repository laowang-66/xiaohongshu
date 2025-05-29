'use client';

interface FeatureDescriptionProps {
  activeTab: string;
}

const FeatureDescription: React.FC<FeatureDescriptionProps> = ({ activeTab }) => {
  const getFeatureInfo = () => {
    switch (activeTab) {
      case 'extract':
        return {
          title: '📝 内容提炼',
          description: '从任意链接提取内容，AI智能生成小红书爆款笔记，支持预设风格模板和参考爆款内容两种模式'
        };
      case 'search':
        return {
          title: '🔍 全网搜索',
          description: '搜索全网热门内容，覆盖Google、微信公众号、知乎、小红书等8大平台，AI自动整合生成优质笔记'
        };
      case 'rewrite':
        return {
          title: '✏️ 笔记改写',
          description: '将现有内容智能改写为不同平台风格，支持口播短视频、小红书图文、公众号文章等多种格式'
        };
      case 'card':
        return {
          title: '🎨 封面生成',
          description: 'AI驱动的专业封面设计工具，提供8种精美风格模板，一键生成高质量封面图片'
        };
      case 'info-card':
        return {
          title: '📚 信息卡片',
          description: 'AI智能分析长文内容，自动选择最适合的模板，生成2-4张精美的信息卡片，内容分配合理，视觉呈现优雅'
        };
      case 'image':
        return {
          title: '🖼️ 图片生成',
          description: 'AI图片生成功能正在开发中，即将为您提供更多创作可能'
        };
      default:
        return {
          title: '功能介绍',
          description: '请选择一个功能标签查看详细介绍'
        };
    }
  };

  const featureInfo = getFeatureInfo();

  return (
    <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200">
      <div className="text-center">
        <h3 className="font-semibold text-gray-800 mb-2">{featureInfo.title}</h3>
        <p className="text-sm text-gray-600">{featureInfo.description}</p>
      </div>
    </div>
  );
};

export default FeatureDescription; 