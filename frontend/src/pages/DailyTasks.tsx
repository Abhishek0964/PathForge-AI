import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare,
  Cpu,
  Flame,
  Award,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Sparkles,
  HelpCircle,
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { dailyTaskService } from '../services';

export const DailyTasks: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch today's tasks
  const { data: todayTaskData, isLoading: isTodayLoading } = useQuery({
    queryKey: ['todayTasksDetail'],
    queryFn: async () => {
      try {
        const res = await dailyTaskService.getToday();
        return res.data.dailyTask;
      } catch {
        return null;
      }
    },
  });

  // Fetch historic tasks
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['tasksHistory'],
    queryFn: async () => {
      try {
        const res = await dailyTaskService.getHistory();
        return res.data.tasks;
      } catch {
        return [];
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
      queryClient.invalidateQueries({ queryKey: ['todayTasksDetail'] });
      queryClient.invalidateQueries({ queryKey: ['tasksHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      toast.error('Failed to change task state');
    },
  });

  // Regenerate tasks mutation
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await dailyTaskService.regenerate();
      return res.data.dailyTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayTasksDetail'] });
      queryClient.invalidateQueries({ queryKey: ['tasksHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Generated new tasks for today!');
    },
    onError: () => {
      toast.error('Failed to regenerate tasks');
    },
  });

  if (isTodayLoading || isHistoryLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
          <p className="text-sm font-medium text-zinc-500">Retrieving schedule...</p>
        </div>
      </div>
    );
  }

  const todayTasks = todayTaskData?.tasks || [];
  const completionPercentage = todayTaskData
    ? todayTaskData.totalTasks > 0
      ? Math.round((todayTaskData.totalCompleted / todayTaskData.totalTasks) * 100)
      : 0
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Daily Tasks</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Focus on today's curated study items to build consistency and keep your streak alive.
          </p>
        </div>

        {todayTaskData && (
          <button
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
            className="btn-secondary py-2"
          >
            <RefreshCw className={`h-4 w-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
            Regenerate Tasks
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Today's Tasks listing */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h3 className="font-bold text-zinc-900 text-lg">Today's Agenda</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <span className="badge bg-zinc-900 text-white font-semibold text-xs py-1 px-3">
                {todayTaskData ? `${todayTaskData.totalCompleted}/${todayTaskData.totalTasks} Done` : '0/0 Done'}
              </span>
            </div>

            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      task.completed
                        ? 'bg-zinc-50/50 border-zinc-100 text-zinc-455'
                        : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-xs'
                    }`}
                  >
                    {/* Checkbox button */}
                    <button
                      onClick={() =>
                        completeTaskMutation.mutate({ taskId: task._id, completed: !task.completed })
                      }
                      disabled={completeTaskMutation.isPending}
                      className="mt-0.5 text-zinc-550 hover:text-zinc-950 flex-shrink-0 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-6 w-6 text-emerald-600 fill-emerald-50 border-transparent" />
                      ) : (
                        <Circle className="h-6 w-6 border-zinc-300" />
                      )}
                    </button>

                    {/* Content details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className={`text-sm font-bold ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-850'}`}>
                        {task.title}
                      </p>
                      <p className={`text-xs ${task.completed ? 'text-zinc-400' : 'text-zinc-550'} leading-relaxed`}>
                        {task.description}
                      </p>

                      {/* Metatags */}
                      <div className="flex flex-wrap items-center gap-3 pt-2.5">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-zinc-450 uppercase tracking-wide">
                          <Clock className="h-3 w-3" />
                          {task.estimatedMinutes} mins
                        </span>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-650 uppercase">
                          {task.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 px-4 border border-dashed rounded-xl">
                <CheckSquare className="h-10 w-10 text-zinc-400 mb-3" />
                <h4 className="font-semibold text-zinc-750">Ready to start?</h4>
                <p className="text-xs text-zinc-450 mt-1 max-w-[240px]">
                  Unlock today's study planner by generating a learning roadmap first!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Statistics & Streaks progress */}
        <div className="space-y-6">
          {/* Completion Meter widget */}
          <div className="card flex flex-col items-center text-center p-8">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
              Daily Progress
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
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - completionPercentage / 100)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-zinc-900">
                  {completionPercentage}%
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-450 mt-4 leading-relaxed font-semibold">
              {completionPercentage === 100
                ? "Perfect day! You've achieved all targets!"
                : "Complete today's checkmarks to hit 100%!"}
            </p>
          </div>

          {/* Streak history overview widget */}
          <div className="card space-y-4">
            <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5 border-b border-zinc-100 pb-3 mb-2">
              <Flame className="h-4.5 w-4.5 text-amber-500 fill-amber-100" />
              Developer Streak History
            </h3>
            {historyData && historyData.length > 0 ? (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {historyData.slice(0, 10).map((day) => {
                  const dateStr = new Date(day.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });
                  const completedRatio = `${day.totalCompleted}/${day.totalTasks}`;
                  const isPerfect = day.totalCompleted === day.totalTasks && day.totalTasks > 0;

                  return (
                    <div key={day._id} className="flex items-center justify-between text-xs border-b border-zinc-50 pb-2.5 last:border-0 last:pb-0 font-semibold text-zinc-650">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-450">{completedRatio} Completed</span>
                        {isPerfect ? (
                          <span className="badge-success text-[9px] font-bold">Perfect</span>
                        ) : (
                          <span className="badge-gray text-[9px] font-bold">Done</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-zinc-450 italic py-2">No historical tasks logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTasks;
