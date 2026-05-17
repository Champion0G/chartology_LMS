# 🎓 Chartology LMS — Learning Management Portal

[![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)](https://chartology-lms.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel)](https://chartology-lms.vercel.app/)

> **Live Application:** [chartology-lms.vercel.app](https://chartology-lms.vercel.app/)

Chartology LMS is a state-of-the-art learning management platform designed for students and educators. It features an ultra-premium, high-contrast **Cyberpunk Red** dashboard with real-time video classrooms, interactive timed quizzes, gamified progression systems, and robust administrative tools.

---

## ✨ Features

### 👨‍🎓 For Students
- **Interactive Dashboard:** Track your level, XP, and weekly progression with sleek, modern glassmorphic dashboard widgets.
- **Live Classrooms:** Join real-time online classes integrated with Daily.co API directly inside the platform.
- **Resource Vault:** Access curated video lessons, slide decks, and downloadable PDF study guides.
- **Time-based Quizzes:** Take scheduled live assessments with strict question-by-question timers.
- **Gamified Leaderboard:** Compete in real-time cohort standings based on assignments completed and quiz performance.
- **Doubt Clearing Panel:** Submit specific academic doubts, attach files/links, and get immediate feedback.

### 🔐 For Educators & Admins
- **Interactive Live Scheduler:** Schedule new live sessions with titles, exact start-times, and durations.
- **Instant Meeting Launcher:** Spin up instant video rooms with a single click.
- **Quiz Architect:** Create customized timed live quizzes with dynamic multiple-choice questions.
- **User Progression Panel:** Seamlessly manage student accounts, manual XP boosts, and roles.
- **Resource Portal:** Upload new learning guides, PDFs, and video lessons with automated category filters.
- **FAQ Dashboard:** Create, search, and update frequently asked cohort questions.

---

## 📐 Design System & UX Standards

The platform has been redesigned to conform to a premium **Cyberpunk Red** institutional visual identity:

- **Primary Colors:** Deep Obsidian (`#02020a`), Solid Pitch Black (`#000000`), Dark Navy obsidian backgrounds (`#0a0a16`).
- **Accents:** Electric Crimson Red (`#ef4444` / `rgba(239, 68, 68, 0.8)`), Glowing neon red borders, and high-impact custom card reflections.
- **Optimized Responsiveness & Modal System:**
  - **Centering & Alignment:** Modals completely center themselves dynamically using a viewport-relative centering strategy (`margin: 5vh auto`), bypassing standard sidebar containers.
  - **Scroll-Lock Mechanics:** Mounts are paired with dual scroll locks on both `document.body` and `document.documentElement` (`overflow: hidden`), completely preventing the main dashboard from scrolling when a form is open.
  - **Contrast & Transparency:** High-contrast solid black modal backgrounds (`#000000`) paired with heavily blurred black backdrops (`rgba(0,0,0,0.95)` / `blur(10px)`) to guarantee clear text readability and prevent layout bleed-through.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, Turbopack |
| **Database** | PostgreSQL hosted on **Neon Tech** |
| **ORM** | Prisma ORM |
| **Styling** | Custom Vanilla CSS (Design Tokens, Glassmorphism, CSS variables) |
| **Icons & Media** | Lucide React, Cloudinary for animated profiles & asset uploads |
| **WebRTC & Live Video** | Daily.co API integration |
| **Authentication** | JSON Web Tokens (`jose`), `bcryptjs` secure passwords |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL instance (Neon Tech recommended)
- Cloudinary developer API keys
- Daily.co API developer keys

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/csol-lms.git
   cd csol-lms
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root:
   ```env
   # Database Connections
   DATABASE_URL="postgresql://..."

   # Encryption & Authentication
   JWT_SECRET="your_secure_random_jwt_secret_key"

   # Cloudinary Storage Configurations
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"

   # Daily.co WebRTC Video Integration
   DAILY_API_KEY="your_daily_co_private_key"
   NEXT_PUBLIC_DAILY_DOMAIN="your-domain"
   ```

4. **Synchronize DB Schema:**
   ```bash
   npx prisma db push
   npx prisma db seed # Installs core dashboard settings and cohorts
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```

---

## 📁 Repository Map

```text
├── app/                  # NextJS App Router Pages & API Route Handlers
│   ├── (auth)/           # Secure Login & Register views
│   ├── (dashboard)/      # Student-specific and Admin-specific dashboards
│   │   ├── admin/        # Admin panels & user controllers
│   │   ├── faqs/         # Institutional FAQ manager
│   │   ├── live-test/    # Live quizzing dashboard
│   │   └── live-classes/ # Video conference dashboards
│   └── api/              # Secure backend API endpoints (JWT-guarded)
├── components/           # Reusable React layout items, cards, and modal systems
│   └── live/             # Real-time room controllers and schedule cards
├── prisma/               # Database model architectures and seed configuration
├── lib/                  # Auth keys, Prisma DB clients, and shared helper methods
└── public/               # Optimized static vector assets and branding mockups
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

Developed with ❤️ by the **Chartology Development Team**.
