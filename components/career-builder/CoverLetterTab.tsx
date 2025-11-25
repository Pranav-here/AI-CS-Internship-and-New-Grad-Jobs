"use client"

import { Download, Loader2, Sparkles, Copy, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCareerBuilder } from "@/lib/career-builder-context"

const LIMITS = {
  jobDescription: 15000,
  resume: 50000,
  targetRole: 120,
  uploadBytes: 5 * 1024 * 1024, // 5MB
}

const SUPPORTED_UPLOAD_TYPES = [".txt", ".docx", ".pdf"]
const SUPPORTED_MIME_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

type CoverLetterStyle = "formal" | "professional" | "enthusiastic"

const STYLE_OPTIONS: { value: CoverLetterStyle; label: string; description: string }[] = [
  { value: "formal", label: "Formal", description: "Traditional business tone, very professional" },
  { value: "professional", label: "Professional", description: "Balanced formality with warmth" },
  { value: "enthusiastic", label: "Enthusiastic", description: "Show excitement while staying professional" },
]

export default function CoverLetterTab() {
  const { jobDescription, setJobDescription, expandedResume, setExpandedResume, targetRole, setTargetRole } =
    useCareerBuilder()

  const [style, setStyle] = useState<CoverLetterStyle>("professional")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [copied, setCopied] = useState(false)

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

      if (file.type && !SUPPORTED_MIME_TYPES.includes(file.type) && extension !== ".pdf") {
        throw new Error("Unsupported file type. Please use .txt, .docx, or .pdf.")
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
      const message = err instanceof Error ? err.message : "Unable to read that file. Please try another format."
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!jobDescription.trim() || !expandedResume.trim()) {
      setError("Please provide both the job posting and your resume.")
      return
    }

    if (jobDescription.length > LIMITS.jobDescription || expandedResume.length > LIMITS.resume) {
      setError(
        `The job posting must be under ${LIMITS.jobDescription.toLocaleString()} characters and the resume must stay under ${LIMITS.resume.toLocaleString()} characters.`
      )
      return
    }

    setLoading(true)
    setCoverLetter("")
    setCopied(false)

    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resume: expandedResume,
          targetRole: targetRole || undefined,
          style,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong while generating your cover letter.")
      }

      setCoverLetter(data.coverLetter)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!coverLetter) return
    try {
      await navigator.clipboard.writeText(coverLetter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Unable to copy to clipboard. Please copy manually.")
    }
  }

  const handleDownload = (format: "txt" | "docx") => {
    if (!coverLetter) return

    if (format === "txt") {
      const blob = new Blob([coverLetter], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "Cover_Letter.txt"
      link.click()
      URL.revokeObjectURL(url)
    } else {
      // For docx, we'd need to implement document generation
      // For now, just download as txt
      const blob = new Blob([coverLetter], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "Cover_Letter.txt"
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-8">
      <form className="space-y-8" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="jobDescription" className="text-base font-semibold text-slate-900 dark:text-white">
            Job Posting
          </Label>
          <Textarea
            id="jobDescription"
            required
            placeholder="Paste the full job description..."
            className="mt-3 min-h-[180px] resize-y rounded-2xl border-slate-200 bg-white/80 text-slate-800 shadow-inner focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
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
              className="block w-full max-w-xs cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
              onChange={(event) => handleUpload(event.target.files?.[0] ?? null)}
              disabled={uploading}
            />
            {uploading && (
              <span className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Reading file...
              </span>
            )}
            {!uploading && (
              <span className="text-sm text-slate-500 dark:text-slate-400">Upload .txt, .docx, or .pdf to auto-fill</span>
            )}
          </div>
          <Textarea
            id="resume"
            placeholder="Paste your resume or experience..."
            className="mt-3 min-h-[200px] resize-y rounded-2xl border-slate-200 bg-white/80 text-slate-800 shadow-inner focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
            value={expandedResume}
            onChange={(event) => setExpandedResume(event.target.value)}
          />
          <p className="mt-2 text-sm text-slate-500">
            {expandedResume.length} / {LIMITS.resume.toLocaleString()} characters
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="targetRole" className="text-base font-semibold text-slate-900 dark:text-white">
              Target Role (Optional)
            </Label>
            <Textarea
              id="targetRole"
              placeholder="e.g., Machine Learning Engineer"
              className="mt-3 min-h-[60px] resize-y rounded-2xl border-slate-200 bg-white/80 text-slate-800 shadow-inner focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
            />
          </div>

          <div>
            <Label className="text-base font-semibold text-slate-900 dark:text-white">Cover Letter Style</Label>
            <Select value={style} onValueChange={(value) => setStyle(value as CoverLetterStyle)}>
              <SelectTrigger className="mt-3 rounded-2xl border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
                <SelectValue placeholder="Choose a style" />
              </SelectTrigger>
              <SelectContent>
                {STYLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            We use Anthropic Claude to generate personalized, ATS-friendly cover letters that highlight your most
            relevant achievements.
          </p>
          <Button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-300 transition hover:scale-[1.01] hover:shadow-indigo-400 focus-visible:ring-indigo-500 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Cover Letter
              </>
            )}
          </Button>
        </div>
      </form>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-900/30 dark:text-indigo-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          Crafting your personalized cover letter...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {coverLetter && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Your Cover Letter</h2>
              <p className="text-sm text-slate-500">Review and edit as needed before sending</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => handleDownload("txt")}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-white shadow-lg transition hover:bg-blue-700 focus-visible:ring-blue-500"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                type="button"
                onClick={handleCopy}
                disabled={!coverLetter}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-white shadow-lg transition hover:bg-slate-900 focus-visible:ring-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-70"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-slate-800 shadow-inner dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{coverLetter}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
