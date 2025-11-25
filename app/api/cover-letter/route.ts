import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022"
const ANTHROPIC_MODEL_CANDIDATES: string[] = Array.from(
  new Set(
    [
      process.env.ANTHROPIC_MODEL,
      ANTHROPIC_MODEL,
      "claude-3-5-sonnet-latest",
      "claude-3-5-sonnet-20240620",
      "claude-3-5-haiku-latest",
    ].filter((model): model is string => Boolean(model))
  )
)

const JOB_DESCRIPTION_MAX_LENGTH = 15000
const RESUME_MAX_LENGTH = 50000
const TARGET_ROLE_MAX_LENGTH = 120
const friendlyError = "Something went wrong while generating your cover letter. Please try again."

type CoverLetterStyle = "formal" | "professional" | "enthusiastic"

type CoverLetterRequest = {
  jobDescription: string
  resume: string
  targetRole?: string
  style?: CoverLetterStyle
}

const stylePrompts: Record<CoverLetterStyle, string> = {
  formal: `TONE: Formal and traditional business communication
- Use third-person references occasionally ("one would find that my experience...")
- Employ formal vocabulary: "regarding," "furthermore," "subsequently," "accordingly"
- Structure: Very structured with clear topic sentences
- NO exclamation marks, minimal contractions
- Opening: "I am writing to express my interest in the [position] at [company]"
- Closing: "I look forward to the opportunity to discuss my qualifications further" or "Thank you for your consideration of my application"
- Keep emotion minimal - focus purely on qualifications and fit
- Example phrases: "would be honored to contribute," "extensive background in," "demonstrated expertise"`,

  professional: `TONE: Professional yet personable and conversational
- Use first-person naturally ("I'm excited to apply...")
- Balance professional and approachable language
- Can use some contractions (I'm, I've, I'd)
- Opening: "I'm reaching out to apply for the [position] at [company]" or "Your posting for [position] immediately caught my attention"
- Closing: "I'd love to discuss how my experience aligns with your needs" or "I'm excited about the possibility of joining your team"
- Show personality while maintaining professionalism
- Example phrases: "I'm passionate about," "really resonates with me," "I'd bring," "looking forward to"`,

  enthusiastic: `TONE: Energetic, passionate, and genuinely excited
- Use exclamation marks (but not excessively - 2-3 per letter)
- Show visible excitement and passion for the role and company
- Use dynamic action words: "thrilled," "excited," "eager," "passionate," "can't wait"
- Opening: "I'm thrilled to apply for the [position] at [company]!" or "When I saw your opening for [position], I knew I had to apply!"
- Closing: "I'm eager to discuss how I can contribute to your team's success!" or "I can't wait to bring my skills and passion to [company]!"
- Show genuine interest in the company's mission/product
- Example phrases: "I'm incredibly excited about," "I would love the opportunity to," "energized by the prospect of," "passionate about driving"
- Reference specific things about the company that excite you`,
}

const sanitizeString = (value: unknown) => (typeof value === "string" ? value.trim() : "")
const sanitizeOptionalString = (value: unknown) => (typeof value === "string" ? value.trim() : undefined)
const sanitizeStyle = (value: unknown): CoverLetterStyle => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""
  return ["formal", "professional", "enthusiastic"].includes(normalized)
    ? (normalized as CoverLetterStyle)
    : "professional"
}

const getAnthropicCoverLetter = async ({
  anthropicClient,
  prompt,
  systemPrompt,
}: {
  anthropicClient: Anthropic
  prompt: string
  systemPrompt: string
}) => {
  let lastError: unknown

  for (const model of ANTHROPIC_MODEL_CANDIDATES) {
    try {
      const response = await anthropicClient.messages.create({
        model,
        max_tokens: 2000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      })

      const text = response.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("\n")
        .trim()

      if (!text) {
        console.error(`Anthropic returned an empty cover letter for model ${model}.`)
        continue
      }

      return { coverLetterText: text, modelUsed: model }
    } catch (error: any) {
      const errorType = error?.error?.error?.type ?? error?.error?.type
      console.error(`Anthropic model ${model} failed:`, error)

      if (errorType === "not_found_error") {
        lastError = error
        continue
      }

      throw error
    }
  }

  throw lastError ?? new Error("All Anthropic model attempts failed.")
}

export async function POST(request: NextRequest) {
  let payload: Partial<CoverLetterRequest> = {}

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const jobDescription = sanitizeString(payload.jobDescription)
  const resume = sanitizeString(payload.resume)
  let targetRole = sanitizeOptionalString(payload.targetRole)
  const style = sanitizeStyle(payload.style)

  if (!jobDescription || !resume) {
    return NextResponse.json({ error: "Job description and resume are both required." }, { status: 400 })
  }

  if (jobDescription.length > JOB_DESCRIPTION_MAX_LENGTH || resume.length > RESUME_MAX_LENGTH) {
    return NextResponse.json(
      {
        error: `Inputs are too long. Job descriptions are limited to ${JOB_DESCRIPTION_MAX_LENGTH.toLocaleString()} characters and resumes are limited to ${RESUME_MAX_LENGTH.toLocaleString()} characters.`,
      },
      { status: 400 }
    )
  }

  if (targetRole && targetRole.length > TARGET_ROLE_MAX_LENGTH) {
    targetRole = targetRole.slice(0, TARGET_ROLE_MAX_LENGTH)
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY

  if (!anthropicApiKey) {
    console.error("Missing Anthropic API key.")
    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey: anthropicApiKey })

  try {
    const systemPrompt = `You are an expert career coach and professional cover letter writer. Your task is to create compelling, ATS-friendly cover letters that help candidates stand out.

CRITICAL: You MUST strictly follow the tone and style guidelines provided below. The differences between styles should be clearly noticeable.

General Guidelines:
- Write a 3-4 paragraph cover letter (approximately 250-350 words)
- Use STAR methodology (Situation, Task, Action, Result) when describing relevant experiences
- Match keywords from the job description naturally
- Highlight 2-3 most relevant achievements from the resume
- Use specific examples with measurable results when possible
- Keep paragraphs concise and impactful
- Do NOT include contact information, date, or company address (just the body)
- Start directly with the opening paragraph
- End with a strong closing paragraph and professional sign-off

STYLE REQUIREMENTS (MUST FOLLOW EXACTLY):
${stylePrompts[style]}

Format: Plain text only, no markdown. Professional business letter format.`

    const anthropicPrompt = [
      `Create a tailored cover letter in a ${style.toUpperCase()} style based on the following information:`,
      "",
      "=== JOB DESCRIPTION ===",
      jobDescription,
      "",
      "=== CANDIDATE'S RESUME ===",
      resume,
      targetRole ? `\n=== TARGET ROLE ===\n${targetRole}` : "",
      "",
      `IMPORTANT: Write a compelling cover letter that connects the candidate's experience to this specific role. Focus on their most relevant achievements and why they're excited about this opportunity.`,
      "",
      `CRITICAL REMINDER: Use the ${style.toUpperCase()} tone and style guidelines EXACTLY as specified in your instructions. The tone should be distinctly ${style}.`,
    ]
      .filter(Boolean)
      .join("\n")
      .trim()

    const { coverLetterText } = await getAnthropicCoverLetter({
      anthropicClient: anthropic,
      prompt: anthropicPrompt,
      systemPrompt,
    })

    // Remove any markdown formatting
    const cleanedText = coverLetterText
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/^#{1,6}\s*/gm, "")
      .trim()

    return NextResponse.json({
      coverLetter: cleanedText,
      style,
    })
  } catch (error) {
    console.error("Cover letter generation error:", error)
    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }
}
