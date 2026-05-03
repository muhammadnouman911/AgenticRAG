import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Brain, 
  Search, 
  ShieldCheck, 
  Layers, 
  Network,
  Cpu
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-auto">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#eef2ff,#f8fafc)] -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900">
              Your AI Research Agent That <br />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 bg-clip-text text-transparent">
                Thinks, Searches, and Self-Corrects.
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              AgenticRAG is an autonomous research assistant that retrieves multi-source data, 
              grades information quality, and reasons across documents to provide grounded, cited answers.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/chat')}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20"
              >
                Start Researching <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-full font-bold text-lg border border-slate-200 transition-all shadow-sm">
                View Documentation
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-white/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase mb-4">Core Principles</h2>
            <h3 className="text-4xl font-bold text-slate-900">Autonomous Intelligence</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Search} 
              title="Multi-Source Search" 
              desc="Simultaneously indexes your private documents and scans the web for up-to-date context." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Self-Correction" 
              desc="Automated grading layer rejects low-quality chunks and retries queries for better results." 
            />
            <FeatureCard 
              icon={Network} 
              title="Multi-Hop Reasoning" 
              desc="Decomposes complex questions into sub-tasks to find connections between disparate data." 
            />
            <FeatureCard 
              icon={Layers} 
              title="Stateful Orchestration" 
              desc="Powered by a LangGraph-style state machine for reliable and traceable agent logic." 
            />
            <FeatureCard 
              icon={Brain} 
              title="Knowledge Extraction" 
              desc="Automatically identifies entities and relationships to build an interactive knowledge graph." 
            />
            <FeatureCard 
              icon={Cpu} 
              title="Gemini 1.5 Flash" 
              desc="Leverages ultra-fast response times and large context windows for high-throughput research." 
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">The Research Pipeline</h2>
          
          <div className="space-y-12">
            <Step 
              num="01" 
              title="Query Analysis" 
              desc="The agent identifies query complexity and determines if it needs web access or local document search." 
            />
            <Step 
              num="02" 
              title="Iterative Retrieval" 
              desc="Information is fetched and immediately graded. If results are poor, the agent rewrites its own search query." 
            />
            <Step 
              num="03" 
              title="Synthesis & Evidence" 
              desc="Final answers are generated with citations, source links, and an interactive trace of the agent's thoughts." 
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-10 rounded-3xl bg-white border border-slate-200 hover:border-indigo-600/30 transition-all shadow-sm hover:shadow-md group"
    >
      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-all">
        <Icon className="text-indigo-600 w-7 h-7 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-10 group">
      <div className="text-6xl font-black text-slate-200 group-hover:text-indigo-100 transition-colors select-none shrink-0">
        {num}
      </div>
      <div className="pt-2">
        <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
        <p className="text-slate-600 leading-relaxed text-lg font-medium">{desc}</p>
      </div>
    </div>
  );
}
