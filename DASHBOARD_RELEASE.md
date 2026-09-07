# CreatorWorks dashboard release — September 6, 2026

Implemented account dropdown, dashboard overview, project management, profile photos/avatars and website, account email/password/session controls, preferences, in-app notifications, private support/report/copyright/appeal/verification requests with threaded replies, data export, and consented account deletion with administrator completion and retryable external cleanup.

Administrator workspace includes account search, suspension/reactivation, identity verification, support inbox, privacy requests, activity history, provider readiness, complete project review including video, and audited ownership corrections. Studio ownership and the founder account are protected. Billing, payment details, unrelated integrations, and unavailable notification channels are deliberately not offered.

Earlier creator improvements included related projects, safe video URL/embed parsing, fresh draft reset, consistent Back labels, simpler evidence copy, category catalog links, account/draft handoff, avatar navigation, authenticated dashboard project creation, and uninterrupted search typing.

## Production setup

- Supabase migrations 009 and 010 applied after existing 001–008; RLS denies browser access to private tables. No existing accounts were suspended or deleted.
- Transactional database tests verified cross-account denial, idempotent replies, notifications, suspension, deletion consent, redaction, and external cleanup queue creation. All test records were rolled back.
- WorkOS Radar bot and brute-force detection and domain protections are enabled.
- GA4 property CreatorWorks: 553027087; web stream 15730956231; measurement ID G-GT982FBH7G. Optional opt-in analytics, enhanced measurement off, advertising personalization/signals off, no private dashboard tracking. Age/gender reporting not enabled.

## Verification

71 automated tests, type checking, and production build passed. Live user and admin routes rendered successfully. Browser checks verified avatar dropdown, signed-in project inventory, data export download, continuous MealMap search with retained focus, related-project switching, and responsive dashboard layout. Database erasure was tested with disposable transaction-local records; no real account was erased and no live authentication credentials were changed during testing.

## Policy status

Expanded Terms and Privacy documents in legal/ remain drafts, pending real operator/contact/jurisdiction details and legal review. They have not been represented as binding published policies. The current short privacy notice describes enabled analytics and account controls.
