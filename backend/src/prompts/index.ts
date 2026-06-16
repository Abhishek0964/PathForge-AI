export const resumeAnalysisPrompt = (resumeText: string, userProfile?: {
  targetRole?: string;
  skills?: string[];
}) => `You are an expert ATS and resume analyzer with 15+ years of experience in technical recruiting.

Analyze the following resume text and return a comprehensive JSON analysis.

TARGET ROLE CONTEXT: ${userProfile?.targetRole ?? 'General Software Engineering'}
USER'S STATED SKILLS: ${userProfile?.skills?.join(', ') ?? 'Not specified'}

RESUME TEXT:
---
${resumeText}
---

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "technicalSkills": ["array of technical skills found"],
  "softSkills": ["array of soft skills found"],
  "experience": ["array of experience entries as descriptive strings"],
  "education": ["array of education entries"],
  "projects": ["array of project names/descriptions"],
  "certifications": ["array of certifications"],
  "missingInfo": ["list of important missing sections/info"],
  "score": <number 0-100 based on completeness and quality>,
  "summary": "2-3 sentence professional summary of this resume's strengths",
  "improvements": [
    "Specific actionable improvement #1",
    "Specific actionable improvement #2",
    "Specific actionable improvement #3",
    "Specific actionable improvement #4",
    "Specific actionable improvement #5"
  ],
  "atsSuggestions": [
    "ATS optimization tip #1",
    "ATS optimization tip #2",
    "ATS optimization tip #3"
  ],
  "betterWording": [
    {"original": "weak phrase from resume", "improved": "stronger ATS-friendly version"},
    {"original": "another weak phrase", "improved": "improved version"}
  ],
  "missingKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Score breakdown:
- Technical skills (0-25): variety and depth
- Experience (0-20): quality and relevance
- Projects (0-20): complexity and description quality
- Education (0-10): presence and relevance
- Soft skills (0-10): communication, leadership etc.
- Certifications (0-10): relevant credentials
- Missing info penalty (-20): deducted for missing sections`;

export const skillGapPrompt = (
  targetRole: string,
  currentSkills: string[],
  resumeText?: string
) => `You are a senior technical career advisor specializing in ${targetRole} roles.

Analyze the skill gap for someone targeting the role of: ${targetRole}

CURRENT SKILLS: ${currentSkills.join(', ')}

${resumeText ? `RESUME CONTEXT:\n${resumeText.substring(0, 2000)}` : ''}

Return ONLY valid JSON (no markdown) in this exact format:
{
  "requiredSkills": [
    {
      "skill": "skill name",
      "category": "category (e.g., Language, Framework, Tool, Concept)",
      "priority": "critical|high|medium|low",
      "difficultyScore": <1-10>,
      "estimatedWeeks": <number>,
      "reason": "why this skill matters for ${targetRole}",
      "resources": ["resource1", "resource2"],
      "hasSkill": <true if current skills include this>
    }
  ],
  "missingSkills": [
    {
      "skill": "missing skill name",
      "category": "category",
      "priority": "critical|high|medium|low",
      "difficultyScore": <1-10>,
      "estimatedWeeks": <number>,
      "reason": "specific reason this skill is needed",
      "resources": ["top resource URL or name"],
      "hasSkill": false
    }
  ],
  "strengthAreas": ["area where candidate is strong"],
  "overallReadiness": <0-100 percentage ready for role>,
  "recommendedPath": "brief recommended learning path description",
  "summary": "2-3 sentence summary of gap analysis"
}

Include at least 8-12 required skills and identify all critical missing skills.
Focus on ${new Date().getFullYear()} market requirements for ${targetRole}.`;

export const roadmapPrompt = (
  targetRole: string,
  currentSkills: string[],
  duration: number,
  missingSkills: string[]
) => `You are an expert engineering curriculum designer creating a personalized learning roadmap.

TARGET ROLE: ${targetRole}
DURATION: ${duration} months
CURRENT SKILLS: ${currentSkills.join(', ')}
KEY SKILLS TO LEARN: ${missingSkills.slice(0, 10).join(', ')}

Create a detailed, actionable ${duration}-month roadmap. Return ONLY valid JSON:
{
  "months": [
    {
      "month": 1,
      "title": "Month title",
      "description": "What this month focuses on",
      "concepts": ["concept1", "concept2", "concept3"],
      "milestones": ["milestone1", "milestone2"],
      "completionPercentage": 0,
      "weeks": [
        {
          "week": 1,
          "title": "Week 1 title",
          "project": "Mini project to build this week",
          "interviewPrep": "Interview topic to study",
          "leetcode": "LeetCode topic/pattern to practice",
          "goals": [
            {
              "day": 1,
              "title": "Day goal title",
              "description": "Specific task for this day",
              "resources": ["https://resource-url-or-name"],
              "completed": false
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Create exactly ${duration} month objects
- Each month has exactly 4 weeks
- Each week has exactly 5 day goals (Mon-Fri)
- Make it progressive: fundamentals → intermediate → advanced → interview ready
- Include real technologies: specific docs, GitHub repos, YouTube channels
- Month ${Math.ceil(duration * 0.75)}+ should focus heavily on projects and interview prep
- Make every day goal specific and actionable`;

export const projectSuggestionsPrompt = (
  targetRole: string,
  currentSkills: string[],
  missingSkills: string[]
) => `You are a senior software architect creating portfolio project ideas for someone targeting ${targetRole}.

CURRENT SKILLS: ${currentSkills.join(', ')}
SKILLS TO PRACTICE: ${missingSkills.slice(0, 8).join(', ')}

Generate 9 projects (3 beginner, 3 intermediate, 3 advanced). Return ONLY valid JSON:
{
  "projects": [
    {
      "title": "Project Name",
      "description": "2-3 sentence description of what this project does",
      "difficulty": "beginner|intermediate|advanced",
      "techStack": ["tech1", "tech2", "tech3"],
      "architecture": "Brief architecture description (e.g., REST API + React SPA + MongoDB)",
      "learningOutcome": ["what you'll learn #1", "what you'll learn #2"],
      "resumeValue": "Why this project stands out on a resume",
      "githubStructure": [
        "/src",
        "/src/components",
        "/api",
        "README.md",
        ".env.example"
      ],
      "estimatedDays": <number>,
      "features": ["feature1", "feature2", "feature3", "feature4"],
      "resources": [
        {
          "type": "youtube|course|documentation|github|blog",
          "title": "Resource title",
          "url": "https://actual-url.com",
          "description": "What this resource covers",
          "isFree": true,
          "rating": 4.5
        }
      ]
    }
  ]
}

Focus on projects relevant to ${targetRole} in ${new Date().getFullYear()}.
Make projects that demonstrate real production skills recruiters look for.`;

export const learningResourcesPrompt = (topic: string, role?: string) =>
  `You are an expert learning advisor recommending the best resources for: ${topic}
${role ? `Target Role: ${role}` : ''}

Curate 12-15 high-quality, real learning resources. Return ONLY valid JSON:
{
  "resources": [
    {
      "type": "youtube|course|documentation|blog|github|book|practice",
      "title": "Exact resource title",
      "url": "https://real-url.com",
      "description": "What you'll learn from this",
      "isFree": true,
      "rating": 4.5,
      "difficulty": "beginner|intermediate|advanced",
      "estimatedHours": <number>,
      "tags": ["tag1", "tag2"]
    }
  ]
}

Include a mix of: official docs, YouTube channels, free courses, GitHub repos, practice sites.
Prioritize: official documentation, freeCodeCamp, MDN, CS50, roadmap.sh, GitHub repos with 10k+ stars.
Make all URLs real and accessible.`;

export const dailyTasksPrompt = (
  userSkills: string[],
  careerGoal: string,
  currentDate: string
) => `You are an AI coach generating daily learning tasks for a developer.

DATE: ${currentDate}
CAREER GOAL: ${careerGoal}
SKILLS: ${userSkills.join(', ')}

Generate exactly 7 tasks for today. Return ONLY valid JSON:
{
  "tasks": [
    {
      "type": "learning",
      "title": "Task title",
      "description": "Specific, actionable description of what to do",
      "estimatedMinutes": 30,
      "resources": ["https://resource-url"]
    },
    {
      "type": "learning",
      "title": "Second learning task",
      "description": "Description",
      "estimatedMinutes": 45,
      "resources": []
    },
    {
      "type": "learning",
      "title": "Third learning task",
      "description": "Description",
      "estimatedMinutes": 30,
      "resources": []
    },
    {
      "type": "coding",
      "title": "Coding challenge",
      "description": "Specific coding task (LeetCode problem #, project feature, etc.)",
      "estimatedMinutes": 60,
      "resources": ["https://leetcode.com"]
    },
    {
      "type": "revision",
      "title": "Revision task",
      "description": "What concept to revise and how",
      "estimatedMinutes": 20,
      "resources": []
    },
    {
      "type": "interview",
      "title": "Interview question of the day",
      "description": "Question + hint on how to answer it",
      "estimatedMinutes": 15,
      "resources": []
    },
    {
      "type": "challenge",
      "title": "Daily challenge",
      "description": "A stretching challenge task",
      "estimatedMinutes": 30,
      "resources": []
    }
  ]
}`;

export const careerChatPrompt = (
  userContext: {
    name: string;
    skills: string[];
    careerGoal?: string;
    targetRole?: string;
  },
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string
) => `You are an expert AI career coach specializing in software engineering careers. You have deep knowledge of:
- Software development career paths
- Technical interview preparation
- Resume optimization
- Skill development strategies
- Industry trends and job market

USER CONTEXT:
- Name: ${userContext.name}
- Skills: ${userContext.skills.join(', ')}
- Career Goal: ${userContext.careerGoal ?? 'Software Engineer'}

CONVERSATION HISTORY:
${conversationHistory.slice(-10).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

USER: ${userMessage}

Respond as a knowledgeable, encouraging career coach. Be specific and actionable.
Use markdown formatting for code blocks and lists.
Keep responses concise but complete (under 400 words unless a detailed plan is needed).
If asked for a roadmap or specific plan, provide structured markdown with headers.`;
