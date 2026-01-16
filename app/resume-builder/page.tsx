"use client"

import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CareerBuilderProvider } from "@/lib/career-builder-context"
import ResumeBuilderTab from "@/components/career-builder/ResumeBuilderTab"
import CoverLetterTab from "@/components/career-builder/CoverLetterTab"
import ATSCheckerTab from "@/components/career-builder/ATSCheckerTab"
import SkillsGapTab from "@/components/career-builder/SkillsGapTab"

export default function CareerBuilderPage() {
  return (
    <CareerBuilderProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm text-slate-500 w-full">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse text-indigo-500" />
                <span className="animate-in fade-in delay-150 duration-500">Powered by Anthropic + OpenAI</span>
                <div className="hidden sm:inline-flex items-center ml-auto text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                  <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                  <Link
                    href="https://pranavkuchibhotla.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit Pranav's portfolio"
                    className="hover:text-slate-700 dark:hover:text-slate-200 hover:underline transition-colors"
                  >
                    Built by Pranav
                  </Link>
                </div>
              </div>
              <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Career Builder
              </h1>
              <p className="mt-2 sm:mt-3 animate-in fade-in slide-in-from-bottom-2 text-base sm:text-lg font-medium text-slate-600 delay-300 duration-700 dark:text-slate-300">
                AI-powered tools to help you land your dream tech job
              </p>
            </div>
            <Link
              href="/"
              className="group inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-indigo-600 transition-all hover:from-indigo-500/20 hover:to-purple-500/20 hover:shadow-lg dark:text-indigo-400"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:-translate-x-1" />
              Back to TechCareers
            </Link>
          </div>

          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 delay-500 duration-700">
            <Tabs defaultValue="resume" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 p-2 shadow-inner dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
                <TabsTrigger
                  value="resume"
                  className="rounded-xl py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/50 dark:data-[state=active]:shadow-indigo-500/30"
                >
                  Resume Builder
                </TabsTrigger>
                <TabsTrigger
                  value="cover-letter"
                  className="rounded-xl py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/50 dark:data-[state=active]:shadow-indigo-500/30"
                >
                  Cover Letter
                </TabsTrigger>
                <TabsTrigger
                  value="ats-checker"
                  className="rounded-xl py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/50 dark:data-[state=active]:shadow-indigo-500/30"
                >
                  ATS Checker
                </TabsTrigger>
                <TabsTrigger
                  value="skills-gap"
                  className="rounded-xl py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/50 dark:data-[state=active]:shadow-indigo-500/30"
                >
                  Skills Gap
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-4 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/80 p-4 sm:p-6 md:p-8 shadow-xl shadow-indigo-100 backdrop-blur delay-700 duration-700 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
                <TabsContent value="resume" className="mt-0">
                  <ResumeBuilderTab />
                </TabsContent>
                <TabsContent value="cover-letter" className="mt-0">
                  <CoverLetterTab />
                </TabsContent>
                <TabsContent value="ats-checker" className="mt-0">
                  <ATSCheckerTab />
                </TabsContent>
                <TabsContent value="skills-gap" className="mt-0">
                  <SkillsGapTab />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="mt-6 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 shadow-lg delay-1000 duration-700 dark:border-blue-900 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h3 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-base sm:text-lg font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
              How to Use Career Builder
            </h3>
            <div className="mt-3 sm:mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group rounded-xl border border-indigo-100 bg-white/50 p-4 transition-all hover:scale-[1.02] hover:border-indigo-300 hover:shadow-md dark:border-indigo-900/50 dark:bg-slate-800/50">
                <div className="font-semibold text-indigo-600 dark:text-indigo-400">1. Resume Builder</div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Tailor your resume to any job posting with AI-powered optimization
                </p>
              </div>
              <div className="group rounded-xl border border-purple-100 bg-white/50 p-4 transition-all hover:scale-[1.02] hover:border-purple-300 hover:shadow-md dark:border-purple-900/50 dark:bg-slate-800/50">
                <div className="font-semibold text-purple-600 dark:text-purple-400">2. Cover Letter</div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Generate personalized cover letters that highlight your relevant achievements
                </p>
              </div>
              <div className="group rounded-xl border border-pink-100 bg-white/50 p-4 transition-all hover:scale-[1.02] hover:border-pink-300 hover:shadow-md dark:border-pink-900/50 dark:bg-slate-800/50">
                <div className="font-semibold text-pink-600 dark:text-pink-400">3. ATS Checker</div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Check how well your resume matches job requirements and get improvement suggestions
                </p>
              </div>
              <div className="group rounded-xl border border-blue-100 bg-white/50 p-4 transition-all hover:scale-[1.02] hover:border-blue-300 hover:shadow-md dark:border-blue-900/50 dark:bg-slate-800/50">
                <div className="font-semibold text-blue-600 dark:text-blue-400">4. Skills Gap</div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Identify missing skills for your target roles and get learning resources
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CareerBuilderProvider>
  )
}
