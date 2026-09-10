# Creator verification milestone

Members unlock verification review with 50 lifetime earned credits and an approved, currently published project. Credits spent requesting feedback and credits returned from those requests do not change this total. Review bonuses count at their final total; moderation reversals subtract invalid earnings. Reward ledger entries without a feedback request reference count, including future referral rewards. This change does not implement referral issuance.

The overview and Community credits pages show progress, remaining credits, publication requirements, and the next action. `/dashboard/verification` provides the evidence form for eligible members and pending/approved states. Existing verified profiles retain their status.

Requests use the existing private support cases and admin identity review process. The database checks eligibility and active account status, serializes submission with credit changes, and reuses open or waiting requests on retries. The generic Help form routes verification requests through the same function. Earning credits never sets `profiles.verified`; staff must review identity and control of the work. Approval emits an in-app notification.

Apply `database/015_creator_verification_milestone.sql` after migration 014 and before deploying the application changes. Both migrations were applied together in one successful production transaction on September 10, 2026, during the consolidated release.

Validation: `npm run check`, `npm test`, `npm run build`, and the isolated PGlite migration/integration suite via `scripts/test-review-database.mjs`. Verification integration coverage includes 49/50 credits, the publication requirement, spending/refunds, reversal/appeal, repeated submissions, pending state, manual badge approval, notification deduplication, and database permissions.
