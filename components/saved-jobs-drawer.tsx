"use client"

import { ExternalLink, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

interface SavedJobsDrawerProps {
  isOpen: boolean
  onClose: () => void
  savedJobs: Job[]
  onRemove: (index: number) => void
}

export function SavedJobsDrawer({ isOpen, onClose, savedJobs, onRemove }: SavedJobsDrawerProps) {
  const handleExportAll = () => {
    const csv = convertToCSV(savedJobs)
    downloadCSV(csv, "saved_jobs.csv")
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Saved Jobs ({savedJobs.length})
            {savedJobs.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleExportAll}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>Your saved job opportunities</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {savedJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">No saved jobs yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Save jobs while browsing to keep track of opportunities
              </p>
            </div>
          ) : (
            savedJobs.map((job, index) => {
              const isRemote = job["Remote Job"] === "🏠 Remote" || job.Location?.toLowerCase().includes("remote")
              const tags = job.Tags
                ? job.Tags.split(",")
                    .map((tag) => tag.trim())
                    .slice(0, 2)
                : []

              return (
                <Card key={index} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base leading-tight mb-1">{job["Job Title"]}</CardTitle>
                        <CardDescription>
                          {job.Company} • {job.Location}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1">
                      {isRemote && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs"
                        >
                          🏠 Remote
                        </Badge>
                      )}
                      {tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" asChild className="flex-1">
                        <a
                          href={job["Apply Link"]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Apply
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
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
