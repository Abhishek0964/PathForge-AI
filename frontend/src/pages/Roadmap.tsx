import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Map,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Trash2,
  Cpu,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  ExternalLink,
  Code,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { roadmapService } from '../services';

export const Roadmap: React.FC = () => {
  const queryClient = useQueryClient();
  const [targetRole, setTargetRole] = useState('');
  const [duration, setDuration] = useState(3);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(1);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  // Fetch active roadmap
  const { data: activeRoadmap, isLoading: isActiveLoading } = useQuery({
    queryKey: ['activeRoadmap'],
    queryFn: async () => {
      try {
        const res = await roadmapService.getActive();
        return res.data.roadmap;
      } catch {
        return null;
      }
    },
  });

  // Generate Roadmap mutation
  const generateMutation = useMutation({
    mutationFn: async ({ role, mos }: { role: string; mos: number }) => {
      const res = await roadmapService.generate(role, mos);
      return res.data.roadmap;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTargetRole('');
      toast.success(`AI Roadmap generated for ${data.targetRole}!`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Generation failed';
      toast.error(msg);
    },
  });

  // Checkbox completion toggle mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (params: {
      roadmapId: string;
      monthIndex: number;
      weekIndex: number;
      dayIndex: number;
      completed: boolean;
    }) => {
      const res = await roadmapService.updateTask(params);
      return res.data.roadmap;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      toast.error('Failed to update task state');
    },
  });

  // Delete roadmap mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await roadmapService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Active roadmap deleted');
    },
  });

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      toast.error('Please enter a target role name');
      return;
    }
    generateMutation.mutate({ role: targetRole, mos: duration });
  };

  if (isActiveLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
          <p className="text-sm font-medium text-zinc-500">Retrieving active roadmap...</p>
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">AI Learning Roadmap</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Accelerate your career preparation with custom structured day-by-day study roadmaps.
          </p>
        </div>
        {activeRoadmap && (
          <button
            onClick={() => deleteMutation.mutate(activeRoadmap._id)}
            disabled={deleteMutation.isPending}
            className="btn-danger py-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Roadmap
          </button>
        )}
      </div>

      {!activeRoadmap ? (
        /* Roadmap Generator Form */
        <div className="max-w-2xl mx-auto mt-6">
          <div className="card space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-150 pb-4">
              <div className="p-2 bg-zinc-900 text-white rounded-lg">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Roadmap Architect</h3>
                <p className="text-xs text-zinc-500">Input your career targets to generate a curated timeline</p>
              </div>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-5">
              <div>
                <label className="label">Target Job Role</label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="input"
                  placeholder="e.g. Full Stack Developer, Machine Learning Engineer, DevOps"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="label">Timeline Duration (Months)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="input"
                  disabled={isGenerating}
                >
                  <option value={1}>1 Month (Sprint Bootcamp)</option>
                  <option value={2}>2 Months (Standard Prep)</option>
                  <option value={3}>3 Months (Comprehensive study)</option>
                  <option value={6}>6 Months (In-depth training)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="btn-primary w-full justify-center py-2.5 mt-2"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 animate-spin" />
                    Assembling study curriculum...
                  </div>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 fill-white" />
                    Generate AI Roadmap
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Active Roadmap Render */
        <div className="space-y-6">
          {/* Target Info and Progress Card */}
          <div className="card flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Target Role</span>
              <h2 className="text-xl font-bold text-zinc-900">{activeRoadmap.targetRole}</h2>
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {activeRoadmap.duration} Months Curriculum
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-amber-500" />
                  {activeRoadmap.overallCompletion}% Done
                </span>
              </div>
            </div>

            <div className="w-full md:w-64">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 mb-1.5">
                <span>Overall Completion</span>
                <span>{activeRoadmap.overallCompletion}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden border">
                <div
                  className="h-full bg-zinc-900 transition-all duration-500"
                  style={{ width: `${activeRoadmap.overallCompletion}%` }}
                />
              </div>
            </div>
          </div>

          {/* Month accordion list */}
          <div className="space-y-4">
            {activeRoadmap.months.map((month) => {
              const isMonthExpanded = expandedMonth === month.month;
              return (
                <div key={month.month} className="card p-0 overflow-hidden">
                  {/* Month Header Clickable bar */}
                  <div
                    onClick={() => setExpandedMonth(isMonthExpanded ? null : month.month)}
                    className="flex items-center justify-between p-5 cursor-pointer bg-zinc-50/50 hover:bg-zinc-50 border-b transition-colors select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-sm">
                        M{month.month}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 text-base">{month.title}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{month.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                        {month.completionPercentage}% Complete
                      </span>
                      {isMonthExpanded ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
                    </div>
                  </div>

                  {/* Month Body content */}
                  {isMonthExpanded && (
                    <div className="p-6 space-y-6">
                      {/* Concepts and Milestones metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-xs">
                        <div>
                          <h5 className="font-bold text-zinc-900 mb-2 uppercase tracking-wide">Key Concepts</h5>
                          <div className="flex flex-wrap gap-1">
                            {month.concepts.map((concept, i) => (
                              <span key={i} className="badge bg-white border border-zinc-200 text-zinc-700">
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-bold text-zinc-900 mb-2 uppercase tracking-wide">Milestones</h5>
                          <ul className="space-y-1 text-zinc-650 font-medium">
                            {month.milestones.map((milestone, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-zinc-400" />
                                <span>{milestone}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Expandable weeks timeline */}
                      <div className="space-y-4">
                        {month.weeks.map((week) => {
                          const weekKey = `${month.month}-${week.week}`;
                          const isWeekExpanded = expandedWeek === weekKey;
                          return (
                            <div key={week.week} className="border border-zinc-200 rounded-xl overflow-hidden">
                              {/* Week Header */}
                              <div
                                onClick={() => setExpandedWeek(isWeekExpanded ? null : weekKey)}
                                className="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-zinc-50/50 select-none"
                              >
                                <div className="flex items-center gap-2">
                                  <Layers className="h-4 w-4 text-zinc-400" />
                                  <span className="font-bold text-sm text-zinc-800">Week {week.week}: {week.title}</span>
                                </div>
                                {isWeekExpanded ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                              </div>

                              {/* Week details & tasks checklist */}
                              {isWeekExpanded && (
                                <div className="p-4 border-t border-zinc-200 bg-linear-to-b from-zinc-50/30 to-white space-y-4">
                                  {/* Week project and resources info */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div className="p-3 bg-white border border-zinc-200 rounded-lg">
                                      <h6 className="font-bold text-zinc-900 mb-1 flex items-center gap-1">
                                        <Code className="h-3.5 w-3.5 text-zinc-500" />
                                        Weekly Project
                                      </h6>
                                      <p className="text-zinc-600 font-medium leading-relaxed">{week.project}</p>
                                    </div>
                                    <div className="p-3 bg-white border border-zinc-200 rounded-lg">
                                      <h6 className="font-bold text-zinc-900 mb-1 flex items-center gap-1">
                                        <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
                                        Leetcode Focus
                                      </h6>
                                      <p className="text-zinc-600 font-medium leading-relaxed">{week.leetcode}</p>
                                    </div>
                                    <div className="p-3 bg-white border border-zinc-200 rounded-lg">
                                      <h6 className="font-bold text-zinc-900 mb-1 flex items-center gap-1">
                                        <Award className="h-3.5 w-3.5 text-zinc-500" />
                                        Interview Prep
                                      </h6>
                                      <p className="text-zinc-600 font-medium leading-relaxed">{week.interviewPrep}</p>
                                    </div>
                                  </div>

                                  {/* Checklist mapping */}
                                  <div className="space-y-2.5">
                                    <h6 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Goal Checklist</h6>
                                    <div className="space-y-2">
                                      {week.goals.map((goal, goalIdx) => (
                                        <div
                                          key={goalIdx}
                                          className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                            goal.completed
                                              ? 'bg-zinc-50/40 border-zinc-100 text-zinc-400'
                                              : 'bg-white border-zinc-200 hover:border-zinc-350'
                                          }`}
                                        >
                                          <button
                                            onClick={() =>
                                              updateTaskMutation.mutate({
                                                roadmapId: activeRoadmap._id,
                                                monthIndex: month.month - 1,
                                                weekIndex: week.week - 1,
                                                dayIndex: goalIdx,
                                                completed: !goal.completed,
                                              })
                                            }
                                            disabled={updateTaskMutation.isPending}
                                            className="mt-0.5 text-zinc-500 hover:text-zinc-900 flex-shrink-0"
                                          >
                                            {goal.completed ? (
                                              <CheckCircle className="h-4.5 w-4.5 text-emerald-600 fill-emerald-50 border-transparent" />
                                            ) : (
                                              <Circle className="h-4.5 w-4.5 border-zinc-300" />
                                            )}
                                          </button>
                                          <div className="min-w-0 flex-1">
                                            <p className={`text-xs font-semibold ${goal.completed ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                                              Day {goal.day}: {goal.title}
                                            </p>
                                            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{goal.description}</p>
                                            {goal.resources && goal.resources.length > 0 && (
                                              <div className="flex flex-wrap gap-2 mt-2">
                                                {goal.resources.map((res, rIdx) => (
                                                  <a
                                                    key={rIdx}
                                                    href={res}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-zinc-650 bg-zinc-100 border hover:bg-zinc-200 hover:text-zinc-900 rounded px-1.5 py-0.5"
                                                  >
                                                    Resource {rIdx + 1}
                                                    <ExternalLink className="h-2 w-2" />
                                                  </a>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
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
      )}
    </div>
  );
};

export default Roadmap;
