# 🧭 PathForge AI — AI Career Coach & Learning Roadmap Platform

PathForge AI is a production-ready, full-stack MERN application powered by AI (Gemini Pro) to curate personalized learning roadmaps, audit resume structures, analyze skills gaps, and log applications in an interactive job tracker.

Designed with a premium glassmorphic, dark-mode-first visual aesthetic, it serves as a high-fidelity SaaS dashboard built to streamline modern job searches for engineers.

---

## 🌟 Key Features

### 1. 📊 Interactive Dashboard
- Visualizes application pipelines with responsive Bar Charts (Recharts).
- Audits day-by-day learning progress and streaking activities.
- High-level KPIs mapping resume strength, skill gap preparedness, and active interview rounds.

### 2. 📄 AI Resume Analyzer
- Automated PDF parsing to evaluate layout structure, skills coverage, and ATS match score.
- Dynamic scanning micro-animations mimicking automated screening engines.
- Side-by-side phrasing suggestions (Original vs. ATS Enhanced) and critical keyword gap auditing.

### 3. 🗺️ Curated Learning Roadmap
- Dynamic roadmaps generated from career targets (1, 2, 3, or 6 months).
- Organized Month-by-Week accordion timelines.
- Integrated checkbox checklists targeting daily assignments, coding problems, and mock interview preparations.

### 4. 📈 Skill Gap Hub
- Real-time comparison between profile assets and targeted engineering positions.
- Radial alignment meters measuring overall readiness.
- Highlights missing competencies flagged by high/critical priorities and links to curated studies.

### 5. 💡 Bespoke Project Generator
- Suggests customized portfolio projects based on skill gap indicators.
- Details difficulty tiers, tech stacks, architectural structures, and suggested GitHub folder hierarchies.
- Generates copying-optimized, ATS-friendly bullet points to paste directly on resumes.

### 6. 📚 Resource Hub
- Direct curation search boards to query specific engineering topics.
- Organizes recommended courses, guides, and documentation with duration metrics, star ratings, and price tags.

### 7. 💼 Kanban Internship Tracker
- Organizes applications in board columns (Applied, Interviewing, Offer, Rejected).
- Drag-and-select status modifications and custom tag classifiers.
- One-click interview prep generator linking directly to the AI Coach.

### 8. 💬 AI Career Coaches
- Multiple themed personalities:
  - **Dr. Turing**: Technical & System Design specialist.
  - **Coach Sarah**: Behavioral, leadership, and STAR technique trainer.
  - **Resume Master**: Formatting and ATS optimization advisor.
- Fully supports markdown formatting, code block rendering, and conversational context persistence.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Axios, React Query, Recharts, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Mongoose, Multer, Winston Logger, express-rate-limit |
| **Database** | MongoDB |
| **AI Integration** | Google Generative AI (Gemini 1.5 Pro) |
| **Containerization** | Docker, Docker Compose, Nginx (multi-stage static serving) |

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Docker** and **Docker Compose**
- Or **Node.js (v18+)** and **MongoDB** installed locally.

---

### 🐳 Run with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhishek0964/PathForge-AI.git
   cd PathForge-AI
   ```

2. **Configure Environment Variables:**
   Rename `.env.example` to `backend/.env` (and populate the Gemini Key):
   ```bash
   cp .env.example backend/.env
   ```
   Add your Gemini API Key in `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Spin up containers:**
   ```bash
   docker compose up --build
   ```

4. **Access the platform:**
   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000`
   - **Database**: `localhost:27017`

---

### 💻 Local Development Setup (Manual)

#### 1. Setup Backend
```bash
cd backend
npm install --legacy-peer-deps
cp .env.example .env
# Start development server
npm run dev
```

#### 2. Setup Frontend
```bash
cd ../frontend
npm install --legacy-peer-deps
# Start dev server
npm run dev
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
