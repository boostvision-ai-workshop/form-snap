# Decisions — ui-consistency-improvement

## [2026-04-17] Session ses_2659f3033ffehDudH5id7pzCet — Plan Start

### Confirmed Architectural Decisions
1. **Two-Phase delivery**: Feature Batches (V2, unchanged) → UI Polish Phase (NEW)
2. **Visual reference format**: PNG screenshots at 1440×900 stored in `docs/specs/visual-references/`
3. **Hard target**: During UI Polish, visual reference is the non-negotiable target
4. **Layer 3 during feature batches**: STAYS ADVISORY (unchanged from V2)
5. **Layer 3 during UI Polish**: BLOCKING (Mode 3 specific behavior)
6. **Stub boundaries**: Nav + auth must work; tooltips/secondary modals/animations can stub
7. **Backend freeze**: Zero backend changes during UI Polish — CSS/Tailwind/JSX only
8. **Fix limit**: 2 cycles per page, then escalate to user
9. **UI Polish is OPTIONAL**: User can skip to Full QA Verification
10. **Shared layouts first**: UI-Polish-0 covers sidebar/header/footer before pages

### Auto-Resolved Defaults
- Dark mode/responsive: Only if variant visual references exist
- Pages without visual references: Excluded from UI Polish
- Visual reference = Phase 2 static artifacts (not running app screenshots)
