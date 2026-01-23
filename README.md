# AI/CS Entry-Level & Internship Finder

**Live app:** [TechCareers](https://techcareers.vercel.app/) - Production-ready Next.js 14 + Vercel Edge

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Product Overview

TechCareers is an AI-powered job search and application workspace built for early-career talent in AI, machine learning, data, and software engineering. It aggregates live postings, auto-tags them, and gives you AI tools to tailor every application with ATS confidence.

## Why It Wins

- Real-time, deduped roles from major job boards and company career pages via JSearch
- AI workspace to tailor resumes and cover letters with ATS-readiness baked in
- Pipeline tools to save, digest, analyze, and export applications
- Polished, responsive UI built with shadcn/ui and Tailwind CSS

## Capabilities

### Job Intelligence
- Real-time listings refreshed continuously from major job boards and company career pages
- Smart filters by role type (internship, entry-level, full-time), experience level, and remote/on-site/hybrid
- Quick searches for high-demand paths like Data Science, Machine Learning Engineering, and Software Development
- Automatic tagging by tech stack and domain for faster triage

### Application Workspace
- Save and organize roles to build a personal pipeline
- Email digests delivering curated matches directly to your inbox
- Analytics dashboard visualizing market trends and application stats
- Export saved jobs to CSV for external tracking

### AI Resume Tailor
- Compares job descriptions with your master resume to surface the most relevant experience
- Generates a professionally formatted, ATS-optimized 2-page resume for each role
- Powered by Anthropic Claude for drafting and OpenAI GPT for refinement
- Downloadable `.docx` with live preview for last-mile edits

### ATS Score Checker
- 7-factor scoring model informed by real ATS systems (RChilli, Workday, Oracle Taleo) and recruiter signals
- Weighted analysis: Technical Skills (35%), Job Title Match (15%), Experience Relevance (15%), Education (10%), Location (10%), Formatting (10%), Industry Keywords (5%)
- Clear matched vs. missing keywords with actionable recommendations

### Cover Letter Generator
- Personalized cover letters aligned to the target role and company
- Three tones: Formal (traditional business), Professional (balanced), or Enthusiastic (energetic and passionate)
- Automatically incorporates your experience and adapts to company culture

### Skills Gap Navigator
- Compares your skills against role requirements and industry benchmarks
- Prioritized recommendations categorized as Critical, Important, or Nice-to-Have
- Curated learning resources for each missing skill to build a focused roadmap

### Experience
- Responsive design optimized for desktop, tablet, and mobile
- Dark/light mode with persistent theme preferences
- Modern UI built with shadcn/ui components and Tailwind CSS

## How It Works

- Search and filter live roles with smart presets
- Tailor your resume and cover letter with AI, then validate ATS readiness
- Save, export, and digest your pipeline with CSV exports and email summaries

## Technology Stack

**Frontend:** Next.js 14 (App Router), React 18, TypeScript

**Styling:** Tailwind CSS, shadcn/ui component library

**AI & APIs:** Anthropic Claude API, OpenAI API, JSearch (RapidAPI)

**Email & Documents:** Nodemailer (Gmail SMTP), docx library

**State & Storage:** React Context API, Browser Local Storage

**Deployment:** Vercel Edge Network

## Ideal Users

- Students searching for internships or co-op positions in tech
- New graduates entering the job market in AI/ML or software engineering
- Career changers transitioning into tech from adjacent fields
- Teams tailoring applications at scale and optimizing for ATS systems

## Related Tools

**After you apply, track your applications automatically.**

Check out [**job-email-tracker**](https://github.com/Pranav-here/job-email-tracker) - an AI-powered system that monitors your Gmail inbox for job-related emails and automatically syncs application data to Airtable. Never lose track of where you've applied, interview invitations, or offer letters.

- AI-powered email parsing with Claude
- Automatic status tracking (Applied → Interviewing → Offer → Rejected)
- Smart duplicate detection
- Airtable integration for centralized tracking
- Serverless deployment on Vercel

Perfect companion tool to TechCareers for end-to-end job search management.

## License

MIT License - This is open-source software free to use, modify, and distribute.

## Acknowledgments

Built with [Next.js](https://nextjs.org/). UI by [shadcn/ui](https://ui.shadcn.com/). Job data from [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch). AI by [Anthropic](https://anthropic.com/) and [OpenAI](https://openai.com/).
