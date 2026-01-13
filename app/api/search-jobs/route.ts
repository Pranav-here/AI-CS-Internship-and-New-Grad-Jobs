import { type NextRequest, NextResponse } from "next/server"

interface SearchFilters {
  keyword: string
  location: string
  jobTypes: string[]
  locationMode: string
  maxResults: number
  sortBy: string
}

type RemoteStatus = "remote" | "onsite" | "hybrid"

interface Job {
  Id?: string
  "Job Title": string
  Company: string
  Location: string
  Description: string
  "Apply Link": string
  "Job Type": string
  "Posting Date": string
  QueryFlag: string
  Tags: string
  "Remote Job": RemoteStatus
}

const RESULTS_PER_PAGE = 10
const MAX_PAGES = 3
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_MAX_RESULTS = 120
const REQUEST_TIMEOUT_MS = 12_000

type CacheEntry = { timestamp: number; jobs: Job[] }
const searchCache = new Map<string, CacheEntry>()

type JobFetchError = Error & { status?: number }

export async function POST(request: NextRequest) {
  try {
    const filters: SearchFilters = await request.json()

    // Validate required fields
    if (!filters.keyword?.trim()) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 })
    }

    if (!filters.jobTypes || filters.jobTypes.length === 0) {
      return NextResponse.json({ error: "At least one job type must be selected" }, { status: 400 })
    }

    const apiKey = process.env.RAPIDAPI_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    const cacheKey = buildCacheKey(filters)
    const cached = searchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ jobs: cached.jobs.slice(0, filters.maxResults) })
    }

    const requestedPages = Math.max(1, Math.ceil(filters.maxResults / RESULTS_PER_PAGE))
    const numPages = Math.min(requestedPages, MAX_PAGES)

    const jobTypePromises = filters.jobTypes.map((jobType) =>
      fetchJobsForType({
        jobType,
        filters,
        apiKey,
        numPages,
      })
    )

    const allJobs: Job[] = []
    const failures: { status?: number; jobType: string; message: string }[] = []
    const settled = await Promise.allSettled(jobTypePromises)
    settled.forEach((result, index) => {
      const jobType = filters.jobTypes[index] || "Unknown"
      if (result.status === "fulfilled") {
        allJobs.push(...result.value)
      } else {
        const status = (result.reason as JobFetchError)?.status
        const message = (result.reason as Error)?.message || "Unknown error"
        failures.push({ status, jobType, message })
        console.error(`JSearch request failed for ${jobType}:`, message)
      }
    })

    // If every upstream call failed, surface a friendly error instead of empty results
    if (failures.length === filters.jobTypes.length && allJobs.length === 0) {
      const hasRateLimit = failures.some((failure) => failure.status === 429)
      const status = hasRateLimit ? 429 : 502
      const errorMessage = hasRateLimit
        ? "Thanks for the overwhelming response - we hit our daily job search limit. Please check back soon."
        : "Job search is temporarily unavailable. Please try again in a few minutes."
      return NextResponse.json({ error: errorMessage }, { status })
    }

    // Apply location filtering
    let filteredJobs = allJobs
    if (filters.locationMode === "Remote Only") {
      filteredJobs = allJobs.filter((job) => isRemoteJob(job))
    } else if (filters.locationMode === "On-site Only") {
      filteredJobs = allJobs.filter((job) => !isRemoteJob(job))
    }

    // Apply sorting
    if (filters.sortBy === "Date Posted") {
      filteredJobs.sort((a, b) => {
        const dateA = new Date(a["Posting Date"] || "1970-01-01")
        const dateB = new Date(b["Posting Date"] || "1970-01-01")
        return dateB.getTime() - dateA.getTime()
      })
    } else if (filters.sortBy === "Company") {
      filteredJobs.sort((a, b) => a.Company.localeCompare(b.Company))
    }

    // Add job tags and dedupe
    const taggedJobs = addJobTags(filteredJobs)
    const deduped = dedupeJobs(taggedJobs)

    // Limit results
    const limitedJobs = deduped.slice(0, filters.maxResults)

    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      jobs: deduped.slice(0, CACHE_MAX_RESULTS),
    })

    return NextResponse.json({ jobs: limitedJobs })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function fetchJobsForType({
  jobType,
  filters,
  apiKey,
  numPages,
}: {
  jobType: string
  filters: SearchFilters
  apiKey: string
  numPages: number
}): Promise<Job[]> {
  const termMap: Record<string, string> = {
    "Winter 2025 Internship": "winter 2025 internship",
    "Spring 2026 Internship": "spring 2026 internship",
    "Summer 2026 Internship": "summer 2026 internship",
    "Entry-Level / New-Grad Full-Time": "entry level new grad",
  }

  const searchTerms = termMap[jobType] || ""

  let query = `${filters.keyword.trim()} ${searchTerms}`.trim()
  if (filters.location?.trim()) {
    query += ` ${filters.location.trim()}`
  }
  if (filters.locationMode === "Remote Only") {
    query += " remote"
  }

  const searchParams = new URLSearchParams({
    query,
    page: "1",
    num_pages: String(numPages),
    date_posted: "all",
  })

  const apiUrl = `https://jsearch.p.rapidapi.com/search?${searchParams.toString()}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout))

  if (!response.ok) {
    const error = new Error(`JSearch API error for ${jobType}: ${response.status}`) as JobFetchError
    error.status = response.status
    throw error
  }

  const data = await response.json()
  if (data.status !== "OK" || !Array.isArray(data.data)) {
    return []
  }

  return data.data
    .map((job: any) => extractJobData(job, jobType))
    .filter((job: Job | null): job is Job => job !== null)
}

function extractJobData(jobJson: any, queryFlag: string): Job | null {
  try {
    const remoteStatus = getRemoteStatus(jobJson)
    const jobId = jobJson.job_id || jobJson.job_posting_id || jobJson.id || jobJson._id

    return {
      Id: jobId,
      "Job Title": jobJson.job_title?.trim() || "",
      Company: jobJson.employer_name?.trim() || "",
      Location: formatLocation(jobJson),
      Description: formatDescription(jobJson.job_description || ""),
      "Apply Link": jobJson.job_apply_link || "",
      "Job Type": formatJobType(jobJson),
      "Posting Date": formatPostingDate(jobJson),
      QueryFlag: queryFlag,
      Tags: "General Tech",
      "Remote Job": remoteStatus,
    }
  } catch (error) {
    return null
  }
}

function formatLocation(jobJson: any): string {
  const parts = []
  if (jobJson.job_city) parts.push(jobJson.job_city)
  if (jobJson.job_state) parts.push(jobJson.job_state)
  if (jobJson.job_country) parts.push(jobJson.job_country)
  if (jobJson.job_is_remote) parts.push("Remote")
  return parts.join(", ") || "Not specified"
}

function formatDescription(description: string): string {
  if (!description) return "No description available"

  // Clean HTML tags and extra whitespace
  const clean = description
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return clean.length > 300 ? clean.substring(0, 300) + "..." : clean
}

function formatJobType(jobJson: any): string {
  const parts = []
  if (jobJson.job_employment_type) parts.push(jobJson.job_employment_type)
  if (jobJson.job_is_remote) parts.push("Remote")
  return parts.join(", ") || "Not specified"
}

function formatPostingDate(jobJson: any): string {
  const dateFields = ["job_posted_at_datetime_utc", "job_posted_at_timestamp", "job_posted_at"]

  for (const field of dateFields) {
    if (jobJson[field]) {
      try {
        const date = new Date(jobJson[field])
        return date.toISOString().split("T")[0]
      } catch {
        continue
      }
    }
  }

  return "Not available"
}

function isRemoteJob(job: Job): boolean {
  const remoteKeywords = ["remote", "work from home", "wfh", "telecommute", "virtual", "hybrid"]
  const text = `${job["Job Title"]} ${job.Location} ${job["Job Type"]}`.toLowerCase()
  return job["Remote Job"] === "remote" || job["Remote Job"] === "hybrid" || remoteKeywords.some((keyword) => text.includes(keyword))
}

function getRemoteStatus(jobJson: any): RemoteStatus {
  if (jobJson.job_is_remote) return "remote"

  const location = `${jobJson.job_location || ""} ${jobJson.job_country || ""} ${jobJson.job_city || ""}`.toLowerCase()
  if (location.includes("hybrid")) return "hybrid"
  if (location.includes("remote")) return "remote"

  return "onsite"
}

function dedupeJobs(jobs: Job[]): Job[] {
  const seen = new Set<string>()
  const deduped: Job[] = []

  for (const job of jobs) {
    const key = `${job.Id || ""}::${job["Apply Link"] || ""}::${job["Job Title"]}::${job.Company}`.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(job)
  }

  return deduped
}

function addJobTags(jobs: Job[]): Job[] {
  const themeCategories: Record<string, string[]> = {
    "Computer Vision": [
      "computer vision",
      "cv",
      "image processing",
      "opencv",
      "image recognition",
      "object detection",
      "facial recognition",
      "medical imaging",
      "autonomous",
      "lidar",
      "camera",
      "visual",
      "perception",
    ],
    "Natural Language Processing": [
      "nlp",
      "natural language",
      "language model",
      "text processing",
      "chatbot",
      "sentiment analysis",
      "speech recognition",
      "translation",
      "linguistics",
      "transformer",
      "bert",
      "gpt",
      "llm",
    ],
    "Generative AI": [
      "generative ai",
      "genai",
      "gpt",
      "llm",
      "large language model",
      "diffusion",
      "stable diffusion",
      "dall-e",
      "midjourney",
      "text generation",
      "ai art",
      "prompt engineering",
      "fine-tuning",
      "rag",
      "retrieval augmented",
    ],
    "Machine Learning": [
      "machine learning",
      "ml",
      "deep learning",
      "neural network",
      "tensorflow",
      "pytorch",
      "scikit-learn",
      "keras",
      "model training",
      "feature engineering",
      "regression",
      "classification",
      "clustering",
      "supervised",
      "unsupervised",
    ],
    "Data Science": [
      "data science",
      "data scientist",
      "data analysis",
      "statistics",
      "pandas",
      "numpy",
      "jupyter",
      "visualization",
      "tableau",
      "power bi",
      "sql",
      "database",
      "etl",
      "data pipeline",
      "analytics",
    ],
    "Software Engineering": [
      "software engineer",
      "software developer",
      "backend",
      "frontend",
      "full stack",
      "microservices",
      "api design",
      "rest",
      "graphql",
      "design patterns",
      "oop",
      "typescript",
      "react",
      "java",
      "c++",
      "go",
    ],
  }

  return jobs.map((job) => {
    const text = `${job["Job Title"]} ${job.Description} ${job.Company}`.toLowerCase()
    const matchingTags: string[] = []

    for (const [category, keywords] of Object.entries(themeCategories)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          if (!matchingTags.includes(category)) {
            matchingTags.push(category)
          }
          break
        }
      }
    }

    return {
      ...job,
      Tags: matchingTags.slice(0, 3).join(", ") || "General Tech",
    }
  })
}

function buildCacheKey(filters: SearchFilters) {
  return JSON.stringify({
    keyword: filters.keyword.trim().toLowerCase(),
    location: filters.location.trim().toLowerCase(),
    jobTypes: [...filters.jobTypes].sort(),
    locationMode: filters.locationMode,
    maxResults: Math.min(filters.maxResults, CACHE_MAX_RESULTS),
    sortBy: filters.sortBy,
  })
}
