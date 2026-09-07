# TryMyBuild v1 launch review

Reviewed September 7, 2026. Domain and email purchase are excluded from this assessment.

**Verdict: the requested product improvements are implemented, but TryMyBuild should not yet be called ready for an unrestricted public launch.** The main blockers are visitor access to the advertised tools, finished legal/onboarding policies, and a verified production/recovery setup. A successful build is not a launch sign-off.

## Implemented in this release

1. All three short project answers require 4–10 words, with live counters and matching server validation. Existing saved copy is retained, but must meet the rule when edited/submitted. The project settings page now exposes all three answers for editing.
2. A notification bell beside the avatar shows unread updates and links directly to the relevant page. Existing feedback, reply, publication, and support events remain. Optional saved-project updates, interest-based discoveries, one-time draft reminders, and weekly saves/feedback summaries are personalized to the account. Administrator queues appear only for the founder. Preferences persist privately; deterministic notification identities prevent refreshes from repeating alerts or resetting read state. Digests are prepared when users visit, not delivered by email in the background. Suspicious-login alerts and view-count reporting are not claimed.
3. Public profiles use compact project cards, with thumbnails, project information, Save, View details, and Share actions.
4. Video entry is prominent at the stage step, listing preview, and settings. Supported YouTube/Vimeo/Loom links and embed sources are validated; playback is loaded only after a click. Arbitrary embed scripts are not executed.
5. Opening `/dashboard` defaults to Overview. Saved & feedback has its own explicit destination. Sign-in draft import still runs on the Overview route.
6. Each published project has a recipient page at `/projects/{slug}`, with builder attribution, preview, video when present, a Try action, feedback link, and related projects. Server-rendered social metadata supplies project-specific link previews.
7. Sharing first opens an editable invitation preview. Copy, email, text, and native sharing are explicit next steps. Email/text buttons open the user's chosen app for final review and sending; the website does not claim delivery. Only published projects are shareable. Messaging services control the final link-card appearance.

## Must resolve before public launch

| Priority | Finding and evidence | Completion requirement |
|---|---|---|
| Critical | **10 of 11 advertised project destinations require authentication.** Unsigned checks returned HTTP 401 for all ten `*.tumalanct.chatgpt.site` destinations. A normal GET to StackScout also returned a page titled “Sign in required.” The locally hosted AfterSchool Together returned 200. | Open each intended public tool in a genuinely signed-out browser. Make the intended tools publicly accessible, move them to public hosting, or clearly disclose the required account and remove incompatible “no sign-in needed” claims. Do not change access to private tools without deciding what should become public. |
| Critical | **Terms and the full Privacy Policy are still drafts.** Legal documents retain operator/contact/jurisdiction placeholders and the old CreatorWorks name. Registration does not record acceptance of a published Terms version. The current privacy page is a short notice. | Finalize the legal operator and policies, update the brand, publish working links, implement an unchecked acceptance/age flow consistent with the chosen policy, and record version and timestamp. Confirm applicable copyright reporting/appeal procedures. |
| High | **Production authentication needs explicit sign-off.** The originally configured WorkOS environment was staging. This review confirmed a live sign-in redirect, but could not independently verify a production-environment cutover or provider production approvals. | Confirm WorkOS production configuration, approved redirect/logout URLs, Google OAuth production setup, verified-email behavior, reset-email delivery, and founder access. Preserve/migrate existing user ownership correctly if environment identities change. |
| High | **Recovery and incident operations are not verified.** Repository settings do not establish that backups, storage-object recovery, uptime alerts, and an incident owner work in practice. | Verify backup retention and perform an isolated restore rehearsal including uploaded images. Record rollback instructions, recovery expectations, alert recipients, hosting/storage cost limits, and who responds to security incidents. |
| High | **A complete release rehearsal is still required.** Unit tests and public HTTP checks pass, but the browser connection timed out during this release. New authenticated UI behavior and mobile visuals could not be re-tested live in this session. | Use separate builder, visitor, and admin accounts: sign up → create → upload/video → preview → submit → review → published catalog/profile → invitation → feedback/reply → notifications. Check denied cross-account access, keyboard/mobile navigation, reset/reauthentication, and deletion with a disposable test account. |
| Launch gate | **Search engines are intentionally blocked.** The live home response includes `X-Robots-Tag: noindex, nofollow`, configured globally in `vercel.json`. | Once the other launch gates pass, remove global blocking from public pages only. Keep dashboards, private drafts, and admin pages excluded. Add a sitemap and verify public canonical URLs and indexing. |

The external project checks establish access barriers, not that every project is broken or that the hosting service is down. Signed-in owners may see working tools while first-time visitors cannot.

## Complete or inspect before calling the experience polished

- **Existing copy:** the current AfterSchool Together hero has 12 words. Shorten it to the new rule through project editing. Check the other two short answers across the launch collection; form validation does not retroactively rewrite published work.
- **Real invitation previews:** verify one iMessage/SMS, one email client, and one social link preview. Confirm the preview image is publicly fetchable and refreshing a project does not leave a misleading cached card. No email or text was sent to another person during this review.
- **Media and accessibility:** test long names, missing/broken screenshots, portrait images, supported video hosts, invalid embeds, focus return from dialogs, keyboard operation, contrast, zoom, and phone widths. Check motion and large image performance.
- **Moderation and support:** assign an owner and response expectations for submissions, reports, appeals, copyright concerns, and deletion. Suspended users need an external appeal/contact route; the signed-in help form alone is insufficient for them.
- **Security hardening:** public headers include HSTS, no-sniff, frame denial, and a restrictive permissions policy. An enforced Content Security Policy is not present. Design and test it against the site's inline scripts and permitted video hosts. Verify service-account privileges, provider-console MFA, and brute-force/rate-limit behavior rather than relying on presence of configuration alone.
- **Analytics:** verify consent before network collection, withdrawal, broad geography/device reporting, exclusion of private form content, and the actual GA stream. Do not advertise age/gender reporting or builder view counts as active. Basic visitor analytics already has an opt-in implementation; demographic enrichment is not required for v1.
- **Account lifecycle:** test email change, active sessions, user export, and deletion end to end with a disposable identity. Confirm external WorkOS/storage cleanup and documented backup retention, not just database redaction.
- **Catalog growth:** the published catalog read has a 500-item cap. Add pagination before approaching that limit; this is not a blocker for the present eleven-project launch collection.

## Explicitly outside a necessary v1

Payments, billing/credits, unrelated app integrations, push notifications, email digests, advanced recommendation models, and age/gender analytics are not necessary for this version. Add them only with a clear product need and working service support.

## Verification evidence

- 78 automated tests pass, including word-count boundaries, server bypass rejection, invitation preview before sharing, personalized notification ownership, opt-out behavior, and duplicate/read-state preservation.
- Type checking and production build pass.
- Public baseline: homepage HTTP 200; 11 published projects; authentication and database report configured. Unauthenticated data export returns 401 and administration returns 403.
- Existing public security headers and sign-in redirect were inspected over HTTP. No private user data was downloaded in this review.
- The deployed script already contained the earlier video field; the supplied screenshot shows older controls. This release also makes the field easier to find in multiple steps.
- No new database migration or external delivery service is required for this release. Additional notification preferences use the existing private settings table, keyed to the authenticated member, and are included in export/deletion handling.

## Reference checks

Production setup should be checked against [WorkOS AuthKit environments](https://workos.com/docs/authkit/environments) and the [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod). Verify both database and file recovery against [Supabase backup documentation](https://supabase.com/docs/guides/platform/backups).

For copyright procedures, designated-agent registration and accessible contact details are among the conditions for applicable U.S. section 512 protection; merely publishing generic Terms does not establish that protection. See the [U.S. Copyright Office guidance](https://www.copyright.gov/onlinesp/). Legal applicability and final policy choices require review for the actual operator and users.

**Sign-off rule:** close the critical/high items with recorded evidence, complete the release rehearsal, then enable public indexing. Keep the review list open until the evidence exists.
