import { type NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"

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
const REQUEST_TIMEOUT_MS = 12_000

const CACHE_TTL_MS_DEFAULT = 12 * 60 * 60 * 1000
const CACHE_MAX_ITEMS_DEFAULT = 500
const RATE_LIMIT_CACHE_TTL_MS_DEFAULT = 60 * 1000 // short TTL for 429s
const MAX_CACHE_PAYLOAD_BYTES = 750_000 // skip caching overly large responses

type RateLimitMeta = {
  retryAfterSeconds?: number
  resetHint?: string
  code?: string
  rawMessage?: string
}

type CachedResult = {
  status: number
  payload: any
  jobs: Job[]
  timestamp: number
  ttlMs: number
  rateLimit?: RateLimitMeta
}

const CACHE_TTL_MS = getCacheTtl()
const CACHE_MAX_ITEMS = getCacheMaxItems()
const RATE_LIMIT_CACHE_TTL_MS = getRateLimitCacheTtl()

type CacheStore = {
  get: (key: string) => CachedResult | undefined
  set: (key: string, value: CachedResult) => void
  delete: (key: string) => void
  size: () => number
  keys: () => IterableIterator<string>
}

const memoryCache = new Map<string, CachedResult>()
const cacheStore: CacheStore = {
  get: (key) => memoryCache.get(key),
  set: (key, value) => memoryCache.set(key, value),
  delete: (key) => memoryCache.delete(key),
  size: () => memoryCache.size,
  keys: () => memoryCache.keys(),
}

const inflightRequests = new Map<string, Promise<CachedResult>>()
const ipBuckets = new Map<
  string,
  {
    tokens: number
    lastRefill: number
  }
>()

type JobFetchError = Error & {
  status?: number
  code?: string
  payload?: any
  rateLimit?: RateLimitMeta
  cacheKey?: string
}

function getCacheTtl() {
  const envValue = Number.parseInt(process.env.CACHE_TTL_SECONDS ?? "", 10)
  if (Number.isFinite(envValue) && envValue > 0) {
    return envValue * 1000
  }
  return CACHE_TTL_MS_DEFAULT
}

function getCacheMaxItems() {
  const envValue = Number.parseInt(process.env.CACHE_MAX_ITEMS ?? "", 10)
  if (Number.isFinite(envValue) && envValue > 0) {
    return envValue
  }
  return CACHE_MAX_ITEMS_DEFAULT
}

function getRateLimitCacheTtl() {
  const envValue = Number.parseInt(process.env.RATE_LIMIT_CACHE_TTL_SECONDS ?? "", 10)
  if (Number.isFinite(envValue) && envValue > 0) {
    return envValue * 1000
  }
  return RATE_LIMIT_CACHE_TTL_MS_DEFAULT
}

function buildRequestCacheKey({
  jobType,
  query,
  filters,
  page,
  numPages,
}: {
  jobType: string
  query: string
  filters: SearchFilters
  page: number
  numPages: number
}) {
  const normalizedQuery = normalizeString(query)
  const normalizedLocation = normalizeString(filters.location)
  return JSON.stringify({
    endpoint: "search-jobs",
    jobType: normalizeString(jobType),
    query: normalizedQuery,
    location: normalizedLocation,
    locationMode: filters.locationMode,
    sortBy: normalizeString(filters.sortBy),
    maxResults: Math.min(filters.maxResults, 100),
    page,
    numPages,
  })
}

function getCacheEntry(key: string): CachedResult | null {
  const entry = cacheStore.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > entry.ttlMs) {
    cacheStore.delete(key)
    return null
  }
  return entry
}

function setCacheEntry(key: string, value: Omit<CachedResult, "timestamp" | "ttlMs">, ttlMs: number) {
  if (ttlMs <= 0) return
  const payloadSize = JSON.stringify(value.payload ?? {}).length
  if (payloadSize > MAX_CACHE_PAYLOAD_BYTES) return
  cacheStore.set(key, { ...value, timestamp: Date.now(), ttlMs })

  // enforce size cap (simple FIFO eviction)
  while (cacheStore.size() > CACHE_MAX_ITEMS) {
    const oldestKey = cacheStore.keys().next().value
    cacheStore.delete(oldestKey)
  }
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined
  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    return Math.max(0, Math.ceil(numeric))
  }
  const parsedDate = Date.parse(value)
  if (!Number.isNaN(parsedDate)) {
    return Math.max(0, Math.ceil((parsedDate - Date.now()) / 1000))
  }
  return undefined
}

function parseRateLimit(response: Response, body: any, status: number): RateLimitMeta | undefined {
  const message = typeof body?.message === "string" ? body.message : typeof body?.error === "string" ? body.error : undefined
  const retryAfterSeconds = parseRetryAfter(response.headers.get("retry-after"))
  const resetHeader = response.headers.get("x-ratelimit-reset") || response.headers.get("x-ratelimit-reset-requests")
  const resetSeconds = parseRetryAfter(resetHeader)
  const lowerMessage = message?.toLowerCase() ?? ""
  const isMonthlyLimit =
    lowerMessage.includes("monthly quota exceeded") || (lowerMessage.includes("monthly") && lowerMessage.includes("quota"))

  const meta: RateLimitMeta = {
    retryAfterSeconds: retryAfterSeconds ?? resetSeconds,
    resetHint: resetSeconds ? `Try again in ${resetSeconds} seconds.` : isMonthlyLimit ? "Monthly quota exceeded." : undefined,
    code: isMonthlyLimit ? "MONTHLY_QUOTA_EXCEEDED" : status === 429 ? "RATE_LIMITED" : undefined,
    rawMessage: message,
  }

  if (!meta.retryAfterSeconds && isMonthlyLimit) {
    // provide a softer hint when we know it's a monthly cap
    meta.retryAfterSeconds = undefined
  }

  if (!meta.resetHint && isMonthlyLimit) {
    meta.resetHint = "Monthly quota exceeded. Please try again after the billing window resets."
  }

  return meta
}

function createApiError(params: { status: number; message: string; cacheKey: string; rateLimit?: RateLimitMeta; payload?: any }): JobFetchError {
  const error = new Error(params.message) as JobFetchError
  error.status = params.status
  error.code = params.rateLimit?.code
  error.rateLimit = params.rateLimit
  error.payload = params.payload
  error.cacheKey = params.cacheKey
  return error
}

function createApiErrorFromCache(cacheKey: string, cached: CachedResult): JobFetchError {
  return createApiError({
    status: cached.status,
    message: cached.payload?.message || cached.payload?.error || `Upstream search error (${cached.status})`,
    cacheKey,
    rateLimit: cached.rateLimit,
    payload: cached.payload,
  })
}

function hashKey(input: string) {
  return createHash("sha256").update(input).digest("hex").slice(0, 12)
}

type FetchMeta = {
  cacheStatus: "HIT" | "MISS"
  inflightStatus: "HIT" | "MISS"
  upstreamStatus: number
  cacheKeyHash: string
  jobType: string
  page: number
  durationMs: number
}

function logVerification(meta: FetchMeta) {
  console.info(
    `[search-jobs] cache=${meta.cacheStatus} inflight=${meta.inflightStatus} upstream=${meta.upstreamStatus} key=${meta.cacheKeyHash} jobType=${meta.jobType} page=${meta.page} duration=${meta.durationMs}ms`
  )
}

function normalizeString(value: string | undefined | null) {
  if (!value) return ""
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function isServerlessEnv() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NEXT_RUNTIME === "edge")
}

let serverlessWarned = false
function maybeWarnServerlessCache() {
  if (serverlessWarned) return
  if (isServerlessEnv()) {
    console.warn("[search-jobs] Running in serverless environment; in-memory cache is best-effort. Consider Redis/KV.")
  }
  serverlessWarned = true
}

function getClientIp(request: NextRequest) {
  const headerIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return headerIp || request.ip || "unknown"
}

const RATE_LIMIT_TOKENS = 30
const RATE_LIMIT_WINDOW_MS = 60_000

function consumeIpToken(request: NextRequest): { allowed: boolean; retryAfterSeconds: number } {
  const ip = getClientIp(request)
  const bucket = ipBuckets.get(ip) || { tokens: RATE_LIMIT_TOKENS, lastRefill: Date.now() }

  const now = Date.now()
  const elapsed = now - bucket.lastRefill
  const refillAmount = Math.floor((elapsed / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_TOKENS)
  if (refillAmount > 0) {
    bucket.tokens = Math.min(RATE_LIMIT_TOKENS, bucket.tokens + refillAmount)
    bucket.lastRefill = now
  }

  if (bucket.tokens <= 0) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.lastRefill + RATE_LIMIT_WINDOW_MS - now) / 1000))
    ipBuckets.set(ip, bucket)
    return { allowed: false, retryAfterSeconds }
  }

  bucket.tokens -= 1
  ipBuckets.set(ip, bucket)
  return { allowed: true, retryAfterSeconds: 0 }
}

export async function POST(request: NextRequest) {
  try {
    maybeWarnServerlessCache()
    const rateLimitCheck = consumeIpToken(request)
    if (!rateLimitCheck.allowed) {
      const headers = {
        "x-cache": "MISS",
        "x-inflight": "MISS",
        "Retry-After": String(rateLimitCheck.retryAfterSeconds),
      }
      return NextResponse.json(
        {
          error: "You are sending requests too quickly. Please wait and try again.",
          code: "CLIENT_RATE_LIMIT",
          retryAfterSeconds: rateLimitCheck.retryAfterSeconds,
        },
        { status: 429, headers }
      )
    }

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
    const metas: FetchMeta[] = []
    const failures: {
      status?: number
      jobType: string
      message: string
      code?: string
      retryAfterSeconds?: number
      resetHint?: string
    }[] = []
    const settled = await Promise.allSettled(jobTypePromises)
    settled.forEach((result, index) => {
      const jobType = filters.jobTypes[index] || "Unknown"
      if (result.status === "fulfilled") {
        allJobs.push(...result.value.jobs)
        metas.push(result.value.meta)
      } else {
        const status = (result.reason as JobFetchError)?.status
        const message = (result.reason as Error)?.message || "Unknown error"
        const rateLimit = (result.reason as JobFetchError)?.rateLimit
        failures.push({
          status,
          jobType,
          message,
          code: (result.reason as JobFetchError)?.code,
          retryAfterSeconds: rateLimit?.retryAfterSeconds,
          resetHint: rateLimit?.resetHint,
        })
        console.error(`JSearch request failed for ${jobType}:`, message)
      }
    })

    // If every upstream call failed, surface a structured error instead of empty results
    if (failures.length === filters.jobTypes.length && allJobs.length === 0) {
      const rateLimited = failures.find((failure) => failure.status === 429)
      if (rateLimited) {
        const rateLimitMessage =
          rateLimited.code === "MONTHLY_QUOTA_EXCEEDED"
            ? "Monthly quota exceeded. Please try again after the billing window resets."
            : rateLimited.message || "Thanks for the overwhelming response - we hit our daily job search limit. Please check back soon."
        const headers = {
          "x-cache": metas.some((m) => m.cacheStatus === "HIT") ? "HIT" : "MISS",
          "x-inflight": metas.some((m) => m.inflightStatus === "HIT") ? "HIT" : "MISS",
        }
        return NextResponse.json(
          {
            error: rateLimitMessage,
            code: rateLimited.code || "UPSTREAM_RATE_LIMITED",
            retryAfterSeconds: rateLimited.retryAfterSeconds,
            resetHint: rateLimited.resetHint,
          },
          { status: 429, headers }
        )
      }

      const first = failures[0]
      const headers = {
        "x-cache": metas.some((m) => m.cacheStatus === "HIT") ? "HIT" : "MISS",
        "x-inflight": metas.some((m) => m.inflightStatus === "HIT") ? "HIT" : "MISS",
      }
      return NextResponse.json(
        {
          error: first?.message || "Job search is temporarily unavailable. Please try again in a few minutes.",
          code: first?.code || "UPSTREAM_ERROR",
        },
        { status: first?.status || 502, headers }
      )
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

    const headers = {
      "x-cache": metas.some((m) => m.cacheStatus === "HIT") ? "HIT" : "MISS",
      "x-inflight": metas.some((m) => m.inflightStatus === "HIT") ? "HIT" : "MISS",
    }

    return NextResponse.json({ jobs: limitedJobs }, { headers })
  } catch (error) {
    console.error("Search error:", error)
    const err = error as JobFetchError
    const headers = {
      "x-cache": "MISS",
      "x-inflight": "MISS",
    }
    return NextResponse.json(
      {
        error: err.payload?.error || err.message || "Internal server error",
        code: err.code || "INTERNAL_ERROR",
        retryAfterSeconds: err.rateLimit?.retryAfterSeconds,
        resetHint: err.rateLimit?.resetHint,
      },
      { status: err.status || 500, headers }
    )
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
}): Promise<{ jobs: Job[]; meta: FetchMeta }> {
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

  const page = 1
  const searchParams = new URLSearchParams({
    query,
    page: String(page),
    num_pages: String(numPages),
    date_posted: "all",
  })

  const cacheKey = buildRequestCacheKey({ jobType, query, filters, page, numPages })
  const cacheKeyHash = hashKey(cacheKey)
  const start = Date.now()

  // Cache hit
  const cached = getCacheEntry(cacheKey)
  if (cached) {
    logVerification({
      cacheStatus: "HIT",
      inflightStatus: "MISS",
      upstreamStatus: cached.status,
      cacheKeyHash,
      jobType,
      page,
      durationMs: Date.now() - start,
    })
    if (cached.status === 200)
      return {
        jobs: cached.jobs,
        meta: { cacheStatus: "HIT", inflightStatus: "MISS", upstreamStatus: cached.status, cacheKeyHash, jobType, page, durationMs: Date.now() - start },
      }
    throw createApiErrorFromCache(cacheKey, cached)
  }

  // Inflight hit
  const inflight = inflightRequests.get(cacheKey)
  if (inflight) {
    const result = await inflight
    logVerification({
      cacheStatus: "MISS",
      inflightStatus: "HIT",
      upstreamStatus: result.status,
      cacheKeyHash,
      jobType,
      page,
      durationMs: Date.now() - start,
    })
    if (result.status === 200)
      return {
        jobs: result.jobs,
        meta: {
          cacheStatus: "MISS",
          inflightStatus: "HIT",
          upstreamStatus: result.status,
          cacheKeyHash,
          jobType,
          page,
          durationMs: Date.now() - start,
        },
      }
    throw createApiErrorFromCache(cacheKey, result)
  }

  const fetchPromise: Promise<CachedResult> = (async () => {
    const apiUrl = `https://jsearch.p.rapidapi.com/search?${searchParams.toString()}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
        signal: controller.signal,
      })

      const payload = await response.json().catch(() => null)
      const rateLimit = parseRateLimit(response, payload, response.status)
      const rawMessage = payload?.message || payload?.error || `Upstream search error (${response.status})`
      const friendlyMessage =
        rateLimit?.code === "MONTHLY_QUOTA_EXCEEDED"
          ? "Monthly quota exceeded. Please try again after the billing window resets."
          : rawMessage
      const jobs =
        response.ok && payload?.status === "OK" && Array.isArray(payload.data)
          ? payload.data
              .map((job: any) => extractJobData(job, jobType))
              .filter((job: Job | null): job is Job => job !== null)
          : []

      const cacheEntry: CachedResult = {
        status: response.status,
        payload,
        jobs,
        timestamp: Date.now(),
        ttlMs: response.status === 429 ? RATE_LIMIT_CACHE_TTL_MS : CACHE_TTL_MS,
        rateLimit,
      }

      if (response.ok) {
        setCacheEntry(cacheKey, cacheEntry, CACHE_TTL_MS)
      } else if (response.status === 429 && RATE_LIMIT_CACHE_TTL_MS > 0) {
        setCacheEntry(cacheKey, cacheEntry, RATE_LIMIT_CACHE_TTL_MS)
      }

      logVerification({ cacheStatus: "MISS", inflightStatus: "MISS", upstreamStatus: response.status, cacheKeyHash, jobType })
      const durationMs = Date.now() - start

      if (!response.ok) {
        throw createApiError({
          status: response.status,
          message: friendlyMessage,
          cacheKey,
          rateLimit,
          payload,
        })
      }

      return cacheEntry
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        logVerification({
          cacheStatus: "MISS",
          inflightStatus: "MISS",
          upstreamStatus: 504,
          cacheKeyHash,
          jobType,
          page,
          durationMs: Date.now() - start,
        })
        throw createApiError({
          status: 504,
          message: "Upstream search timed out",
          cacheKey,
          payload: { error: "Upstream request timed out" },
        })
      }
      throw error
    } finally {
      clearTimeout(timeout)
    }
  })()

  inflightRequests.set(cacheKey, fetchPromise)

  try {
    const result = await fetchPromise
    const durationMs = Date.now() - start
    return {
      jobs: result.jobs,
      meta: {
        cacheStatus: "MISS",
        inflightStatus: "MISS",
        upstreamStatus: result.status,
        cacheKeyHash,
        jobType,
        page,
        durationMs,
      },
    }
  } finally {
    inflightRequests.delete(cacheKey)
  }
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
