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
const friendlyError = "Something went wrong while analyzing your resume. Please try again."

type ATSScoreRequest = {
  jobDescription: string
  resume: string
}

type ATSScoreResponse = {
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
  let payload: Partial<ATSScoreRequest> = {}

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const jobDescription = sanitizeString(payload.jobDescription)
  const resume = sanitizeString(payload.resume)

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

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY

  if (!anthropicApiKey) {
    console.error("Missing Anthropic API key.")
    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey: anthropicApiKey })

  try {
    const systemPrompt = `You are an ATS (Applicant Tracking System) expert specializing in Computer Science and technical roles. Your scoring model is based on real ATS systems like RChilli (used by Workday, Oracle, SAP) and recruiter data from Jobscan studies.

Analyze the resume using this research-backed scoring model (100 points total):

1. **Technical Skills & Tools** (35 points max):
   - Extract all programming languages (Python, Java, C++, JavaScript, SQL, etc.)
   - Frameworks/libraries (PyTorch, TensorFlow, React, Spring, Django, etc.)
   - Domain tools (Docker, Kubernetes, AWS, GCP, Azure, Git, etc.)
   - Check for exact matches in BOTH dedicated skills section AND usage in bullet points
   - Variants and synonyms count but may be weighted slightly less
   - This is the HIGHEST weighted factor based on recruiter filter data (76.4% of recruiters filter by skills)

2. **Job Title & Role Keywords** (15 points max):
   - Match target job title from JD with resume (e.g., "Software Engineer Intern", "ML Engineer", "Data Scientist")
   - Check resume header/headline, summary, and recent role/project titles
   - Exact matches score higher; close variants (e.g., "ML Engineer Intern" vs "Machine Learning Engineer") still score well
   - Based on RChilli giving 35% weight to JobProfile; normalized here for CS roles

3. **Experience & Project Relevance** (15 points max):
   - Bullet points that combine JD keywords with action verbs and quantifiable outcomes
   - Examples: "Designed a RAG pipeline in Python using LangChain", "Optimized training job latency on AWS by 30%"
   - Relevant internships, research, and serious projects
   - Contextual similarity matters (semantic matching, not just keyword presence)

4. **Education & Coursework** (10 points max):
   - Degree and major matching JD requirements (e.g., "B.S. in Computer Science", "B.S. in AI", "M.S. in CS")
   - Relevant CS courses for early-career roles: Data Structures, Algorithms, Operating Systems, Machine Learning, Databases
   - More important for new grads/interns than for senior roles
   - 59.7% of recruiters filter by education

5. **Domain/Industry Keywords** (5 points max):
   - Industry-specific terminology (Fintech, Healthcare, Sports Analytics, Cloud Security, etc.)
   - Domain-specific tools or methodologies mentioned in JD

6. **Location & Authorization** (10 points max):
   - City/state/country match with JD requirements
   - Clear statements about work authorization (OPT, CPT, sponsorship needs)
   - Willingness to relocate if mentioned
   - Often treated as knockout criteria in real ATS, so this can be pass/fail

7. **ATS-Readable Formatting** (10 points max):
   - Standard section headings: "Experience", "Education", "Projects", "Skills" (not "Where I've Worked" or icons)
   - No text in images, complex tables, or multi-column layouts
   - Simple fonts, linear layout, no headers/footers with critical info
   - This is essentially pass/fail; if parser can't read it, score is near zero regardless of content

Return your analysis in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "technicalSkillsScore": <number 0-35>,
  "jobTitleScore": <number 0-15>,
  "experienceRelevanceScore": <number 0-15>,
  "educationScore": <number 0-10>,
  "industryKeywordsScore": <number 0-5>,
  "locationScore": <number 0-10>,
  "formattingScore": <number 0-10>,
  "matchedSkills": ["Python", "TensorFlow", "AWS", ...],
  "missingSkills": ["Docker", "Kubernetes", ...],
  "matchedKeywords": ["other important keywords from JD", ...],
  "missingKeywords": ["other missing keywords", ...],
  "suggestions": ["specific, actionable suggestion 1", "suggestion 2", ...],
  "formattingIssues": ["issue1", "issue2", ...]
}

Guidelines:
- Be specific and actionable in suggestions
- Prioritize technical skills and tools - this is what recruiters filter by first
- Match exact JD phrasing where possible (if JD says "FastAPI", look for "FastAPI" not just "Python web framework")
- For missing skills, only list the most critical ones (top 10-15)
- Consider semantic similarity for experience bullets, not just exact keyword matching`

    const anthropicPrompt = [
      "Analyze this resume against the job description and provide a detailed ATS compatibility score.",
      "",
      "=== JOB DESCRIPTION ===",
      jobDescription,
      "",
      "=== RESUME ===",
      resume,
      "",
      "Provide your analysis in the exact JSON format specified in the system prompt.",
    ].join("\n")

    const { analysisText } = await getAnthropicAnalysis({
      anthropicClient: anthropic,
      prompt: anthropicPrompt,
      systemPrompt,
    })

    // Parse the JSON response
    let parsedAnalysis: any
    try {
      // Try to extract JSON from the response (in case Claude wraps it in markdown)
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

    // Calculate overall score (sum of all components, max 100)
    const technicalSkillsScore = parsedAnalysis.technicalSkillsScore || 0
    const jobTitleScore = parsedAnalysis.jobTitleScore || 0
    const experienceRelevanceScore = parsedAnalysis.experienceRelevanceScore || 0
    const educationScore = parsedAnalysis.educationScore || 0
    const industryKeywordsScore = parsedAnalysis.industryKeywordsScore || 0
    const locationScore = parsedAnalysis.locationScore || 0
    const formattingScore = parsedAnalysis.formattingScore || 0

    const overallScore = Math.round(
      technicalSkillsScore +
        jobTitleScore +
        experienceRelevanceScore +
        educationScore +
        industryKeywordsScore +
        locationScore +
        formattingScore
    )

    const response: ATSScoreResponse = {
      overallScore,
      technicalSkillsScore,
      jobTitleScore,
      experienceRelevanceScore,
      educationScore,
      industryKeywordsScore,
      locationScore,
      formattingScore,
      matchedSkills: parsedAnalysis.matchedSkills || [],
      missingSkills: parsedAnalysis.missingSkills || [],
      matchedKeywords: parsedAnalysis.matchedKeywords || [],
      missingKeywords: parsedAnalysis.missingKeywords || [],
      suggestions: parsedAnalysis.suggestions || [],
      formattingIssues: parsedAnalysis.formattingIssues || [],
      breakdown: {
        technicalSkills: technicalSkillsScore,
        jobTitle: jobTitleScore,
        experience: experienceRelevanceScore,
        education: educationScore,
        industry: industryKeywordsScore,
        location: locationScore,
        formatting: formattingScore,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("ATS score analysis error:", error)
    return NextResponse.json({ error: friendlyError }, { status: 500 })
  }
}
