import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "AI Resume Builder | TechCareers",
  description: "Tailor your resume to the job description with ATS-ready outputs.",
}

export default function ResumeBuilderLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
