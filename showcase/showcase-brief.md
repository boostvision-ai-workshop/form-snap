# Showcase Brief: Build a Micro SaaS By Codex/OpenCode

## 展示主题

60 分钟内用 Codex/OpenCode 从零构建可访问的 Micro SaaS：从想法到上线的 AI 加速之路

## 目标受众

Engineering 全员 + Product 团队 + 对全栈 AI 驱动开发感兴趣的跨部门同事

## 1. 问题背景（5 min）

- Micro SaaS 从想法到上线通常需要数周：需求分析 → 架构设计 → 前后端开发 → 登录/支付集成 → 部署上线
- 全栈开发涉及多技术栈（前端/后端/数据库/登录/支付/CDN），每一环都可能成为瓶颈
- AI Agent（Codex/OpenCode）能否在 60 分钟内完成全链路？本 Showcase 现场验证

## 2. Showcase 大纲

### Part 1：目标说明（5 min）

- 介绍 Showcase 规则与评审标准
- 展示冻结版 PRD/Design 与登录/付费路径设计
- 明确技术栈约束（Next.js + Supabase + Stripe + Vercel）

### Part 2：PRD/Design → 全栈架构设计（15 min）

- 使用 Codex/OpenCode 解析冻结版 PRD，提取功能模块与数据模型
- 设计数据库 Schema（Supabase PostgreSQL）
- 规划 API 路由与权限模型
- 生成登录/付费路径与权益映射（Ano/Authed/Free/Pro/Enterprise）
- 产出：项目骨架 + 数据库 Schema + API 设计

### Part 3：前后端实现（20 min）

- 前端：使用 Next.js + Tailwind CSS 构建 Landing Page、Dashboard、核心功能页
- 后端：Supabase 数据库与 Auth 集成、API Routes 实现
- 使用 `tailwind-patterns` Skill 加速 UI 开发
- 使用 `systematic-debugging` Skill 实时调试
- 调用 `supabase` MCP 管理数据库与认证

### Part 4：部署 + 付费集成（15 min）

- Stripe 集成：使用 `stripe` MCP + `stripe-integration` Skill
  - 创建 Products/Prices
  - Checkout Session 与 Webhook 处理
  - 权益门控（Subscription 状态校验）
- Vercel 部署：使用 Vercel CLI 完成前端部署
- 端到端验证：注册 → 登录 → 付费 → 使用核心功能
- 产出：可公开访问的 SaaS 站点 + 可用的付费流程

### Part 5：评审答疑（5 min）

- 评委点评与打分
- 团队经验分享与踩坑复盘
- Q&A

## 3. 演示形式

- **现场 Live Coding + 分组并行**：各组基于相同冻结版 PRD 并行开发，60 分钟内完成
- 每组配备 1 台投屏设备，评委可实时观察开发过程
- 最终验收：评委在浏览器中实际访问并测试
- 备用方案：如遇网络/服务故障，切换至预录演示视频

## 4. 准备清单

- [ ] D2 冻结版 PRD（经 Product 评审确认）
- [ ] D2 付费路径与权益映射文档
- [ ] Supabase 项目预创建（数据库/Auth 已开通）
- [ ] Stripe 测试 Key（Publishable Key + Secret Key）
- [ ] Vercel 账号（部署权限就绪）
- [ ] 开发环境就绪（Codex/OpenCode 均配置完成，MCP Server 连通）
- [ ] Node.js ≥ 18 + pnpm/npm 就绪
- [ ] 评审标准与评分表打印/飞书文档就绪
- [ ] 录屏备份工具准备（OBS/系统录屏）

## 5. 评审标准

| 维度 | 权重 | 说明 |
|------|------|------|
| 可访问性 | 30% | 60 分钟内站点能否公开访问且核心功能可用 |
| 关键流程完整度 | 25% | 注册→登录→核心功能→付费 全流程是否跑通 |
| 代码质量与架构 | 20% | 全栈架构合理性、代码可维护性 |
| 业务价值 | 15% | 付费路径设计合理性、商业模式可行性 |
| 现场演示表现 | 10% | 演示流畅度、问题应对能力 |

## 6. 评审结果

- 评分：（Showcase 当天填写）
- 评委点评：（Showcase 当天填写）
- 改进建议：（Showcase 当天填写）
