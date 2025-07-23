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
    job["Remote Job"] === "🏠 Remote" ||
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
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  const daysAgo = getDaysAgo(job["Posting Date"])

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors">
              {job["Job Title"]}
            </CardTitle>
            <CardDescription className="flex items-center text-base font-medium">
              <Building2 className="w-4 h-4 mr-1" />
              {job.Company}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onSave} className="shrink-0">
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-blue-600" /> : <Bookmark className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 mr-1" />
          {job.Location}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {isRemote && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              🏠 Remote
            </Badge>
          )}
          {job["Job Title"]?.toLowerCase().includes("intern") && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Internship
            </Badge>
          )}
          {daysAgo && daysAgo <= 7 && (
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
            >
              New ({daysAgo}d ago)
            </Badge>
          )}
        </div>

        {/* Description */}
        {job.Description && job.Description !== "No description available" && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{job.Description}</p>
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
        <div className="flex gap-2 pt-2">
          <Button
            asChild
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <a
              href={job["Apply Link"]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Apply Now
            </a>
          </Button>
        </div>

        {/* Footer */}
        {job["Posting Date"] && job["Posting Date"] !== "Not available" && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
            <Calendar className="w-3 h-3 mr-1" />
            Posted: {job["Posting Date"]}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
