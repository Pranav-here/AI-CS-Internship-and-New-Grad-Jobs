import { type NextRequest, NextResponse } from "next/server"

interface SearchFilters {
  keyword: string
  location: string
  jobTypes: string[]
  locationMode: string
  maxResults: number
  sortBy: string
}

interface Job {
  "Job Title": string
  Company: string
  Location: string
  Description: string
  "Apply Link": string
  "Job Type": string
  "Posting Date": string
  QueryFlag: string
  Tags: string
  "Remote Job": string
}

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

    // Get API key from environment
    const apiKey = process.env.RAPIDAPI_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    const allJobs: Job[] = []

    // Term mapping for different job types
    const termMap: Record<string, string> = {
      "Fall 2025 Internship": "fall 2025 internship",
      "Spring 2026 Internship": "spring 2026 internship",
      "Summer 2026 Internship": "summer 2026 internship",
      "Entry-Level / New-Grad Full-Time": "entry level new grad",
    }

    // Search for each selected job type
    for (const jobType of filters.jobTypes) {
      const searchTerms = termMap[jobType] || ""

      // Build query
      let query = `${filters.keyword.trim()} ${searchTerms}`
      if (filters.location?.trim()) {
        query += ` ${filters.location.trim()}`
      }
      if (filters.locationMode === "Remote Only") {
        query += " remote"
      }

      // Make API request to JSearch
      const searchParams = new URLSearchParams({
        query,
        page: "1",
        num_pages: "1",
        date_posted: "all",
      })

      const apiUrl = `https://jsearch.p.rapidapi.com/search?${searchParams.toString()}`

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
        // ⚠️ no `params` here
      })

      if (!response.ok) {
        console.error(`JSearch API error: ${response.status}`)
        continue
      }

      const data = await response.json()

      if (data.status === "OK" && data.data) {
        const jobs = data.data.map((job: any) => extractJobData(job, jobType)).filter((job: Job | null) => job !== null)

        allJobs.push(...jobs)
      }
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

    // Add job tags
    const taggedJobs = addJobTags(filteredJobs)

    // Limit results
    const limitedJobs = taggedJobs.slice(0, filters.maxResults)

    return NextResponse.json({ jobs: limitedJobs })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function extractJobData(jobJson: any, queryFlag: string): Job | null {
  try {
    return {
      "Job Title": jobJson.job_title?.trim() || "",
      Company: jobJson.employer_name?.trim() || "",
      Location: formatLocation(jobJson),
      Description: formatDescription(jobJson.job_description || ""),
      "Apply Link": jobJson.job_apply_link || "",
      "Job Type": formatJobType(jobJson),
      "Posting Date": formatPostingDate(jobJson),
      QueryFlag: queryFlag,
      Tags: "General Tech",
      "Remote Job": jobJson.job_is_remote ? "🏠 Remote" : "🏢 On-site",
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
  const remoteKeywords = ["remote", "work from home", "wfh", "telecommute", "virtual"]
  const text = `${job["Job Title"]} ${job.Location} ${job["Job Type"]}`.toLowerCase()
  return remoteKeywords.some((keyword) => text.includes(keyword)) || job["Remote Job"] === "🏠 Remote"
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
