import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, CheckCircle, Lock, GraduationCap, Calendar, Users, ExternalLink, KeyRound, BookOpen, UserCircle2, BookPlus, HardDrive, Table, CalendarDays } from 'lucide-react';
import { ActiveView } from '../Navbar';

interface StudentPortalPageProps {
  setView: (view: ActiveView) => void;
  userName: string;
}

export const StudentPortalPage: React.FC<StudentPortalPageProps> = ({ setView }) => {
  const [viewMode, setViewMode] = useState<'courses' | 'form' | 'success' | 'teacher_auth' | 'teacher_portal'>('courses');
  
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    address: '',
    occupation: '',
    experience: '',
    device: '',
    reason: ''
  });
  const [refId, setRefId] = useState('');
  const [teacherPwd, setTeacherPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const storedNotices = localStorage.getItem('rexlify_institute_notices');
    if (storedNotices) {
      setNotices(JSON.parse(storedNotices));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const generatedRefId = `REX-${Math.floor(100000 + Math.random() * 900000)}`;
    setRefId(generatedRefId);

    const newApp = { ...formData, refId: generatedRefId, status: 'Pending' };

    try {
      await fetch('/api/institute/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });
    } catch (err) {
      console.error('Submission failed', err);
    }

    const subject = encodeURIComponent(`New Admission Application - ${generatedRefId}`);
    const bodyText = `Reference ID: ${generatedRefId}
    
Name: ${formData.name}
WhatsApp: ${formData.whatsapp}
Email: ${formData.email}
Address: ${formData.address}
Current Occupation/Study: ${formData.occupation}
Coding Experience: ${formData.experience}
Has Device: ${formData.device}
Reason to Join: ${formData.reason}

** IMPORTANT: Please attach your recent self-photo to this email before sending! **`;

    const body = encodeURIComponent(bodyText);
    window.open(`mailto:rexlifyofficialsupport@gmail.com?subject=${subject}&body=${body}`, '_blank');
    
    setViewMode('success');
  };

  const handleTeacherAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'teacher', password: teacherPwd })
      });
      const data = await response.json();
      
      if (data.success) {
        setViewMode('teacher_portal');
        setPwdError('');
      } else {
        setPwdError('Invalid Teacher Password');
      }
    } catch (err) {
      setPwdError('Server connection error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-800 to-fuchsia-950 text-white font-sans selection:bg-pink-300 selection:text-black">
      
      {/* Universal Floating Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => {
            if (viewMode !== 'courses') setViewMode('courses');
            else setView('institute-intro');
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-mono font-bold shadow-lg backdrop-blur-md transition-all cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>
      </div>

      <main className="pt-24 pb-24 px-4 sm:px-8 max-w-6xl mx-auto w-full">
        {viewMode === 'courses' && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200 font-mono tracking-tight drop-shadow-lg">
                Rexlify Institute Learning Space
              </h1>
              <p className="text-pink-100/80 text-sm font-mono">
                Join our world-class hybrid technology programs. Explore the courses below and submit your application to start your journey.
              </p>
            </div>

            {/* Public Notice Board */}
            {notices.length > 0 && (
              <div className="p-6 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md">
                <h3 className="text-xl font-bold font-mono flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse" />
                  Institute Notice Board
                </h3>
                <div className="space-y-3">
                  {notices.map((n, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-pink-300 font-mono mb-1">{new Date(n.date).toLocaleDateString()}</p>
                      <div className="text-sm font-sans whitespace-pre-wrap">{n.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Full-Stack Web Development", duration: "1 Month (Hybrid)", tools: "React, Node, MongoDB" },
                { title: "AI & Autonomous Agents", duration: "1 Month (Hybrid)", tools: "Gemini API, LangChain" },
                { title: "Data Science Foundation", duration: "1 Month (Hybrid)", tools: "Python, Pandas, D3.js" },
                { title: "Cybersecurity Basics", duration: "1 Month (Hybrid)", tools: "Ethical Hacking, Network Auth" }
              ].map((course, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all cursor-pointer">
                  <GraduationCap size={28} className="text-pink-300 mb-4" />
                  <h3 className="text-xl font-bold font-mono mb-2">{course.title}</h3>
                  <p className="text-sm text-pink-200 mb-4">{course.duration} | {course.tools}</p>
                  <button 
                    onClick={() => setViewMode('form')}
                    className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold font-mono text-sm transition-all"
                  >
                    Join Class
                  </button>
                </div>
              ))}
            </div>

            {/* Teacher Quick Access Box */}
            <div className="mt-16 text-center">
              <button
                onClick={() => setViewMode('teacher_auth')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-pink-200 font-mono text-xs font-bold transition-all"
              >
                <Lock size={14} />
                <span>Teachers Panel / Only Teachers Allowed</span>
              </button>
            </div>
          </div>
        )}

        {viewMode === 'form' && (
          <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-black font-mono mb-2">Student Application Form</h2>
            <p className="text-sm text-pink-200 mb-8">Please fill in all details accurately. You will need to attach a photo via email in the next step.</p>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono text-pink-200 mb-1">Full Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-mono text-pink-200 mb-1">WhatsApp Number</label>
                  <input required name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} type="tel" className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold font-mono text-pink-200 mb-1">Email Address</label>
                <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-400" />
              </div>
              
              <div>
                <label className="block text-xs font-bold font-mono text-pink-200 mb-1">Full Address</label>
                <input required name="address" value={formData.address} onChange={handleInputChange} type="text" className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono text-pink-200 mb-1">Current Occupation / Study</label>
                  <input required name="occupation" value={formData.occupation} onChange={handleInputChange} type="text" placeholder="e.g. 12th Grade, B.Tech" className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold font-mono text-pink-200 mb-1">Do you have a PC/Laptop?</label>
                  <select required name="device" value={formData.device} onChange={handleInputChange} className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-400 [&>option]:bg-pink-900">
                    <option value="">Select option...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-mono text-pink-200 mb-1">Previous Coding Experience?</label>
                <input required name="experience" value={formData.experience} onChange={handleInputChange} type="text" placeholder="e.g. None, Basic HTML" className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-400" />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono text-pink-200 mb-1">Why do you want to join Rexlify?</label>
                <textarea required name="reason" value={formData.reason} onChange={handleInputChange} rows={3} className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-400 resize-none" />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-pink-500 hover:bg-pink-400 text-black font-bold font-mono text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all">
                  <ImageIcon size={18} />
                  <span>Submit & Attach Photo via Gmail</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {viewMode === 'success' && (
          <div className="max-w-xl mx-auto p-10 rounded-3xl bg-pink-500/20 border border-pink-400/50 backdrop-blur-xl shadow-2xl text-center animate-fade-in">
            <CheckCircle size={64} className="text-pink-300 mx-auto mb-6" />
            <h2 className="text-2xl font-black font-mono mb-4 text-white">Application Pre-Submitted!</h2>
            <p className="text-sm text-pink-100 mb-8">
              Your application details have been routed to Gmail. Please ensure you attach your self photo in the email before hitting send.
            </p>
            
            <div className="p-6 rounded-2xl bg-black/30 border border-white/20 mb-8 inline-block min-w-[250px]">
              <p className="text-xs text-pink-300 font-bold uppercase tracking-widest mb-2">Your Reference ID</p>
              <p className="text-3xl font-black font-mono text-white tracking-widest">{refId}</p>
            </div>
            
            <p className="text-xs text-pink-200 bg-pink-900/40 p-4 rounded-xl border border-pink-400/30">
              ⚠️ Please take a screenshot or note down this Reference ID. We will contact you shortly on your provided WhatsApp number and Email.
            </p>

            <button 
              onClick={() => setViewMode('courses')}
              className="mt-8 px-8 py-3 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold font-mono text-xs transition-all"
            >
              Return to Courses
            </button>
          </div>
        )}

        {viewMode === 'teacher_auth' && (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl animate-fade-in text-center mt-20">
            <Lock size={48} className="text-pink-300 mx-auto mb-6" />
            <h2 className="text-xl font-black font-mono mb-6">Teacher Authorization</h2>
            <form onSubmit={handleTeacherAuth} className="space-y-4">
              <input 
                type="password" 
                placeholder="Enter RTECH Password" 
                value={teacherPwd}
                onChange={(e) => setTeacherPwd(e.target.value)}
                className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-center text-sm text-white focus:outline-none focus:border-pink-400 font-mono tracking-widest"
              />
              {pwdError && <p className="text-xs text-red-300 font-bold">{pwdError}</p>}
              <button type="submit" className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-black font-bold font-mono text-sm uppercase transition-all">
                Unlock Panel
              </button>
            </form>
          </div>
        )}

        {viewMode === 'teacher_portal' && (
          <div className="space-y-8 animate-fade-in mt-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black font-mono text-white mb-2">Teacher Quick Workspace</h2>
              <p className="text-pink-200 text-sm font-mono">Launch connected Google integrations instantly.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <a href="https://classroom.google.com" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md transition-all group">
                <BookPlus size={40} className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                <span className="font-bold font-mono text-sm">Create Classroom</span>
              </a>
              
              <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md transition-all group">
                <HardDrive size={40} className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                <span className="font-bold font-mono text-sm">Google Drive</span>
              </a>
              
              <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md transition-all group">
                <Table size={40} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                <span className="font-bold font-mono text-sm">Google Sheets</span>
              </a>
              
              <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md transition-all group">
                <CalendarDays size={40} className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                <span className="font-bold font-mono text-sm">Google Calendar</span>
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
