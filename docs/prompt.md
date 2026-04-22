# 项目名称：FormSnap (极简静态网页表单后端)

## 1. 项目愿景
为静态网站（HTML, Webflow, Hugo 等）提供极简的后端接口。用户只需将表单的 `action` 指向我们的 API，即可实现数据存储和邮件通知，无需编写任何后端代码。

## 2. 技术栈要求
- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **数据库/鉴权**: Supabase (使用 Supabase Auth 和 PostgreSQL)
- **邮件服务**: Resend (API 极其简单，适合 MVP)
- **样式**: Tailwind CSS + shadcn/ui (极简 UI)

## 3. 核心功能需求 (MVP)

### A. 接收端 (Endpoint)
- **接口路径**: `POST /f/[formId]`
- **功能**:
    1. 接收 `application/x-www-form-urlencoded` 或 `json` 数据。
    2. 将数据作为 JSON 存储到数据库。
    3. 触发 Resend API 给该表单的所有者发送通知邮件。
    4. 成功后重定向至默认的 `success` 页面或用户定义的 `redirect_to` URL。

### B. 用户控制台 (Dashboard)
- **表单管理**:
    - 创建新表单（生成唯一的 `formId`）。
    - 查看已创建表单的列表。
    - 删除表单。
- **数据展示**:
    - 点击某个表单，查看收到的提交记录（列表/表格形式）。
    - 简单的“导出 CSV”功能（可选，建议 MVP 包含）。

## 4. 数据库结构 (PostgreSQL)

### Table: `profiles`
- `id`: uuid (references auth.users)
- `email`: text

### Table: `forms`
- `id`: uuid (primary key)
- `user_id`: uuid (references profiles.id)
- `name`: text (表单名称，如 "我的个人博客")
- `redirect_url`: text (提交成功后的跳转地址，可选)
- `created_at`: timestamp

### Table: `submissions`
- `id`: uuid (primary key)
- `form_id`: uuid (references forms.id)
- `data`: jsonb (存储所有表单字段)
- `created_at`: timestamp

## 5. 任务指令 (给 Claude Code)

请按照以下步骤初始化并开发项目：

1. **项目初始化**: 创建 Next.js 项目，配置 Tailwind CSS。
2. **Supabase 集成**: 配置数据库连接，并在本地生成对应的 TypeScript 类型。
3. **核心 API 开发**: 编写 `/app/f/[formId]/route.ts`，处理 POST 请求。确保它能兼容不同的 Content-Type。
4. **Dashboard 开发**: 
    - 实现基于 Supabase Auth 的登录/注册页面。
    - 实现表单列表页和提交详情页。
5. **邮件集成**: 集成 Resend API，当有新数据写入 `submissions` 表时，发送一封结构清晰的通知邮件。

---
**开始指令**: "请根据上述 PROMPT.md 的要求，开始搭建项目骨架。"