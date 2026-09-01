# CreatorWorks Phase 0: Codex Studio

## Session Status

**First real Phase 0 model — creator rehearsal and first independent participant session completed (August 21, 2026); Phase 0 decision: Revise and repeat**

Codex Studio is the first real work to be tested through CreatorWorks. This session is run as a **manual CreatorWorks Experience Session**: a facilitator stands in for everything CreatorWorks will later do on its own. No application is built, and nothing about Codex Studio or Producer Studio is changed. Codex Studio is used exactly as it already exists, at its current address.

For Phase 0 the experience mode is a **guided external link** (see the four experience modes in the product plan): CreatorWorks explains what to do, the participant reaches Codex Studio through an ordinary link, and the return to feedback is manual.

The first independent participant session (Participant 1) is complete. See "First Independent Participant Session Evidence — August 21, 2026" for what was learned, and the updated "Decisions" for what remains before a second test.

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
- **What happens to imported files:** Codex Studio reads the files the participant selects in the browser and may attempt to send the imported project state to a saving service. A human check of the Vercel project settings found `PUBLIC_CODEX_PROJECT_API_BASE_URL` is not configured. The creator rehearsal then confirmed that refreshing the currently deployed page clears the imported and generated contents. The participant must therefore be told that the work is temporary and may disappear when the page is refreshed. For this session, use only the supplied fictional, non-sensitive `.txt` files. (See "Creator Rehearsal Evidence.")
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

## Creator Rehearsal Evidence — August 20, 2026

Christian completed a private rehearsal with the six supplied fictional `.txt` files and generated `MASTER_CODEX_20260820_210359.txt`.

### What worked

- All six source files appeared in the Master Codex.
- All six sections were preserved; the output reported zero duplicate sections omitted.
- The original instructions remained readable.
- The deliberately conflicting late instructions remained present rather than silently replacing the earlier instructions.
- Christian could return to the planned feedback path without getting lost.

### What did not work well enough

- Refreshing the live Codex Studio page cleared the imported and generated contents. The current experience does not provide reliable persistence across a refresh.
- The Master Codex placed the product purpose last rather than first.
- Five of the six sections appeared under the broad heading **Needs Review**, without explaining the individual decisions required.
- The output preserved the contradictions but did not clearly compare or identify them.
- It did not clearly separate first-release instructions, after-value feedback, future support, and later conflicting commands.
- It therefore did not yet answer the creator's central questions clearly: whether instructions were missed, contradicted, submitted too early, or meant for a later stage.

### Evidence-based decision

The result proves that Codex Studio can consolidate and preserve this test collection, but not yet that it can turn the collection into a clear, correctly ordered decision guide. The next product question is whether Codex Studio should explicitly organize instructions into stages such as **Purpose**, **First Release**, **After Value**, **Future Ideas**, and **Decisions Needed**, while naming each conflict for human review.

This was a creator rehearsal, not the first independent participant session. It closes the deployed refresh-behavior check and confirms that the manual return is understandable for Christian; it does not yet prove that a new participant can complete the entire handoff independently.

## First Independent Participant Session Evidence — August 21, 2026

The first independent participant is recorded here as **Participant 1**; no name, email, account, WorkOS identifier, or authentication detail is stored. Participant 1 completed the experience through return and response and generated `MASTER_CODEX_20260821_215825.txt`. The session was planned for approximately 30 minutes; the actual elapsed time was not recorded. Feedback below is paraphrased (public-quotation permission was not obtained).

### Handoff and access

- Participant 1 signed in successfully using email-based WorkOS authentication.
- Participant-only authorization worked after preparation; Participant 1 could reach and use Codex Studio.
- Access was correctly restricted: Participant 1 was denied entry to every other Producer Studio administration module (Codex Studio only).
- Christian's founder access continued to work throughout.
- The manual return to the original conversation worked; Participant 1 came back and gave feedback.
- **Operational friction (not a participant failure):** arranging this access required significant creator/webmaster preparation before the session. Record this as a Phase 0 operational cost and a likely onboarding bottleneck to reduce before wider testing.
- During setup a production authentication key was rotated and verified as a precaution; no secret values are recorded here.

### Experience completed

- Participant 1 imported all six supplied fictional `.txt` files, generated the Master Codex, reached the meaningful point, returned successfully, and provided feedback.
- Participant 1 could imagine using the product again.

### Generated-output evidence

The participant's Master Codex was functionally identical to the creator-rehearsal result except for its generation time. Recorded accurately:

- All six source files were included.
- All six sections were preserved; zero duplicate sections were omitted.
- No written instruction disappeared.
- The purpose section appeared last instead of first.
- Five of the six sections were grouped beneath the broad heading **Needs Review**.
- The conflicting instructions remained present but were not individually identified or compared.
- First-release instructions, after-value feedback, future support, and later conflicting commands were not clearly separated.
- The output demonstrated reliable consolidation and preservation.
- It did not yet demonstrate clear conflict explanation, stage separation, or useful decision ordering.

This session therefore does **not** establish that the Master Codex answered whether prompts contradicted each other, were submitted too early, or belonged to a later stage. Those questions remain open.

### Participant feedback (paraphrased; not quoted)

- Participant 1 had not previously thought about organizing AI prompts this way.
- Seeing the generated result helped them recognize the concept's value.
- They could imagine using it more once familiar with it; their "getting the hang of it" phrasing points to a learning/onboarding curve.
- The name **Codex Studio** felt confusing: because they use several AI products, they read "Codex" as tied to one particular AI rather than as a general prompt-organizing method.
- The upload instruction **"Drop CODEX Files Here"** was unclear; they suggested ordinary language such as **"Drop Prompt Files Here,"** which states the action more directly.

Keep three findings distinct, and do not let the positive reaction stand in for output quality: (1) the participant's perceived value of the *concept*; (2) the demonstrated success of *file consolidation and preservation*; and (3) the still-unresolved *output-quality* weaknesses (ordering, conflict explanation, stage separation). The positive reaction is not evidence that ordering or conflict detection succeeded.

### Session decision — Revise and repeat

- The sharing and access handoff succeeded once prepared.
- Participant 1 discovered real potential value in the concept.
- The return and feedback loop worked.
- The experience revealed clear, actionable improvements rather than a reason to abandon the work.
- The interface language and the Master Codex organization should be improved before broader testing.
- A second participant test should follow the focused revision.

### Proposed next improvements (not yet implemented)

1. Replace internal "CODEX file" language at the upload action with ordinary language such as "Prompt files."
2. Change the visible action to **"Drop Prompt Files Here"** (or an equally clear phrase).
3. Review the name "Codex Studio" separately before wider public sharing; it is not renamed in this documentation pass.
4. Improve Master Codex organization so it distinguishes **Purpose**, **First Release**, **After Value**, **Future Ideas**, and **Decisions Needed**.
5. Name and compare conflicts explicitly for human review.
6. Preserve every source instruction while making timing and dependencies easier to understand.
7. Retain the known warning that refreshing clears the current work until reliable persistence exists.

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
- The settings finding alone did not prove what the *currently deployed* build does. The later creator rehearsal confirmed that refreshing the deployed page clears the imported and generated contents. That visible behavior confirms the lack of reliable persistence for this session; it does not by itself prove every detail of server storage or retention.

Do not expose environment values or claim which live configuration is active beyond this confirmed absence.

### Completed before and during the first participant session

- **First participant selected and session completed.** Participant 1 (identity not stored).
- **Date and planned duration established.** August 21, 2026 — approximately 30 minutes planned; actual elapsed time not recorded.
- **Access method tested.** Email-based WorkOS authentication with participant-only authorization, arranged in advance; no access code, identity, email, or secret is recorded here.
- **Codex-only route restriction tested.** Participant 1 was blocked from every other Producer Studio administration module; Christian's founder access was unaffected.
- **Manual feedback return tested.** Participant 1 returned to the original invitation conversation and replied there.
- **Rehearsal and session completed.** Creator rehearsal (August 20) and the independent participant session (August 21) are both done.

### Remaining open items

- **Creator acknowledgment and outcome-sharing.** Confirm that Christian sent Participant 1 the acknowledgment and the "what changed / what's next" outcome (not yet confirmed here).
- **Focused revision, then a second participant test.** Apply the proposed interface-language and Master Codex-organization improvements (see "Proposed next improvements"), then run another participant session.
- **Reliable persistence.** Refreshing still clears the work; keep the warning until real persistence exists.
- **Reduce access-setup burden.** The significant preparation needed to authorize one participant is an onboarding bottleneck to ease before wider testing.

## Boundaries

This is a documentation and validation plan only. Do not install anything, write application code, add a framework, build the Connection Kit, modify Producer Studio, modify Codex Studio, modify any notation-stage repository, process payments, or create marketplace or public-discovery features.
