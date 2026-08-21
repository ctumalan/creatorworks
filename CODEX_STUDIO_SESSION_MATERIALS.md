# Codex Studio: First CreatorWorks Session Materials

## Status

**Draft session packet — ready for a final factual check, not yet ready to send**

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
- **First participant:** **Confirm before session**
- **Session date and duration:** **Confirm before session**

## Preparation Checklist

### Resolved by the code audit

- [x] Exact supported extensions — `.txt`, `.md`, `.rtf`, `.html`, `.htm` (plus matching text MIME types).
- [x] `.codex` is product language, not a separate file format.
- [x] No AI service is used for Master Codex generation (deterministic app logic; Co-Producer AI is not used by Codex Studio).
- [x] The fictional `.txt` collection passes the application's static import checks.
- [x] Codex Studio has no CreatorWorks return link — the Phase 0 return stays manual.

### Still required before inviting a participant

- [ ] Name one participant who regularly works with AI prompts.
- [ ] Confirm the session date and expected duration.
- [ ] Confirm the live saving destination and the actual live storage and retention behavior. *(Internal: the destination is set through `PUBLIC_CODEX_PROJECT_API_BASE_URL`; the code defaults to the visitor's own `127.0.0.1:4330`; if no saving service runs there, persistence fails and nothing is stored; if the variable points to another server, imported project state may be sent there. Do not expose environment values or claim which live configuration is active.)*
- [ ] Choose and test **one** access method: add the participant's WorkOS identity to the authorized list, **or** provide the approved shared access code. *(Do not place a real access code, identity, email address, or secret in this document.)*
- [ ] Decide the exact manual feedback link or page, and keep it in the invitation as a recovery path.
- [ ] Rehearse the complete handoff once before inviting.

For this first session, use only the supplied fictional, non-sensitive `.txt` files. Because the live saving destination is not yet confirmed, do not ask a participant to import personal, professional, confidential, copyrighted, or client material.

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

## Personal Invitation

Replace the bracketed text before sending.

> Hi [Name],
>
> I made something called Codex Studio for people who gather useful instructions across several AI conversations and then struggle to keep everything organized.
>
> I would like to see whether it can turn a scattered collection of instructions into one clearer, correctly ordered Master Codex without losing anything important.
>
> I am inviting you because [plain, personal reason this experience is relevant to them]. This is an early-access experience for people using it outside my own workspace. It should take about [confirmed time].
>
> I will give you a fictional set of TXT files, so you will not need to share private material. I would like you to try it without me guiding each step, then return and tell me what happened.
>
> There is no payment, and you may stop at any time.
>
> [Open the CreatorWorks introduction]
>
> If you ever get lost, you can come straight back here to tell me what happened: [CreatorWorks feedback link — confirm before sending]

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
- **File handling:** Codex Studio reads the files you select in your browser and may attempt to send the imported project state to a configured saving service. The live saving destination is controlled by how the site is set up and has not yet been confirmed—so for this session you will use only the supplied fictional, non-sensitive files.
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

**Confirm before session:** the exact feedback link or page is still to be decided; the facilitator must set it and test this whole sequence once before inviting the participant. The participant should not have to search for the feedback page.

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

After the session, choose one:

- **Continue:** The participant understood, reached, experienced, returned, and provided useful evidence with acceptable friction.
- **Revise and repeat:** A specific part of the handoff failed but has a reasonable correction.
- **Pause:** Trust, privacy, access, or safety remains unresolved.

Record the decision and the evidence behind it. Do not move forward merely because the session occurred.

## Boundaries

This packet does not authorize changes to CreatorWorks, Producer Studio, Codex Studio, or any other repository. It does not authorize installing software, processing payments, publishing publicly, or uploading private material.
