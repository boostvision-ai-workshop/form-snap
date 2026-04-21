# AI 驱动的 Micro SaaS 开发：从模板工程到 Agent 工作流

> 技术分享 · 2026 年 4 月
>
> 项目地址：https://github.com/boostvision-ai-workshop/micro_saas_dev_agent

---

## 目录

1. [开场：为什么做这个项目](#1-开场为什么做这个项目)
2. [项目全景：模板 + Agent 双重身份](#2-项目全景模板--agent-双重身份)
3. [模板工程架构](#3-模板工程架构)
4. [Agent 工作流系统设计](#4-agent-工作流系统设计)
5. [重构历程：从 V1 到 V2](#5-重构历程从-v1-到-v2)
6. [关键设计决策与 Trade-off](#6-关键设计决策与-trade-off)
7. [实际验证与 Demo 回顾](#7-实际验证与-demo-回顾)
8. [经验教训与未来展望](#8-经验教训与未来展望)

---

## 1. 开场：为什么做这个项目

### 问题

Micro SaaS 从想法到上线通常需要数周：

```
需求分析 → 架构设计 → 前后端开发 → 登录/支付集成 → 部署上线
```

全栈开发涉及多技术栈（前端、后端、数据库、认证、支付、CDN），每一环都可能成为瓶颈。即使是有经验的全栈工程师，也需要在各技术栈之间反复切换上下文。

### 假设

> AI Agent（Codex / OpenCode）能否将这个过程压缩到 **60 分钟**？

我们不是要证明 AI 能替代工程师，而是要回答：**当 AI Agent 拥有足够的上下文和明确的工作流约束时，它的产出质量和效率能达到什么水平？**

### 这个项目的两层价值

| 层次 | 说明 |
|------|------|
| **模板工程** | 一个可直接复用的全栈 Micro SaaS 脚手架（Next.js + FastAPI + Firebase + Supabase） |
| **Agent 系统** | 一套结构化的 4-Agent 开发工作流，让 AI 按照软件工程最佳实践交付功能 |

模板给 AI 一个坚实的起点，Agent 系统给 AI 一套可靠的工作方法。两者结合，才是我们真正想验证的东西。

---

## 2. 项目全景：模板 + Agent 双重身份

```
┌──────────────────────────────────────────────────────────────┐
│                     Micro SaaS Dev Agent                     │
├─────────────────────────────┬────────────────────────────────┤
│                             │                                │
│    全栈模板工程              │      AI Agent 工作流系统        │
│    (可复用脚手架)            │      (结构化开发流程)           │
│                             │                                │
│    ✅ Next.js 16 前端        │      ✅ Architect Agent         │
│    ✅ FastAPI 后端           │      ✅ Designer Agent          │
│    ✅ Firebase 认证          │      ✅ Engineer Agent          │
│    ✅ Supabase 数据库        │      ✅ QA Agent               │
│    ✅ Docker 开发环境        │      ✅ 4 个可复用 Skill        │
│    ✅ 测试基础设施           │      ✅ PRD 模板 + 示例         │
│                             │                                │
├─────────────────────────────┴────────────────────────────────┤
│                                                              │
│    支持双工具链：OpenCode (orchestrator) + Codex CLI (TOML)  │
│    共享：AGENTS.md + Agent 定义 + Skills                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. 模板工程架构

### 3.1 技术栈（已锁定）

| 层 | 技术 | 说明 |
|----|------|------|
| **前端** | Next.js 16 + React 19 | App Router，TypeScript strict mode |
| **样式** | Tailwind CSS v4 + Shadcn UI v2 | CSS-first（无 tailwind.config.js），22 个预装组件 |
| **后端** | FastAPI + Python 3.12 | 异步 SQLAlchemy 2.x，Pydantic v2 校验 |
| **数据库** | Supabase Cloud Postgres | Alembic 管理迁移 |
| **认证** | Firebase Auth | 前端 SDK + 后端 Admin SDK 双端集成 |
| **包管理** | pnpm（前端）+ uv（后端） | 现代化工具链 |
| **测试** | Vitest + Playwright / pytest | 前后端均有完整测试基础设施 |
| **容器化** | Docker + docker-compose | 一键启动开发环境 |

> **为什么锁定技术栈？** Agent 需要确定性。当技术选型不可变，Agent 可以把所有认知资源集中在业务逻辑实现上，而不是浪费在"选 React 还是 Vue"的讨论上。

### 3.2 系统架构

```
┌─────────────────────────────┬──────────────────────────────┐
│      /frontend              │           /backend            │
│   Next.js App Router        │        FastAPI Server         │
│   Tailwind v4 + Shadcn      │        Python + uv            │
│                             │        SQLAlchemy             │
│   路由组:                    │                              │
│   (marketing)/ → SSR        │   端点:                       │
│   (auth)/ → CSR             │   /api/v1/health              │
│   (dashboard)/ → CSR        │   /api/v1/users/me            │
│                             │   /api/v1/...                 │
│   Firebase Auth SDK          │                              │
│   (客户端)                   │   Firebase Admin SDK          │
│                             │   (Token 验证)                │
└────────────┬────────────────┴──────────────┬───────────────┘
             │                               │
             │  REST API 调用                 │  数据库访问
             │  (携带 Firebase Token)         │  (Async SQLAlchemy)
             ▼                               ▼
     ┌───────────────┐              ┌──────────────────┐
     │ Firebase Auth  │              │ Supabase Cloud   │
     │ (Google Cloud) │              │ (Postgres DB)    │
     └───────────────┘              └──────────────────┘
```

**核心约束**（10 条不可协商的规则）：
1. 所有数据流经 FastAPI — 前端**永不**直接访问数据库
2. Firebase Auth 是**唯一**认证机制
3. 认证页面用 CSR（`"use client"`），营销页面用 SSR
4. 每个新 Model **必须**有 Alembic 迁移
5. 每个 API 端点**必须**有 Pydantic Schema
6. 业务逻辑走 Service 层 — Router 保持薄
7. 后端用绝对导入（`from app.models import X`）
8. 前端所有 API 调用通过统一 Client（自动注入 Firebase Token）
9. 不修改 `components/ui/` 下的 Shadcn 组件
10. 不创建 `tailwind.config.js`（Tailwind v4 CSS-first）

### 3.3 目录结构

```
micro-saas-dev-agent/
├── frontend/src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        #   营销页 (SSR)
│   │   ├── (auth)/             #   登录/注册 (CSR)
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/        #   仪表盘 (CSR)
│   │   │   ├── dashboard/
│   │   │   └── settings/
│   │   └── layout.tsx          #   根布局
│   ├── components/
│   │   ├── ui/                 #   22 个 Shadcn 组件 (不可修改)
│   │   ├── auth/               #   认证域组件
│   │   ├── dashboard/          #   仪表盘域组件
│   │   └── marketing/          #   营销域组件
│   ├── contexts/
│   │   └── auth-context.tsx    #   Firebase Auth 上下文
│   └── lib/api/
│       └── client.ts           #   统一 API 客户端
│
├── backend/app/
│   ├── api/v1/                 # API 端点
│   │   ├── router.py           #   主路由器
│   │   ├── health.py           #   健康检查
│   │   └── users.py            #   用户端点
│   ├── models/                 # SQLAlchemy 模型
│   ├── schemas/                # Pydantic 校验
│   ├── services/               # 业务逻辑层
│   ├── core/                   # Firebase + 安全
│   └── dependencies.py         # DI: get_db, get_current_user
│
├── .opencode/agents/           # Agent 定义文件
├── .agents/skills/             # 可复用 Skill
├── docs/prd/                    # PRD 模板 + 示例
└── scripts/                    # 自动化脚本
```

---

## 4. Agent 工作流系统设计：ATDD 驱动的确定性交付

### 4.1 核心理念：从“指令驱动”迈向“契约驱动”

> **AI Agent 不应是自由发挥的创作者，而应是严格执行“验收契约”的执行者。**

V2 的核心进化在于引入了软件工程中的 ATDD (Acceptance Test-Driven Development) 理念。我们不再仅仅给 AI 发送模糊的指令（如“写个登录页”），而是预先定义“完成的标准 (Definition of Done)”。

### 4.2 四个 Agent 的 ATDD 职责

```
   PRD                                                    可访问的产品
    │                                                         ▲
    ▼                                                         │
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│ Architect│────▶│ Designer │────▶│ Engineer │────▶│    QA    │
│          │     │          │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
  验收用例先行     设计系统闭环       按批次增量交付      3层分层验证
  ⏸ 人类审核       ⏸ 人类审核        ⏸ 人类审核        ⏸ 人类审核
```

#### Phase 1: Architect — 契约的制定者

| 项目 | 说明 |
|------|------|
| **输入** | `docs/prd/PRD.md` |
| **产出** | `technical-spec.md` · `data-model.md` · `api-spec.md` · `acceptance-tests.md` · `delivery-plan.md` |
| **核心职责** | 将自然语言需求转化为可执行的技术规格 |

Architect 产出 **5 个规格文件**，其中两个是 V2 重构新增的：

- `acceptance-tests.md` — 包含 Given/When/Then 业务场景
- `delivery-plan.md` — 交付批次计划，将测试用例映射到每个 Batch
- 双层格式：上层是人类可读的业务逻辑，下层是 AI 可执行的选择器/端点提示。
- ATDD 价值：在代码生成前，通过验收测试消除 PRD 的二义性，为后续 Agent 建立“真理来源”。

#### Phase 2: Designer — 视觉契约的 Token 化

| 项目 | 说明 |
|------|------|
| **输入** | PRD + 技术规格 + 设计源（可选） |
| **产出** | `design-system.md` · `component-map.md` · `page-layouts.md` |
| **核心职责** | 建立设计系统，将 UI 需求映射到 Shadcn 组件 |

Designer 支持 **4 级设计源优先级**：

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1st | 本地 HTML 文件 | 已有参考设计，提取 CSS Token |
| 2nd | Stitch MCP 提示词 | AI 生成设计稿 |
| 3rd | Figma URL | 已有 Figma 设计 |
| 4th | PRD 文字描述 | 纯文字推导组件建议（兜底） |

V2 新增 `design-system.md` — 定义 OKLCH 色彩、字体、间距、圆角等 CSS 变量。所有自定义组件**必须**使用这些 Token，不允许硬编码值。

#### Phase 3-4: Engineer & QA —— 增量交付与反馈循环


- Engineer
| 项目 | 说明 |
|------|------|
| **输入** | Phase 1 全部规格 + Phase 2 全部设计文件 |
| **产出** | 工作代码 + Alembic 迁移 + 测试 |
| **核心职责** | 按 `delivery-plan.md` 中的批次逐个实现 |

- QA
| 项目 | 说明 |
|------|------|
| **输入** | 全部规格 + 工作代码 |
| **产出** | `batch-N-report.md`（批次验证） 或 `test-report.md`（全量验证） |
| **核心职责** | 按 3 层顺序验证每个批次 |

这是 V2 最核心的工程改进，将项目拆分为多个 Batch (批次)。

```
对每个交付批次 (Batch N):
  1. Engineer 实现功能：目标是“通过当前批次关联的 AT-XXX 用例”。
  2. QA 执行 3 层验证：
     Layer 1: API 验证（契约一致性）
     Layer 2: UI 功能验证（业务逻辑一致性）
     Layer 3: UI 设计一致性（视觉 Token 一致性）
  3. 发现问题？ 
     YES → 立即打回修复，缺陷不流入下一 Batch。
     NO  → ⏸ 人类介入验收，确保 ATDD 目标达成。
```

### 4.3 增量交付循环

```
对 delivery-plan.md 中的每个 Batch-N:
  ┌─────────────────────────────────────────────────────┐
  │  1. Engineer 实现 Batch-N                            │
  │  2. QA 执行 Batch-N 对应的测试用例子集 (3 层)        │
  │  3. 发现问题？                                       │
  │     YES → 返回 Engineer 修复 → 重新 QA               │
  │     NO  → ⏸ 人类验收 (QA 报告 + 截图)               │
  │            通过 → Batch-(N+1)                        │
  │            不通过 → 返回 Engineer                     │
  └─────────────────────────────────────────────────────┘

所有 Batch 完成后:
  QA 全量验收 → 执行 acceptance-tests.md 全部用例
  → 完整测试报告 + 全部页面截图
  → ⏸ 人类总验收
```

### 4.4 Skills 系统

4 个可复用的 Skill，为 Agent 提供特定领域的工作流指南：

| Skill | 用途 | 使用场景 |
|-------|------|----------|
| `prd-to-spec` | 将 PRD 解析为技术规格 | Architect 阶段 |
| `design-to-components` | 将设计映射为 Shadcn 组件 | Designer 阶段 |
| `fastapi-crud` | 脚手架 FastAPI CRUD 端点 | Engineer 阶段 |
| `supabase-migration` | 生成 Alembic 数据库迁移 | Engineer 阶段 |

### 4.5 人类始终在环中

```
每个 Phase 之间：⏸ 人类审核与批准
每个 Batch 之后：⏸ 人类验收
最终交付之前：⏸ 人类总验收
```

**没有任何自动跳过阶段门控的机制。** Agent 产出的质量由人类把关，Agent 只是极大地加速了每个阶段的执行效率。

---

## 5. 重构历程：从 V1 到 V2

### 5.1 V1 的痛点：指令驱动的黑盒

V1 是一个典型的“全量瀑布流”模式：

```
Architect (3 文件) → Designer (2 文件) → Engineer (全量实现) → QA (整体验证)
```

**痛点**：
- ❌ 没有验收测试 — "做完了"但无法客观衡量"做对了"
- ❌ 全量交付 — Engineer 一次性实现所有功能，反馈周期太长
- ❌ 设计不闭环 — 没有设计系统，组件样式靠 Engineer 临场发挥
- ❌ QA 验证粗糙 — 只验功能，不验 API 契约和设计一致性

### 5.2 V2 的进化：ATDD 驱动的白盒

| 维度 | V1 (指令驱动) | V2 (ATDD 驱动) | 为什么这么做 |
|------|--------------|----------------|------------|
| **逻辑起点** | PRD 自然语言 | **Acceptance Tests (AT-XXX)** | 消除幻觉，提供客观的“完成标准” |
| **交付单位** | 项目全量交付 | **分批次增量交付 (Batching)** | 缩短反馈环，利用短上下文保证准确率 |
| **验证深度** | 功能验证 | **3 层验证 (API/UI/Design)** | 实现全方位的“契约对齐” |
| **错误修正** | 事后人类修 Bug | **Agent 闭环自纠** | 利用 QA Agent 的反馈驱动 Engineer 自动修复 |
| **设计容忍度** | 无定义 | 风格合规即可 | 平衡 AI 的创造性与工程的严谨性 |

---

## 6. 关键设计决策与 Trade-off

### 决策 1：技术栈完全锁定

**决策**：Agent 不可以讨论或建议替换任何技术选型。

**理由**：
- Agent 在技术选型讨论上会浪费大量 Token 和时间
- 锁定选型让 Agent 把认知资源 100% 集中在业务实现上
- 模板的价值在于"拿来就用"，不在于"让你选择"

**Trade-off**：牺牲了灵活性，换取了确定性和效率。

### 决策 2：验收测试两层格式

**决策**：测试用例必须同时包含业务描述和技术提示。

**理由**：ATDD 需要业务与技术的桥梁。业务描述让人类审核员确认功能做对了，技术提示让 QA Agent 能够精准执行测试，不产生二次幻觉。

### 决策 3：每个 Batch 强制人类 Checkpoint

**决策**：没有人类批准，Agent 不得进入下一个 Batch。

**理由**：AI 依然有“一本正经胡说八道”的风险。ATDD 的价值在于人类可以在每个小里程碑处纠偏，确保最终 60 分钟产出的产品是真正可用的。

**Trade-off**：速度上有损，但大幅降低了低质量产出流入后续阶段的风险。

### 决策 4：设计容忍度规则

**决策**：设计稿未覆盖的区域，只要符合整体设计风格即可，不算失败。

**理由**：
- 设计稿不可能覆盖所有状态和边界情况
- 过度严格会导致大量"假失败"
- Agent 对未定义区域的"合理推断"应被接受

### 决策 5：支持双工具链（OpenCode + Codex CLI）

**决策**：同一套 Agent 定义同时支持 OpenCode（orchestrator 模式）和 Codex CLI（独立 TOML 模式）。

**理由**：
- 不同团队成员可能偏好不同工具
- 核心逻辑（AGENTS.md + Agent 定义 + Skills）共享，避免重复维护
- 工具的选择不应影响工作流的一致性

---

## 7. 实际验证与 Demo 回顾

### 7.1 原始 Showcase 规划

按照 `showcase-brief.md` 的设计，Showcase 是一次 **60 分钟 Live Coding** 挑战：

| Part | 时间 | 内容 |
|------|------|------|
| 1 | 5 min | 目标说明：规则、PRD、技术栈约束 |
| 2 | 15 min | PRD → 全栈架构设计（Architect Agent） |
| 3 | 20 min | 前后端实现（Engineer Agent） |
| 4 | 15 min | 部署 + 付费集成 |
| 5 | 5 min | 评审答疑 |

### 7.2 评审标准

| 维度 | 权重 | 说明 |
|------|------|------|
| 可访问性 | 30% | 60 分钟内站点能否公开访问且核心功能可用 |
| 关键流程完整度 | 25% | 注册→登录→核心功能→付费 全流程是否跑通 |
| 代码质量与架构 | 20% | 全栈架构合理性、代码可维护性 |
| 业务价值 | 15% | 付费路径设计合理性、商业模式可行性 |
| 现场演示表现 | 10% | 演示流畅度、问题应对能力 |

### 7.3 当前模板已实现的能力

**前端（生产就绪）**：
- ✅ Next.js 16 App Router + 3 个路由组（marketing / auth / dashboard）
- ✅ Firebase Auth 集成（登录、注册、社交登录）
- ✅ 受保护路由（auth-guard 组件）
- ✅ 仪表盘（侧边栏、用户菜单、设置页）
- ✅ 22 个 Shadcn UI 组件预装
- ✅ 统一 API 客户端（自动注入 Token）

**后端（生产就绪）**：
- ✅ FastAPI + 异步 SQLAlchemy
- ✅ Firebase Admin SDK Token 验证
- ✅ User Model + CRUD 端点
- ✅ Pydantic Schema 校验
- ✅ Service 层业务逻辑
- ✅ 依赖注入（get_db, get_current_user）
- ✅ Alembic 迁移（users 表）

**AI Agent 系统（完整）**：
- ✅ 4 个专业 Agent（~2,200 行定义）
- ✅ 4 个可复用 Skill
- ✅ PRD 模板 + 示例文档
- ✅ 验收测试驱动的增量交付工作流

---

## 8. 经验教训与未来展望

### 8.1 经验教训：AI 时代的工程化之道

**约束胜过自由**：给 Agent 的自由度越高，产出越不可控。
**测试即规格**：在 AI 领域，一份高质量的验收测试文档比 100 页的技术规格书更有用。
**循环胜过线性**：V2 的 Batch Loop 证明了，通过多次小规模反馈，可以达成大规模的代码质量。

### 8.2 未来展望

| 方向 | 说明 |
|------|------|
| **支付集成** | Stripe MCP + Skill，完成注册→付费→权益门控的完整闭环 |
| **CI/CD 集成** | Agent 产出直接触发 Pipeline，从 PR 到部署全自动 |
| **多语言支持** | 国际化方案（i18n），支持中英双语 |
| **更多模板变体** | 不同业务类型的 PRD 模板（电商、内容、工具类） |
| **Agent 自我改进** | 基于 QA 报告的反馈自动优化 Agent 定义 |

### 8.3 一句话总结

> 让 AI Agent 靠谱的秘密不是更强的模型，而是更严谨的约束：通过 ATDD 工作流，我们将 AI 开发从一种“拼运气的抽奖”变成了“可预测的工程”。

---

## 附录

### A. 快速上手

```bash
# 1. 使用模板创建项目
# 在 GitHub 上点击 "Use this template"

# 2. 初始化项目
./scripts/init.sh

# 3. 配置 Firebase + Supabase
# 参考 docs/setup-guide.md

# 4. 启动开发
docker compose up --build

# 5. 开始第一个功能
cp docs/prd/PRD_TEMPLATE.md docs/prd/PRD.md
# 填写 PRD，然后调用 Architect Agent
```

### B. 核心文件索引

| 文件 | 说明 |
|------|------|
| `AGENTS.md` | Agent 系统完整参考（626 行） |
| `.opencode/agents/architect.md` | Architect Agent 定义（679 行） |
| `.opencode/agents/designer.md` | Designer Agent 定义（435 行） |
| `.opencode/agents/engineer.md` | Engineer Agent 定义（610 行） |
| `.opencode/agents/qa.md` | QA Agent 定义（558 行） |
| `docs/prd/PRD_TEMPLATE.md` | PRD 模板（372 行） |
| `docs/prd/EXAMPLE_PRD.md` | 示例 PRD — TaskFlow（560 行） |

### C. 相关链接

- 项目仓库：https://github.com/boostvision-ai-workshop/micro_saas_dev_agent
- OpenCode：https://opencode.ai
- Codex CLI：https://github.com/openai/codex
