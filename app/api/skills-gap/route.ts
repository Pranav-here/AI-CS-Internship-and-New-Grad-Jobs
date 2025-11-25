import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import { findSkillResources } from "@/lib/skills-database"

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
const friendlyError = "Something went wrong while analyzing your skills gap. Please try again."

type SkillsGapRequest = {
  userSkills?: string[]
  jobDescription?: string
  resume?: string
  targetRoles?: string[]
}

type SkillGap = {
  skill: string
  priority: "critical" | "important" | "nice-to-have"
  reason: string
  resources: { name: string; url: string; type: string }[]
}

type SkillsGapResponse = {
  criticalGaps: SkillGap[]
  importantGaps: SkillGap[]
  niceToHaveGaps: SkillGap[]
  existingSkills: string[]
  extractedSkills: string[]
}

const sanitizeString = (value: unknown) => (typeof value === "string" ? value.trim() : "")

const getAnthropicAnalysis = async ({
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
        max_tokens: 4000,
        temperature: 0.1,
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
        console.error(`Anthropic returned an empty analysis for model ${model}.`)
        continue
      }

      return { analysisText: text, modelUsed: model }
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
  let payload: Partial<SkillsGapRequest> = {}

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const userSkills = Array.isArray(payload.userSkills) ? payload.userSkills : []
  const jobDescription = sanitizeString(payload.jobDescription)
  const resume = sanitizeString(payload.resume)
  const targetRoles = Array.isArray(payload.targetRoles) ? payload.targetRoles : []

  if (!jobDescription && !resume && targetRoles.length === 0) {
    return NextResponse.json(
      { error: "Please provide either a job description, resume, or target roles." },
      { status: 400 }
    )
  }

  if (jobDescription && jobDescription.length > JOB_DESCRIPTION_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Job description is too long. Maximum ${JOB_DESCRIPTION_MAX_LENGTH.toLocaleString()} characters.` },
      { status: 400 }
    )
  }

  if (resume && resume.length > RESUME_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Resume is too long. Maximum ${RESUME_MAX_LENGTH.toLocaleString()} characters.` },
      { status: 400 }
    )
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY

  if (!anthropicApiKey) {
    console.error("Missing Anthropic API key.")
    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey: anthropicApiKey })

  try {
    const systemPrompt = `You are a career development expert and technical skills analyst. Your task is to:

1. Extract technical skills from resumes and job descriptions
2. Compare candidate skills against job requirements
3. Identify skill gaps and prioritize them
4. Provide specific, actionable learning recommendations

When analyzing skills:
- Focus on technical skills (programming languages, frameworks, tools, platforms)
- Ignore soft skills (communication, leadership, etc.)
- Consider context (a "Python" mention in a data science role vs web dev role)
- Prioritize based on: job requirements, industry standards, career trajectory

Return your analysis in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "extractedSkills": ["skill1", "skill2", ...],
  "criticalGaps": [
    {
      "skill": "skill name",
      "reason": "why this is critical for the role"
    }
  ],
  "importantGaps": [
    {
      "skill": "skill name",
      "reason": "why this is important"
    }
  ],
  "niceToHaveGaps": [
    {
      "skill": "skill name",
      "reason": "why this would be beneficial"
    }
  ],
  "existingSkills": ["skill1", "skill2", ...]
}

Priority definitions:
- **Critical**: Must-have skills explicitly required in job description or essential for target role
- **Important**: Frequently mentioned or strongly preferred skills that give significant advantage
- **Nice-to-have**: Beneficial skills that enhance candidacy but aren't deal-breakers

Be specific about skill names (e.g., "PyTorch" not just "deep learning frameworks").`

    let anthropicPrompt = "Analyze the candidate's skills and identify gaps based on:\n\n"

    if (userSkills.length > 0) {
      anthropicPrompt += `=== CANDIDATE'S CURRENT SKILLS ===\n${userSkills.join(", ")}\n\n`
    }

    if (resume) {
      anthropicPrompt += `=== CANDIDATE'S RESUME ===\n${resume}\n\n`
    }

    if (jobDescription) {
      anthropicPrompt += `=== JOB DESCRIPTION ===\n${jobDescription}\n\n`
    }

    if (targetRoles.length > 0) {
      anthropicPrompt += `=== TARGET ROLES ===\n${targetRoles.join(", ")}\n\n`
    }

    anthropicPrompt +=
      "Provide a comprehensive skills gap analysis in the exact JSON format specified. If analyzing a resume, first extract skills from it. Then compare against requirements and identify gaps with clear priorities and reasons."

    const { analysisText } = await getAnthropicAnalysis({
      anthropicClient: anthropic,
      prompt: anthropicPrompt,
      systemPrompt,
    })

    // Parse the JSON response
    let parsedAnalysis: any
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0])
      } else {
        parsedAnalysis = JSON.parse(analysisText)
      }
    } catch (parseError) {
      console.error("Failed to parse Claude response as JSON:", analysisText)
      return NextResponse.json({ error: "Failed to parse analysis results." }, { status: 500 })
    }

    // Add learning resources for each gap
    const addResources = (gaps: any[]) => {
      return gaps.map((gap) => ({
        skill: gap.skill,
        priority: gap.priority || "nice-to-have",
        reason: gap.reason,
        resources: findSkillResources(gap.skill),
      }))
    }

    const response: SkillsGapResponse = {
      criticalGaps: addResources(
        (parsedAnalysis.criticalGaps || []).map((g: any) => ({ ...g, priority: "critical" }))
      ),
      importantGaps: addResources(
        (parsedAnalysis.importantGaps || []).map((g: any) => ({ ...g, priority: "important" }))
      ),
      niceToHaveGaps: addResources(
        (parsedAnalysis.niceToHaveGaps || []).map((g: any) => ({ ...g, priority: "nice-to-have" }))
      ),
      existingSkills: parsedAnalysis.existingSkills || userSkills,
      extractedSkills: parsedAnalysis.extractedSkills || [],
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Skills gap analysis error:", error)
    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }
}
