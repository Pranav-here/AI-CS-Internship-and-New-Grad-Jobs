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

  // stricter: must end with dotsomething (at least 2 chars)
  const validateEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())

  async function handleSendDigest() {
    if (!validateEmail(email)) {
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
        description: "Search for jobs before sending a digest.",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    try {
      const res = await fetch("/api/send-email-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          jobs: jobs.slice(0, 10),
          preferences: searchFilters,
        }),
      })

      if (!res.ok) throw new Error()

      toast({
        title: "Email Sent",
        description: `Sent ${Math.min(jobs.length, 10)} jobs to ${email}.`,
      })

      // Show helpful hint about automated tracking
      setTimeout(() => {
        toast({
          title: "💡 Pro Tip",
          description: (
            <div className="space-y-2">
              <p>Track your applications automatically with job-email-tracker</p>
              <a
                href="https://github.com/Pranav-here/job-email-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline text-sm"
              >
                Learn more →
              </a>
            </div>
          ),
        })
      }, 2000)

      setEnableDigest(false)
      setEmail("")
    } catch {
      toast({
        title: "Email Failed",
        description: "We couldn't send the digest. Try again later.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card
      className="
        group mb-8 border-0 rounded-xl overflow-hidden
        bg-gradient-to-r from-purple-50 to-pink-50
        dark:from-purple-900/20 dark:to-pink-900/20
        hover:shadow-lg transition-shadow
      "
    >
      {/* subtle hover glow */}
      <span
        className="
          absolute inset-0 pointer-events-none
          opacity-0 group-hover:opacity-100
          bg-gradient-to-r from-purple-400/10 to-pink-400/10
          transition-opacity duration-500
        "
      />

      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Email Digest
        </CardTitle>
        <CardDescription>Get search results in your inbox</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-digest"
            checked={enableDigest}
            onCheckedChange={(c) => setEnableDigest(c as boolean)}
          />
          <Label htmlFor="enable-digest">Send search results by email</Label>
        </div>

        {enableDigest && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <Label htmlFor="digest-email">Email Address</Label>
              <Input
                id="digest-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleSendDigest}
              disabled={sending || !email}
              className="
                w-full bg-gradient-to-r from-purple-600 to-pink-600
                hover:from-purple-700 hover:to-pink-700
                focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
              "
            >
              {sending ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Digest
                </>
              )}
            </Button>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              We'll email the top {Math.min(jobs.length || 10, 10)} matching roles.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
