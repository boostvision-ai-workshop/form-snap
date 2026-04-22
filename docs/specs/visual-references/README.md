# Visual References — FormSnap

Design source: **Priority 0** (local PNG mockup)

The authoritative visual reference for all 12 surfaces is:

  `docs/prd/formsnap_prd_design.png`

This single file contains all 12 page surfaces arranged in rows (rows 1–12 per PRD §0.2).
Per-page PNG extraction is not performed because the mockup PNG is the canonical source —
QA Layer 3 performs side-by-side comparison directly against `formsnap_prd_design.png`.

## Row-to-page mapping

| Row | Page |
|-----|------|
| 1 | Marketing landing (`/`) + `/submitted` |
| 2 | Auth: Sign-in, Sign-up, Forgot password |
| 3 | Pricing (`/pricing`) |
| 4 | App Dashboard (`/app/dashboard`) |
| 5 | Forms list (`/dashboard`, `/app/forms`) |
| 6 | Form Builder (`/app/forms/:id/builder`) |
| 7 | Submissions list (`/app/submissions`) + Form Inbox tab |
| 8 | Analytics (`/app/analytics`) |
| 9 | Settings — General (`/app/settings/general`) + Form Settings tab |
| 10 | Billing (`/app/billing`) |
| 11 | Team (`/app/team`) |
| 12 | Integrations (`/app/integrations`) |

## UI Polish Phase scope

UI Polish batches UI-Polish-0 through UI-Polish-5 use the mockup rows above as their
acceptance target. No separate per-page screenshot is required — the mockup file is
the single hard target.
