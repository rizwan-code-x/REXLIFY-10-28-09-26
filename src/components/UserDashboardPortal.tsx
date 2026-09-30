import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, Lock, Shield, FileText, Sparkles, User, Plus, X, 
  ExternalLink, Calendar, Trash2, Check, BarChart3, Edit3, Heart, 
  BookOpen, Clock, Activity, ArrowUpRight, Search, Download, 
  CheckCircle2, Bookmark, BookmarkCheck, LogIn, LogOut, ChevronRight,
  HardDrive, Cpu, Terminal, Filter, RefreshCw
} from 'lucide-react';
import { UserAccount, UserUploadedFile, Application, DocArticle, UserActivityItem } from '../types';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { SifraLogo, NeuraxLogo, RexlifyLogo } from './Logo';

interface UserDashboardPortalProps {
  activeUser: UserAccount;
  onUpdateActiveUser: (user: UserAccount) => void;
  applications: Application[];
  documents: DocArticle[];
}

const cardVariants: any = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.08,
      ease: [0.25, 0.1, 0.25, 1]
    }
  })
};

export const UserDashboardPortal: React.FC<UserDashboardPortalProps> = ({
  activeUser,
  onUpdateActiveUser,
  applications,
  documents
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'overview' | 'favorites' | 'saved-docs' | 'locker'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempUsername, setTempUsername] = useState(activeUser.username || '');
  const [tempBio, setTempBio] = useState(activeUser.bio || '');
  const [tempAvatar, setTempAvatar] = useState(activeUser.avatar || '🚀');
  const [tempRole, setTempRole] = useState(activeUser.role || 'Ecosystem Explorer');
  
  // Search & filter states
  const [activityFilter, setActivityFilter] = useState<'all' | 'login' | 'download' | 'favorite' | 'view_doc' | 'upload'>('all');
  const [favoriteSearch, setFavoriteSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [selectedDocPreview, setSelectedDocPreview] = useState<DocArticle | null>(null);

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [uploadingName, setUploadingName] = useState('');

  // Favorites matches
  const favoritedAppIds = activeUser.favorites || [];
  const favoritedApps = applications.filter(app => favoritedAppIds.includes(app.id));

  // Saved Documentation matches
  const savedDocIds = activeUser.savedDocs || [];
  const savedDocArticles = documents.filter(doc => savedDocIds.includes(doc.id) || savedDocIds.includes(doc.slug));

  // Activity History
  const activities: UserActivityItem[] = activeUser.activityHistory || [
    {
      id: 'act-default-1',
      type: 'login',
      title: 'Authenticated Session Initiated',
      description: 'Connected to Rexlify Cloud Hub with local security credentials.',
      timestamp: 'Today at 09:24 AM'
    },
    {
      id: 'act-default-2',
      type: 'favorite',
      title: 'Added Sifra AI to Favorites',
      description: 'Bookmarked Sifra AI Core v1.0.2 to your ecosystem workspace.',
      timestamp: 'May 28, 2026'
    }
  ];

  const filteredActivities = activities.filter(act => {
    if (activityFilter === 'all') return true;
    return act.type === activityFilter;
  });

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const newActivity: UserActivityItem = {
          id: `act-${Date.now()}`,
          type: 'login',
          title: 'Google OAuth Verification',
          description: `Successfully authenticated as ${result.user.displayName || result.user.email}.`,
          timestamp: 'Just now'
        };
        onUpdateActiveUser({
          ...activeUser,
          username: result.user.displayName || activeUser.username,
          email: result.user.email || activeUser.email,
          activityHistory: [newActivity, ...(activeUser.activityHistory || [])]
        });
      }
    } catch (error) {
      console.error("Failed to sign in with Google:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newActivity: UserActivityItem = {
      id: `act-${Date.now()}`,
      type: 'profile_update',
      title: 'Profile Updated',
      description: `Updated identity credentials to "${tempUsername}".`,
      timestamp: 'Just now'
    };
    onUpdateActiveUser({
      ...activeUser,
      username: tempUsername || 'Anonymous',
      bio: tempBio || 'Secure deployment client.',
      avatar: tempAvatar || '🚀',
      role: tempRole || 'Ecosystem Explorer',
      activityHistory: [newActivity, ...(activeUser.activityHistory || [])]
    });
    setIsEditingProfile(false);
  };

  const handleToggleFavorite = (appId: string, appName: string) => {
    const isCurrentlyFav = favoritedAppIds.includes(appId);
    const newFavs = isCurrentlyFav 
      ? favoritedAppIds.filter(id => id !== appId)
      : [...favoritedAppIds, appId];
    
    const newActivity: UserActivityItem = {
      id: `act-${Date.now()}`,
      type: 'favorite',
      title: isCurrentlyFav ? `Removed ${appName} from Favorites` : `Added ${appName} to Favorites`,
      description: isCurrentlyFav ? `Unfavorited ${appName} from personal vault.` : `Saved ${appName} to quick access bookmarks.`,
      timestamp: 'Just now'
    };

    onUpdateActiveUser({
      ...activeUser,
      favorites: newFavs,
      activityHistory: [newActivity, ...(activeUser.activityHistory || [])]
    });
  };

  const handleToggleSaveDoc = (docId: string, docTitle: string) => {
    const isCurrentlySaved = savedDocIds.includes(docId);
    const newSaved = isCurrentlySaved
      ? savedDocIds.filter(id => id !== docId)
      : [...savedDocIds, docId];

    const newActivity: UserActivityItem = {
      id: `act-${Date.now()}`,
      type: 'view_doc',
      title: isCurrentlySaved ? `Removed ${docTitle}` : `Saved Documentation Guide`,
      description: isCurrentlySaved ? `Removed "${docTitle}" from saved docs.` : `Pinned "${docTitle}" to saved documentation reader.`,
      timestamp: 'Just now'
    };

    onUpdateActiveUser({
      ...activeUser,
      savedDocs: newSaved,
      activityHistory: [newActivity, ...(activeUser.activityHistory || [])]
    });
  };

  const handleClearActivityHistory = () => {
    onUpdateActiveUser({
      ...activeUser,
      activityHistory: []
    });
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const simulateFileUpload = (fileName: string, fileSizeStr: string) => {
    setUploadingName(fileName);
    setUploadProgress(15);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          const newFile: UserUploadedFile = {
            id: `file-${Date.now()}`,
            name: fileName,
            type: 'document',
            size: fileSizeStr,
            date: new Date().toISOString().split('T')[0],
            hash: 'SHA256:' + Math.random().toString(16).slice(2, 10).toUpperCase() + Math.random().toString(16).slice(2, 10).toUpperCase()
          };

          const newActivity: UserActivityItem = {
            id: `act-${Date.now()}`,
            type: 'upload',
            title: `Uploaded File: ${fileName}`,
            description: `Deposited encrypted file payload (${fileSizeStr}) into locker repository.`,
            timestamp: 'Just now'
          };
          
          onUpdateActiveUser({
            ...activeUser,
            uploadedFiles: [newFile, ...(activeUser.uploadedFiles || [])],
            activityHistory: [newActivity, ...(activeUser.activityHistory || [])]
          });

          setTimeout(() => setUploadProgress(-1), 1200);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 20;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      simulateFileUpload(file.name, `${sizeMB} MB`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      simulateFileUpload(file.name, `${sizeMB} MB`);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    const updatedFiles = (activeUser.uploadedFiles || []).filter(f => f.id !== fileId);
    onUpdateActiveUser({
      ...activeUser,
      uploadedFiles: updatedFiles
    });
  };

  // Storage utilization
  const totalUploadedSizeMB = (activeUser.uploadedFiles || []).reduce((sum, f) => {
    const size = parseFloat(f.size.replace(' MB', '')) || 0;
    return sum + size;
  }, 0);
  
  const storageQuotaMB = 100;
  const storagePercentage = Math.min(100, parseFloat(((totalUploadedSizeMB / storageQuotaMB) * 100).toFixed(1)));

  const renderAppLogo = (logo: string, size: number = 32) => {
    if (logo === 'sifra') return <SifraLogo size={size} />;
    if (logo === 'neurax') return <NeuraxLogo size={size} />;
    if (logo === 'rexlify') return <RexlifyLogo size={size} />;
    return <span style={{ fontSize: `${size * 0.7}px` }}>{logo || '📱'}</span>;
  };

  return (
    <div className="py-8 md:py-12 space-y-10">
      
      {/* Header Bar */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/10 pb-8"
      >
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs tracking-widest text-emerald-400 uppercase font-semibold">
              Authenticated Node Control
            </span>
          </div>
          <h1 className="font-sora text-3xl md:text-4xl font-semibold text-white tracking-tight">
            User Workspace & Profile
          </h1>
          <p className="text-gray-400 text-sm font-light">
            Manage your personal profile, activity history, bookmarked tools, and saved documentation guides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {auth.currentUser ? (
            <button 
              onClick={handleSignOut}
              id="dashboard-signout-btn"
              className="px-5 py-2.5 border border-white/10 bg-[#050505] hover:bg-white/5 text-xs text-gray-400 hover:text-white rounded-xl font-mono transition-colors cursor-pointer uppercase font-semibold flex items-center gap-2"
            >
              <LogOut size={14} />
              Disconnect
            </button>
          ) : (
            <button 
              onClick={handleGoogleSignIn}
              id="dashboard-google-signin-btn"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-mono transition-transform duration-200 cursor-pointer font-bold uppercase shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-xs active:scale-95 tracking-wider"
            >
              <User size={14} />
              Google Auth
            </button>
          )}
        </div>
      </motion.div>

      {/* Modern Navigation Tabs */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={1}
        className="flex flex-wrap gap-2 border-b border-white/10 pb-4"
      >
        <button
          onClick={() => setActiveTab('profile')}
          id="tab-btn-profile"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-[#050505] text-gray-400 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <User size={15} />
          User Profile
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          id="tab-btn-overview"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-[#050505] text-gray-400 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <BarChart3 size={15} />
          Console Overview
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          id="tab-btn-favorites"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'favorites'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-[#050505] text-gray-400 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <Heart size={15} />
          Favorites ({favoritedApps.length})
        </button>

        <button
          onClick={() => setActiveTab('saved-docs')}
          id="tab-btn-saved-docs"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'saved-docs'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-[#050505] text-gray-400 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <BookOpen size={15} />
          Saved Docs ({savedDocArticles.length})
        </button>

        <button
          onClick={() => setActiveTab('locker')}
          id="tab-btn-locker"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'locker'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-[#050505] text-gray-400 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <Lock size={15} />
          Document Locker ({(activeUser.uploadedFiles || []).length})
        </button>
      </motion.div>

      {/* ======================= 1. USER PROFILE VIEW ======================= */}
      {activeTab === 'profile' && (
        <div className="space-y-10">
          
          {/* Top User Profile Header Card */}
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={2}
            className="bg-[#050505] p-8 md:p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <span className="text-6xl p-5 bg-white/5 border border-white/10 rounded-[2rem] shadow-inner select-none flex items-center justify-center h-24 w-24">
                    {activeUser.avatar || '🚀'}
                  </span>
                  <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-[#050505] flex items-center justify-center text-black" title="Active">
                    <Check size={12} strokeWidth={3} />
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-sora text-2xl md:text-3xl font-semibold text-white">
                      {activeUser.username}
                    </h2>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md font-mono text-[10px] uppercase font-bold tracking-widest">
                      {auth.currentUser ? 'Verified Google Member' : 'Local Sandbox Node'}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-gray-500 tracking-wider">
                    {activeUser.email} &bull; <span className="text-gray-400">{activeUser.role || 'Ecosystem Explorer'}</span>
                  </p>
                  <p className="text-gray-400 text-sm font-light max-w-xl leading-relaxed">
                    {activeUser.bio}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  id="edit-profile-toggle-btn"
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit3 size={15} />
                  {isEditingProfile ? 'Close Editor' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
              <div className="bg-[#030303] p-4 rounded-2xl border border-white/5 text-left space-y-1 shadow-inner">
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">Favorite Apps</span>
                <span className="font-sora text-2xl font-semibold text-emerald-400">{favoritedApps.length}</span>
              </div>
              <div className="bg-[#030303] p-4 rounded-2xl border border-white/5 text-left space-y-1 shadow-inner">
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">Saved Guides</span>
                <span className="font-sora text-2xl font-semibold text-white">{savedDocArticles.length}</span>
              </div>
              <div className="bg-[#030303] p-4 rounded-2xl border border-white/5 text-left space-y-1 shadow-inner">
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">Activity Events</span>
                <span className="font-sora text-2xl font-semibold text-emerald-400">{activities.length}</span>
              </div>
              <div className="bg-[#030303] p-4 rounded-2xl border border-white/5 text-left space-y-1 shadow-inner">
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">Vault Storage</span>
                <span className="font-sora text-2xl font-semibold text-white">{totalUploadedSizeMB.toFixed(1)} <span className="text-xs text-gray-500 font-mono">MB</span></span>
              </div>
            </div>

            {/* Inline Profile Editor Form */}
            {isEditingProfile && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveProfile}
                className="mt-8 pt-8 border-t border-white/10 space-y-6 text-left"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-sora text-base font-semibold text-white flex items-center gap-2">
                    <User size={18} className="text-emerald-400" />
                    Edit Profile Details
                  </h3>
                  <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest">Immediate Local Sync</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      placeholder="Your handle"
                      id="input-edit-username"
                      className="w-full text-sm font-sans px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={tempRole}
                      onChange={(e) => setTempRole(e.target.value)}
                      placeholder="e.g. AI Architect, Developer"
                      id="input-edit-role"
                      className="w-full text-sm font-sans px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                    Bio Description
                  </label>
                  <textarea
                    rows={3}
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    placeholder="Short bio or developer focus..."
                    id="input-edit-bio"
                    className="w-full text-sm font-sans px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                    Select Avatar Symbol
                  </label>
                  <div className="flex flex-wrap gap-3 py-1">
                    {['🚀', '👑', '👤', '🤖', '👾', '✨', '⚡', '🛡️', '🧠', '🌐'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setTempAvatar(emoji)}
                        className={`text-2xl p-2.5 rounded-xl transition-all cursor-pointer ${
                          tempAvatar === emoji 
                            ? 'bg-emerald-500/20 border border-emerald-500/50 scale-110 shadow-lg shadow-emerald-500/20' 
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="submit" 
                    id="save-profile-btn"
                    className="py-3 px-6 bg-emerald-500 text-black rounded-xl font-mono font-bold uppercase tracking-widest text-xs cursor-pointer shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditingProfile(false)}
                    className="py-3 px-6 bg-white/5 text-gray-400 rounded-xl font-mono font-bold uppercase tracking-widest text-xs cursor-pointer hover:bg-white/10 hover:text-white transition-colors border border-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </motion.div>

          {/* Activity History and Favorites & Docs split layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Interactive Activity History Timeline */}
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={3}
              className="lg:col-span-6 bg-[#050505] p-8 md:p-10 rounded-[2.5rem] border border-white/10 space-y-6 flex flex-col justify-between hover:border-emerald-500/30 transition-colors duration-500 shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 text-left">
                  <div className="space-y-1">
                    <h3 className="font-sora text-xl font-semibold text-white flex items-center gap-2.5">
                      <Activity size={20} className="text-emerald-400" />
                      Activity History
                    </h3>
                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                      Real-time user actions, downloads, & bookmark log
                    </p>
                  </div>

                  {activities.length > 0 && (
                    <button 
                      onClick={handleClearActivityHistory}
                      className="text-gray-500 hover:text-red-400 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                      title="Clear activity log"
                    >
                      Clear Log
                    </button>
                  )}
                </div>

                {/* Activity Filter Chips */}
                <div className="flex flex-wrap gap-2 text-left">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'login', label: 'Logins' },
                    { id: 'favorite', label: 'Bookmarks' },
                    { id: 'view_doc', label: 'Docs' },
                    { id: 'download', label: 'Downloads' },
                    { id: 'upload', label: 'Uploads' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActivityFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        activityFilter === f.id
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'bg-[#030303] text-gray-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Activity items list */}
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar text-left">
                  {filteredActivities.length === 0 ? (
                    <div className="py-12 text-center space-y-3 bg-[#030303] rounded-2xl border border-white/5 p-6">
                      <Activity className="text-gray-600 mx-auto" size={28} />
                      <p className="font-mono text-xs text-gray-400 uppercase tracking-wider">No activity recorded for this category</p>
                    </div>
                  ) : (
                    filteredActivities.map((act, idx) => {
                      const getActIcon = () => {
                        switch (act.type) {
                          case 'login': return <LogIn size={15} className="text-blue-400" />;
                          case 'favorite': return <Heart size={15} className="text-rose-400 fill-rose-400/20" />;
                          case 'download': return <Download size={15} className="text-emerald-400" />;
                          case 'view_doc': return <BookOpen size={15} className="text-amber-400" />;
                          case 'upload': return <UploadCloud size={15} className="text-purple-400" />;
                          default: return <Sparkles size={15} className="text-emerald-400" />;
                        }
                      };

                      return (
                        <div 
                          key={act.id || idx}
                          className="bg-[#030303] p-4 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all flex items-start gap-4 group"
                        >
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 shrink-0 mt-0.5 group-hover:bg-emerald-500/10 transition-colors">
                            {getActIcon()}
                          </div>

                          <div className="space-y-1 flex-grow overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-sora text-xs font-semibold text-white truncate">
                                {act.title}
                              </h4>
                              <span className="font-mono text-[9px] text-gray-500 shrink-0">
                                {act.timestamp}
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs font-light leading-relaxed">
                              {act.description}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500">
                <span>REXLIFY SECURE TELEMETRY</span>
                <span className="text-emerald-400">ACTIVE DISPATCH</span>
              </div>
            </motion.div>

            {/* Right Column: Favorites & Saved Documentation Highlights */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Favorite Apps Card */}
              <motion.div 
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={4}
                className="bg-[#050505] p-8 md:p-10 rounded-[2.5rem] border border-white/10 space-y-6 hover:border-emerald-500/30 transition-colors duration-500 shadow-2xl text-left"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="space-y-1">
                    <h3 className="font-sora text-xl font-semibold text-white flex items-center gap-2.5">
                      <Heart size={20} className="text-rose-400 fill-rose-400/20" />
                      Favorite Items ({favoritedApps.length})
                    </h3>
                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                      Applications & neural models pinned to your vault
                    </p>
                  </div>

                  <button 
                    onClick={() => setActiveTab('favorites')}
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                  >
                    View All <ChevronRight size={14} />
                  </button>
                </div>

                {favoritedApps.length === 0 ? (
                  <div className="py-8 text-center space-y-3 bg-[#030303] rounded-2xl border border-white/5 p-6">
                    <Heart className="text-gray-600 mx-auto" size={28} />
                    <p className="font-mono text-xs text-gray-400 uppercase tracking-wider">No favorites saved yet</p>
                    <p className="text-xs text-gray-500 font-light">Explore the Applications Hub and tap the bookmark heart icon to save tools here.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {favoritedApps.slice(0, 4).map((app) => (
                      <div 
                        key={app.id}
                        className="p-4 bg-[#030303] rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <div className="h-10 w-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                            {renderAppLogo(app.logo, 22)}
                          </div>
                          <div className="space-y-0.5 overflow-hidden">
                            <h4 className="font-sora font-semibold text-white text-xs truncate group-hover:text-emerald-400 transition-colors">
                              {app.name}
                            </h4>
                            <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider block">
                              {app.category} &bull; v{app.version}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold uppercase">
                            {app.status}
                          </span>
                          <button
                            onClick={() => handleToggleFavorite(app.id, app.name)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove from favorites"
                          >
                            <Heart size={14} className="fill-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Saved Documentation Card */}
              <motion.div 
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={5}
                className="bg-[#050505] p-8 md:p-10 rounded-[2.5rem] border border-white/10 space-y-6 hover:border-emerald-500/30 transition-colors duration-500 shadow-2xl text-left"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="space-y-1">
                    <h3 className="font-sora text-xl font-semibold text-white flex items-center gap-2.5">
                      <BookmarkCheck size={20} className="text-amber-400" />
                      Saved Documentation ({savedDocArticles.length})
                    </h3>
                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                      Bookmarked guides, architecture manuals & API nodes
                    </p>
                  </div>

                  <button 
                    onClick={() => setActiveTab('saved-docs')}
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                  >
                    View All <ChevronRight size={14} />
                  </button>
                </div>

                {savedDocArticles.length === 0 ? (
                  <div className="py-8 text-center space-y-3 bg-[#030303] rounded-2xl border border-white/5 p-6">
                    <BookOpen className="text-gray-600 mx-auto" size={28} />
                    <p className="font-mono text-xs text-gray-400 uppercase tracking-wider">No documentation saved yet</p>
                    <p className="text-xs text-gray-500 font-light">Bookmark documentation articles from the ecosystem guides for offline reading.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {savedDocArticles.slice(0, 4).map((doc) => (
                      <div 
                        key={doc.id}
                        onClick={() => setSelectedDocPreview(doc)}
                        className="p-4 bg-[#030303] rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                      >
                        <div className="space-y-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-emerald-400 uppercase font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                              {doc.category}
                            </span>
                            <span className="font-mono text-[9px] text-gray-500">
                              Updated {doc.lastUpdated}
                            </span>
                          </div>
                          <h4 className="font-sora font-semibold text-white text-xs truncate group-hover:text-emerald-400 transition-colors">
                            {doc.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <ArrowUpRight size={15} className="text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

            </div>

          </div>

        </div>
      )}

      {/* ======================= 2. CONSOLE OVERVIEW TAB ======================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={1}
              className="bg-[#050505] p-6 rounded-[2rem] border border-white/10 space-y-4 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                  <Shield size={16} className="text-emerald-400" />
                  SSL & Encryption
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="font-sora text-xl font-semibold text-white">TLS 1.3 AES-GCM 256</p>
              <p className="text-xs text-gray-400 font-light">Zero-knowledge local state encryption active on this client device.</p>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={2}
              className="bg-[#050505] p-6 rounded-[2rem] border border-white/10 space-y-4 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                  <HardDrive size={16} className="text-emerald-400" />
                  Cloud Database Sync
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="font-sora text-xl font-semibold text-white">Firebase Firestore DB</p>
              <p className="text-xs text-gray-400 font-light">Persistent multi-device data pipeline synchronized with live updates.</p>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={3}
              className="bg-[#050505] p-6 rounded-[2rem] border border-white/10 space-y-4 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                  <Cpu size={16} className="text-emerald-400" />
                  Neural Runtime Core
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="font-sora text-xl font-semibold text-white">Edge SLM Compiler</p>
              <p className="text-xs text-gray-400 font-light">Direct on-device vector retrieval loops ready for low-latency tasks.</p>
            </motion.div>
          </div>

          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={4}
            className="bg-[#050505] p-8 md:p-10 rounded-[2.5rem] border border-white/10 space-y-6"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-sora text-xl font-semibold text-white">Quick Actions</h3>
              <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Workspace Shortcuts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => setActiveTab('favorites')}
                className="p-5 rounded-2xl bg-[#030303] border border-white/5 hover:border-emerald-500/30 text-left space-y-2 transition-all group cursor-pointer"
              >
                <Heart size={20} className="text-rose-400 group-hover:scale-110 transition-transform" />
                <h4 className="font-sora font-semibold text-sm text-white">Explore Saved Favorites</h4>
                <p className="text-xs text-gray-500 font-light">Access your bookmarked applications and models.</p>
              </button>

              <button 
                onClick={() => setActiveTab('saved-docs')}
                className="p-5 rounded-2xl bg-[#030303] border border-white/5 hover:border-emerald-500/30 text-left space-y-2 transition-all group cursor-pointer"
              >
                <BookOpen size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <h4 className="font-sora font-semibold text-sm text-white">Read Saved Guides</h4>
                <p className="text-xs text-gray-500 font-light">Review technical documentation and tutorials.</p>
              </button>

              <button 
                onClick={() => setActiveTab('locker')}
                className="p-5 rounded-2xl bg-[#030303] border border-white/5 hover:border-emerald-500/30 text-left space-y-2 transition-all group cursor-pointer"
              >
                <Lock size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <h4 className="font-sora font-semibold text-sm text-white">Open Document Vault</h4>
                <p className="text-xs text-gray-500 font-light">Manage encrypted diagnostic logs and files.</p>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ======================= 3. FAVORITES VIEW ======================= */}
      {activeTab === 'favorites' && (
        <div className="space-y-8 text-left">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <h2 className="font-sora text-2xl font-semibold text-white">
                Bookmarked Applications & Tools ({favoritedApps.length})
              </h2>
              <p className="text-gray-400 text-sm font-light">
                Applications you have saved for fast access and status tracking.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={favoriteSearch}
                onChange={(e) => setFavoriteSearch(e.target.value)}
                placeholder="Filter favorites..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {favoritedApps
            .filter(app => {
              if (!favoriteSearch) return true;
              const q = favoriteSearch.toLowerCase();
              return app.name.toLowerCase().includes(q) || app.category.toLowerCase().includes(q) || app.shortDescription.toLowerCase().includes(q);
            }).length === 0 ? (
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="py-16 text-center space-y-4 rounded-[2rem] border border-dashed border-white/10 bg-[#050505]"
            >
              <Heart size={36} className="text-gray-600 mx-auto" />
              <div className="space-y-1">
                <p className="font-sora font-semibold text-white">No bookmarked applications found</p>
                <p className="font-mono text-xs text-gray-500">Save your favorite apps from the Applications Hub</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritedApps
                .filter(app => {
                  if (!favoriteSearch) return true;
                  const q = favoriteSearch.toLowerCase();
                  return app.name.toLowerCase().includes(q) || app.category.toLowerCase().includes(q) || app.shortDescription.toLowerCase().includes(q);
                })
                .map((app, idx) => (
                  <motion.div
                    key={app.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={idx}
                    className="bg-[#050505] border border-white/10 p-6 rounded-[2rem] flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group shadow-xl"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                          {renderAppLogo(app.logo, 28)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold uppercase border border-emerald-500/20">
                            {app.status}
                          </span>
                          <button
                            onClick={() => handleToggleFavorite(app.id, app.name)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove from favorites"
                          >
                            <Heart size={16} className="fill-rose-400" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-sora font-semibold text-white text-lg group-hover:text-emerald-400 transition-colors">
                          {app.name}
                        </h3>
                        <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                          {app.category} &bull; v{app.version}
                        </span>
                      </div>

                      <p className="text-gray-400 text-xs font-light leading-relaxed line-clamp-3">
                        {app.shortDescription}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] text-gray-500">SAVED TO LOCKER</span>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                        READY <CheckCircle2 size={12} />
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= 4. SAVED DOCUMENTATION VIEW ======================= */}
      {activeTab === 'saved-docs' && (
        <div className="space-y-8 text-left">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <h2 className="font-sora text-2xl font-semibold text-white">
                Saved Technical Documentation ({savedDocArticles.length})
              </h2>
              <p className="text-gray-400 text-sm font-light">
                Guides, system architecture blueprints, and API notes saved for fast offline reference.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Filter saved guides..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {savedDocArticles
            .filter(doc => {
              if (!docSearch) return true;
              const q = docSearch.toLowerCase();
              return doc.title.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q) || doc.content.toLowerCase().includes(q);
            }).length === 0 ? (
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="py-16 text-center space-y-4 rounded-[2rem] border border-dashed border-white/10 bg-[#050505]"
            >
              <BookOpen size={36} className="text-gray-600 mx-auto" />
              <div className="space-y-1">
                <p className="font-sora font-semibold text-white">No saved guides found</p>
                <p className="font-mono text-xs text-gray-500">Bookmark guides from the Documentation page for quick retrieval</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedDocArticles
                .filter(doc => {
                  if (!docSearch) return true;
                  const q = docSearch.toLowerCase();
                  return doc.title.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q) || doc.content.toLowerCase().includes(q);
                })
                .map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={idx}
                    className="bg-[#050505] border border-white/10 p-7 rounded-[2.5rem] flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group shadow-xl"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md">
                          {doc.category}
                        </span>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[9px] text-gray-500">
                            UPDATED: {doc.lastUpdated}
                          </span>
                          <button
                            onClick={() => handleToggleSaveDoc(doc.id, doc.title)}
                            className="text-amber-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove from saved documentation"
                          >
                            <BookmarkCheck size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-sora font-semibold text-white text-lg group-hover:text-emerald-400 transition-colors">
                        {doc.title}
                      </h3>

                      <p className="text-gray-400 text-xs font-light leading-relaxed line-clamp-3">
                        {doc.content.replace(/##/g, '').replace(/\n/g, ' ')}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedDocPreview(doc)}
                        className="text-xs font-mono font-bold text-white group-hover:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        Read Documentation <ArrowUpRight size={14} />
                      </button>
                      <span className="text-[10px] font-mono text-gray-500">SAVED NODE</span>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= 5. DOCUMENT LOCKER REPOSITORY ======================= */}
      {activeTab === 'locker' && (
        <div className="space-y-8 text-left">
          
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="bg-[#050505] p-8 md:p-10 rounded-[2.5rem] border border-white/10 space-y-8 hover:border-emerald-500/30 transition-colors duration-500 shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/10 pb-6">
              <div className="space-y-2">
                <h3 className="font-sora text-xl font-semibold text-white flex items-center gap-3">
                  <Lock size={20} className="text-emerald-500" />
                  Secure Document Locker Repository
                </h3>
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                  Encrypted files sandbox. Drag code blueprints, logs, or APK configs.
                </p>
              </div>

              {/* Usage analytics */}
              <div className="sm:text-right w-full sm:w-auto">
                <span className="font-mono text-[10px] text-gray-400 tracking-widest">
                  QUOTA USED: {totalUploadedSizeMB.toFixed(1)}MB / {storageQuotaMB}MB
                </span>
                <div className="w-full sm:w-48 bg-white/5 h-2 rounded-full mt-2 overflow-hidden border border-white/10 shadow-inner">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${storagePercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Drag & drop upload box */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('secure-file-picker-input')?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 select-none ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-white/10 hover:border-emerald-500/40 hover:bg-white/5'
              }`}
            >
              <input 
                type="file" 
                id="secure-file-picker-input"
                className="hidden"
                onChange={handleFileSelect}
              />
              
              <UploadCloud size={36} className={dragActive ? 'text-emerald-500 animate-bounce' : 'text-gray-400 group-hover:text-emerald-400 transition-colors'} />
              
              <div className="space-y-1">
                <p className="font-sora text-sm font-semibold text-white">Drag & Drop Diagnostic Files here</p>
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">Or click to select bundle specs (Max 25MB per file)</p>
              </div>
            </div>

            {/* Upload progress */}
            {uploadProgress >= 0 && (
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between gap-6 shadow-inner">
                <div className="flex-grow space-y-2">
                  <span className="font-mono text-[10px] text-gray-300 truncate block max-w-sm tracking-widest uppercase">{uploadingName}</span>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <div className="bg-emerald-500 h-full duration-150 transition-all rounded-full" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
                <span className="font-mono text-sm text-emerald-400 font-bold whitespace-nowrap">{uploadProgress > 100 ? 100 : uploadProgress}%</span>
              </div>
            )}

            {/* Uploaded Files list */}
            <div className="space-y-4 font-sans text-sm">
              <h4 className="font-sora text-xs font-semibold text-gray-400 uppercase tracking-widest pb-2">
                Stored Credentials & Blueprints ({(activeUser.uploadedFiles || []).length})
              </h4>

              {(activeUser.uploadedFiles || []).length === 0 ? (
                <div className="text-center py-8 border border-white/5 rounded-2xl bg-[#030303] text-gray-500 font-mono text-[10px] uppercase tracking-widest shadow-inner">
                  No encrypted blueprints deposited. Vault target idle.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {(activeUser.uploadedFiles || []).map((file) => (
                    <div 
                      key={file.id} 
                      className="p-4 rounded-[1.25rem] border border-white/10 bg-[#030303] hover:border-emerald-500/30 flex items-center justify-between gap-4 transition-all shadow-inner group/file"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="p-2.5 rounded-xl bg-white/5 text-gray-400 group-hover/file:text-emerald-400 transition-colors border border-white/5 shadow-sm">
                          <FileText size={20} />
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <span className="font-sora font-semibold text-white text-sm truncate block max-w-xs">{file.name}</span>
                          <span className="font-mono text-[10px] text-gray-500 truncate block max-w-xs tracking-widest">{file.hash}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right font-mono text-[10px] text-gray-400 tracking-widest">
                          <span>{file.size}</span>
                          <span className="block text-gray-600 mt-0.5">{file.date}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          title="Delete file"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {selectedDocPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onScroll={(e) => {
                const target = e.currentTarget;
                const progress = Math.min(100, Math.max(0, Math.round((target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100)));
                const bar = document.getElementById('modal-reading-progress-bar');
                const text = document.getElementById('modal-reading-progress-text');
                if (bar) bar.style.width = `${progress}%`;
                if (text) text.innerText = `${progress}% read`;
              }}
              className="bg-[#050505] p-8 md:p-10 rounded-[2.5rem] max-w-3xl w-full border border-white/10 relative shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar text-left"
            >
              {/* Modal Top Sticky Reading Progress Bar */}
              <div className="sticky -top-8 -mx-8 md:-top-10 md:-mx-10 h-1.5 bg-white/5 z-30 overflow-hidden">
                <div 
                  id="modal-reading-progress-bar" 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 w-0 transition-all duration-75"
                />
              </div>

              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
                      {selectedDocPreview.category}
                    </span>
                    <span id="modal-reading-progress-text" className="font-mono text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                      0% read
                    </span>
                  </div>
                  <h3 className="font-sora text-2xl font-semibold text-white mt-2">
                    {selectedDocPreview.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDocPreview(null)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs font-mono"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedDocPreview.image && (
                <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden border border-white/10">
                  <img src={selectedDocPreview.image} alt={selectedDocPreview.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="space-y-4 text-gray-300 text-sm font-light leading-relaxed whitespace-pre-line font-sans">
                {selectedDocPreview.content}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="font-mono text-[10px] text-gray-500">
                  LAST UPDATED: {selectedDocPreview.lastUpdated}
                </span>
                <button
                  onClick={() => setSelectedDocPreview(null)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Close Reader
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
