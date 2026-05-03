import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Zap,
  Globe,
  Database
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, timelineRes] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/timeline')
        ]);
        setStats(statsRes.data);
        setTimeline(timelineRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const pieData = [
    { name: 'Vector DB', value: 65, color: '#6366f1' },
    { name: 'Web Search', value: 25, color: '#f59e0b' },
    { name: 'SQL Store', value: 10, color: '#10b981' },
  ];

  if (!stats) return null;

  return (
    <div className="flex-1 p-10 overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" /> System Overview
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time analytics for your agent's research activity.</p>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <MetricCard icon={Zap} label="Total Queries" value={stats.totalQueries} sub="+12% from last week" />
          <MetricCard icon={Database} label="Documents" value={stats.totalDocuments} sub="632,104 indexed tokens" />
          <MetricCard icon={Target} label="Avg Confidence" value={`${stats.averageConfidence.toFixed(1)}%`} sub="High precision RAG" />
          <MetricCard icon={Clock} label="Avg Delay" value="1.8s" sub="Processing time per step" />
        </div>

        <div className="grid grid-cols-3 gap-8 mb-10">
          {/* Timeline Chart */}
          <div className="col-span-2 p-10 bg-white border border-slate-200 rounded-[32px] shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" /> Research Volume
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Source Distribution */}
          <div className="p-10 bg-white border border-slate-200 rounded-[32px] shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" /> Retrieval Sources
            </h3>
            <div className="h-[200px] mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tight">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-2 gap-8">
          <div className="p-10 bg-white border border-slate-200 rounded-[32px] shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Top Research Topics</h3>
            <div className="space-y-6">
              <TopicItem label="Machine Learning Architectures" count={42} percentage={85} />
              <TopicItem label="Quantum Computing Basics" count={28} percentage={60} />
              <TopicItem label="Sustainable Energy Solutions" count={24} percentage={52} />
              <TopicItem label="Global Macroeconomics" count={19} percentage={40} />
            </div>
          </div>
          <div className="p-10 bg-white border border-slate-200 rounded-[32px] shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-[28px] flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Agent Performance</h3>
            <p className="text-slate-500 mb-6 font-medium text-sm">Your agent successfully self-corrected 4 times today to improve answer quality.</p>
            <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all uppercase text-[10px] tracking-widest">
              View Agent Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-white border border-slate-200 rounded-[32px] shadow-sm hover:border-indigo-600/30 transition-all group"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">{sub}</div>
    </motion.div>
  );
}

function TopicItem({ label, count, percentage }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-slate-800">{label}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{count} queries</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
