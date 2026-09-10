# TryMyBuild improvement batch

## Implementation

- Catalog: compact gray logo slogan; no duplicate hero or advertising box; one Filter & sort panel containing price, order, and server-sourced creator verification.
- Listing: horizontal navigation, separate word counts and min/max rules, clearer unfinished-app wording, compact preview, description/screenshot split, vertically stacked answers, video controls next to their preview.
- Signup: checkbox and linked legal sentence share a normal inline text block. Terms retains the operator identity in a lower section.
- Admin: project, community, and creator-feedback reviews use consistent navigation. Deleted accounts are excluded from the People list. An expired identity confirmation now says that deletion did not happen; incomplete cleanup is visible and retryable under Privacy requests.
- Messages: a central, paginated inbox for both sides of project conversations, project-name search, unread filter, inline replies, recognition, and reports. Existing conversation URLs redirect here. Read markers never move backward.
- Reviews: explicit attempted-use and feedback-focus choices, usefulness and price choices, privacy choice, and one explanation field. A failed attempt can qualify. Untried questions need review rather than automatically earning a credit.
- Credits: 1 basic qualifying credit; creator recognition raises the total to 5 or 10. Recognition needs an explanation, has a rolling five-award limit per reviewer, and applies to one review per creator/reviewer pair per 30 days. Repeated submissions and stale recognition updates cannot double-credit.
- Listing slots: five distinct creators helped per milestone, independent of bonus-point totals. Existing access is preserved. Publication review still applies to every app.
- Reports: route to Support & reports with participant-scoped evidence. A report itself does not remove credits. Moderation can reverse the full earned reward, and invalidated requests refund their reserved credit. Appeals use Help & contact.
- Notifications: one optional review opportunity per week, with an actual creator/project and a direct review link. Existing reviewed projects and a member’s own work are excluded. Credits rules are available in Community credits and linked before submission; no compulsory signup popup.

## Credit-system plan and boundaries

The 1:1 exchange is a **feedback-request queue**, not a restriction on unsolicited conversations or a guaranteed reciprocal response. One credit is reserved per queued request, spent upon qualifying fulfillment, and refunded when cancelled first. Recognition is optional: honest criticism retains its basic reward without creator approval.

Do not implement automatic account suspension or deletion for inactivity. A later retention phase can add a 30-day encouragement notice and 60/90-day maintenance reminders, with an opt-out and advance notice before any change to promotion eligibility. This batch does not schedule jobs or silently remove listings for inactivity.

Copied or coordinated reviews are prohibited. Existing similar-text screening and bonus limits reduce abuse; they do not prove firsthand use or eliminate collusion. Report-based moderation and appeals remain necessary. Bonus balances do not prove an app’s quality.

## Release dependency

Apply `database/014_review_rewards_inbox.sql` **before** deploying these server changes. It adds the review fields, recognition records, private read markers, inbox and totals queries, and replaces the accounting functions. It does not delete existing member content or remove existing slots. The migration was tested in an isolated PostgreSQL runtime; it has not been applied to production by this batch.

Original implementation was local and uncommitted. On September 10, migrations 014 and 015 were applied together in one successful production transaction before the consolidated application release. Separate dashboard-progress and verification-milestone changes are included. No live account deletion was performed.

## Verification

- September 10 consolidation: `npm test`: 112 checks passed, including local-file asset paths and verification milestones.
- `npm run check` and production build passed.
- `node scripts/test-review-database.mjs <path-to-pglite>/dist/index.js`: all existing migrations plus 014, credit totals/upgrades, retries, stale/foreign actions, distinct creators, untried/self reviews, inbox isolation, read state, request refunds, reversals, appeal requalification, bonus caps, permissions, and disposable-account erasure.
- Browser: desktop catalog, listing counters/buttons, compact split-image preview, unified inbox; phone-size layout inspected. A browser file-upload permission prevented that specific end-to-end upload test; the existing upload implementation was not bypassed or changed for testing.
- Read-only live diagnostic: the reported member was active with no deletion-start audit record or cleanup job. The exact earlier failure cannot be established from that record alone. No member was removed during diagnosis.

Local fixtures (`scripts/launch-qa-server.mjs`) use sample data only and are not part of the deployed application.
