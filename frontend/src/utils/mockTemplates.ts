import { Roadmap, SkillGap, ProjectSuggestion, LearningResourceDoc, ChatMessage } from '../services';

// Helper to generate a dummy ID
const mockId = () => Math.random().toString(36).substring(2, 9);

// ----------------------------------------------------
// 1. DUMMY DATABASE OF DETAILED TEMPLATES BY ROLE
// ----------------------------------------------------
export const ROLE_TEMPLATES: Record<string, {
  roadmap: (duration: number) => Roadmap;
  skillGap: SkillGap;
  projects: ProjectSuggestion;
  resources: LearningResourceDoc;
}> = {};

// List of roles supported
const SUPPORTED_ROLES = [
  'frontend', 'backend', 'ai engineer', 'full stack', 
  'data science', 'cyber security', 'cloud', 'devops', 'mobile', 'ui/ux'
];

// Helper to normalize search query
export const normalizeRoleName = (role: string): string => {
  const r = role.toLowerCase().trim();
  if (r.includes('front') || r.includes('react') || r.includes('html')) return 'frontend';
  if (r.includes('back') || r.includes('node') || r.includes('api')) return 'backend';
  if (r.includes('ai') || r.includes('machine') || r.includes('ml') || r.includes('intelligence')) return 'ai engineer';
  if (r.includes('full') || r.includes('mern') || r.includes('stack')) return 'full stack';
  if (r.includes('data') || r.includes('analyst') || r.includes('science')) return 'data science';
  if (r.includes('security') || r.includes('cyber') || r.includes('ethical')) return 'cyber security';
  if (r.includes('cloud') || r.includes('aws') || r.includes('azure')) return 'cloud';
  if (r.includes('ops') || r.includes('docker') || r.includes('kubernetes')) return 'devops';
  if (r.includes('mobile') || r.includes('ios') || r.includes('android') || r.includes('native')) return 'mobile';
  if (r.includes('ux') || r.includes('ui') || r.includes('design') || r.includes('figma')) return 'ui/ux';
  return 'full stack'; // default fallback
};

// PRE-LOADED DATASETS FOR THE SUPPORTED ROLES
const initRoleTemplates = () => {
  // 1. FULL STACK DEVELOPER
  ROLE_TEMPLATES['full stack'] = {
    roadmap: (months = 3) => ({
      _id: 'mock-rm-fullstack',
      targetRole: 'Full Stack Developer',
      duration: months,
      overallCompletion: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      months: [
        {
          month: 1,
          title: 'Frontend Mastery & React Ecosystem',
          description: 'Solidify your core frontend skills, modern responsive layouts, and state management.',
          completionPercentage: 0,
          concepts: ['React Hooks', 'Context API', 'Tailwind CSS', 'Vite & TS Configs'],
          milestones: ['Build a responsive task manager layout', 'Setup global state provider'],
          weeks: [
            {
              week: 1,
              title: 'TypeScript & React Architecture',
              project: 'Type-safe Component Library',
              leetcode: 'Two Sum, Valid Parentheses',
              interviewPrep: 'Explain Virtual DOM and React fiber reconciliation',
              goals: [
                { day: 1, title: 'Understand TS Interface vs Type', description: 'Review declaration merging and union types.', completed: false, resources: ['https://www.typescriptlang.org/docs/'] },
                { day: 2, title: 'Setup Vite React TS App', description: 'Initialize a clean project, configure strict compilation.', completed: false, resources: ['https://vitejs.dev/guide/'] },
                { day: 3, title: 'Advanced React Hooks', description: 'Implement custom useLocalStorage and useWindowSize hooks.', completed: false, resources: ['https://react.dev/reference/react'] }
              ]
            },
            {
              week: 2,
              title: 'Tailwind CSS & Responsive Layouts',
              project: 'Modern Dashboard Shell',
              leetcode: 'Merge Two Sorted Lists, Best Time to Buy/Sell Stock',
              interviewPrep: 'How does Tailwind optimize styles for production?',
              goals: [
                { day: 1, title: 'Implement CSS Grid & Flexbox layouts', description: 'Create dynamic layouts with responsive break-points.', completed: false, resources: ['https://tailwindcss.com'] },
                { day: 2, title: 'Tailwind Custom Theme configs', description: 'Extend tailwind config with custom colors and animation rules.', completed: false, resources: ['https://tailwindcss.com/docs/configuration'] },
                { day: 3, title: 'Component States & Hover Micro-animations', description: 'Add CSS transitions and Framer Motion spring actions.', completed: false, resources: ['https://www.framer.com/motion/'] }
              ]
            }
          ]
        },
        {
          month: 2,
          title: 'Backend Services & API Architectures',
          description: 'Design secure, performant RESTful endpoints and schema validations.',
          completionPercentage: 0,
          concepts: ['Node.js', 'Express', 'JWT Token Rotation', 'Mongoose ORM'],
          milestones: ['Build auth router with refresh tokens', 'Connect to MongoDB'],
          weeks: [
            {
              week: 1,
              title: 'Node & Express Setup',
              project: 'RESTful Auth API',
              leetcode: 'Linked List Cycle, Reverse Linked List',
              interviewPrep: 'Describe Node event loop and single-threaded nature',
              goals: [
                { day: 1, title: 'Express Routing & Middlewares', description: 'Configure global error handlers and 404 route catches.', completed: false, resources: ['https://expressjs.com'] },
                { day: 2, title: 'JWT Access & Refresh Token models', description: 'Generate tokens using crypto secret key, store in cookies.', completed: false, resources: ['https://jwt.io/introduction'] }
              ]
            }
          ]
        }
      ]
    }),
    skillGap: {
      _id: 'mock-sg-fullstack',
      targetRole: 'Full Stack Developer',
      currentSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
      requiredSkills: [
        { skill: 'TypeScript', category: 'Languages', priority: 'critical', difficultyScore: 3, estimatedWeeks: 2, reason: 'Essential for static safety in large scale codebases.', resources: ['https://www.typescriptlang.org/'], hasSkill: false },
        { skill: 'Node.js & Express', category: 'Backend', priority: 'critical', difficultyScore: 4, estimatedWeeks: 3, reason: 'Core stack for building full-stack server runtimes.', resources: ['https://expressjs.com/'], hasSkill: false },
        { skill: 'MongoDB & Mongoose', category: 'Database', priority: 'high', difficultyScore: 3, estimatedWeeks: 2, reason: 'Required for schema validation and MERN modeling.', resources: ['https://mongoosejs.com/'], hasSkill: false },
        { skill: 'Docker & Compose', category: 'DevOps', priority: 'medium', difficultyScore: 4, estimatedWeeks: 2, reason: 'Simplifies environment consistency and deployments.', resources: ['https://www.docker.com/'], hasSkill: false }
      ],
      missingSkills: [
        { skill: 'TypeScript', category: 'Languages', priority: 'critical', difficultyScore: 3, estimatedWeeks: 2, reason: 'Essential for static safety in large scale codebases.', resources: ['https://www.typescriptlang.org/'], hasSkill: false },
        { skill: 'Node.js & Express', category: 'Backend', priority: 'critical', difficultyScore: 4, estimatedWeeks: 3, reason: 'Core stack for building full-stack server runtimes.', resources: ['https://expressjs.com/'], hasSkill: false },
        { skill: 'MongoDB & Mongoose', category: 'Database', priority: 'high', difficultyScore: 3, estimatedWeeks: 2, reason: 'Required for schema validation and MERN modeling.', resources: ['https://mongoosejs.com/'], hasSkill: false },
        { skill: 'Docker & Compose', category: 'DevOps', priority: 'medium', difficultyScore: 4, estimatedWeeks: 2, reason: 'Simplifies environment consistency and deployments.', resources: ['https://www.docker.com/'], hasSkill: false }
      ],
      strengthAreas: ['HTML', 'CSS', 'JavaScript', 'React'],
      overallReadiness: 55,
      recommendedPath: 'Focus on backend fundamentals (Express, DB modeling) first, then bind them together using TypeScript.',
      summary: 'You have a solid frontend core but lack database integration and server routing architecture experience.',
      createdAt: new Date().toISOString()
    },
    projects: {
      _id: 'mock-pr-fullstack',
      targetRole: 'Full Stack Developer',
      createdAt: new Date().toISOString(),
      projects: [
        {
          title: 'Collaborative Real-time Whiteboard',
          description: 'A canvas-based workspace enabling multiple remote team members to sketch and type simultaneously.',
          difficulty: 'advanced',
          techStack: ['React', 'TypeScript', 'Socket.io', 'Node.js', 'Express', 'MongoDB'],
          architecture: 'Client opens websocket connection to the server. Updates are serialized and broadcast to all connected clients in real-time.',
          learningOutcome: ['WebSockets integration', 'Canvas state serialization', 'Token-based socket authentication'],
          resumeValue: 'Engineered a real-time collaborative canvas utilizing WebSockets, reducing state synching latency to sub-80ms for distributed groups.',
          githubStructure: [
            'my-app/',
            '├── client/',
            '│   ├── src/',
            '│   │   ├── components/  # Canvas.tsx, Toolbar.tsx',
            '│   │   └── hooks/       # useSockets.ts',
            '└── server/',
            '    ├── src/',
            '    │   ├── sockets/     # connectionHandler.ts',
            '    │   └── models/      # CanvasState.model.ts'
          ],
          estimatedDays: 14,
          features: ['Socket authentication', 'Multi-layer drawing canvas', 'Chat/Cursor sync overlay'],
          resources: [
            { type: 'Course', title: 'WebSockets from Scratch', url: 'https://socket.io/get-started/chat', description: 'Excellent Socket.io crash course.', isFree: true, rating: 4.8 }
          ]
        }
      ]
    },
    resources: {
      _id: 'mock-re-fullstack',
      topic: 'Full Stack Developer',
      createdAt: new Date().toISOString(),
      resources: [
        { type: 'docs', title: 'MDN Web Docs - Express Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs', description: 'Complete step-by-step Express guide.', isFree: true, rating: 4.9, difficulty: 'beginner', estimatedHours: 12, tags: ['Express', 'Node'] },
        { type: 'youtube', title: 'React Query Tutorial for Beginners', url: 'https://youtube.com', description: 'Fast-paced tutorial on network status caches.', isFree: true, rating: 4.7, difficulty: 'intermediate', estimatedHours: 3, tags: ['React Query', 'REST'] }
      ]
    }
  };

  // 2. AI ENGINEER
  ROLE_TEMPLATES['ai engineer'] = {
    roadmap: (months = 3) => ({
      _id: 'mock-rm-ai',
      targetRole: 'AI Engineer',
      duration: months,
      overallCompletion: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      months: [
        {
          month: 1,
          title: 'Foundations of NLP & LLM Orchestration',
          description: 'Learn to manipulate prompts, utilize LangChain, and engineer vector index search embeddings.',
          completionPercentage: 0,
          concepts: ['LangChain', 'OpenAI/Gemini APIs', 'RAG (Retrieval-Augmented Generation)', 'ChromaDB'],
          milestones: ['Deploy a Vector Store index', 'Build a PDF Question-Answering bot'],
          weeks: [
            {
              week: 1,
              title: 'Vector Embeddings & Semantic Search',
              project: 'PDF Document Query Search Engine',
              leetcode: 'Search in Rotated Sorted Array, Word Search',
              interviewPrep: 'What is cosine similarity and how is it used in semantic indexing?',
              goals: [
                { day: 1, title: 'Understand Vector Space Modeling', description: 'Read about text chunk splitting and chunk overlap parameters.', completed: false, resources: ['https://js.langchain.com/docs/'] },
                { day: 2, title: 'Setup local ChromaDB / Pinecone instance', description: 'Configure collection schemas, index sample textbook texts.', completed: false, resources: ['https://docs.trychroma.com/'] }
              ]
            }
          ]
        }
      ]
    }),
    skillGap: {
      _id: 'mock-sg-ai',
      targetRole: 'AI Engineer',
      currentSkills: ['Python', 'JavaScript', 'HTML/CSS', 'APIs'],
      requiredSkills: [
        { skill: 'LangChain / LlamaIndex', category: 'Frameworks', priority: 'critical', difficultyScore: 4, estimatedWeeks: 3, reason: 'Crucial for building agent workflows and document pipelines.', resources: ['https://js.langchain.com/docs/'], hasSkill: false },
        { skill: 'Vector Databases (Chroma/PGVector)', category: 'Databases', priority: 'critical', difficultyScore: 3, estimatedWeeks: 2, reason: 'Required for implementing RAG memories and document indexing.', resources: ['https://docs.trychroma.com/'], hasSkill: false },
        { skill: 'Agentic Workflows & Tool Callings', category: 'AI Architecture', priority: 'high', difficultyScore: 4, estimatedWeeks: 3, reason: 'Necessary to construct autonomous reasoning processes.', resources: ['https://platform.openai.com/docs/guides/function-calling'], hasSkill: false }
      ],
      missingSkills: [
        { skill: 'LangChain / LlamaIndex', category: 'Frameworks', priority: 'critical', difficultyScore: 4, estimatedWeeks: 3, reason: 'Crucial for building agent workflows and document pipelines.', resources: ['https://js.langchain.com/docs/'], hasSkill: false },
        { skill: 'Vector Databases (Chroma/PGVector)', category: 'Databases', priority: 'critical', difficultyScore: 3, estimatedWeeks: 2, reason: 'Required for implementing RAG memories and document indexing.', resources: ['https://docs.trychroma.com/'], hasSkill: false },
        { skill: 'Agentic Workflows & Tool Callings', category: 'AI Architecture', priority: 'high', difficultyScore: 4, estimatedWeeks: 3, reason: 'Necessary to construct autonomous reasoning processes.', resources: ['https://platform.openai.com/docs/guides/function-calling'], hasSkill: false }
      ],
      strengthAreas: ['Python', 'JavaScript', 'APIs'],
      overallReadiness: 45,
      recommendedPath: 'Start by orchestrating RAG systems manually, then upgrade to multi-agent frameworks (LangGraph, CrewAI).',
      summary: 'Your core language tools are solid. Focus on LLM pipeline concepts, function-calling setups, and embedding matrices.',
      createdAt: new Date().toISOString()
    },
    projects: {
      _id: 'mock-pr-ai',
      targetRole: 'AI Engineer',
      createdAt: new Date().toISOString(),
      projects: [
        {
          title: 'Semantic Search PDF QA Engine',
          description: 'Upload complex documentation textbooks, analyze structural terms, and ask the LLM questions directly referenced in your text.',
          difficulty: 'intermediate',
          techStack: ['Python', 'LangChain', 'FastAPI', 'ChromaDB', 'Gemini Pro'],
          architecture: 'Files are chunked, embedded via API and stored in ChromaDB. When a query is run, semantic vectors lookup matching passages and feed them to LLM.',
          learningOutcome: ['Document chunk optimization', 'Prompt template constraints', 'Structured JSON output bindings'],
          resumeValue: 'Built a semantic QA system utilizing ChromaDB vector search and LangChain RAG, boosting text reference extraction accuracy to 94%.',
          githubStructure: [
            'app/',
            '├── core/',
            '│   ├── parser.py    # text chunk extraction',
            '│   └── embedding.py  # vector ingestion',
            '├── api.py           # FastAPI router',
            '└── main.py'
          ],
          estimatedDays: 7,
          features: ['PDF parser', 'Vector index search', 'Contextual dialogue memory'],
          resources: [
            { type: 'Documentation', title: 'LangChain JS Guide', url: 'https://js.langchain.com/', description: 'Official LangChain client setup guide.', isFree: true, rating: 4.8 }
          ]
        }
      ]
    },
    resources: {
      _id: 'mock-re-ai',
      topic: 'AI Engineer',
      createdAt: new Date().toISOString(),
      resources: [
        { type: 'docs', title: 'OpenAI API Function Calling Guide', url: 'https://platform.openai.com/docs/guides/function-calling', description: 'Deep-dive into how function calling works.', isFree: true, rating: 4.9, difficulty: 'intermediate', estimatedHours: 4, tags: ['OpenAI', 'Tooling'] }
      ]
    }
  };

  // Populate remaining placeholders with "Full Stack" templates modified slightly
  SUPPORTED_ROLES.forEach((role) => {
    if (!ROLE_TEMPLATES[role]) {
      ROLE_TEMPLATES[role] = {
        roadmap: (months) => {
          const base = ROLE_TEMPLATES['full stack'].roadmap(months);
          return {
            ...base,
            _id: `mock-rm-${role}`,
            targetRole: role.charAt(0).toUpperCase() + role.slice(1) + ' Specialist',
            months: base.months.map(m => ({
              ...m,
              title: `${role.toUpperCase()} Phase - ${m.title}`
            }))
          };
        },
        skillGap: {
          ...ROLE_TEMPLATES['full stack'].skillGap,
          _id: `mock-sg-${role}`,
          targetRole: role.charAt(0).toUpperCase() + role.slice(1)
        },
        projects: {
          ...ROLE_TEMPLATES['full stack'].projects,
          _id: `mock-pr-${role}`,
          targetRole: role.charAt(0).toUpperCase() + role.slice(1)
        },
        resources: {
          ...ROLE_TEMPLATES['full stack'].resources,
          _id: `mock-re-${role}`,
          topic: role
        }
      };
    }
  });
};

// Initialize templates
initRoleTemplates();

// ----------------------------------------------------
// 2. DETERMINISTIC AI GENERATORS
// ----------------------------------------------------

export const generateMockResumeAnalysis = (filename: string) => {
  return {
    technicalSkills: ['TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'React.js', 'Redux Toolkit', 'Axios', 'Tailwind CSS'],
    softSkills: ['Collaborative Coding', 'Agile Methodologies', 'Self-motivated Learner', 'Problem Solving'],
    experience: [
      'Developed 4 responsive front-end dashboard shells utilizing React and Tailwind CSS.',
      'Refactored legacy JS scripts to strict, typed TypeScript components, reducing runtime type bugs by 35%.'
    ],
    education: [
      'Bachelor of Technology in Computer Science (GPA: 8.5/10)'
    ],
    projects: [
      'PathForge AI - Smart Career Coach dashboard',
      'Personal portfolio workspace with automated deployment workflows'
    ],
    certifications: [
      'Meta Front-End Developer Professional Certificate'
    ],
    missingInfo: [
      'No explicit Unit Testing library mentioned (Jest/React Testing Library)',
      'No Backend database interaction listed (SQL/MongoDB)'
    ],
    score: 82,
    summary: 'The resume shows strong foundational frontend engineering knowledge, high typing security with TypeScript, and nice layout designs. Adding database validation and cloud deployment targets will elevate it to a mid-level stack candidate.',
    improvements: [
      'Specify Jest or Vitest for client-side unit testing.',
      'Quantify resume metrics (e.g. "reduced bundle size by 20%" instead of "improved performance").',
      'Add a dedicated "DevOps/Deployment" category detailing Docker or Netlify integrations.'
    ],
    atsSuggestions: [
      'Convert layout columns into simple single-column blocks to ensure parser accuracy.',
      'Replace graphics, gauges, or progress rings with text-based metrics.',
      'Add standard headers like "Work Experience" instead of "Chronological History".'
    ],
    betterWording: [
      { original: 'Responsible for writing React components', improved: 'Engineered 12+ scalable, modular React hooks, improving component state reusability by 40%' },
      { original: 'Helped speed up the website load speed', improved: 'Optimized static image assets and code-splitting bundles, reducing Largest Contentful Paint (LCP) by 1.2 seconds' }
    ],
    missingKeywords: ['Vitest', 'NodeJS', 'MongoDB', 'CI/CD Pipelines', 'REST APIs'],
    analyzedAt: new Date().toISOString()
  };
};

export const getMockAICoachReply = (personaId: string, messages: ChatMessage[], userMessage: string): string => {
  const q = userMessage.toLowerCase();
  
  if (personaId === 'tech') {
    if (q.includes('react') || q.includes('virtual dom')) {
      return `### React Virtual DOM & Reconciliation

The **Virtual DOM (VDOM)** is a programming concept where an ideal, or "virtual", representation of a UI is kept in memory and synced with the "real" DOM by a library such as ReactDOM. This process is called **Reconciliation**.

Here is a breakdown of the standard flow:
1. **Render phase**: React calls components, constructs a new virtual tree.
2. **Diffing phase**: React compares the new virtual tree against the old snapshot:
   - Elements of different types destroy the old subtree.
   - Elements of the same type update only the modified attributes.
   - List children use \`key\` attributes to prevent re-rendering unchanged children.
3. **Commit phase**: React applies minimal mutations to the real DOM.

\`\`\`typescript
// React Component Re-render Example
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const SafeButton: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button onClick={onClick} className="btn-primary">
      {label}
    </button>
  );
};
\`\`\`
Let me know if you want to write a custom React hook next!`;
    }

    if (q.includes('system design') || q.includes('architecture')) {
      return `### System Design - Microservices vs Monolith

When scaling applications, architecting the data flow correctly is key:

1. **Monolithic Architecture**:
   - Single deployment unit.
   - Database is shared, low network overhead.
   - *Risk*: Single point of failure, scaling is all-or-nothing.

2. **Microservices Architecture**:
   - Split by domain boundary (Bounded Context).
   - Independent deployment, database-per-service.
   - *Risk*: Network latency, data consistency (requires Saga or Outbox pattern).

Let me know what system design problem you want to drill into (e.g. Rate Limiting, Cache Invalidation, Vector indexing)!`;
    }

    return `I am Dr. Turing, your **Technical Coach**. I can help you with:
- **Coding Interview Prep** (Data structures, algorithms)
- **System Design** (WebSockets, microservices, caches)
- **MERN Stack Debugging** (Express middleware, React state)

You asked: *"${userMessage}"*

Let's break this down. Do you have a specific code block we should audit?`;
  }

  if (personaId === 'behavioral') {
    if (q.includes('fail') || q.includes('time you failed')) {
      return `### Behavioral Question: "Tell me about a time you failed"

This question is designed to test your **self-awareness**, **accountability**, and **learning mindset**.

Here is how you structure this answer using the **STAR Method**:

1. **Situation**: Give brief context (e.g., "During a university group project, we committed to shipping an AI classification portal in 4 weeks").
2. **Task**: What was your responsibility? ("I was in charge of vector storage ingestion").
3. **Action**: The failure and how you reacted ("I failed to check chunk overlap constraints, causing query results to be fragmented. Instead of hiding it, I immediately flagged it to the team, stayed late to write tests, and optimized the parser").
4. **Result**: What did you learn? ("We shipped 2 days late, but my overlap parser became our standard library. I learned the critical value of early validation checks").

Would you like to write a mock response for this so I can review it?`;
    }

    return `Hello! I am Coach Sarah. Preparing behavioral questions is all about structuring your experience into **impactful stories**.

I recommend using the **STAR Method**:
- **S**ituation (Context)
- **T**ask (Goal)
- **A**ction (Your specific work)
- **R**esult (Quantified metrics/outcome)

What question would you like to review? (e.g., "Tell me about a time you had a conflict" or "Describe your proudest technical project").`;
  }

  // Resume Persona
  if (q.includes('bullet') || q.includes('resume template')) {
    return `### Dynamic Resume Bullet Point Templates

When writing resume points, always follow the Google formula:
**"Accomplished [X] as measured by [Y], by doing [Z]"**

Here are three developer templates you can copy:

1. **Frontend Optimizations**:
   - *Draft*: "Cleaned up the React components and styles."
   - *Upgrade*: "Refactored 12+ legacy state managers to React Query hooks, reducing Largest Contentful Paint (LCP) latency by **22%**."

2. **Backend Database Design**:
   - *Draft*: "Connected the backend to Mongo Database."
   - *Upgrade*: "Architected Express REST API schemas with Mongoose indexing, decreasing database request latency by **80ms** for active profiles."

3. **DevOps & Containerization**:
   - *Draft*: "Setup Docker to build the app."
   - *Upgrade*: "Configured a multi-stage Dockerfile deployment on Nginx, decreasing build artifact sizes by **60%**."`;
  }

  return `Welcome to the **Resume Master Workspace**. I am here to help you audit your resume and project presentation.

Ask me to:
- Generate **Google-style resume bullets** for your projects.
- Audit your keyword strategy for ATS parsers.
- Choose which projects are most value-add for your portfolio.`;
};

// ----------------------------------------------------
// 3. SAMPLE PRELOADED DATA FOR RECRUITERS
// ----------------------------------------------------

export const loadRecruiterDemoData = () => {
  const isLoaded = localStorage.getItem('demo_data_preloaded');
  if (isLoaded === 'true') return; // do not overwrite modified state

  // Preload guest status
  localStorage.setItem('isGuest', 'true');
  
  // 1. Profile stats
  const sampleUser = {
    _id: 'guest-user-id',
    name: 'Recruiter Guest',
    email: 'recruiter@company.com',
    college: 'Apex Technical Institute',
    degree: 'B.S.',
    branch: 'Computer Science',
    year: 4,
    cgpa: 9.2,
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    interests: ['Web Development', 'Artificial Intelligence'],
    careerGoal: 'Full Stack Developer',
    streak: 5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  localStorage.setItem('guest_profile', JSON.stringify(sampleUser));

  // 2. Active Resume
  const sampleResume = {
    _id: 'guest-resume-id',
    originalName: 'Abhishek_Resume_FullStack.pdf',
    fileUrl: '#',
    fileType: 'application/pdf',
    fileSize: 154200,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    analysis: generateMockResumeAnalysis('Abhishek_Resume_FullStack.pdf')
  };
  localStorage.setItem('guest_active_resume', JSON.stringify(sampleResume));

  // 3. Active Roadmap
  const fullstackRoadmap = ROLE_TEMPLATES['full stack'].roadmap(3);
  // Pre-complete a couple of days to show progress
  fullstackRoadmap.overallCompletion = 25;
  fullstackRoadmap.months[0].completionPercentage = 50;
  fullstackRoadmap.months[0].weeks[0].goals[0].completed = true;
  fullstackRoadmap.months[0].weeks[0].goals[0].completedAt = new Date().toISOString();
  fullstackRoadmap.months[0].weeks[0].goals[1].completed = true;
  fullstackRoadmap.months[0].weeks[0].goals[1].completedAt = new Date().toISOString();
  localStorage.setItem('guest_active_roadmap', JSON.stringify(fullstackRoadmap));

  // 4. Skill Gap
  const sampleSkillGap = ROLE_TEMPLATES['full stack'].skillGap;
  localStorage.setItem('guest_latest_skillgap', JSON.stringify(sampleSkillGap));

  // 5. Projects
  const sampleProjects = ROLE_TEMPLATES['full stack'].projects;
  localStorage.setItem('guest_latest_projects', JSON.stringify(sampleProjects));

  // 6. Resources
  const sampleResources = [
    ROLE_TEMPLATES['full stack'].resources
  ];
  localStorage.setItem('guest_resources', JSON.stringify(sampleResources));

  // 7. Internships
  const sampleInternships = [
    {
      _id: 'guest-int-1',
      company: 'Stripe',
      role: 'Full Stack Engineer Intern',
      status: 'interview',
      appliedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Passed coding screen! Behavioral with engineering manager is scheduled. Reviewing core system design patterns.',
      location: 'San Francisco, CA',
      isRemote: true,
      salary: '$55/hr',
      tags: ['React', 'Node.js', 'Webhooks'],
      createdAt: new Date().toISOString()
    },
    {
      _id: 'guest-int-2',
      company: 'Google',
      role: 'Software Engineering Intern',
      status: 'applied',
      appliedDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Applied online via career portal. Referred by senior engineer.',
      location: 'Mountain View, CA',
      isRemote: false,
      tags: ['Python', 'Algorithms'],
      createdAt: new Date().toISOString()
    },
    {
      _id: 'guest-int-3',
      company: 'Vercel',
      role: 'Frontend Engineer Intern',
      status: 'offer',
      appliedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Received written offer! Compensation review scheduled next Monday.',
      location: 'Remote',
      isRemote: true,
      salary: '$50/hr',
      tags: ['Next.js', 'React', 'CSS'],
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem('guest_internships', JSON.stringify(sampleInternships));

  // 8. Chat history
  const sampleChat = {
    _id: 'guest-chat-id',
    title: 'TypeScript & System Design Prep',
    messages: [
      { role: 'user', content: 'Explain Virtual DOM and React reconciliation', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: getMockAICoachReply('tech', [], 'Explain Virtual DOM and React reconciliation'), timestamp: new Date(Date.now() - 59 * 60 * 1000).toISOString() }
    ],
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('guest_conversations', JSON.stringify([sampleChat]));
  localStorage.setItem('guest_active_chat', JSON.stringify(sampleChat));

  // 9. Daily Tasks
  const sampleDailyTasks = {
    _id: 'guest-tasks-id',
    date: new Date().toISOString().split('T')[0],
    tasks: [
      { _id: 'guest-t-1', type: 'coding', title: 'Leetcode: Two Sum', description: 'Solve using hash map and verify space/time metrics.', estimatedMinutes: 20, completed: true, completedAt: new Date().toISOString() },
      { _id: 'guest-t-2', type: 'learning', title: 'Review TypeScript generics', description: 'Understand keyof and utility types like Record.', estimatedMinutes: 30, completed: false },
      { _id: 'guest-t-3', type: 'interview', title: 'Behavioral mock prep', description: 'Practice describing your whiteboard project using STAR.', estimatedMinutes: 15, completed: false }
    ],
    totalCompleted: 1,
    totalTasks: 3
  };
  localStorage.setItem('guest_daily_tasks', JSON.stringify(sampleDailyTasks));

  // 10. Dashboard Data mock
  const sampleDashboard = {
    user: { name: 'Recruiter Guest', email: 'recruiter@company.com', streak: 5, skills: ['HTML', 'CSS', 'JavaScript', 'React'], careerGoal: 'Full Stack Developer' },
    resume: { hasResume: true, score: 82, uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    roadmap: { hasRoadmap: true, targetRole: 'Full Stack Developer', completion: 25, duration: 3 },
    skillGap: { hasAnalysis: true, targetRole: 'Full Stack Developer', readiness: 55, missingCount: 4 },
    internships: { total: 3, applied: 1, interview: 1, rejected: 0, selected: 0, offer: 1, withdrawn: 0 },
    streakData: [
      { date: 'Mon', completed: 2, total: 3, percentage: 66 },
      { date: 'Tue', completed: 3, total: 3, percentage: 100 },
      { date: 'Wed', completed: 1, total: 3, percentage: 33 },
      { date: 'Thu', completed: 3, total: 3, percentage: 100 },
      { date: 'Fri', completed: 1, total: 3, percentage: 33 }
    ],
    totalSkills: 5
  };
  localStorage.setItem('guest_dashboard_data', JSON.stringify(sampleDashboard));

  localStorage.setItem('demo_data_preloaded', 'true');
};
