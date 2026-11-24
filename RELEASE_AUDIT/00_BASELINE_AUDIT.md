# RELEASE AUDIT — 00 BASELINE AUDIT

## Environment
- Platform: Windows 11 x64
- Node.js: v26.13.0 (D:\programs\nodejs)
- PostgreSQL: NOT AVAILABLE (shared memory error code 487 on Windows; embedded-postgres binaries present but cannot reserve shared memory region)
- Docker: NOT AVAILABLE
- Package managers: NOT AVAILABLE (no winget, choco, scoop)

## Project Overview
- Name: STEM Journal Practice / STEM Journal Academy
- Type: Full-stack monorepo (backend + frontend + desktop Electron)
- Tech stack: React 18 + TypeScript + Vite (frontend), Node.js + Express + TypeScript + pg (backend), PostgreSQL 16 (database)
- Tests: Vitest + Supertest (backend)

## Baseline Audit Table

| Area | Status | Evidence | Defects | Required action |
|---|---|---|---|---|
| Frontend architecture | PARTIAL | React 18 + TS + Vite, 20 pages, 7 components | No LO Connections page; UI/UX needs enhancement per release spec | UI/UX audit + enhancements (Phase 6) |
| Backend architecture | PARTIAL | Express + TS, 20 route files, middleware | Needs admin communication system (Phase 7) | Build admin communication (Phase 7) |
| Database structure | PARTIAL | 19 migrations, full schema | PostgreSQL cannot start on Windows (shared memory error) | Install PostgreSQL or document as BLOCKED |
| Database migrations | PASS | 001_init through 019_edp_stage_library | None found | None |
| API endpoints | PARTIAL | 20 route files covering auth, attempts, questions, sessions, progress, admin, etc. | No email/update announcement endpoints | Build admin communication (Phase 7) |
| Authentication | PASS | JWT + bcrypt, role-based guards, auth.ts middleware | None found | None |
| Authorization | PASS | AdminRoute, role checks on routes | None found | None |
| Question banks | PARTIAL | officialJournals.ts, practice packs, peer guide | Water-theme questions removed (40); unrelated questions removed (King Lear, etc.) | EDP + LO question audit (Phases 2-4) |
| Learning objectives | PARTIAL | LO codes in questions, migrations 014-018 | No LO Connections page; coverage matrix not built | LO connection audit + questions (Phase 3) |
| EDP stages | PARTIAL | 12 platform stages in platform_edp_stages table; challenge-specific stages in edp_track_stages | EDP questions not separated from other types in UI | EDP question audit + separation (Phase 2) |
| Assessment rubrics | PASS | rubric.ts defines 4 levels x 4 categories | None found | None |
| AI/ML evaluation | PARTIAL | evaluator.ts, local rubric engine + optional LLM providers | Cannot test without PostgreSQL | AI assessment verification (Phase 5) |
| Mock Journal | PARTIAL | Mock.tsx, MockStart, MockRun routes | Cannot test without PostgreSQL | E2E testing (Phase 9) |
| Academic Writing Academy | PARTIAL | academy.tsx, 5 content files, academy routes | Cannot test without PostgreSQL | E2E testing (Phase 9) |
| Student progress tracking | PARTIAL | student_progress table, progress route | Cannot test without PostgreSQL | E2E testing (Phase 9) |
| Admin functionality | PARTIAL | Admin page, admin_users table, admin routes | No email announcement system; no feedback inbox | Build admin communication (Phase 7) |
| Notification functionality | FAIL | Not implemented | No email, no announcements, no feedback system | Build admin communication (Phase 7) |
| Feedback functionality | FAIL | Not implemented | No student feedback system | Build admin communication (Phase 7) |
| Creator and About Us info | PASS | About.tsx, site_pages table, creator info in migrations | None found | None |
| Visual design system | PASS | styles.css with design tokens, light/dark themes | Needs UI/UX authenticity audit | UI/UX audit (Phase 6) |
| Light and dark themes | PASS | data-theme switching in styles.css | None found | None |
| Mobile/tablet layouts | NOT TESTED | CSS uses clamp() and responsive patterns | Cannot verify without browser testing | Responsive testing (Phase 9) |
| Dependencies | PASS | package.json files present for all 3 workspaces | None found | None |
| Build configuration | PASS | Vite config, tsconfig, electron-builder config | None found | None |
| Environment variables | PARTIAL | .env.example, backend/.env | No .env.example for desktop email config | Create .env.example (Phase 7) |
| Existing backend tests | NOT TESTED | 6 test files (api, evaluator, import, semester, site) | PostgreSQL unavailable | Run tests (BLOCKED) |
| Existing frontend tests | FAIL | No frontend test files found | No frontend tests | Add frontend tests |
| Existing integration tests | FAIL | No integration test files found | No integration tests | Add integration tests |
| Existing E2E tests | FAIL | No E2E test files found | No E2E tests | Add E2E tests |
| Windows packaging | PARTIAL | desktop/ with Electron + electron-builder | Cannot verify without PostgreSQL + Windows build | Windows release (Phase 8) |

## Known Defects
1. **PostgreSQL cannot start** — shared memory error code 487 on Windows; embedded-postgres binaries present but `could not reserve shared memory region`
2. **No LO Connections page** — required by Phase 3 spec
3. **No admin email/announcement system** — required by Phase 7 spec
4. **No student feedback system** — required by Phase 7 spec
5. **No frontend tests** — required by Phase 9
6. **Water-theme questions removed** (40 questions deleted from officialJournals.ts per user request)
7. **Unrelated questions removed** — King Lear literary question, summer camp feedback, "Capstone for friend", "time allocated for Capstone better used", "textbook for each subject"

## Preserved Work
- All migrations preserved (001-019)
- All backend source files preserved
- All frontend source files preserved
- All question data preserved except explicitly removed water/unrelated questions
- All rubric definitions preserved
- All EDP stage definitions preserved (12 platform stages)
