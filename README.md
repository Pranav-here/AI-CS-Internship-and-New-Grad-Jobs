# AI/CS Entry‑Level & Internship Finder

[Live Demo → techcareers.vercel.app](https://techcareers.vercel.app/)

A modern, production-ready web application that helps students and new graduates discover internships and entry-level positions in AI, ML, Data Science, and Software Engineering.

## Features

- **Real-time Job Search**: Powered by JSearch API for up-to-date job listings
- **Smart Filtering**: Filter by job type, location mode, and experience level
- **Quick Search**: Pre-configured search buttons for popular job categories
- **Intelligent Tagging**: Auto-categorize jobs by technology and domain
- **Email Digest**: Send job results directly to your inbox
- **Saved Jobs**: Bookmark and manage your favorite opportunities
- **Analytics Dashboard**: Visualize job market trends and statistics
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark/Light Mode**: Toggle between themes for comfortable viewing

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **API**: JSearch (RapidAPI), Custom Next.js API routes
- **Email**: Nodemailer with Gmail SMTP
- **Deployment**: Vercel-ready

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
- `GMAIL_EMAIL`: Your Gmail address
- `GMAIL_APP_PASSWORD`: Your Gmail App Password

### Getting API Keys

#### RapidAPI (JSearch)
1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
3. Copy your API key to `RAPIDAPI_KEY`

#### Gmail App Password
1. Enable 2-Step Verification on your Google account
2. Generate an App Password for "Mail"
3. Use this password for `GMAIL_APP_PASSWORD`

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

## API Routes

- `POST /api/search-jobs`: Search for jobs using filters
- `POST /api/send-email-digest`: Send email digest to user

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

## Roadmap

- [ ] User authentication and profiles
- [ ] Job application tracking
- [ ] Company insights and ratings
- [ ] Salary information integration
- [ ] Mobile app (React Native)
- [ ] Advanced filtering (salary range, company size)
- [ ] Job alerts and notifications
