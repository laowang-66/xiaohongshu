# 小红书模块认证系统配置说明

## 功能概述

本模块基于 NestJS + TypeORM + JWT 实现完整的用户认证和密钥管理系统，包含以下功能：

### 1. 用户认证
- 用户注册/登录（邮箱+密码）
- JWT Token 认证
- 密码加密存储（bcrypt）
- 会话管理

### 2. 密钥管理
- 密钥激活功能
- 可配置使用期限和调用次数
- 自动调用次数扣减
- 密钥状态管理

### 3. API调用保护
- 所有API调用都需要JWT认证
- 自动验证密钥有效性
- 调用成功后自动扣减次数
- 使用记录追踪

## 技术栈

- **后端框架**: NestJS
- **数据库**: MySQL
- **ORM**: TypeORM
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcrypt
- **API文档**: Swagger

## 文件结构

```
src/module/xiaohongshu/
├── entities/                    # 数据库实体
│   ├── xhs-user.entity.ts      # 用户实体
│   ├── xhs-user-key.entity.ts  # 用户密钥实体
│   ├── xhs-key-template.entity.ts # 密钥模板实体
│   ├── xhs-usage-record.entity.ts # 使用记录实体
│   ├── xhs-content-generation.entity.ts # 内容生成记录实体
│   └── xhs-user-session.entity.ts # 用户会话实体
├── dto/                         # 数据传输对象
│   ├── auth/
│   │   ├── register.dto.ts     # 注册DTO
│   │   ├── login.dto.ts        # 登录DTO
│   │   └── refresh-token.dto.ts # 刷新Token DTO
│   ├── key/
│   │   ├── activate-key.dto.ts # 激活密钥DTO
│   │   └── key-status.dto.ts   # 密钥状态DTO
│   └── content/
│       ├── extract-content.dto.ts # 内容提炼DTO
│       └── search-content.dto.ts  # 搜索内容DTO
├── services/                    # 服务层
│   ├── auth.service.ts         # 认证服务
│   ├── key.service.ts          # 密钥服务
│   ├── content.service.ts      # 内容服务
│   └── usage.service.ts        # 使用统计服务
├── controllers/                 # 控制器层
│   ├── auth.controller.ts      # 认证控制器
│   ├── key.controller.ts       # 密钥控制器
│   ├── content.controller.ts   # 内容控制器
│   └── user.controller.ts      # 用户控制器
├── guards/                      # 守卫
│   ├── jwt-auth.guard.ts       # JWT认证守卫
│   └── key-validation.guard.ts # 密钥验证守卫
├── decorators/                  # 装饰器
│   ├── current-user.decorator.ts # 当前用户装饰器
│   └── api-key-required.decorator.ts # API密钥必需装饰器
├── strategies/                  # 认证策略
│   └── jwt.strategy.ts         # JWT策略
└── xiaohongshu.module.ts       # 模块定义
```

## 配置步骤

### 1. 环境变量配置

在项目配置文件中添加小红书模块相关配置：

```typescript
// config/configuration.ts
export default {
  // ... 其他配置
  xiaohongshu: {
    jwt: {
      secret: 'xiaohongshu-jwt-secret-key',
      expiresIn: '7d',
    },
    bcrypt: {
      saltRounds: 10,
    },
    keySettings: {
      defaultType: 'trial',
      trialDuration: 7, // 天数
      trialCalls: 50,   // 次数
    },
  },
};
```

### 2. 数据库实体

#### 用户实体 (XhsUser)

```typescript
import { Entity, Column, OneToMany } from 'typeorm';
import { BasePo } from '@/common/base.po';
import * as bcrypt from 'bcrypt';

export enum XhsUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

@Entity({ name: 'xhs_users' })
export class XhsUser extends BasePo {
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ nullable: true })
  nickname?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'enum', enum: XhsUserStatus, default: XhsUserStatus.ACTIVE })
  status: XhsUserStatus;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'last_login', nullable: true })
  lastLogin?: Date;

  @Column({ name: 'login_count', default: 0 })
  loginCount: number;

  @OneToMany(() => XhsUserKey, userKey => userKey.user)
  userKeys: XhsUserKey[];

  // 密码加密
  async hashPassword(password: string): Promise<void> {
    this.passwordHash = await bcrypt.hash(password, 10);
  }

  // 验证密码
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }
}
```

#### 用户密钥实体 (XhsUserKey)

```typescript
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasePo } from '@/common/base.po';
import { XhsUser } from './xhs-user.entity';

export enum XhsUserKeyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

@Entity({ name: 'xhs_user_keys' })
export class XhsUserKey extends BasePo {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'key_code', unique: true })
  keyCode: string;

  @Column()
  type: string;

  @Column({ name: 'total_calls' })
  totalCalls: number;

  @Column({ name: 'remaining_calls' })
  remainingCalls: number;

  @Column({ name: 'activated_at', default: () => 'CURRENT_TIMESTAMP' })
  activatedAt: Date;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'enum', enum: XhsUserKeyStatus, default: XhsUserKeyStatus.ACTIVE })
  status: XhsUserKeyStatus;

  @ManyToOne(() => XhsUser, user => user.userKeys)
  @JoinColumn({ name: 'user_id' })
  user: XhsUser;

  // 检查密钥是否有效
  isValid(): boolean {
    return this.status === XhsUserKeyStatus.ACTIVE && 
           this.remainingCalls > 0 && 
           new Date() < this.expiresAt;
  }

  // 消费调用次数
  consumeCall(): boolean {
    if (!this.isValid()) {
      return false;
    }
    this.remainingCalls--;
    return true;
  }
}
```

### 3. 认证服务

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { XhsUser } from '../entities/xhs-user.entity';
import { XhsUserKey } from '../entities/xhs-user-key.entity';
import { RegisterDto } from '../dto/auth/register.dto';
import { LoginDto } from '../dto/auth/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(XhsUser)
    private userRepository: Repository<XhsUser>,
    @InjectRepository(XhsUserKey)
    private userKeyRepository: Repository<XhsUserKey>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, nickname } = registerDto;

    // 检查邮箱是否已存在
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('邮箱已被注册');
    }

    // 创建用户
    const user = new XhsUser();
    user.email = email;
    user.nickname = nickname;
    await user.hashPassword(password);

    const savedUser = await this.userRepository.save(user);

    // 自动分配体验版密钥
    await this.assignTrialKey(savedUser.id);

    // 生成JWT Token
    const payload = { sub: savedUser.id, email: savedUser.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        nickname: savedUser.nickname,
        status: savedUser.status,
        createTime: savedUser.createTime,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 查找用户
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 更新登录信息
    user.lastLogin = new Date();
    user.loginCount++;
    await this.userRepository.save(user);

    // 生成JWT Token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        lastLogin: user.lastLogin,
      },
    };
  }

  async validateUser(userId: string): Promise<XhsUser> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }

  private async assignTrialKey(userId: string) {
    const trialKey = new XhsUserKey();
    trialKey.userId = userId;
    trialKey.keyCode = this.generateKeyCode();
    trialKey.type = 'trial';
    trialKey.totalCalls = 50;
    trialKey.remainingCalls = 50;
    trialKey.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天后过期

    await this.userKeyRepository.save(trialKey);
  }

  private generateKeyCode(): string {
    const prefix = 'XHS-TRIAL';
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}-${random.toUpperCase()}`;
  }
}
```

### 4. JWT策略

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import configuration from 'config/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuration.xiaohongshu.jwt.secret,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

### 5. 认证守卫

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 检查是否标记为公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### 6. 密钥验证守卫

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { XhsUserKey } from '../entities/xhs-user-key.entity';

@Injectable()
export class KeyValidationGuard implements CanActivate {
  constructor(
    @InjectRepository(XhsUserKey)
    private userKeyRepository: Repository<XhsUserKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    // 查找用户的有效密钥
    const activeKey = await this.userKeyRepository.findOne({
      where: {
        userId: user.id,
        status: 'active',
      },
      order: { expiresAt: 'DESC' },
    });

    if (!activeKey || !activeKey.isValid()) {
      throw new ForbiddenException('没有有效的密钥，请激活密钥');
    }

    // 将密钥信息添加到请求对象中
    request.userKey = activeKey;
    return true;
  }
}
```

### 7. 控制器示例

```typescript
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { KeyValidationGuard } from '../guards/key-validation.guard';
import { RegisterDto } from '../dto/auth/register.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { Public } from '../decorators/public.decorator';

@Controller('xiaohongshu/auth')
@ApiTags('小红书认证')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      message: '注册成功',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      message: '登录成功',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户信息' })
  async getProfile(@Request() req) {
    return {
      success: true,
      message: '查询成功',
      data: { user: req.user },
      timestamp: new Date().toISOString(),
    };
  }
}

@Controller('xiaohongshu/content')
@ApiTags('小红书内容')
@UseGuards(JwtAuthGuard, KeyValidationGuard)
@ApiBearerAuth()
export class ContentController {
  @Post('extract')
  @ApiOperation({ summary: '内容提炼' })
  async extractContent(@Request() req, @Body() extractDto: any) {
    // 自动扣减密钥次数
    const userKey = req.userKey;
    userKey.consumeCall();
    await this.userKeyRepository.save(userKey);

    // 执行内容提炼逻辑
    // ...

    return {
      success: true,
      message: '内容生成成功',
      data: {
        note: '生成的内容...',
        usageRecord: {
          id: 'uuid',
          actionType: 'extract_content',
          remainingCalls: userKey.remainingCalls,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
```

### 8. 模块配置

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { XhsUser } from './entities/xhs-user.entity';
import { XhsUserKey } from './entities/xhs-user-key.entity';
import { XhsKeyTemplate } from './entities/xhs-key-template.entity';
import { XhsUsageRecord } from './entities/xhs-usage-record.entity';
import { AuthService } from './services/auth.service';
import { KeyService } from './services/key.service';
import { AuthController } from './controllers/auth.controller';
import { ContentController } from './controllers/content.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import configuration from 'config/configuration';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      XhsUser,
      XhsUserKey,
      XhsKeyTemplate,
      XhsUsageRecord,
    ]),
    PassportModule,
    JwtModule.register({
      secret: configuration.xiaohongshu.jwt.secret,
      signOptions: { expiresIn: configuration.xiaohongshu.jwt.expiresIn },
    }),
  ],
  controllers: [AuthController, ContentController],
  providers: [AuthService, KeyService, JwtStrategy],
  exports: [AuthService, KeyService],
})
export class XiaohongshuModule {}
```

## 使用流程

### 用户使用流程

1. **注册账户**：用户使用邮箱和密码注册账户
2. **自动分配体验密钥**：注册成功后自动获得体验版密钥
3. **登录获取Token**：使用邮箱密码登录，获得JWT Token
4. **使用API功能**：携带Token调用各种内容生成API
5. **密钥管理**：查看密钥状态，激活新密钥

### API调用流程

1. **Token验证**：JWT守卫验证用户身份
2. **密钥验证**：密钥守卫检查用户是否有有效密钥
3. **执行业务逻辑**：处理具体的API请求
4. **扣减次数**：成功执行后自动扣减密钥调用次数
5. **记录使用**：保存使用记录用于统计分析

## 安全考虑

### 1. 密码安全
- 使用 bcrypt 加密存储密码
- 密码强度验证
- 防止暴力破解

### 2. Token安全
- JWT Token 有过期时间
- 支持Token刷新机制
- 敏感操作需要重新验证

### 3. API安全
- 所有API都需要认证
- 密钥验证防止滥用
- 请求频率限制

### 4. 数据安全
- 敏感数据加密存储
- 数据库连接加密
- 定期备份数据

## 监控和日志

### 1. 使用统计
- 实时监控API调用次数
- 用户行为分析
- 密钥使用情况统计

### 2. 错误监控
- API调用失败记录
- 系统异常监控
- 性能指标追踪

### 3. 安全审计
- 登录失败记录
- 异常访问检测
- 权限变更日志

## 故障排除

### 常见问题

1. **JWT Token过期**：检查Token有效期设置
2. **密钥验证失败**：确认密钥状态和剩余次数
3. **数据库连接失败**：检查数据库配置和网络连接
4. **密码加密错误**：确认bcrypt版本和配置

### 调试方法

1. 查看NestJS日志输出
2. 检查数据库记录
3. 使用Swagger测试API
4. 监控系统性能指标

## 更新日志

- v1.0.0: 初始版本，基于NestJS + TypeORM + JWT架构
- 支持邮箱密码注册登录
- 支持密钥激活和管理
- 支持API调用保护和次数扣减
- 支持完整的错误处理和日志记录

---

**技术栈：** NestJS + TypeORM + JWT + MySQL  
**文档更新时间：** 2024-01-01  
**版本：** v1.0.0