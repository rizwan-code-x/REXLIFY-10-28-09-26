import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Clock, 
  FileText, 
  GraduationCap, 
  Mic, 
  TrendingUp, 
  Zap 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const dailyActivity = [
    { day: 'Mon', prompts: 142, tokens: 42.1 },
    { day: 'Tue', prompts: 189, tokens: 55.4 },
    { day: 'Wed', prompts: 230, tokens: 71.2 },
    { day: 'Thu', prompts: 215, tokens: 68.0 },
    { day: 'Fri', prompts: 290, tokens: 88.5 },
    { day: 'Sat', prompts: 175, tokens: 49.3 },
    { day: 'Sun', prompts: 241, tokens: 74.6 }
  ];

  const toolDistribution = [
    { name: 'Assignment Studio', value: 35, color: '#ec4899' },
    { name: 'PDF Auditor', value: 25, color: '#a855f7' },
    { name: 'Excel Data AI', value: 18, color: '#10b981' },
    { name: 'Voice Mode', value: 12, color: '#f43f5e' },
    { name: 'Code Assistant', value: 10, color: '#6366f1' }
  ];

  const latencyHistory = [
    { time: '10:00', ms: 148 },
    { time: '11:00', ms: 132 },
    { time: '12:00', ms: 124 },
    { time: '13:00', ms: 156 },
    { time: '14:00', ms: 138 },
    { time: '15:00', ms: 119 },
    { time: '16:00', ms: 126 }
  ];

  const stats = [
    { label: 'Total AI Prompts', value: '1,482', change: '+18.4%', icon: <Sparkles className="text-pink-600" size={18} /> },
    { label: 'Documents Analyzed', value: '128', change: '+12.0%', icon: <FileText className="text-purple-600" size={18} /> },
    { label: 'Assignments Created', value: '46', change: '+24.5%', icon: <GraduationCap className="text-rose-600" size={18} /> },
    { label: 'Voice Audio Minutes', value: '184m', change: '+9.2%', icon: <Mic className="text-indigo-600" size={18} /> }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-6 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 text-white shadow-xs">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sora">Intelligence & Productivity Analytics</h1>
            <p className="text-xs text-slate-600">
              Live observability of token throughput, latency benchmarks & module utilization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            System Health: 99.98%
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="rounded-3xl bg-white/90 border border-pink-200/80 p-5 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-pink-50">{s.icon}</div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {s.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-3 font-sora">{s.value}</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Prompts Bar Chart */}
        <div className="lg:col-span-7 rounded-3xl bg-white/90 border border-pink-200/80 p-6 shadow-xs backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-pink-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-pink-600" />
              <span>Weekly Prompt Volume</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Last 7 Days</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fbcfe8" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#fbcfe8' }} />
                <Bar dataKey="prompts" fill="#ec4899" radius={[6, 6, 0, 0]} name="Prompts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tool Popularity Pie Chart */}
        <div className="lg:col-span-5 rounded-3xl bg-white/90 border border-pink-200/80 p-6 shadow-xs backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-pink-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap size={16} className="text-purple-600" />
              <span>Module Distribution</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">% Share</span>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={toolDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label
                >
                  {toolDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
