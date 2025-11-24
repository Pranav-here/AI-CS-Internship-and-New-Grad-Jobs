import { Document, HeadingLevel, Packer, Paragraph } from "docx"

export const JOB_DESCRIPTION_MAX_LENGTH = 15000
export const EXPANDED_RESUME_MAX_LENGTH = 50000

const SECTION_KEYWORDS = [
  "summary",
  "skills",
  "technical skills",
  "experience",
  "professional experience",
  "projects",
  "education",
  "certifications",
  "leadership",
  "awards",
  "activities",
]

type SectionContent = {
  type: "paragraph" | "bullet"
  text: string
}

export type ResumeSection = {
  title: string
  content: SectionContent[]
}

const BULLET_REGEX = /^[\-\u2022]\s*(.+)/

const normalizeHeading = (value: string) => value.replace(/[:\-]+$/, "").trim()

const isLikelyHeading = (value: string) => {
  const normalized = normalizeHeading(value)
  if (!normalized) return false

  const lower = normalized.toLowerCase()
  if (SECTION_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return true
  }

  const letters = normalized.replace(/[^A-Za-z]/g, "")
  if (!letters) return false
  const uppercaseCount = letters.split("").filter((char) => char === char.toUpperCase()).length
  const uppercaseRatio = uppercaseCount / letters.length
  return uppercaseRatio > 0.8 && normalized.length <= 40
}

export const structureResumeText = (text: string): ResumeSection[] => {
  const lines = text.split(/\r?\n/).map((line) => line.trim())
  const sections: ResumeSection[] = []

  let currentSection: ResumeSection | null = null

  for (const line of lines) {
    if (!line) {
      continue
    }

    const bulletMatch = line.match(BULLET_REGEX)
    if (isLikelyHeading(line)) {
      const heading = normalizeHeading(line)
      currentSection = { title: heading, content: [] }
      sections.push(currentSection)
      continue
    }

    if (!currentSection) {
      currentSection = { title: "Details", content: [] }
      sections.push(currentSection)
    }

    if (bulletMatch) {
      currentSection.content.push({ type: "bullet", text: bulletMatch[1].trim() })
    } else {
      currentSection.content.push({ type: "paragraph", text: line })
    }
  }

  if (sections.length === 0) {
    return [
      {
        title: "Resume",
        content: [{ type: "paragraph", text: text.trim() }],
      },
    ]
  }

  return sections
}

export const createResumeDocx = async (resumeText: string) => {
  const sections = structureResumeText(resumeText)

  const children: Paragraph[] = []

  sections.forEach((section, sectionIndex) => {
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: sectionIndex === 0 ? 0 : 240, after: 80 },
      })
    )

    section.content.forEach((entry) => {
      if (!entry.text) return
      children.push(
        new Paragraph({
          text: entry.text,
          bullet: entry.type === "bullet" ? { level: 0 } : undefined,
          spacing: { after: entry.type === "bullet" ? 40 : 120 },
        })
      )
    })
  })

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children,
      },
    ],
  })

  const buffer = await Packer.toBuffer(document)
  return buffer
}
