import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { Avatar } from '../models/avatar.model.js'

const PainPointSchema = z.object({
  corePainPoint: z.string(),
  specificChallenges: z.array(z.string()).min(3).max(3),
})

const EmotionalJourneySchema = z.object({
  awareness: z.string(),
  frustration: z.string(),
  desperationAndSeeking: z.string(),
  reliefAndCommitment: z.string(),
})

const VoiceOfCustomerSchema = z.object({
  generalSituationQuotes: z.array(z.string()).min(3),
  painFrustrationQuotes: z.array(z.string()).min(3),
  mindsetQuotes: z.array(z.string()).min(3),
  emotionalDriverQuotes: z.array(z.string()).min(3),
  emotionalResponseQuotes: z.array(z.string()).min(3),
  motivationUrgencyQuotes: z.array(z.string()).min(3),
})

const DeepResearchOutputSchema = z.object({
  name: z.string().describe('A realistic first name for this persona (e.g. "Mike" or "Sarah")'),

  demographics: z.object({
    age: z.string(),
    gender: z.string(),
    location: z.string(),
    income: z.string(),
    jobTitle: z.string(),
    selfIdentifiers: z.string().describe('Labels and lifestyle descriptors they use about themselves'),
  }),

  corePainPoints: z.array(PainPointSchema).min(3).max(3),

  shortTermGoals: z.array(z.string()).min(3).max(3),
  longTermAspirations: z.array(z.string()).min(3).max(3),
  winningOutcome: z.string(),
  braggeryStatement: z.string(),

  emotionalDrivers: z.array(z.string()).min(3),
  psychologicalTriggers: z.array(z.string()).min(3),
  limitingBeliefs: z.array(z.string()).min(3),
  secretDesires: z.array(z.string()).min(2),

  voiceOfCustomer: VoiceOfCustomerSchema,

  deepFears: z.array(z.string()).min(3).max(3),

  psychographicInsights: z.array(z.string()).min(3).max(3),
  contentConsumed: z.array(z.string()).min(3),
  failedBrands: z.array(z.string()).min(2),

  emotionalJourney: EmotionalJourneySchema,

  worldview: z.string().describe('One sentence capturing their core belief about work/effort/technology'),

  fullBriefMd: z.string().describe('Complete, well-formatted markdown report of all research findings — 800-1200 words covering every section'),
})

export async function buildAvatarDeepResearch(avatarLabel: string) {
  const { object } = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    schema: DeepResearchOutputSchema,
    prompt: `You are an expert market research analyst and consumer psychologist. Your job is to take a single avatar input and produce a comprehensive, deeply researched avatar profile that a copywriting team will use to write high-converting ad copy.

Avatar: "${avatarLabel}"

Conduct deep research on this avatar using your extensive knowledge — synthesize everything you know from forums, Reddit threads, industry publications, review sites, complaint boards, social media sentiment, and community discussions.

## Research Directives

### Demographic & Situational Research
- Typical age range
- Gender distribution
- Geographic concentration (regions, urban vs. rural, specific markets)
- Typical monthly revenue or household income range
- Professional backgrounds or career paths that lead to this role
- How they identify themselves — labels, titles, lifestyle descriptors (e.g. "self-made," "provider," "investor," "small business owner")

### Pain Point & Challenge Research
- Top 3 core pain points with 3 specific, concrete challenges each
- Go beyond surface-level. Dig into what keeps them up at night, what they complain about in forums, what they vent about to peers
- Use the REAL language these people use — draw from how they actually write in Reddit threads, Facebook groups, Google reviews, and niche community discussions

### Goals & Aspirations Research
- 3 most pressing short-term goals (next 30-90 days)
- 3 biggest long-term aspirations (1-5 years out)
- What does "winning" look like? What's the dream outcome?
- What would they brag about to peers if they achieved it?

### Emotional Drivers & Psychology
- What emotions drive their decisions (fear of loss, desire for status, need for security, freedom, legacy)?
- What psychological triggers move them to take action vs. stay stuck?
- What limiting beliefs do they carry that hold them back?
- What do they secretly want but won't say out loud?

### Voice-of-Customer Research (Direct Quotes)
This is critical. You need realistic, raw, unfiltered language — NOT corporate speak or marketer language. Reconstruct the exact way these people actually talk about their problems, goals, and emotions. Source language from your knowledge of forums, reviews, social posts, and community discussions.

Generate quotes for:
- General situation (how they describe their current situation in casual conversation)
- Pain/frustration (how they express anger, annoyance, or exhaustion about their problems)
- Mindset (internal dialogue — stories they tell themselves about why things are the way they are)
- Emotional drivers (how they talk about what's really motivating them underneath — family, freedom, pride, fear)
- Emotional responses to struggles (how they react when things go wrong or feel stuck)
- Motivation/urgency (what they say at the tipping point when fired up and ready to make a change)

### Deep Fear Research
3 deepest emotional fears — NOT surface fears. The real ones:
- Fear of irrelevance, fear of failure in front of family, fear of being exposed as incompetent
- Fear of missing their window, fear of wasting years on the wrong path

### Psychographic & Behavioral Research
- 3 key psychographic insights (values, beliefs, attitudes, lifestyle choices that shape buying behavior)
- What content do they consume? Who do they follow? (podcasts, YouTube channels, influencers)
- What brands or services have they already tried and been burned by?

### Emotional Journey Mapping
- Awareness: How do they first realize they have this problem?
- Frustration: What happens when initial attempts fail? How does frustration build?
- Desperation & Seeking Solutions: What does the breaking point look like? What pushes them to actively search for help?
- Relief & Commitment: What does it feel like when they finally find something that works?

Fill every field with real, specific, research-backed insights about "${avatarLabel}". No generic filler. Every insight must be specific to this avatar type.

The fullBriefMd should be a complete, well-formatted markdown document (800-1200 words) that reads like a professional market research report, covering all sections above with rich detail.`,
  })

  // Flatten pain points into summary strings
  const painPointsSummary = object.corePainPoints.map(
    (p) => `${p.corePainPoint}: ${p.specificChallenges.join('; ')}`,
  )

  // Collect all voice-of-customer quotes for languagePatterns field
  const voc = object.voiceOfCustomer
  const allQuotes = [
    ...voc.generalSituationQuotes,
    ...voc.painFrustrationQuotes,
    ...voc.mindsetQuotes,
    ...voc.emotionalDriverQuotes,
    ...voc.emotionalResponseQuotes,
    ...voc.motivationUrgencyQuotes,
  ]

  const avatar = await Avatar.create({
    name: object.name,
    demographics: {
      age: object.demographics.age,
      income: object.demographics.income,
      location: object.demographics.location,
      jobTitle: object.demographics.jobTitle,
      gender: object.demographics.gender,
    },
    psychographics: {
      values: object.psychographicInsights,
      fears: object.deepFears,
      worldview: object.demographics.selfIdentifiers,
    },
    painPoints: painPointsSummary,
    failedSolutions: object.failedBrands,
    languagePatterns: allQuotes,
    objections: object.limitingBeliefs,
    triggerEvents: [
      object.emotionalJourney.awareness,
      object.emotionalJourney.frustration,
      object.emotionalJourney.desperationAndSeeking,
    ],
    aspirations: [...object.shortTermGoals, ...object.longTermAspirations],
    worldview: object.worldview,
    fullBriefMd: object.fullBriefMd,
  })

  return avatar
}
