# RELEASE AUDIT — 07 ADMIN COMMUNICATION SYSTEM PLAN

## Scope
Plan and implement admin communication system: email announcements, student feedback inbox, notification preferences.

## Current Admin Endpoints (backend/src/routes/admin.ts)

| Endpoint | Method | Status |
|---|---|---|
| /api/admin/questions | GET | PASS |
| /api/admin/questions | POST | PASS |
| /api/admin/questions/:id | PUT | PASS |
| /api/admin/stats | GET | PASS |
| /api/admin/rubrics | GET | PASS |
| /api/admin/site/pages | GET | PASS |
| /api/admin/site/pages/:slug | PUT | PASS |
| /api/admin/site/settings | GET | PASS |
| /api/admin/site/settings/:key | PUT | PASS |
| /api/admin/academy/:kind | GET/POST | PASS |
| /api/admin/academy/:kind/:id | PUT/DELETE | PASS |
| /api/admin/words | GET/POST/DELETE | PASS |
| /api/admin/journal-import/parse | POST | PASS |
| /api/admin/journal-import/commit | POST | PASS |
| /api/admin/students | GET | PASS |
| /api/admin/students/:id/attempts | GET | PASS |
| /api/admin/challenges | GET/POST | PASS |
| /api/admin/challenges/:id | PUT | PASS |
| /api/admin/challenges/:id/sections | GET | PASS |
| /api/admin/challenge-sections/:id | PUT/DELETE | PASS |
| /api/admin/challenges/:id/track | GET | PASS |
| /api/admin/track-stages | POST | PASS |
| /api/admin/track-stages/:id | PUT/DELETE | PASS |
| /api/admin/challenges/:id/resources | GET/POST | PASS |
| /api/admin/challenge-resources/:id | PUT/DELETE | PASS |

## Missing Admin Communication Endpoints (Phase 7)

| Endpoint | Method | Purpose |
|---|---|---|
| /api/admin/announcements | GET | List announcements |
| /api/admin/announcements | POST | Create announcement (email + in-app) |
| /api/admin/announcements/:id | PUT/DELETE | Edit/delete announcement |
| /api/admin/announcements/:id/send | POST | Send announcement email to students |
| /api/admin/feedback | GET | List student feedback messages |
| /api/admin/feedback/:id | GET/PUT | View/respond to feedback |
| /api/admin/feedback/stats | GET | Feedback statistics |
| /api/feedback | POST | Student submits feedback |
| /api/notification-preferences | GET/PUT | Student notification preferences |

## Missing Database Tables (Phase 7)

| Table | Purpose |
|---|---|
| announcements | Admin-created announcements (title, body, type, target_roles, scheduled_at, sent_at) |
| announcement_recipients | Which students received which announcement |
| feedback_messages | Student-submitted feedback (student_id, subject, message, status, admin_response, responded_at) |
| notification_preferences | Student email/push preferences |

## Frontend Missing Pages (Phase 7)

| Page | Route | Purpose |
|---|---|---|
| Announcements (admin) | /admin/announcements | Create and manage announcements |
| Feedback Inbox (admin) | /admin/feedback | Review and respond to student feedback |
| Feedback (student) | /feedback | Submit feedback to admin |
| Announcements (student) | /announcements | View received announcements |

## Implementation Plan

### Backend (Phase 7a)
1. Create migration for announcements, announcement_recipients, feedback_messages, notification_preferences tables
2. Add announcement CRUD routes to admin.ts
3. Add feedback submission route (public, auth required)
4. Add feedback management routes (admin only)
5. Add notification preferences routes
6. Add email sending integration (nodemailer or similar — configured via .env)

### Frontend (Phase 7b)
1. Create Announcements page (student) — /announcements
2. Create Feedback page (student) — /feedback
3. Create Announcements management (admin) — /admin/announcements
4. Create Feedback inbox (admin) — /admin/feedback
5. Add announcement/feedback nav items to TopBar

### Configuration (Phase 7c)
1. Create .env.example with email/SMTP settings
2. Document notification provider options (SMTP, console, mock)

## Defects Found

| ID | Severity | Location | Problem | Fix |
|---|---|---|---|---|
| COMM-01 | HIGH | `backend/src/routes/admin.ts` | No announcement/feedback/notification endpoints | Implement Phase 7 endpoints |
| COMM-02 | HIGH | `frontend/src/App.tsx` | No /announcements, /feedback, /admin/announcements, /admin/feedback routes | Add routes + pages |
| COMM-03 | MEDIUM | `backend/migrations/` | No announcements/feedback/notification_preferences tables | Create migration |
| COMM-04 | MEDIUM | Root `.env.example` | No email/SMTP configuration documented | Create .env.example |

## Recommendation
Implement Phase 7 admin communication system:
1. Backend: migration + routes + email integration
2. Frontend: student + admin pages
3. Config: .env.example with email settings
