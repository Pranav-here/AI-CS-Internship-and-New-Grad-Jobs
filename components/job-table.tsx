"use client"

import { useState } from "react"
import { ExternalLink, Download, Bookmark, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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

interface JobTableProps {
  jobs: Job[]
  onSave: (job: Job) => void
  savedJobs: Job[]
}

export function JobTable({ jobs, onSave, savedJobs }: JobTableProps) {
  const [selectedJobs, setSelectedJobs] = useState<number[]>([])

  const isJobSaved = (job: Job) =>
    savedJobs.some(
      (s) => s["Job Title"] === job["Job Title"] && s.Company === job.Company,
    )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(jobs.map((_, index) => index))
    } else {
      setSelectedJobs([])
    }
  }

  const handleSelectJob = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedJobs((prev) => [...prev, index])
    } else {
      setSelectedJobs((prev) => prev.filter((i) => i !== index))
    }
  }

  const handleBatchApply = () => {
    selectedJobs.forEach((index) => {
      const job = jobs[index]
      if (job["Apply Link"]) {
        window.open(job["Apply Link"], "_blank")
      }
    })
  }

  const handleBatchSave = () => {
    selectedJobs.forEach((index) => {
      const job = jobs[index]
      if (!isJobSaved(job)) {
        onSave(job)
      }
    })
    setSelectedJobs([])
  }

  const handleExportSelected = () => {
    const selectedJobsData = selectedJobs.map((index) => jobs[index])
    const csv = convertToCSV(selectedJobsData)
    downloadCSV(csv, "selected_jobs.csv")
  }

  return (
    <div className="space-y-4">
      {/* Batch Actions */}
      {selectedJobs.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200/60 dark:border-blue-800/40 shadow-sm">
          <span className="font-medium">
            {selectedJobs.length} job{selectedJobs.length !== 1 && "s"} selected
          </span>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleBatchApply}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open&nbsp;Links
            </Button>

            <Button size="sm" variant="outline" onClick={handleBatchSave}>
              <Bookmark className="w-4 h-4 mr-2" />
              Save&nbsp;All
            </Button>

            <Button size="sm" variant="outline" onClick={handleExportSelected}>
              <Download className="w-4 h-4 mr-2" />
              Export&nbsp;CSV
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-gray-50 dark:bg-gray-700/40">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={selectedJobs.length === jobs.length && jobs.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-center">Remote</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {jobs.map((job, index) => {
              const isRemote =
                job["Remote Job"] === "remote" ||
                job["Remote Job"] === "hybrid" ||
                job.Location?.toLowerCase().includes("remote")

              const tags = job.Tags
                ? job.Tags.split(",").map((t) => t.trim()).slice(0, 2)
                : []

              return (
                <TableRow
                  key={index}
                  className="
                    hover:bg-gray-50 dark:hover:bg-gray-700/50
                    transition-colors
                  "
                >
                  {/* Select */}
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedJobs.includes(index)}
                      onCheckedChange={(c) =>
                        handleSelectJob(index, c as boolean)
                      }
                    />
                  </TableCell>

                  {/* Job title */}
                  <TableCell className="font-medium max-w-xs">
                    <span className="truncate block" title={job["Job Title"]}>
                      {job["Job Title"]}
                    </span>
                  </TableCell>

                  {/* Company */}
                  <TableCell className="max-w-xs">
                    <span className="truncate block" title={job.Company}>
                      {job.Company}
                    </span>
                  </TableCell>

                  {/* Location */}
                  <TableCell className="max-w-xs">
                    <span className="truncate block" title={job.Location}>
                      {job.Location}
                    </span>
                  </TableCell>

                  {/* Remote badge */}
                  <TableCell className="text-center">
                    {isRemote && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        Remote
                      </Badge>
                    )}
                  </TableCell>

                  {/* Tags */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button size="sm" asChild>
                        <a
                          href={job["Apply Link"]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Apply
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSave(job)}
                        disabled={isJobSaved(job)}
                      >
                        {isJobSaved(job) ? "Saved" : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        title={`Google "${job.Company}" reviews and info`}
                      >
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(job.Company + " reviews careers")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Search className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  )
}

// Utility functions
function convertToCSV(jobs: any[]): string {
  if (jobs.length === 0) return ""

  const headers = Object.keys(jobs[0])
  const csvContent = [
    headers.join(","),
    ...jobs.map((job) => headers.map((header) => `"${job[header] || ""}"`).join(",")),
  ].join("\n")

  return csvContent
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

