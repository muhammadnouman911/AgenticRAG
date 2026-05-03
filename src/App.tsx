import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import Dashboard from './pages/Dashboard';
import Graphs from './pages/Graphs';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Sidebar from './components/layout/Sidebar';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<div className="flex flex-1"><Sidebar /><main className="flex-1 flex flex-col relative overflow-hidden"><Landing /></main></div>} />
            <Route path="/chat" element={<div className="flex flex-1"><Sidebar /><main className="flex-1 flex flex-col relative overflow-hidden"><ProtectedRoute><Chat /></ProtectedRoute></main></div>} />
            <Route path="/chat/:sessionId" element={<div className="flex flex-1"><Sidebar /><main className="flex-1 flex flex-col relative overflow-hidden"><ProtectedRoute><Chat /></ProtectedRoute></main></div>} />
            <Route path="/documents" element={<div className="flex flex-1"><Sidebar /><main className="flex-1 flex flex-col relative overflow-hidden"><ProtectedRoute><Documents /></ProtectedRoute></main></div>} />
            <Route path="/dashboard" element={<div className="flex flex-1"><Sidebar /><main className="flex-1 flex flex-col relative overflow-hidden"><ProtectedRoute><Dashboard /></ProtectedRoute></main></div>} />
            <Route path="/graph" element={<div className="flex flex-1"><Sidebar /><main className="flex-1 flex flex-col relative overflow-hidden"><ProtectedRoute><Graphs /></ProtectedRoute></main></div>} />
            <Route path="/settings" element={<div className="flex flex-1"><Sidebar /><main className="flex-1 flex flex-col relative overflow-hidden"><ProtectedRoute><Settings /></ProtectedRoute></main></div>} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

