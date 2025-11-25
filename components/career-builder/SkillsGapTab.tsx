"use client"

import { Loader2, X, Plus, ExternalLink, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCareerBuilder } from "@/lib/career-builder-context"

const LIMITS = {
  jobDescription: 15000,
  resume: 50000,
  uploadBytes: 5 * 1024 * 1024,
}

const SUPPORTED_UPLOAD_TYPES = [".txt", ".docx", ".pdf"]

type SkillGap = {
  skill: string
  priority: "critical" | "important" | "nice-to-have"
  reason: string
  resources: { name: string; url: string; type: string }[]
}

type SkillsGapResult = {
  criticalGaps: SkillGap[]
  importantGaps: SkillGap[]
  niceToHaveGaps: SkillGap[]
  existingSkills: string[]
  extractedSkills: string[]
}

export default function SkillsGapTab() {
  const { jobDescription, setJobDescription, expandedResume, setExpandedResume } = useCareerBuilder()

  const [userSkills, setUserSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SkillsGapResult | null>(null)

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

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !userSkills.includes(trimmed)) {
      setUserSkills([...userSkills, trimmed])
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setUserSkills(userSkills.filter((s) => s !== skill))
  }

  const handleAnalyze = async () => {
    setError(null)

    if (userSkills.length === 0 && !expandedResume.trim() && !jobDescription.trim()) {
      setError("Please provide your skills, resume, or a job description to analyze.")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/skills-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSkills: userSkills.length > 0 ? userSkills : undefined,
          resume: expandedResume.trim() || undefined,
          jobDescription: jobDescription.trim() || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong while analyzing your skills.")
      }

      setResult(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    if (priority === "critical") return "border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200"
    if (priority === "important") return "border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
    return "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === "critical") return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
    if (priority === "important") return <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
    return <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  }

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold text-slate-900 dark:text-white">Your Current Skills</Label>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Add a skill (e.g., Python, React, AWS)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addSkill()
                }
              }}
              className="rounded-2xl border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50"
            />
            <Button
              type="button"
              onClick={addSkill}
              className="rounded-2xl bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {userSkills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="gap-1 px-3 py-1">
                {skill}
                <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-center text-sm font-medium text-slate-500">OR</div>

        <div>
          <Label htmlFor="resumeForSkills" className="text-base font-semibold text-slate-900 dark:text-white">
            Import Skills from Resume
          </Label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              id="resumeForSkills"
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
            placeholder="Or paste your resume here to extract skills..."
            className="mt-3 min-h-[120px] resize-y rounded-2xl border-slate-200 bg-white/80 text-slate-800 shadow-inner focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
            value={expandedResume}
            onChange={(event) => setExpandedResume(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="jobDescForSkills" className="text-base font-semibold text-slate-900 dark:text-white">
            Job Description (Optional)
          </Label>
          <Textarea
            id="jobDescForSkills"
            placeholder="Paste a job description to see what skills are required..."
            className="mt-3 min-h-[150px] resize-y rounded-2xl border-slate-200 bg-white/80 text-slate-800 shadow-inner focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />
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
              Analyze Skills Gap
            </>
          )}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-900/30 dark:text-indigo-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing your skills and identifying gaps...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Existing Skills */}
          {result.existingSkills.length > 0 && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/20">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Your Skills ({result.existingSkills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.existingSkills.map((skill, idx) => (
                  <Badge key={idx} className="border-green-300 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-green-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Critical Gaps */}
          {result.criticalGaps.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
              <div className="mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Critical Gaps - Learn These First ({result.criticalGaps.length})
                </h3>
              </div>
              <div className="space-y-4">
                {result.criticalGaps.map((gap, idx) => (
                  <div key={idx} className="rounded-xl border border-red-300 bg-white p-4 dark:border-red-800 dark:bg-slate-900/40">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">{gap.skill}</div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{gap.reason}</p>
                      </div>
                      <Badge className={getPriorityColor(gap.priority)}>Critical</Badge>
                    </div>
                    {gap.resources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {gap.resources.map((resource, ridx) => (
                          <a
                            key={ridx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            {resource.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Gaps */}
          {result.importantGaps.length > 0 && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-900/20">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Important Skills to Add ({result.importantGaps.length})
                </h3>
              </div>
              <div className="space-y-4">
                {result.importantGaps.map((gap, idx) => (
                  <div key={idx} className="rounded-xl border border-yellow-300 bg-white p-4 dark:border-yellow-800 dark:bg-slate-900/40">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">{gap.skill}</div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{gap.reason}</p>
                      </div>
                      <Badge className={getPriorityColor(gap.priority)}>Important</Badge>
                    </div>
                    {gap.resources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {gap.resources.map((resource, ridx) => (
                          <a
                            key={ridx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            {resource.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nice to Have Gaps */}
          {result.niceToHaveGaps.length > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Nice to Have ({result.niceToHaveGaps.length})
                </h3>
              </div>
              <div className="space-y-4">
                {result.niceToHaveGaps.map((gap, idx) => (
                  <div key={idx} className="rounded-xl border border-blue-300 bg-white p-4 dark:border-blue-800 dark:bg-slate-900/40">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">{gap.skill}</div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{gap.reason}</p>
                      </div>
                      <Badge className={getPriorityColor(gap.priority)}>Nice to Have</Badge>
                    </div>
                    {gap.resources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {gap.resources.map((resource, ridx) => (
                          <a
                            key={ridx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            {resource.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
