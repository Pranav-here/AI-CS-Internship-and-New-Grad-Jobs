"use client"

import { useState } from "react"
import { Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

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

interface SearchFilters {
  keyword: string
  location: string
  jobTypes: string[]
  locationMode: string
  maxResults: number
  sortBy: string
}

interface EmailDigestProps {
  jobs: Job[]
  searchFilters: SearchFilters
}

export function EmailDigest({ jobs, searchFilters }: EmailDigestProps) {
  const [enableDigest, setEnableDigest] = useState(false)
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSendDigest = async () => {
    if (!email || !validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    if (jobs.length === 0) {
      toast({
        title: "No Jobs to Send",
        description: "Please search for jobs first before sending a digest.",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/send-email-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          jobs: jobs.slice(0, 10), // Send top 10 jobs
          preferences: searchFilters,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      toast({
        title: "Email Sent!",
        description: `Job digest sent to ${email} with ${Math.min(jobs.length, 10)} opportunities.`,
      })
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send email digest. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="mb-8 border-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Email Digest
        </CardTitle>
        <CardDescription>Get search results delivered to your inbox</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-digest"
            checked={enableDigest}
            onCheckedChange={(checked) => setEnableDigest(checked as boolean)}
          />
          <Label htmlFor="enable-digest">Send search results to email</Label>
        </div>

        {enableDigest && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <Label htmlFor="digest-email">Email Address</Label>
              <Input
                id="digest-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleSendDigest}
              disabled={sending || !email}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Digest
                </>
              )}
            </Button>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              📧 We'll send you the top {Math.min(jobs.length || 10, 10)} job opportunities from your search results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
