import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, CheckCircle, XCircle, Clock, Calendar, 
  ShieldCheck, Banknote, Star, Sparkles, Filter, Check, X,
  Printer, QrCode, Building, Award, IdCard, Download, Shield,
  Edit, Camera, Upload, Save, Crown, AlertCircle, RefreshCw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { Staff, Shop } from '../types';
import { sanitizeDocForHtml2Canvas } from '../utils/oklchFix';

interface StaffViewProps {
  theme: 'light' | 'dark';
  staff: Staff[];
  shops?: Shop[];
  addStaff: (st: Staff) => void;
  updateStaff: (id: string, updates: any) => void;
  currentUser?: any;
}

export default function StaffView({
  theme,
  staff,
  shops = [],
  addStaff,
  updateStaff,
  currentUser
}: StaffViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-08-01');
  const [selectedCardStaff, setSelectedCardStaff] = useState<Staff | null>(null);

  // Form states for new staff
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('CSC Digital Executive');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<'Manager' | 'Operator' | 'Helper'>('Operator');
  const [salary, setSalary] = useState(25000);
  const [address, setAddress] = useState('Sadhanganj Bazar Road, Jalangi, Murshidabad');
  const [branchCode, setBranchCode] = useState('ROD001');
  const [shopId, setShopId] = useState(currentUser?.shopId || 'jalangi');
  const [customId, setCustomId] = useState(() => String(Math.floor(100 + Math.random() * 900)));
  const [password, setPassword] = useState('pass');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300');
  const [issueDate, setIssueDate] = useState('2026-08-01');
  const [validTill, setValidTill] = useState('2030-12-31');
  const [permissions, setPermissions] = useState<string[]>(['print', 'recharge', 'services', 'billing']);

  // Live Card Editing States
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBranchCode, setEditBranchCode] = useState('');
  const [editCustomId, setEditCustomId] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editValidTill, setEditValidTill] = useState('');
  const [editShopId, setEditShopId] = useState('');
  const [showBarcodeData, setShowBarcodeData] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Populate live edit fields when selecting a staff card
  useEffect(() => {
    if (selectedCardStaff) {
      setEditName(selectedCardStaff.name || '');
      setEditDesignation(selectedCardStaff.designation || (selectedCardStaff.role === 'Manager' ? 'Branch Head Manager' : 'CSC Digital Executive'));
      setEditMobile(selectedCardStaff.mobile || '9593388785');
      setEditAddress(selectedCardStaff.address || 'Sadhanganj Bazar Road, Jalangi, Murshidabad');
      const branch = shops.find(s => s.id === selectedCardStaff.shopId);
      setEditBranchCode(selectedCardStaff.branchCode || branch?.customId || 'ROD-HQ');
      setEditCustomId(selectedCardStaff.customId || '001');
      setEditPhotoUrl(selectedCardStaff.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300');
      setEditIssueDate(selectedCardStaff.issueDate || '2026-08-01');
      setEditValidTill(selectedCardStaff.validTill || '2030-12-31');
      setEditShopId(selectedCardStaff.shopId || 'jalangi');
      setIsEditingCard(false);
      setShowBarcodeData(false);
    }
  }, [selectedCardStaff?.id]);

  // Open ID card modal for a specific staff member
  const openCardForStaff = (st: Staff) => {
    setSelectedCardStaff(st);
  };

  // Upload photo via file chooser
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isEditMode) {
          setEditPhotoUrl(base64);
          if (selectedCardStaff) {
            updateStaff(selectedCardStaff.id, { photoUrl: base64 });
          }
        } else {
          setPhotoUrl(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save live card corrections directly to staff record
  const handleSaveCardCorrections = () => {
    if (!selectedCardStaff) return;
    const updates = {
      name: editName,
      designation: editDesignation,
      mobile: editMobile,
      address: editAddress,
      branchCode: editBranchCode,
      customId: editCustomId,
      photoUrl: editPhotoUrl,
      issueDate: editIssueDate,
      validTill: editValidTill,
      shopId: editShopId
    };
    updateStaff(selectedCardStaff.id, updates);
    setSelectedCardStaff({
      ...selectedCardStaff,
      ...updates
    });
    setIsEditingCard(false);
  };

  // Direct clean Print / Save to PDF trigger
  const handlePrintCardPDF = () => {
    window.print();
  };

  // Download card as PNG image first, then trigger print dialog
  const handleDownloadAndPrintCard = async () => {
    const cardElement = document.getElementById('printable-staff-card-element');
    if (!cardElement) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          sanitizeDocForHtml2Canvas(clonedDoc);
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Staff_ID_Card_${(editName || selectedCardStaff?.name || 'Staff').replace(/\s+/g, '_')}_${editCustomId || '001'}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to download ID card image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const permissionOptions = [
    { id: 'aadhaar', label: '🆔 Aadhaar Services' },
    { id: 'pan', label: '💳 PAN Card' },
    { id: 'passport', label: '📕 Passport' },
    { id: 'banking', label: '🏦 AEPS Banking' },
    { id: 'money', label: '💰 Money Transfer' },
    { id: 'print', label: '🖨️ Printing & Xerox' },
    { id: 'services', label: '⚙️ Service Desk' },
    { id: 'billing', label: '🧾 Billing & Finance' }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    const generatedCustomId = customId.trim() || String(Math.floor(100 + Math.random() * 900));

    const newStaff: Staff = {
      id: `staff_${Date.now()}`,
      name,
      designation: designation || (role === 'Manager' ? 'Branch Head Manager' : 'CSC Digital Executive'),
      email: email || `${generatedCustomId.toLowerCase()}@rodp.com`,
      mobile,
      role,
      status: 'Active',
      salary: Number(salary),
      permissions,
      attendance: {
        '2026-08-01': 'Present'
      },
      shopId,
      branchCode: branchCode || 'ROD001',
      address: address || 'Sadhanganj Bazar Road, Jalangi, Murshidabad',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      password: password || 'pass',
      customId: generatedCustomId,
      issueDate: issueDate || '2026-08-01',
      validTill: validTill || '2030-12-31'
    };

    addStaff(newStaff);
    setIsAdding(false);

    // Automatically open created card
    openCardForStaff(newStaff);

    // Reset form
    setName('');
    setDesignation('CSC Digital Executive');
    setEmail('');
    setMobile('');
    setSalary(25000);
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300');
    setPassword('pass');
    setCustomId(String(Math.floor(100 + Math.random() * 900)));
    setPermissions(['print', 'recharge', 'services', 'billing']);
  };

  const togglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter(p => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const setAttendance = (id: string, date: string, status: 'Present' | 'Absent' | 'Half-Day' | 'Leave') => {
    const st = staff.find(s => s.id === id);
    if (!st) return;

    const newAttendance = { ...st.attendance, [date]: status };
    updateStaff(id, { attendance: newAttendance });
  };

  const getAttendanceBadge = (status?: string) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Absent': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Half-Day': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Leave': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
    }
  };

  const getStaffBranch = (st: Staff) => {
    if (!st) return shops[0];
    if (!st.shopId) return shops.find(s => s.isMainBranch) || shops[0];
    return shops.find(s => s.id === st.shopId) || shops[0];
  };

  const gridThemeClass = theme === 'dark' 
    ? 'bg-slate-900/60 border-slate-800/80' 
    : 'bg-white border-slate-200 shadow-xs';

  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  // Identify CEO / Head Manager staff record
  const ceoStaff = staff.find(s => s.customId === 'CEO-001' || s.designation?.toLowerCase().includes('ceo') || s.id === 'stf_ceo') || staff[0];

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Header action bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Staff Roster & Attendance</span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20 uppercase font-mono tracking-wider font-extrabold">
              ID Cards Enabled
            </span>
          </h2>
          <p className="text-xs opacity-60 font-medium">Manage team profiles, create printable official ID cards with live corrections, upload photos, and log attendance</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Head Manager / CEO Quick Card Button */}
          {ceoStaff && (
            <button
              onClick={() => openCardForStaff(ceoStaff)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-400 border border-amber-500/40 font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Crown size={18} className="text-amber-400" />
              <span>CEO / Head Manager Card</span>
            </button>
          )}

          {staff.length > 0 && (
            <button
              onClick={() => openCardForStaff(staff[0])}
              className="px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <IdCard size={18} />
              <span>Staff ID Cards</span>
            </button>
          )}

          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <UserPlus size={18} />
            <span>Add New Staff / স্টাফ যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Head Manager / CEO Highlight Card Banner */}
      {ceoStaff && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={ceoStaff.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                alt={ceoStaff.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md bg-slate-900"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow">
                <Crown size={12} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-amber-400 font-extrabold uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  HEAD MANAGER & FOUNDER
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">ID: {ceoStaff.customId || 'CEO-001'}</span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">{ceoStaff.name}</h3>
              <p className="text-[10px] text-slate-400 font-medium">Mobile: {ceoStaff.mobile} • Branch Code: {ceoStaff.branchCode || 'ROD-HQ'}</p>
            </div>
          </div>

          <button
            onClick={() => openCardForStaff(ceoStaff)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <IdCard size={16} />
            <span>View CEO Official Badge / আইডি কার্ড দেখুন</span>
          </button>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-xl rounded-3xl p-6 border shadow-2xl ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-500/10 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400 animate-spin" />
                <span>Onboard New Staff Member / নতুন স্টাফ ফাইল রেজিস্ট্রেশন</span>
              </h3>
              <button onClick={() => setIsAdding(false)} className="p-1 rounded-lg hover:bg-slate-500/10 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Full Name / পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter staff name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Designation / Post (পদবী) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CEO & Founder / Head Manager / CSC Executive"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none font-bold text-amber-400 ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Mobile Number / মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Staff Role Category</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Manager">Head Manager / Store Manager</option>
                    <option value="Operator">CSC Operator / Executive</option>
                    <option value="Helper">Helper / Assistant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Assigned Branch / শাখা</label>
                  <select
                    value={shopId}
                    onChange={(e) => {
                      setShopId(e.target.value);
                      const matched = shops.find(s => s.id === e.target.value);
                      if (matched) setBranchCode(matched.customId || 'ROD001');
                    }}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.customId || 'BR'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="opacity-60 block mb-1">Branch Code / ব্রাঞ্চ কোড</label>
                  <input
                    type="text"
                    placeholder="e.g. ROD-HQ / ROD001"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none font-mono text-emerald-400 font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Salary Scale (₹)</label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="opacity-60 block mb-1">Staff Custom ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CEO-001 / 101"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none font-mono font-bold text-center tracking-widest text-indigo-400 ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="opacity-60 block mb-1">Login Passcode</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pass"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none font-mono ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="opacity-60 block mb-1">Valid Till Date</label>
                  <input
                    type="date"
                    value={validTill}
                    onChange={(e) => setValidTill(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="opacity-60 block mb-1">Full Official Address / এড্রেস</label>
                <input
                  type="text"
                  placeholder="e.g. Sadhanganj Bazar Road, Jalangi, Murshidabad"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              {/* Staff Photo Upload Section */}
              <div className="space-y-2 border-t border-slate-500/10 pt-3">
                <label className="opacity-60 block text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">
                  Operator Profile Photo / স্টাফের ছবি আপলোড করুন
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={photoUrl}
                    alt="Staff Preview"
                    className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-500/50 p-0.5 shrink-0 bg-slate-950"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md">
                        <Upload size={14} />
                        <span>Choose Photo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoFileUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-slate-400">or paste image URL below</span>
                    </div>

                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="Paste photo URL"
                      className={`w-full p-1.5 rounded-lg border focus:outline-none text-[9px] font-mono ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="opacity-60 block mb-2">Service Access Permissions</label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                  {permissionOptions.map(opt => {
                    const active = permissions.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => togglePermission(opt.id)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer ${
                          active
                            ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 font-bold'
                            : theme === 'dark' ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {active && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className={`flex-1 py-2.5 rounded-xl border font-bold cursor-pointer ${
                    theme === 'dark' ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer"
                >
                  Confirm Staff Registration & Generate ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Date-wise Attendance Registry Table */}
      <div className={`p-6 rounded-3xl border overflow-hidden ${gridThemeClass}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className={`font-extrabold text-base ${textPrimaryClass}`}>Daily Attendance Ledger & Staff Roster</h3>
            <p className="text-xs opacity-60">Log attendance, review staff roles, and open printable official ID cards</p>
          </div>

          <div className="flex items-center gap-2 border border-slate-500/10 p-2 rounded-xl">
            <Calendar size={14} className="text-indigo-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-500 focus:outline-none dark:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-500/10 text-left font-bold opacity-60">
                <th className="py-3">Staff / Operator</th>
                <th className="py-3">Post & Designation</th>
                <th className="py-3">Branch Code</th>
                <th className="py-3">Salary scale</th>
                <th className="py-3 text-center">Roster Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(st => {
                const currentStatus = st.attendance[selectedDate];
                const matchedBranch = getStaffBranch(st);
                const isCEO = st.customId === 'CEO-001' || st.id === 'stf_ceo' || st.designation?.toLowerCase().includes('ceo');

                return (
                  <tr key={st.id} className="border-b border-slate-500/5 hover:bg-slate-500/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                          alt={st.name}
                          className="w-10 h-10 rounded-full object-cover border border-amber-500/40 bg-slate-900 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className={`font-bold ${textPrimaryClass}`}>{st.name}</h4>
                            {isCEO && <Crown size={12} className="text-amber-400 shrink-0" />}
                          </div>
                          <p className="text-[10px] opacity-60 mt-0.5">{st.mobile} • ID: {st.customId || '001'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-[11px] font-extrabold text-amber-400 block">{st.designation || st.role}</span>
                      <span className="text-[9px] opacity-60 font-mono">{st.email}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {st.branchCode || matchedBranch?.customId || 'ROD-HQ'}
                      </span>
                    </td>
                    <td className="py-4 text-emerald-500 font-extrabold">₹{st.salary?.toLocaleString() || '25,000'}/mo</td>
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-bold ${getAttendanceBadge(currentStatus)}`}>
                        {currentStatus || 'Not Logged'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1.5 items-center">
                        <button
                          onClick={() => openCardForStaff(st)}
                          title="Generate & Edit Printable Staff ID Card"
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all border border-amber-500/20"
                        >
                          <IdCard size={12} />
                          <span>ID Card</span>
                        </button>
                        <button
                          onClick={() => setAttendance(st.id, selectedDate, 'Present')}
                          className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-[9px] cursor-pointer"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => setAttendance(st.id, selectedDate, 'Absent')}
                          className="px-2 py-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-bold text-[9px] cursor-pointer"
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff ID Card Generator Modal */}
      {selectedCardStaff && (() => {
        const branch = getStaffBranch(selectedCardStaff);

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
            {/* Print specific style block */}
            <style>{`
              @media print {
                @page {
                  size: portrait;
                  margin: 10mm;
                }
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                body * {
                  visibility: hidden !important;
                }
                .printable-staff-card-wrapper,
                .printable-staff-card-wrapper * {
                  visibility: visible !important;
                }
                .printable-staff-card-wrapper {
                  position: absolute !important;
                  left: 50% !important;
                  top: 25mm !important;
                  transform: translateX(-50%) scale(1.15) !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  box-shadow: none !important;
                  page-break-inside: avoid !important;
                }
                .printable-staff-card {
                  border: 2px solid #000000 !important;
                  box-shadow: none !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .no-print, .no-print-container {
                  background: transparent !important;
                  border: none !important;
                  box-shadow: none !important;
                }
              }
            `}</style>

            <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-5 animate-scale-up no-print-container">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 no-print">
                <div className="flex items-center gap-2">
                  <IdCard className="text-amber-400" size={22} />
                  <div>
                    <h3 className="font-extrabold text-base text-white">Official Staff Identity Card</h3>
                    <p className="text-[10px] text-slate-400 font-medium">RODP Official Staff Identity Badge Generator & Live Correction Panel</p>
                  </div>
                </div>

                {/* Staff Dropdown Switcher & Actions */}
                <div className="flex items-center gap-3">
                  <select
                    value={selectedCardStaff.id}
                    onChange={(e) => {
                      const found = staff.find(st => st.id === e.target.value);
                      if (found) openCardForStaff(found);
                    }}
                    className="bg-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 text-amber-300 focus:outline-none"
                  >
                    {staff.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.designation || st.role})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setIsEditingCard(!isEditingCard)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isEditingCard
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                    }`}
                  >
                    <Edit size={14} />
                    <span>{isEditingCard ? "Close Editor" : "Edit Card Data / ডাটা পরিবর্তন"}</span>
                  </button>

                  <button
                    onClick={() => setSelectedCardStaff(null)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Edit Form Toggle Drawer */}
              {isEditingCard && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3 animate-fade-in text-left no-print">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-black text-amber-400 flex items-center gap-2">
                      <Edit size={14} />
                      <span>Edit Staff Details & Live Corrections / যেকোনো ডাটা সংশোধন করুন</span>
                    </h4>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold">⚡ Live Dynamic Preview</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Employee Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => {
                          setEditName(e.target.value);
                          if (selectedCardStaff) updateStaff(selectedCardStaff.id, { name: e.target.value });
                        }}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Designation / Post (পদবী)</label>
                      <input
                        type="text"
                        placeholder="e.g. CEO & Founder / Head Manager"
                        value={editDesignation}
                        onChange={(e) => {
                          setEditDesignation(e.target.value);
                          if (selectedCardStaff) updateStaff(selectedCardStaff.id, { designation: e.target.value });
                        }}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Contact Mobile Number</label>
                      <input
                        type="text"
                        value={editMobile}
                        onChange={(e) => {
                          setEditMobile(e.target.value);
                          if (selectedCardStaff) updateStaff(selectedCardStaff.id, { mobile: e.target.value });
                        }}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Branch Code</label>
                      <input
                        type="text"
                        value={editBranchCode}
                        onChange={(e) => {
                          setEditBranchCode(e.target.value);
                          if (selectedCardStaff) updateStaff(selectedCardStaff.id, { branchCode: e.target.value });
                        }}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Staff Custom ID Code</label>
                      <input
                        type="text"
                        value={editCustomId}
                        onChange={(e) => {
                          setEditCustomId(e.target.value);
                          if (selectedCardStaff) updateStaff(selectedCardStaff.id, { customId: e.target.value });
                        }}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Issue Date</label>
                      <input
                        type="date"
                        value={editIssueDate}
                        onChange={(e) => {
                          setEditIssueDate(e.target.value);
                          if (selectedCardStaff) updateStaff(selectedCardStaff.id, { issueDate: e.target.value });
                        }}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Valid Till Date</label>
                      <input
                        type="date"
                        value={editValidTill}
                        onChange={(e) => {
                          setEditValidTill(e.target.value);
                          if (selectedCardStaff) updateStaff(selectedCardStaff.id, { validTill: e.target.value });
                        }}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-indigo-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Full Official Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => {
                          setEditAddress(e.target.value);
                          if (selectedCardStaff) updateStaff(selectedCardStaff.id, { address: e.target.value });
                        }}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Photo Upload & Presets */}
                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={editPhotoUrl}
                        alt="Preview"
                        className="w-10 h-10 rounded-xl object-cover border border-amber-500/50 bg-slate-950"
                      />
                      <label className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md">
                        <Upload size={14} />
                        <span>Upload Photo File / ছবি পরিবর্তন</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoFileUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveCardCorrections}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Save size={14} />
                      <span>Save & Update Card Data</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ID Card Display Frame - Exact Design Maintained */}
              <div className="printable-staff-card-wrapper flex flex-col items-center justify-center gap-6 my-2">
                <div 
                  id="printable-staff-card-element"
                  className="printable-staff-card w-[380px] h-[240px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-2 border-amber-500/40 p-4 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between select-none shrink-0"
                >
                  {/* Background Watermark Pattern */}
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Card Header Banner */}
                  <div className="relative z-10 flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                        ROD
                      </div>
                      <div className="text-left">
                        <p className="font-black text-[10px] tracking-wider text-amber-400 uppercase leading-none">
                          RIZWAN ONLINE DREAMS
                        </p>
                        <p className="text-[7px] text-slate-300 font-bold tracking-widest uppercase mt-0.5">
                          OFFICIAL STAFF IDENTITY BADGE
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[6px] font-mono text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        VERIFIED
                      </span>
                      <span className="text-[6px] text-slate-400 font-mono mt-0.5">ID: {editCustomId || '001'}</span>
                    </div>
                  </div>

                  {/* Card Middle Section: Photo & Details */}
                  <div className="relative z-10 grid grid-cols-12 gap-3 items-center py-1">
                    {/* Left: Staff Photo & Post */}
                    <div className="col-span-4 flex flex-col items-center">
                      <div className="relative">
                        <img
                          src={editPhotoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                          alt={editName}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover border-2 border-amber-400/80 shadow-md bg-slate-900"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
                          <Shield size={10} />
                        </div>
                      </div>
                      <span className="mt-1 text-[7px] font-mono text-amber-300 font-bold uppercase bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 text-center truncate max-w-full">
                        {editDesignation || selectedCardStaff.role}
                      </span>
                    </div>

                    {/* Right: Info Details */}
                    <div className="col-span-8 text-left space-y-1">
                      <div>
                        <p className="text-[7px] text-slate-400 uppercase font-extrabold tracking-wider">Employee Name</p>
                        <p className="text-xs font-black text-white truncate tracking-wide">{editName || selectedCardStaff.name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <p className="text-[6px] text-slate-400 uppercase font-extrabold">Assigned Branch</p>
                          <p className="text-[8px] font-extrabold text-amber-300 truncate">{branch?.name || 'Main Office'}</p>
                        </div>
                        <div>
                          <p className="text-[6px] text-slate-400 uppercase font-extrabold">Branch Code</p>
                          <p className="text-[8px] font-extrabold text-emerald-400 font-mono">{editBranchCode || branch?.customId || 'ROD-HQ'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-0.5">
                        <div>
                          <p className="text-[6px] text-slate-400 uppercase font-extrabold">Contact Phone</p>
                          <p className="text-[8px] font-mono text-slate-200 font-bold">{editMobile || '9593388785'}</p>
                        </div>
                        <div>
                          <p className="text-[6px] text-slate-400 uppercase font-extrabold">Issue Date / Valid ID</p>
                          <p className="text-[7px] font-mono text-indigo-300 font-bold truncate">{editIssueDate || '2026-08-01'}</p>
                        </div>
                      </div>

                      {editAddress && (
                        <div>
                          <p className="text-[6px] text-slate-400 uppercase font-extrabold">Official Address</p>
                          <p className="text-[7px] text-slate-300 truncate font-medium">{editAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Barcode & Security Hologram */}
                  <div className="relative z-10 border-t border-amber-500/20 pt-1.5 flex items-center justify-between">
                    {/* Simulated Real Data Barcode */}
                    <div 
                      onClick={() => setShowBarcodeData(!showBarcodeData)}
                      className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                      title="Click to view scanned real staff barcode payload"
                    >
                      <div className="flex gap-[1.5px] items-center bg-white p-1 rounded-sm h-5">
                        {[2, 1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2].map((w, idx) => (
                          <div key={idx} className="bg-slate-950 h-full" style={{ width: `${w}px` }} />
                        ))}
                      </div>
                      <div className="text-left">
                        <p className="text-[6px] font-mono text-slate-400 uppercase leading-none">AUTH CODE (CLICK DATA)</p>
                        <p className="text-[7px] font-mono font-black text-amber-400 leading-none mt-0.5">RODP-STF-{editCustomId || '101'}</p>
                      </div>
                    </div>

                    {/* Authorized Signature & Hologram Stamp */}
                    <div className="text-right flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-[6px] font-mono font-extrabold text-amber-400 leading-none">Rizwan Roushan</p>
                        <p className="text-[5px] text-slate-400 uppercase leading-none font-bold mt-0.5">CEO Signature Stamp</p>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-300 flex items-center justify-center text-slate-950 shadow-inner">
                        <Award size={11} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scanned Real Barcode Payload Display Modal */}
              {showBarcodeData && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2 text-xs font-mono animate-fade-in no-print">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <span className="font-extrabold text-amber-400 flex items-center gap-2">
                      <QrCode size={16} />
                      <span>SCANNED REAL BARCODE PAYLOAD (VERIFIED ACTIVE)</span>
                    </span>
                    <button onClick={() => setShowBarcodeData(false)} className="text-amber-400 hover:text-white">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                    <div><strong className="text-amber-300">Staff ID:</strong> RODP-STF-{editCustomId}</div>
                    <div><strong className="text-amber-300">Name:</strong> {editName}</div>
                    <div><strong className="text-amber-300">Designation:</strong> {editDesignation}</div>
                    <div><strong className="text-amber-300">Mobile:</strong> {editMobile}</div>
                    <div><strong className="text-amber-300">Branch Code:</strong> {editBranchCode}</div>
                    <div><strong className="text-amber-300">Issue Date:</strong> {editIssueDate}</div>
                    <div><strong className="text-amber-300">Valid Till:</strong> {editValidTill}</div>
                    <div><strong className="text-amber-300">Address:</strong> {editAddress}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 no-print">
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <span>💡 Tip: Use <strong className="text-amber-400">Print / Save as PDF</strong> for physical plastic card printing or <strong className="text-amber-400">Download PNG Image</strong> for digital badges.</span>
                </p>

                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setSelectedCardStaff(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-all"
                  >
                    Close
                  </button>

                  <button
                    onClick={handleDownloadAndPrintCard}
                    disabled={isDownloading}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Download size={15} />
                    )}
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={handlePrintCardPDF}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Printer size={16} />
                    <span>Print / Save as PDF / প্রিন্ট আইডি কার্ড</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
