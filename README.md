# 老旺AI - 智能内容创作平台

<div align="center">

![老旺AI Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=老旺AI)

**基于AI技术的一站式内容创作平台**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[在线演示](https://laowangai.com) · [文档](./API_DOCUMENTATION.md) · [报告问题](https://github.com/laowangai/issues)

</div>

## 📖 项目简介

老旺AI是一个现代化的AI内容创作平台，致力于为用户提供高质量、高效率的内容生成服务。平台集成了多种AI技术，包括文本生成、图像创作、语音合成等功能，帮助用户快速创建专业的内容。

### ✨ 核心特性

- 🎯 **智能内容提炼** - 从URL或文本中提取关键信息，生成结构化内容
- 🎨 **AI封面设计** - 自动生成精美的封面图片和信息卡片
- 🎙️ **语音合成** - 将文本转换为自然流畅的语音
- 📝 **脚本生成** - 基于内容自动生成视频脚本和文案
- 🔐 **完整认证系统** - 用户注册、登录、密钥管理
- 📊 **使用统计** - 详细的API调用记录和数据分析
- 🎨 **现代化UI** - 响应式设计，支持深色模式

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- MySQL 8.0 数据库
- Redis 缓存服务

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/laowangai/xiaohongshu.git
   cd xiaohongshu
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **环境配置**
   ```bash
   cp .env.example .env.local
   ```
   
   编辑 `.env.local` 文件，配置以下环境变量：
   ```env
   # 数据库配置
   DATABASE_URL="mysql://username:password@localhost:3306/laowangai"
   
   # Redis配置
   REDIS_URL="redis://localhost:6379"
   
   # JWT密钥
   JWT_SECRET="your-super-secret-jwt-key"
   
   # AI服务配置
   OPENAI_API_KEY="your-openai-api-key"
   CLAUDE_API_KEY="your-claude-api-key"
   
   # 应用配置
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   ```

4. **数据库初始化**
   ```bash
   # 创建数据库表
   npm run db:migrate
   
   # 初始化数据
   npm run db:seed
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🏗️ 项目结构

```
xiaohongshu/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API路由
│   │   ├── auth/         # 认证相关API
│   │   ├── key/          # 密钥管理API
│   │   ├── content/      # 内容生成API
│   │   └── voice/        # 语音合成API
│   ├── components/        # React组件
│   │   ├── ui/           # 基础UI组件
│   │   ├── AuthModal.tsx # 认证模态框
│   │   ├── Navigation.tsx # 导航组件
│   │   └── UserStatus.tsx # 用户状态组件
│   ├── lib/              # 工具库
│   │   ├── auth.ts       # 认证逻辑
│   │   ├── db.ts         # 数据库连接
│   │   └── utils.ts      # 通用工具
│   ├── voice-over/       # 语音合成页面
│   ├── script/           # 脚本生成页面
│   ├── short-video/      # 短视频页面
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── docs/                  # 项目文档
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_DESIGN.md
│   ├── DEPLOYMENT_ARCHITECTURE.md
│   └── PROJECT_MANAGEMENT.md
├── public/               # 静态资源
├── .env.example         # 环境变量示例
├── package.json         # 项目配置
├── tailwind.config.js   # Tailwind配置
├── tsconfig.json        # TypeScript配置
└── README.md           # 项目说明
```

## 🎯 功能模块

### 1. 内容提炼与生成

- **URL内容提取** - 智能解析网页内容，提取关键信息
- **文本改写优化** - AI驱动的内容改写和优化
- **多格式输出** - 支持文本、Markdown、JSON等多种格式
- **批量处理** - 支持批量URL处理和内容生成

### 2. 视觉设计

- **封面生成** - 基于内容自动生成吸引人的封面图片
- **信息卡片** - 创建专业的信息图表和卡片设计
- **模板定制** - 多种设计模板和风格选择
- **高清输出** - 支持多种分辨率和格式导出

### 3. 语音合成

- **多语言支持** - 支持中文、英文等多种语言
- **声音选择** - 多种音色和语调选择
- **语速控制** - 可调节语速和音调
- **高质量输出** - 生成自然流畅的语音文件

### 4. 脚本创作

- **智能脚本生成** - 基于内容自动生成视频脚本
- **结构化输出** - 包含场景、对话、动作等完整元素
- **风格定制** - 支持不同类型和风格的脚本
- **导出功能** - 多种格式导出和分享

### 5. 用户管理

- **账户系统** - 完整的用户注册、登录、找回密码
- **密钥管理** - 灵活的API密钥激活和管理
- **使用统计** - 详细的API调用记录和统计分析
- **权限控制** - 基于角色的访问控制

## 🛠️ 技术栈

### 前端技术

- **框架**: Next.js 14 (React 18)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: Headless UI
- **状态管理**: React Hooks + Context
- **图表**: Chart.js / Recharts
- **图像处理**: html2canvas

### 后端技术

- **运行时**: Node.js
- **框架**: Next.js API Routes
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **认证**: JWT + bcrypt
- **验证**: Zod
- **ORM**: Prisma (可选)

### AI服务

- **文本生成**: OpenAI GPT-4, Claude
- **图像生成**: DALL-E, Midjourney API
- **语音合成**: Azure Speech, Google TTS
- **内容分析**: 自研NLP模型

### 开发工具

- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript
- **测试**: Jest + Testing Library
- **构建**: Next.js Build System
- **部署**: Docker + Kubernetes

## 📚 文档

- [API文档](./API_DOCUMENTATION.md) - 完整的API接口文档
- [数据库设计](./DATABASE_DESIGN.md) - 数据库结构和设计说明
- [部署架构](./DEPLOYMENT_ARCHITECTURE.md) - 系统架构和部署指南
- [项目管理](./PROJECT_MANAGEMENT.md) - 开发规范和流程
- [认证设置](./AUTH_SETUP.md) - 认证系统配置指南

## 🔧 开发指南

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 构建生产版本
npm run build
```

### 代码规范

项目使用 ESLint 和 Prettier 进行代码规范化：

```bash
# 检查代码规范
npm run lint

# 自动修复代码格式
npm run lint:fix

# 格式化代码
npm run format
```

### 测试

```bash
# 运行单元测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行E2E测试
npm run test:e2e
```

## 🚀 部署

### Docker部署

1. **构建镜像**
   ```bash
   docker build -t laowangai:latest .
   ```

2. **运行容器**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="your-database-url" \
     -e REDIS_URL="your-redis-url" \
     laowangai:latest
   ```

### Kubernetes部署

```bash
# 应用Kubernetes配置
kubectl apply -f k8s/

# 查看部署状态
kubectl get pods -l app=laowangai
```

### 云平台部署

支持部署到以下平台：

- **Vercel** - 推荐用于前端部署
- **AWS ECS** - 容器化部署
- **阿里云ACK** - Kubernetes部署
- **腾讯云TKE** - 容器服务

## 📊 性能指标

- **首屏加载时间**: < 2秒
- **API响应时间**: < 1秒
- **系统可用性**: > 99.9%
- **并发支持**: 10万+ 用户
- **数据处理**: 支持大文件和批量操作

## 🔒 安全特性

- **数据加密** - 敏感数据加密存储
- **访问控制** - 基于JWT的身份验证
- **输入验证** - 严格的输入验证和清理
- **SQL注入防护** - 参数化查询防止注入攻击
- **XSS防护** - 内容安全策略和输出编码
- **CSRF防护** - CSRF令牌验证

## 🤝 贡献指南

我们欢迎所有形式的贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解如何参与项目开发。

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码审查

所有代码更改都需要通过代码审查：

- 功能正确性检查
- 代码质量评估
- 安全性审查
- 性能影响评估
- 测试覆盖率检查

## 📝 更新日志

### v1.0.0 (2024-01-01)

**新功能:**
- ✨ 完整的用户认证系统
- ✨ AI内容提炼和生成
- ✨ 封面设计和信息卡片生成
- ✨ 语音合成功能
- ✨ 脚本生成功能
- ✨ 使用统计和分析

**技术改进:**
- 🚀 Next.js 14 升级
- 🚀 TypeScript 严格模式
- 🚀 Tailwind CSS 3.0
- 🚀 响应式设计优化

**安全增强:**
- 🔒 JWT认证机制
- 🔒 输入验证和清理
- 🔒 SQL注入防护
- 🔒 XSS和CSRF防护

## 📞 支持与反馈

- **技术支持**: [support@laowangai.com](mailto:support@laowangai.com)
- **问题反馈**: [GitHub Issues](https://github.com/laowangai/issues)
- **功能建议**: [GitHub Discussions](https://github.com/laowangai/discussions)
- **社区交流**: [Discord](https://discord.gg/laowangai)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下开源项目和服务：

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [OpenAI](https://openai.com/) - AI服务
- [Vercel](https://vercel.com/) - 部署平台

---

<div align="center">

**[老旺AI](https://laowangai.com) © 2024 - 让AI创作更简单**

Made with ❤️ by 老旺AI团队

</div> 