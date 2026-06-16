import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Cpu,
  Plus,
  Search,
  ExternalLink,
  Star,
  Clock,
  Tag,
  Compass,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { resourceService } from '../services';

export const ResourceHub: React.FC = () => {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Fetch all resource docs
  const { data: resourceDocsData, isLoading: isDocsLoading } = useQuery({
    queryKey: ['resourceHub'],
    queryFn: async () => {
      const res = await resourceService.getAll();
      return res.data.resources;
    },
  });

  // Generate dynamic resource list mutation
  const generateMutation = useMutation({
    mutationFn: async (params: { topic: string }) => {
      const res = await resourceService.generate(params.topic);
      return res.data.resource;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resourceHub'] });
      setTopic('');
      setSelectedTopic(data.topic);
      toast.success(`AI curated resources for "${data.topic}"!`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Curation failed';
      toast.error(msg);
    },
  });

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a learning topic');
      return;
    }
    generateMutation.mutate({ topic });
  };

  if (isDocsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
          <p className="text-sm font-medium text-zinc-500">Retrieving resource library...</p>
        </div>
      </div>
    );
  }

  const isGenerating = generateMutation.isPending;
  const library = resourceDocsData || [];

  // Filter topics
  const topicsList = library.map((doc) => doc.topic);
  const activeTopicName = selectedTopic || topicsList[0] || null;
  const activeDoc = library.find((doc) => doc.topic === activeTopicName) || null;

  // Filter resource items inside the active doc
  const filteredResources = activeDoc
    ? activeDoc.resources.filter((res) =>
        res.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        res.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        res.type.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">AI Resource Hub</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Access verified articles, video courses, books, and reference guides curated for your tech topics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar Left: Search Generator & Topic list */}
        <div className="space-y-6 lg:col-span-1">
          {/* Curation Form Card */}
          <div className="card space-y-4">
            <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-zinc-900 fill-zinc-50" />
              Curate New Topic
            </h3>
            <form onSubmit={handleGenerateSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input py-2 text-xs"
                placeholder="e.g. Docker, TypeScript Basics, Redis"
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={isGenerating}
                className="btn-primary w-full justify-center text-xs py-2"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 animate-spin" />
                    Finding materials...
                  </div>
                ) : (
                  'Curate Materials'
                )}
              </button>
            </form>
          </div>

          {/* Topics Selector Card */}
          <div className="card p-4 space-y-2.5">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
              Your Curated Topics
            </h3>
            {topicsList.length > 0 ? (
              <div className="flex flex-col gap-1">
                {topicsList.map((topName) => (
                  <button
                    key={topName}
                    onClick={() => {
                      setSelectedTopic(topName);
                      setSearchFilter('');
                    }}
                    className={`text-left text-xs font-semibold px-3 py-2.5 rounded-lg truncate transition-colors ${
                      activeTopicName === topName
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    {topName}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic py-2">No topics curated yet.</p>
            )}
          </div>
        </div>

        {/* Content Right: Resources listing card */}
        <div className="lg:col-span-3 space-y-6">
          {activeDoc ? (
            <div className="space-y-6">
              {/* Topic Header and Filters */}
              <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Viewing Topic</span>
                  <h2 className="text-xl font-bold text-zinc-900">{activeDoc.topic}</h2>
                  {activeDoc.role && (
                    <span className="inline-block text-[10px] font-semibold text-zinc-500 bg-zinc-100 rounded px-1.5 py-0.5 mt-1">
                      Mapped to: {activeDoc.role}
                    </span>
                  )}
                </div>

                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-zinc-400" />
                  </span>
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="input pl-9 py-1.5 text-xs"
                    placeholder="Search materials..."
                  />
                </div>
              </div>

              {/* Resource cards list */}
              {filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredResources.map((res, i) => (
                    <div key={i} className="card flex flex-col justify-between p-5 hover:border-zinc-300 transition-colors">
                      <div>
                        {/* Resource header: Type badge and price tag */}
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-2.5">
                          <span className="inline-flex items-center gap-1 text-zinc-400">
                            <Tag className="h-3 w-3" />
                            {res.type}
                          </span>
                          <span className={res.isFree ? 'text-emerald-700' : 'text-zinc-500'}>
                            {res.isFree ? 'Free' : 'Paid'}
                          </span>
                        </div>

                        {/* Title and description */}
                        <h4 className="font-bold text-zinc-900 text-sm leading-snug">{res.title}</h4>
                        <p className="text-xs text-zinc-550 mt-1.5 leading-relaxed line-clamp-3">
                          {res.description}
                        </p>

                        {/* Tags list */}
                        {res.tags && res.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {res.tags.map((tg, tIdx) => (
                              <span key={tIdx} className="text-[9px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                                {tg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer Row */}
                      <div className="flex items-center justify-between border-t border-zinc-100 pt-3 mt-4">
                        <div className="flex items-center gap-3.5 text-[10px] font-semibold text-zinc-650">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-transparent" />
                            <span>{res.rating.toFixed(1)}</span>
                          </div>
                          {res.estimatedHours > 0 && (
                            <div className="flex items-center gap-1 text-zinc-400">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{res.estimatedHours} hrs</span>
                            </div>
                          )}
                          <span className="text-zinc-400 capitalize">{res.difficulty}</span>
                        </div>

                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-xs font-bold text-zinc-900 hover:underline"
                        >
                          View Resource
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card flex flex-col items-center justify-center text-center py-12 px-4">
                  <AlertCircle className="h-8 w-8 text-zinc-400 mb-2" />
                  <p className="text-sm font-semibold text-zinc-700">No matching resources found</p>
                  <p className="text-xs text-zinc-450 mt-1">
                    Try adjusting your search filter or generate additional materials for this topic.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center text-center py-20 px-4">
              <BookOpen className="h-10 w-10 text-zinc-400 mb-3" />
              <h3 className="font-semibold text-zinc-700 text-lg">No Topic Selected</h3>
              <p className="text-sm text-zinc-400 mt-1 max-w-[280px]">
                Please select a topic from the sidebar or type a new tech stack to generate learning guides.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceHub;
