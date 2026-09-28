import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Sparkles, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { ChartDataPayload } from './types';

const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

interface ChatChartProps {
  chartData: ChartDataPayload;
  onExplainGraph?: (explanation: string) => void;
}

export const ChatChart: React.FC<ChatChartProps> = ({ chartData, onExplainGraph }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>(chartData.type || 'bar');
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="my-4 p-4 rounded-2xl bg-white/95 border border-pink-200/90 shadow-sm space-y-3">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-pink-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-100 text-pink-700">
            <BarChart3 size={15} />
          </div>
          <h4 className="text-xs font-bold text-slate-800 font-sora">{chartData.title}</h4>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              chartType === 'bar' ? 'bg-pink-600 text-white shadow-xs' : 'bg-pink-50 text-slate-600 hover:bg-pink-100'
            }`}
            title="Bar Chart"
          >
            <BarChart3 size={13} />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              chartType === 'line' ? 'bg-pink-600 text-white shadow-xs' : 'bg-pink-50 text-slate-600 hover:bg-pink-100'
            }`}
            title="Line Chart"
          >
            <LineChartIcon size={13} />
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              chartType === 'pie' ? 'bg-pink-600 text-white shadow-xs' : 'bg-pink-50 text-slate-600 hover:bg-pink-100'
            }`}
            title="Pie Chart"
          >
            <PieChartIcon size={13} />
          </button>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="w-full h-64 text-xs font-medium">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fbcfe8" opacity={0.6} />
              <XAxis dataKey={chartData.xAxisKey} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px', 
                  border: '1px solid #f472b6',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }} 
              />
              <Legend />
              {chartData.dataKeys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fbcfe8" opacity={0.6} />
              <XAxis dataKey={chartData.xAxisKey} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px', 
                  border: '1px solid #f472b6' 
                }} 
              />
              <Legend />
              {chartData.dataKeys.map((key, idx) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[idx % COLORS.length]} 
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={chartData.data}
                dataKey={chartData.dataKeys[0] || 'value'}
                nameKey={chartData.xAxisKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#ec4899"
                label
              >
                {chartData.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Action: Explain This Graph */}
      <div className="pt-2 border-t border-pink-100 flex items-center justify-between">
        <button
          onClick={() => {
            setShowExplanation(!showExplanation);
            if (!showExplanation && onExplainGraph && chartData.explanation) {
              onExplainGraph(chartData.explanation);
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-700 hover:text-pink-800 transition-colors cursor-pointer"
        >
          <Sparkles size={13} className="text-pink-600" />
          <span>{showExplanation ? 'Hide graph analysis' : 'Explain this graph with AI'}</span>
        </button>

        <span className="text-[11px] text-slate-400 font-mono">Dynamic Recharts Engine</span>
      </div>

      {showExplanation && chartData.explanation && (
        <div className="p-3 rounded-xl bg-pink-50/70 border border-pink-200 text-xs text-slate-700 leading-relaxed animate-fadeIn">
          <strong className="text-pink-900 font-bold block mb-1">AI Analytical Breakdown:</strong>
          {chartData.explanation}
        </div>
      )}
    </div>
  );
};
