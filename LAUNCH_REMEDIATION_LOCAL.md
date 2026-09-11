# Launch audit remediation — local checkpoint

September 11, 2026. Prepared against main at 4542803. Not committed, pushed, or deployed.
The user's existing slogan change and unrelated untracked documents were preserved.

## Implemented locally

- Escaped project and creator data in catalog cards, account cards, experiences, feedback, and detail markup. Project navigation also rejects executable schemes and embedded credentials.
- Added an enforced Content Security Policy to server-rendered app responses: no inline scripts, inline event handlers, eval, plugins, or framing. Profile editing and server initialization now use external scripts. Existing inline styles remain allowed. Optional analytics and click-to-play supported videos are allowed explicitly.
- Self-hosted the existing DM Sans and Newsreader fonts, including their licenses. No Google Fonts connection is needed.
- Automatic screenshots require a verified account and database-backed limits (3/minute and 20/day per account). Guest drafts, manual screenshot uploads, and previews remain available. Fixed and regression-tested a guest preview refresh loop discovered during implementation.
- Prepared moderated wishes: pending by default, public feed restricted to published wishes, founder review with revision checks and an audit trail, publish/hide queues with pagination, report-by-email links, and an atomic maximum of 10 pending/published wishes per member.
- Wish filtering changes only the wish results, preserving the catalog filter, composer contents, and current page position.
- Added editable selected interests separate from learned category activity; notification matching respects explicit choices even when behavioral personalization is off. Resetting category history does not erase selected interests.
- Clarified privacy disclosures and provided a direct email contact without a login requirement. Added guest personalization/clear-history controls.
- Removed misleading sharing-preference controls for already-public/in-review listings; their actual status is shown with directions to the existing Unpublish/Withdraw controls.
- Corrected the project-slot error to say five different creators, exposed the 7–150 word range while writing comments, added skip links to the main shell/dashboard, stronger keyboard focus, route focus, and larger touch targets for help/dismiss buttons.
- Fixed a pre-existing server-mode startup error: discussionRequest was used before initialization.

## Verification

- 158 automated tests passed at the checkpoint, including new hostile-content, unsafe-URL, capture-auth/rate-limit, moderated-feed, interest-choice, and startup/guest-preview regressions.
- TypeScript checks and production build passed.
- Diff whitespace checks passed.
- Real local app returned the enforced CSP header and HTTP 401 to an anonymous screenshot request.
- Browser: guest form successfully reached listing preview without an account after the refresh-loop fix; no new browser errors in that fresh test context.
- Browser: wish category changed independently while preserving all 11 fixture catalog rows and typed wish text.
- Browser: quote rendered as a fixed overlay outside the form; self-hosted typography displayed. Mobile creator form at 390px had no horizontal overflow.
- Local catalog content came from the static QA fixture where needed. The real local app has no connected database/auth credentials; authenticated end-to-end tests are NOT claimed.

## Required checkpoint: database, before deployment

Review and apply database/019_launch_safety.sql only after explicit approval and a verified backup/recovery plan. On September 11 it passed isolated migration/integration tests in PGlite and native PostgreSQL 18.4, including real cross-connection checks. It has not been applied to production. See DATABASE_VALIDATION_2026-09-11.md.

Effects:

1. Existing wishes are retained but become pending and disappear from the public feed until approved.
2. Existing stored interests are copied into selected_interests, then protected from future browsing updates. Earlier overwritten sign-up choices cannot be reconstructed automatically.
3. New functions and moderation columns are added. Deployment of the new API requires them; deploying this code first would break wish submission and authenticated preference loading.

Disposable-database checks are complete for SQL execution, punctuation/apostrophe/hyphen/accented word counts, duplicate submission, two concurrent submissions at the 10-wish boundary, stale moderation decisions, unauthorized access, public hiding, pagination, preferences save/reset, and account erasure/member-scoped export-shaped reads. Hosted API, actual authentication, and production schema compatibility checks remain.

## External decisions still required

- WorkOS: confirm the production environment, hosted authentication domain, allowed redirects, Google/password recovery, email verification, session expiry/sign-out, and continuity of current user identities. Do not simply replace staging credentials and strand existing accounts.
- Owner identity: confirm how “Chris Nava” (About) and “Christian Tumalán” (operator/verification) should be presented. No assumed equivalence or legal-identity edit was made.
- Email/DNS: verify hello@trymybuild.com delivery and approve a DMARC policy and reporting destination. No DNS edits made.
- Legal: owner/counsel review of privacy/terms and contact handling remains necessary; these factual copy edits are not legal clearance.
- Deployment: after the above, authorize commit/push/deploy, then test real sign-up → interests → saved app → listing → moderation → feedback/replies/credits → notifications → export/deletion with explicitly approved test accounts/data.
- Search indexing: global noindex remains intentionally unchanged. Decide announcement timing, add robots/sitemap, and scope indexing to public routes after the safety gates pass.

## Deferred polish / architecture

No framework rewrite. Continue incremental extraction of rendering/data/state from the large app.js file; introduce reusable escaped rendering helpers and integration tests around the authenticated journey. Consider fingerprinted static assets, homepage sharing metadata, a deliberate permanent canonical redirect/HSTS policy, and self-service comment editing separately.

The middleware CSP protects server-rendered marketplace/account pages. Independently served static demo apps are not blanket-retrofitted with this policy; audit their scripts before adding equivalent static-route headers.
