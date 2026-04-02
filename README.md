# 🎓 Chartology LMS — Learning Solutions

[![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)](https://chartology-lms.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel)](https://chartology-lms.vercel.app/)

> **Live Application:** [chartology-lms.vercel.app](https://chartology-lms.vercel.app/)

Chartology LMS is a state-of-the-art learning management platform designed for students and educators. It features a premium, institution-grade interface with real-time tracking, gamified progression, and a robust architecture for educational excellence.

---

## ✨ Features

### 👨‍🎓 For Students
- **Interactive Dashboard**: Track your XP, Level, and recent activity in a sleek, glassmorphic UI.
- **Assignment Center**: View deadlines, download materials, and submit your work directly through the platform.
- **Resource Vault**: Access curated video lessons and study materials organized for your success.
- **Doubt Clearing**: Ask questions directly to mentors and track resolution status in real-time.
- **Gamified Progress**: Earn XP for submissions and engagement, and level up as you master new skills.

### 🔐 For Educators & Admins
- **User Management**: Comprehensive control over student profiles, roles, and levels.
- **Resource Management**: Easily upload video content and study materials.
- **Assignment Engine**: Create assignments with attachments and deadlines for specific cohorts.
- **Grading & Feedback**: Review submissions, provide constructive feedback, and award grades.
- **Notification Hub**: Send system-wide or user-specific alerts to keep the cohort informed.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, Framer Motion |
| **Styling** | Tailwind CSS 4, CSS Variables, Glassmorphism |
| **Typography** | Space Grotesk (Headings), Inter (Body) |
| **Backend** | Next.js Route Handlers |
| **Database** | Neon PostgreSQL |
| **ORM** | Prisma |
| **Auth** | JWT (jose), bcryptjs |
| **Media** | Cloudinary (Video & Image Hosting) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- A Neon PostgreSQL instance
- Cloudinary Account (for uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/csol-lms.git
   cd csol-lms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgres://..."

   # Auth
   JWT_SECRET="your-secret-key"

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."
   ```

4. **Initialize Database**
   ```bash
   npx prisma db push
   npx prisma db seed # Optional: Seed initial admin account
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication routes
│   ├── (dashboard)/      # Student & Admin dashboards
│   └── api/              # Backend API routes
├── components/           # Reusable UI components
├── lib/                  # Shared utilities & Prisma client
├── prisma/               # Database schema & migrations
├── public/               # Static assets
├── types/                # TypeScript interfaces
└── styles/               # Global CSS & Design Tokens
```

---

## 📐 Design System

The platform uses an **Ultra-Premium Dark Palette** with institutional aesthetics:
- **Primary Color:** `#05050f` (Deep Obsidian)
- **Accents:** Neon Blue (`#3b82f6`) & Electric Purple (`#8b5cf6`)
- **Effects:** High-blur glass surfaces, interactive custom cursors, and subtle micro-animations.

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Developed with ❤️ by **Chartology Team**
