# 老旺AI - 项目管理与开发规范

## 项目概览

老旺AI是一个基于AI技术的内容创作平台，致力于为用户提供高质量的内容生成、编辑和优化服务。

### 项目目标

**核心目标：**
- 构建用户友好的AI内容创作平台
- 提供稳定可靠的AI服务接口
- 实现高性能、高可用的系统架构
- 建立完善的用户管理和计费体系

**技术目标：**
- 前端响应时间 < 2秒
- API响应时间 < 1秒
- 系统可用性 > 99.9%
- 支持10万+并发用户

## 开发流程

### 1. Git工作流

**分支策略：**

```
main (生产环境)
├── develop (开发环境)
│   ├── feature/user-auth (功能分支)
│   ├── feature/content-generation (功能分支)
│   └── feature/payment-system (功能分支)
├── release/v1.0.0 (发布分支)
└── hotfix/critical-bug (热修复分支)
```

**分支命名规范：**
- `feature/功能名称` - 新功能开发
- `bugfix/问题描述` - Bug修复
- `hotfix/紧急修复` - 生产环境紧急修复
- `release/版本号` - 发布准备
- `docs/文档更新` - 文档更新

**提交信息规范：**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型说明：**
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例：**
```
feat(auth): 添加JWT认证功能

- 实现用户登录/注册接口
- 添加JWT token生成和验证
- 集成Redis存储用户会话

Closes #123
```

### 2. 代码审查流程

**Pull Request规范：**

1. **PR标题格式：**
   ```
   [类型] 简短描述 (#Issue号)
   ```

2. **PR描述模板：**
   ```markdown
   ## 变更说明
   - [ ] 新功能
   - [ ] Bug修复
   - [ ] 代码重构
   - [ ] 文档更新

   ## 变更内容
   详细描述本次变更的内容和原因

   ## 测试说明
   - [ ] 单元测试通过
   - [ ] 集成测试通过
   - [ ] 手动测试完成

   ## 相关Issue
   Closes #123

   ## 截图/演示
   （如果适用）
   ```

3. **审查检查清单：**
   - [ ] 代码符合规范
   - [ ] 测试覆盖率达标
   - [ ] 文档已更新
   - [ ] 性能影响评估
   - [ ] 安全性检查

### 3. 发布流程

**版本号规范：**
- 主版本号：不兼容的API修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

**发布步骤：**

1. **准备发布分支**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.1.0
   ```

2. **更新版本信息**
   ```bash
   # 更新package.json版本号
   npm version 1.1.0
   
   # 更新CHANGELOG.md
   echo "## [1.1.0] - $(date +%Y-%m-%d)" >> CHANGELOG.md
   ```

3. **测试验证**
   ```bash
   # 运行完整测试套件
   npm run test:full
   
   # 构建生产版本
   npm run build:prod
   
   # 部署到预发布环境
   npm run deploy:staging
   ```

4. **合并发布**
   ```bash
   # 合并到main分支
   git checkout main
   git merge release/v1.1.0
   git tag v1.1.0
   git push origin main --tags
   
   # 合并回develop分支
   git checkout develop
   git merge release/v1.1.0
   git push origin develop
   ```

## 代码规范

### 1. TypeScript/JavaScript规范

**ESLint配置：**

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn"
  }
}
```

**命名规范：**

```typescript
// 变量和函数：camelCase
const userName = 'john';
const getUserProfile = () => {};

// 常量：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.laowangai.com';
const MAX_RETRY_COUNT = 3;

// 类和接口：PascalCase
class UserService {}
interface ApiResponse {}

// 文件名：kebab-case
// user-profile.tsx
// api-client.ts
```

**函数规范：**

```typescript
/**
 * 获取用户信息
 * @param userId 用户ID
 * @param includeProfile 是否包含详细信息
 * @returns 用户信息对象
 */
async function getUserInfo(
  userId: string,
  includeProfile: boolean = false
): Promise<UserInfo> {
  // 参数验证
  if (!userId) {
    throw new Error('用户ID不能为空');
  }

  try {
    const response = await apiClient.get(`/users/${userId}`, {
      params: { include_profile: includeProfile }
    });
    
    return response.data;
  } catch (error) {
    logger.error('获取用户信息失败', { userId, error });
    throw error;
  }
}
```

### 2. React组件规范

**组件结构：**

```typescript
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types/user';

interface UserProfileCardProps {
  userId: string;
  onUpdate?: (profile: UserProfile) => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userId,
  onUpdate
}) => {
  // 状态定义
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 自定义Hook
  const { user } = useAuth();
  
  // 副作用
  useEffect(() => {
    loadUserProfile();
  }, [userId]);
  
  // 事件处理函数
  const handleUpdate = async () => {
    setLoading(true);
    try {
      // 更新逻辑
      onUpdate?.(profile);
    } catch (error) {
      console.error('更新失败', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 渲染函数
  const loadUserProfile = async () => {
    // 加载逻辑
  };
  
  // 条件渲染
  if (!profile) {
    return <div>加载中...</div>;
  }
  
  return (
    <div className="user-profile-card">
      <h3>{profile.name}</h3>
      <Button onClick={handleUpdate} disabled={loading}>
        {loading ? '更新中...' : '更新'}
      </Button>
    </div>
  );
};
```

**Hook规范：**

```typescript
import { useState, useEffect } from 'react';
import { ApiResponse } from '@/types/api';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      const result = await response.json();
      
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [url]);
  
  return { data, loading, error, refetch: fetchData };
}
```

### 3. CSS/样式规范

**Tailwind CSS规范：**

```typescript
// 使用语义化的类名组合
const buttonStyles = {
  base: 'px-4 py-2 rounded-md font-medium transition-colors',
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700'
};

// 响应式设计
const cardStyles = 'w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md sm:max-w-lg md:max-w-xl lg:max-w-2xl';

// 使用CSS变量进行主题定制
const themeStyles = {
  light: 'bg-white text-gray-900',
  dark: 'bg-gray-900 text-white'
};
```

## 测试策略

### 1. 测试金字塔

```
        E2E Tests (10%)
       ┌─────────────────┐
      │  Cypress/Playwright │
     └─────────────────────┘
    
    Integration Tests (20%)
   ┌─────────────────────────┐
  │    Jest + Testing Library  │
 └───────────────────────────┘

Unit Tests (70%)
┌─────────────────────────────────┐
│         Jest + Vitest            │
└─────────────────────────────────┘
```

### 2. 单元测试规范

**测试文件结构：**

```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── utils/
│   ├── api.ts
│   └── __tests__/
│       └── api.test.ts
└── hooks/
    ├── useAuth.ts
    └── __tests__/
        └── useAuth.test.ts
```

**测试示例：**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button组件', () => {
  it('应该正确渲染按钮文本', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });
  
  it('应该在点击时调用onClick回调', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>点击我</Button>);
    
    fireEvent.click(screen.getByText('点击我'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('应该在disabled状态下禁用点击', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>点击我</Button>);
    
    fireEvent.click(screen.getByText('点击我'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 3. 集成测试规范

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfile } from '../UserProfile';
import { mockApiResponse } from '@/test-utils/mocks';

describe('UserProfile集成测试', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });
  
  it('应该正确加载和显示用户信息', async () => {
    mockApiResponse('/api/users/123', {
      id: '123',
      name: '张三',
      email: 'zhangsan@example.com'
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <UserProfile userId="123" />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('zhangsan@example.com')).toBeInTheDocument();
    });
  });
});
```

### 4. E2E测试规范

```typescript
// cypress/e2e/user-auth.cy.ts
describe('用户认证流程', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  
  it('应该能够成功登录', () => {
    // 输入用户名和密码
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    
    // 点击登录按钮
    cy.get('[data-testid=login-button]').click();
    
    // 验证登录成功
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=user-menu]').should('be.visible');
  });
  
  it('应该显示错误信息当凭据无效时', () => {
    cy.get('[data-testid=email-input]').type('invalid@example.com');
    cy.get('[data-testid=password-input]').type('wrongpassword');
    cy.get('[data-testid=login-button]').click();
    
    cy.get('[data-testid=error-message]')
      .should('be.visible')
      .and('contain', '用户名或密码错误');
  });
});
```

## 性能优化

### 1. 前端性能优化

**代码分割：**

```typescript
// 路由级别的代码分割
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const UserProfile = lazy(() => import('@/pages/UserProfile'));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Suspense>
  );
}
```

**图片优化：**

```typescript
import Image from 'next/image';

// 使用Next.js Image组件进行自动优化
<Image
  src="/avatar.jpg"
  alt="用户头像"
  width={100}
  height={100}
  priority={true} // 关键图片优先加载
  placeholder="blur" // 模糊占位符
  blurDataURL="data:image/jpeg;base64,..." // 占位符数据
/>
```

**缓存策略：**

```typescript
// React Query缓存配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error.status === 404) return false;
        return failureCount < 3;
      }
    }
  }
});
```

### 2. 后端性能优化

**数据库查询优化：**

```sql
-- 添加索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_usage_records_user_date ON usage_records(user_id, created_at);

-- 查询优化
EXPLAIN SELECT u.*, ur.total_usage 
FROM users u 
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_usage 
  FROM usage_records 
  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY user_id
) ur ON u.id = ur.user_id 
WHERE u.status = 'active';
```

**API响应优化：**

```typescript
// 分页查询
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

async function getUsers(params: PaginationParams) {
  const { page, limit, sortBy = 'created_at', sortOrder = 'desc' } = params;
  const offset = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    db.users.findMany({
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        nickname: true,
        created_at: true
        // 只选择必要字段
      }
    }),
    db.users.count()
  ]);
  
  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

## 安全规范

### 1. 前端安全

**XSS防护：**

```typescript
// 使用DOMPurify清理HTML内容
import DOMPurify from 'dompurify';

function SafeHTML({ content }: { content: string }) {
  const cleanHTML = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
}

// 避免直接使用dangerouslySetInnerHTML
// 使用React的自动转义
function UserComment({ comment }: { comment: string }) {
  return <p>{comment}</p>; // React会自动转义
}
```

**CSRF防护：**

```typescript
// 使用CSRF Token
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(userData)
});
```

### 2. 后端安全

**输入验证：**

```typescript
import { z } from 'zod';

// 定义验证模式
const userRegistrationSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少8位').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
  nickname: z.string().min(2, '昵称至少2位').max(20, '昵称最多20位')
});

// API路由中使用
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = userRegistrationSchema.parse(body);
    
    // 处理验证通过的数据
    return await createUser(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    throw error;
  }
}
```

**SQL注入防护：**

```typescript
// 使用参数化查询
async function getUserByEmail(email: string) {
  // ✅ 正确：使用参数化查询
  const user = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  
  // ❌ 错误：字符串拼接
  // const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
  
  return user;
}
```

## 监控和日志

### 1. 错误监控

**前端错误监控：**

```typescript
// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
  // 发送到错误监控服务
  sendErrorToMonitoring({
    message: event.error.message,
    stack: event.error.stack,
    url: window.location.href,
    userAgent: navigator.userAgent
  });
});

// React错误边界
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('React错误:', error, errorInfo);
    sendErrorToMonitoring({
      error: error.toString(),
      errorInfo,
      component: this.constructor.name
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>出现了错误，请刷新页面重试</h1>;
    }
    
    return this.props.children;
  }
}
```

### 2. 性能监控

```typescript
// Web Vitals监控
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // 发送到分析服务
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 3. 日志规范

```typescript
// 结构化日志
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private createLogEntry(level: LogEntry['level'], message: string, metadata?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      userId: getCurrentUserId(),
      requestId: getCurrentRequestId(),
      metadata
    };
  }
  
  info(message: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry('info', message, metadata);
    console.log(JSON.stringify(entry));
  }
  
  error(message: string, error?: Error, metadata?: Record<string, any>) {
    const entry = this.createLogEntry('error', message, {
      ...metadata,
      error: error?.message,
      stack: error?.stack
    });
    console.error(JSON.stringify(entry));
  }
}

export const logger = new Logger();
```

## 文档规范

### 1. API文档

```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 创建新用户
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 用户邮箱
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: 用户密码
 *     responses:
 *       201:
 *         description: 用户创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: 请求参数错误
 */
```

### 2. 组件文档

```typescript
/**
 * 用户头像组件
 * 
 * @example
 * ```tsx
 * <Avatar 
 *   src="/avatar.jpg" 
 *   alt="用户头像" 
 *   size="large" 
 *   fallback="张三"
 * />
 * ```
 */
interface AvatarProps {
  /** 头像图片URL */
  src?: string;
  /** 图片alt属性 */
  alt: string;
  /** 头像尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 图片加载失败时的后备文本 */
  fallback?: string;
  /** 点击事件处理函数 */
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({ ... }) => {
  // 组件实现
};
```

## 团队协作

### 1. 代码审查清单

**功能性检查：**
- [ ] 功能是否按需求正确实现
- [ ] 边界条件是否正确处理
- [ ] 错误处理是否完善
- [ ] 性能是否满足要求

**代码质量检查：**
- [ ] 代码是否遵循团队规范
- [ ] 变量和函数命名是否清晰
- [ ] 代码是否有适当的注释
- [ ] 是否存在重复代码

**安全性检查：**
- [ ] 输入验证是否充分
- [ ] 敏感信息是否正确处理
- [ ] 权限控制是否正确
- [ ] SQL注入等安全问题

**测试检查：**
- [ ] 单元测试是否充分
- [ ] 测试用例是否覆盖主要场景
- [ ] 集成测试是否通过
- [ ] 性能测试是否满足要求

### 2. 沟通规范

**会议规范：**
- 每日站会：15分钟，同步进度和问题
- 周会：1小时，回顾和计划
- 月度回顾：2小时，总结和改进

**文档规范：**
- 技术方案需要设计文档
- 重要决策需要记录原因
- API变更需要更新文档
- 部署步骤需要详细说明

**问题处理：**
- P0：立即处理（生产环境故障）
- P1：当天处理（功能异常）
- P2：本周处理（优化改进）
- P3：下个版本处理（新功能）

---

**文档版本：** v1.0.0  
**最后更新：** 2024-01-01  
**维护团队：** 老旺AI开发团队 