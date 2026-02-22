import { streamObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { Avatar } from '../models/avatar.model.js'

const DeepResearchOutputSchema = z.object({
  name: z.string().describe('A realistic first name for this persona (e.g. "Mike" or "Sarah")'),

  demographics: z.object({
    age: z.string(),
    gender: z.string(),
    location: z.string(),
    income: z.string(),
    jobTitle: z.string(),
  }),

  psychographics: z.object({
    values: z.array(z.string()).describe('3 core psychographic values/beliefs'),
    fears: z.array(z.string()).describe('3 deepest emotional fears'),
    worldview: z.string().describe('How they identify themselves — labels and lifestyle descriptors'),
  }),

  painPoints: z.array(z.string()).describe('3 core pain points, each with 3 challenges embedded in the string'),
  failedSolutions: z.array(z.string()).describe('Brands, services, or approaches already tried and failed'),
  languagePatterns: z.array(z.string()).describe('Raw, unfiltered voice-of-customer quotes across all 6 categories'),
  objections: z.array(z.string()).describe('Limiting beliefs that hold them back'),
  triggerEvents: z.array(z.string()).describe('The emotional journey stages: awareness → frustration → desperation → relief'),
  aspirations: z.array(z.string()).describe('Short-term goals and long-term aspirations combined'),
  worldview: z.string().describe('One sentence capturing their core belief about work/effort/life'),

  fullBriefMd: z.string().describe('Complete markdown research report covering all sections: demographics, pain points with specific challenges, goals, emotional drivers, VOC quotes by category, deep fears, psychographic insights, content consumed, emotional journey map'),
})

export async function buildAvatarDeepResearch(
  avatarLabel: string,
  onProgress?: (completedFields: string[]) => void,
) {
  const stream = streamObject({
    model: anthropic('claude-sonnet-4-6'),
    schema: DeepResearchOutputSchema,
    maxTokens: 8000,
    prompt: `You are an expert market research analyst and consumer psychologist. Produce a comprehensive, deeply researched avatar profile for copywriters writing high-converting ad copy.

Avatar: "${avatarLabel}"

Research this avatar thoroughly using your knowledge of forums, Reddit, industry publications, review sites, complaint boards, and social media.

Fill all fields with specific, real insights about "${avatarLabel}":

**name**: A first name for this persona.

**demographics**: age range, gender split, geographic concentration, monthly income/revenue, job title/career path.

**psychographics.values**: 3 core values that drive their buying decisions.
**psychographics.fears**: Their 3 deepest emotional fears (not surface fears — the real ones: fear of irrelevance, failure in front of family, missing their window, etc.).
**psychographics.worldview**: How they identify themselves — the labels and lifestyle descriptors they use ("self-made", "provider", "investor", etc.).

**painPoints**: Exactly 3 strings, each formatted as: "Core pain point: specific challenge 1; specific challenge 2; specific challenge 3"

**failedSolutions**: Brands, tools, programs, or approaches they've already tried that let them down.

**languagePatterns**: 12-18 raw, unfiltered voice-of-customer quotes covering all 6 categories — write them the way these people ACTUALLY talk, not corporate speak:
  - General situation quotes (how they describe their day-to-day)
  - Pain/frustration quotes (anger, exhaustion, venting)
  - Mindset quotes (internal dialogue, stories they tell themselves)
  - Emotional driver quotes (family, freedom, pride, fear underneath)
  - Emotional response quotes (how they react when things go wrong)
  - Motivation/urgency quotes (tipping-point language when ready to act)

**objections**: The limiting beliefs and mental blocks that keep them stuck.

**triggerEvents**: 4 strings describing the emotional journey stages:
  1. "Awareness: [how they first realize they have the problem]"
  2. "Frustration: [what happens when initial attempts fail]"
  3. "Desperation: [the breaking point — what pushes them to actively seek help]"
  4. "Relief: [what it feels like when they finally find something that works]"

**aspirations**: Their short-term goals (next 30-90 days) and long-term aspirations (1-5 years) combined into a single list.

**worldview**: One sentence capturing their core belief about work, effort, and technology.

**fullBriefMd**: A complete, well-formatted markdown research report. Use headers for each section. Include all the above plus: what content they consume, who they follow, what "winning" looks like, what they'd brag about, and what they secretly want but won't say out loud. This should read like a professional market research document a copywriter can hand to a client.`,
  })

  // Stream partial objects and notify caller each time a new top-level field appears
  const seenFields = new Set<string>()
  for await (const partial of stream.partialObjectStream) {
    const newFields = Object.keys(partial).filter((k) => !seenFields.has(k))
    if (newFields.length > 0) {
      for (const f of newFields) seenFields.add(f)
      onProgress?.([...seenFields])
    }
  }

  const result = await stream.object

  const avatar = await Avatar.create({
    name: result.name,
    demographics: {
      age: result.demographics.age,
      income: result.demographics.income,
      location: result.demographics.location,
      jobTitle: result.demographics.jobTitle,
      gender: result.demographics.gender,
    },
    psychographics: {
      values: result.psychographics.values,
      fears: result.psychographics.fears,
      worldview: result.psychographics.worldview,
    },
    painPoints: result.painPoints,
    failedSolutions: result.failedSolutions,
    languagePatterns: result.languagePatterns,
    objections: result.objections,
    triggerEvents: result.triggerEvents,
    aspirations: result.aspirations,
    worldview: result.worldview,
    fullBriefMd: result.fullBriefMd,
  })

  return avatar
}
