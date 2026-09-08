# Community credits release

## Member rules

- Every member can publish one project.
- Each five qualifying feedback contributions to five different creators' projects unlocks one additional project slot.
- One qualifying feedback contribution earns one feedback credit.
- One credit places one published project in the community feedback queue.
- A queued request asks the community for attention. It does not guarantee a response or a deadline.
- Drafts, edits, and new builds do not consume project slots.
- Project feedback must contain 7 to 150 words and no more than 800 characters.
- Feedback on a member's own project, copied or substantially repeated feedback, and feedback removed for moderation do not earn credit.
- Existing published projects and projects already awaiting review keep their publishing access.

## Discussion and conduct

The daily maker question has an always-visible response field. Each response appears with the member's photo, chosen avatar, or initials after moderation. Daily discussion supports community conversation but does not earn project-feedback credits.

Every feedback and reply field presents the community conduct rule: discuss the project or idea, use considerate language, and avoid insults, harassment, threats, hate, sexual abuse, degrading language, or needless hostility. Honest disagreement and constructive criticism are welcome.

## Enforcement and recovery

The database enforces project slots, word limits, credit balances, one credit per member and project, and one open feedback request per project. Credits and requests use an append-only ledger and transaction lock so simultaneous requests cannot overspend the same credit.

Uncertain feedback enters an administrator review queue. Administrators can award, reject, or revoke a credit with a recorded reason. Removing previously qualified feedback reverses its credit. If that feedback fulfilled a queued request, the requester receives the reserved credit back. Earned project slots remain available after a later moderation reversal.

All new community tables use row-level security. Browser database roles have no direct access; only trusted server routes can read or change the records. Community activity is included in account exports and removed or redacted during account erasure.

## Product surfaces

- Dashboard overview: available credit and next-slot progress
- Community credits: queue, request controls, slot progress, and qualification history
- Project feedback and replies: live word counter and conduct guidance
- Home community rail: direct daily response field and profile identity beside every response
- Administrator community review: pending credit qualifications and daily responses
- Community Guidelines: rules, credit criteria, and appeal path

## Validation

- The migration executes in a PostgreSQL-compatible runtime and creates all six community tables.
- A qualifying ten-word response produces a qualified record and one ledger credit.
- Automated checks cover the minimum and maximum word limits, database authority, concurrency protection, moderation reversal, request refunds, project slot enforcement, daily-discussion separation, profile identities, and visible conduct guidance.
