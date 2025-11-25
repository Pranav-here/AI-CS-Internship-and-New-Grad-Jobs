"use client"

import { Loader2, CheckCircle2, AlertCircle, AlertTriangle, TrendingUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useCareerBuilder } from "@/lib/career-builder-context"

const LIMITS = {
  jobDescription: 15000,
  resume: 50000,
  uploadBytes: 5 * 1024 * 1024,
}

const SUPPORTED_UPLOAD_TYPES = [".txt", ".docx", ".pdf"]
const SUPPORTED_MIME_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

type ATSScoreResult = {
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

export default function ATSCheckerTab() {
  const { jobDescription, setJobDescription, expandedResume, setExpandedResume } = useCareerBuilder()

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ATSScoreResult | null>(null)

  const extractPdfText = async (arrayBuffer: ArrayBuffer) => {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf")
    const workerSrc =
      (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")
        .then((m) => (m as any)?.default ?? m)
        .catch(() => null)) ?? `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

    const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise
    const pageTexts: string[] = []

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      const text = content.items
        .map((item: any) => {
          if ("str" in item) return item.str
          return ""
        })
        .join(" ")
      pageTexts.push(text)
    }

    return pageTexts.join("\n").trim()
  }

  const handleUpload = async (file: File | null) => {
    if (!file) return
    setError(null)
    setUploading(true)

    try {
      if (file.size > LIMITS.uploadBytes) {
        throw new Error("Please upload a file under 5MB.")
      }

      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
      if (!SUPPORTED_UPLOAD_TYPES.includes(extension)) {
        throw new Error("Please upload a .txt, .docx, or .pdf resume.")
      }

      let text = ""

      if (extension === ".txt" || file.type === "text/plain") {
        text = await file.text()
      } else if (extension === ".docx") {
        const arrayBuffer = await file.arrayBuffer()
        const mammoth = await import("mammoth/mammoth.browser")
        const result = await mammoth.extractRawText({ arrayBuffer })
        text = result.value ?? ""
      } else {
        const arrayBuffer = await file.arrayBuffer()
        text = await extractPdfText(arrayBuffer)
      }

      const normalized = text.trim()
      if (!normalized) {
        throw new Error("The uploaded file appears to be empty.")
      }

      const truncated = normalized.length > LIMITS.resume ? normalized.slice(0, LIMITS.resume) : normalized

      setExpandedResume(truncated)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to read that file."
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async () => {
    setError(null)

    if (!jobDescription.trim() || !expandedResume.trim()) {
      setError("Please provide both the job posting and your resume.")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resume: expandedResume,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong while analyzing your resume.")
      }

      setResult(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900"
    if (score >= 60) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900"
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900"
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Label htmlFor="jobDescription" className="text-base font-semibold text-slate-900 dark:text-white">
            Job Description
          </Label>
          <Textarea
            id="jobDescription"
            required
            placeholder="Paste the job description here..."
            className="mt-3 min-h-[300px] resize-y rounded-2xl border-slate-200 bg-white/80 text-slate-800 shadow-inner focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />
          <p className="mt-2 text-sm text-slate-500">
            {jobDescription.length} / {LIMITS.jobDescription.toLocaleString()} characters
          </p>
        </div>

        <div>
          <Label htmlFor="resume" className="text-base font-semibold text-slate-900 dark:text-white">
            Your Resume
          </Label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              id="resumeUpload"
              type="file"
              accept={SUPPORTED_UPLOAD_TYPES.join(",")}
              className="block w-full max-w-xs cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
              onChange={(event) => handleUpload(event.target.files?.[0] ?? null)}
              disabled={uploading}
            />
            {uploading && (
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Reading...
              </span>
            )}
          </div>
          <Textarea
            id="resume"
            placeholder="Or paste your resume text here..."
            className="mt-3 min-h-[240px] resize-y rounded-2xl border-slate-200 bg-white/80 text-slate-800 shadow-inner focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
            value={expandedResume}
            onChange={(event) => setExpandedResume(event.target.value)}
          />
          <p className="mt-2 text-sm text-slate-500">
            {expandedResume.length} / {LIMITS.resume.toLocaleString()} characters
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-300 transition hover:scale-[1.01] hover:shadow-indigo-400 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="h-5 w-5" />
              Analyze ATS Score
            </>
          )}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-900/30 dark:text-indigo-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing your resume against the job description...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className={`rounded-2xl border p-6 ${getScoreBgColor(result.overallScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">ATS Compatibility Score</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  How well your resume matches the job description
                </p>
              </div>
              <div className={`text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}
                <span className="text-3xl">/100</span>
              </div>
            </div>
            <Progress value={result.overallScore} className="mt-4 h-3" />
          </div>

          {/* Score Breakdown - Research-Based Weighting */}
          <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 dark:border-slate-700 dark:bg-slate-900/30">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Score Breakdown (Based on Real ATS Systems)
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Technical Skills</div>
                <div className={`mt-1 text-xl font-bold ${getScoreColor((result.technicalSkillsScore / 35) * 100)}`}>
                  {result.technicalSkillsScore}/35
                </div>
                <Progress value={(result.technicalSkillsScore / 35) * 100} className="mt-2 h-2" />
                <div className="mt-1 text-xs text-slate-500">35%</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Job Title Match</div>
                <div className={`mt-1 text-xl font-bold ${getScoreColor((result.jobTitleScore / 15) * 100)}`}>
                  {result.jobTitleScore}/15
                </div>
                <Progress value={(result.jobTitleScore / 15) * 100} className="mt-2 h-2" />
                <div className="mt-1 text-xs text-slate-500">15%</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Experience Relevance</div>
                <div className={`mt-1 text-xl font-bold ${getScoreColor((result.experienceRelevanceScore / 15) * 100)}`}>
                  {result.experienceRelevanceScore}/15
                </div>
                <Progress value={(result.experienceRelevanceScore / 15) * 100} className="mt-2 h-2" />
                <div className="mt-1 text-xs text-slate-500">15%</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Education</div>
                <div className={`mt-1 text-xl font-bold ${getScoreColor((result.educationScore / 10) * 100)}`}>
                  {result.educationScore}/10
                </div>
                <Progress value={(result.educationScore / 10) * 100} className="mt-2 h-2" />
                <div className="mt-1 text-xs text-slate-500">10%</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Location</div>
                <div className={`mt-1 text-xl font-bold ${getScoreColor((result.locationScore / 10) * 100)}`}>
                  {result.locationScore}/10
                </div>
                <Progress value={(result.locationScore / 10) * 100} className="mt-2 h-2" />
                <div className="mt-1 text-xs text-slate-500">10%</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Formatting</div>
                <div className={`mt-1 text-xl font-bold ${getScoreColor((result.formattingScore / 10) * 100)}`}>
                  {result.formattingScore}/10
                </div>
                <Progress value={(result.formattingScore / 10) * 100} className="mt-2 h-2" />
                <div className="mt-1 text-xs text-slate-500">10%</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Industry Keywords</div>
                <div className={`mt-1 text-xl font-bold ${getScoreColor((result.industryKeywordsScore / 5) * 100)}`}>
                  {result.industryKeywordsScore}/5
                </div>
                <Progress value={(result.industryKeywordsScore / 5) * 100} className="mt-2 h-2" />
                <div className="mt-1 text-xs text-slate-500">5%</div>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
              <strong>Research-backed model:</strong> Based on RChilli (used by Workday, Oracle, SAP) and Jobscan recruiter studies.
              Technical skills are weighted highest (35%) as 76.4% of recruiters filter by skills first.
            </div>
          </div>

          {/* Matched Technical Skills - Highest Priority */}
          {result.matchedSkills && result.matchedSkills.length > 0 && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/20">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Matched Technical Skills ({result.matchedSkills.length})
                </h3>
                <Badge className="bg-green-600 text-white">Highest Priority - 35%</Badge>
              </div>
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                These programming languages, frameworks, and tools from the job description were found in your resume.
              </p>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="border-green-400 bg-green-100 text-green-900 dark:border-green-700 dark:bg-green-900/50 dark:text-green-100">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Missing Technical Skills - Critical */}
          {result.missingSkills && result.missingSkills.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Missing Technical Skills ({result.missingSkills.length})
                </h3>
                <Badge variant="destructive">Critical - Add These</Badge>
              </div>
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                These important technical skills from the job description are missing from your resume. 76.4% of recruiters filter by skills first.
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="border-red-400 bg-red-100 text-red-900 dark:border-red-700 dark:bg-red-900/50 dark:text-red-100">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Matched Keywords */}
          {result.matchedKeywords.length > 0 && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/20">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Other Matched Keywords ({result.matchedKeywords.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords.map((keyword, idx) => (
                  <Badge key={idx} variant="outline" className="border-green-300 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-green-200">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {result.missingKeywords.length > 0 && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-900/20">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Other Missing Keywords ({result.missingKeywords.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((keyword, idx) => (
                  <Badge key={idx} variant="outline" className="border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Suggestions</h3>
              </div>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Formatting Issues */}
          {result.formattingIssues.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Formatting Issues</h3>
              </div>
              <ul className="space-y-2">
                {result.formattingIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="mt-1 text-red-600 dark:text-red-400">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
