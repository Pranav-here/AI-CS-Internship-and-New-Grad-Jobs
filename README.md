# AI/CS Entry‑Level & Internship Finder

[Live Demo → techcareers.vercel.app](https://techcareers.vercel.app/)

A modern, production-ready web application that helps students and new graduates discover internships and entry-level positions in AI, ML, Data Science, and Software Engineering. Built with Next.js 14, TypeScript, and powered by real-time job APIs.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Real-time Job Search**: Powered by JSearch API for up-to-date job listings
- **Smart Filtering**: Filter by job type, location mode, and experience level
- **Quick Search**: Pre-configured search buttons for popular job categories
- **Intelligent Tagging**: Auto-categorize jobs by technology and domain
- **Email Digest**: Send job results directly to your inbox
- **Saved Jobs**: Bookmark and manage your favorite opportunities
- **Analytics Dashboard**: Visualize job market trends and statistics
- **AI Resume Builder**: Tailor a 2-page resume with Anthropic + OpenAI and download it as a Word doc
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark/Light Mode**: Toggle between themes for comfortable viewing

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **APIs**:
  - JSearch (RapidAPI) for job listings
  - Anthropic Claude API for resume generation
  - OpenAI API for content proofreading
- **Email**: Nodemailer with Gmail SMTP
- **Document Generation**: docx library for Word documents
- **State Management**: React Context + Local Storage
- **Deployment**: Vercel-optimized

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- RapidAPI account for JSearch API
- Gmail account with App Password for email features

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd ai-job-finder
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your environment variables:
- `RAPIDAPI_KEY`: Your RapidAPI key for JSearch
- `OPENAI_API_KEY`: Your OpenAI platform key for proofreading
- `ANTHROPIC_API_KEY`: Your Anthropic key for resume drafting
- `GMAIL_EMAIL`: Your Gmail address
- `GMAIL_APP_PASSWORD`: Your Gmail App Password

### Getting API Keys

#### RapidAPI (JSearch)
1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) (free tier available)
3. Copy your API key to `RAPIDAPI_KEY`

#### Anthropic API
1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add to `ANTHROPIC_API_KEY`

#### OpenAI API
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Generate an API key
3. Add to `OPENAI_API_KEY`

#### Gmail App Password
1. Enable 2-Step Verification on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an App Password for "Mail"
4. Use this password for `GMAIL_APP_PASSWORD`

### Development

Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app is containerizable and can be deployed on any platform supporting Node.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS/GCP/Azure

## Usage

### Basic Search
1. Enter job keywords (e.g., "machine learning", "data science")
2. Select job types (internships, entry-level positions)
3. Choose location preferences (on-site, remote, or both)
4. Click "Search Jobs"

### Quick Search
Use the collapsible Quick Search panel for instant searches:
- Popular job categories (Data Science, ML, Software Engineering)
- Remote-specific searches
- Season-specific internships

### Email Digest
1. Enable "Send search results to email"
2. Enter your email address
3. Receive top 10 job matches in a formatted email

### Saved Jobs
- Click the bookmark icon on any job card
- Access saved jobs via the "Saved" button in the header
- Export saved jobs to CSV

### AI Resume Builder
1. Click the **AI Resume Builder** button in the top navigation.
2. Paste the target job posting plus your expanded/master resume.
3. (Optional) Provide the target role and seniority hints.
4. Click **Generate Tailored Resume** to let Anthropic draft it and OpenAI proofread it.
5. Download the generated Word `.docx` file or copy from the on-page preview for final tweaks.

## API Routes

- `POST /api/search-jobs`: Search for jobs using filters
- `POST /api/send-email-digest`: Send email digest to user
- `POST /api/ai-resume`: Generate a tailored resume with Anthropic + OpenAI and return a downloadable docx

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the GitHub Issues
2. Create a new issue with detailed description
3. For urgent matters, contact the maintainers

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── search-jobs/      # Job search API endpoint
│   │   ├── send-email-digest/ # Email digest API endpoint
│   │   └── ai-resume/        # AI resume generation endpoint
│   ├── resume-builder/       # Resume builder page
│   └── page.tsx              # Main application page
├── components/               # React components
│   ├── job-card.tsx
│   ├── job-table.tsx
│   ├── email-digest.tsx
│   ├── saved-jobs-drawer.tsx
│   ├── analytics.tsx
│   └── theme-toggle.tsx
├── lib/
│   └── ai-resume.ts          # AI resume generation logic
└── public/                   # Static assets
```

## Roadmap

- [ ] User authentication and profiles
- [ ] Job application tracking
- [ ] Company insights and ratings
- [ ] Salary information integration
- [ ] Mobile app (React Native)
- [ ] Advanced filtering (salary range, company size)
- [ ] Job alerts and notifications
- [ ] Cover letter generation with AI
- [ ] Interview preparation resources

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Job data powered by [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
- AI capabilities by [Anthropic Claude](https://anthropic.com/) and [OpenAI](https://openai.com/)
