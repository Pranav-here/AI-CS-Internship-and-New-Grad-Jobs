import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Force Node.js runtime for nodemailer
export const runtime = "nodejs"

type RemoteStatus = "remote" | "onsite" | "hybrid"

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
  "Remote Job": RemoteStatus
}

interface EmailRequest {
  email: string
  jobs: Job[]
  preferences: any
}

type RateBucket = { count: number; resetAt: number }
const RATE_LIMIT = { windowMs: 60 * 60 * 1000, maxPerEmail: 5, maxPerIp: 8 }
const rateByEmail = new Map<string, RateBucket>()
const rateByIp = new Map<string, RateBucket>()

export async function POST(request: NextRequest) {
  try {
    const { email, jobs, preferences }: EmailRequest = await request.json()
    const clientIp =
      request.ip ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const sessionToken = request.headers.get("x-session-token")

    // lightweight session gating to reduce abuse
    if (!sessionToken) {
      return NextResponse.json({ error: "Missing session token" }, { status: 401 })
    }

    // Validate input
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ error: "No jobs to send" }, { status: 400 })
    }

    // rate limiting
    if (isRateLimited(rateByEmail, email, RATE_LIMIT.maxPerEmail, RATE_LIMIT.windowMs)) {
      return NextResponse.json({ error: "Too many requests for this email. Try again later." }, { status: 429 })
    }
    if (isRateLimited(rateByIp, clientIp, RATE_LIMIT.maxPerIp, RATE_LIMIT.windowMs)) {
      return NextResponse.json({ error: "Too many requests from this IP. Try again later." }, { status: 429 })
    }

    const htmlContent = generateEmailHTML(jobs, preferences)

    const sentVia = await sendEmail({ email, htmlContent, jobs })

    bumpUsage(rateByEmail, email, RATE_LIMIT.windowMs)
    bumpUsage(rateByIp, clientIp, RATE_LIMIT.windowMs)

    console.info("Digest sent", { email, sentVia, jobCount: jobs.length, ip: clientIp })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function isRateLimited(store: Map<string, RateBucket>, key: string, max: number, windowMs: number) {
  const bucket = store.get(key)
  const now = Date.now()
  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 0, resetAt: now + windowMs })
    return false
  }
  return bucket.count >= max
}

function bumpUsage(store: Map<string, RateBucket>, key: string, windowMs: number) {
  const now = Date.now()
  const bucket = store.get(key)
  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return
  }
  bucket.count += 1
  store.set(key, bucket)
}

async function sendEmail({ email, htmlContent, jobs }: { email: string; htmlContent: string; jobs: Job[] }) {
  const resendKey = process.env.RESEND_API_KEY
  const gmailEmail = process.env.GMAIL_EMAIL
  const gmailPassword = process.env.GMAIL_APP_PASSWORD

  // Prefer transactional provider if configured
  if (resendKey) {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "jobs@techcareers.ai",
        to: [email],
        subject: `Daily Job Digest - ${jobs.length} new opportunities`,
        html: htmlContent,
      }),
    })

    if (!resp.ok) {
      const msg = await resp.text().catch(() => resp.statusText)
      console.warn("Resend failed, falling back to Gmail", msg)
    } else {
      return "resend"
    }
  }

  if (!gmailEmail || !gmailPassword) {
    throw new Error("Email service not configured")
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailEmail,
      pass: gmailPassword,
    },
  })

  await transporter.sendMail({
    from: gmailEmail,
    to: email,
    subject: `Daily Job Digest - ${jobs.length} New Opportunities`,
    html: htmlContent,
  })

  return "gmail"
}

function generateEmailHTML(jobs: Job[], preferences: any): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Job Digest</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background-color: #f8fafc;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 12px; 
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
                background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: 700; 
            }
            .header p { 
                margin: 10px 0 0 0; 
                opacity: 0.9; 
                font-size: 16px; 
            }
            .content { 
                padding: 20px; 
            }
            .job-card { 
                border: 1px solid #e2e8f0; 
                margin: 15px 0; 
                padding: 20px; 
                border-radius: 8px; 
                background: #fafafa;
            }
            .job-title { 
                font-weight: 600; 
                font-size: 18px; 
                color: #1e293b; 
                margin-bottom: 8px; 
            }
            .company { 
                color: #64748b; 
                margin-bottom: 8px; 
                font-size: 14px;
            }
            .location { 
                color: #64748b; 
                font-style: italic; 
                margin-bottom: 12px;
                font-size: 14px;
            }
            .description { 
                color: #475569; 
                margin: 12px 0; 
                line-height: 1.5;
                font-size: 14px;
            }
            .apply-btn { 
                background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
                color: white; 
                padding: 12px 24px; 
                text-decoration: none; 
                border-radius: 6px; 
                display: inline-block; 
                margin-top: 12px;
                font-weight: 500;
            }
            .badge { 
                background: #dcfce7; 
                color: #166534; 
                padding: 4px 8px; 
                border-radius: 4px; 
                font-size: 12px; 
                margin-right: 8px;
                display: inline-block;
                margin-bottom: 8px;
            }
            .footer { 
                text-align: center; 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #e2e8f0; 
                color: #64748b;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1> Your Daily Job Digest</h1>
                <p>Found ${jobs.length} new opportunities matching your preferences</p>
                <p>${currentDate}</p>
            </div>
            
            <div class="content">
                ${jobs
                  .slice(0, 10)
                  .map(
                    (job) => `
                    <div class="job-card">
                        <div class="job-title">${job["Job Title"]}</div>
                        <div class="company"> ${job.Company}</div>
                        <div class="location"> ${job.Location}</div>
                        ${["remote","hybrid"].includes(job["Remote Job"]) ? '<span class="badge">Remote Position</span>' : ""}
                        ${
                          job.Description && job.Description !== "No description available"
                            ? `<div class="description">${job.Description.substring(0, 200)}...</div>`
                            : ""
                        }
                        <a href="${job["Apply Link"]}" class="apply-btn">Apply Now</a>
                    </div>
                `,
                  )
                  .join("")}
                
                <div class="footer">
                    <p>This digest was generated by AI/CS Entry-Level & Internship Finder</p>
                    <p>Search preferences: ${preferences.keyword} | ${preferences.jobTypes.join(", ")}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}

