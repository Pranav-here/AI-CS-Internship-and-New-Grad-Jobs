"use client"

import { ExternalLink, MapPin, Calendar, Building2, Bookmark, BookmarkCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

interface JobCardProps {
  job: Job
  onSave: () => void
  isSaved: boolean
}

export function JobCard({ job, onSave, isSaved }: JobCardProps) {
  const isRemote =
    job["Remote Job"] === "remote" ||
    job["Remote Job"] === "hybrid" ||
    job.Location?.toLowerCase().includes("remote") ||
    job["Job Title"]?.toLowerCase().includes("remote")

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
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } catch {
      return null
    }
  }

  const daysAgo = getDaysAgo(job["Posting Date"])

  return (
    <Card
      className="
        group relative overflow-hidden
        border-0 shadow-md rounded-xl
        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
        transition-transform transition-shadow duration-300
        hover:-translate-y-1 hover:shadow-2xl hover:ring-2 hover:ring-blue-500/30
      "
    >
      {/* subtle gradient glow */}
      <span
        className="
          pointer-events-none absolute inset-0
          bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
        "
      />

      <CardHeader className="relative pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">
              {job["Job Title"]}
            </CardTitle>
            <CardDescription className="flex items-center text-base font-medium">
              <Building2 className="w-4 h-4 mr-1" />
              {job.Company}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="shrink-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-blue-600" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 pt-2">
          <MapPin className="w-4 h-4 mr-1" />
          {job.Location}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {isRemote && (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
               Remote
            </Badge>
          )}
          {job["Job Title"]?.toLowerCase().includes("intern") && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Internship
            </Badge>
          )}
          {daysAgo && daysAgo <= 7 && (
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              New ({daysAgo}d ago)
            </Badge>
          )}
        </div>

        {/* Description */}
        {job.Description && job.Description !== "No description available" && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {job.Description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <Button
          asChild
          className="
            flex-1 bg-gradient-to-r from-blue-600 to-purple-600
            hover:from-blue-700 hover:to-purple-700
            focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          "
        >
          <a
            href={job["Apply Link"]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Apply&nbsp;Now
          </a>
        </Button>

        {/* Footer */}
        {job["Posting Date"] && job["Posting Date"] !== "Not available" && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 pt-3 border-t">
            <Calendar className="w-3 h-3 mr-1" />
            Posted: {job["Posting Date"]}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

