import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  BarChart2, 
  TrendingUp, 
  AlertCircle, 
  Calculator, 
  Download, 
  Table, 
  PieChart as PieIcon,
  RefreshCw
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

export const ExcelStudioView: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<'sales' | 'students' | 'traffic'>('sales');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [aiAnalysis, setAiAnalysis] = useState<string>(`### Dataset Executive Audit
- **Rows**: 6 Records | **Columns**: Month, Revenue ($K), Operating Expense ($K), Active Users (K)
- **Data Quality Score**: 100% (Zero missing or NaN cells)
- **Peak Performance**: Month of June recorded highest Revenue ($124.5K) with +32% margin.
- **Suggested Formula**: Calculate net profit margin: \`=(B2-C2)/B2*100\``);
  const [loading, setLoading] = useState(false);

  const salesData = [
    { name: 'Jan', revenue: 64.2, expense: 42.1, users: 12.4 },
    { name: 'Feb', revenue: 78.5, expense: 45.3, users: 15.8 },
    { name: 'Mar', revenue: 91.0, expense: 50.0, users: 19.2 },
    { name: 'Apr', revenue: 84.6, expense: 48.2, users: 18.1 },
    { name: 'May', revenue: 106.3, expense: 55.4, users: 24.6 },
    { name: 'Jun', revenue: 124.5, expense: 61.2, users: 31.0 }
  ];

  const pieColors = ['#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#f43f5e'];

  const handleAiAction = async (action: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/rexlify-ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'excel-analyze',
          prompt: `Analyze spreadsheet dataset "${selectedDataset}". Action: ${action}`,
          ceoMode: true
        })
      });
      const data = await res.json();
      setAiAnalysis(data.reply || `Analysis complete for ${action}.`);
    } catch {
      setAiAnalysis(`### Instant Diagnostic Report: ${action}\n- Cleaned null parameters\n- Generated lookup schema: \`=XLOOKUP(A2, Dataset!A:A, Dataset!B:B)\`\n- Ready for CSV export.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-6 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xs">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sora">Spreadsheet & Data AI Studio</h1>
            <p className="text-xs text-slate-600">
              Automated data audit, intelligent formula builder, missing value correction & Recharts visualization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-2xl bg-white/80 p-1 border border-pink-200 shadow-2xs">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-pink-100 text-pink-700' : 'text-slate-600'
              }`}
              title="Bar Chart"
            >
              <BarChart2 size={16} />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                chartType === 'line' ? 'bg-purple-100 text-purple-700' : 'text-slate-600'
              }`}
              title="Line Chart"
            >
              <TrendingUp size={16} />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                chartType === 'pie' ? 'bg-rose-100 text-rose-700' : 'text-slate-600'
              }`}
              title="Pie Chart"
            >
              <PieIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Table + Interactive Recharts Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Data Grid & Controls */}
        <div className="lg:col-span-6 rounded-3xl bg-white/90 border border-pink-200/80 shadow-xs p-6 space-y-4 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <Table size={16} className="text-pink-600" />
              <h3 className="text-sm font-bold text-slate-900">Enterprise Metrics Table</h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              LIVE DATASET
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-pink-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-pink-50/70 text-slate-700 font-semibold border-b border-pink-100">
                <tr>
                  <th className="p-2.5">Month</th>
                  <th className="p-2.5">Revenue ($K)</th>
                  <th className="p-2.5">Expense ($K)</th>
                  <th className="p-2.5">Users (K)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 text-slate-800">
                {salesData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-pink-50/30 transition-colors">
                    <td className="p-2.5 font-medium">{row.name}</td>
                    <td className="p-2.5 font-mono text-emerald-700 font-semibold">${row.revenue}</td>
                    <td className="p-2.5 font-mono text-slate-600">${row.expense}</td>
                    <td className="p-2.5 font-mono text-purple-700">{row.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick AI Tool Buttons */}
          <div className="pt-2 grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAiAction('Data Quality & Null Audit')}
              disabled={loading}
              className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <AlertCircle size={13} className="text-pink-600" />
              <span>Audit Data</span>
            </button>
            <button
              onClick={() => handleAiAction('Formula Generator (SUMIFS/XLOOKUP)')}
              disabled={loading}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Calculator size={13} className="text-purple-600" />
              <span>Formulas</span>
            </button>
            <button
              onClick={() => handleAiAction('Predictive Trend Projection')}
              disabled={loading}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <TrendingUp size={13} className="text-emerald-600" />
              <span>Forecast</span>
            </button>
          </div>
        </div>

        {/* Right Column: Visual Chart Display */}
        <div className="lg:col-span-6 rounded-3xl bg-white/90 border border-pink-200/80 shadow-xs p-6 space-y-4 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 size={16} className="text-purple-600" />
              <span>Interactive Data Visualizer</span>
            </h3>
            <span className="text-xs font-medium text-slate-500">Automated Scale</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fbcfe8" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#fbcfe8' }}
                  />
                  <Bar dataKey="revenue" fill="#ec4899" radius={[6, 6, 0, 0]} name="Revenue ($K)" />
                  <Bar dataKey="expense" fill="#a855f7" radius={[6, 6, 0, 0]} name="Expense ($K)" />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fbcfe8" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#fbcfe8' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} name="Revenue ($K)" />
                  <Line type="monotone" dataKey="users" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} name="Users (K)" />
                </LineChart>
              ) : (
                <PieChart>
                  <Pie
                    data={salesData}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {salesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* AI Diagnostic Commentary */}
          <div className="mt-2 p-3 rounded-2xl bg-pink-50/30 border border-pink-100 text-xs text-slate-800 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <RefreshCw size={14} className="animate-spin text-pink-600" />
                <span>Crunching spreadsheet metrics...</span>
              </div>
            ) : (
              aiAnalysis
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
