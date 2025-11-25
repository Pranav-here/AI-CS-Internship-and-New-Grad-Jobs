"use client"

import { ArrowLeft, Download, FileText, Loader2, Sparkles, FileCode } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCareerBuilder } from "@/lib/career-builder-context"

const LIMITS = {
  jobDescription: 15000,
  expandedResume: 50000,
  targetRole: 120,
  uploadBytes: 5 * 1024 * 1024, // 5MB
}
const SUPPORTED_UPLOAD_TYPES = [".txt", ".docx", ".pdf"]
const SUPPORTED_MIME_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const EMPTY_OPTION_VALUE = "none"

type OutputFormat = "docx" | "text" | "latex"

const OUTPUT_FORMAT_OPTIONS: { value: OutputFormat; label: string; helper: string }[] = [
  { value: "docx", label: "Word (.docx)", helper: "Best for quick editing and sharing." },
  { value: "text", label: "Plain text", helper: "ATS-safe text for online portals or copy/paste." },
  { value: "latex", label: "LaTeX (.tex)", helper: "Compilable LaTeX source if you maintain your own template." },
]

type DownloadFile = {
  base64: string
  mimeType: string
  fileName: string
}

const friendlyMessage =
  "Something went wrong while generating your resume. Please verify your inputs and try again in a moment."

const base64ToBlob = (base64: string, type: string) => {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type })
}

export default function ResumeBuilderTab() {
  const { jobDescription, setJobDescription, expandedResume, setExpandedResume, targetRole, setTargetRole } =
    useCareerBuilder()

  const [seniority, setSeniority] = useState(EMPTY_OPTION_VALUE)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("text")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewText, setPreviewText] = useState("")
  const [downloadFile, setDownloadFile] = useState<DownloadFile | null>(null)
  const [resultFormat, setResultFormat] = useState<OutputFormat>("text")
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

      const truncated =
        normalized.length > LIMITS.expandedResume ? normalized.slice(0, LIMITS.expandedResume) : normalized

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

    const trimmedTargetRole = targetRole.trim()
    const seniorityValue = seniority === EMPTY_OPTION_VALUE ? undefined : seniority

    if (!jobDescription.trim() || !expandedResume.trim()) {
      setError("Please provide both the job posting and your expanded resume.")
      return
    }

    if (trimmedTargetRole.length > LIMITS.targetRole) {
      setError(`Target role should be under ${LIMITS.targetRole} characters.`)
      return
    }

    if (jobDescription.length > LIMITS.jobDescription || expandedResume.length > LIMITS.expandedResume) {
      setError(
        `The job posting must be under ${LIMITS.jobDescription.toLocaleString()} characters and the expanded resume must stay under ${LIMITS.expandedResume.toLocaleString()} characters.`
      )
      return
    }

    setLoading(true)
    setPreviewText("")
    setDownloadFile(null)
    setCopied(false)
    setResultFormat(outputFormat)

    try {
      const response = await fetch("/api/ai-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription,
          expandedResume: expandedResume,
          targetRole: trimmedTargetRole || undefined,
          seniority: seniorityValue,
          outputFormat: outputFormat,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || friendlyMessage)
      }

      const preview = data.previewText as string | undefined
      const downloadBase64 = data.downloadBase64 as string | undefined
      const downloadFileName = data.downloadFileName as string | undefined
      const downloadMimeType = data.downloadMimeType as string | undefined
      const formatFromResponse = OUTPUT_FORMAT_OPTIONS.find((option) => option.value === data.outputFormat)?.value

      if (!preview) {
        throw new Error("We could not generate the resume text. Please try again.")
      }

      if (!downloadBase64 || !downloadFileName || !downloadMimeType) {
        throw new Error("We could not prepare the download. Please try again.")
      }

      setPreviewText(preview)
      setDownloadFile({
        base64: downloadBase64,
        fileName: downloadFileName,
        mimeType: downloadMimeType,
      })
      setResultFormat(formatFromResponse ?? outputFormat)
    } catch (err) {
      const message = err instanceof Error ? err.message : friendlyMessage
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!downloadFile) return
    const blob = base64ToBlob(downloadFile.base64, downloadFile.mimeType)
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = downloadFile.fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    if (!previewText) return
    try {
      await navigator.clipboard.writeText(previewText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Unable to copy to clipboard. Please copy manually.")
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
            className="mt-3 min-h-[220px] resize-y rounded-2xl border-slate-200 bg-white/80 text-slate-800 shadow-inner focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />
          <p className="mt-2 text-sm text-slate-500">
            {jobDescription.length} / {LIMITS.jobDescription.toLocaleString()} characters
          </p>
        </div>

        <div>
          <Label htmlFor="expandedResume" className="text-base font-semibold text-slate-900 dark:text-white">
            Expanded Resume
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
            id="expandedResume"
            placeholder="Paste your master resume or experience dump..."
            className="mt-3 min-h-[260px] resize-y rounded-2xl border-slate-200 bg-white/80 text-slate-800 shadow-inner focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
            value={expandedResume}
            onChange={(event) => setExpandedResume(event.target.value)}
          />
          <p className="mt-2 text-sm text-slate-500">
            {expandedResume.length} / {LIMITS.expandedResume.toLocaleString()} characters
          </p>
        </div>

        <div>
          <Label className="text-base font-semibold text-slate-900 dark:text-white">Output format</Label>
          <RadioGroup value={outputFormat} onValueChange={(value) => setOutputFormat(value as OutputFormat)} className="mt-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {OUTPUT_FORMAT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`format-${option.value}`}
                  className={`group relative flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition ${
                    outputFormat === option.value
                      ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40"
                      : "border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={option.value} id={`format-${option.value}`} className="mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {option.value === "docx" && <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        {option.value === "text" && <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />}
                        {option.value === "latex" && <FileCode className="h-4 w-4 text-green-600 dark:text-green-400" />}
                        <span className={`font-semibold ${outputFormat === option.value ? "text-indigo-900 dark:text-indigo-100" : "text-slate-900 dark:text-white"}`}>
                          {option.label}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${outputFormat === option.value ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"}`}>
                        {option.helper}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            We run Anthropic for focused tailoring, then OpenAI for grammar polish. We keep only the most relevant,
            STAR-framed bullets to beat ATS. No data is stored after the request completes.
          </p>
          <Button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-300 transition hover:scale-[1.01] hover:shadow-indigo-400 focus-visible:ring-indigo-500 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating your resume...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Tailored Resume
              </>
            )}
          </Button>
        </div>
      </form>

      {loading && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-900/30 dark:text-indigo-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          Drafting with Anthropic and polishing with OpenAI. Hang tight!
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {previewText && (
        <div className="mt-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Tailored Resume Preview</h2>
              <p className="text-sm text-slate-500">
                Review the AI output below. You can still tweak wording before sending applications.
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                Format: {resultFormat === "docx" ? "Word (.docx)" : resultFormat === "latex" ? "LaTeX (.tex)" : "Plain text"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {downloadFile && (
                <Button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-white shadow-lg transition hover:bg-blue-700 focus-visible:ring-blue-500"
                >
                  <Download className="h-4 w-4" />
                  Download {resultFormat === "docx" ? "Word" : resultFormat === "latex" ? "LaTeX" : "Plain Text"}
                </Button>
              )}
              <Button
                type="button"
                onClick={handleCopy}
                disabled={!previewText}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-white shadow-lg transition hover:bg-slate-900 focus-visible:ring-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-70"
              >
                {copied ? "Copied!" : "Copy Output"}
              </Button>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-slate-800 shadow-inner dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed">{previewText}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
