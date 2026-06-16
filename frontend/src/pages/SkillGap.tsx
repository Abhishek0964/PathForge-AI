import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Cpu,
  Trash2,
  CheckCircle,
  AlertCircle,
  Plus,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Zap,
  Target,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { skillGapService } from '../services';

export const SkillGap: React.FC = () => {
  const queryClient = useQueryClient();
  const [targetRole, setTargetRole] = useState('');

  // Fetch latest skill gap analysis
  const { data: latestAnalysis, isLoading: isLatestLoading } = useQuery({
    queryKey: ['latestSkillGap'],
    queryFn: async () => {
      try {
        const res = await skillGapService.getLatest();
        return res.data.skillGap;
      } catch {
        return null;
      }
    },
  });

  // Generate Skill Gap mutation
  const generateMutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await skillGapService.generate(role);
      return res.data.skillGap;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['latestSkillGap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTargetRole('');
      toast.success(`AI Skill Gap analyzed for ${data.targetRole}!`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gap analysis failed';
      toast.error(msg);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await skillGapService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestSkillGap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Skill gap analysis cleared');
    },
  });

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      toast.error('Please enter a target career role name');
      return;
    }
    generateMutation.mutate(targetRole);
  };

  if (isLatestLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
          <p className="text-sm font-medium text-zinc-500">Retrieving gap analysis...</p>
        </div>
      </div>
    );
  }

  const isGenerating = generateMutation.isPending;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">AI Skill Gap Hub</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Compare your profile skills against target industry roles to discover your roadmap focus.
          </p>
        </div>
        {latestAnalysis && (
          <button
            onClick={() => deleteMutation.mutate(latestAnalysis._id)}
            disabled={deleteMutation.isPending}
            className="btn-danger py-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Analysis
          </button>
        )}
      </div>

      {!latestAnalysis ? (
        /* Generator Form UI */
        <div className="max-w-2xl mx-auto mt-6">
          <div className="card space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-150 pb-4">
              <div className="p-2 bg-zinc-900 text-white rounded-lg">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Skill Gap Analyzer</h3>
                <p className="text-xs text-zinc-500">Select your destination role to run the gap assessment</p>
              </div>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-5">
              <div>
                <label className="label">Target Career Destination</label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="input"
                  placeholder="e.g. Frontend Developer, Data Engineer, Cloud Architect"
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
                    Calculating skill alignment...
                  </div>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 fill-white" />
                    Run Gap Analysis
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Active Analysis Dashboard */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Panel: Readiness score and overview summaries */}
          <div className="space-y-6">
            {/* Readiness Card */}
            <div className="card flex flex-col items-center text-center p-8">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                Job Readiness Index
              </span>
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="#e4e4e7"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - latestAnalysis.overallReadiness / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-zinc-900">
                    {latestAnalysis.overallReadiness}%
                  </span>
                </div>
              </div>
              <h4 className="font-bold text-zinc-900 mt-4">{latestAnalysis.targetRole}</h4>
              <p className="text-xs text-zinc-450 mt-1 select-none">
                Comparing {latestAnalysis.currentSkills.length} of your skills
              </p>
            </div>

            {/* AI Summary Card */}
            <div className="card space-y-4">
              <div>
                <h4 className="font-bold text-zinc-900 text-sm">Gap Overview</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{latestAnalysis.summary}</p>
              </div>
              <div className="border-t border-zinc-100 pt-4">
                <h4 className="font-bold text-zinc-900 text-sm">Recommended Path</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{latestAnalysis.recommendedPath}</p>
              </div>
            </div>

            {/* Strengths Card */}
            <div className="card bg-emerald-50/20 border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                <h4 className="font-bold text-emerald-950 text-sm">Your Strength Areas</h4>
              </div>
              {latestAnalysis.strengthAreas.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {latestAnalysis.strengthAreas.map((str, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {str}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No direct strength areas identified yet.</p>
              )}
            </div>
          </div>

          {/* Right Panel: Missing skills list ordered by priority */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-zinc-900">Required Skills Gap Analysis</h3>
            <div className="space-y-4">
              {latestAnalysis.missingSkills.map((item, idx) => {
                const isCritical = item.priority === 'critical';
                const isHigh = item.priority === 'high';
                const isMed = item.priority === 'medium';
                
                let badgeClass = 'bg-zinc-100 text-zinc-700';
                if (isCritical) badgeClass = 'bg-red-50 text-red-700 border border-red-200';
                else if (isHigh) badgeClass = 'bg-amber-50 text-amber-700 border border-amber-200';
                else if (isMed) badgeClass = 'bg-blue-50 text-blue-700 border border-blue-200';

                return (
                  <div key={idx} className="card p-5 space-y-4">
                    {/* Skill Info Row */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-zinc-900 text-base">{item.skill}</h4>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badgeClass}`}>
                            {item.priority} Priority
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-100 rounded px-1.5 py-0.5 mt-1.5 inline-block">
                          Category: {item.category}
                        </span>
                      </div>

                      <div className="flex gap-4 text-xs font-semibold text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                        <div className="text-center">
                          <span className="block text-[10px] uppercase text-zinc-400">Difficulty</span>
                          <span className="text-zinc-800 font-bold">{item.difficultyScore}/5</span>
                        </div>
                        <div className="w-px bg-zinc-200" />
                        <div className="text-center">
                          <span className="block text-[10px] uppercase text-zinc-400">Study Time</span>
                          <span className="text-zinc-800 font-bold">{item.estimatedWeeks} wks</span>
                        </div>
                      </div>
                    </div>

                    {/* Description reasoning */}
                    <p className="text-xs text-zinc-650 leading-relaxed font-medium">
                      <Zap className="h-3.5 w-3.5 inline mr-1 text-amber-500 fill-amber-100" />
                      {item.reason}
                    </p>

                    {/* Resources links list */}
                    {item.resources && item.resources.length > 0 && (
                      <div className="border-t border-zinc-100 pt-3 space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          Curated Learning Materials
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.resources.map((res, rIdx) => {
                            // Extract title or show label
                            const isLink = res.startsWith('http');
                            return isLink ? (
                              <a
                                key={rIdx}
                                href={res}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-750 hover:text-zinc-900 transition-colors"
                              >
                                <span className="truncate max-w-[180px]">Reference Link {rIdx + 1}</span>
                                <ExternalLink className="h-3.5 w-3.5 text-zinc-450" />
                              </a>
                            ) : (
                              <div
                                key={rIdx}
                                className="p-2.5 bg-zinc-50 border border-zinc-150 rounded-lg text-xs font-medium text-zinc-600"
                              >
                                {res}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGap;
