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

type OutputFormat = "docx" | "text" | "latex"
const OUTPUT_FORMATS: OutputFormat[] = ["docx", "text", "latex"]
const DEFAULT_OUTPUT_FORMAT: OutputFormat = "docx"

type AiResumeRequest = {
  jobDescription: string
  expandedResume: string
  targetRole?: string
  seniority?: string
  outputFormat?: OutputFormat
}

type FormatConfig = {
  draftingSystemPrompt: string
  proofreadSystemPrompt: string
  extension: string
  mimeType: string
  downloadFileName: string
  userFormatHint?: string
}

const formatConfigs: Record<OutputFormat, FormatConfig> = {
  docx: {
    draftingSystemPrompt:
      "You are an expert resume writer for tech roles. Draft a concise, ATS-aligned resume that fits in roughly two pages (Word format, 11pt font, normal margins). Prioritize only the experience, skills, and projects that match the job description and target role. Use STAR (Situation, Task, Action, Result) framing with measurable impact for Experience and Projects bullets. Include Summary, Skills, Experience, Projects (if relevant), and Education sections. Limit bullet points per role to six, keep each bullet crisp and action-oriented, avoid contact details, and return structured plain text with section headers and '-' bullet markers (no Markdown).",
    proofreadSystemPrompt:
      "You are a professional resume editor optimizing for ATS. Lightly proofread for grammar, clarity, and consistency while preserving section order, STAR bullet structure, and keywords tied to the job description. Keep it within roughly two pages and return plain text only (no markdown).",
    extension: "docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    downloadFileName: "AI_Tailored_Resume.docx",
    userFormatHint: "Return plain text with clear section headers and bullet lines beginning with '- '.",
  },
  text: {
    draftingSystemPrompt:
      "You are an expert resume writer for tech roles. Create an ATS-friendly plain-text resume that fits in roughly two pages at 11pt font. Focus on only the most relevant achievements for the job description and target role. Use STAR (Situation, Task, Action, Result) phrasing with measurable impact for Experience and Projects bullets. Include Summary, Skills, Experience, Projects (if relevant), and Education. Avoid decorative formatting, contact details, and filler; return simple section headers with '-' bullet markers (no Markdown).",
    proofreadSystemPrompt:
      "You are a professional editor. Polish this ATS-focused plain-text resume without altering sections, STAR bullet structure, or key keywords. Keep it concise (~2 pages) and return plain text only (no markdown).",
    extension: "txt",
    mimeType: "text/plain",
    downloadFileName: "AI_Tailored_Resume.txt",
    userFormatHint: "Produce ATS-safe plain text with section headings and '-' bullets only; no Markdown or extra symbols.",
  },
  latex: {
    draftingSystemPrompt:
      "You are an expert resume writer and LaTeX author for tech roles. Produce a concise, ATS-aware resume as fully compilable LaTeX source (~2 pages at 11pt with normal margins). Prioritize only experience, skills, and projects that match the job description and target role. Use STAR (Situation, Task, Action, Result) phrasing with measurable impact for Experience and Projects bullets. Include Summary, Skills, Experience, Projects (if relevant), and Education. Use a minimal preamble (e.g., \\documentclass{article}, \\usepackage[margin=1in]{geometry}, \\usepackage{enumitem}) and itemize for bullets. Use 'Your Name' as the placeholder header, exclude contact details, and return ONLY LaTeX code (no Markdown or commentary).",
    proofreadSystemPrompt:
      "You are a professional editor working on LaTeX resume source. Improve grammar and clarity while preserving LaTeX commands, STAR bullet structure, and section order. Keep it concise (~2 pages) and return only valid LaTeX source.",
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

const sharedTargetingReminder =
  "- Only keep achievements and skills that directly match the job description and target role to beat ATS filters.\n" +
  "- Write Experience and Projects bullets with STAR (Situation, Task, Action, Result) framing and measurable impact.\n" +
  "- Prefer keywords and tools from the posting; drop filler or unrelated content."

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
            content: systemPrompt,
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
    const anthropicPrompt = [
      "Follow these instructions for a focused, ATS-friendly resume:",
      sharedTargetingReminder,
      "",
      "Job Description:",
      jobDescription,
      "",
      "Expanded Resume:",
      expandedResume,
      targetRole ? `\nTarget Role: ${targetRole}` : "",
      seniority ? `\nSeniority: ${seniority}` : "",
      formatConfig.userFormatHint ? `\nFormatting guidance: ${formatConfig.userFormatHint}` : "",
      "\nKeep total content to roughly two pages at 11pt font.",
    ]
      .filter(Boolean)
      .join("\n")
      .trim()

    const { draftText: anthropicDraftResume } = await getAnthropicDraft({
      anthropicClient: anthropic,
      prompt: anthropicPrompt,
      systemPrompt: formatConfig.draftingSystemPrompt,
    })

    const { proofreadText: finalResumeText } = await getOpenAiProofread({
      openaiClient: openai,
      resumeDraft: anthropicDraftResume,
      systemPrompt: formatConfig.proofreadSystemPrompt,
      outputFormat,
    })

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
    })
  } catch (error) {
    console.error("AI resume generation error:", error)
    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }
}

