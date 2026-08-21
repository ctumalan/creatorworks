# CreatorWorks Phase 0: Codex Studio

## Session Status

**First real Phase 0 model — ready to prepare**

Codex Studio is the first real work to be tested through CreatorWorks. This session is run as a **manual CreatorWorks Experience Session**: a facilitator stands in for everything CreatorWorks will later do on its own. No application is built, and nothing about Codex Studio or Producer Studio is changed. Codex Studio is used exactly as it already exists, at its current address.

For Phase 0 the experience mode is a **guided external link** (see the four experience modes in the product plan): CreatorWorks explains what to do, the participant reaches Codex Studio through an ordinary link, and the return to feedback is manual.

Several decisions still need answers before the first participant is invited (see "Unresolved Decisions").

## The Work

**Codex Studio** helps people organize, combine, review, reorder, and refine prompt instructions gathered across many AI conversations. Instead of a scattered pile of notes and half-remembered instructions, a person ends up with a single, ordered set of instructions—a **Master Codex**—that can be given to an AI to get a better result.

- **Name:** Codex Studio
- **Creator:** Christian Tumalán
- **Where it runs today:** <https://christian-tumalan-website.vercel.app/studio-admin/codex-studio/>
- **How it fits:** Codex Studio operates within Producer Studio.
- **What it accepts today:** the audited code accepts `.txt`, `.md`, `.rtf`, `.html`, and `.htm` files, plus the matching text MIME types found in the code. "CODEX files" is the application's product language for these text files; `.codex` is **not** a separate supported extension. This first session intentionally uses only the fictional `.txt` files for simplicity and safety, even though additional text formats are accepted. Do not claim support for formats beyond these five (for example DOCX, PDF, or exported AI conversations) until each has actually been tested.

## Current State: Early Access for New Participants

Codex Studio is marked **Stable** internally. For new outside participants, however, it should be described as **Early access** until its independent sharing experience has been validated. A first-time visitor has not yet been through a tested, self-guided handoff, so "Early access" sets honest expectations without overstating or understating the work.

## A Naming Note to Review Later

The name "Codex Studio" may cause public brand confusion with OpenAI Codex. This does not block the private test, but it should be flagged for a later review before any public discovery or wider sharing. It is noted here so the decision is not forgotten; it is not a task for this session.

## The Sharing Handoff Being Tested

Codex Studio is the first work used to test the CreatorWorks sharing loop, run as a manual Experience Session:

> **Present → Share → Experience → Respond → Recognize**

On their own, the participant should be able to:

- Receive the invitation and understand what Codex Studio is.
- Understand why it may matter to them and who made it.
- Recognize that it is an early-access experience for new participants.
- Understand, before they begin, that Codex Studio is private and their access must be arranged in advance—signing in or signing up does not by itself grant access.
- Reach Codex Studio and start using it.
- Import an appropriate, non-sensitive collection of prompt files.
- Generate a Master Codex.
- Return to CreatorWorks and answer the main question.

The facilitator should step in only if the participant becomes truly stuck—and every such moment must be recorded, because it shows where the handoff needs to improve.

## Experience Session States

This manual session moves through the states the product plan defines. Record where it stands, not what the participant types inside Codex Studio:

1. Invitation opened
2. Experience understood
3. Experience started
4. Meaningful point reached
5. Participant returned
6. Response received
7. Creator acknowledged
8. Outcome shared

Phase 0 does not track clicks, keystrokes, uploaded files, prompts, documents, or private content. Automated activity could show that something happened; only the participant's feedback shows whether it mattered.

## The Meaningful Point

For this session, the meaningful point is:

> A Master Codex was generated and made available for review.

Reaching this point means the participant got far enough to have something to react to. It does **not** prove the result was good. Generating a Master Codex and generating a *useful* Master Codex are different things—the main question below is what tests quality.

## One Main Question

> After importing your prompt files, did Codex Studio create a complete, clear, and correctly ordered Master Codex—without losing instructions, introducing contradictions, or placing commands too early?

## Supporting Questions

These support the one main question. They are not separate tests the participant must pass.

- Were any instructions missing from the result?
- Was anything repeated unnecessarily?
- Did the result contain contradictions?
- Was anything in the wrong order?
- Were any commands placed before enough context existed for them to make sense?
- Was the result clearer than the original scattered collection?
- When the Master Codex was given to the intended AI, did it produce a better result than the original notes would have?

## Trust Summary Before Access

Before the participant enters Codex Studio, explain in plain language:

- **The exact destination:** the Codex Studio address within Producer Studio.
- **Where it opens:** Codex Studio opens outside CreatorWorks, in the participant's browser.
- **Access:** Codex Studio is inside Christian's private Producer Studio; access must be arranged before the session. Creating or signing into a WorkOS account does not by itself grant Studio access.
- **Payment:** none is required for this session.
- **Files:** the application accepts `.txt`, `.md`, `.rtf`, `.html`, and `.htm` text files ("CODEX files" is its product name for them; `.codex` is not a separate format). This session uses only the supplied fictional, non-sensitive `.txt` files.
- **What happens to imported files:** Codex Studio reads the files the participant selects in the browser and may attempt to send the imported project state to a saving service. A human check of the Vercel project settings found `PUBLIC_CODEX_PROJECT_API_BASE_URL` is not configured, so a new build would fall back to the code's default address on the visitor's own computer—where a normal visitor has no such service—so, based on these settings, server saving is expected to fail and a participant's work may not survive a page refresh or a closed tab. If online saving is not active, nothing imported would be stored by CreatorWorks, Producer Studio, or the hosting provider through this route. The *currently deployed* build has not yet been verified, so treat this as the expected behavior, confirmed at rehearsal rather than assumed. For this session, use only the supplied fictional, non-sensitive `.txt` files. (See "Decisions.")
- **Artificial intelligence:** Master Codex generation is deterministic application logic; Codex Studio does not send the imported material to an AI service to produce the Master Codex. (The separate Co-Producer AI feature is not used by Codex Studio.)
- **What CreatorWorks will learn:** only the session states above and the feedback the participant chooses to give—not their file contents.
- **Supported use:** a current web browser.
- **Known limitation:** early access for new participants. The app accepts several text formats (see Files); this session intentionally uses only `.txt`.
- **How to report a problem and how to leave:** the facilitator remains available, and the participant may stop at any time.

## Manual Session Flow

Let the participant move through this on their own wherever possible. Watch quietly, and step in only if they become truly stuck—then record where that happened.

1. **Personal invitation** — Send a warm, personal invitation in the creator's voice.
2. **CreatorWorks-style introduction** — Present the short CreatorWorks introduction to what the work is, who made it, and why it may matter.
3. **Trust summary** — Show the trust summary above before the participant enters the work.
4. **Access disclosure** — Make clear that Codex Studio is private and access must be arranged in advance; signing in or signing up does not by itself grant access.
5. **Begin the external experience** — Let the participant reach and open Codex Studio.
6. **Import a test collection** — Have the participant import an appropriate, non-sensitive collection of TXT prompt files (the application refers to these as CODEX files).
7. **Generate the Master Codex** — Let the participant generate the Master Codex (the meaningful point).
8. **Manual return** — Bring the participant back to CreatorWorks using a manual return.
9. **Answer the main question** — Ask the one main question, then the supporting questions.
10. **Creator acknowledgment** — The creator confirms the response was received and considered.
11. **Outcome update** — The creator records and shares what was learned, decided, or changed.
12. **Nonfunctional optional-support concept** — Only after the experience, show a nonfunctional support idea for learning (see below).

Record every place where the facilitator had to intervene for the handoff to continue.

## Support Learning — Not a Payment Feature

Do not charge the participant, ask for any payment details, or build payment functionality during this session. Payment is never an entrance requirement, and any support idea shown here is a nonfunctional concept used only for learning.

Only after the experience is complete, ask:

> If Codex Studio saved you meaningful time or effort, would you want a simple way to support its creator afterward? What would make that invitation feel natural and appreciative rather than pressured?

Keep it optional, private, and easy to decline. Use words like "support," "tip," or "optional thank-you." Do not describe this as a charitable donation. Real value-first support is deferred to Phase 3.

## Responsibilities in This Session

- **CreatorWorks (facilitated manually):** the invitation, the introduction, the trust summary, the main feedback question, the manual return, feedback privacy, acknowledgment, the outcome, and any recognition.
- **Codex Studio / Producer Studio:** the actual functionality, the interface, processing, sign-in, and anything that happens to imported files.

Nothing in this session modifies Codex Studio or Producer Studio. Codex Studio is used as it already exists.

## Provisional Success Signs

The first session provides promising evidence if:

- The participant understood Codex Studio from the invitation and reached and used it largely on their own.
- The participant imported a test collection and generated a Master Codex.
- The Master Codex was more complete, clearer, and better ordered than the original scattered notes.
- Any missing instructions, repetition, contradictions, or misordered commands can be described clearly enough to guide improvement.
- Giving the Master Codex to the intended AI produced a better result.
- The participant felt the invitation, experience, and follow-up respected their time.

A weak result is still useful Phase 0 evidence if the experience makes the limitation clear and produces a specific next decision.

## Decisions

### Resolved by the code audit

These were confirmed by a read-only audit of the application code and no longer block preparation:

- **Exact supported extensions.** `.txt`, `.md`, `.rtf`, `.html`, `.htm` (plus matching text MIME types).
- **`.codex` clarification.** `.codex` is not a separate supported extension; "CODEX files" is product language for text files.
- **No AI service for Master generation.** Master Codex generation is deterministic application logic; imported material is not sent to an AI service to produce it. The separate Co-Producer AI feature is not used by Codex Studio.
- **Fictional TXT compatibility.** The supplied fictional `.txt` collection passes the application's static import checks.
- **No existing CreatorWorks return.** Codex Studio has no CreatorWorks return link or connection, so the Phase 0 return must be manual.

### Confirmed by a human check of Vercel settings

A human checked the Vercel project's Environment Variables and confirmed that `PUBLIC_CODEX_PROJECT_API_BASE_URL` is **not** listed there. What follows from that:

- A new build would fall back to the code's default, `http://127.0.0.1:4330` (an address on the visitor's own computer).
- A normal website visitor has no saving service running at that address, so—based on these settings—server-side persistence is expected to fail.
- The first session can still be run, but a participant's work may not survive a page refresh or a closed browser tab.
- With online saving inactive under these settings, nothing imported would be stored by CreatorWorks, Producer Studio, or the hosting provider through this saving route.
- This is a settings finding only. It does not by itself prove what the *currently deployed* build does; verifying the deployed build's actual behavior is a small rehearsal check (below), not an open question about the Vercel settings.

Do not expose environment values or claim which live configuration is active beyond this confirmed absence.

### Still to confirm before inviting a participant

- **Who the first relevant participant will be.** Choose one person who genuinely works with AI prompts and would benefit from an organized Master Codex.
- **Session date and expected duration.**
- **Verify the deployed build's saving behavior in rehearsal.** During the handoff rehearsal, confirm what the *currently deployed* page actually does when a Master Codex is generated—for example, whether work persists after a page refresh. This is a quick rehearsal check, not an open question about the Vercel settings (which were confirmed above).
- **Which access method Christian will arrange.** Choose and test one before inviting: add the participant's WorkOS identity to the authorized list, or provide the approved shared access code. Do not place a real access code, identity, email, or secret in this document.
- **The exact manual feedback link or page.** Decide it and keep it available in the invitation as a recovery path; test it first.
- **A complete rehearsal of the handoff.** Walk the whole path once before inviting the participant.

Also observe during the session (not a pre-invite blocker): whether the access step discourages a new participant.

## Boundaries

This is a documentation and validation plan only. Do not install anything, write application code, add a framework, build the Connection Kit, modify Producer Studio, modify Codex Studio, modify any notation-stage repository, process payments, or create marketplace or public-discovery features.
