"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface QuickSearchPanelProps {
  isOpen: boolean
  onToggle: () => void
  onQuickSearch: (keyword: string, jobType: string, isRemote?: boolean) => void
}

export function QuickSearchPanel({ isOpen, onToggle, onQuickSearch }: QuickSearchPanelProps) {
  const quickSearchOptions = [
    {
      category: "Data Science",
      icon: "DS",
      searches: [
        { label: "DS Intern (Fall 2025)", keyword: "data science", type: "Fall 2025 Internship" },
        { label: "Junior Data Scientist", keyword: "data scientist", type: "Entry-Level / New-Grad Full-Time" },
        { label: "Data Analyst Intern", keyword: "data analyst intern", type: "Summer 2026 Internship" },
      ],
    },
    {
      category: "Machine Learning",
      icon: "ML",
      searches: [
        { label: "ML Engineer Intern", keyword: "machine learning intern", type: "Fall 2025 Internship" },
        { label: "ML Engineer Entry", keyword: "machine learning engineer", type: "Entry-Level / New-Grad Full-Time" },
        { label: "ML Research Intern", keyword: "machine learning research intern", type: "Spring 2026 Internship" },
      ],
    },
    {
      category: "Software Engineering",
      icon: "SE",
      searches: [
        { label: "Entry Software Engineer", keyword: "software engineer", type: "Entry-Level / New-Grad Full-Time" },
        { label: "Frontend Intern", keyword: "frontend developer intern", type: "Summer 2026 Internship" },
        { label: "Backend Engineer", keyword: "backend engineer", type: "Entry-Level / New-Grad Full-Time" },
      ],
    },
    {
      category: "AI & NLP",
      icon: "AI",
      searches: [
        { label: "AI Research Intern", keyword: "artificial intelligence intern", type: "Fall 2025 Internship" },
        { label: "NLP Engineer Intern", keyword: "natural language processing intern", type: "Summer 2026 Internship" },
        { label: "AI Researcher", keyword: "AI researcher", type: "Entry-Level / New-Grad Full-Time" },
      ],
    },
    {
      category: "Full-Stack & BI",
      icon: "FS",
      searches: [
        { label: "Full-Stack Entry", keyword: "full stack developer", type: "Entry-Level / New-Grad Full-Time" },
        { label: "BI Intern", keyword: "business intelligence intern", type: "Fall 2025 Internship" },
        { label: "Data Engineer Entry", keyword: "data engineer", type: "Entry-Level / New-Grad Full-Time" },
      ],
    },
  ]

  const remoteSearches = [
    { label: "Remote SWE Intern", keyword: "software engineer", type: "Spring 2026 Internship", remote: true },
    {
      label: "Remote Data Science",
      keyword: "data science",
      type: "Entry-Level / New-Grad Full-Time",
      remote: true,
    },
    {
      label: "Remote ML Engineer",
      keyword: "machine learning",
      type: "Entry-Level / New-Grad Full-Time",
      remote: true,
    },
    {
      label: "Remote Python Dev",
      keyword: "python developer",
      type: "Entry-Level / New-Grad Full-Time",
      remote: true,
    },
    { label: "Remote DevOps", keyword: "devops engineer", type: "Entry-Level / New-Grad Full-Time", remote: true },
  ]

  return (
    <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center"> Quick Search Options</CardTitle>
                <CardDescription>Click any button below to instantly search for popular job types</CardDescription>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Category Searches */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {quickSearchOptions.map((category) => (
                <div key={category.category} className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    {category.category}
                  </h4>
                  <div className="space-y-2">
                    {category.searches.map((search) => (
                      <Button
                        key={search.label}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs h-8 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-transparent"
                        onClick={() => onQuickSearch(search.keyword, search.type)}
                      >
                        {search.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Remote Searches */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Remote & Popular Searches</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {remoteSearches.map((search) => (
                  <Button
                    key={search.label}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs h-8 hover:bg-green-50 dark:hover:bg-green-900/20 bg-transparent"
                    onClick={() => onQuickSearch(search.keyword, search.type, search.remote)}
                  >
                    {search.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Tip:</strong> Click any button above to auto-fill the search form below, then click "Search
                Jobs" to find opportunities!
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

