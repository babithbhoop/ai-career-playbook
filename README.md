# AI-Proof Career Playbook Generator

**Get your child's personalized, AI-proof career playbook in minutes. Free. No login required.**

A structured career assessment tool that generates personalized, data-backed career playbooks for parents and students navigating career planning in the age of AI. Built for parents to print and take to college counselor meetings.

**Live at:** [career-playbook.netlify.app](https://career-playbook.netlify.app) *(update with your actual URL)*

## What It Does

Parents answer 9 questions about their child (grade level, interests, strengths, extracurriculars, accomplishments, concerns) and receive a personalized career playbook that includes:

- **Top 5 AI-Resistant Career Matches** with proprietary AI Resistance Scores, salary data, and growth projections
- **Year-by-Year Action Plan** from their current grade through college with specific courses, extracurriculars, and AI fluency milestones
- **Student Profile & Accomplishment Record** formatted for college counselor meetings
- **Demonstrated Interest Strategy** with specific actions for college admissions this semester
- **5 Questions for Your College Counselor** tailored to the student's profile
- **Data-backed response** to the parent's biggest career concern
- **Print / Save as PDF** with professional formatting and Quantumleap Insights branding

## What Makes This Different

No other tool combines all of these:

1. **Parent-first audience.** Built BY a parent, FOR parents. Not a B2B school product.
2. **Proprietary AI Resistance Scores.** 35+ careers scored using a composite methodology across 17 research sources. These scores don't exist anywhere else.
3. **The counselor meeting playbook.** The only tool that generates a printable document specifically designed for a college counselor meeting, complete with student profile and tailored questions.
4. **Free, no gatekeepers.** No school purchase required. No login. No email wall.

## Research Sources

Career data and AI resistance scores are synthesized from 17 authoritative sources:

- World Economic Forum Future of Jobs Report 2025
- Goldman Sachs Research (AI Workforce Analysis 2025)
- McKinsey Global Institute ("Agents, Robots, and Us" 2025)
- PwC 2025 Global AI Jobs Barometer
- US Bureau of Labor Statistics
- Stanford University HAI
- Anthropic Economic Index (Labor Market Impacts 2026)
- Microsoft/LinkedIn Work Trend Index 2025
- UNITAR, DiploFoundation, ILO, IntuitionLabs, Adobe Research, ISE, Oxford Digital Diplomacy Research Group, Coursera, National University

## Tech Stack

- **Frontend:** React + Vite
- **AI:** Claude (Anthropic API) via Netlify serverless function
- **Hosting:** Netlify with auto-deploy from GitHub
- **Styling:** Custom CSS (Outfit + Instrument Serif + JetBrains Mono)

## Setup

### Prerequisites
- Node.js 18+
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Local Development

```bash
git clone https://github.com/YOUR_USERNAME/ai-career-playbook.git
cd ai-career-playbook
npm install
npx vite dev
```

Note: The `/api/generate` endpoint requires the Netlify serverless function. For local development with full functionality, use `netlify dev` instead of `vite dev`.

### Deploy to Netlify

1. Push this repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) > Add new site > Import from GitHub
3. Select this repo. Netlify auto-detects build settings from `netlify.toml`
4. Add environment variable: `ANTHROPIC_API_KEY` = your key
5. Deploy. Every `git push` to `main` auto-deploys.

### Cost

Each playbook generation costs approximately $0.003 in API usage (Claude Sonnet). 1,000 playbooks = ~$3.

## Part of the Future-Proof Careers Project

This playbook generator is one component of a broader research initiative:

- **Interactive Career Guide:** [thriving-shortbread-3bf879.netlify.app](https://thriving-shortbread-3bf879.netlify.app)
- **22-Page Research Document:** Available through the interactive guide
- **Community Research:** Parents contribute insights that inform future updates

## Author

**Babith Bhoopalan** — Founder & Principal Consultant, Quantumleap Insights LLC

25+ years in enterprise technology including Microsoft. Building tools to help parents navigate AI's impact on their children's career futures.

- LinkedIn: [Babith Bhoopalan](https://www.linkedin.com/in/babithb/)
- Website: [quantumleapinsights.ai](https://quantumleapinsights.ai)

## License

MIT
