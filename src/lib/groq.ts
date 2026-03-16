// Groq API client for facial analysis
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

export interface FacialMetrics {
  symmetry_score: number
  proportion_score: number
  harmony_score: number
  jawline_score: number
  eye_balance_score: number
  cutmix_score: number
  strengths: string[]
  weaknesses: string[]
  proportion_analysis: string
  harmony_evaluation: string
  suggestions: {
    grooming: string[]
    hairstyle: string[]
    facial_hair: string[]
    skincare: string[]
    posture: string[]
  }
  feature_details: {
    eyes: { score: number; notes: string }
    nose: { score: number; notes: string }
    jawline: { score: number; notes: string }
    cheekbones: { score: number; notes: string }
    lips: { score: number; notes: string }
    forehead: { score: number; notes: string }
  }
  tier: string
  tier_description: string
}

export async function analyzeFaceWithGroq(base64Image: string): Promise<FacialMetrics> {
  const prompt = `You are CutMix AI, an advanced facial analysis system. Analyze this face image with the precision of a professional aesthetician and plastic surgeon combined.

Perform a comprehensive facial analysis and return ONLY a valid JSON object with exactly this structure:

{
  "symmetry_score": <0-100, based on left/right facial symmetry>,
  "proportion_score": <0-100, based on golden ratio adherence>,
  "harmony_score": <0-100, based on overall feature harmony>,
  "jawline_score": <0-100, based on jaw definition and structure>,
  "eye_balance_score": <0-100, based on eye spacing, size, tilt>,
  "cutmix_score": <0-100, weighted composite of all scores>,
  "strengths": [<3-5 specific structural strengths as strings>],
  "weaknesses": [<2-4 specific improvement areas as strings>],
  "proportion_analysis": "<2-3 sentence mathematical proportion analysis>",
  "harmony_evaluation": "<2-3 sentence harmony evaluation>",
  "suggestions": {
    "grooming": [<2-3 specific grooming suggestions>],
    "hairstyle": [<2-3 specific hairstyle recommendations>],
    "facial_hair": [<2-3 facial hair suggestions>],
    "skincare": [<2-3 skincare recommendations>],
    "posture": [<1-2 posture/angle suggestions>]
  },
  "feature_details": {
    "eyes": { "score": <0-100>, "notes": "<specific observation>" },
    "nose": { "score": <0-100>, "notes": "<specific observation>" },
    "jawline": { "score": <0-100>, "notes": "<specific observation>" },
    "cheekbones": { "score": <0-100>, "notes": "<specific observation>" },
    "lips": { "score": <0-100>, "notes": "<specific observation>" },
    "forehead": { "score": <0-100>, "notes": "<specific observation>" }
  },
  "tier": "<one of: Developing|Solid|Attractive|Sharp|Elite>",
  "tier_description": "<one sentence description of this tier>"
}

Scoring guidelines:
- 0-40: Developing
- 41-60: Solid  
- 61-74: Attractive
- 75-84: Sharp
- 85-100: Elite

Be accurate, specific, and constructive. Base all scores on actual visible facial features.`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq API error: ${err}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  return JSON.parse(content) as FacialMetrics
}
