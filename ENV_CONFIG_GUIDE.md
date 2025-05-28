# 🔧 环境变量配置指南

## 封面生成功能目前状态

✅ **已修复的问题：**
- 模板系统正常工作（支持新旧两套模板）
- API降级方案正常运行
- 端口自动切换机制正常
- 错误处理机制完善

## 🌍 新增功能：AI智能翻译

✅ **翻译功能特色：**
- 支持13种语言互译
- 智能语言自动检测
- 保持文本格式和风格
- 适配社交媒体语言特色
- API降级方案（无API密钥时仍可使用基础功能）

### 📝 翻译功能测试

访问: `translate_test.html` - 完整的翻译功能测试界面

### 🔄 支持的语言

- 🇨🇳 中文 (zh)
- 🇺🇸 英语 (en) 
- 🇯🇵 日语 (ja)
- 🇰🇷 韩语 (ko)
- 🇫🇷 法语 (fr)
- 🇩🇪 德语 (de)
- 🇪🇸 西班牙语 (es)
- 🇮🇹 意大利语 (it)
- 🇵🇹 葡萄牙语 (pt)
- 🇷🇺 俄语 (ru)
- 🇸🇦 阿拉伯语 (ar)
- 🇹🇭 泰语 (th)
- 🇻🇳 越南语 (vi)

### 🎯 翻译API调用示例

```bash
# 自动检测语言并翻译
curl http://localhost:3001/api/translate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好，世界！今天天气真不错😊",
    "toLang": "en",
    "autoDetect": true
  }'

# 指定源语言和目标语言
curl http://localhost:3001/api/translate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "fromLang": "en",
    "toLang": "ja"
  }'

# 获取支持的语言列表
curl http://localhost:3001/api/translate
```

## 🚀 快速开始

### 1. 当前功能状态
```bash
# 测试封面生成服务器状态
curl http://localhost:3001/api/generate-card \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"测试内容","size":"xiaohongshu","template":"minimal_grid"}'

# 测试翻译服务器状态
curl http://localhost:3001/api/translate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"测试翻译","toLang":"en"}'
```

### 2. 可用测试页面
- `test_generation.html` - 完整的封面生成测试界面
- `translate_test.html` - 完整的翻译功能测试界面

### 3. API密钥配置（可选）

如果要启用完整的AI功能，需要配置DeepSeek API密钥：

```bash
# 在项目根目录创建 .env.local 文件
echo 'DEEPSEEK_API_KEY=your_api_key_here' > .env.local

# 重启开发服务器
npm run dev
```

## 📋 可用模板列表

### 经典模板（旧系统）
- `minimal_grid` - 极简格栅主义
- `scene_photo_xiaohongshu` - 小红书经典风格
- `flowing_tech_blue` - 科技蓝商务风
- `soft_rounded_card` - 温柔圆角风格
- `modern_business_info` - 现代商务资讯风
- `industrial_rebellion` - 新潮工业反叛风
- `tech_knowledge_sharing` - 科技感知识分享
- `luxury_natural_artistic` - 奢华自然意境风

### 增强模板（新系统）
- `premium_glass_morphism` - 高端玻璃质感
- `vibrant_3d_card` - 活力3D卡片
- `minimalist_tech_lines` - 极简科技线条

## 🎯 功能测试方法

### 封面生成测试

#### 方法1: 使用测试页面
1. 打开 `test_generation.html`
2. 输入文字内容
3. 选择尺寸和模板
4. 点击生成

#### 方法2: 直接API调用
```bash
# 测试不同模板
curl http://localhost:3001/api/generate-card \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "text": "5款热门面膜实测！这款性价比居然最高？",
    "size": "xiaohongshu",
    "template": "premium_glass_morphism"
  }'
```

### 翻译功能测试

#### 方法1: 使用测试页面
1. 打开 `translate_test.html`
2. 输入要翻译的内容
3. 选择源语言和目标语言
4. 点击翻译按钮

#### 方法2: 快捷键操作
- `Ctrl+Enter`: 快速翻译
- 点击 `⇄` 按钮: 交换语言

#### 方法3: 直接API调用
```bash
# 中文翻译为英文
curl http://localhost:3001/api/translate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "text": "5款超好用的护肤品推荐！这个性价比绝了🔥",
    "toLang": "en"
  }'

# 英文翻译为日文
curl http://localhost:3001/api/translate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "text": "How to create engaging content for social media",
    "fromLang": "en",
    "toLang": "ja"
  }'
```

## 🔄 降级方案说明

### 封面生成降级方案
即使没有API密钥，系统也会提供：
- ✅ 精美的CSS渐变背景
- ✅ 适当的字体排版
- ✅ 正确的尺寸比例
- ✅ 模板风格标识

### 翻译功能降级方案
即使没有API密钥，系统也会提供：
- ✅ 基础的语言检测功能
- ✅ 错误提示和用户反馈
- ✅ 完整的界面和交互逻辑
- ✅ 配置指导信息

## 🛠 故障排除

### 问题1: 端口冲突
```bash
# 杀死占用端口的进程
pkill -f "next"
npm run dev
```

### 问题2: 模板找不到
确保使用上面列出的正确模板名称

### 问题3: API调用失败
- 检查服务器是否运行在正确端口（3001）
- 使用降级方案继续工作
- 配置API密钥获得完整功能

### 问题4: 翻译功能不工作
```bash
# 检查翻译API状态
curl http://localhost:3001/api/translate

# 测试基础翻译
curl http://localhost:3001/api/translate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","toLang":"zh"}'
```

## 💡 开发建议

1. **离线开发**: 降级方案足够进行界面和布局开发
2. **功能测试**: 使用测试页面快速验证不同功能效果
3. **API集成**: 配置API密钥后获得完整的AI生成和翻译能力
4. **语言检测**: 翻译功能支持自动语言检测，适合多语言内容处理
5. **格式保持**: 翻译功能会保持原文的格式和emoji表情

## 🔗 快速链接

- **封面生成测试**: `test_generation.html`
- **翻译功能测试**: `translate_test.html`
- **API文档**: 
  - 封面生成: `POST /api/generate-card`
  - 翻译功能: `POST /api/translate`
  - 语言列表: `GET /api/translate`

---

**当前状态: 🟢 封面生成功能正常运行 | 🟢 翻译功能正常运行** 