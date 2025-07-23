import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Force Node.js runtime for nodemailer
export const runtime = "nodejs"

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

interface EmailRequest {
  email: string
  jobs: Job[]
  preferences: any
}

export async function POST(request: NextRequest) {
  try {
    const { email, jobs, preferences }: EmailRequest = await request.json()

    // Validate input
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ error: "No jobs to send" }, { status: 400 })
    }

    // Get email credentials
    const gmailEmail = process.env.GMAIL_EMAIL
    const gmailPassword = process.env.GMAIL_APP_PASSWORD

    if (!gmailEmail || !gmailPassword) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailEmail,
        pass: gmailPassword,
      },
    })

    // Generate email HTML
    const htmlContent = generateEmailHTML(jobs, preferences)

    // Send email
    await transporter.sendMail({
      from: gmailEmail,
      to: email,
      subject: `Daily Job Digest - ${jobs.length} New Opportunities`,
      html: htmlContent,
    })

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
                <h1>🎯 Your Daily Job Digest</h1>
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
                        <div class="company">🏢 ${job.Company}</div>
                        <div class="location">📍 ${job.Location}</div>
                        ${job["Remote Job"] === "🏠 Remote" ? '<span class="badge">🏠 Remote Position</span>' : ""}
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
