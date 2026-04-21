决策	结论
Phase 0 执行者	扩展 Architect，同时产出技术规格 + 验收测试用例
测试用例格式	两层格式：Given/When/Then 业务场景 + 自动化提示（选择器、端点）
交付拆分	Architect 定义批次，按功能模块/用户故事拆分，人类审核时可调整优先级
QA 子集选取	Architect 预先映射 批次→测试用例，QA 执行时分 3 层：API → UI 功能 → UI 设计一致性
设计稿未覆盖区域	视觉符合整体设计风格即可容忍（不算 fail）
人类验收内容	QA 子集报告 + 关键页面截图，聚焦结果
已确认的新工作流架构
Phase 1: Architect（扩展）
  输入: PRD + 设计稿（本地 HTML / Figma URL / 文字描述）
  产出:
    ├── technical-spec.md     （技术规格，同原有）
    ├── data-model.md         （数据模型，同原有）
    ├── api-spec.md           （API 规格，同原有）
    ├── acceptance-tests.md   （🆕 验收测试用例，两层格式）
    └── delivery-plan.md      （🆕 交付批次计划，含测试用例映射）
  ⏸ 人类审核: 技术规格 + 验收测试用例 + 交付批次
Phase 2: Designer
  输入: PRD + 技术规格 + 设计稿
  产出:
    ├── design-system.md      （🆕 设计系统：色彩/字体/间距/CSS 变量）
    ├── component-map.md      （组件映射，同原有）
    └── page-layouts.md       （页面布局，同原有）
  ⏸ 人类审核: 设计系统 + 组件结构
Phase 3-4: Engineer-QA 增量交付循环
  对每个交付批次 (Batch N):
    Engineer → 实现 Batch N 功能
    QA → 执行 Batch N 对应测试用例子集
      Layer 1: API 验证
      Layer 2: UI 功能可用性验证
      Layer 3: UI 设计一致性验证
      （设计稿未覆盖区域：符合整体风格即可）
    QA 发现问题？ → YES: 返回 Engineer 修复 → 重新 QA
                   → NO: ⏸ 人类介入验收（QA 报告 + 截图）
                          → 通过 → Batch N+1
                          → 不通过 → 返回 Engineer
Phase 5: QA 全量验收
  执行 acceptance-tests.md 中所有测试用例
  产出: 完整测试报告 + 全部页面截图
  ⏸ 人类总验收
  
需要修改/新增的文件清单
操作	文件	变更内容
修改	.opencode/agents/architect.md	扩展：产出验收测试用例（两层格式）+ 交付批次计划 + 测试用例映射
修改	.opencode/agents/designer.md	新增：设计系统产出（CSS 变量/色彩/字体/间距）+ 支持本地 HTML 设计稿输入
修改	.opencode/agents/engineer.md	调整：按批次执行 + 遵循设计系统 + 接收 QA 反馈修复循环
修改	.opencode/agents/qa.md	重写：3 层验证（API → UI 功能 → UI 设计）+ 子集执行 + 全量验收 + 测试账号自注册 + Playwright 截图
修改	AGENTS.md	更新工作流描述、phase 定义、产出物清单
可能修改	docs/prd/PRD_TEMPLATE.md	验收标准部分可能需要调整格式以配合两层测试用例格式
