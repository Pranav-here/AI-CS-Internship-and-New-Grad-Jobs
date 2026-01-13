"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Globe,
  Filter,
  Grid3X3,
  List,
  Bookmark,
  Send,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  Star,
} from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"
import Link from "next/link"

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
  "Remote Job": "remote" | "onsite" | "hybrid"
}

interface SearchFilters {
  keyword: string
  location: string
  jobTypes: string[]
  locationMode: string
  maxResults: number
  sortBy: string
}

// All the mandatory quick search presets
const quickSearchPresets = [
  // Data Science & Analytics
  { label: "Data Analyst", keyword: "data analyst OR analytics analyst OR reporting analyst", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Business Analyst", keyword: "business analyst OR product analyst OR strategy analyst", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Data Scientist", keyword: "data scientist OR applied scientist OR decision scientist", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Analytics Engineer", keyword: "analytics engineer OR bi engineer OR dbt", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Product Analyst", keyword: "product analyst OR growth analyst", type: "Entry-Level / New-Grad Full-Time" },

  // Machine Learning
  { label: "Machine Learning Engineer", keyword: "machine learning engineer OR ml engineer OR applied ml engineer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Applied Scientist", keyword: "applied scientist OR applied research scientist", type: "Entry-Level / New-Grad Full-Time" },
  { label: "MLOps Engineer", keyword: "mlops engineer OR ml platform engineer OR model ops", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Data Science Intern", keyword: "data science intern OR analytics intern", type: "Summer 2026 Internship" },
  { label: "ML Engineer Intern", keyword: "machine learning intern OR applied ml intern", type: "Summer 2026 Internship" },

  // AI Engineering
  { label: "AI Engineer", keyword: "ai engineer OR ai/ml engineer OR generative ai engineer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "AI Developer", keyword: "ai developer OR ai application developer OR llm developer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Generative AI Engineer", keyword: "generative ai engineer OR genai engineer OR llm engineer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "LLM Engineer", keyword: "llm engineer OR llm developer OR prompt engineer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "AI Solutions Engineer", keyword: "ai solutions engineer OR solutions engineer OR ai solutions", type: "Entry-Level / New-Grad Full-Time" },

  // Software Engineering
  { label: "Software Engineer Intern", keyword: "software engineer intern OR software developer intern", type: "Summer 2026 Internship" },
  { label: "Software Engineer New Grad", keyword: "software engineer new grad OR new grad swe OR entry swe", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Backend Engineer", keyword: "backend engineer OR backend developer OR api engineer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Frontend Engineer", keyword: "frontend engineer OR frontend developer OR ui engineer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Full Stack Engineer", keyword: "full stack engineer OR full stack developer", type: "Entry-Level / New-Grad Full-Time" },

  // NLP / Vision
  { label: "NLP Engineer", keyword: "nlp engineer OR language engineer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Computer Vision Engineer", keyword: "computer vision engineer OR cv engineer OR vision engineer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Research Engineer", keyword: "research engineer OR ml research engineer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Research Intern (ML/AI)", keyword: "research intern OR ai research intern", type: "Summer 2026 Internship" },

  // Data Engineering & BI
  { label: "Data Engineer", keyword: "data engineer OR etl engineer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "BI Analyst", keyword: "bi analyst OR business intelligence analyst", type: "Entry-Level / New-Grad Full-Time" },
  { label: "BI Engineer", keyword: "bi engineer OR analytics engineer", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Data Platform Engineer", keyword: "data platform engineer OR data infrastructure", type: "Entry-Level / New-Grad Full-Time" },
  { label: "Data Engineering Intern", keyword: "data engineering intern OR data engineer intern", type: "Summer 2026 Internship" },

  // Remote Opportunities
  { label: "Remote Software Engineer Intern", keyword: "remote software engineer intern", type: "Summer 2026 Internship", remote: true },
  { label: "Remote Data Analyst", keyword: "remote data analyst", type: "Entry-Level / New-Grad Full-Time", remote: true },
  { label: "Remote Data Scientist", keyword: "remote data scientist", type: "Entry-Level / New-Grad Full-Time", remote: true },
  { label: "Remote ML Engineer", keyword: "remote machine learning engineer", type: "Entry-Level / New-Grad Full-Time", remote: true },
  { label: "Remote Data Engineer", keyword: "remote data engineer", type: "Entry-Level / New-Grad Full-Time", remote: true },
]

export default function JobFinderApp() {
  const [searchKey, setSearchKey] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string>("")
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [showQuickSearch, setShowQuickSearch] = useState(false)
  const [showSavedJobs, setShowSavedJobs] = useState(false)
  const [selectedTag, setSelectedTag] = useState("All")
  const [searchTimestamp, setSearchTimestamp] = useState<Date | null>(null)
  const [emailDigest, setEmailDigest] = useState({ enabled: false, email: "", sending: false })

  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    location: "",
    jobTypes: ["Entry-Level / New-Grad Full-Time"],
    locationMode: "Include Remote",
    maxResults: 25,
    sortBy: "Relevance",
  })

  const { toast } = useToast()
  const lastDigestKey = useRef<string | null>(null)
  const searchSectionRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const inflightRequests = useRef<Map<string, Promise<any>>>(new Map())

  const normalizeRemoteStatus = (status: string) => {
    const normalized = status?.toLowerCase().trim()
    if (normalized.startsWith("remote")) return "remote"
    if (normalized.includes("hybrid")) return "hybrid"
    return "onsite"
  }
  const fetcher = async (key: string) => {
    const existing = inflightRequests.current.get(key)
    if (existing) return existing

    const request = (async () => {
      const payload = JSON.parse(key)
      const response = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const error = new Error(data?.error || data?.message || "Search failed") as Error & {
          code?: string
          retryAfterSeconds?: number
        }
        if (data?.code) error.code = data.code
        if (data?.retryAfterSeconds) error.retryAfterSeconds = data.retryAfterSeconds
        throw error
      }

      return data
    })()

    inflightRequests.current.set(key, request)
    try {
      return await request
    } finally {
      inflightRequests.current.delete(key)
    }
  }

  const {
    data: searchData,
    error: searchError,
    isValidating: loading,
  } = useSWR(searchKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 5 * 60 * 1000,
    keepPreviousData: true,
  })
  const jobs = searchData?.jobs ?? []
  const monthlyQuota = (searchError as any)?.code === "MONTHLY_QUOTA_EXCEEDED"
  const friendlyErrorMessage =
    (monthlyQuota && "Monthly quota exceeded. Please try again after the billing window resets.") ||
    searchError?.message ||
    "We're temporarily rate limited by our job data provider. Please try again soon."
  const [showCachedResults, setShowCachedResults] = useState(false)
  const [lastCachedJobs, setLastCachedJobs] = useState<Job[]>([])
  const [lastJobs, setLastJobs] = useState<Job[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchDisabled = monthlyQuota
  const showingCached = showCachedResults && lastCachedJobs.length > 0

  useEffect(() => {
    if (typeof window === "undefined") return
    const existing = sessionStorage.getItem("session-token")
    const token = existing || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)
    sessionStorage.setItem("session-token", token)
    setSessionToken(token)
  }, [])

  // Load saved jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedJobs")
    if (saved) {
      const parsed: Job[] = JSON.parse(saved)
      setSavedJobs(parsed.map((job) => ({ ...job, "Remote Job": normalizeRemoteStatus(job["Remote Job"]) })))
    }
  }, [])

  // Save jobs to localStorage
  useEffect(() => {
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs))
  }, [savedJobs])

  useEffect(() => {
    if (!searchError) return
    setIsSearching(false)
    toast({
      title: "Search Error",
      description: searchError.message || "Failed to search jobs. Please try again.",
      variant: "destructive",
    })
  }, [searchError, toast])

  // Scroll event listener for showing scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleQuickSearch = (keyword: string, jobType: string, isRemote = false) => {
    const newFilters = {
      ...filters,
      keyword,
      jobTypes: [jobType],
      locationMode: isRemote ? "Remote Only" : "Include Remote",
    }
    setFilters(newFilters)
    setShowQuickSearch(false)
    handleSearch(newFilters)
  }

  const handleSearch = (searchFilters = filters, options?: { skipToast?: boolean }) => {
    if (monthlyQuota) return
    if (!searchFilters.keyword.trim()) {
      if (!options?.skipToast) {
        toast({
          title: "Search Required",
          description: "Please enter a job keyword to search.",
          variant: "destructive",
        })
      }
      return
    }

    if (searchFilters.jobTypes.length === 0) {
      if (!options?.skipToast) {
        toast({
          title: "Job Type Required",
          description: "Please select at least one job type.",
          variant: "destructive",
        })
      }
      return
    }

    const normalizedFilters = {
      ...searchFilters,
      keyword: searchFilters.keyword.trim(),
      jobTypes: [...searchFilters.jobTypes],
      maxResults: Math.min(searchFilters.maxResults, 100),
    }

    setIsSearching(true)

    setFilters(normalizedFilters)
    setSearchKey(JSON.stringify(normalizedFilters))
    setSearchPerformed(true)
  }

  const handleSendEmailDigest = useCallback(
    async (jobsToSend = jobs) => {
      if (!emailDigest.email || jobsToSend.length === 0 || !sessionToken) return

      setEmailDigest((prev) => ({ ...prev, sending: true }))
      try {
        const response = await fetch("/api/send-email-digest", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-session-token": sessionToken },
          body: JSON.stringify({
            email: emailDigest.email,
            jobs: jobsToSend.slice(0, 10),
            preferences: filters,
          }),
        })

        if (!response.ok) throw new Error("Failed to send email")

        toast({
          title: "Email Sent!",
          description: `Job digest sent to ${emailDigest.email}`,
        })
      } catch (error) {
        toast({
          title: "Email Failed",
          description: "Failed to send email digest.",
          variant: "destructive",
        })
      } finally {
        setEmailDigest((prev) => ({ ...prev, sending: false }))
      }
    },
    [emailDigest.email, filters, jobs, sessionToken, toast]
  )

  useEffect(() => {
    if (!searchData) return

    const jobCount = searchData.jobs?.length ?? 0
    setLastJobs(searchData.jobs || [])
    if (jobCount > 0) {
      setLastCachedJobs(searchData.jobs)
      setShowCachedResults(false)
    }
    setSearchTimestamp(new Date())
    setIsSearching(false)
    toast({
      title: "Search Complete",
      description: `Found ${jobCount} jobs matching your criteria.`,
    })

    if (emailDigest.enabled && emailDigest.email && jobCount > 0) {
      const digestKey = `${searchKey ?? "none"}:${jobCount}`
      if (lastDigestKey.current !== digestKey) {
        lastDigestKey.current = digestKey
        handleSendEmailDigest(searchData.jobs)
      }
    }
  }, [searchData, emailDigest.enabled, emailDigest.email, searchKey, handleSendEmailDigest, toast])

  const handleSaveJob = (job: Job) => {
    const isAlreadySaved = savedJobs.some(
      (saved) => saved["Job Title"] === job["Job Title"] && saved["Company"] === job["Company"],
    )

    if (!isAlreadySaved) {
      setSavedJobs((prev) => [...prev, job])
      toast({
        title: "Job Saved",
        description: `${job["Job Title"]} has been saved.`,
      })
    }
  }

  const handleRemoveSavedJob = (index: number) => {
    setSavedJobs((prev) => prev.filter((_, i) => i !== index))
  }

  const getTagStatistics = () => {
    const tagCounts: Record<string, number> = {}
    baseJobs.forEach((job) => {
      if (job.Tags) {
        const tags = job.Tags.split(",").map((tag) => tag.trim())
        tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
  }

  const baseJobs = showingCached ? lastCachedJobs : isSearching && lastJobs.length > 0 ? lastJobs : jobs
  const filteredJobs = selectedTag === "All" ? baseJobs : baseJobs.filter((job) => job.Tags?.includes(selectedTag))

  const isRemoteJob = (job: Job) =>
    job["Remote Job"] === "remote" ||
    job["Remote Job"] === "hybrid" ||
    job.Location?.toLowerCase().includes("remote")

  const isJobSaved = (job: Job) => {
    return savedJobs.some((saved) => saved["Job Title"] === job["Job Title"] && saved["Company"] === job["Company"])
  }

  const exportToCSV = (jobsToExport: Job[], filename: string) => {
    if (jobsToExport.length === 0) return

    const headers = Object.keys(jobsToExport[0])
    const csvContent = [
      headers.join(","),
      ...jobsToExport.map((job) => headers.map((header) => `"${(job as any)[header] || ""}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
              <div className="relative">
                <Image
                  src="/favi.png"
                  alt="TechCareers logo"
                  width={40}
                  height={40}
                  className="rounded-xl shadow-lg object-cover group-hover:scale-110 transition-transform duration-300"
                  priority
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  TechCareers
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 hidden sm:block">
                  Smart Job Discovery
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 hover:scale-105 hover:text-white dark:shadow-indigo-900/40 transition-all duration-300 relative overflow-hidden group"
              >
                <Link
                  href="/resume-builder"
                  className="flex items-center"
                  title="AI-powered tools to help you land your dream tech job"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Sparkles className="sm:mr-2 h-4 w-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10 hidden sm:inline">Career Builder</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSavedJobs(true)}
                className="relative group hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
              >
                <Bookmark className="w-4 h-4 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:inline">Saved</span>
                {savedJobs.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                    {savedJobs.length}
                  </Badge>
                )}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      {!searchPerformed && (
        <section className="relative overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-blue-400/30 dark:bg-blue-500/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-40 right-5 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-400/30 dark:bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-pink-400/30 dark:bg-pink-500/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
            <div className="text-center max-w-4xl mx-auto">
              {/* Hero Accent */}
              <div className="relative inline-flex items-center justify-center mb-6 sm:mb-8">
                <div className="absolute inset-0 -left-8 -right-8 h-16 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/25 to-pink-500/20 blur-3xl animate-aurora" />
                <div className="absolute -inset-3 rounded-full border border-white/20 dark:border-white/10 animate-orbit" />
                <div className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-[0_10px_40px_rgba(79,70,229,0.35)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 translate-x-[-120%] animate-shine-slow" />
                  <div className="relative h-3 w-3">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-70 animate-ping" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">
                    Curated AI/ML & software roles
                  </span>
                  <span className="text-xs text-slate-700 dark:text-white/70">refreshed daily</span>
                </div>
              </div>

              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 sm:mb-8 animate-fade-in-up">
                <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent inline-block hover:scale-105 transition-transform duration-300">
                  Find Your Dream
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent inline-block hover:scale-105 transition-transform duration-300 animate-gradient-x">
                  Tech Career
                </span>
              </h2>

              <p className="text-base sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
                Discover internships and entry-level positions in AI, ML, Data Science, and Software Engineering.
                Designed for the next generation of tech talent.
              </p>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-8 sm:mb-16 animate-fade-in-up animation-delay-400">
                <div
                  className="
                    flex items-center space-x-2 sm:space-x-3
                    bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20
                    backdrop-blur-sm
                    rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4
                    border-2 border-emerald-200/50 dark:border-emerald-700/50
                    transition-all duration-300
                    hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/20
                    hover:-rotate-2 hover:border-emerald-300
                    cursor-pointer
                    group
                  "
                >
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-semibold">Latest Listings</span>
                </div>

                <div
                  className="
                    flex items-center space-x-2 sm:space-x-3
                    bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20
                    backdrop-blur-sm
                    rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4
                    border-2 border-blue-200/50 dark:border-blue-700/50
                    transition-all duration-300
                    hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/20
                    hover:rotate-2 hover:border-blue-300
                    cursor-pointer
                    group
                  "
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-semibold">Smart Jobs</span>
                </div>

                <div
                  className="
                    flex items-center space-x-2 sm:space-x-3
                    bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20
                    backdrop-blur-sm
                    rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4
                    border-2 border-purple-200/50 dark:border-purple-700/50
                    transition-all duration-300
                    hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/20
                    hover:-rotate-2 hover:border-purple-300
                    cursor-pointer
                    group
                  "
                >
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                  <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-semibold">Remote + Onsite roles</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-20 sm:pb-24">
        {monthlyQuota && (
          <Card className="mb-4 sm:mb-6 border border-amber-200 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-900/30 shadow-lg">
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Search temporarily paused</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Monthly quota exceeded. Please try again after the billing window resets.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {lastCachedJobs.length > 0 && (
                  <Button variant="outline" onClick={() => setShowCachedResults(true)} className="border-amber-400 text-amber-800 dark:text-amber-100">
                    Show last cached results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Search Panel */}
        <Card className="mb-6 sm:mb-8 border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-0">
            <div
              className="p-4 sm:p-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-300 group active:bg-blue-50 dark:active:bg-blue-900/20"
              onClick={() => setShowQuickSearch(!showQuickSearch)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 sm:space-x-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex-shrink-0">
                    <span className="text-lg sm:text-xl font-bold text-white">Q</span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Quick Search</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Popular roles, ready to search</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${showQuickSearch ? "rotate-180" : ""}`}
                />
              </div>
            </div>

            {showQuickSearch && (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-slate-100 dark:border-slate-700">
                <div className="pt-4 sm:pt-6 space-y-4 sm:space-y-6">
                  {/* Data Science & Analytics */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                      Data Science & Analytics
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {quickSearchPresets.slice(0, 5).map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-9 sm:h-8 bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300"
                          onClick={() => handleQuickSearch(preset.keyword, preset.type, preset.remote)}
                          disabled={searchDisabled}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Machine Learning */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Machine Learning
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {quickSearchPresets.slice(5, 10).map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-9 sm:h-8 bg-blue-50/50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-300"
                          onClick={() => handleQuickSearch(preset.keyword, preset.type, preset.remote)}
                          disabled={searchDisabled}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* AI Engineering */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      AI Engineering
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {quickSearchPresets.slice(10, 15).map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-9 sm:h-8 bg-indigo-50/50 hover:bg-indigo-100 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/20 border-indigo-200/50 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300"
                          onClick={() => handleQuickSearch(preset.keyword, preset.type, preset.remote)}
                          disabled={searchDisabled}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Software Engineering */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Software Engineering
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {quickSearchPresets.slice(15, 20).map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-9 sm:h-8 bg-purple-50/50 hover:bg-purple-100 dark:bg-purple-900/10 dark:hover:bg-purple-900/20 border-purple-200/50 dark:border-purple-700/50 text-purple-700 dark:text-purple-300"
                          onClick={() => handleQuickSearch(preset.keyword, preset.type, preset.remote)}
                          disabled={searchDisabled}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* NLP / Vision */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                      NLP / Vision
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {quickSearchPresets.slice(20, 24).map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-9 sm:h-8 bg-pink-50/50 hover:bg-pink-100 dark:bg-pink-900/10 dark:hover:bg-pink-900/20 border-pink-200/50 dark:border-pink-700/50 text-pink-700 dark:text-pink-300"
                          onClick={() => handleQuickSearch(preset.keyword, preset.type, preset.remote)}
                          disabled={searchDisabled}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Data Engineering & BI */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      Data Engineering & BI
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {quickSearchPresets.slice(24, 29).map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-9 sm:h-8 bg-orange-50/50 hover:bg-orange-100 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 border-orange-200/50 dark:border-orange-700/50 text-orange-700 dark:text-orange-300"
                          onClick={() => handleQuickSearch(preset.keyword, preset.type, preset.remote)}
                          disabled={searchDisabled}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Remote Opportunities */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Remote Opportunities
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {quickSearchPresets.slice(29).map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-9 sm:h-8 bg-green-50/50 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/20 border-green-200/50 dark:border-green-700/50 text-green-700 dark:text-green-300"
                          onClick={() => handleQuickSearch(preset.keyword, preset.type, preset.remote)}
                          disabled={searchDisabled}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tip */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">i</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Pro Tip</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                          Each button instantly searches for that specific role type. Results load automatically with
                          smart filtering applied.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Interface */}
        <div ref={searchSectionRef} className="mb-6 sm:mb-8" id="search-section">
          <Card className="relative border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800/90 backdrop-blur-xl shadow-2xl hover:shadow-[0_20px_60px_rgba(59,130,246,0.3)] dark:hover:shadow-[0_20px_60px_rgba(99,102,241,0.4)] transition-all duration-500 group overflow-hidden">
            {/* Decorative gradient orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 dark:from-indigo-500/10 dark:to-pink-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <CardContent className="p-4 sm:p-6 md:p-8 relative z-10">
              {/* Primary Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="md:col-span-2">
                  <Label
                    htmlFor="keyword"
                    className="text-sm sm:text-base font-semibold bg-gradient-to-r from-slate-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-2 sm:mb-3 block"
                  >
                    What role are you looking for?
                  </Label>
                  <div className="relative group/input">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 group-hover/input:text-blue-500 group-hover/input:scale-110 transition-all duration-300" />
                    <Input
                      id="keyword"
                      placeholder="e.g., Machine Learning Engineer, Data Scientist"
                      value={filters.keyword}
                      onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                      disabled={searchDisabled}
                      className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg border-2 border-slate-200/50 dark:border-slate-700/50 focus:border-blue-500 dark:focus:border-blue-400 bg-white/80 dark:bg-slate-900/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 focus:shadow-lg focus:shadow-blue-500/20 dark:focus:shadow-blue-400/20"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="location"
                    className="text-sm sm:text-base font-semibold bg-gradient-to-r from-slate-900 to-purple-800 dark:from-white dark:to-purple-200 bg-clip-text text-transparent mb-2 sm:mb-3 block"
                  >
                    Location (Optional)
                  </Label>
                  <div className="relative group/input">
                    <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 group-hover/input:text-purple-500 group-hover/input:scale-110 transition-all duration-300" />
                    <Input
                      id="location"
                      placeholder="City, State, or Remote"
                      value={filters.location}
                      onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                      disabled={searchDisabled}
                      className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg border-2 border-slate-200/50 dark:border-slate-700/50 focus:border-purple-500 dark:focus:border-purple-400 bg-white/80 dark:bg-slate-900/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20 dark:focus:shadow-purple-400/20"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 group/filter transition-all duration-300 w-full sm:w-auto"
                >
                  <Filter className="w-4 h-4 mr-2 group-hover/filter:rotate-12 transition-transform duration-300" />
                  Advanced Filters
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
                </Button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4">
                  {/* Email Digest Toggle */}
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group/email justify-center sm:justify-start">
                    <Checkbox
                      id="email-digest"
                      checked={emailDigest.enabled}
                      onCheckedChange={(checked) =>
                        setEmailDigest((prev) => ({ ...prev, enabled: checked as boolean }))
                      }
                      className="group-hover/email:border-blue-500 transition-colors duration-300"
                    />
                    <Label htmlFor="email-digest" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer group-hover/email:text-blue-600 dark:group-hover/email:text-blue-400 transition-colors duration-300">
                      Email results
                    </Label>
                  </div>

                  <Button
                    onClick={() => handleSearch()}
                    disabled={loading || searchDisabled}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/60 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 relative z-10"></div>
                        <span className="relative z-10">Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="relative z-10 font-semibold">Search Jobs</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Email Input */}
              {emailDigest.enabled && (
                <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200/60 dark:border-blue-700/50 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20 animate-fade-in-up">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={emailDigest.email}
                        onChange={(e) => setEmailDigest((prev) => ({ ...prev, email: e.target.value }))}
                        className="border-2 border-blue-200/70 dark:border-blue-700/70 bg-white/80 dark:bg-slate-900/50 focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-300"
                      />
                    </div>
                    {jobs.length > 0 && (
                      <Button
                        onClick={() => handleSendEmailDigest()}
                        disabled={emailDigest.sending || !emailDigest.email}
                        variant="outline"
                        className="border-2 border-blue-500/50 dark:border-blue-600/50 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                      >
                        {emailDigest.sending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400 mr-2"></div>
                        ) : (
                          <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                        )}
                        Send Digest
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Advanced Filters */}
              {showFilters && (
                <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
                  {/* Job Types */}
                  <div>
                    <Label className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4 block">
                      Job Types
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {[
                        "Spring 2026 Internship",
                        "Fall 2026 Internship",
                        "Summer 2026 Internship",
                        "Entry-Level / New-Grad Full-Time",
                      ].map((type) => (
                        <div
                          key={type}
                          className="flex items-center space-x-2.5 sm:space-x-3 p-3 sm:p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 dark:active:bg-slate-700 transition-colors"
                        >
                          <Checkbox
                            id={type}
                            checked={filters.jobTypes.includes(type)}
                            disabled={searchDisabled}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters((prev) => ({ ...prev, jobTypes: [...prev.jobTypes, type] }))
                              } else {
                                setFilters((prev) => ({ ...prev, jobTypes: prev.jobTypes.filter((t) => t !== type) }))
                              }
                            }}
                            className="h-5 w-5"
                          />
                          <Label htmlFor={type} className="text-xs sm:text-sm font-medium cursor-pointer flex-1 leading-tight">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location Mode & Other Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <Label className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-3 block">
                        Work Location
                      </Label>
                      <RadioGroup
                        value={filters.locationMode}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, locationMode: value }))}
                        disabled={searchDisabled}
                        className="space-y-2.5 sm:space-y-2"
                      >
                        {["On-site Only", "Remote Only", "Include Remote"].map((mode) => (
                          <div key={mode} className="flex items-center space-x-2.5 sm:space-x-2 p-2 sm:p-0 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <RadioGroupItem value={mode} id={mode} className="h-5 w-5" disabled={searchDisabled} />
                            <Label htmlFor={mode} className="text-xs sm:text-sm cursor-pointer flex-1">
                              {mode}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-3 block">
                        Max Results
                      </Label>
                      <Select
                        value={filters.maxResults.toString()}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, maxResults: Number.parseInt(value) }))
                        }
                        disabled={searchDisabled}
                      >
                        <SelectTrigger className="h-11 sm:h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 jobs</SelectItem>
                          <SelectItem value="25">25 jobs</SelectItem>
                          <SelectItem value="50">50 jobs</SelectItem>
                          <SelectItem value="100">100 jobs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-3 block">
                        Sort By
                      </Label>
                      <Select
                        value={filters.sortBy}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
                        disabled={searchDisabled}
                      >
                        <SelectTrigger className="h-11 sm:h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Relevance">Relevance</SelectItem>
                          <SelectItem value="Date Posted">Date Posted</SelectItem>
                          <SelectItem value="Company">Company</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {searchPerformed ? (
          <>
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4 p-4 sm:p-6 bg-gradient-to-r from-white/60 via-blue-50/40 to-purple-50/40 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/40 backdrop-blur-lg rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
                  {filteredJobs.length} Opportunities Found
                </h3>
                {searchTimestamp && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 flex items-center group">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Updated {searchTimestamp.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full lg:w-auto">
                {/* Tag Filter */}
                {jobs.length > 0 && (
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-full sm:w-48 border-2 border-slate-200/70 dark:border-slate-700/70 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {Object.entries(getTagStatistics()).map(([tag, count]) => (
                        <SelectItem key={tag} value={tag}>
                          {tag} ({count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* View Toggle */}
                <div className="flex items-center bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl p-1.5 shadow-inner">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Export Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(filteredJobs, "jobs.csv")}
                  disabled={filteredJobs.length === 0}
                  className="border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                >
                  <Download className="w-4 h-4 sm:mr-2 group-hover:translate-y-1 transition-transform duration-300" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              </div>
            </div>

            {/* Analytics Cards */}
              {baseJobs.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                  {/* Total Jobs */}
                  <Card
                    className="
                      group border-0
                      bg-gradient-to-r from-emerald-500 to-teal-600
                      text-white
                      transition-all duration-300
                      hover:shadow-2xl hover:shadow-emerald-500/40 hover:ring-2 hover:ring-emerald-300/60
                      dark:hover:ring-emerald-400/40
                      rounded-xl
                      hover:scale-105 hover:-rotate-1
                      cursor-pointer
                      relative overflow-hidden
                    "
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <CardContent className="p-3 sm:p-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-xs sm:text-sm font-medium">Total Jobs</p>
                          <p className="text-xl sm:text-3xl font-bold group-hover:scale-110 transition-transform duration-300">
                            {baseJobs.length}
                          </p>
                        </div>
                        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-200 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Companies */}
                  <Card
                    className="
                      group border-0
                      bg-gradient-to-r from-blue-500 to-indigo-600
                      text-white
                      transition-all duration-300
                      hover:shadow-2xl hover:shadow-blue-500/40 hover:ring-2 hover:ring-indigo-300/60
                      dark:hover:ring-indigo-400/40
                      rounded-xl
                      hover:scale-105 hover:rotate-1
                      cursor-pointer
                      relative overflow-hidden
                    "
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <CardContent className="p-3 sm:p-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-xs sm:text-sm font-medium">Companies</p>
                          <p className="text-xl sm:text-3xl font-bold group-hover:scale-110 transition-transform duration-300">
                            {new Set(baseJobs.map((job) => job.Company)).size}
                          </p>
                        </div>
                        <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Remote Jobs */}
                  <Card
                    className="
                      group border-0
                      bg-gradient-to-r from-purple-500 to-pink-600
                      text-white
                      transition-all duration-300
                      hover:shadow-2xl hover:shadow-purple-500/40 hover:ring-2 hover:ring-pink-300/60
                      dark:hover:ring-pink-400/40
                      rounded-xl
                      hover:scale-105 hover:-rotate-1
                      cursor-pointer
                      relative overflow-hidden
                    "
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <CardContent className="p-3 sm:p-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-xs sm:text-sm font-medium">Remote Jobs</p>
                          <p className="text-xl sm:text-3xl font-bold group-hover:scale-110 transition-transform duration-300">
                            {baseJobs.filter((job) => isRemoteJob(job)).length}
                          </p>
                        </div>
                        <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Locations */}
                  <Card
                    className="
                      group border-0
                      bg-gradient-to-r from-orange-500 to-red-600
                      text-white
                      transition-all duration-300
                      hover:shadow-2xl hover:shadow-orange-500/40 hover:ring-2 hover:ring-orange-300/60
                      dark:hover:ring-orange-400/40
                      rounded-xl
                      hover:scale-105 hover:rotate-1
                      cursor-pointer
                      relative overflow-hidden
                    "
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <CardContent className="p-3 sm:p-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-xs sm:text-sm font-medium">Locations</p>
                          <p className="text-xl sm:text-3xl font-bold group-hover:scale-110 transition-transform duration-300">
                            {new Set(baseJobs.map((job) => job.Location)).size}
                          </p>
                        </div>
                        <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            {/* Job Results */}
              {isSearching && (
                <Card className="relative border-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 animate-pulse"></div>
                  <CardContent className="text-center py-16 sm:py-20 relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                      Searching for jobs...
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
                      Hang tight while we fetch the latest roles.
                    </p>
                  </CardContent>
                </Card>
              )}

              {showingCached && !isSearching && (
                <div className="mb-4 text-sm text-amber-700 dark:text-amber-200 flex items-center gap-2">
                  <Badge variant="outline" className="border-amber-400 text-amber-800 dark:text-amber-100">
                    Cached
                  </Badge>
                  Showing last cached results (may be stale).
                </div>
              )}
              {!isSearching && searchError && !showingCached ? (
                <Card className="relative border-0 bg-gradient-to-br from-rose-50 via-amber-50 to-white dark:from-rose-900/30 dark:via-amber-900/20 dark:to-slate-900 backdrop-blur-xl shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 via-amber-300/10 to-orange-300/10 dark:from-rose-500/10 dark:via-amber-500/10 dark:to-orange-500/10"></div>
                  <CardContent className="text-center py-16 sm:py-20 relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-rose-100 to-amber-100 dark:from-rose-900/40 dark:to-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-8 h-8 text-rose-600 dark:text-rose-300" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                      Search temporarily paused
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
                      {friendlyErrorMessage}
                    </p>
                    {monthlyQuota && lastCachedJobs.length > 0 && (
                      <div className="mt-6 flex justify-center">
                        <Button variant="outline" onClick={() => setShowCachedResults(true)}>
                          Show last cached results
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : filteredJobs.length > 0 ? (
                <div className="space-y-6 sm:space-y-8">
                  {viewMode === "grid" ? (
                    <div
                      className="
                        grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6
                        motion-safe:animate-fade-in
                      "
                    >
                      {filteredJobs.map((job, index) => (
                        <JobCard
                          key={index}
                          job={job}
                          onSave={() => handleSaveJob(job)}
                          isSaved={isJobSaved(job)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="
                        space-y-4 motion-safe:animate-fade-in
                      "
                    >
                      {filteredJobs.map((job, index) => (
                        <JobListItem
                          key={index}
                          job={job}
                          onSave={() => handleSaveJob(job)}
                          isSaved={isJobSaved(job)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : !isSearching ? (
                <Card className="relative border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5"></div>
                  <CardContent className="text-center py-20 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-4">
                      No jobs found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto">
                      Try adjusting your search criteria or explore different keywords
                    </p>
                  </CardContent>
                </Card>
              ) : null}
          </>
        ) : (
          <Card className="relative border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5"></div>
            <CardContent className="text-center py-20 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-4">
                Search to see jobs
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto">
                Enter a role and hit Search or pick a quick-search to get tailored results.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Saved Jobs Drawer */}
      {showSavedJobs && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSavedJobs(false)} />
          <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Saved Jobs ({savedJobs.length})</h2>
              <div className="flex items-center gap-2">
                {savedJobs.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(savedJobs, "saved_jobs.csv")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowSavedJobs(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto h-full pb-24">
              {savedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">No saved jobs yet</h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    Save jobs while browsing to keep track of opportunities
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {savedJobs.map((job, index) => (
                    <Card key={index} className="border border-slate-200 dark:border-slate-700">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                          <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
                              {job["Job Title"]}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                              {job.Company} - {job.Location}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSavedJob(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {isRemoteJob(job) && (
                              <Badge variant="secondary" className="text-xs">
                                Remote
                              </Badge>
                            )}
                            {job.Tags &&
                              job.Tags.split(",")
                                .slice(0, 2)
                                .map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag.trim()}
                                  </Badge>
                                ))}
                          </div>
                          <Button size="sm" asChild>
                            <a href={job["Apply Link"]} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-2" />
                              Apply
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Search Button */}
      {searchPerformed && showScrollTop && (
        <Button
          onClick={scrollToSearch}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white transition-all duration-300 hover:scale-110 active:scale-95 group"
          size="icon"
          aria-label="Scroll to search"
        >
          <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-125 transition-transform duration-300" />
        </Button>
      )}
    </div>
  )
}

// Job Card Component
function JobCard({ job, onSave, isSaved }: { job: Job; onSave: () => void; isSaved: boolean }) {
  const isRemote = job["Remote Job"] === "remote" || job["Remote Job"] === "hybrid" || job.Location?.toLowerCase().includes("remote")
  const tags = job.Tags
    ? job.Tags.split(",")
        .map((tag) => tag.trim())
        .slice(0, 3)
    : []

  const getDaysAgo = (dateStr: string) => {
    if (!dateStr || dateStr === "Not available") return null
    try {
      const postDate = new Date(dateStr)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - postDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  const daysAgo = getDaysAgo(job["Posting Date"])

  return (
    <Card className="group relative hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 transition-all duration-500 sm:hover:-translate-y-2 border-0 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800/80 backdrop-blur-xl overflow-hidden">
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardContent className="p-4 sm:p-6 relative z-10">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex-1 pr-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
              {job["Job Title"]}
            </h3>
            <div className="flex items-center text-slate-600 dark:text-slate-400 mb-1.5 sm:mb-2">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base truncate">{job.Company}</span>
            </div>
            <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="truncate">{job.Location}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className={`${isSaved ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0 h-10 w-10 sm:h-auto sm:w-auto p-2`}
          >
            {isSaved ? <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Star className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {isRemote && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-xs sm:text-sm px-2 py-0.5">
              Remote
            </Badge>
          )}
          {job["Job Title"]?.toLowerCase().includes("intern") && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 text-xs sm:text-sm px-2 py-0.5">
              Internship
            </Badge>
          )}
          {daysAgo && daysAgo <= 7 && (
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-0 text-xs sm:text-sm px-2 py-0.5">
              New ({daysAgo}d ago)
            </Badge>
          )}
        </div>

        {/* Description */}
        {job.Description && job.Description !== "No description available" && (
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed">{job.Description}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-[10px] sm:text-xs border-slate-300 dark:border-slate-600 px-1.5 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Apply Button */}
        <Button
          asChild
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 sm:hover:scale-[1.02] relative overflow-hidden group/btn h-11 sm:h-10 active:scale-95"
        >
          <a
            href={job["Apply Link"]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
            <ExternalLink className="w-4 h-4 mr-2 relative z-10 group-hover/btn:scale-110 transition-transform duration-300" />
            <span className="relative z-10 font-semibold">Apply Now</span>
          </a>
        </Button>

        {/* Footer */}
        {job["Posting Date"] && job["Posting Date"] !== "Not available" && (
          <div className="flex items-center text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
            <Calendar className="w-3 h-3 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Posted: {job["Posting Date"]}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Job List Item Component
function JobListItem({ job, onSave, isSaved }: { job: Job; onSave: () => void; isSaved: boolean }) {
  const isRemote = job["Remote Job"] === "remote" || job["Remote Job"] === "hybrid" || job.Location?.toLowerCase().includes("remote")
  const tags = job.Tags
    ? job.Tags.split(",")
        .map((tag) => tag.trim())
        .slice(0, 2)
    : []

  return (
    <Card className="group relative border-0 bg-gradient-to-r from-white via-blue-50/20 to-purple-50/20 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800/80 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {job["Job Title"]}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                className={`${isSaved ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} hover:text-blue-600 dark:hover:text-blue-400`}
              >
                {isSaved ? <Star className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center text-slate-600 dark:text-slate-400 mb-3">
              <Building2 className="w-4 h-4 mr-2" />
              <span className="font-medium mr-4">{job.Company}</span>
              <MapPin className="w-4 h-4 mr-2" />
              <span>{job.Location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {isRemote && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">
                    Remote
                  </Badge>
                )}
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden group/btn"
              >
                <a href={job["Apply Link"]} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                  <ExternalLink className="w-4 h-4 mr-2 relative z-10 group-hover/btn:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">Apply</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



