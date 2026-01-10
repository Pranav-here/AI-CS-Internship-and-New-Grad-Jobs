import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

import { createResumeDocx, EXPANDED_RESUME_MAX_LENGTH, JOB_DESCRIPTION_MAX_LENGTH } from "@/lib/ai-resume"

export const runtime = "nodejs"

const ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022"
const OPENAI_MODEL = "gpt-4o-mini"
const OPENAI_MODEL_CANDIDATES: string[] = Array.from(
  new Set(
    [
      process.env.OPENAI_RESUME_MODEL,
      OPENAI_MODEL,
      "gpt-4o-mini-2024-07-18",
      "gpt-4o-mini-2024-07-22",
      "gpt-4o",
    ].filter((model): model is string => Boolean(model))
  )
)
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

const TARGET_ROLE_MAX_LENGTH = 120
const SENIORITY_MAX_LENGTH = 60
const friendlyError = "Something went wrong while generating your resume. Please try again."
const ATS_TARGET_SCORE = 80

type OutputFormat = "docx" | "text" | "latex"
const OUTPUT_FORMATS: OutputFormat[] = ["docx", "text", "latex"]
const DEFAULT_OUTPUT_FORMAT: OutputFormat = "docx"

type ResumeMode = "lean_ats" | "story"
const DEFAULT_MODE: ResumeMode = "lean_ats"

type MetricStrictness = "strict" | "lenient"
const DEFAULT_METRIC_STRICTNESS: MetricStrictness = "strict"

type AiResumeRequest = {
  jobDescription: string
  expandedResume: string
  targetRole?: string
  seniority?: string
  outputFormat?: OutputFormat
  mode?: ResumeMode
  metricStrictness?: MetricStrictness
  bannedTopics?: string
  proudestWins?: string
}

type FormatConfig = {
  draftingSystemPrompt: string
  proofreadSystemPrompt: string
  extension: string
  mimeType: string
  downloadFileName: string
  userFormatHint?: string
}

type ResumeFacts = {
  summary?: string
  experiences?: Array<{
    company?: string
    title?: string
    dates?: string
    location?: string
    bullets?: string[]
    tools?: string[]
    metrics?: string[]
  }>
  projects?: Array<{
    name?: string
    role?: string
    bullets?: string[]
    tools?: string[]
    metrics?: string[]
  }>
  skills?: string[]
  education?: string[]
  authorization?: string
}

type JobDigest = {
  mustHaveSkills: string[]
  keywords: string[]
  responsibilities: string[]
}

type AtsScoreResult = {
  overallScore: number
  technicalSkillsScore: number
  jobTitleScore: number
  experienceRelevanceScore: number
  educationScore: number
  industryKeywordsScore: number
  locationScore: number
  formattingScore: number
  matchedSkills: string[]
  missingSkills: string[]
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: string[]
  formattingIssues: string[]
  breakdown: {
    technicalSkills: number
    jobTitle: number
    experience: number
    education: number
    industry: number
    location: number
    formatting: number
  }
}

const formatConfigs: Record<OutputFormat, FormatConfig> = {
  docx: {
    draftingSystemPrompt:
      "You are a precision resume writer for tech roles. Draft a concise, ATS-aligned resume that fits in roughly two pages (Word format, 11pt font, normal margins). Use only provided resumeFacts—never invent companies, titles, skills, education, locations, or authorization. If a JD skill is missing, place it under 'Skills to develop' instead of Experience/Skills. Use STAR (Situation, Task, Action, Result) framing with measurable impact for Experience and Projects bullets. Include Summary, Skills, Experience, Projects (if relevant), and Education sections. Limit bullet points per role to six, keep each bullet crisp and action-oriented, avoid contact details, and return structured plain text with section headers and '-' bullet markers (no Markdown).",
    proofreadSystemPrompt:
      "You are a professional resume editor optimizing for ATS. Lightly proofread for grammar, clarity, and consistency while preserving section order, STAR bullet structure, keywords, and all grounding from resumeFacts. Do not add new claims. Keep it within roughly two pages and return plain text only (no markdown).",
    extension: "docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    downloadFileName: "AI_Tailored_Resume.docx",
    userFormatHint: "Return plain text with clear section headers and bullet lines beginning with '- '.",
  },
  text: {
    draftingSystemPrompt:
      "You are a precision resume writer for tech roles. Create an ATS-friendly plain-text resume that fits in roughly two pages at 11pt font. Use only provided resumeFacts—never invent companies, titles, skills, education, locations, or authorization. If a JD skill is missing, place it under 'Skills to develop' instead of Experience/Skills. Use STAR (Situation, Task, Action, Result) phrasing with measurable impact for Experience and Projects bullets. Include Summary, Skills, Experience, Projects (if relevant), and Education. Avoid decorative formatting, contact details, and filler; return simple section headers with '-' bullet markers (no Markdown).",
    proofreadSystemPrompt:
      "You are a professional editor. Polish this ATS-focused plain-text resume without altering sections, STAR bullet structure, keywords, or grounding from resumeFacts. Do not add new claims. Keep it concise (~2 pages) and return plain text only (no markdown).",
    extension: "txt",
    mimeType: "text/plain",
    downloadFileName: "AI_Tailored_Resume.txt",
    userFormatHint: "Produce ATS-safe plain text with section headings and '-' bullets only; no Markdown or extra symbols.",
  },
  latex: {
    draftingSystemPrompt:
      "You are a precision resume writer and LaTeX author for tech roles. Produce a concise, ATS-aware resume as fully compilable LaTeX source (~2 pages at 11pt with normal margins). Use only provided resumeFacts—never invent companies, titles, skills, education, locations, or authorization. If a JD skill is missing, place it under 'Skills to develop' instead of Experience/Skills. Use STAR (Situation, Task, Action, Result) phrasing with measurable impact for Experience and Projects bullets. Include Summary, Skills, Experience, Projects (if relevant), and Education. Use a minimal preamble (e.g., \\documentclass{article}, \\usepackage[margin=1in]{geometry}, \\usepackage{enumitem}) and itemize for bullets. Use 'Your Name' as the placeholder header, exclude contact details, and return ONLY LaTeX code (no Markdown or commentary).",
    proofreadSystemPrompt:
      "You are a professional editor working on LaTeX resume source. Improve grammar and clarity while preserving LaTeX commands, STAR bullet structure, keywords, and grounding from resumeFacts. Do not add new claims. Keep it concise (~2 pages) and return only valid LaTeX source.",
    extension: "tex",
    mimeType: "application/x-tex",
    downloadFileName: "AI_Tailored_Resume.tex",
    userFormatHint: "Output fully compilable LaTeX source only, starting with the document class and ending with \\end{document}.",
  },
}

const stripMarkdown = (value: string) =>
  value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .trim()

const sanitizeString = (value: unknown) => (typeof value === "string" ? value.trim() : "")
const sanitizeOptionalString = (value: unknown) => (typeof value === "string" ? value.trim() : undefined)
const sanitizeOutputFormat = (value: unknown): OutputFormat => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""
  return OUTPUT_FORMATS.includes(normalized as OutputFormat) ? (normalized as OutputFormat) : DEFAULT_OUTPUT_FORMAT
}
const sanitizeMode = (value: unknown): ResumeMode => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""
  return normalized === "story" ? "story" : "lean_ats"
}
const sanitizeMetricStrictness = (value: unknown): MetricStrictness => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""
  return normalized === "lenient" ? "lenient" : "strict"
}

const sharedTargetingReminder =
  "- Only keep achievements and skills that directly match the job description and target role so the output stays ATS-friendly and relevant.\n" +
  "- Write Experience and Projects bullets with STAR (Situation, Task, Action, Result) framing and measurable impact.\n" +
  "- Prefer keywords and tools from the posting; drop filler or unrelated content."

const parseJsonFromText = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

const getOpenAiProofread = async ({
  openaiClient,
  resumeDraft,
  systemPrompt,
  outputFormat,
}: {
  openaiClient: OpenAI
  resumeDraft: string
  systemPrompt: string
  outputFormat: OutputFormat
}) => {
  let lastError: unknown

  for (const model of OPENAI_MODEL_CANDIDATES) {
    try {
      const completion = await openaiClient.chat.completions.create({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `${systemPrompt}\nDo not add new facts or claims beyond the draft.`,
          },
          {
            role: "user",
            content: resumeDraft,
          },
        ],
      })

      const content = completion.choices[0]?.message?.content
      const text =
        typeof content === "string"
          ? content.trim()
          : Array.isArray(content)
            ? content
                .map((part) => {
                  if (typeof part === "string") return part
                  if ("text" in part) return (part as { text?: string }).text ?? ""
                  return ""
                })
                .join("")
                .trim()
            : ""

      if (!text) {
        console.error(`OpenAI returned empty content for model ${model}.`)
        continue
      }

      const cleaned = outputFormat === "latex" ? text.trim() : stripMarkdown(text)
      return { proofreadText: cleaned, modelUsed: model }
    } catch (error: any) {
      const errorType = error?.error?.type ?? error?.response?.data?.error?.type
      console.error(`OpenAI model ${model} failed:`, error)

      if (errorType === "invalid_request_error" || errorType === "not_found_error") {
        lastError = error
        continue
      }

      throw error
    }
  }

  throw lastError ?? new Error("All OpenAI model attempts failed.")
}

const getAnthropicDraft = async ({
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
      const draft = await anthropicClient.messages.create({
        model,
        max_tokens: 2000,
        temperature: 0.2,
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

      const text = draft.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("\n")
        .trim()

      if (!text) {
        console.error(`Anthropic returned an empty draft for model ${model}.`)
        continue
      }

      return { draftText: text, modelUsed: model }
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

const getResumeFacts = async ({
  anthropicClient,
  resumeText,
}: {
  anthropicClient: Anthropic
  resumeText: string
}): Promise<ResumeFacts> => {
  const prompt = `Extract ONLY factual information that explicitly exists in the resume text.
Return JSON with keys: summary, experiences (company, title, dates, location, bullets[], tools[], metrics[]), projects (name, role, bullets[], tools[], metrics[]), skills[], education[], authorization.
If a field is missing in the resume, omit it. Do NOT invent or guess.
Resume text:
${resumeText}`

  const response = await anthropicClient.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 1200,
    temperature: 0,
    system:
      "You are a strict fact extractor. You only return structured JSON from the provided resume text. Never add information that is not explicitly present.",
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ],
  })

  const text = response.content.map((block) => (block.type === "text" ? block.text : "")).join("\n")
  const parsed = parseJsonFromText(text) ?? {}
  return parsed as ResumeFacts
}

const getJobDigest = async ({
  anthropicClient,
  jobDescription,
  targetRole,
  seniority,
}: {
  anthropicClient: Anthropic
  jobDescription: string
  targetRole?: string
  seniority?: string
}): Promise<JobDigest> => {
  const prompt = `Summarize the job description into:
- mustHaveSkills: top 10 specific skills/tools/technologies
- keywords: other important phrases or domains (5-10)
- responsibilities: top 3 responsibilities
Include target role/seniority if provided: ${targetRole ?? "n/a"} ${seniority ?? ""}.
Return JSON only. Do not add anything not in the JD.`

  const response = await anthropicClient.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 600,
    temperature: 0,
    system: "You extract concise requirement digests from job descriptions. Stay strictly factual and return JSON only.",
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: `JOB DESCRIPTION:\n${jobDescription}\n\n${prompt}` }],
      },
    ],
  })

  const text = response.content.map((block) => (block.type === "text" ? block.text : "")).join("\n")
  const parsed = parseJsonFromText(text) ?? { mustHaveSkills: [], keywords: [], responsibilities: [] }
  return {
    mustHaveSkills: Array.isArray(parsed.mustHaveSkills) ? parsed.mustHaveSkills.slice(0, 10) : [],
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 10) : [],
    responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities.slice(0, 5) : [],
  }
}

const getAtsScore = async ({
  origin,
  jobDescription,
  resume,
}: {
  origin: string
  jobDescription: string
  resume: string
}): Promise<AtsScoreResult | null> => {
  try {
    const response = await fetch(new URL("/api/ats-score", origin).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription, resume }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      console.error("ATS score call failed:", data)
      return null
    }

    return (await response.json()) as AtsScoreResult
  } catch (error) {
    console.error("ATS score request error:", error)
    return null
  }
}

const applyAtsPatch = async ({
  anthropicClient,
  originalResume,
  resumeFacts,
  jobDigest,
  patchTokens,
  mode,
  metricStrictness,
}: {
  anthropicClient: Anthropic
  originalResume: string
  resumeFacts: ResumeFacts
  jobDigest: JobDigest
  patchTokens: string[]
  mode: ResumeMode
  metricStrictness: MetricStrictness
}) => {
  if (patchTokens.length === 0) return originalResume

  const prompt = [
    "You are improving a resume to address missing ATS keywords.",
    "Rules:",
    "- Only use facts from resumeFacts. Never invent companies, titles, education, dates, locations, or authorization.",
    "- Add missing keywords ONLY if they truthfully apply to existing bullets/skills.",
    "- If a keyword is not supported by resumeFacts, add it to a 'Skills to develop' section instead of Experience.",
    `- Mode: ${mode === "lean_ats" ? "Keep wording concise and strictly ATS-safe." : "Allow brief narrative polish while staying factual."}`,
    `- Metric strictness: ${metricStrictness === "strict" ? "Every bullet must show a metric or scope; if absent, add scope but never invent numbers." : "Prefer metrics but keep flow natural."}`,
    "- Preserve existing section order and bullet structure.",
    "",
    "resumeFacts JSON:",
    JSON.stringify(resumeFacts),
    "",
    "Job digest:",
    JSON.stringify(jobDigest),
    "",
    "Missing tokens to address (highest priority first):",
    patchTokens.join(", "),
    "",
    "Original resume:",
    originalResume,
    "",
    "Produce the improved resume text only (no markdown).",
  ].join("\n")

  const { draftText } = await getAnthropicDraft({
    anthropicClient,
    prompt,
    systemPrompt:
      "You are a precise resume editor. Inject only truthful keywords supported by the provided facts. If evidence is missing, place the item under 'Skills to develop' and do not fabricate.",
  })

  return draftText
}

export async function POST(request: NextRequest) {
  let payload: Partial<AiResumeRequest> = {}

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const jobDescription = sanitizeString(payload.jobDescription)
  const expandedResume = sanitizeString(payload.expandedResume)
  let targetRole = sanitizeOptionalString(payload.targetRole)
  let seniority = sanitizeOptionalString(payload.seniority)
  const outputFormat = sanitizeOutputFormat(payload.outputFormat)
  const formatConfig = formatConfigs[outputFormat]
  const mode = sanitizeMode(payload.mode)
  const metricStrictness = sanitizeMetricStrictness(payload.metricStrictness)
  const bannedTopics = sanitizeOptionalString(payload.bannedTopics)?.slice(0, 1000)
  const proudestWins = sanitizeOptionalString(payload.proudestWins)?.slice(0, 2000)

  if (!jobDescription || !expandedResume) {
    return NextResponse.json({ error: "Job description and expanded resume are both required." }, { status: 400 })
  }

  if (jobDescription.length > JOB_DESCRIPTION_MAX_LENGTH || expandedResume.length > EXPANDED_RESUME_MAX_LENGTH) {
    return NextResponse.json(
      {
        error: `Inputs are too long. Job descriptions are limited to ${JOB_DESCRIPTION_MAX_LENGTH.toLocaleString()} characters and expanded resumes are limited to ${EXPANDED_RESUME_MAX_LENGTH.toLocaleString()} characters.`,
      },
      { status: 400 }
    )
  }

  if (targetRole && targetRole.length > TARGET_ROLE_MAX_LENGTH) {
    targetRole = targetRole.slice(0, TARGET_ROLE_MAX_LENGTH)
  }

  if (seniority && seniority.length > SENIORITY_MAX_LENGTH) {
    seniority = seniority.slice(0, SENIORITY_MAX_LENGTH)
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY
  const openAiApiKey = process.env.OPENAI_API_KEY

  if (!anthropicApiKey || !openAiApiKey) {
    console.error("Missing Anthropic or OpenAI API keys.")
    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey: anthropicApiKey })
  const openai = new OpenAI({ apiKey: openAiApiKey })

  try {
    const resumeFacts = await getResumeFacts({
      anthropicClient: anthropic,
      resumeText: expandedResume,
    })

    const jobDigest = await getJobDigest({
      anthropicClient: anthropic,
      jobDescription,
      targetRole,
      seniority,
    })

    const hallucinationGuard =
      "Use ONLY companies, titles, dates, locations, authorization, education, and skills present in the resumeFacts JSON. " +
      "If a job description skill is missing from the resumeFacts, list it under 'Skills to develop' instead of Experience or Skills. " +
      "Do NOT invent certifications, locations, authorization, or degrees."

    const rules = [
      hallucinationGuard,
      "Allowed sections: Summary, Skills, Experience, Projects (optional), Education, Skills to develop (optional).",
      "Max 4 bullets per role/project. Each bullet must include action + tool/skill + outcome/scope.",
      mode === "lean_ats"
        ? "Mode: Lean ATS — keep language concise and ATS-safe; prefer keyword density over prose."
        : "Mode: Story — allow brief narrative polish while keeping ATS-safe structure.",
      metricStrictness === "strict"
        ? "Metric strictness: Every bullet should include a metric or clear scope; if none exists, state scope without inventing numbers."
        : "Metric strictness: Prefer metrics but keep natural phrasing.",
      bannedTopics ? `Never mention these banned topics/skills: ${bannedTopics}` : "",
      proudestWins ? `Prioritize these user-highlighted wins when relevant: ${proudestWins}` : "",
      jobDigest.mustHaveSkills.length > 0
        ? `Must-address tokens from JD: ${jobDigest.mustHaveSkills.join(", ")}`
        : "",
      jobDigest.keywords.length > 0 ? `Additional JD keywords: ${jobDigest.keywords.join(", ")}` : "",
      jobDigest.responsibilities.length > 0
        ? `Responsibilities to reflect: ${jobDigest.responsibilities.join("; ")}`
        : "",
      formatConfig.userFormatHint ? `Formatting guidance: ${formatConfig.userFormatHint}` : "",
      "Keep total content to roughly two pages at 11pt font.",
    ]
      .filter(Boolean)
      .join("\n- ")

    const anthropicPrompt = [
      "Follow these instructions for a focused, ATS-friendly resume:",
      sharedTargetingReminder,
      "",
      "Rules:",
      `- ${rules}`,
      "",
      "resumeFacts JSON (source of truth):",
      JSON.stringify(resumeFacts),
      "",
      "Job Description:",
      jobDescription,
      "",
      "Expanded Resume (raw text for reference):",
      expandedResume,
      targetRole ? `\nTarget Role: ${targetRole}` : "",
      seniority ? `\nSeniority: ${seniority}` : "",
    ]
      .filter(Boolean)
      .join("\n")
      .trim()

    const { draftText: anthropicDraftResume } = await getAnthropicDraft({
      anthropicClient: anthropic,
      prompt: anthropicPrompt,
      systemPrompt: formatConfig.draftingSystemPrompt,
    })

    const { proofreadText: initialResumeText } = await getOpenAiProofread({
      openaiClient: openai,
      resumeDraft: anthropicDraftResume,
      systemPrompt: `${formatConfig.proofreadSystemPrompt}\n${hallucinationGuard}`,
      outputFormat,
    })

    let finalResumeText = initialResumeText
    let atsScore: AtsScoreResult | null = null
    let appliedAtsPatch = false
    const origin = request.nextUrl.origin

    atsScore = await getAtsScore({ origin, jobDescription, resume: finalResumeText })

    const pickTopTokens = (values: string[], limit: number) =>
      Array.from(new Set(values.filter(Boolean))).slice(0, limit)

    if (atsScore && atsScore.overallScore < ATS_TARGET_SCORE) {
      const patchTokens = pickTopTokens(
        [...(atsScore.missingSkills || []), ...(atsScore.missingKeywords || [])],
        12
      )

      const patched = await applyAtsPatch({
        anthropicClient: anthropic,
        originalResume: finalResumeText,
        resumeFacts,
        jobDigest,
        patchTokens,
        mode,
        metricStrictness,
      })

      if (patched) {
        const { proofreadText: patchedProofread } = await getOpenAiProofread({
          openaiClient: openai,
          resumeDraft: patched,
          systemPrompt: `${formatConfig.proofreadSystemPrompt}\n${hallucinationGuard}`,
          outputFormat,
        })

        finalResumeText = patchedProofread
        appliedAtsPatch = true
        atsScore = await getAtsScore({ origin, jobDescription, resume: finalResumeText }) ?? atsScore
      }
    }

    let downloadBase64: string
    let docxBase64: string | undefined

    if (outputFormat === "docx") {
      const docBuffer = await createResumeDocx(finalResumeText)
      downloadBase64 = docBuffer.toString("base64")
      docxBase64 = downloadBase64
    } else {
      downloadBase64 = Buffer.from(finalResumeText, "utf-8").toString("base64")
    }

    return NextResponse.json({
      previewText: finalResumeText,
      outputFormat,
      downloadBase64,
      downloadFileName: formatConfig.downloadFileName,
      downloadMimeType: formatConfig.mimeType,
      ...(docxBase64 ? { docxBase64 } : {}),
      ...(atsScore ? { atsScore, atsTarget: ATS_TARGET_SCORE } : {}),
      resumeFacts,
      jobDigest,
      mode,
      metricStrictness,
      appliedAtsPatch,
    })
  } catch (error) {
    console.error("AI resume generation error:", error)
    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }
}
