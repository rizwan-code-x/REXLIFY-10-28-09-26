import React, { useState } from 'react';
import { 
  MapPin, Building2, Crown, Navigation, Phone, Mail, 
  ExternalLink, CheckCircle2, AlertCircle, Shield, Sparkles, Image, Eye
} from 'lucide-react';
import { Shop } from '../types';

interface BranchMapVisualizerProps {
  theme: 'light' | 'dark';
  shops: Shop[];
  onSelectBranch?: (shop: Shop) => void;
  onOpenCeoView?: (shopId: string) => void;
}

export default function BranchMapVisualizer({
  theme,
  shops,
  onSelectBranch,
  onOpenCeoView
}: BranchMapVisualizerProps) {
  const [selectedBranch, setSelectedBranch] = useState<Shop | null>(shops[0] || null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);

  // Map nodes positions relative to Head Office (Center 50%, 50%)
  const nodePositions: { [key: string]: { x: number; y: number; distance: string } } = {
    'ROD001': { x: 50, y: 50, distance: '0 km (Head Office)' },
    'RCS102': { x: 42, y: 38, distance: '1.5 km' },
    'MAM103': { x: 68, y: 32, distance: '3.0 km (Harekrishnapur)' },
    'FAR104': { x: 78, y: 72, distance: '7.0 km (Faridpur)' },
    'RRR105': { x: 31, y: 65, distance: '2.2 km (RR 105)' },
    'RR105': { x: 31, y: 65, distance: '2.2 km (RR 105)' },
    '105': { x: 31, y: 65, distance: '2.2 km (RR 105)' },
    'CSCL106': { x: 22, y: 28, distance: '5.5 km' },
    'MB107': { x: 35.5, y: 62.5, distance: '2.7 km (500m from RR 105)' },
    'RR107': { x: 35.5, y: 62.5, distance: '2.7 km (500m from RR 105)' },
    '107': { x: 35.5, y: 62.5, distance: '2.7 km (500m from RR 105)' },
    'SHOP_7': { x: 35.5, y: 62.5, distance: '2.7 km (500m from RR 105)' }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`p-6 rounded-3xl border shadow-2xl transition-all ${
      isDark ? 'bg-slate-950/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase tracking-widest font-black flex items-center gap-1.5">
              <Navigation size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
              <span>GEO-RADAR DISTANCE MAP</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-mono font-bold">
              {shops.length} Active Nodes
            </span>
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <span>Branch Geographical Network Map</span>
            <span className="text-xs text-slate-400 font-normal">| 7 KM Faridpur Range</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Head Office (Rizwan Online Dreams - Barabila) at center. Interactive distance visualizer across Sagarpara, Harekrishnapur & Faridpur.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
            <Crown size={12} /> Head Office (0 km)
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
            <MapPin size={12} /> Active Branch
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Graphic Canvas (Lg 7 cols) */}
        <div className="lg:col-span-7 relative w-full h-[380px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-4 group">
          {/* Grid Background Lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: `radial-gradient(#10b981 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
            backgroundSize: '20px 20px, 40px 40px, 40px 40px'
          }} />

          {/* Concentric Distance Rings (1km, 3km, 5km, 7km) */}
          <div className="absolute w-[100px] h-[100px] rounded-full border border-emerald-500/20 flex items-center justify-center pointer-events-none">
            <span className="text-[8px] text-emerald-500/50 font-mono -mt-12">1.5 KM</span>
          </div>
          <div className="absolute w-[200px] h-[200px] rounded-full border border-emerald-500/20 flex items-center justify-center pointer-events-none">
            <span className="text-[8px] text-emerald-500/50 font-mono -mt-24">3 KM (Harekrishnapur)</span>
          </div>
          <div className="absolute w-[300px] h-[300px] rounded-full border border-emerald-500/20 flex items-center justify-center pointer-events-none">
            <span className="text-[8px] text-emerald-500/50 font-mono -mt-36">5.5 KM</span>
          </div>
          <div className="absolute w-[360px] h-[360px] rounded-full border border-emerald-500/30 flex items-center justify-center pointer-events-none">
            <span className="text-[8px] text-emerald-500/70 font-mono -mt-44">7 KM RANGE (Faridpur)</span>
          </div>

          {/* Sweeping Radar Scanner Line */}
          <div className="absolute w-[360px] h-[360px] rounded-full border border-emerald-500/10 pointer-events-none animate-spin" style={{ animationDuration: '8s' }}>
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-tl-full" />
          </div>

          {/* Proximity Link between RR 105 and Branch 107 (500m Distance Indicator) */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full overflow-visible">
              <line
                x1="31%"
                y1="65%"
                x2="35.5%"
                y2="62.5%"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="3 3"
                className="animate-pulse"
              />
            </svg>
            <div 
              style={{ left: '33.25%', top: '63.75%' }} 
              className="absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.2 rounded-full bg-slate-950/90 border border-amber-500/60 text-[7.5px] font-mono font-black text-amber-300 shadow-md whitespace-nowrap z-10"
            >
              ⚡ 500m (RR105 ↔ MB107)
            </div>
          </div>

          {/* Branch Nodes */}
          {shops.map((s, idx) => {
            const customCode = (s.customId || s.id || '').toUpperCase();
            const pos = nodePositions[customCode] || nodePositions[(s.id || '').toUpperCase()] || {
              x: 30 + (idx * 12) % 60,
              y: 25 + (idx * 15) % 60,
              distance: s.distanceFromHeadOffice || '4 km'
            };

            const isHeadOffice = s.isMainBranch || customCode === 'ROD001';
            const isSelected = selectedBranch?.id === s.id;

            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedBranch(s);
                  if (onSelectBranch) onSelectBranch(s);
                }}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group/node transition-all duration-300 z-10 cursor-pointer ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                {/* Connecting distance beam to center */}
                {!isHeadOffice && (
                  <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none -z-10 overflow-visible">
                    <line
                      x1="200"
                      y1="200"
                      x2={200 + (50 - pos.x) * 3.6}
                      y2={200 + (50 - pos.y) * 3.6}
                      stroke={isSelected ? '#10b981' : '#334155'}
                      strokeWidth={isSelected ? '2' : '1'}
                      strokeDasharray={isSelected ? '4' : '2'}
                    />
                  </svg>
                )}

                {/* Node Pin Marker */}
                <div className={`p-2 rounded-2xl flex items-center gap-1.5 shadow-2xl border transition-all ${
                  isHeadOffice
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/40 ring-4 ring-amber-500/20'
                    : isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-500/50 ring-4 ring-emerald-500/30'
                    : 'bg-slate-900/90 text-slate-100 border-slate-700 hover:border-emerald-500'
                }`}>
                  {isHeadOffice ? (
                    <Crown size={14} className="animate-bounce" />
                  ) : (
                    <MapPin size={13} className={isSelected ? 'text-slate-950' : 'text-emerald-400'} />
                  )}
                  <div className="text-left font-mono text-[9px] leading-tight">
                    <div className="font-black tracking-tight">{s.customId || s.id}</div>
                    <div className={`text-[7px] truncate max-w-[70px] ${
                      isHeadOffice || isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'
                    }`}>
                      {pos.distance}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Branch Detail Cards (Lg 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedBranch ? (
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* Branch Title & Status */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-black tracking-wider mb-1 ${
                    selectedBranch.isMainBranch || selectedBranch.customId === 'ROD001'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {selectedBranch.customId} • {selectedBranch.distanceFromHeadOffice || 'Range'}
                  </span>
                  <h3 className="text-sm font-black uppercase text-slate-100 dark:text-slate-100 leading-snug">
                    {selectedBranch.name}
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono uppercase font-bold ${
                  selectedBranch.status === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {selectedBranch.status}
                </span>
              </div>

              {/* Manager & Contact */}
              <div className="space-y-2 text-[11px] text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <Building2 size={13} className="text-emerald-400" />
                  <span><strong>Branch Manager:</strong> {selectedBranch.branchHead || selectedBranch.ownerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-emerald-400" />
                  <span><strong>Contact Mobile:</strong> {selectedBranch.mobile}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-emerald-400" />
                  <span className="truncate"><strong>Address:</strong> {selectedBranch.address}</span>
                </div>
              </div>

              {/* 5 Photos Gallery Thumbnail Strip */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>BRANCH PHOTOS (5 TOTAL)</span>
                  <span className={selectedBranch.branchPhotosApproved ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {selectedBranch.branchPhotosApproved ? '✓ CEO Approved' : '⏳ Pending Approval'}
                  </span>
                </div>

                {selectedBranch.branchPhotos && selectedBranch.branchPhotos.length > 0 ? (
                  <div className="grid grid-cols-5 gap-1.5">
                    {selectedBranch.branchPhotos.slice(0, 5).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActivePhotoIndex(i);
                          setShowPhotoModal(true);
                        }}
                        className="relative aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-400 group cursor-pointer"
                      >
                        <img src={img} alt={`Branch Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye size={12} className="text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-[10px] text-slate-500">
                    No branch photos uploaded yet. (Upload 5 photos for CEO verification)
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {onOpenCeoView && (
                <button
                  onClick={() => onOpenCeoView(selectedBranch.id)}
                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <ExternalLink size={13} />
                  <span>Open Branch Dashboard ({selectedBranch.customId})</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Click any node on the map to inspect branch details.
            </div>
          )}
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {showPhotoModal && selectedBranch && selectedBranch.branchPhotos && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-white uppercase">{selectedBranch.name}</h3>
                <p className="text-[10px] text-slate-400">Official Branch Photo {activePhotoIndex + 1} of {selectedBranch.branchPhotos.length}</p>
              </div>
              <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 hover:text-white p-2">✕</button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
              <img src={selectedBranch.branchPhotos[activePhotoIndex]} alt="Branch photo" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {selectedBranch.branchPhotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIndex(i)}
                    className={`w-3 h-3 rounded-full ${i === activePhotoIndex ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
