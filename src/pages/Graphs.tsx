import { useState, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Share2, Network, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

const entityTypes = ['All', 'Person', 'Organization', 'Location', 'Concept', 'Event'];

const initialNodes = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Quantum Computing', type: 'Concept' }, style: { background: '#6366f1', color: '#fff', borderRadius: '12px', padding: '10px' } },
  { id: '2', position: { x: 50, y: 200 }, data: { label: 'Richard Feynman', type: 'Person' }, style: { background: '#ec4899', color: '#fff', borderRadius: '12px' } },
  { id: '3', position: { x: 450, y: 200 }, data: { label: 'IBM Research', type: 'Organization' }, style: { background: '#10b981', color: '#fff', borderRadius: '12px' } },
  { id: '4', position: { x: 250, y: 350 }, data: { label: 'Superposition', type: 'Concept' }, style: { background: '#334155', color: '#fff', borderRadius: '12px' } },
  { id: '5', position: { x: 100, y: 500 }, data: { label: 'New York', type: 'Location' }, style: { background: '#f59e0b', color: '#fff', borderRadius: '12px' } },
];

const initialEdges = [
  { id: 'e1-2', source: '2', target: '1', label: 'pioneer', animated: true },
  { id: 'e3-1', source: '3', target: '1', label: 'develops' },
  { id: 'e1-4', source: '1', target: '4', label: 'contains' },
  { id: 'e3-5', source: '3', target: '5', label: 'located in' },
];

export default function Graphs() {
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = useMemo(() => {
    return initialNodes.map(node => {
      const matchesFilter = filterType === 'All' || node.data.type === filterType;
      const matchesSearch = node.data.label.toLowerCase().includes(searchQuery.toLowerCase());
      const isHighlighted = searchQuery !== '' && matchesSearch;

      return {
        ...node,
        hidden: !matchesFilter && filterType !== 'All',
        style: {
          ...node.style,
          opacity: matchesFilter ? (searchQuery === '' || matchesSearch ? 1 : 0.2) : 0.1,
          border: isHighlighted ? '3px solid #6366f1' : (node.style as any)?.border,
          transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }
      };
    });
  }, [filterType, searchQuery]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <header className="p-8 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Share2 className="w-8 h-8 text-indigo-600" /> Knowledge Graph
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Visualizing autonomous connections across verified research nodes.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
            <input 
              type="text" 
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none w-64 transition-all"
            />
          </div>
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/10 transition-all uppercase tracking-widest">
            Export Graph
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 p-4 bg-white border-b border-slate-200 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Filter Type:</span>
        {entityTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
              filterType === type 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={filteredNodes}
          edges={initialEdges}
          fitView
          colorMode="light"
          className="bg-slate-50"
        >
          <Background color="#cbd5e1" gap={20} />
          <Controls className="bg-white border-slate-200 shadow-sm" />
          <MiniMap 
            nodeColor={(n: any) => n.style?.background || '#4f46e5'}
            maskColor="rgba(255, 255, 255, 0.7)"
            className="bg-white border-slate-200 rounded-lg shadow-sm"
          />
          <Panel position="top-right" className="bg-white/90 p-6 border border-slate-200 rounded-[32px] backdrop-blur-md shadow-sm max-w-sm">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-600" /> Auto-Extraction
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
              The agent uses entity extraction to find key concepts in your documents and automatically link them into a searchable graph.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-tight">
                {filteredNodes.filter(n => !n.hidden).length} Entities
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-tight">108 Relations</span>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
