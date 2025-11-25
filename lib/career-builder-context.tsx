"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface CareerBuilderContextType {
  jobDescription: string
  setJobDescription: (value: string) => void
  expandedResume: string
  setExpandedResume: (value: string) => void
  targetRole: string
  setTargetRole: (value: string) => void
  resumeFile: File | null
  setResumeFile: (file: File | null) => void
}

const CareerBuilderContext = createContext<CareerBuilderContextType | undefined>(undefined)

const STORAGE_KEY = "career-builder-data"

export function CareerBuilderProvider({ children }: { children: ReactNode }) {
  const [jobDescription, setJobDescription] = useState("")
  const [expandedResume, setExpandedResume] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.jobDescription) setJobDescription(data.jobDescription)
        if (data.expandedResume) setExpandedResume(data.expandedResume)
        if (data.targetRole) setTargetRole(data.targetRole)
      }
    } catch (error) {
      console.error("Failed to load career builder data:", error)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      const data = {
        jobDescription,
        expandedResume,
        targetRole,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save career builder data:", error)
    }
  }, [jobDescription, expandedResume, targetRole])

  return (
    <CareerBuilderContext.Provider
      value={{
        jobDescription,
        setJobDescription,
        expandedResume,
        setExpandedResume,
        targetRole,
        setTargetRole,
        resumeFile,
        setResumeFile,
      }}
    >
      {children}
    </CareerBuilderContext.Provider>
  )
}

export function useCareerBuilder() {
  const context = useContext(CareerBuilderContext)
  if (!context) {
    throw new Error("useCareerBuilder must be used within CareerBuilderProvider")
  }
  return context
}
