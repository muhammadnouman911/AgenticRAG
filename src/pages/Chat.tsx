import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Loader2, 
  History, 
  Plus, 
  Trash2, 
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Target,
  Brain,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: any[];
  steps?: any[];
  confidence?: number;
  timestamp: string;
}

export default function Chat() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<any[]>([]);
  const [streamingStatus, setStreamingStatus] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sources' | 'trace' | 'info'>('trace');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
    if (sessionId) {
      fetchMessages(sessionId);
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  // Auto-save input
  useEffect(() => {
    const saved = localStorage.getItem('chat_input');
    if (saved) setInput(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('chat_input', input);
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/chat/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (sid: string) => {
    try {
      const res = await axios.get(`/api/chat/history/${sid}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input;
    setInput('');
    localStorage.removeItem('chat_input');
    setIsLoading(true);
    setCurrentSteps([]);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    const params = new URLSearchParams({
      query,
      ...(sessionId ? { sessionId } : {})
    });

    const eventSource = new EventSource(`/api/chat/stream?${params.toString()}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'step') {
        const step = data.step;
        setStreamingStatus(step.name);
        setCurrentSteps(prev => {
          const exists = prev.findIndex(s => s.id === step.id);
          if (exists !== -1) {
            const newSteps = [...prev];
            newSteps[exists] = step;
            return newSteps;
          }
          return [...prev, step];
        });
      } else if (data.type === 'done') {
        const { result, sessionId: newSid } = data;
        const assistantMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
          steps: result.steps,
          confidence: result.confidence,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (!sessionId) {
          navigate(`/chat/${newSid}`);
        }
        eventSource.close();
        setIsLoading(false);
        setStreamingStatus('');
        setCurrentSteps([]);
        fetchHistory();
      } else if (data.type === 'error') {
        toast.error(data.error);
        eventSource.close();
        setIsLoading(false);
        setStreamingStatus('');
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
      setIsLoading(false);
      setStreamingStatus('');
      toast.error('Connection lost');
    };
  };

  const currentAssistantMessage = messages.slice().reverse().find(m => m.role === 'assistant');

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      {/* Session List */}
      <div className="w-60 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <button 
            onClick={() => navigate('/chat')}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> New Research
          </button>
        </div>
        <div className="flex-1 overflow-auto p-3 space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4">History</p>
          {history.map((h) => (
            <button
              key={h.id}
              onClick={() => navigate(`/chat/${h.id}`)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-all group relative",
                sessionId === h.id ? "bg-indigo-50 border-l-4 border-indigo-500 rounded-l-none" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className={cn("truncate text-xs font-semibold", sessionId === h.id ? "text-indigo-600" : "text-slate-700")}>{h.title}</span>
                <span className="text-[10px] text-slate-400">{new Date(h.created_at).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white border-r border-slate-200 relative">
        <div ref={scrollRef} className="flex-1 overflow-auto p-8 space-y-8 pb-32">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <Brain className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Research Agent Ready</h2>
              <p className="text-slate-500 mt-2 max-w-sm font-medium">Specify a topic to begin autonomous retrieval, grading, and synthesis.</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn(
              "flex flex-col gap-3",
              m.role === 'user' ? "items-end" : "items-start"
            )}>
              {m.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                     <Brain className="w-3.5 h-3.5 text-indigo-600" />
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agent Reasoning</span>
                </div>
              )}
              <div className={cn(
                "max-w-[80%] px-5 py-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                m.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-none"
              )}>
                <div className="prose prose-slate prose-sm max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {m.sources.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[9px] px-2 py-1 bg-white border border-slate-200 rounded text-slate-500 flex items-center gap-1 font-bold uppercase">
                      <Target className="w-2.5 h-2.5 text-indigo-500" /> {s.title}
                    </span>
                  ))}
                  {m.sources.length > 3 && <span className="text-[9px] text-slate-400 font-bold">+{m.sources.length - 3} more</span>}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{streamingStatus || 'Initializing Reasoning...'}</span>
                  <div className="flex gap-1 animate-pulse">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-indigo-200 rounded-full"></div>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl rounded-tl-none text-xs text-slate-500 italic font-medium">
                  {currentSteps.length > 0 
                    ? currentSteps[currentSteps.length - 1].description 
                    : "Scanning verified documents and cross-referencing with external research nodes..."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          <form 
            onSubmit={handleSend}
            className="max-w-4xl mx-auto relative group"
          >
            {input.trim() && (
              <div className="absolute bottom-full left-0 right-0 mb-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-xl z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Markdown Preview</span>
                  <button type="button" onClick={() => setInput('')} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Clear</button>
                </div>
                <div className="prose prose-slate prose-sm max-w-none max-h-32 overflow-auto">
                   <ReactMarkdown>{input}</ReactMarkdown>
                </div>
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask your research agent anything... (Markdown supported)"
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-5 py-4 pr-16 outline-none transition-all placeholder:text-slate-400 text-sm shadow-sm resize-none h-[64px] min-h-[64px]"
            />
            <button
              disabled={isLoading || !input.trim()}
              className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded-lg transition-all"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="w-80 bg-white flex flex-col shrink-0">
        <div className="flex border-b border-slate-100">
          <TabButton active={activeTab === 'sources'} onClick={() => setActiveTab('sources')} label="Sources" icon={Search} />
          <TabButton active={activeTab === 'trace'} onClick={() => setActiveTab('trace')} label="Trace" icon={Layers} />
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-6">
          {activeTab === 'sources' && (
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Retrieved Evidence</p>
              {currentAssistantMessage?.sources?.map((source: any, idx: number) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase truncate max-w-[120px]">{source.title}</span>
                    <span className="text-[9px] font-bold text-emerald-600">{(source.relevance * 100).toFixed(0)}% REL</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                    {source.snippet || source.description || 'Verified source chunk used for answer synthesis in the current reasoning cycle.'}
                  </p>
                </div>
              ))}
              {!currentAssistantMessage?.sources?.length && (
                <div className="text-slate-300 text-center py-20 italic flex flex-col items-center">
                  <Search className="w-8 h-8 mb-2 opacity-20" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">No Sources</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trace' && (
            <div className="space-y-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step-by-Step Logic</p>
              {(isLoading ? currentSteps : currentAssistantMessage?.steps)?.map((step: any, idx: number) => (
                <div key={idx} className="relative pl-6 pb-6 border-l border-slate-100 last:border-0 last:pb-0">
                  <div className={cn(
                    "absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full transition-all duration-500",
                    step.status === 'success' ? "bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/20" : 
                    step.status === 'pending' ? "bg-indigo-400 animate-pulse" : "bg-red-400"
                  )} />
                  <h4 className="text-[11px] font-bold text-slate-800 mb-1 leading-tight">{step.name}</h4>
                  <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">{step.description}</p>
                  {step.output && (
                    <div className="bg-slate-50 border border-slate-100 rounded p-2 overflow-auto max-h-32">
                      <pre className="text-[9px] font-mono text-slate-600">{JSON.stringify(step.output, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
              {!currentAssistantMessage && !isLoading && (
                <div className="text-slate-300 text-center py-20 italic">Awaiting reasoning trace...</div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between opacity-60">
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Latency: 2.4s</span>
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Tokens: 1,402</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.1em] transition-all",
        active ? "border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50/10" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {label}
    </button>
  );
}

function StatBox({ label, value }: { label: string, value: any }) {
  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase text-slate-500 tracking-tighter mt-1 font-bold">{label}</div>
    </div>
  );
}
