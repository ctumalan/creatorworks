# Codex Studio: First CreatorWorks Session Materials

## Status

**Session packet — creator rehearsal and first independent participant session completed (August 21, 2026); Phase 0 decision: Revise and repeat (focused revision, then a second participant test)**

This packet prepares the first manual CreatorWorks Experience Session using Codex Studio. It does not build CreatorWorks, connect the two applications, or modify Producer Studio.

Before inviting a participant, complete every item marked **Confirm before session**.

## Session Snapshot

- **Work:** Codex Studio
- **Creator:** Christian Tumalán
- **Current address:** <https://christian-tumalan-website.vercel.app/studio-admin/codex-studio/>
- **State for a new participant:** Early access
- **Experience mode:** Guided external link with a manual return
- **Meaningful point:** A Master Codex is generated and available to examine
- **Accepted input:** `.txt`, `.md`, `.rtf`, `.html`, `.htm` text files ("CODEX files" is the app's product name for them; `.codex` is not a separate format). This session uses only the fictional `.txt` files.
- **First participant:** Participant 1 (session completed August 21, 2026)
- **Session date and duration:** August 21, 2026 — approximately 30 minutes planned; actual elapsed time not recorded

## Preparation Checklist

### Resolved by the code audit

- [x] Exact supported extensions — `.txt`, `.md`, `.rtf`, `.html`, `.htm` (plus matching text MIME types).
- [x] `.codex` is product language, not a separate file format.
- [x] No AI service is used for Master Codex generation (deterministic app logic; Co-Producer AI is not used by Codex Studio).
- [x] The fictional `.txt` collection passes the application's static import checks.
- [x] Codex Studio has no CreatorWorks return link — the Phase 0 return stays manual.

**Human-confirmed Vercel finding:** `PUBLIC_CODEX_PROJECT_API_BASE_URL` is **not** set in the Vercel project settings, so a new build would use the code's default (an address on the visitor's own computer). A normal visitor has no saving service there, so with these settings server saving is expected to fail. The later creator rehearsal confirmed that refreshing the currently deployed page clears the imported and generated contents. This proves the session lacks reliable persistence; it does not by itself prove every detail of server storage or retention.

### Status and remaining items

- [x] First participant selected and session completed (Participant 1; identity not stored).
- [x] Date and planned duration established: August 21, 2026 — approximately 30 minutes planned; actual elapsed time not recorded.
- [x] Creator rehearsal confirmed that refreshing the currently deployed page clears the imported and generated contents.
- [x] Access method tested: email-based WorkOS authentication with participant-only authorization (arranged in advance). *(No access code, identity, email address, or secret is recorded here.)*
- [x] Codex-only route restriction tested: Participant 1 was blocked from all other Producer Studio admin modules; founder access unaffected.
- [x] Manual feedback return tested: Participant 1 returned to the original invitation conversation and replied there.
- [x] Creator rehearsal (Aug 20) and independent participant session (Aug 21) both completed.
- [ ] Confirm the creator acknowledgment and outcome-sharing were sent to Participant 1.
- [ ] Focused revision (interface language + Master Codex organization), then a second participant test.

For this first session, use only the supplied fictional, non-sensitive `.txt` files. Because online saving is not expected to work with the current settings—and because a participant's work may not survive a refresh—do not ask a participant to import personal, professional, confidential, copyrighted, or client material.

## Session Purpose

This session is not a test of the participant and not a public review of Christian's ability.

It tests whether:

1. A person can understand why Codex Studio may help them.
2. They can reach and use it without Christian explaining each step.
3. The generated Master Codex preserves the supplied instructions, makes them clearer, and puts them in a useful order—or reveals where it does not.
4. They can return and tell Christian what happened.
5. Christian can acknowledge the response and explain what happens next.

## Creator Readiness Check

Before inviting anyone, Christian confirms the work is ready for one honest conversation—not that it is finished or better than every alternative:

- [ ] There is something real a person can actually experience: a working Codex Studio they can reach and use.
- [ ] Its current state can be described honestly—early access for someone entering from outside Christian's workspace.
- [ ] There is one relevant person who genuinely works with AI prompts and may benefit.
- [ ] There is one meaningful question worth asking (see the main question below).
- [ ] Christian is willing to listen and decide thoughtfully, even if the result is imperfect.

Readiness here means ready for a small invitation, not ready for a public launch. A difficult or imperfect result is still useful evidence.

## First Session Personal Invitation — Anonymized Record

This is an anonymized record of the invitation used for Participant 1. Adapt it before any future session.

> Hi Participant 1,
>
> I made something called Codex Studio for people who gather useful instructions across several AI conversations and then struggle to keep everything organized.
>
> I would like to see whether it can turn a scattered collection of instructions into one clearer, correctly ordered Master Codex without losing anything important.
>
> I am inviting you because you enjoy exploring useful tools and finding better ways to work. This is an early-access experience for people using it outside my own workspace. It should take about 30 minutes.
>
> I will give you a fictional set of TXT files, so you will not need to share private material. I would like you to try it without me guiding each step, then return and tell me what happened.
>
> There is no payment, and you may stop at any time.
>
> Open Codex Studio here after Christian confirms your access: <https://christian-tumalan-website.vercel.app/studio-admin/codex-studio/>
>
> If you get lost or finish the experience, return to this conversation and tell me what happened.

## CreatorWorks Introduction

### Bring scattered AI instructions together into one Master Codex

**Codex Studio** helps people gather prompt instructions from different AI conversations, examine them together, and generate one Master Codex.

Christian made it after seeing how quickly useful instructions can become scattered, repeated, contradictory, or submitted in the wrong order.

### What you will try

You will receive a fictional collection of TXT files containing instructions for an imaginary product. Import them into Codex Studio and generate a Master Codex.

Then examine whether:

- Every important instruction is present.
- Repetition was handled clearly.
- Contradictions are visible rather than silently hidden.
- Instructions appear in a useful order.
- Commands that depend on earlier information are not placed too soon.

### Current state

Codex Studio is stable in Christian's own Producer Studio workspace. For someone entering from outside that workspace, this sharing experience is still **early access**.

That means the application works, but this is the first test of whether a new person can understand, access, and complete the experience without Christian standing beside them.

## Trust Summary Before You Begin

- **Where you are going:** Codex Studio will open on Christian's Producer Studio website.
- **Access:** Codex Studio is inside Christian's private Producer Studio. Access must be arranged before the session. Creating or signing into a WorkOS account does not automatically provide Studio access.
- **Payment:** No payment is required for this session.
- **Files:** Codex Studio accepts several plain-text formats (`.txt`, `.md`, `.rtf`, `.html`, `.htm`). For this session, use only the fictional `.txt` files supplied for the test.
- **File handling:** Codex Studio reads the files you select in your browser. A creator rehearsal confirmed that refreshing the page clears the imported and generated contents. Treat the work as temporary: do not refresh during the session, and save the generated Master Codex before leaving the application. Use only the supplied fictional, non-sensitive files.
- **AI processing:** Codex Studio builds the Master Codex with its own logic; it does not send your imported files to an AI service to create it.
- **What CreatorWorks records:** For this manual test, record only whether you understood, started, reached the Master Codex, returned, and chose to respond. Do not record your file contents or private activity.
- **Known limitation:** early access for new participants. The app accepts several text formats; this session intentionally uses only `.txt`.
- **Leaving:** You may stop at any point without giving a reason.
- **Problem reporting:** If something feels unsafe, misleading, or broken, stop and tell the facilitator.

## Participant Instructions

Please work through these steps without asking Christian what to click unless you become truly stuck.

1. Read the invitation and introduction.
2. Explain in your own words what you believe Codex Studio will do.
3. Open Codex Studio.
4. Enter using the access Christian arranged for you (a sign-in or an access code).
5. Import the supplied fictional TXT files.
6. Examine how Codex Studio organizes the files.
7. Generate the Master Codex.
8. Read the result carefully.
9. Return using the method shown below.
10. Answer the main question and any supporting questions you consider relevant.

You are not expected to fix the application or write a technical report. Describe what happened in ordinary language.

## Manual Return

The recommended Phase 0 return is a simple two-tab arrangement (Codex Studio has no built-in CreatorWorks return, so the return stays manual):

1. Keep the CreatorWorks introduction and feedback page open in the original tab.
2. Open Codex Studio in a separate tab.
3. After the Master Codex is generated, close or leave the Codex Studio tab.
4. Return to the original CreatorWorks tab.
5. Select **I finished — share what happened**.

The feedback link should also be included in the invitation message, so the participant has a recovery path if the original tab is lost.

In the first session (Aug 21, 2026) the manual return worked: Participant 1 returned to the original invitation conversation and replied there, which served as the feedback path. **Before the next test:** decide whether to keep the conversation-reply return or introduce a dedicated feedback page, and test that sequence once so the participant never has to search for where to respond.

## Feedback Page

### You reached the end of the experience

Thank you for trying Codex Studio. Generating a Master Codex shows that the process completed; your experience will tell Christian whether the result was actually useful.

### Main question

> After importing the supplied prompt files, did Codex Studio create a complete, clear, and correctly ordered Master Codex—without losing instructions, introducing contradictions, or placing commands too early?

### Tell Christian what happened

- What was missing, if anything?
- What was repeated unnecessarily?
- Which instructions contradicted each other?
- What appeared in the wrong order?
- Which command appeared before enough context was available?
- Was the Master Codex clearer than the original files? Why or why not?
- Where did you need help entering, using, or leaving Codex Studio?
- Would you use Codex Studio with your own non-sensitive prompts after understanding how files are handled?

### Privacy choice

Choose one before the response is recorded:

- [ ] Keep my response and identity private to Christian.
- [ ] Christian may quote part of my response without my name, after showing me the quote.
- [ ] Christian may consider recognizing me by my chosen name, after asking me again.

Submitting feedback does not require public recognition and does not promise that every suggestion will be implemented.

## Facilitator Observation Record

### Session states

Record **Yes**, **Partly**, **No**, or **Chose to stop**, followed by one factual observation.

| State | Result | What happened |
| --- | --- | --- |
| Invitation opened |  |  |
| Experience understood |  |  |
| Experience started |  |  |
| Meaningful point reached |  |  |
| Participant returned |  |  |
| Response received |  |  |
| Creator acknowledged |  |  |
| Outcome shared |  |  |

### Intervention record

Record every moment when Christian or the facilitator had to help.

| Where | What the participant expected | Help provided | What should change |
| --- | --- | --- | --- |
|  |  |  |  |

### Handoff checkpoints

- **Invitation:** Did the person understand why they were invited?
- **Understanding:** Could they explain what Codex Studio was expected to do?
- **Trust:** Did sign-in or file handling create concern?
- **Access:** Could they reach the application?
- **Experience:** Could they import the test files and generate a Master Codex?
- **Return:** Could they find the way back without being reminded?
- **Response:** Did the question help them describe something useful?

Do not treat clicks, time spent, or completion alone as proof that Codex Studio helped.

## Creator Rehearsal Record — August 20, 2026

This was Christian's private rehearsal, not the first independent participant session.

| Check | Result | What happened |
| --- | --- | --- |
| Fictional files imported | Yes | All six supplied `.txt` files were included. |
| Master Codex generated | Yes | Six sections were included and zero duplicate sections were omitted. |
| Instructions preserved | Yes | The original instructions and deliberate conflicting commands remained present. |
| Useful order created | No | The purpose appeared last, and five sections were grouped under **Needs Review**. |
| Conflicts explained | No | Conflicting instructions remained visible but were not individually identified or compared. |
| Timing and stages clarified | No | First release, after-value feedback, future support, and later commands were not clearly separated. |
| Work survived refresh | No | Refreshing cleared the imported and generated contents. |
| Manual return understandable | Yes | Christian returned to the planned feedback path without getting lost. |

**Rehearsal conclusion:** Codex Studio consolidated all six files without losing their written instructions, but the Master Codex was not yet a clear, correctly ordered decision guide. This is the main result for the participant session to examine independently.

## First Independent Participant Session Record — August 21, 2026

The first independent participant is recorded here as **Participant 1**; no name, email, account, or authentication detail is stored. Feedback is paraphrased (public-quotation permission was not obtained).

| Check | Result | What happened |
| --- | --- | --- |
| Access arranged and used | Yes | Email-based WorkOS authentication; participant-only authorization worked after preparation. |
| Access correctly restricted | Yes | Blocked from all other Producer Studio admin modules (Codex Studio only); founder access unaffected. |
| Fictional files imported | Yes | All six supplied `.txt` files were included. |
| Master Codex generated | Yes | Six sections included, zero duplicate sections omitted; functionally identical to the rehearsal output. |
| Instructions preserved | Yes | No written instruction disappeared; conflicting commands remained present. |
| Useful order created | No | Purpose appeared last; five sections were grouped under **Needs Review**. |
| Conflicts explained | No | Conflicts remained visible but were not individually identified or compared. |
| Timing and stages clarified | No | First release, after-value, future support, and later commands were not clearly separated. |
| Meaningful point reached | Yes | Participant 1 generated and saved the Master Codex. |
| Manual return worked | Yes | Participant 1 returned to the conversation and gave feedback. |
| Could imagine using again | Yes | After becoming familiar with it (an onboarding/learning curve). |

**Operational friction (not a participant failure):** arranging access took significant creator/webmaster preparation beforehand — a likely onboarding bottleneck to reduce before wider testing. During setup a production authentication key was rotated and verified as a precaution; no secret values are recorded.

**Paraphrased feedback:** Participant 1 had not thought about organizing AI prompts this way and, on seeing the result, recognized the concept's value. The name "Codex Studio" read as tied to one particular AI rather than a general prompt-organizing method. The upload action "Drop CODEX Files Here" was unclear; plainer wording such as "Drop Prompt Files Here" was suggested. Keep three findings separate — perceived concept value, successful file consolidation, and the unresolved output-quality weaknesses (ordering, conflict explanation, stage separation); the positive reaction is not evidence that ordering or conflict detection succeeded.

**Session decision: Revise and repeat.** The handoff, value discovery, and feedback loop worked; the interface language and Master Codex organization should improve before a second participant test. See CODEX_STUDIO_VALIDATION.md ("Proposed next improvements") for the full list.

## Creator Acknowledgment

Send this after receiving the response. Adjust it so it truthfully reflects what happened.

> Thank you, [Name]. I received your response and read what you said about [specific part of their experience].
>
> I am going to examine [specific issue or question]. I may not make every suggested change, but I will tell you what I learned or decided by [realistic date or time period].
>
> Your time helped me understand the work more clearly.

## Outcome Update

Complete this after Christian has considered the response.

### What I learned

[One clear observation supported by the participant's experience.]

### What I decided

[What will change, what will be investigated, or why no change is planned.]

### What happens next

[The next honest step and, if appropriate, whether the participant may try an update.]

### Recognition

[Private acknowledgment, chosen public credit, or no public recognition—according to the participant's choice.]

## Optional-Support Concept

Show this only after the participant has completed the experience and feedback. It is a nonfunctional Phase 0 concept. Do not collect money or payment information.

> **Did Codex Studio save you meaningful time or effort?**
>
> Your feedback already helps Christian. If you would also like to support the work in the future, CreatorWorks could provide a simple optional thank-you after the experience.
>
> **I might support this** · **Not now**

Ask:

> Would this feel natural and appreciative at this moment? What would make it feel pressured or uncomfortable?

## Session Decision

**Recorded decision (August 21, 2026): Revise and repeat.** The sharing/access handoff, the participant's discovery of real value, and the return-and-feedback loop all worked; the interface language and the Master Codex organization should be improved before a second participant test. Evidence is in "First Independent Participant Session Record — August 21, 2026" above.

For reference, the Phase 0 options are:

- **Continue:** The participant understood, reached, experienced, returned, and provided useful evidence with acceptable friction.
- **Revise and repeat:** A specific part of the handoff failed but has a reasonable correction. *(Selected.)*
- **Pause:** Trust, privacy, access, or safety remains unresolved.

Record the decision and the evidence behind it. Do not move forward merely because the session occurred.

## Boundaries

This packet does not authorize changes to CreatorWorks, Producer Studio, Codex Studio, or any other repository. It does not authorize installing software, processing payments, publishing publicly, or uploading private material.
