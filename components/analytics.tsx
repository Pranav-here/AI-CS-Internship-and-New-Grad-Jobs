"use client"

import { TrendingUp, Building2, MapPin, Users } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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

interface AnalyticsProps {
  jobs: Job[]
  tagStats: Record<string, number>
}

export function Analytics({ jobs, tagStats }: AnalyticsProps) {
  const totalJobs = jobs.length
  const uniqueCompanies = new Set(jobs.map((j) => j.Company)).size
  const isRemoteJob = (job: Job) =>
    job["Remote Job"] === "remote" ||
    job["Remote Job"] === "hybrid" ||
    job.Location?.toLowerCase().includes("remote") ||
    job["Job Title"]?.toLowerCase().includes("remote")
  const remoteJobs = jobs.filter(isRemoteJob).length
  const uniqueLocations = new Set(jobs.map((j) => j.Location)).size

  const topTags = Object.entries(tagStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  /* prettier-ignore */
  const cardBase =
    "group relative overflow-hidden rounded-xl border-0 shadow-sm " +
    "transition-transform transition-shadow duration-300 " +
    "hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-blue-500/30"

  return (
    <div className="mb-8 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className={`${cardBase} bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total Jobs
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {totalJobs}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${cardBase} bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Companies
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {uniqueCompanies}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${cardBase} bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Remote Jobs
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {remoteJobs}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${cardBase} bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/40`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Locations
                </p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {uniqueLocations}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tag Distribution */}
      {topTags.length > 0 && (
        <Card className="border-0 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Popular Job Categories</CardTitle>
            <CardDescription>
              Distribution of job types in your results
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 motion-safe:animate-fade-in">
            {topTags.map(([tag, count]) => {
              const pct = (count / totalJobs) * 100
              return (
                <div key={tag} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{tag}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {count} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
