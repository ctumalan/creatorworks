# September 12 UI refinements

Implemented locally after the user’s **DONE**. No production data, account settings, moderation decisions, Git remote, or deployment was changed in this pass.

## Notes addressed

1. Restore the gray “Apps that make life easier” slogan, including narrow layouts.
2. Give NEW a contrasting amber badge.
3. Put price before category and NEW; remove the redundant lower catalog-card action strip.
4. Float comment guidance without card reflow or clipping; outside click and Escape dismiss it.
5. Add Free + paid options to listing forms and catalog filtering. Preserve existing pricing when editing without a category change.
6. Center the wish list at a maximum 600px, with consistent field widths.
7. Group footer navigation responsively.
8. Style analytics preferences and its consent panel without changing consent behavior.
9. Set contribution quotes to eight seconds.
10. Open public and own profile previews in a left-sliding, keyboard-accessible window. Direct URLs retain site navigation and access controls.
11. Simplify the signed-in account menu to View profile, My dashboard, and Log out.
12–13. Use one paginated project-card collection with previews, publication status, current saves, comments/reviews, unread conversations, an Add project link at the top, and settings under ⋯.
14. Replace overview explanations with linked totals for projects, saved projects, notifications, support requests, conversations, and credits.
15. Consolidate slot and verification milestones in Community credits.
16. Use a compact, server-sorted inbox with expandable inline conversations and reply arrows. Failed sends retain the draft.
17. Put review composers directly below saved projects; explain qualifying one-credit reviews, preserve required experience choices, and retain save/unsave controls.
18. Style profile photo upload, selected avatar controls, profile fields, and save feedback.
19. Condense active sessions to browser/device, date, and sign-out, with raw details collapsed.
20. Add a compact project-performance table with actual comments/reviews and current saves.
21. Open owner and administrator project records in floating windows without losing the originating page.
22. Compact community-comment moderation rows; put decisions, reason, confirmation, and save inside ⋯ while retaining stale-decision protection and pagination.

Also fixed overlapping creator/Share controls on narrow project headers and ensured Escape closes only the uppermost profile window.

## Deliberate boundaries

- Per-project visits and completed shares are **not tracked** by the existing data model. These columns say “Not tracked,” not zero. Personal category-browsing counts are not substituted for project traffic.
- A saved item alone earns no credit. A qualifying firsthand review can earn one base credit under existing rules; ordinary replies and duplicates do not.
- The inbox represents creator-review conversations. Public standalone catalog comments retain their existing moderation workflow.
- Delete is available only for unused, never-published, non-studio drafts. History-bearing projects must be retained/unpublished. Database checks reject stale versions, other owners, and drafts with saves, comments, feedback, review, slot, request, or build history. Concurrent build saves and deletion are protected by database row locks. Failed preview cleanup is reported and recorded for follow-up.

## Verification

- 168 automated tests passed; type checking and production build passed.
- All migrations applied successfully in disposable PostgreSQL-in-WASM.
- New SQL tests covered 29-thread sorting/pagination, unread changes, ownership, inactive accounts, browser-role denial, and draft-deletion safeguards.
- Native PostgreSQL 18.4 passed seven cross-connection race checks, including both build-save/deletion orderings.
- Local browser checks used synthetic data at 390px, 960px, and 1280px CSS widths: no document overflow on the checked dashboard, saved, messages, profile, and sessions screens; equal wish-field widths; unclipped help without reflow; action menus within the viewport; profile/record windows, focus restoration, nested Escape handling, inline send controls, required review choices, and failed-send draft retention.
- Preview helpers are excluded from published assets. No real messages, reviews, moderation decisions, or deletions were submitted during browser QA.

## Release requirements

Review/apply `database/019_launch_safety.sql`, `database/020_workspace_refinements.sql`, and `database/021_wish_categories.sql` in order to the intended database before deploying this working tree. The overview and inbox depend on the workspace functions; the wish category menu depends on the published-category function. None of these migrations was applied to production in these passes. Confirm the actual production migration state before release rather than replaying an already-applied migration.

The earlier identity/indexing launch hold remains unchanged. This UI pass is not confirmation that production authentication or official launch readiness has been cleared.

Local sample-data preview, while its development server is running: `http://127.0.0.1:4325/dashboard/overview`. Sending and other writes are intentionally disabled there.

## Quick corrections: wish categories

Implemented after the second **DONE**, locally only:

- One category selector both filters wishes and assigns the submission category. All categories is browse-only and cannot be submitted.
- Other… reveals a matching-width text field with existing-category suggestions. Typed names use consistent casing/spacing and reuse familiar aliases, such as Finance → Money.
- Custom categories persist with the submitted wish. They appear in everyone's wish menu only after that wish is approved; pending/hidden wishes cannot populate the public menu. This uses the existing wish moderation and deletion lifecycle, not an unmoderated category-creation endpoint.
- The public menu includes categories from older published wishes beyond the newest 200 records. Selecting a category filters on the server; stale responses cannot overwrite a later selection.
- Changing categories, reloading, returning from sign-in, and failed submissions preserve the draft. Successful submission clears only the wish text, retaining the selected category.

Verification: 176 automated tests, type checking, and production build pass. Disposable PostgreSQL tests cover case/spacing duplicates, pending → published → hidden categories, more than 200 wishes, server-only function access, and account erasure. Browser checks confirm one selector, conditional Other field, retained drafts after switching/reload, and equal widths for selector, custom input, and wish text. No production wish or category was created, and nothing was committed or deployed.
