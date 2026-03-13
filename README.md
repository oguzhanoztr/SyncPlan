<div align="center">

# 🔄 SyncPlan

### Modern Project & Task Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  Organize your projects, track your tasks, and supercharge your team's workflow. 🚀
</p>

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🔗 API Endpoints](#-api-endpoints)
- [🗄️ Database Schema](#️-database-schema)
- [🏗️ Architecture Decisions](#️-architecture-decisions)
- [🔐 Role-Based Access Control](#-role-based-access-control)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 👤 User Management
- 📧 Email & password registration/login
- 🔐 Google & GitHub OAuth integration
- 🪪 Profile management & password change
- 🔑 Secure JWT-based session handling

### 📊 Project Management
- ➕ Create, edit, and delete projects
- 👥 Team member management & role assignment
- 🎨 Color-coded project cards
- 🔒 Visibility settings (Private / Public / Team)
- 📈 Project status tracking (Active / Archived)

### ✅ Task Management
- 📝 Full CRUD operations for tasks
- 🏷️ Status tracking: `Todo` → `In Progress` → `Review` → `Done`
- 🔴🟡🟢 Priority levels (Low / Medium / High / Urgent)
- 👤 Task assignment & tracking
- 📅 Due dates & time estimation
- 🏷️ Tagging system
- 💬 Task comments
- 🔍 Filtering & search

### 📋 Subtasks
- 🔗 Hierarchical task structure (parent → child)
- ↕️ Drag & drop reordering
- ✅ Independent status & assignment tracking

### 🧩 Advanced Features
- 🔀 Task dependencies (Blocks / Related)
- 📊 Dashboard with statistics
- 📢 Notification system
- 📜 Activity logging
- 🏃 Sprint & Milestone planning
- ⚡ Performance optimizations & caching

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **🖥️ Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **🧩 UI Components** | ShadCN UI (Radix UI), Lucide Icons |
| **📡 State & Data** | TanStack React Query, React Hook Form, Zod |
| **⚙️ Backend** | Next.js API Routes (App Router) |
| **🗄️ Database** | PostgreSQL + Prisma ORM |
| **🔐 Authentication** | NextAuth.js (JWT + OAuth) |
| **🔒 Security** | bcryptjs, Zod validation |

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** or **yarn**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/oguzhanoztr/SyncPlan.git
cd SyncPlan
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# 🗄️ Database
DATABASE_URL="postgresql://username:password@localhost:5432/syncplan_dev"

# 🔐 NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# 🔑 OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 4️⃣ Set Up the Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

### 5️⃣ Start the Development Server

```bash
npm run dev
```

🎉 Open [http://localhost:3000](http://localhost:3000) in your browser!

### 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 🔧 Start development server |
| `npm run build` | 🏗️ Create production build |
| `npm run start` | 🚀 Start production server |
| `npm run lint` | 🔍 Run ESLint code checks |
| `npm run db:studio` | 🎛️ Open Prisma Studio GUI |
| `npm run db:migrate` | 🔄 Create & run migrations |

---

## 📁 Project Structure

```
📦 SyncPlan
├── 📂 prisma/
│   └── schema.prisma          # 🗄️ Database schema
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📂 api/            # ⚙️ REST API routes
│   │   │   ├── 📂 auth/       #    🔐 Authentication
│   │   │   ├── 📂 projects/   #    📊 Project endpoints
│   │   │   ├── 📂 tasks/      #    ✅ Task endpoints
│   │   │   ├── 📂 subtasks/   #    📋 Subtask endpoints
│   │   │   └── 📂 user/       #    👤 User endpoints
│   │   ├── 📂 auth/           # 🔑 Sign in / Sign up pages
│   │   ├── 📂 dashboard/      # 📊 Dashboard page
│   │   ├── 📂 projects/       # 📁 Project pages
│   │   ├── 📂 tasks/          # ✅ Task detail pages
│   │   ├── 📂 profile/        # 👤 Profile page
│   │   ├── layout.tsx         # 🖼️ Root layout
│   │   └── page.tsx           # 🏠 Landing page
│   ├── 📂 components/
│   │   ├── 📂 ui/             # 🧩 ShadCN components
│   │   ├── 📂 common/         # 🔄 Shared components
│   │   ├── 📂 layout/         # 📐 Layout components
│   │   ├── 📂 modals/         # 💬 Modal dialogs
│   │   └── 📂 providers/      # 🔌 Context providers
│   ├── 📂 lib/
│   │   ├── auth.ts            # 🔐 NextAuth configuration
│   │   ├── prisma.ts          # 🗄️ Prisma client
│   │   ├── cache.ts           # ⚡ Cache utility
│   │   └── utils.ts           # 🔧 Helper functions
│   └── middleware.ts          # 🛡️ Route protection
├── .env.example               # 📋 Environment variables template
├── package.json               # 📦 Dependencies
└── tsconfig.json              # ⚙️ TypeScript configuration
```

---

## 🔗 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | 📝 Register new user |
| `POST` | `/api/auth/[...nextauth]` | 🔑 NextAuth.js sign in/out |

### 📊 Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | 📋 List all projects |
| `POST` | `/api/projects` | ➕ Create new project |
| `GET` | `/api/projects/:id` | 🔍 Get project details |
| `PUT` | `/api/projects/:id` | ✏️ Update project |
| `DELETE` | `/api/projects/:id` | 🗑️ Delete project |

### ✅ Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | 📋 List tasks |
| `POST` | `/api/tasks` | ➕ Create new task |
| `GET` | `/api/tasks/:id` | 🔍 Get task details |
| `PUT` | `/api/tasks/:id` | ✏️ Update task |
| `DELETE` | `/api/tasks/:id` | 🗑️ Delete task |

### 📋 Subtasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/subtasks` | 📋 List subtasks |
| `POST` | `/api/subtasks` | ➕ Create subtask |
| `PUT` | `/api/subtasks/:id` | ✏️ Update subtask |
| `DELETE` | `/api/subtasks/:id` | 🗑️ Delete subtask |
| `PUT` | `/api/subtasks/reorder` | ↕️ Reorder subtasks |

### 👤 User

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/api/user/profile` | ✏️ Update profile |
| `PUT` | `/api/user/password` | 🔒 Change password |

---

## 🗄️ Database Schema

```mermaid
erDiagram
    User ||--o{ Project : owns
    User ||--o{ ProjectMember : "member of"
    User ||--o{ Task : creates
    User ||--o{ Task : "assigned to"
    Project ||--o{ Task : contains
    Project ||--o{ ProjectMember : members
    Task ||--o{ Subtask : subtasks
    Task ||--o{ Comment : comments
    Task ||--o{ TaskDependency : dependencies
    User ||--o{ Notification : notifications
    User ||--o{ ActivityLog : activities
    Project ||--o{ Plan : plans
```

---

## 🏗️ Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **🗂️ App Router** | Next.js 14 App Router for server/client component separation |
| **📡 React Query** | TanStack Query for data fetching, caching & synchronization |
| **🔐 JWT Sessions** | Fast authentication without database session lookups |
| **🗄️ Prisma ORM** | Type-safe database queries & easy schema management |
| **⚡ In-Memory Cache** | TTL-based caching to speed up frequent queries |
| **🎨 ShadCN UI** | Customizable, accessible & modern UI components |

---

## 🔐 Role-Based Access Control

| Role | Permissions |
|------|------------|
| 👑 **Owner** | Full access — including project deletion & member management |
| 🛡️ **Admin** | Task & member management |
| 👤 **Member** | Create, edit tasks & add comments |
| 👁️ **Viewer** | Read-only access |

---

## 🤝 Contributing

Contributions are welcome! 🎉

1. 🍴 Fork this repository
2. 🌿 Create a new branch (`git checkout -b feature/awesome-feature`)
3. 💾 Commit your changes (`git commit -m 'feat: Add awesome feature'`)
4. 📤 Push your branch (`git push origin feature/awesome-feature`)
5. 🔃 Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT](LICENSE) License.

---

<div align="center">

**⭐ If you found this project useful, don't forget to give it a star! ⭐**

🔄 **SyncPlan** — Sync your projects, align your team.

Made with ❤️ by [Oğuzhan Öztürk](https://github.com/oguzhanoztr)

</div>
