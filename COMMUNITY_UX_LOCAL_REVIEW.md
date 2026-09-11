# Community and onboarding local review — September 11, 2026

Release approved by the user on September 11, 2026. The notes below describe the local implementation history; see the release verification section for final status.

## Implemented

- Homepage cards show comments and compact comment entry, with the first-review placeholder for empty threads.
- Removed the “Try this first” card block; creator identity and badge share a row.
- Detail views show a linked creator byline beside the title, without the separate creator section.
- Opening notes, comment conduct and saving explanation use expandable help controls.
- Comment sending uses a contextual arrow and the revised placeholder. Existing 7–150-word comment validation, authentication and moderation remain intact.
- Creator onboarding begins directly inside the creator tab. Core listing fields appear together, and preview/account/settings retain the tab navigation and existing draft persistence.
- Guest account menu offers account creation and sign-in. Welcome page includes optional interests and explicit notification opt-in. Choices transfer after authentication through `/api/onboarding`.
- Wish-list UI is available within every category, including all 33 existing categories. Empty searches offer wish submission; both browser and API enforce 4–11 words.

## Before publishing

Apply `database/016_community_wishes.sql` to the intended database before deploying this release. It adds the wish table, service-only access, duplicate protection, and cleanup on account deletion. Account exports now include wishes.

The local visual server does not provide authenticated account creation, public comments or shared wish persistence. Wish submissions there save a local draft and explicitly say they were not published. Connected staging must verify account signup, interest transfer, authenticated wish submission/listing and account-deletion cleanup before production release.

Authentication continues to use the existing hosted identity provider. The site's listing stages retain navigation; the provider's own signup page remains external.

## Second September 11 batch

- Updated creator invitation; lighter regular-weight placeholders and regular-weight entered values, preserving existing drafts.
- All categories plus Other, revealing a custom category field. Category suggestions follow existing listing validation and publication review; they do not instantly add unreviewed public filters.
- Five-benefit membership promo replaces the suggested-project community block.
- Three dismissible inspiration quotes: Paul Graham on initial typing, GOV.UK Service Manual on the help answer, and the user-supplied Wayne Gretzky quote after choosing project stage. Each displays for ten seconds, queues without overlapping, never takes focus, and clears when leaving the form. The Steve Jobs quote was removed at the user's request.
- Guest Contact and About links in the menu and footer. Contact opens email to hello@trymybuild.com without requiring an account. Founder bio uses the user-provided name Chris Nava and biographical details.
- Privately / Publicly / Not sure yet radio choices persist in the local draft. They express intent, not access enforcement on the external app or automatic publication. Existing publications require an explicit Unpublish/Withdraw action.

Also apply `database/017_sharing_preference.sql` before deploying this batch. It preserves existing published/reviewed listing intent and adds account-backed sharing preferences. Neither migration was applied to production in this task.

Verification: 135 automated tests, type check and build passed. Browser checked the new creator heading, radio controls, membership promo, both quote texts, dismissal, focus retention, and guest Contact page. Connected-database sharing persistence still requires the prepared migration and staging verification.

## Final release checks

- 148 automated tests, type check, production build and whitespace checks passed.
- Navigation label is “Get feedback on my app.” How it works moved below the founder introduction on About; founder photo included.
- Search uses meaningful-word ranking and small-typo tolerance, with clearly described fallback suggestions within active filters and a wish submission option.
- Dropdown changes preserve position and focus. Invalid listing answers receive red highlighting and clear when corrected.
- Signup interests remain visible checkboxes with “Click as many as you want.” Contact button shows just the email address.
- Production migrations 016 and 017 applied together transactionally to the existing creatorworks database; verified `community_wishes` exists and `sharing_preference` is present. Deployment verification follows separately. No real signup, wish, or comment is submitted as release test data.
