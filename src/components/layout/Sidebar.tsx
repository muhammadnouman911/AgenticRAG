import { NavLink } from 'react-router-dom';
import { 
  MessageSquare, 
  FileText, 
  LayoutDashboard, 
  Share2, 
  Settings as SettingsIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../auth/AuthProvider';
import { auth } from '../../lib/services/firebase';
import { signOut } from 'firebase/auth';

const navItems = [
  { icon: MessageSquare, label: 'Research Chat', href: '/chat' },
  { icon: FileText, label: 'Documents', href: '/documents' },
  { icon: Share2, label: 'Knowledge Graph', href: '/graph' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: SettingsIcon, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <aside className={cn(
      "h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/10">
          <BrainCircuit className="text-white w-6 h-6" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-lg tracking-tight text-slate-800">
            AgenticRAG <span className="text-[10px] font-normal text-slate-400 ml-1">v1.2</span>
          </span>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group",
            isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <Search className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm font-semibold">Overview</span>}
        </NavLink>
        
        <div className="pt-4 pb-2 px-4">
          {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</p>}
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group",
              isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-semibold">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 mt-auto flex flex-col gap-4">
        {user && !isCollapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
               <UserIcon size={16} />
            </div>
            <div className="flex flex-col min-w-0">
               <span className="text-[10px] font-bold text-slate-700 truncate">{user.email}</span>
               <button onClick={handleLogout} className="text-[10px] font-black text-red-500 uppercase hover:underline text-left tracking-tighter">Logout</button>
            </div>
          </div>
        )}

        {user && isCollapsed && (
          <button 
            onClick={handleLogout}
            className="w-full flex justify-center p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          {!isCollapsed && <span>Gemini 1.5 Active</span>}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-900"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
