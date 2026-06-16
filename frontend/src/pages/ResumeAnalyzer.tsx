import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Cpu,
  Sparkles,
  Zap,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { resumeService } from '../services';

export const ResumeAnalyzer: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'wording' | 'sections'>('overview');

  // Fetch active resume
  const { data: activeResumeData, isLoading: isActiveLoading } = useQuery({
    queryKey: ['activeResume'],
    queryFn: async () => {
      try {
        const res = await resumeService.getActive();
        return res.data.resume;
      } catch {
        return null;
      }
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (uploadedFile: File) => {
      const res = await resumeService.upload(uploadedFile);
      return res.data.resume;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeResume'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setFile(null);
      toast.success('Resume uploaded. Click "Analyze" to scan it.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'File upload failed';
      toast.error(msg);
    },
  });

  // AI Analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await resumeService.analyze();
      return res.data.analysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeResume'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('AI Resume analysis completed!');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'AI analysis failed';
      toast.error(msg);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await resumeService.delete();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeResume'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Active resume deleted');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        toast.error('Only PDF files are supported at this time.');
        return;
      }
      setFile(selected);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    uploadMutation.mutate(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type !== 'application/pdf') {
        toast.error('Only PDF files are supported.');
        return;
      }
      setFile(selected);
    }
  };

  if (isActiveLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
          <p className="text-sm font-medium text-zinc-500">Retrieving resume...</p>
        </div>
      </div>
    );
  }

  const activeResume = activeResumeData;
  const isUploading = uploadMutation.isPending;
  const isAnalyzing = analyzeMutation.isPending;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">AI Resume Analyzer</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Optimize your resume for applicant tracking systems (ATS) using AI feedback.
          </p>
        </div>
        {activeResume && (
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending || isAnalyzing}
            className="btn-danger py-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Resume
          </button>
        )}
      </div>

      {!activeResume ? (
        /* Upload UI */
        <div className="max-w-2xl mx-auto mt-6">
          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-white rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="p-4 bg-zinc-55 bg-zinc-50 rounded-full text-zinc-500 group-hover:scale-105 transition-transform">
                <UploadCloud className="h-8 w-8 text-zinc-650" />
              </div>
              <p className="mt-4 text-sm font-semibold text-zinc-800">
                {file ? file.name : 'Drag & drop your resume PDF here'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Supported file format: PDF only'}
              </p>
            </div>

            {file && (
              <button
                type="submit"
                disabled={isUploading}
                className="btn-primary w-full justify-center py-2.5"
              >
                {isUploading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-white" />
                ) : (
                  'Upload PDF'
                )}
              </button>
            )}
          </form>
        </div>
      ) : (
        /* Resume Present & Analysis UI */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Panel: File Card and Action Panel */}
          <div className="space-y-6">
            <div className="card space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-red-50 rounded-xl text-red-650 border border-red-100">
                  <FileText className="h-6 w-6 text-red-650" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-zinc-950 truncate" title={activeResume.originalName}>
                    {activeResume.originalName}
                  </h4>
                  <p className="text-xs text-zinc-450 mt-0.5">
                    Uploaded: {new Date(activeResume.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Size: {(activeResume.fileSize / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>

              {!activeResume.analysis && (
                <div className="pt-2">
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                    Your resume has been parsed successfully. Click below to analyze your formatting, skills coverage, and ATS match score.
                  </p>
                  <button
                    onClick={() => analyzeMutation.mutate()}
                    disabled={isAnalyzing}
                    className="btn-primary w-full justify-center py-2.5"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 animate-pulse" />
                        Analyzing Resume...
                      </div>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 fill-white" />
                        Analyze Resume
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* AI Status Scanning Loader */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card bg-zinc-900 text-white border-transparent overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Cpu className="h-5 w-5 text-amber-400 animate-spin" />
                    <h4 className="font-semibold text-sm">AI Scan In Progress</h4>
                  </div>
                  <div className="relative h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-4">
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="absolute inset-y-0 w-1/3 bg-amber-400 rounded-full"
                    />
                  </div>
                  <ul className="text-xs space-y-2 text-zinc-400">
                    <li className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-amber-400" />
                      Parsing sentence structures
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-zinc-600" />
                      Benchmarking skills vocabulary
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-zinc-600" />
                      Assessing resume visual metrics
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {activeResume.analysis && (
              /* ATS Score Widget */
              <div className="card flex flex-col items-center text-center p-8 bg-linear-to-b from-zinc-50 to-white">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                  ATS Match Score
                </span>
                <div className="relative flex items-center justify-center">
                  {/* Circle Path Score */}
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
                      stroke="#18181b"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={2 * Math.PI * 54 * (1 - activeResume.analysis.score / 100)}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-zinc-900">
                      {activeResume.analysis.score}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase">of 100</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-zinc-800">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>
                    {activeResume.analysis.score >= 80
                      ? 'Job Ready'
                      : activeResume.analysis.score >= 60
                      ? 'Solid Foundation'
                      : 'Needs Refinement'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Detailed AI Analysis tabs */}
          <div className="lg:col-span-2">
            {!activeResume.analysis ? (
              <div className="card flex flex-col items-center justify-center text-center py-20 px-4">
                <Cpu className="h-10 w-10 text-zinc-400 mb-3 animate-pulse" />
                <h3 className="font-semibold text-zinc-700 text-lg">Analysis Required</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-[280px]">
                  Run the AI Scan on your uploaded resume to retrieve scores and optimization checklists.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tabs Selector */}
                <div className="flex border-b border-zinc-200">
                  {(['overview', 'wording', 'sections'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 px-6 text-sm font-semibold border-b-2 capitalize transition-colors ${
                        activeTab === tab
                          ? 'border-zinc-900 text-zinc-900'
                          : 'border-transparent text-zinc-450 hover:text-zinc-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div>
                  {activeTab === 'overview' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Summary */}
                      <div className="card">
                        <h4 className="font-bold text-zinc-900 mb-2">Profile Summary</h4>
                        <p className="text-sm text-zinc-600 leading-relaxed">
                          {activeResume.analysis.summary}
                        </p>
                      </div>

                      {/* Missing Keywords & Suggestions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card bg-red-50/20 border-red-100">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="h-4.5 w-4.5 text-red-650" />
                            <h4 className="font-bold text-red-900 text-sm">Critical Keyword Gaps</h4>
                          </div>
                          {activeResume.analysis.missingKeywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {activeResume.analysis.missingKeywords.map((kw, i) => (
                                <span key={i} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-15 bg-red-100 text-red-750">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-550">No critical keyword gaps identified.</p>
                          )}
                        </div>

                        <div className="card bg-zinc-50 border-zinc-250">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="h-4.5 w-4.5 text-zinc-650" />
                            <h4 className="font-bold text-zinc-900 text-sm">Actionable Improvements</h4>
                          </div>
                          <ul className="text-xs space-y-2 text-zinc-600">
                            {activeResume.analysis.improvements.map((imp, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-zinc-450" />
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* ATS Suggestions */}
                      <div className="card">
                        <h4 className="font-bold text-zinc-900 mb-3">ATS Compatibility Advice</h4>
                        <ul className="text-xs space-y-3 text-zinc-600">
                          {activeResume.analysis.atsSuggestions.map((sug, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="flex-shrink-0 flex items-center justify-center h-4.5 w-4.5 rounded-full bg-zinc-100 text-zinc-700 font-semibold text-[10px]">
                                {i + 1}
                              </span>
                              <span className="leading-normal">{sug}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'wording' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <h4 className="font-bold text-zinc-950 text-sm mb-4">ATS Active Wording Upgrades</h4>
                      {activeResume.analysis.betterWording && activeResume.analysis.betterWording.length > 0 ? (
                        activeResume.analysis.betterWording.map((item, i) => (
                          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-zinc-150 rounded-xl overflow-hidden shadow-xs">
                            <div className="p-4 bg-red-50/20 border-r border-zinc-150">
                              <span className="text-[10px] font-bold text-red-650 uppercase">Original Wording</span>
                              <p className="text-xs font-medium text-zinc-700 mt-1 italic">
                                "{item.original}"
                              </p>
                            </div>
                            <div className="p-4 bg-emerald-50/20">
                              <span className="text-[10px] font-bold text-emerald-650 uppercase">ATS Better Version</span>
                              <p className="text-xs font-semibold text-zinc-900 mt-1">
                                "{item.improved}"
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="card flex flex-col items-center justify-center py-10">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                          <p className="text-sm font-semibold text-zinc-600 mt-2">Wording is optimal</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'sections' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Technical & Soft Skills */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card">
                          <h4 className="font-bold text-zinc-900 text-sm mb-3">Technical Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {activeResume.analysis.technicalSkills.map((sk, i) => (
                              <span key={i} className="badge-dark text-xs">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="card">
                          <h4 className="font-bold text-zinc-900 text-sm mb-3">Soft Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {activeResume.analysis.softSkills.map((sk, i) => (
                              <span key={i} className="badge-gray text-xs">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Work Experience */}
                      <div className="card">
                        <h4 className="font-bold text-zinc-900 text-sm mb-3">Extracted Work Experience</h4>
                        {activeResume.analysis.experience.length > 0 ? (
                          <ul className="text-xs space-y-2 text-zinc-600">
                            {activeResume.analysis.experience.map((exp, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <TrendingUp className="h-4 w-4 mt-0.5 text-zinc-400" />
                                <span>{exp}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-zinc-400 italic">No work experiences detected.</p>
                        )}
                      </div>

                      {/* Education & Projects */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card">
                          <h4 className="font-bold text-zinc-900 text-sm mb-3">Education Summary</h4>
                          <ul className="text-xs space-y-1.5 text-zinc-600">
                            {activeResume.analysis.education.map((ed, i) => (
                              <li key={i}>{ed}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="card">
                          <h4 className="font-bold text-zinc-900 text-sm mb-3">Projects Extracted</h4>
                          <ul className="text-xs space-y-1.5 text-zinc-600">
                            {activeResume.analysis.projects.map((proj, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 mt-1.5 flex-shrink-0" />
                                <span>{proj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
