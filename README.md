# AI/CS Entry-Level & Internship Finder

**[Live Application →](https://techcareers.vercel.app/)**

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

A production web application designed to streamline the job search process for students and new graduates pursuing careers in AI, Machine Learning, Data Science, and Software Engineering. The platform aggregates real-time job listings and provides AI-powered career tools to help candidates find, organize, and apply to opportunities that match their skills and career goals. From tailored resume generation to ATS optimization, cover letter writing, and skills gap analysis—everything you need to land your dream tech role.

## What It Does

**AI/CS Entry-Level & Internship Finder** combines job search, application management, and AI-powered career tools into a single platform:

### Job Discovery & Search
- **Real-time listings** from major job boards and company career pages, updated continuously through the JSearch API
- **Smart filtering** by job type (internship, entry-level, full-time), location mode (remote, hybrid, on-site), and experience level
- **Quick search** with pre-configured buttons for high-demand categories like Data Science, Machine Learning Engineering, and Software Development
- **Intelligent tagging** that automatically categorizes positions by technology stack and domain expertise

### Application Management
- **Saved jobs** feature to bookmark promising opportunities and build a personal pipeline
- **Email digest** capability that delivers curated job matches directly to your inbox
- **Analytics dashboard** visualizing market trends, application statistics, and search insights
- **Export functionality** to download saved jobs in CSV format for external tracking

### AI Resume Builder
The platform's standout feature is an AI-powered resume tailoring system:
- Analyzes job descriptions and your master resume to identify key requirements and relevant experience
- Generates a professionally formatted, ATS-optimized 2-page resume tailored to each specific role
- Leverages **Anthropic Claude** for intelligent content generation and **OpenAI GPT** for proofreading and refinement
- Outputs downloadable `.docx` Word documents ready for immediate submission
- Includes live preview for final customization before download

### ATS Score Checker
Research-backed resume analysis tool that predicts how well your resume will perform with Applicant Tracking Systems:
- **7-factor scoring model** based on real ATS systems (RChilli, Workday, Oracle Taleo) and recruiter behavior data
- **Weighted analysis** with Technical Skills (35%), Job Title Match (15%), Experience Relevance (15%), Education (10%), Location (10%), Formatting (10%), and Industry Keywords (5%)
- **Detailed breakdown** showing matched vs. missing skills and keywords
- **Actionable suggestions** for improving your resume's ATS compatibility
- Helps optimize your resume before submission to increase interview callback rates

### Cover Letter Generator
AI-powered tool that creates personalized, professional cover letters:
- Analyzes your resume and the target job description to craft relevant content
- **Three writing styles**: Formal (traditional business), Professional (balanced), or Enthusiastic (energetic and passionate)
- Automatically incorporates your relevant experience and achievements
- Customizes tone and content to match the company culture and role requirements
- Generates compelling narratives that connect your background to the position

### Skills Gap Analysis
Intelligent career development tool that identifies areas for growth:
- Compares your current skills against job requirements and industry standards
- **Prioritized recommendations** categorized as Critical, Important, or Nice-to-Have
- **Curated learning resources** including courses, documentation, and tutorials for each missing skill
- Helps you create a focused learning roadmap aligned with your target roles
- Powered by a comprehensive skills database covering programming languages, frameworks, tools, and methodologies

### User Experience
- **Responsive design** optimized for desktop, tablet, and mobile devices
- **Dark/light mode** with persistent theme preferences
- **Modern UI** built with shadcn/ui components and Tailwind CSS for a polished, professional interface

## Technology Stack

**Frontend:** Next.js 14 (App Router), React 18, TypeScript

**Styling:** Tailwind CSS, shadcn/ui component library

**AI & APIs:** Anthropic Claude API, OpenAI API, JSearch (RapidAPI)

**Email & Documents:** Nodemailer (Gmail SMTP), docx library

**State & Storage:** React Context API, Browser Local Storage

**Deployment:** Vercel Edge Network

## Use Cases

- **Students** searching for summer internships or co-op positions in tech
- **New graduates** entering the job market in AI/ML or software engineering roles
- **Career changers** transitioning into tech from adjacent fields
- **Job seekers** who need to tailor resumes and cover letters quickly for multiple applications
- **Candidates** preparing applications and want to optimize for ATS systems
- **Developers** looking to identify skill gaps and create targeted learning plans
- **Anyone** looking to streamline their tech job search with intelligent automation

## License

MIT License - This is open-source software free to use, modify, and distribute.

## Acknowledgments

Built with [Next.js](https://nextjs.org/) · UI by [shadcn/ui](https://ui.shadcn.com/) · Job data from [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) · AI by [Anthropic](https://anthropic.com/) & [OpenAI](https://openai.com/)
