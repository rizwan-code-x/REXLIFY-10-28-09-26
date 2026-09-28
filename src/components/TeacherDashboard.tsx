import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen, Users, BellRing, Sparkles, LayoutDashboard, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { ActiveView } from './Navbar';
import { RexlifyLogo } from './Logo';

interface TeacherDashboardProps {
  onLogout: () => void;
  setView: (view: ActiveView) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout, setView }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'notices'>('dashboard');
  
  // States for student applications
  const [students, setStudents] = useState<any[]>([]);

  // States for AI Notice Board
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedNotice, setGeneratedNotice] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    // Fetch student applications from Supabase via API
    fetch('/api/institute/applications')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStudents(data.data);
        }
      })
      .catch(err => console.error('Error fetching students:', err));
    
    // Load notices
    const storedNotices = localStorage.getItem('rexlify_institute_notices');
    if (storedNotices) {
      setNotices(JSON.parse(storedNotices));
    }
  }, []);

  const handleGenerateNotice = () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    
    // Simulate AI Generation delay and structure output
    setTimeout(() => {
      const noticeNumber = Math.floor(1000 + Math.random() * 9000);
      const date = new Date().toLocaleDateString('en-IN');
      const formatted = `NOTICE REF: REX-NB-${noticeNumber}
DATE: ${date}

IMPORTANT UPDATE FOR REXLIFY INSTITUTE:

* ${aiPrompt}

Please ensure you follow these updates carefully. For further inquiries, contact your assigned faculty or support.

Regards,
Rexlify Institute Management
Chief Instructor, Rizwan RR`;

      setGeneratedNotice(formatted);
      setIsGenerating(false);
    }, 1500);
  };

  const publishNotice = () => {
    if (!generatedNotice) return;
    const newNotice = { text: generatedNotice, date: new Date().toISOString() };
    const updated = [newNotice, ...notices];
    setNotices(updated);
    localStorage.setItem('rexlify_institute_notices', JSON.stringify(updated));
    setGeneratedNotice('');
    setAiPrompt('');
  };

  return (
    <div className="min-h-screen flex bg-[#05040e] text-slate-100 font-sans">
      {/* Left Sidebar Menu */}
      <aside className="w-64 bg-slate-950 border-r border-white/10 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <ShieldCheck size={28} className="text-purple-400" />
          <div>
            <h1 className="text-sm font-bold font-mono text-purple-300">Teacher Panel</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Rexlify Control</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-sm transition-all ${activeTab === 'dashboard' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('applications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-sm transition-all ${activeTab === 'applications' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Users size={18} />
            Student Apps ({students.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('notices')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-sm transition-all ${activeTab === 'notices' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <BellRing size={18} />
            AI Notice Board
          </button>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono font-bold transition-all border border-red-500/30"
          >
            <LogOut size={16} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 max-w-7xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black font-mono text-white">
              {activeTab === 'dashboard' && 'Faculty Workspace'}
              {activeTab === 'applications' && 'Enrolled Students Database'}
              {activeTab === 'notices' && 'AI Notice Generator'}
            </h2>
            <p className="text-sm text-slate-400">Authenticated strictly for Teachers.</p>
          </div>
          <button onClick={() => setView('home')} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/10 transition-colors">
            Exit to Home
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <Users size={24} className="text-cyan-400 mb-2" />
                <h3 className="text-3xl font-black text-white">{students.length}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Total Applications</p>
              </div>
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <BellRing size={24} className="text-amber-400 mb-2" />
                <h3 className="text-3xl font-black text-white">{notices.length}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Published Notices</p>
              </div>
              <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <BookOpen size={24} className="text-purple-400 mb-2" />
                <h3 className="text-3xl font-black text-white">4</h3>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Active Classes</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-white/10">
              <h3 className="text-lg font-bold font-mono mb-4 text-white">Quick Google Integrations</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="https://classroom.google.com" target="_blank" rel="noreferrer" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-2 transition-all">
                  <span className="font-mono text-xs">Create Classroom</span>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
                <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noreferrer" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-2 transition-all">
                  <span className="font-mono text-xs">Open Google Sheets</span>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="animate-fade-in bg-slate-900 rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-white/10 text-xs font-mono uppercase tracking-widest text-slate-400">
                    <th className="p-4">Ref ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">WhatsApp</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Occupation</th>
                    <th className="p-4">Device</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-sans">
                  {students.map((st, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-cyan-300 text-xs">{st.refId}</td>
                      <td className="p-4 text-white font-bold">{st.name}</td>
                      <td className="p-4 text-slate-300">{st.whatsapp}</td>
                      <td className="p-4 text-slate-300">{st.email}</td>
                      <td className="p-4 text-slate-400">{st.occupation}</td>
                      <td className="p-4 text-slate-400">{st.device}</td>
                      <td className="p-4 text-slate-500 text-xs">{new Date(st.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">No applications received yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'notices' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-white/10">
                <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-amber-400" />
                  AI Notice Writer
                </h3>
                <p className="text-xs text-slate-400 mb-4">Just type a rough idea, and the AI will format it professionally with a notice number and date.</p>
                
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Tell students tomorrow's class is at 5PM instead of 4PM due to holiday."
                  className="w-full h-32 bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none mb-4"
                />
                
                <button 
                  onClick={handleGenerateNotice}
                  disabled={isGenerating || !aiPrompt}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold font-mono text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {isGenerating ? 'AI Generating...' : 'Generate Format'}
                  <Sparkles size={16} />
                </button>
              </div>

              {generatedNotice && (
                <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30">
                  <h3 className="text-sm font-bold font-mono text-amber-300 mb-3">AI Output Preview:</h3>
                  <div className="p-4 bg-black/40 rounded-xl font-mono text-xs text-slate-300 whitespace-pre-wrap mb-4">
                    {generatedNotice}
                  </div>
                  <button 
                    onClick={publishNotice}
                    className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 font-bold font-mono text-sm transition-all"
                  >
                    Publish to Public Notice Board
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 max-h-[600px] overflow-y-auto">
              <h3 className="text-lg font-bold font-mono text-white mb-6">Published Notices</h3>
              <div className="space-y-4">
                {notices.map((n, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950 border border-white/5">
                    <p className="text-[10px] text-slate-500 mb-2">{new Date(n.date).toLocaleString()}</p>
                    <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{n.text}</div>
                  </div>
                ))}
                {notices.length === 0 && (
                  <p className="text-slate-500 font-mono text-sm text-center">No notices published yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
