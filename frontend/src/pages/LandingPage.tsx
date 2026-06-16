import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Map,
  TrendingUp,
  Briefcase,
  Flame,
  Award,
  BookOpen,
  Compass,
  MessageSquare,
  LayoutDashboard,
  ArrowRight,
  GitBranch,
  Linkedin,
  Info,
  ShieldAlert,
  Mail,
  Sparkles
} from 'lucide-react';
import { loadRecruiterDemoData } from '../utils/mockTemplates';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock Counters for Stats
  const [usersCount, setUsersCount] = useState(0);
  const [roadmapsCount, setRoadmapsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);

  useEffect(() => {
    // Simple interval counter animation on load
    const userTimer = setInterval(() => {
      setUsersCount((prev) => (prev < 1450 ? prev + 15 : 1450));
    }, 15);
    const roadmapTimer = setInterval(() => {
      setRoadmapsCount((prev) => (prev < 3210 ? prev + 35 : 3210));
    }, 15);
    const projectTimer = setInterval(() => {
      setProjectsCount((prev) => (prev < 980 ? prev + 10 : 980));
    }, 15);

    return () => {
      clearInterval(userTimer);
      clearInterval(roadmapTimer);
      clearInterval(projectTimer);
    };
  }, []);

  const handleExploreDemo = () => {
    // Preload sample datasets and flag guest
    loadRecruiterDemoData();
    localStorage.setItem('isGuest', 'true');
    window.location.href = '/';
  };

  const featureCards = [
    { title: 'AI Resume Analysis', desc: 'Scan and match your resume against job criteria. Optimize wording and fix format flaws for ATS.', icon: FileText },
    { title: 'Skill Gap Analysis', desc: 'Measure your readiness for specific roles and prioritize critical missing competencies.', icon: TrendingUp },
    { title: 'AI Roadmap Generator', desc: 'Construct dynamic, day-by-day learning timelines matching your duration criteria.', icon: Map },
    { title: 'AI Project Suggestions', desc: 'Construct targeted portfolio projects mapping directly to your skill deficits.', icon: Compass },
    { title: 'Learning Resources', desc: 'Access curated articles, documentation, books, and courses categorized by topic.', icon: BookOpen },
    { title: 'Internship Tracker', desc: 'Maintain custom boards tracking applied status, wages, tags, and interview prep.', icon: Briefcase },
    { title: 'AI Career Chat', desc: 'Engage with specialized advisor personas including technical, behavioral, and resume coaches.', icon: MessageSquare },
    { title: 'Progress Dashboard', desc: 'Visualize active stats, daily developer streaks, and pipeline charts.', icon: LayoutDashboard }
  ];

  return (
    <div className="bg-zinc-50 text-zinc-900 min-h-screen flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Navbar Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white font-bold text-sm">
              🧭
            </div>
            <span className="font-extrabold text-zinc-950 tracking-tight text-base">PathForge AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-650">
            <a href="#features" className="hover:text-zinc-950 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">How it works</a>
            <a href="#stats" className="hover:text-zinc-950 transition-colors">Stats</a>
            <button onClick={handleExploreDemo} className="hover:text-zinc-950 transition-colors font-semibold">Demo</button>
            <Link to="/login" className="hover:text-zinc-950 transition-colors">Login</Link>
            <Link to="/register" className="btn-primary py-1.5 px-3.5 text-xs">Sign up</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-250 bg-white text-[10px] font-bold text-zinc-650 uppercase tracking-wider select-none shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-zinc-950" />
            Empowered by Gemini Pro
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.15]">
            Your AI Career Mentor for Smarter Learning and Better Opportunities
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Analyze your resume, identify skill gaps, generate learning roadmaps, build projects, and track internship progress with AI.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary py-3 px-6 text-sm justify-center w-full sm:w-auto shadow-sm">
              Get Started
            </Link>
            <button
              onClick={handleExploreDemo}
              className="btn-secondary py-3 px-6 text-sm justify-center w-full sm:w-auto hover:border-zinc-350"
            >
              Explore Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="bg-white border-y border-zinc-200 py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">Complete AI Career Suite</h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              Every tool required to audit your credentials and prepare for engineering benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((feat, idx) => (
              <div
                key={idx}
                className="border border-zinc-200 rounded-2xl p-6 hover:shadow-md hover:border-zinc-300 transition-all bg-zinc-50/20"
              >
                <div className="p-2.5 bg-zinc-950 text-white rounded-xl w-10 h-10 flex items-center justify-center mb-5 shadow-xs">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-zinc-950 text-base leading-snug">{feat.title}</h3>
                <p className="text-xs text-zinc-550 mt-2 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">How it works</h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            Follow our structural timeline to go from candidate to employee.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4 max-w-5xl mx-auto">
          {[
            { step: '01', title: 'Upload Resume', desc: 'Input your initial credential parameters.' },
            { step: '02', title: 'AI Analysis', desc: 'Identify ATS gaps and phrasing upgrades.' },
            { step: '03', title: 'Roadmap Generation', desc: 'Receive structured weekly learning tasks.' },
            { step: '04', title: 'Learn & Build', desc: 'Develop specific portfolio suggestions.' },
            { step: '05', title: 'Get Internships', desc: 'Track application statuses and practice questions.' }
          ].map((item, idx, arr) => (
            <React.Fragment key={idx}>
              <div className="flex-1 text-center space-y-3 bg-white p-6 border border-zinc-200 rounded-2xl w-full max-w-[200px] shadow-2xs">
                <span className="block text-2xl font-black text-zinc-300">{item.step}</span>
                <h4 className="font-bold text-zinc-900 text-sm">{item.title}</h4>
                <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">{item.desc}</p>
              </div>
              {idx < arr.length - 1 && (
                <div className="hidden lg:flex text-zinc-400 rotate-90 lg:rotate-0">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Stats Counter Section */}
      <section id="stats" className="bg-zinc-950 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="space-y-2">
            <span className="block text-4xl sm:text-5xl font-black text-zinc-50">{usersCount}+</span>
            <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Active users</span>
          </div>
          <div className="space-y-2">
            <span className="block text-4xl sm:text-5xl font-black text-zinc-50">{roadmapsCount}+</span>
            <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Roadmaps created</span>
          </div>
          <div className="space-y-2">
            <span className="block text-4xl sm:text-5xl font-black text-zinc-50">{projectsCount}+</span>
            <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Projects suggested</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-10 px-6 text-zinc-500 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 text-white font-bold text-xs">
              🧭
            </div>
            <span className="font-bold text-zinc-950 tracking-tight">PathForge AI</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://github.com/Abhishek0964/PathForge-AI" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-950 flex items-center gap-1">
              <GitBranch className="h-4 w-4" />
              GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-950 flex items-center gap-1">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
            <a href="#about" className="hover:text-zinc-950 flex items-center gap-1">
              <Info className="h-4 w-4" />
              About
            </a>
            <a href="#privacy" className="hover:text-zinc-950 flex items-center gap-1">
              <ShieldAlert className="h-4 w-4" />
              Privacy
            </a>
            <a href="#contact" className="hover:text-zinc-950 flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Contact
            </a>
          </div>

          <p className="text-[10px] text-zinc-400 font-medium select-none">
            © {new Date().getFullYear()} PathForge AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
