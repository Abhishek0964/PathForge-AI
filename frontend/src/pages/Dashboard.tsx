import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Map,
  TrendingUp,
  Briefcase,
  Flame,
  Award,
  CheckCircle,
  Circle,
  Plus,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  CheckSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { dashboardService, dailyTaskService } from '../services';

export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch dashboard overview
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardService.get();
      return res.data.dashboard;
    },
  });

  // Fetch today's daily tasks
  const { data: dailyTaskData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['todayTasks'],
    queryFn: async () => {
      try {
        const res = await dailyTaskService.getToday();
        return res.data.dailyTask;
      } catch {
        return null;
      }
    },
  });

  // Complete a task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const res = await dailyTaskService.complete(taskId, completed);
      return res.data.dailyTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (isDashboardLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
          <p className="text-sm font-medium text-zinc-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const streakChartData = stats?.streakData || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Welcome back, {stats?.user.name}!
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Here's what is happening with your career roadmap and job search today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/coach" className="btn-secondary">
            <MessageSquare className="h-4 w-4" />
            Talk to AI Coach
          </Link>
          <Link to="/resume" className="btn-primary">
            <Plus className="h-4 w-4" />
            Upload Resume
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Streak */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Daily Streak</span>
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
              <Flame className="h-5 w-5 fill-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-zinc-900">{stats?.user.streak || 0}</span>
            <span className="text-sm font-semibold text-zinc-500 ml-1">days</span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">Keep completing tasks daily!</p>
        </motion.div>

        {/* Resume Score */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Resume ATS</span>
            <div className="p-1.5 bg-zinc-900 rounded-lg text-white">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-zinc-900">
              {stats?.resume.score !== null ? `${stats?.resume.score}/100` : '—'}
            </span>
          </div>
          {stats?.resume.hasResume ? (
            <Link to="/resume" className="text-xs text-zinc-900 font-medium hover:underline mt-2 flex items-center gap-1">
              View analysis <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <Link to="/resume" className="text-xs text-zinc-500 hover:underline mt-2 flex items-center gap-1">
              Upload first resume <Plus className="h-3 w-3" />
            </Link>
          )}
        </motion.div>

        {/* Roadmap Progress */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Roadmap Prep</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
              <Map className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-zinc-900">{stats?.roadmap.completion || 0}%</span>
          </div>
          {stats?.roadmap.hasRoadmap ? (
            <Link to="/roadmap" className="text-xs text-zinc-900 font-medium hover:underline mt-2 flex items-center gap-1">
              View {stats.roadmap.targetRole} <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <Link to="/roadmap" className="text-xs text-zinc-500 hover:underline mt-2 flex items-center gap-1">
              Generate roadmap <Plus className="h-3 w-3" />
            </Link>
          )}
        </motion.div>

        {/* Skill Gap Readiness */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Skill Readiness</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-zinc-900">
              {stats?.skillGap.readiness !== null ? `${stats?.skillGap.readiness}%` : '—'}
            </span>
          </div>
          {stats?.skillGap.hasAnalysis ? (
            <Link to="/skill-gap" className="text-xs text-zinc-900 font-medium hover:underline mt-2 flex items-center gap-1">
              {stats.skillGap.missingCount} missing skills <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <Link to="/skill-gap" className="text-xs text-zinc-500 hover:underline mt-2 flex items-center gap-1">
              Analyze skill gap <Plus className="h-3 w-3" />
            </Link>
          )}
        </motion.div>

        {/* Internship Applications */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Applications</span>
            <div className="p-1.5 bg-zinc-100 rounded-lg text-zinc-700 border border-zinc-200">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-zinc-900">{stats?.internships.total || 0}</span>
          </div>
          <Link to="/internships" className="text-xs text-zinc-900 font-medium hover:underline mt-2 flex items-center gap-1">
            {stats?.internships.interview || 0} interviews active <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      </div>

      {/* Main Charts & Side Columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Application Flow */}
          <div className="card">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Internship Pipeline Breakout</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Applied', count: stats?.internships.applied || 0, color: '#f4f4f5' },
                    { name: 'Interviewing', count: stats?.internships.interview || 0, color: '#3b82f6' },
                    { name: 'Offers', count: stats?.internships.offer || 0, color: '#10b981' },
                    { name: 'Rejected', count: stats?.internships.rejected || 0, color: '#ef4444' },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="count" fill="#18181b" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Streak Activity */}
          <div className="card">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Task Completion History</h3>
            <div className="h-64">
              {streakChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={streakChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip />
                    <Area type="monotone" dataKey="percentage" stroke="#18181b" fill="#f4f4f5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                  Complete tasks to populate your daily activity graph!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Daily Tasks Checklist */}
        <div className="space-y-8">
          <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
              <div>
                <h3 className="font-semibold text-zinc-950">Daily Tasks</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Complete today's goals to maintain your streak</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-full">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>
                  {dailyTaskData ? `${dailyTaskData.totalCompleted}/${dailyTaskData.totalTasks}` : '0/0'}
                </span>
              </div>
            </div>

            {isTasksLoading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950"></div>
              </div>
            ) : dailyTaskData && dailyTaskData.tasks.length > 0 ? (
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px]">
                {dailyTaskData.tasks.map((task) => (
                  <div
                    key={task._id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      task.completed
                        ? 'bg-zinc-50/55 border-zinc-100 text-zinc-500'
                        : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <button
                      onClick={() =>
                        completeTaskMutation.mutate({ taskId: task._id, completed: !task.completed })
                      }
                      disabled={completeTaskMutation.isPending}
                      className="mt-0.5 flex-shrink-0 text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 fill-emerald-50 border-transparent" />
                      ) : (
                        <Circle className="h-5 w-5 border-zinc-300" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-850'}`}>
                        {task.title}
                      </p>
                      <p className={`text-xs mt-0.5 ${task.completed ? 'text-zinc-450' : 'text-zinc-500'}`}>
                        {task.description}
                      </p>
                      <span className="inline-flex items-center text-[10px] font-medium text-zinc-500 bg-zinc-100 rounded-md px-1.5 py-0.5 mt-2">
                        {task.estimatedMinutes} mins
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-zinc-200 rounded-lg">
                <Award className="h-8 w-8 text-zinc-400 mb-2" />
                <p className="text-sm font-semibold text-zinc-700">No tasks generated today</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">
                  Generate a learning roadmap first to unlock dynamic daily tasks!
                </p>
                <Link to="/roadmap" className="btn-primary py-1.5 px-3 mt-4 text-xs">
                  Create Roadmap
                </Link>
              </div>
            )}

            {dailyTaskData && dailyTaskData.tasks.length > 0 && (
              <Link
                to="/daily-tasks"
                className="mt-4 text-xs font-semibold text-zinc-900 hover:underline flex items-center justify-center gap-1 py-2 border-t border-zinc-100"
              >
                Go to Daily Planner <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
