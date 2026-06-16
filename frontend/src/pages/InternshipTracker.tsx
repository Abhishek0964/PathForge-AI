import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  MapPin,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Award,
  CircleAlert,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { internshipService, type Internship } from '../services';

export const InternshipTracker: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<Internship['status']>('applied');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [interviewDate, setInterviewDate] = useState('');
  const [notes, setNotes] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  // Fetch all internships
  const { data: internshipsData, isLoading } = useQuery({
    queryKey: ['internships', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? { status: statusFilter } : undefined;
      const res = await internshipService.getAll(params);
      return res.data.internships;
    },
  });

  // Fetch Stats
  const { data: statsData } = useQuery({
    queryKey: ['internshipStats'],
    queryFn: async () => {
      const res = await internshipService.getStats();
      return res.data.stats;
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Internship>) => internshipService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      queryClient.invalidateQueries({ queryKey: ['internshipStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      closeForm();
      toast.success('Application logged!');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Internship> }) => internshipService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      queryClient.invalidateQueries({ queryKey: ['internshipStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      closeForm();
      toast.success('Application updated!');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => internshipService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      queryClient.invalidateQueries({ queryKey: ['internshipStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Application removed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) {
      toast.error('Please specify the company name and role');
      return;
    }

    const payload: Partial<Internship> = {
      company,
      role,
      status,
      appliedDate,
      notes,
      jobUrl: jobUrl || undefined,
      salary: salary || undefined,
      location: location || undefined,
      isRemote,
      tags: tagsInput ? tagsInput.split(',').map((t) => t.trim()) : [],
    };

    if (status === 'interview' && interviewDate) {
      payload.interviewDate = interviewDate;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEditClick = (item: Internship) => {
    setEditingId(item._id);
    setCompany(item.company);
    setRole(item.role);
    setStatus(item.status);
    setAppliedDate(item.appliedDate.split('T')[0]);
    setInterviewDate(item.interviewDate ? item.interviewDate.split('T')[0] : '');
    setNotes(item.notes);
    setJobUrl(item.jobUrl || '');
    setSalary(item.salary || '');
    setLocation(item.location || '');
    setIsRemote(item.isRemote);
    setTagsInput(item.tags ? item.tags.join(', ') : '');
    setIsFormOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: Internship['status']) => {
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setCompany('');
    setRole('');
    setStatus('applied');
    setAppliedDate(new Date().toISOString().split('T')[0]);
    setInterviewDate('');
    setNotes('');
    setJobUrl('');
    setSalary('');
    setLocation('');
    setIsRemote(false);
    setTagsInput('');
  };

  const handlePrepRedirect = (item: Internship) => {
    // Redirects to AI Coach with query parameters to kick off automated interview prep
    navigate('/coach', {
      state: {
        initMessage: `I have an interview coming up for the "${item.role}" position at "${item.company}". Please help me prepare! Provide key background technical questions they might ask, as well as behavioural tips specific to this company.`,
      },
    });
  };

  const statusColumns: Array<{ key: Internship['status']; label: string; bg: string }> = [
    { key: 'applied', label: 'Applied', bg: 'bg-zinc-100 border-zinc-200' },
    { key: 'interview', label: 'Interviewing', bg: 'bg-blue-50 border-blue-200 text-blue-900' },
    { key: 'offer', label: 'Offers / Selected', bg: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
    { key: 'rejected', label: 'Rejected / Withdrawn', bg: 'bg-red-50 border-red-200 text-red-900' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Internship Tracker</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Organize, monitor, and prepare for your ongoing internship and job applications.
          </p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary py-2.5">
          <Plus className="h-4.5 w-4.5" />
          Log Application
        </button>
      </div>

      {/* Kanban Board Grid */}
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statusColumns.map((col) => {
            const list = (internshipsData || []).filter((item) => {
              if (col.key === 'rejected') {
                return item.status === 'rejected' || item.status === 'withdrawn';
              }
              if (col.key === 'offer') {
                return item.status === 'offer' || item.status === 'selected';
              }
              return item.status === col.key;
            });

            return (
              <div key={col.key} className="space-y-4">
                {/* Column header */}
                <div className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs uppercase tracking-wider ${col.bg}`}>
                  <span>{col.label}</span>
                  <span className="bg-white/80 border text-zinc-800 px-2 py-0.5 rounded-full text-[10px]">
                    {list.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[350px] bg-zinc-50/40 p-2 border border-dashed rounded-xl">
                  {list.length > 0 ? (
                    list.map((item) => (
                      <div key={item._id} className="card p-4 hover:shadow-xs transition-shadow bg-white space-y-3 relative group">
                        {/* Edit/delete float buttons */}
                        <div className="absolute top-3 right-3 hidden group-hover:flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1 hover:bg-zinc-100 rounded text-zinc-500"
                            title="Edit"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(item._id)}
                            className="p-1 hover:bg-red-50 rounded text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div>
                          <h4 className="font-bold text-zinc-900 text-sm">{item.role}</h4>
                          <p className="text-xs text-zinc-500 font-semibold">{item.company}</p>
                        </div>

                        {/* Metadata items */}
                        <div className="space-y-1.5 text-[10px] font-semibold text-zinc-500">
                          {item.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-zinc-400" />
                              <span>
                                {item.location} {item.isRemote && '(Remote)'}
                              </span>
                            </div>
                          )}
                          {item.salary && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-zinc-400" />
                              <span>{item.salary}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-zinc-400" />
                            <span>Applied: {new Date(item.appliedDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Interactive interview date badge */}
                        {item.status === 'interview' && item.interviewDate && (
                          <div className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-150 p-2 rounded-lg flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Interview: {new Date(item.interviewDate).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Tag list */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((t, tIdx) => (
                              <span key={tIdx} className="text-[8px] font-bold px-1.5 py-0.5 bg-zinc-100 text-zinc-650 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Status selector dropdown */}
                        <div className="border-t border-zinc-100 pt-2.5 flex items-center justify-between gap-2">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item._id, e.target.value as Internship['status'])}
                            className="text-[10px] font-semibold bg-zinc-50 border hover:bg-zinc-100 rounded px-1.5 py-1 text-zinc-700"
                          >
                            <option value="applied">Applied</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                          </select>

                          {/* Quick AI Prep helper link */}
                          <button
                            onClick={() => handlePrepRedirect(item)}
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-zinc-900 hover:underline"
                            title="Generate AI prep material"
                          >
                            AI Prep <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-10 px-2">
                      <Briefcase className="h-6 w-6 text-zinc-350 mb-1" />
                      <p className="text-[10px] font-bold text-zinc-400">Empty column</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log/Edit Modal Overlay Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="bg-white border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-zinc-900">
              {editingId ? 'Edit Application Details' : 'Log New Application'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="input"
                    placeholder="e.g. Google, Stripe"
                  />
                </div>
                <div>
                  <label className="label">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input"
                    placeholder="e.g. Frontend Intern"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Internship['status'])}
                    className="input"
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interviewing</option>
                    <option value="offer">Offer received</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
                <div>
                  <label className="label">Applied Date</label>
                  <input
                    type="date"
                    required
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {status === 'interview' && (
                <div>
                  <label className="label">Interview Date</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="input"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                <div className="flex items-center mt-6">
                  <input
                    id="remote-check"
                    type="checkbox"
                    checked={isRemote}
                    onChange={(e) => setIsRemote(e.target.checked)}
                    className="h-4 w-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-500"
                  />
                  <label htmlFor="remote-check" className="ml-2 label mb-0">
                    Remote Position
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Job Link URL</label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="input"
                    placeholder="https://company.com/careers/..."
                  />
                </div>
                <div>
                  <label className="label">Salary / Pay Rate</label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="input"
                    placeholder="e.g. $45/hr or $80,000/yr"
                  />
                </div>
              </div>

              <div>
                <label className="label">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="input"
                  placeholder="e.g. React, Python, Remote, Fall 2026"
                />
              </div>

              <div>
                <label className="label">Notes / Context</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-[80px]"
                  placeholder="Paste job description highlights, interview notes, or recruiter details..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={closeForm} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipTracker;
