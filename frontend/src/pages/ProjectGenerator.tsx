import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Cpu,
  RefreshCw,
  FolderTree,
  ExternalLink,
  Star,
  Copy,
  Check,
  CheckCircle,
  Layout,
  Code,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { projectService } from '../services';

export const ProjectGenerator: React.FC = () => {
  const queryClient = useQueryClient();
  const [targetRole, setTargetRole] = useState('');
  const [selectedProjectIdx, setSelectedProjectIdx] = useState<number | null>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Fetch latest project suggestion doc
  const { data: suggestionDoc, isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ['latestProjectSuggestion'],
    queryFn: async () => {
      try {
        const res = await projectService.getLatest();
        return res.data.suggestion;
      } catch {
        return null;
      }
    },
  });

  // Generate Projects mutation
  const generateMutation = useMutation({
    mutationFn: async (role?: string) => {
      const res = await projectService.generate(role);
      return res.data.suggestion;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['latestProjectSuggestion'] });
      setSelectedProjectIdx(0);
      setTargetRole('');
      toast.success(`AI Projects suggestions compiled for ${data.targetRole || 'your career'}!`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Projects generation failed';
      toast.error(msg);
    },
  });

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate(targetRole.trim() ? targetRole : undefined);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Copied resume bullet point!');
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  if (isSuggestionsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
          <p className="text-sm font-medium text-zinc-500">Retrieving project suggestions...</p>
        </div>
      </div>
    );
  }

  const isGenerating = generateMutation.isPending;
  const projectList = suggestionDoc?.projects || [];
  const activeProject = selectedProjectIdx !== null ? projectList[selectedProjectIdx] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">AI Project Generator</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Build production-grade projects suggested by AI to showcase on your portfolio and resume.
          </p>
        </div>
        {suggestionDoc && (
          <button
            onClick={() => generateMutation.mutate(suggestionDoc.targetRole)}
            disabled={isGenerating}
            className="btn-secondary py-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate suggestions
          </button>
        )}
      </div>

      {!suggestionDoc ? (
        /* Empty / Generator input card */
        <div className="max-w-2xl mx-auto mt-6">
          <div className="card space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-150 pb-4">
              <div className="p-2 bg-zinc-900 text-white rounded-lg">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">AI Project Advisor</h3>
                <p className="text-xs text-zinc-500">Specify your career goal to tailor portfolio suggestions</p>
              </div>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-5">
              <div>
                <label className="label">Target Job Role (Optional)</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="input"
                  placeholder="e.g. React Native Developer, Data Analyst (Defaults to your profile goal)"
                  disabled={isGenerating}
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="btn-primary w-full justify-center py-2.5 mt-2"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 animate-spin" />
                    Generating bespoke projects...
                  </div>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 fill-white" />
                    Suggest Portfolio Projects
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Display suggestions layout */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left panel: projects list selector */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider select-none">
              Suggested Projects for {suggestionDoc.targetRole}
            </h3>
            <div className="space-y-3">
              {projectList.map((project, idx) => {
                const isActive = selectedProjectIdx === idx;
                
                let diffBadge = 'badge bg-zinc-100 text-zinc-700';
                if (project.difficulty === 'beginner') diffBadge = 'badge bg-emerald-50 text-emerald-700 border border-emerald-100';
                else if (project.difficulty === 'intermediate') diffBadge = 'badge bg-blue-50 text-blue-700 border border-blue-100';
                else if (project.difficulty === 'advanced') diffBadge = 'badge bg-red-50 text-red-750 border border-red-100';

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedProjectIdx(idx)}
                    className={`card-hover p-4 select-none transition-all ${
                      isActive
                        ? 'border-zinc-900 bg-zinc-50/20 ring-1 ring-zinc-900'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase ${diffBadge}`}>
                        {project.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
                        <Clock className="h-3 w-3" />
                        {project.estimatedDays} Days
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-900 text-sm mt-2.5 truncate">{project.title}</h4>
                    <p className="text-xs text-zinc-450 mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Custom generator card below suggestions list */}
            <div className="card p-4 bg-zinc-50/50 border-dashed">
              <h5 className="text-xs font-bold text-zinc-800 mb-2">Want a different stack?</h5>
              <form onSubmit={handleGenerateSubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="input py-1.5 px-3 text-xs"
                  placeholder="e.g. Next.js / Python Developer"
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="btn-primary py-1.5 px-3 text-xs"
                >
                  Go
                </button>
              </form>
            </div>
          </div>

          {/* Right panel: Active Project detailed metadata display */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeProject && (
                <motion.div
                  key={selectedProjectIdx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Title and Description */}
                  <div className="card">
                    <h2 className="text-2xl font-bold text-zinc-900">{activeProject.title}</h2>
                    <p className="text-sm text-zinc-650 mt-3 leading-relaxed font-medium">
                      {activeProject.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-5">
                      {activeProject.techStack.map((tech, i) => (
                        <span key={i} className="badge bg-zinc-900 text-white font-semibold text-xs py-0.5 px-2.5">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Architecture & Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Architecture Details */}
                    <div className="card">
                      <div className="flex items-center gap-2 mb-3">
                        <Layers className="h-4.5 w-4.5 text-zinc-500" />
                        <h4 className="font-bold text-zinc-900 text-sm">System Architecture</h4>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                        {activeProject.architecture}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="card">
                      <div className="flex items-center gap-2 mb-3">
                        <Layout className="h-4.5 w-4.5 text-zinc-500" />
                        <h4 className="font-bold text-zinc-900 text-sm">Target MVP Features</h4>
                      </div>
                      <ul className="text-xs space-y-2 text-zinc-605">
                        {activeProject.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 text-zinc-600 font-medium">
                            <CheckCircle className="h-4 w-4 mt-0.5 text-zinc-400 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Github Directory layout structure mockup */}
                  <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                      <FolderTree className="h-4.5 w-4.5 text-zinc-500" />
                      <h4 className="font-bold text-zinc-900 text-sm">Repository structure suggestion</h4>
                    </div>
                    <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed select-all">
                      {activeProject.githubStructure.join('\n')}
                    </pre>
                  </div>

                  {/* Resume Value Bullet point generator */}
                  <div className="card border-amber-250 bg-amber-50/15">
                    <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4.5 w-4.5 text-amber-600" />
                        <h4 className="font-bold text-amber-900 text-sm">ATS Resume Bullet Point</h4>
                      </div>
                      <button
                        onClick={() => copyToClipboard(activeProject.resumeValue, selectedProjectIdx || 0)}
                        className="btn-ghost p-1 bg-white hover:bg-amber-100 border border-amber-200 text-amber-800 transition-colors"
                        title="Copy to Clipboard"
                      >
                        {copiedIdx === selectedProjectIdx ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-zinc-800 leading-relaxed italic">
                      "{activeProject.resumeValue}"
                    </p>
                  </div>

                  {/* Curated Resources */}
                  {activeProject.resources && activeProject.resources.length > 0 && (
                    <div className="card space-y-4">
                      <div className="flex items-center gap-2">
                        <Code className="h-4.5 w-4.5 text-zinc-500" />
                        <h4 className="font-bold text-zinc-900 text-sm">Curated Study Materials & References</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeProject.resources.map((res, i) => (
                          <div key={i} className="p-3 border border-zinc-200 rounded-xl bg-zinc-50/30 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 uppercase">
                                <span>{res.type}</span>
                                <span className={res.isFree ? 'text-emerald-600 font-bold' : 'text-zinc-500 font-bold'}>
                                  {res.isFree ? 'Free' : 'Paid'}
                                </span>
                              </div>
                              <h5 className="font-bold text-zinc-900 text-xs mt-1">{res.title}</h5>
                              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{res.description}</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-zinc-100 pt-2.5 mt-3">
                              <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-semibold">
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-transparent" />
                                <span>{res.rating.toFixed(1)}/5.0</span>
                              </div>
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-zinc-900 hover:underline"
                              >
                                Learn More
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGenerator;
