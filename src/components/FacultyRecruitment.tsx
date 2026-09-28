/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, Users, Video, CheckCircle2, Send, FileText, Sparkles, 
  Code, Award, ArrowRight, ShieldCheck, Check, ChevronRight, Globe, Layers, UserCheck, Mail, Upload, AlertCircle, ArrowLeft, GraduationCap
} from 'lucide-react';
import { ActiveView } from './Navbar';
import { motion } from 'motion/react';
import { RexlifyLogo } from './Logo';

interface FacultyRecruitmentProps {
  setView: (view: ActiveView) => void;
}

export const FacultyRecruitment: React.FC<FacultyRecruitmentProps> = ({ setView }) => {
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    qualification: 'Graduation (B.A / B.Sc / B.Tech / Equivalent)',
    expertise: 'Full-Stack Web Development',
    customExpertise: '',
    experienceYears: 'Fresher',
    customExperience: '',
    portfolioUrl: '',
    photoFile: null as File | null,
    cvFile: null as File | null,
    coverNote: ''
  });

  const [photoFileName, setPhotoFileName] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const [isCvDragging, setIsCvDragging] = useState(false);

  const handlePhotoUpload = (file: File) => {
    setFormState(prev => ({ ...prev, photoFile: file }));
    setPhotoFileName(file.name);
  };

  const handleCvUpload = (file: File) => {
    setFormState(prev => ({ ...prev, cvFile: file }));
    setCvFileName(file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.fullName || !formState.email || !formState.whatsapp) return;
    
    const selectedDomain = formState.expertise === 'Others (Custom Write)' 
      ? `Custom: ${formState.customExpertise}` 
      : formState.expertise;

    const selectedExp = formState.experienceYears === 'Custom Experience'
      ? `Custom: ${formState.customExperience}`
      : formState.experienceYears;

    const subject = encodeURIComponent(`Faculty Application - ${formState.fullName}`);
    const body = encodeURIComponent(
      `REXLIFY FACULTY APPLICATION DETAILS\n` +
      `------------------------------------\n` +
      `Full Name: ${formState.fullName}\n` +
      `Email: ${formState.email}\n` +
      `WhatsApp: ${formState.whatsapp}\n` +
      `Educational Qualification: ${formState.qualification}\n` +
      `Domain Expertise: ${selectedDomain}\n` +
      `Experience Level: ${selectedExp}\n` +
      `Portfolio/GitHub URL: ${formState.portfolioUrl || 'None provided (Video intro alternative)'}\n` +
      `Photo File: ${photoFileName || 'Not attached'}\n` +
      `CV/Resume File: ${cvFileName || 'Not attached'}\n\n` +
      `Cover Statement / Notes:\n${formState.coverNote || 'N/A'}`
    );
    
    // Redirect to official email
    window.location.href = `mailto:rexlifyofficialsupportteam@gmail.com?subject=${subject}&body=${body}`;
    
    setIsSubmitted(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#05030e] text-white selection:bg-amber-500 selection:text-black py-12 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden relative">
      
      {/* -------------------- 1. FLOATING UNIVERSAL BACK BUTTON -------------------- */}
      <div className="fixed top-5 left-5 z-[9999]">
        <button 
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              setView('institute');
            }
          }}
          className="flex items-center gap-2 bg-[#0f172a]/80 backdrop-blur-md border border-cyan-400/40 text-cyan-400 px-4 py-2 rounded-full font-mono text-xs font-bold hover:bg-cyan-500/20 hover:border-cyan-400 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,210,255,0.3)]"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-16 pt-8">
        
        {/* Top Header Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 pl-12 sm:pl-0">
          <div className="flex items-center gap-4">
            <RexlifyLogo size={34} />
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Briefcase size={18} />
              </div>
              <div>
                <span className="font-mono text-xs text-amber-400 uppercase tracking-widest font-extrabold block">
                  REXLIFY FACULTY RECRUITMENT PORTAL
                </span>
                <span className="text-gray-400 text-xs">Empower the Next Generation of Tech Leaders</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('institute')}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs font-mono font-semibold transition-all cursor-pointer"
            >
              ← Rexlify Institute Page
            </button>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              HIRING ACTIVE
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>JOIN THE FACULTY TEAM</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-sora text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight"
          >
            SHAPE FUTURE TECH TALENTS — <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-purple-400">
              JOIN REXLIFY FACULTY
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed"
          >
            We are looking for passionate, industry-leading instructors and mentors for our 1-Month Hybrid Development Programs. Share your expertise, guide real-world projects, and inspire future software engineers.
          </motion.p>
        </div>

        {/* Embedded Video Player Section */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-[#0a0718] shadow-[0_0_50px_rgba(245,158,11,0.15)]">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/80 border border-amber-500/40 backdrop-blur-md pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-xs font-extrabold text-amber-300 tracking-wider">
              REXLIFY FACULTY INTRO
            </span>
          </div>

          <div className="aspect-video w-full relative">
            <iframe 
              src="https://www.youtube-nocookie.com/embed/xwwgWj-TTCQ?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1" 
              title="Rexlify Faculty Recruitment Introduction Video" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full border-none"
            />
          </div>
        </div>

        {/* Section 1: Who We Are Looking For & Educational Qualification Criteria */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs text-amber-400 uppercase tracking-widest font-bold">
              OPEN INSTRUCTOR POSITIONS & QUALIFICATION CRITERIA
            </span>
            <h2 className="font-sora text-2xl sm:text-3xl font-bold text-white">
              WHO WE ARE LOOKING FOR
            </h2>
          </div>

          {/* Educational Qualification & Skill Eligibility Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-black border border-amber-500/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <GraduationCap size={26} />
              </div>
              <div>
                <h3 className="font-sora text-xl font-bold text-amber-300">
                  EDUCATIONAL QUALIFICATION & ELIGIBILITY
                </h3>
                <span className="text-xs font-mono text-amber-200">Skills & Teaching Passion First</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <span className="font-mono text-amber-400 font-bold block">🎓 ACADEMIC BACKGROUND</span>
                <p className="text-gray-300 leading-relaxed">
                  Minimum qualification: Class 10th Pass (Secondary), Class 12th Pass (Higher Secondary), or Graduates (B.A, B.Sc, B.Tech, or equivalent).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <span className="font-mono text-amber-400 font-bold block">💻 MANDATORY REQUIREMENT</span>
                <p className="text-gray-300 leading-relaxed">
                  Basic to Advanced Computer & Technology Skills are strictly required. You must have practical familiarity with software tools or coding.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed font-light italic">
              ✨ <strong>Special Note:</strong> "Your institutional degree does not define your limits. If you have practical tech skills, real-world coding experience, and a genuine passion for teaching, Rexlify is ready to welcome you into our faculty team."
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Code size={20} />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-white text-base">Full-Stack Web Mentors</h3>
                  <span className="text-[11px] font-mono text-amber-400">React, TypeScript, Node.js, Next.js</span>
                </div>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Guide students through building full-stack web applications, REST/GraphQL APIs, UI/UX best practices, and production repository management.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-white text-base">AI/ML Engineers</h3>
                  <span className="text-[11px] font-mono text-purple-400">LLM Fine-tuning, Gemini API, Agents</span>
                </div>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Lead specialized modules on AI assistant development, prompt engineering, vector databases, and multi-modal application workflows.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-white text-base">Python Instructors</h3>
                  <span className="text-[11px] font-mono text-cyan-400">Data Structures, Backend, Automation</span>
                </div>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Teach foundational programming logic, algorithmic problem-solving, backend frameworks, and automated test suite creation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-white text-base">Practical Lab Leads</h3>
                  <span className="text-[11px] font-mono text-emerald-400">Hybrid Workshop & Assignment Review</span>
                </div>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Supervise student assignment reviews on WhatsApp study groups, conduct practical code evaluations, and host interactive Q&A sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Selection & Onboarding Process */}
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#0c091f] to-[#060412] border border-white/10 space-y-8">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs text-amber-400 uppercase tracking-widest font-bold">
              TRANSPARENT FACULTY PIPELINE
            </span>
            <h2 className="font-sora text-2xl sm:text-3xl font-bold text-white">
              SELECTION & ONBOARDING PROCESS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="font-mono text-xs font-bold text-amber-400">STEP 01</span>
              <h4 className="font-sora font-bold text-sm text-white">Application Submission</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Submit your CV, photo, GitHub repository, and domain expertise details via the form below.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="font-mono text-xs font-bold text-amber-400">STEP 02</span>
              <h4 className="font-sora font-bold text-sm text-white">Teaching Demo</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Conduct a 15-minute live virtual walkthrough on a technical topic of your choice.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="font-mono text-xs font-bold text-amber-400">STEP 03</span>
              <h4 className="font-sora font-bold text-sm text-white">Curriculum Orientation</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Briefing on NeuraX AI integration, WhatsApp student groups, and evaluation rubrics.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="font-mono text-xs font-bold text-amber-400">STEP 04</span>
              <h4 className="font-sora font-bold text-sm text-white">Faculty Onboarding</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Official contract agreement, course assignment, and cohort schedule confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Instructor Application Form */}
        <div id="faculty-form" className="rounded-3xl p-8 sm:p-12 bg-[#09071b] border border-amber-500/30 space-y-8 shadow-2xl">
          <div className="space-y-2 text-center">
            <span className="font-mono text-xs text-amber-400 uppercase tracking-widest font-bold">
              JOIN OUR EDUCATIONAL MISSION
            </span>
            <h2 className="font-sora text-2xl sm:text-3xl font-bold text-white">
              INSTRUCTOR APPLICATION FORM
            </h2>
            <p className="text-gray-400 text-xs max-w-lg mx-auto">
              Fill in your details below. Your application will connect directly to <strong className="text-cyan-300 font-mono">rexlifyofficialsupportteam@gmail.com</strong>.
            </p>
          </div>

          {/* Direct Email Fallback Notice Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
            <div className="flex items-center gap-2 font-mono font-bold text-amber-300">
              <Mail size={16} />
              <span>OFFICIAL EMAIL DESK INTEGRATION:</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Submitting this form connects directly with our official recruitment desk: <strong className="text-amber-300 font-mono">rexlifyofficialsupportteam@gmail.com</strong> with subject line <span className="font-mono text-cyan-300">'Faculty Application - [Your Name]'</span>.
            </p>
          </div>

          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <Check size={32} />
              </div>
              <h3 className="font-sora text-2xl font-bold text-white">Application Sent to rexlifyofficialsupportteam@gmail.com!</h3>
              <p className="text-gray-300 text-xs max-w-md mx-auto leading-relaxed">
                Your application details have been formatted and directed to our official support team. Our academic operations team will respond within 24-48 hours.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Columns (Form Inputs) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-gray-300 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formState.fullName}
                        onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-gray-300 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="rahul@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* WhatsApp & Qualification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-gray-300 mb-1.5">WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        value={formState.whatsapp}
                        onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-gray-300 mb-1.5">Educational Qualification *</label>
                      <select
                        value={formState.qualification}
                        onChange={(e) => setFormState({ ...formState, qualification: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#070515] border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition-colors"
                      >
                        <option value="Class 10th Pass (Secondary)">Class 10th Pass (Secondary)</option>
                        <option value="Class 12th Pass (Higher Secondary)">Class 12th Pass (Higher Secondary)</option>
                        <option value="Graduation (B.A / B.Sc / B.Tech / Equivalent)">Graduation (B.A / B.Sc / B.Tech / Equivalent)</option>
                        <option value="Post Graduation (M.A / M.Sc / M.Tech / PhD)">Post Graduation (M.A / M.Sc / M.Tech / PhD)</option>
                        <option value="Self-Taught / Diploma Developer">Self-Taught / Diploma Developer</option>
                      </select>
                    </div>
                  </div>

                  {/* Primary Domain Expertise with Others (Custom Write) */}
                  <div className="space-y-2">
                    <label className="block font-mono text-xs text-gray-300">Primary Domain Expertise *</label>
                    <select
                      value={formState.expertise}
                      onChange={(e) => setFormState({ ...formState, expertise: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#070515] border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition-colors"
                    >
                      <option value="Full-Stack Web Development">Full-Stack Web Mentors (React/Node/TS)</option>
                      <option value="AI / ML Engineering">AI / ML Engineers (Gemini/LLMs/Python)</option>
                      <option value="Python Programming">Python & Backend Automation Instructors</option>
                      <option value="Practical Lab & Code Review Lead">Practical Lab Leads & Reviewers</option>
                      <option value="Others (Custom Write)">Others (Custom Write)</option>
                    </select>

                    {formState.expertise === 'Others (Custom Write)' && (
                      <input
                        type="text"
                        required
                        value={formState.customExpertise}
                        onChange={(e) => setFormState({ ...formState, customExpertise: e.target.value })}
                        placeholder="Please specify your custom technical domain..."
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-amber-500/40 text-white text-xs outline-none focus:border-amber-300 transition-colors mt-2"
                      />
                    )}
                  </div>

                  {/* Years of Experience with Fresher Option */}
                  <div className="space-y-2">
                    <label className="block font-mono text-xs text-gray-300">Experience Level *</label>
                    <select
                      value={formState.experienceYears}
                      onChange={(e) => setFormState({ ...formState, experienceYears: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#070515] border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition-colors"
                    >
                      <option value="Fresher">Fresher (Passionate Learner & Skill Holder)</option>
                      <option value="1-2 Years">1-2 Years Industry / Mentorship Experience</option>
                      <option value="3-5 Years">3-5 Years Practical Engineering Experience</option>
                      <option value="5+ Years">5+ Years Senior Developer / Lead Experience</option>
                      <option value="Custom Experience">Custom Experience (Specify below)</option>
                    </select>

                    {formState.experienceYears === 'Custom Experience' && (
                      <input
                        type="text"
                        required
                        value={formState.customExperience}
                        onChange={(e) => setFormState({ ...formState, customExperience: e.target.value })}
                        placeholder="Describe your custom background (e.g. Freelance, Open Source)..."
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-amber-500/40 text-white text-xs outline-none focus:border-amber-300 transition-colors mt-2"
                      />
                    )}
                  </div>

                  {/* Portfolio / GitHub URL & Video Intro Notice */}
                  <div className="space-y-2">
                    <label className="block font-mono text-xs text-gray-300">Portfolio / GitHub URL</label>
                    <input
                      type="url"
                      value={formState.portfolioUrl}
                      onChange={(e) => setFormState({ ...formState, portfolioUrl: e.target.value })}
                      placeholder="https://github.com/yourhandle"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition-colors"
                    />

                    {/* Video Intro Alternative Banner */}
                    <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2.5 mt-2">
                      <Video size={18} className="text-purple-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-mono text-[11px] text-purple-300 font-bold block">
                          OR VIDEO INTRODUCTION ALTERNATIVE:
                        </span>
                        <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                          If you do not have an active GitHub link, record a short 30-second video introducing yourself and your technical passion, then send it to our official email: <strong className="text-purple-300 font-mono">rexlifyofficialsupportteam@gmail.com</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cover Note */}
                  <div>
                    <label className="block font-mono text-xs text-gray-300 mb-1.5">Brief Cover Note / Teaching Statement</label>
                    <textarea
                      rows={3}
                      value={formState.coverNote}
                      onChange={(e) => setFormState({ ...formState, coverNote: e.target.value })}
                      placeholder="Share your motivation to teach and mentor..."
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition-colors resize-none"
                    />
                  </div>

                </div>

                {/* Right Column: Two Premium Upload Cards (Photo & CV Dropzones) */}
                <div className="space-y-6">
                  
                  {/* Dropzone Box 1: Profile Photo */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsPhotoDragging(true); }}
                    onDragLeave={() => setIsPhotoDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsPhotoDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handlePhotoUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all flex flex-col items-center justify-center space-y-3 ${
                      isPhotoDragging 
                        ? 'border-amber-400 bg-amber-500/10 scale-102' 
                        : photoFileName 
                          ? 'border-emerald-500/60 bg-emerald-950/20' 
                          : 'border-white/15 bg-white/[0.02] hover:border-amber-500/40'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Upload size={22} />
                    </div>

                    <div className="space-y-1">
                      <span className="font-sora text-xs font-bold text-white block">
                        Upload Profile Photo
                      </span>
                      <span className="text-[10px] text-gray-400 block font-mono">
                        Drag & Drop or Browse (JPG, PNG)
                      </span>
                    </div>

                    {photoFileName ? (
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
                        <Check size={14} />
                        <span className="truncate max-w-[150px]">{photoFileName}</span>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files && e.target.files[0] && handlePhotoUpload(e.target.files[0])}
                          className="hidden"
                          id="photo-card-input"
                        />
                        <label
                          htmlFor="photo-card-input"
                          className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold cursor-pointer transition-all inline-block"
                        >
                          Browse Image File
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Dropzone Box 2: Resume / CV */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsCvDragging(true); }}
                    onDragLeave={() => setIsCvDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsCvDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleCvUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all flex flex-col items-center justify-center space-y-3 ${
                      isCvDragging 
                        ? 'border-cyan-400 bg-cyan-500/10 scale-102' 
                        : cvFileName 
                          ? 'border-emerald-500/60 bg-emerald-950/20' 
                          : 'border-white/15 bg-white/[0.02] hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <FileText size={22} />
                    </div>

                    <div className="space-y-1">
                      <span className="font-sora text-xs font-bold text-white block">
                        Upload Resume / CV
                      </span>
                      <span className="text-[10px] text-gray-400 block font-mono">
                        Drag & Drop or Browse (PDF, DOCX)
                      </span>
                    </div>

                    {cvFileName ? (
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
                        <Check size={14} />
                        <span className="truncate max-w-[150px]">{cvFileName}</span>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc"
                          onChange={(e) => e.target.files && e.target.files[0] && handleCvUpload(e.target.files[0])}
                          className="hidden"
                          id="cv-card-input"
                        />
                        <label
                          htmlFor="cv-card-input"
                          className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold cursor-pointer transition-all inline-block"
                        >
                          Browse Resume PDF
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-[11px] text-gray-400 space-y-2">
                    <span className="font-mono text-gray-300 font-bold block">⚡ SUBMISSION PROCESS</span>
                    <p className="leading-relaxed">
                      Your form details will be sent directly to <strong className="text-white">rexlifyofficialsupportteam@gmail.com</strong>.
                    </p>
                  </div>

                </div>

              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-black font-sora font-extrabold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  <span>SUBMIT APPLICATION TO REXLIFY OFFICIAL EMAIL</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
