import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Career Builder | TechCareers",
  description: "AI-powered tools to help you land your dream tech job. Resume builder, cover letter generator, ATS checker, and skills gap analyzer.",
}

export default function ResumeBuilderLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
