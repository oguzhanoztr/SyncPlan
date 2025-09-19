# SyncPlan - Detaylı Ürün Gereksinimleri Dokümanı (PRD)

## 🎯 Proje Özeti

**Ürün Adı:** SyncPlan
**Vizyon:** Modern, açık kaynaklı görev yönetimi platformu
**Hedef:** Bireysel kullanıcılardan büyük ekiplere kadar ölçeklenebilen, geliştiriciler tarafından geliştiriciler için tasarlanmış görev yönetimi çözümü

## 🏗️ Teknik Mimari

### Frontend Stack
```
Framework: Next.js 14 (App Router)
Language: TypeScript
UI Framework: ShadCN UI + Tailwind CSS
State Management: Zustand
Data Fetching: TanStack Query (React Query)
Forms: React Hook Form + Zod validation
Authentication: NextAuth.js
```

### Backend Stack
```
API: Next.js Server Actions + tRPC (tip güvenliği için)
Database: PostgreSQL
ORM: Prisma
Authentication: NextAuth.js (JWT/Session)
File Storage: AWS S3 / Cloudinary (avatar, dosya ekleri)
```

### DevOps & Deployment
```
Hosting: Vercel (frontend)
Database: Railway / PlanetScale / Supabase
CI/CD: GitHub Actions
Monitoring: Vercel Analytics + PostHog
```

## 📊 Veritabanı Şeması

### Core Tables
```sql
-- Kullanıcılar
Users {
  id: UUID (Primary Key)
  email: String (Unique)
  name: String
  avatar: String (nullable)
  role: Enum (USER, ADMIN)
  emailVerified: DateTime (nullable)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Projeler
Projects {
  id: UUID (Primary Key)
  name: String
  description: Text (nullable)
  ownerId: UUID (Foreign Key -> Users.id)
  visibility: Enum (PRIVATE, PUBLIC, TEAM)
  color: String (hex color)
  status: Enum (ACTIVE, ARCHIVED, DELETED)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Görevler
Tasks {
  id: UUID (Primary Key)
  title: String
  description: Text (nullable)
  projectId: UUID (Foreign Key -> Projects.id)
  assigneeId: UUID (nullable, Foreign Key -> Users.id)
  creatorId: UUID (Foreign Key -> Users.id)
  status: Enum (TODO, IN_PROGRESS, REVIEW, DONE)
  priority: Enum (LOW, MEDIUM, HIGH, URGENT)
  dueDate: DateTime (nullable)
  estimatedHours: Float (nullable)
  actualHours: Float (nullable)
  tags: String[] (array)
  position: Float (for ordering)
  parentTaskId: UUID (nullable, self-reference for subtasks)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Planlar/Sprintler
Plans {
  id: UUID (Primary Key)
  name: String
  projectId: UUID (Foreign Key -> Projects.id)
  startDate: DateTime
  endDate: DateTime
  type: Enum (SPRINT, MILESTONE, EPIC)
  status: Enum (PLANNING, ACTIVE, COMPLETED, CANCELLED)
  goals: Text (nullable)
  metadata: JSON (esnek veri için)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Relationship Tables
```sql
-- Proje Üyeleri
ProjectMembers {
  id: UUID (Primary Key)
  projectId: UUID (Foreign Key -> Projects.id)
  userId: UUID (Foreign Key -> Users.id)
  role: Enum (OWNER, ADMIN, MEMBER, VIEWER)
  joinedAt: DateTime
}

-- Görev Bağımlılıkları
TaskDependencies {
  id: UUID (Primary Key)
  taskId: UUID (Foreign Key -> Tasks.id)
  dependsOnTaskId: UUID (Foreign Key -> Tasks.id)
  type: Enum (BLOCKS, RELATED)
  createdAt: DateTime
}

-- Plan-Görev İlişkisi
PlanTasks {
  id: UUID (Primary Key)
  planId: UUID (Foreign Key -> Plans.id)
  taskId: UUID (Foreign Key -> Tasks.id)
  addedAt: DateTime
}

-- Yorumlar
Comments {
  id: UUID (Primary Key)
  taskId: UUID (Foreign Key -> Tasks.id)
  userId: UUID (Foreign Key -> Users.id)
  content: Text
  mentions: UUID[] (kullanıcı mention'ları)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Bildirimler
Notifications {
  id: UUID (Primary Key)
  userId: UUID (Foreign Key -> Users.id)
  type: Enum (TASK_ASSIGNED, TASK_UPDATED, COMMENT_ADDED, MENTION, DEADLINE_REMINDER)
  title: String
  message: Text
  relatedTaskId: UUID (nullable, Foreign Key -> Tasks.id)
  relatedProjectId: UUID (nullable, Foreign Key -> Projects.id)
  isRead: Boolean (default: false)
  createdAt: DateTime
}

-- Aktivite Logu
ActivityLogs {
  id: UUID (Primary Key)
  userId: UUID (Foreign Key -> Users.id)
  entityType: Enum (TASK, PROJECT, PLAN)
  entityId: UUID
  action: Enum (CREATED, UPDATED, DELETED, ASSIGNED, COMPLETED)
  oldValues: JSON (nullable)
  newValues: JSON (nullable)
  createdAt: DateTime
}
```

## 🚀 Özellik Detayları

### Phase 1: MVP (2-3 Hafta)

#### 1. Kullanıcı Yönetimi
- **Kayıt/Giriş**
  - Email/şifre ile kayıt
  - Google OAuth entegrasyonu
  - Email doğrulama
  - Şifre sıfırlama

- **Profil Yönetimi**
  - Avatar yükleme
  - Kullanıcı bilgileri güncelleme
  - Tema tercihi (dark/light mode)

#### 2. Proje Yönetimi
- **Proje CRUD İşlemleri**
  - Proje oluşturma/düzenleme/silme
  - Proje görünürlük ayarları
  - Proje üyesi ekleme/çıkarma
  - Rol tabanlı yetkilendirme

#### 3. Görev Yönetimi
- **Temel Görev İşlemleri**
  - Görev oluşturma/düzenleme/silme
  - Görev atama
  - Durum güncelleme (Kanban tarzı)
  - Öncelik belirleme
  - Son tarih ekleme

- **Görev Görünümleri**
  - Kanban board
  - Liste görünümü
  - Takvimdeki görevler

#### 4. Basit Planlama
- **Sprint/Milestone Oluşturma**
  - Plan oluşturma ve görev atama
  - Başlangıç/bitiş tarihleri
  - İlerleme takibi

### Phase 2: Gelişmiş Özellikler (3-4 Hafta)

#### 1. Gelişmiş Görev Özellikleri
- **Alt Görevler (Subtasks)**
  - Hierarchical görev yapısı
  - Alt görev ilerleme takibi

- **Görev Bağımlılıkları**
  - Görevler arası bağımlılık tanımlama
  - Otomatik zamanlama uyarıları

- **Zaman Takibi**
  - Manuel zaman girişi
  - Otomatik zaman tracking (opsiyonel)
  - Tahmin vs gerçek süre karşılaştırması

#### 2. İşbirliği Özellikleri
- **Yorumlar & Mention'lar**
  - Görev yorumları
  - @mention sistemi
  - Yorum bildirimleri

- **Real-time Güncellemeler**
  - WebSocket ile canlı güncellemeler
  - Eş zamanlı düzenleme uyarıları

#### 3. Bildirim Sistemi
- **Email Bildirimleri**
  - Görev atama bildirimleri
  - Son tarih hatırlatmaları
  - Mention bildirimleri

- **In-App Bildirimler**
  - Canlı bildirim merkezi
  - Bildirim tercihleri

### Phase 3: Analitik & Entegrasyonlar (4-5 Hafta)

#### 1. Raporlama & Analitik
- **Sprint Raporları**
  - Burndown charts
  - Velocity tracking
  - Sprint completion rate

- **Takım Performansı**
  - Bireysel üretkenlik metrikleri
  - Proje tamamlanma süreleri
  - Görev distribution analizi

#### 2. Entegrasyonlar
- **GitHub Integration**
  - PR linking
  - Commit tracking
  - Issue synchronization

- **Slack Integration**
  - Bildirimler
  - Slash commands
  - Status updates

#### 3. Gelişmiş Özellikler
- **Özel Alanlar**
  - Custom fields tanımlama
  - Flexible metadata

- **Workflow Automation**
  - Trigger-based actions
  - Automated status transitions

## 🎨 UI/UX Tasarım Prensipleri

### Design System
- **Renk Paleti:** Modern, minimal (tailwind color system)
- **Typography:** Inter font family
- **Spacing:** Consistent 8px grid system
- **Components:** ShadCN component library as base

### Responsive Design
- **Mobile First:** 320px minimum width
- **Tablet:** 768px+ optimized
- **Desktop:** 1024px+ full experience

### Accessibility
- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** ratios

## 📱 Sayfa Yapısı & User Flows

### Ana Sayfalar
```
/dashboard - Kullanıcı dashboard'u
/projects - Proje listesi
/projects/[id] - Proje detay sayfası
/projects/[id]/board - Kanban board
/projects/[id]/list - Liste görünümü
/projects/[id]/calendar - Takvim görünümü
/projects/[id]/planning - Sprint planning
/tasks/[id] - Görev detay sayfası
/profile - Kullanıcı profili
/settings - Ayarlar
```

### User Flows

#### Yeni Kullanıcı Onboarding
1. Landing page → Sign up
2. Email verification
3. Profile setup (avatar, name)
4. First project creation wizard
5. Sample tasks creation
6. Quick tour of features

#### Günlük Kullanım
1. Dashboard → güncel görevler
2. Proje seçimi
3. Kanban board'da görev yönetimi
4. Yorum ekleme/güncelleme
5. Status değiştirme

#### Sprint Planning
1. Planning view açma
2. Yeni sprint oluşturma
3. Backlog'dan görev seçimi
4. Drag & drop ile sprint'e ekleme
5. Sprint başlatma

## 🔧 Geliştirme Süreçleri

### Git Workflow
```
main branch: Production ready code
develop branch: Integration branch
feature/* branches: Feature development
hotfix/* branches: Critical bug fixes
release/* branches: Release preparation
```

### PR (Pull Request) Süreci
1. Feature branch creation
2. Development & testing
3. PR creation with template
4. Code review (minimum 1 reviewer)
5. CI/CD checks passage
6. Merge to develop
7. Deploy to staging
8. Manual testing
9. Merge to main
10. Production deployment

### Testing Strategy
```
Unit Tests: Jest + React Testing Library
Integration Tests: Playwright
E2E Tests: Cypress
Performance Tests: Lighthouse CI
```

### Code Quality
```
ESLint: Code linting
Prettier: Code formatting
Husky: Git hooks
TypeScript: Type checking
SonarQube: Code quality analysis
```

## 📈 Performans Hedefleri

### Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### API Performance
- **Database queries:** < 500ms
- **API responses:** < 200ms
- **Real-time updates:** < 100ms latency

### Scalability Targets
- **Concurrent users:** 10,000+
- **Projects per user:** 100+
- **Tasks per project:** 10,000+
- **API rate limits:** 1000 req/min per user

## 🔐 Güvenlik & Compliance

### Security Measures
- **Authentication:** JWT with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Data encryption:** At rest and in transit
- **Input validation:** Zod schemas
- **Rate limiting:** Express rate limit
- **CORS:** Proper CORS configuration

### Privacy & Compliance
- **GDPR compliance:** Data portability, right to deletion
- **Data retention:** Configurable retention policies
- **Audit logging:** Full activity tracking
- **Privacy settings:** User-controlled visibility

## 🚀 Deployment & Infrastructure

### Environment Strategy
```
Development: Local development
Staging: Pre-production testing
Production: Live environment
```

### CI/CD Pipeline
```
1. Code push → GitHub
2. GitHub Actions trigger
3. Run tests & quality checks
4. Build application
5. Deploy to Vercel (staging)
6. Run E2E tests
7. Manual approval for production
8. Deploy to production
9. Post-deployment health checks
```

### Monitoring & Observability
```
Application Monitoring: Vercel Analytics
Error Tracking: Sentry
Performance Monitoring: Web Vitals
Database Monitoring: Prisma Pulse
Uptime Monitoring: Uptime Robot
```

## 📊 Success Metrics & KPIs

### User Engagement
- **Daily Active Users (DAU)**
- **Weekly Active Users (WAU)**
- **User retention rates (1-day, 7-day, 30-day)**
- **Session duration**
- **Feature adoption rates**

### Product Performance
- **Task completion rates**
- **Project completion times**
- **User satisfaction (NPS)**
- **Support ticket volume**

### Business Metrics
- **User registration rate**
- **Open source contributions**
- **GitHub stars/forks**
- **Community engagement**

## 🗓️ Geliştirme Takvimi

### Sprint 1-2 (MVP Core - 2 hafta)
- User authentication
- Basic project CRUD
- Basic task management
- Simple Kanban board

### Sprint 3-4 (MVP Complete - 2 hafta)
- Task assignment & status
- Basic planning features
- Email notifications
- Responsive design

### Sprint 5-7 (Enhanced Features - 3 hafta)
- Real-time collaboration
- Advanced task features
- Improved UI/UX
- Performance optimizations

### Sprint 8-10 (Advanced Platform - 3 hafta)
- Analytics & reporting
- Third-party integrations
- Advanced workflow features
- Mobile optimization

## 🎯 Go-to-Market Strategy

### Open Source Community
- **GitHub repository** setup with good documentation
- **Contributing guidelines** and issue templates
- **Community Discord/Slack** for discussions
- **Regular releases** with changelogs

### Documentation Strategy
- **Developer documentation** (API, setup, contributing)
- **User documentation** (features, tutorials)
- **Video tutorials** for complex features
- **Blog posts** about development journey

### Marketing Channels
- **Product Hunt** launch
- **Hacker News** submission
- **Developer Twitter** engagement
- **Tech blog** guest posts
- **Conference presentations**

## 🔮 Gelecek Vizyonu

### Long-term Goals
- **Enterprise features:** SSO, advanced security
- **Mobile applications:** React Native apps
- **Desktop applications:** Electron/Tauri apps
- **AI integration:** Smart task suggestions, automated planning
- **Advanced integrations:** 50+ tool integrations
- **Multi-language support:** i18n implementation

### Community Goals
- **1000+ GitHub stars** in first year
- **100+ contributors**
- **Active community** of users and developers
- **Sustainable funding** through sponsorships/donations

---

Bu detaylı PRD, SyncPlan projesinin her aşamasını kapsamlı şekilde ele alıyor. Geliştirme sürecinde bu doküman referans noktamız olacak ve proje ilerledikçe güncellenecek.