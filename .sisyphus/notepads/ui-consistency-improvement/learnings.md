# Learnings — ui-consistency-improvement

## [2026-04-17] Session ses_2659f3033ffehDudH5id7pzCet — Plan Start

### Project Conventions
- All agent definition files: `.opencode/agents/*.md`
- Skill files: `.agents/skills/design-to-components/SKILL.md`
- Main workflow doc: `AGENTS.md` (root)
- No code changes — markdown documentation only
- Commit style: `docs(agents): ...` for agent files, `docs(skills): ...` for skill files, `docs: ...` for AGENTS.md

### File Sizes (pre-modification)
- `designer.md`: 435 lines
- `architect.md`: 679 lines
- `engineer.md`: 610 lines
- `qa.md`: 558 lines
- `AGENTS.md`: 626 lines
- `design-to-components/SKILL.md`: 913 lines

### Key Section Locations (for subagents)
- `designer.md:22-29` — Core Mission (3 outputs → 4 outputs)
- `designer.md:62-131` — Produced Outputs section
- `designer.md:37-39` — Design source priority (Priority 0 local HTML already defined)
- `designer.md:313-327` — Step 2b: Extract Design System
- `designer.md:358-368` — Validation Gate
- `architect.md:92-98` — delivery-plan.md output spec
- `architect.md:394-404` — Step 8: Define Delivery Batches
- `architect.md:87-91` — batch naming convention
- `engineer.md:80-103` — Per-Batch Implementation + QA Feedback Loop
- `engineer.md:276-307` — Design System Compliance Rules
- `qa.md:55-70` — Operating Modes (Mode 1 + Mode 2, add Mode 3)
- `qa.md:209-240` — Layer 3 verification
- `qa.md:252-276` — Design Tolerance Rules
- `AGENTS.md:279-288` — Phase Handoff Artifacts table
- `AGENTS.md:292-308` — Incremental Delivery Cycle
- `AGENTS.md:312-322` — Fallback Behaviors
- `AGENTS.md:380-452` — Getting Started workflow
- `AGENTS.md:611-619` — Version History
- `SKILL.md:53-76` — Design source priority (3-tier, missing Priority 0 — V2 gap)

### Terminology Contract (must be consistent across ALL files)
- "UI Polish Phase" (not "Visual Polish" or "Design Polish")
- "visual reference" (not "design reference" or "screenshot reference")  
- "BLOCKING" Layer 3 (used in qa.md, referenced in AGENTS.md)
- "Mode 3" (qa.md operating mode name)
- Path: `docs/specs/visual-references/{page-name}.png`
- Report: `docs/qa/ui-polish-{page-name}-report.md`
- Evidence: `docs/qa/evidence/ui-polish-{page-name}-current.png`
- Viewport: `1440×900`
- Batch naming: `UI-Polish-0` (shared), `UI-Polish-N` (pages)

## [2026-04-17] Task 7: Cross-file Consistency Review — PASS — No inconsistencies found

All 6 verification checks passed with zero issues:
1. `docs/specs/visual-references` path: consistent across all 6 files (20+ references)
2. "UI Polish" terminology: present in all 6 files ✅
3. Alternative terms ("Visual Polish", "Design Polish"): 0 occurrences ✅
4. QA modes: 6 matches for "Mode [123]" covering Mode 1, 2, 3 ✅
5. Priority 0 = Local HTML: consistent in both designer.md and SKILL.md ✅
6. Viewport 1440×900: consistent across designer.md, qa.md, SKILL.md ✅

No files were modified. No git commit required.
