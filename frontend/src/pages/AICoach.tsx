import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Cpu,
  Brain,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  User,
  Terminal,
  Compass
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-hot-toast';
import { chatService, type ChatMessage } from '../services';

interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  icon: React.ComponentType<any>;
  theme: string;
  intro: string;
}

export const AICoach: React.FC = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string>('tech');

  const personas: Record<string, Persona> = {
    tech: {
      id: 'tech',
      name: 'Dr. Turing',
      role: 'Technical & System Design Coach',
      avatar: '💻',
      icon: Terminal,
      theme: 'bg-zinc-900 border-zinc-900 text-white',
      intro: 'Hi, I am Dr. Turing, your Technical Coach. Ask me about coding challenges, system design patterns, algorithm optimization, or tech stack alignment!'
    },
    behavioral: {
      id: 'behavioral',
      name: 'Coach Sarah',
      role: 'Behavioral & Leadership Coach',
      avatar: '🧠',
      icon: Brain,
      theme: 'bg-blue-500 border-blue-500 text-white',
      intro: 'Hello! I am Coach Sarah. I specialize in behavioral interviews, leadership scenarios, communication skills, and STAR method preparation.'
    },
    resume: {
      id: 'resume',
      name: 'Resume Master',
      role: 'Resume & Portfolio Advisor',
      avatar: '📄',
      icon: Award,
      theme: 'bg-amber-500 border-amber-500 text-white',
      intro: 'Hey there! I am the Resume Master. Let me help you optimize your resume bullet points, select impactful portfolio projects, or format your ATS keywords.'
    }
  };

  // Fetch all chat history list
  const { data: conversationsData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await chatService.getConversations();
      return res.data.conversations;
    },
  });

  // Fetch current active conversation details
  const { data: activeConversation, isLoading: isChatLoading } = useQuery({
    queryKey: ['conversation', activeChatId],
    queryFn: async () => {
      if (!activeChatId) return null;
      const res = await chatService.getConversation(activeChatId);
      return res.data.conversation;
    },
    enabled: !!activeChatId,
  });

  // Create Chat Mutation
  const createChatMutation = useMutation({
    mutationFn: async (initialMessageText?: string) => {
      const res = await chatService.create();
      const newConv = res.data.conversation;
      
      if (initialMessageText) {
        // Send initial message right after creating
        await chatService.sendMessage(newConv._id, initialMessageText);
      }
      return newConv;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setActiveChatId(data._id);
    },
    onError: () => {
      toast.error('Failed to initialize conversation');
    },
  });

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ convId, msg }: { convId: string; msg: string }) => {
      const res = await chatService.sendMessage(convId, msg);
      return res.data.message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', activeChatId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Delete Chat Mutation
  const deleteChatMutation = useMutation({
    mutationFn: async (id: string) => {
      await chatService.delete(id);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (activeChatId === deletedId) {
        setActiveChatId(null);
      }
      toast.success('Conversation removed');
    },
  });

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, sendMessageMutation.isPending]);

  // Handle redirects from other pages (e.g. log interview prep)
  useEffect(() => {
    const state = location.state as { initMessage?: string } | null;
    if (state?.initMessage) {
      // Create chat with that message
      createChatMutation.mutate(state.initMessage);
      // Clean location state to avoid trigger on refresh
      window.history.replaceState({}, document.title);
    } else if (conversationsData && conversationsData.length > 0 && !activeChatId) {
      setActiveChatId(conversationsData[0]._id);
    }
  }, [conversationsData, location.state]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');

    if (activeChatId) {
      sendMessageMutation.mutate({ convId: activeChatId, msg: text });
    } else {
      createChatMutation.mutate(text);
    }
  };

  const activePersona = personas[selectedPersona] || personas.tech;
  const conversationList = conversationsData || [];
  const messagesList = activeConversation?.messages || [];
  const isMessageSending = sendMessageMutation.isPending;

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 mt-2">
      {/* Sidebar Left: Chats list and personas */}
      <div className="hidden md:flex md:flex-col md:w-80 border border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-sm">
        {/* New chat action */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between gap-3">
          <button
            onClick={() => createChatMutation.mutate(undefined)}
            disabled={createChatMutation.isPending}
            className="btn-primary flex-1 justify-center py-2 text-xs"
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </button>
        </div>

        {/* Persona Selectors */}
        <div className="p-4 border-b border-zinc-100 space-y-2 bg-zinc-50/50">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
            Select Coach Personality
          </span>
          <div className="flex gap-2">
            {Object.values(personas).map((per) => {
              const Icon = per.icon;
              const isSelected = selectedPersona === per.id;
              return (
                <button
                  key={per.id}
                  onClick={() => setSelectedPersona(per.id)}
                  className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all text-center ${
                    isSelected
                      ? 'border-zinc-900 bg-white shadow-xs'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50'
                  }`}
                  title={per.role}
                >
                  <span className="text-lg leading-none">{per.avatar}</span>
                  <span className="text-[9px] font-bold text-zinc-700 truncate max-w-[65px]">{per.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chats History list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block px-2 mb-2 select-none">
            Recent Conversations
          </span>
          {isHistoryLoading ? (
            <div className="flex justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div>
            </div>
          ) : conversationList.length > 0 ? (
            conversationList.map((conv) => {
              const isActive = activeChatId === conv._id;
              return (
                <div
                  key={conv._id}
                  onClick={() => setActiveChatId(conv._id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer select-none transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-6">
                    <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-70" />
                    <span className="truncate pr-1">{conv.title || 'Untitled Chat'}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChatMutation.mutate(conv._id);
                    }}
                    className={`absolute right-2.5 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-500 transition-opacity ${
                      isActive ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-400'
                    }`}
                    title="Remove Chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-[11px] text-zinc-400 text-center py-6 italic select-none">No active conversations.</p>
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat window */}
      <div className="flex-1 flex flex-col border border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-sm relative">
        {/* Chat header */}
        <div className="p-4 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/30">
          <div className="text-2xl">{activePersona.avatar}</div>
          <div>
            <h3 className="font-bold text-zinc-900 text-sm leading-none">{activePersona.name}</h3>
            <span className="text-[10px] font-semibold text-zinc-450 mt-1.5 inline-block bg-zinc-100 px-1.5 py-0.5 rounded">
              {activePersona.role}
            </span>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Persona Introductory message */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm select-none">
              {activePersona.avatar}
            </div>
            <div className="card p-4 max-w-[80%] bg-zinc-50 border-zinc-200 shadow-none">
              <p className="text-xs text-zinc-650 leading-relaxed font-semibold">
                {activePersona.intro}
              </p>
            </div>
          </div>

          {/* User & assistant messages lists */}
          {activeChatId && (isChatLoading ? (
            <div className="flex h-[30vh] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div>
            </div>
          ) : (
            messagesList.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex gap-4 ${isAssistant ? '' : 'flex-row-reverse'}`}
                >
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full border flex items-center justify-center text-sm select-none ${
                    isAssistant ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950 border-transparent text-white'
                  }`}>
                    {isAssistant ? activePersona.avatar : <User className="h-4.5 w-4.5" />}
                  </div>
                  <div className={`card p-4 max-w-[80%] shadow-none leading-relaxed ${
                    isAssistant
                      ? 'bg-zinc-50/50 border-zinc-150 text-zinc-850'
                      : 'bg-zinc-950 border-transparent text-white'
                  }`}>
                    <div className="prose-chat text-xs break-words">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })
          ))}

          {/* Typing Loading Indicator */}
          {isMessageSending && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm select-none">
                {activePersona.avatar}
              </div>
              <div className="card p-4 bg-zinc-50 border-zinc-200 shadow-none flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce" />
                <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions Quick Buttons */}
        {messagesList.length === 0 && !isMessageSending && (
          <div className="p-4 border-t border-zinc-100 flex flex-wrap gap-2 justify-center bg-zinc-50/20">
            <button
              onClick={() => setInputText('What technical skills are most valued for a Full Stack role?')}
              className="text-[10px] font-bold text-zinc-650 bg-white border hover:bg-zinc-50 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-full"
            >
              🚀 Tech Skills Advice
            </button>
            <button
              onClick={() => setInputText('How do I handle "Tell me about a time you failed" behavioral question?')}
              className="text-[10px] font-bold text-zinc-650 bg-white border hover:bg-zinc-50 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-full"
            >
              🎤 STAR Method Prep
            </button>
            <button
              onClick={() => setInputText('Give me a template bullet point for a MERN stack project on my resume.')}
              className="text-[10px] font-bold text-zinc-650 bg-white border hover:bg-zinc-50 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-full"
            >
              📄 Resume Templates
            </button>
          </div>
        )}

        {/* Input box form */}
        <div className="p-4 border-t border-zinc-100 bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input py-2.5 text-xs pr-12"
              placeholder={`Type a message to ${activePersona.name}...`}
              disabled={isMessageSending}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isMessageSending}
              className="btn-primary px-4"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
