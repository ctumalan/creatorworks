# Category conversations — pending release

Local implementation only. No production schema changes or deployment performed.

## Behavior

- All tools has no community panel. Selecting a category reveals conversations beneath the catalog, without a second filter or automatic scroll.
- Show three comments/experiences initially; See more expands the loaded conversation set (up to 30 published category responses plus project experiences).
- Guests can draft. Drafts are stored per category in localStorage on this browser, not sent to the server before authentication. Shared-device users should be aware these local drafts persist.
- Sign up to post saves the draft and returns to the category. A separate Post comment action is required after sign-in; nothing auto-posts. Existing members can sign in through the authentication screen.
- Verified email and existing moderation are required. Pending responses are visible only to their author and admins. Category comments do not earn project feedback credit.

## Required before release

Review and apply `database/013_category_discussions.sql` to the verified CreatorWorks database with an approved recovery point. It adds the category column and changes uniqueness to member/day/category. Historical daily responses retain the empty general category. No rows are deleted. Existing RLS and review procedures remain.

Do not deploy the new API until the migration is applied: without its column, discussion requests fail safely and drafts remain in the browser. No migrations run as part of the build.

Then validate with two categories and a test account: guest typing, signup and sign-in return, draft isolation, verified-email gate, pending response, moderator approval, public appearance, rapid category switching, and mobile layout. Never test by posting as a real member without consent.

Website rollback to the previous deployment is possible with the additive column left in place, but review the old single-response-per-day assumptions before resuming old daily discussion writes. Do not remove the column or restore a backup over new category comments.
