# Elite Recruit - Football Recruiting Website PRD

## Original Problem Statement
Build a modern, public football recruiting website for a private high school football player seeking Division I scholarship recruitment. The website must be recruiter-first, fast to scan, mobile-optimized, and visually professional.

## Architecture
- **Frontend**: React 19 with Tailwind CSS, Framer Motion animations, Recharts
- **Backend**: FastAPI (Python) with Motor (async MongoDB driver)
- **Database**: MongoDB
- **Design**: Dark athletic theme with Barlow Condensed + Inter fonts

## User Personas
1. **College Recruiters** - Primary users. Need quick access to player info, film, and contact details
2. **Coaching Staff** - High school coaches managing the athlete's profile
3. **Parents/Guardians** - Supporting the recruitment process

## Core Requirements (Static)
- 30-second recruiter scan homepage
- Player profile with verified measurables
- Categorized game film with timestamps and tags
- Interactive stats dashboard with year-over-year progression
- Academic & character section with testimonials
- Contact page with coach information
- PDF export of player profile
- Recruiter analytics tracking

## What's Been Implemented ✅
**January 17, 2025**
- Complete 6-page recruiting website
  - Homepage with hero section, bento grid stats, video preview
  - Player Profile with measurables, skills assessment, strengths
  - Game Film page with category tabs, video modal, timestamps
  - Stats Dashboard with Recharts bar/line charts, season breakdown
  - Academic page with GPA, NCAA eligibility, testimonials
  - Contact page with coach cards, social links, contact form
- Backend API with 11 endpoints for all data models
- PDF export functionality (ReportLab)
- Analytics tracking (page views, video clicks)
- Sample athlete data (Marcus "MJ" Johnson Jr., Class of 2026)
- Floating glass navigation with mobile hamburger menu
- Dark athletic theme with animations

## P0/P1/P2 Features Remaining

### P0 (Critical - Not Implemented)
- None - MVP complete

### P1 (Important)
- CMS admin panel for easy content updates
- Real form submission (currently simulated)
- Email notifications for contact form
- Image upload for athlete photos

### P2 (Nice to Have)
- Password-protected coach portal
- Advanced analytics dashboard for recruiter insights
- NIL-ready features (sponsorship section)
- Multi-athlete support
- SEO optimization for recruiting searches

## Next Tasks
1. Add CMS functionality for updating athlete data
2. Connect contact form to email service (e.g., SendGrid/Resend)
3. Add image upload capability
4. Consider NIL-era recruiting enhancements
