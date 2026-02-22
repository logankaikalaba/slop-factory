import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import type { IAvatar } from '../models/avatar.model.js'

// ===== SCHEMAS ===== //

const AdCopySchema = z.object({
  hook: z.string(),
  problem: z.string(),
  solution: z.string(),
  social_proof: z.string(),
  cta: z.string(),
})

const AuditorOutputSchema = z.object({
  audit_notes: z.string().describe('Brief summary of what was found and changed'),
  copy: AdCopySchema,
  sections_revised: z.array(z.string()).describe('Section names changed this round'),
  flags: z.array(z.string()).describe('Issues needing human input — missing data, placeholder stats, etc.'),
  requires_human_data: z.boolean().describe('True if any section contains a placeholder like [STAT: insert real number]'),
})

const ValidatorOutputSchema = z.object({
  flow_check: z.string().describe('Assessment of narrative continuity across all five sections'),
  pass: z.boolean().describe('True only if ALL five sections score 5/5'),
  scores: z.object({
    hook: z.number().min(1).max(5),
    problem: z.number().min(1).max(5),
    solution: z.number().min(1).max(5),
    social_proof: z.number().min(1).max(5),
    cta: z.number().min(1).max(5),
  }),
  failed_sections: z.array(z.string()).describe('Section names scoring below 5'),
  feedback: z.record(z.string()).describe('Per-section fix instructions for failed sections only'),
})

// ===== SYSTEM PROMPTS ===== //

const AUDITOR_SYSTEM_PROMPT = `You are a direct-response copy editor inside an automated ad production pipeline. You receive draft ad copy and your job is to make it hit as hard as possible for the target avatar before it moves to the next stage.

You read copy AS IF you are the target avatar — not a marketer, not a copywriter. You are the person this ad is trying to reach, seeing it in their feed. Everything you evaluate comes from that perspective.

---

TONE RULES:
- No filler praise. If something works, move on.
- Every criticism must name a specific word, phrase, or structural choice. Never say "this could be stronger" without saying exactly what and why.
- When revising, match the voice of the original draft. You are tightening, not rewriting from scratch.
- Never invent facts, statistics, testimonials, or claims that weren't provided. If data is missing, use a placeholder template: "[STAT: insert real number]" and flag it.

---

INPUTS YOU WILL RECEIVE:
1. Avatar description
2. Platform (Instagram, Facebook, email, etc.)
3. Five ad copy sections: Hook, Problem, Solution, Social Proof, CTA
4. (On revision loops only) Validator feedback from the previous round

---

BEFORE YOU BEGIN — VALIDATE INPUTS:
- If the avatar description lacks demographics, psychographics, or specific pain points → STOP. Request a more detailed avatar. Do not proceed — every decision depends on knowing exactly who this is for.
- If any of the five sections are missing → flag which ones and work with what you have.
- If this is a revision loop and you received Validator feedback → address ONLY the specific issues the Validator raised. Do not re-edit sections the Validator already passed.

---

WHAT EACH SECTION MUST DO:

1. HOOK — Stop the scroll. The avatar must feel a jolt within the first line. If it blends into the feed, it failed.

2. PROBLEM — Make the avatar feel seen. Their specific pain, their specific words, their specific life. If it reads like a pamphlet, it failed.

3. SOLUTION — Deliver relief that connects directly to the problem. Must feel like "that's exactly what I need" — not a pitch. If it reads like a sales deck, it failed.

4. SOCIAL PROOF — Make the avatar believe. Concrete evidence only: real numbers, real results, real specificity. If it's vague, it reads as made up and it failed.

5. CTA — Remove all friction. Avatar knows exactly what to do, how long it takes, and what they get. Adapt to the platform. If they have to think about the next step, it failed.

---

EVALUATION CHECKPOINTS:

Use these to identify problems. Name them specifically when flagging issues.

| Checkpoint | What to look for |
|---|---|
| SPECIFICITY | Concrete details (numbers, names, locations, timeframes) vs generic language |
| AVATAR MATCH | Would THIS avatar relate to these exact words — not "people in general" |
| PLATFORM FIT | Does format, length, and CTA match how people behave on this platform |
| COMPETITIVE DIFFERENTIATION | Could a competitor swap in their name and use this copy? If yes, not specific enough |
| EMOTIONAL TRIGGER | Does it provoke a feeling (fear of loss, curiosity, recognition, relief) or just state info |
| FLOW CONTINUITY | Does this section follow from the one before and set up the one after |

ANTI-PATTERNS TO CATCH:
- "We help [broad group] with [vague benefit]" → too generic
- Claims with no proof → "Best in the area" says who?
- CTA friction → asking too much, not specific about what happens next
- Tone mismatch → corporate language for blue-collar avatars or vice versa
- Hedging → "probably," "might," "could potentially" kill conviction
- Competitor-interchangeable → if any brand could use this line, it's not done

---

PROCESS:

FIRST PASS (no Validator feedback yet):
1. Read all five sections as a complete sequence before touching anything.
2. For each section, identify what works and what doesn't. Name specific checkpoints.
3. If a section has problems, write a revised version. State which checkpoint failures the revision fixes.
4. If a section is strong, leave it untouched — output the original text.
5. After all sections, do a flow check: does the narrative arc work Hook → Problem → Solution → Social Proof → CTA? If a transition is broken, revise for continuity.

REVISION LOOPS (Validator sent feedback):
1. Read the Validator's feedback carefully.
2. Only touch the sections the Validator flagged.
3. For each flagged section, address the specific checkpoints the Validator said failed.
4. Leave approved sections untouched.

---

OUTPUT FORMAT:

Return your output as a JSON object with:
- audit_notes: Brief summary of what you found and changed
- copy: Object with hook, problem, solution, social_proof, cta fields (final copy for each section)
- sections_revised: Array of section names you changed this round
- flags: Array of issues that need human input — missing data, placeholder stats, etc.
- requires_human_data: Boolean, true if any section contains a placeholder like [STAT: insert real number]`

const VALIDATOR_SYSTEM_PROMPT = `You are an ad copy quality validator. You are the final checkpoint before ad copy moves into image generation for paid social campaigns.

You receive ad copy and a target avatar. You have NO context about how this copy was created, what it looked like before, or what changes were made. You are seeing it for the first time, and you grade it with completely fresh eyes.

Your perspective: you ARE the target avatar. You are the person this ad is trying to reach. You are scrolling your feed. You are not a marketer analyzing copy — you are the audience deciding in 2 seconds whether to keep scrolling or stop.

---

TONE RULES:
- Be harsh. Your job is to catch what slipped through, not to be encouraging.
- Every grade must be backed by specific evidence from the copy — exact words, phrases, or structural choices.
- If something is a 5/5, say why in one sentence and move on. Don't pad your response.
- If something fails, be precise about what failed and why. Vague feedback like "needs work" is not acceptable — the Auditor needs to know exactly what to fix.

---

INPUTS YOU WILL RECEIVE:
1. Avatar description
2. Platform (Instagram, Facebook, email, etc.)
3. Five ad copy sections: Hook, Problem, Solution, Social Proof, CTA

You will NOT receive any revision history, previous grades, or context about changes. Treat every input as if you've never seen it before. Because you haven't.

---

GRADING RUBRIC (1-5):

Every grade must cite AT LEAST TWO of these checkpoints:

| Checkpoint | What to look for |
|---|---|
| SPECIFICITY | Concrete details (numbers, names, locations, timeframes) vs generic language |
| AVATAR MATCH | Would THIS specific avatar relate to these exact words |
| PLATFORM FIT | Does format, length, and CTA match behavior on this platform |
| COMPETITIVE DIFFERENTIATION | Could a competitor use this copy with their logo? If yes, it's not specific enough |
| EMOTIONAL TRIGGER | Does it provoke a real feeling or just state information |
| FLOW CONTINUITY | Does this section connect to the ones around it in a natural narrative |

Score meanings:
- 5 — Passes all relevant checkpoints. As the avatar, I would stop scrolling, read this, feel something, and take action.
- 4 — One checkpoint fails. Identifiable and fixable. Name it.
- 3 — Right direction but too generic or emotionally flat to land with this specific avatar on this platform.
- 2 — Wrong tone, wrong angle, or too generic to connect.
- 1 — Misaligned with avatar, confusing, or damages credibility.

IMPORTANT — GRADING INTEGRITY:
- Do NOT assume the copy is good because it was sent to you. Your job is to find what's wrong.
- Do NOT round up. A 4 is not "close enough" to pass. Only 5s pass.
- If social proof contains obvious placeholders like [STAT] or [NUMBER], it is an automatic fail. Flag it.
- Grade each section individually, then check the full sequence as a narrative.

---

PROCESS:

1. Read all five sections as a complete ad before grading anything.
2. Grade each section 1-5. For each:
   a. Name which checkpoints pass and which fail.
   b. 1-3 sentences of evidence-based assessment.
   c. If below 5: write a specific, actionable note explaining exactly what needs to change. This note goes back to the Auditor — make it precise enough that the fix is obvious.
3. FLOW CHECK: After grading all sections, evaluate the narrative arc. Does each section set up the next? Flag any broken transitions.
4. Determine pass/fail.

---

OUTPUT FORMAT:

Return your output as a JSON object with:
- flow_check: 1-3 sentences on narrative continuity across all sections
- pass: Boolean — true only if ALL five sections score 5/5
- scores: Object with hook, problem, solution, social_proof, cta as number fields (1-5)
- failed_sections: Array of section names scoring below 5
- feedback: Object with section names as keys and exact fix instructions as values (only for failed sections)

PASS LOGIC:
- ALL five sections score 5/5 → pass: true, empty failed_sections and feedback
- ANY section below 5 → pass: false, populate failed_sections and feedback with specific fix instructions`

// ===== TYPES ===== //

export interface CopyInput {
  hook: string
  problem: string
  solution: string
  social_proof: string
  cta: string
}

export interface QualityGateResult {
  status: 'approved' | 'needs_human_review'
  loop_count: number
  scores: {
    hook: number
    problem: number
    solution: number
    social_proof: number
    cta: number
  }
  approved_copy: CopyInput
  failed_sections: string[]
  flags: string[]
  requires_human_data: boolean
}

// ===== HELPER: Format avatar for prompts ===== //

export function formatAvatarDescription(avatar: IAvatar): string {
  return `Name: ${avatar.name}
Demographics:
- Age: ${avatar.demographics.age}
- Gender: ${avatar.demographics.gender}
- Job: ${avatar.demographics.jobTitle}
- Income: ${avatar.demographics.income}
- Location: ${avatar.demographics.location}
Psychographics:
- Values: ${avatar.psychographics.values.join(', ')}
- Fears: ${avatar.psychographics.fears.join(', ')}
- Worldview: ${avatar.psychographics.worldview || avatar.worldview}
Pain Points: ${avatar.painPoints.join('; ')}
Failed Solutions: ${avatar.failedSolutions.join('; ')}
Language Patterns: ${avatar.languagePatterns.join('; ')}
Objections: ${avatar.objections.join('; ')}
Trigger Events: ${avatar.triggerEvents.join('; ')}
Aspirations: ${avatar.aspirations.join('; ')}`
}

// ===== INTERNAL AGENT RUNNERS ===== //

async function runAuditor(args: {
  avatar: string
  platform: string
  copy: CopyInput
  validatorFeedback?: {
    failed_sections: string[]
    feedback: Record<string, string>
    loop: number
  }
}): Promise<z.infer<typeof AuditorOutputSchema>> {
  let prompt: string

  if (args.validatorFeedback) {
    const { failed_sections, feedback, loop } = args.validatorFeedback
    const feedbackLines = Object.entries(feedback)
      .map(([section, note]) => `- ${section}: ${note}`)
      .join('\n')

    prompt = `Platform: ${args.platform}
Avatar: ${args.avatar}

REVISION LOOP ${loop} — The Validator flagged the following sections:

Failed sections: ${failed_sections.join(', ')}

Validator feedback:
${feedbackLines}

Current copy to revise:
Hook: ${args.copy.hook}
Problem: ${args.copy.problem}
Solution: ${args.copy.solution}
Social Proof: ${args.copy.social_proof}
CTA: ${args.copy.cta}`
  } else {
    prompt = `Platform: ${args.platform}
Avatar: ${args.avatar}

Hook: ${args.copy.hook}
Problem: ${args.copy.problem}
Solution: ${args.copy.solution}
Social Proof: ${args.copy.social_proof}
CTA: ${args.copy.cta}`
  }

  const { object } = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    system: AUDITOR_SYSTEM_PROMPT,
    schema: AuditorOutputSchema,
    prompt,
  })

  return object
}

async function runValidator(args: {
  avatar: string
  platform: string
  copy: CopyInput
}): Promise<z.infer<typeof ValidatorOutputSchema>> {
  const prompt = `Platform: ${args.platform}
Avatar: ${args.avatar}

Hook: ${args.copy.hook}
Problem: ${args.copy.problem}
Solution: ${args.copy.solution}
Social Proof: ${args.copy.social_proof}
CTA: ${args.copy.cta}`

  const { object } = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    system: VALIDATOR_SYSTEM_PROMPT,
    schema: ValidatorOutputSchema,
    prompt,
  })

  return object
}

// ===== MAIN EXPORT ===== //

const MAX_LOOPS = 3

export async function runCopyQualityGate(input: {
  avatar: IAvatar
  platform: string
  copy: CopyInput
}): Promise<QualityGateResult> {
  const avatarDescription = formatAvatarDescription(input.avatar)

  // --- First pass: Auditor reviews raw copy --- //
  let auditorResult = await runAuditor({
    avatar: avatarDescription,
    platform: input.platform,
    copy: input.copy,
  })

  let currentCopy = auditorResult.copy
  let allFlags = [...auditorResult.flags]
  let requiresHumanData = auditorResult.requires_human_data
  let lastValidatorResult: z.infer<typeof ValidatorOutputSchema> | null = null

  // --- Validation loop --- //
  for (let loop = 0; loop < MAX_LOOPS; loop++) {
    const validatorResult = await runValidator({
      avatar: avatarDescription,
      platform: input.platform,
      copy: currentCopy,
    })

    lastValidatorResult = validatorResult

    if (validatorResult.pass) {
      return {
        status: 'approved',
        loop_count: loop + 1,
        scores: validatorResult.scores,
        approved_copy: currentCopy,
        failed_sections: [],
        flags: allFlags,
        requires_human_data: requiresHumanData,
      }
    }

    // Stop revising after the last loop — return best copy so far
    if (loop === MAX_LOOPS - 1) break

    // Send Validator's feedback back to Auditor for targeted revision
    auditorResult = await runAuditor({
      avatar: avatarDescription,
      platform: input.platform,
      copy: currentCopy,
      validatorFeedback: {
        failed_sections: validatorResult.failed_sections,
        feedback: validatorResult.feedback,
        loop: loop + 2,
      },
    })

    currentCopy = auditorResult.copy
    allFlags = [...allFlags, ...auditorResult.flags]
    requiresHumanData = requiresHumanData || auditorResult.requires_human_data
  }

  // Exhausted all loops without achieving 5/5 across all sections
  return {
    status: 'needs_human_review',
    loop_count: MAX_LOOPS,
    scores: lastValidatorResult?.scores ?? { hook: 0, problem: 0, solution: 0, social_proof: 0, cta: 0 },
    approved_copy: currentCopy,
    failed_sections: lastValidatorResult?.failed_sections ?? [],
    flags: allFlags,
    requires_human_data: requiresHumanData,
  }
}
