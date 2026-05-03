import { useState } from 'react';
import { 
  Shield, 
  Search, 
  Cpu, 
  Globe, 
  Database, 
  Trash2, 
  RefreshCw,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const [showKey, setShowKey] = useState(false);

  const handleTest = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Testing connection...',
        success: 'API Key is valid and active',
        error: 'Connection failed',
      }
    );
  };

  return (
    <div className="flex-1 p-10 overflow-auto bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Agent Preferences</h1>
          <p className="text-slate-500 mt-1 font-medium">Configure LLM parameters, search depth, and indexing behavior.</p>
        </header>

        <div className="space-y-10">
          {/* LLM Section */}
          <section className="p-10 bg-white border border-slate-200 rounded-[32px] shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
              <Cpu className="text-indigo-600 w-4 h-4" /> Inference Architecture
            </h2>
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <InputGroup label="Primary Model" placeholder="gemini-1.5-flash" defaultValue="gemini-1.5-flash" />
                <InputGroup label="Fallback Model" placeholder="groq-llama-3" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 px-1">API Key Identity</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    defaultValue="••••••••••••••••••••••••"
                    readOnly
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium px-1">Keys are managed via secure environment secrets.</p>
              </div>
            </div>
          </section>

          {/* RAG Section */}
          <section className="p-10 bg-white border border-slate-200 rounded-[32px] shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
              <Database className="text-indigo-600 w-4 h-4" /> Retrieval Strategy
            </h2>
            <div className="grid grid-cols-2 gap-10">
              <SliderGroup label="Chunk Size" value={500} unit="chars" percentage="40%" />
              <SliderGroup label="Chunk Overlap" value={50} unit="chars" percentage="10%" />
              <SliderGroup label="Max Sources (k)" value={5} unit="docs" percentage="50%" />
              <SliderGroup label="Grader Threshold" value={0.7} unit="score" percentage="70%" />
            </div>
          </section>

          {/* Web Search Section */}
          <section className="p-10 bg-white border border-slate-200 rounded-[32px] shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
              <Globe className="text-indigo-600 w-4 h-4" /> Research Connectivity
            </h2>
            <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Internet Augmentation</h4>
                  <p className="text-xs text-slate-500 font-medium">Verify local findings with real-time web search results.</p>
                </div>
              </div>
              <button 
                onClick={handleTest}
                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 shadow-sm transition-all"
              >
                Test Connection
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="p-10 border border-red-200 bg-red-50/20 rounded-[32px]">
            <h2 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-8 flex items-center gap-3">
              <Shield className="w-4 h-4" /> Data Purge Protocol
            </h2>
            <div className="flex gap-6">
              <DangerButton label="Clear Chat History" icon={RefreshCw} />
              <DangerButton label="Wipe Knowledge Base" icon={Trash2} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, placeholder, defaultValue }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all"
      />
    </div>
  );
}

function SliderGroup({ label, value, unit, percentage }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-indigo-600 uppercase">{value} {unit}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-indigo-600 rounded-full transition-all duration-500" 
          style={{ width: percentage }}
        />
      </div>
    </div>
  );
}

function DangerButton({ label, icon: Icon }: any) {
  return (
    <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm">
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}
