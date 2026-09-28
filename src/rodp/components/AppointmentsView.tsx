import React, { useState } from 'react';
import { 
  Calendar, Clock, User, Phone, MapPin, Sparkles, Plus, CheckCircle2,
  Check, X, RefreshCw, AlertCircle, Play, UserCheck, 
  MessageSquare, ChevronLeft, ChevronRight, Layers, Receipt, Bell, Shield, ShieldAlert, CheckSquare, Trash2,
  Lock, Unlock, Wifi, WifiOff, ArrowRight, ArrowLeft
} from 'lucide-react';
import { Appointment, Staff, ServiceModule, Task } from '../types';

interface AppointmentsViewProps {
  theme: 'light' | 'dark';
  appointments: Appointment[];
  addAppointment: (app: Appointment) => void;
  updateAppointment: (id: string, updates: any) => void;
  staff: Staff[];
  tasks?: Task[];
  addTask?: (task: Task) => void;
  updateTask?: (id: string, updates: any) => void;
  deleteTask?: (id: string) => void;
  goToBillingWithCustomer?: (mobile: string, serviceName: string) => void;
  gdriveConnected?: boolean;
  gdriveToken?: string | null;
  services?: ServiceModule[];
}

// Premium futuristic Sound synthesis system (Web Audio API)
const playSynthSound = (type: 'success' | 'click' | 'alert' | 'complete' | 'laser') => {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtxCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (typeof AudioCtxCtor !== 'function') return;
    const ctx = new AudioCtxCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Futuristic ascending chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.15); // C6
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'complete') {
      // Cosmic positive double beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
      
      setTimeout(() => {
        try {
          const AudioCtxCtor2 = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (typeof AudioCtxCtor2 !== 'function') return;
          const ctx2 = new AudioCtxCtor2();
          const osc2 = ctx2.createOscillator();
          const gain2 = ctx2.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx2.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1320, ctx2.currentTime); // E6
          gain2.gain.setValueAtTime(0.08, ctx2.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx2.currentTime + 0.1);
          osc2.start();
          osc2.stop(ctx2.currentTime + 0.15);
        } catch (e) {}
      }, 100);
    } else if (type === 'click') {
      // Ultra short high tech click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'alert') {
      // Futuristic alert frequency modulation
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'laser') {
      // Futuristic sci-fi laser sound for active transitions
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    console.warn('AudioContext not supported or blocked:', e);
  }
};

export default function AppointmentsView({
  theme,
  appointments,
  addAppointment,
  updateAppointment,
  staff,
  tasks = [],
  addTask,
  updateTask,
  deleteTask,
  goToBillingWithCustomer,
  gdriveConnected = false,
  gdriveToken = null,
  services = []
}: AppointmentsViewProps) {
  const [selectedDate, setSelectedDate] = useState('2026-06-24'); // Current workspace date
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentView, setCurrentView] = useState<'daily' | 'weekly' | 'monthly' | 'timeline'>('daily');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(0); // Multi-step modern wizard selection flow
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [offlineServiceError, setOfflineServiceError] = useState<string | null>(null);
  
  // Custom Task Panel Form State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskTime, setNewTaskTime] = useState('11:00 AM');

  // Google Calendar Sync state
  const [isSyncingCalendarId, setIsSyncingCalendarId] = useState<string | null>(null);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3500);
  };

  const playSoundAndAlert = (sound: 'success' | 'click' | 'alert' | 'complete' | 'laser', msg: string) => {
    playSynthSound(sound);
    triggerAlert(msg);
  };

  const handleSyncToCalendarClick = async (app: Appointment) => {
    if (!gdriveToken) {
      playSoundAndAlert('alert', '⚠️ Google Services not connected. Connect via top bar.');
      return;
    }
    setIsSyncingCalendarId(app.id);
    try {
      const { syncAppointmentToGoogleCalendar } = await import('../lib/googleIntegrations');
      const result = await syncAppointmentToGoogleCalendar(gdriveToken, app);
      if (result.success) {
        playSoundAndAlert('success', '📅 Synced with Google Calendar successfully!');
      } else {
        playSoundAndAlert('alert', `❌ Calendar Sync Failed: ${result.message}`);
      }
    } catch (e: any) {
      playSoundAndAlert('alert', `❌ System Error: ${e.message}`);
    } finally {
      setIsSyncingCalendarId(null);
    }
  };

  // Check service availability against Super Admin's settings
  const checkServiceAvailability = (serviceName: string): { available: boolean; message: string } => {
    if (!services || services.length === 0) return { available: true, message: '' };
    
    // Find matching service in admin database
    const matched = services.find(s => 
      serviceName.toLowerCase().includes(s.name.toLowerCase()) || 
      s.name.toLowerCase().includes(serviceName.toLowerCase())
    );

    if (matched && matched.disabled) {
      return { 
        available: false, 
        message: matched.bengaliDesc || `⚠️ দুঃখিত! "${matched.name}" সার্ভিসটি বর্তমানে নিষ্ক্রিয় বা বন্ধ আছে। সুপার এডমিন প্যানেল থেকে এটি ব্লক করা হয়েছে।` 
      };
    }
    return { available: true, message: '' };
  };

  // Form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [serviceType, setServiceType] = useState('🆔 Aadhaar Services');
  const [customService, setCustomService] = useState('');
  const [date, setDate] = useState('2026-06-24');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 10:30 AM');
  const [notes, setNotes] = useState('');

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newReschedDate, setNewReschedDate] = useState('2026-06-24');
  const [newReschedSlot, setNewReschedSlot] = useState('11:00 AM - 11:30 AM');

  const servicesList = [
    '🆔 Aadhaar Services', '💳 PAN Card Services', '🗳️ Voter Card Services', 
    '📕 Passport Services', '🏦 Banking Services', '💰 Money Transfer',
    '🚆 Train Ticket Services', '✈️ Flight Ticket Services', '🖨️ Print & Xerox',
    '✨ Others (Specify task)'
  ];

  const slots = [
    '09:30 AM - 10:00 AM', '10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM',
    '12:00 PM - 12:30 PM', '02:00 PM - 02:30 PM', '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM', '04:00 PM - 04:30 PM'
  ];

  const weekDays = [
    { name: 'Mon', date: '2026-06-22' },
    { name: 'Tue', date: '2026-06-23' },
    { name: 'Wed', date: '2026-06-24' },
    { name: 'Thu', date: '2026-06-25' },
    { name: 'Fri', date: '2026-06-26' },
    { name: 'Sat', date: '2026-06-27' },
    { name: 'Sun', date: '2026-06-28' },
  ];

  const monthlyDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    return `2026-06-${String(dayNum).padStart(2, '0')}`;
  });

  const filteredAppointments = appointments.filter(a => {
    const matchesDate = currentView === 'monthly' ? true : a.date === selectedDate;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    // Real-time Service Availability Check
    const finalServiceType = serviceType === '✨ Others (Specify task)' 
      ? `✨ Others: ${customService.trim() || 'Custom Task'}` 
      : serviceType;

    const availability = checkServiceAvailability(finalServiceType);
    if (!availability.available) {
      playSynthSound('alert');
      setOfflineServiceError(availability.message);
      return;
    }

    // Check if slot matches any Sifra AI blocked reminders
    const blockedTask = (tasks || []).find(t => {
      if (!t.blockAppointments) return false;
      if (t.dueDate !== date) return false;
      if (!t.reminderTime) return true;
      const blockTimeStr = t.reminderTime.toLowerCase().trim();
      const currentSlotStr = timeSlot.toLowerCase().trim();
      return currentSlotStr.includes(blockTimeStr) || blockTimeStr.includes(currentSlotStr);
    });

    if (blockedTask) {
      if (!window.confirm(`⚠️ Sifra AI Calendar Lock:\nThis timeslot is blocked on your calendar because:\n"${blockedTask.title}"\n\nDo you want to override Sifra AI rules and book anyway?`)) {
        return;
      }
    }

    const lastNum = appointments.length > 0 
      ? Number(appointments[appointments.length - 1].tokenNumber?.replace('T-', '') || '0')
      : 0;
    const tokenNumber = `T-${String(lastNum + 1).padStart(2, '0')}`;

    const newApp: Appointment = {
      id: `appt_${Date.now()}`,
      name,
      mobileNumber: mobile,
      address,
      serviceType: finalServiceType,
      date,
      timeSlot,
      notes,
      status: 'Pending',
      tokenNumber,
      createdAt: new Date().toISOString(),
      shopId: 'shop_1'
    };

    addAppointment(newApp);
    setIsBooking(false);
    playSoundAndAlert('success', `✨ Scheduled booking for ${name}. Token ${tokenNumber} issued.`);

    // Reset Form
    setName('');
    setMobile('');
    setAddress('');
    setNotes('');
    setCustomService('');
  };

  const updateStatus = (id: string, status: Appointment['status'], staffId?: string) => {
    const updates: any = { status };
    if (staffId) updates.assignedStaffId = staffId;
    updateAppointment(id, updates);
    playSoundAndAlert(status === 'Completed' ? 'complete' : 'click', `Appointment status changed to ${status}`);
  };

  const handleReschedule = (id: string) => {
    updateAppointment(id, {
      date: newReschedDate,
      timeSlot: newReschedSlot
    });
    setReschedulingId(null);
    playSoundAndAlert('complete', '📅 Appointment rescheduled successfully.');
  };

  const triggerReminder = (app: Appointment) => {
    playSoundAndAlert('laser', `💬 WhatsApp Alert notification sent to ${app.name} (${app.mobileNumber})`);
  };

  // Add remaining task inside appointment checklist
  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !addTask) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      priority: newTaskPriority,
      frequency: 'daily',
      dueDate: selectedDate,
      status: 'Pending',
      shopId: 'shop_1',
      createdAt: new Date().toISOString(),
      isReminder: true,
      reminderTime: newTaskTime
    };

    addTask(newTask);
    setNewTaskTitle('');
    setShowTaskForm(false);
    playSoundAndAlert('success', `📌 Work Goal Logged: "${newTask.title}"`);
  };

  const toggleTaskStatus = (task: Task) => {
    if (!updateTask) return;
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    updateTask(task.id, { status: nextStatus });
    playSoundAndAlert(nextStatus === 'Completed' ? 'complete' : 'click', `Task updated to ${nextStatus}`);
  };

  // Queue Analytics based on selectedDate
  const queueTotal = appointments.filter(a => a.date === selectedDate).length;
  const queuePending = appointments.filter(a => a.date === selectedDate && a.status === 'Pending');
  const queueCompleted = appointments.filter(a => a.date === selectedDate && a.status === 'Completed').length;
  const nextUp = queuePending[0];

  // Remaining and Completed tasks on selectedDate
  const activeTasks = tasks.filter(t => t.dueDate === selectedDate && t.status !== 'Completed');
  const doneTasks = tasks.filter(t => t.dueDate === selectedDate && t.status === 'Completed');

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold select-none">
      
      {/* Absolute floating notifications */}
      {alertMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0a0a0c] border border-amber-500/40 text-[#dfac5d] shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center gap-2.5 max-w-sm">
          <Sparkles size={16} className="text-[#00f2fe] shrink-0 animate-spin" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Futuristic Header Control Deck */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-cyan-500/20 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="relative z-10">
          <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/35 text-[#00f2fe] text-[9px] uppercase tracking-widest font-black inline-block mb-2 animate-pulse">
            🛸 CORE FLIGHT OPERATIONS DECK v3.0
          </span>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-400 tracking-tight">
            Integrated Appointments & Work Planner
          </h2>
          <p className="text-slate-400 text-xs font-medium mt-1 max-w-xl">
            Futuristic biometric verification hubs, real-time schedule checks, premium sound responses, and live work planners synchronized dynamically.
          </p>
        </div>

        <button
          onClick={() => { playSynthSound('laser'); setBookingStep(0); setIsBooking(true); }}
          className="px-6 py-3 bg-gradient-to-r from-[#00f2fe] to-indigo-600 text-black rounded-xl font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(0,242,254,0.4)] cursor-pointer shrink-0 relative z-10"
        >
          <Plus size={16} className="stroke-[3]" /> Book Queue Slot Instantly
        </button>
      </div>

      {/* DYNAMIC KPI SUMMARY BOARD (FULLY ACTIVE FILTERING) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#050508]/80 p-5 rounded-3xl border border-[#00f2fe]/10 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Total Today */}
        <button 
          onClick={() => {
            setFilterStatus('All');
            setCurrentView('daily');
            playSynthSound('click');
          }}
          className={`p-4 rounded-2xl border text-left flex justify-between items-center transition-all duration-300 cursor-pointer focus:outline-none ${
            filterStatus === 'All' 
              ? 'bg-[#00f2fe]/10 border-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.2)] text-white' 
              : 'bg-[#050505]/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-extrabold">Today's Total Queue</span>
            <span className="text-2xl font-black block mt-1">{queueTotal} Slots</span>
          </div>
          <span className="text-[10px] text-[#00f2fe] bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">All Logs</span>
        </button>

        {/* Next Customer Up */}
        <button 
          onClick={() => {
            setFilterStatus('Pending');
            setCurrentView('daily');
            playSynthSound('click');
          }}
          className={`p-4 rounded-2xl border text-left flex justify-between items-center transition-all duration-300 cursor-pointer focus:outline-none ${
            filterStatus === 'Pending' 
              ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-white' 
              : 'bg-[#050505]/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-extrabold">Next In Line</span>
            <span className="text-sm font-black text-amber-400 block mt-1.5 truncate max-w-[120px]">
              {nextUp ? nextUp.name : 'No one pending'}
            </span>
          </div>
          {nextUp && (
            <span className="text-xs font-mono font-black px-2 py-0.5 bg-amber-500 text-black rounded animate-pulse">
              {nextUp.tokenNumber}
            </span>
          )}
        </button>

        {/* Completed Slots */}
        <button 
          onClick={() => {
            setFilterStatus('Completed');
            setCurrentView('daily');
            playSynthSound('click');
          }}
          className={`p-4 rounded-2xl border text-left flex justify-between items-center transition-all duration-300 cursor-pointer focus:outline-none ${
            filterStatus === 'Completed' 
              ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-white' 
              : 'bg-[#050505]/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-extrabold">Completed Jobs</span>
            <span className="text-2xl font-black text-emerald-400 block mt-1">{queueCompleted} Done</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Success</span>
        </button>

        {/* Advance Queue button */}
        <div className="flex items-center justify-center">
          <button 
            disabled={!nextUp}
            onClick={() => updateStatus(nextUp!.id, 'Completed')}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-center text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
              nextUp 
                ? 'bg-gradient-to-tr from-cyan-400 to-indigo-600 text-black cursor-pointer hover:scale-102 hover:shadow-[0_0_15px_rgba(0,242,254,0.3)]' 
                : 'bg-slate-900/40 text-slate-600 cursor-not-allowed border border-slate-900/40'
            }`}
          >
            <UserCheck size={15} /> Advance Active Token
          </button>
        </div>

      </div>

      {/* VIEW SELECTOR & CALENDAR TOGGLE BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-5">
        
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(['daily', 'weekly', 'monthly', 'timeline'] as const).map(v => (
            <button
              key={v}
              onClick={() => { playSynthSound('click'); setCurrentView(v); }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                currentView === v ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {v} View
            </button>
          ))}
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              playSynthSound('click');
              const prevDay = Number(selectedDate.split('-')[2]) - 1;
              if (prevDay >= 1) {
                setSelectedDate(`2026-06-${String(prevDay).padStart(2, '0')}`);
              }
            }}
            className="p-2 rounded-lg border border-slate-800 bg-[#0a0a0c]/50 text-slate-400 hover:text-white cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-black text-cyan-400 font-mono uppercase tracking-wider bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            {selectedDate === '2026-06-24' ? '📅 Today (24 Jun)' : `📅 ${selectedDate}`}
          </span>
          <button 
            onClick={() => {
              playSynthSound('click');
              const nextDay = Number(selectedDate.split('-')[2]) + 1;
              if (nextDay <= 30) {
                setSelectedDate(`2026-06-${String(nextDay).padStart(2, '0')}`);
              }
            }}
            className="p-2 rounded-lg border border-slate-800 bg-[#0a0a0c]/50 text-slate-400 hover:text-white cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold text-[10px] uppercase">Filter Status</span>
          <select
            value={filterStatus}
            onChange={(e) => { playSynthSound('click'); setFilterStatus(e.target.value); }}
            className="text-xs font-bold py-2 px-3 rounded-xl border border-cyan-500/20 bg-slate-950 text-cyan-400 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Approval</option>
            <option value="Approved">Approved / Active</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

      </div>

      {/* CORE DISPLAY COLUMNS: LEFT APPOINTMENTS / RIGHT WORK PLANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLUMNS: APPOINTMENT FLOW VIEWS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* MONTHLY CALENDAR GRID VIEW */}
          {currentView === 'monthly' && (
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="text-center">
                <h4 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase tracking-widest">
                  Enterprise Operational Planner - June 2026
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Focus your roster date matrix dynamically</p>
              </div>

              <div className="grid grid-cols-7 gap-3 pt-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="text-center text-[10px] uppercase text-slate-500 font-extrabold pb-2">{d}</div>
                ))}

                {monthlyDays.map((dayStr) => {
                  const dayVal = Number(dayStr.split('-')[2]);
                  const appointmentsOnThisDay = appointments.filter(a => a.date === dayStr);
                  const isSelected = selectedDate === dayStr;

                  return (
                    <button
                      key={dayStr}
                      onClick={() => {
                        playSynthSound('click');
                        setSelectedDate(dayStr);
                        setCurrentView('daily');
                      }}
                      className={`p-3 rounded-xl border text-center relative hover:border-cyan-400 transition-all cursor-pointer h-20 flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300' 
                          : 'bg-[#050505]/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold font-mono self-start">{dayVal}</span>
                      {appointmentsOnThisDay.length > 0 && (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full block self-end">
                          {appointmentsOnThisDay.length} Jobs
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* WEEKLY GRID COLUMN VIEW */}
          {currentView === 'weekly' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weekDays.map((day) => {
                const appsOnDay = appointments.filter(a => a.date === day.date && (filterStatus === 'All' || a.status === filterStatus));
                const isToday = day.date === '2026-06-24';

                return (
                  <div 
                    key={day.name} 
                    onClick={() => { playSynthSound('click'); setSelectedDate(day.date); }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer h-96 flex flex-col justify-between ${
                      isToday 
                        ? 'bg-cyan-500/5 border-cyan-400/40 shadow-[0_4px_25px_rgba(6,182,212,0.15)]' 
                        : 'bg-[#0a0a0c]/60 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                        <span className="text-[11px] font-black text-slate-200">{day.name}</span>
                        <span className="text-[9px] font-bold text-cyan-400 font-mono">{day.date.substring(8, 10)}</span>
                      </div>

                      <div className="space-y-2 overflow-y-auto h-64 pr-1.5 custom-scrollbar">
                        {appsOnDay.length === 0 ? (
                          <span className="text-[9px] text-slate-600 italic block py-4 text-center">Empty Roster</span>
                        ) : (
                          appsOnDay.map(a => (
                            <button 
                              key={a.id} 
                              onClick={(e) => {
                                e.stopPropagation();
                                playSynthSound('click');
                                const availability = checkServiceAvailability(a.serviceType);
                                if (!availability.available) {
                                  setOfflineServiceError(availability.message);
                                } else {
                                  playSoundAndAlert('success', `✅ Service "${a.serviceType}" verified and active today.`);
                                }
                              }}
                              className="w-full text-left p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all text-[9px] block cursor-pointer"
                            >
                              <div className="flex justify-between font-bold text-slate-300">
                                <span className="truncate max-w-[50px]">{a.name}</span>
                                <span className="text-cyan-400 font-mono">{a.tokenNumber}</span>
                              </div>
                              <span className="text-slate-500 block truncate mt-0.5">{a.serviceType}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="text-center pt-2 border-t border-slate-800">
                      <span className="text-[9px] font-black text-cyan-400">{appsOnDay.length} Scheduled</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TIMELINE FLOW VIEW */}
          {currentView === 'timeline' && (
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-6">
              <div className="text-center">
                <h4 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 uppercase tracking-widest">
                  Chronological Slot Interval Flow
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Hour-by-hour operational distribution pipeline</p>
              </div>

              <div className="space-y-4">
                {slots.map((slot) => {
                  const matchedApps = appointments.filter(a => a.date === selectedDate && a.timeSlot === slot);
                  return (
                    <div key={slot} className="p-4 rounded-2xl bg-[#050505]/60 border border-slate-800 flex flex-col md:flex-row gap-4 items-center">
                      <div className="md:w-48 shrink-0 flex items-center gap-2 border-r border-slate-800 md:pr-4">
                        <Clock size={14} className="text-cyan-400" />
                        <span className="font-mono text-xs text-cyan-400 font-black">{slot}</span>
                      </div>

                      <div className="flex-1 flex flex-wrap gap-3">
                        {matchedApps.length === 0 ? (
                          <span className="text-[10px] text-slate-600 italic">No allocations reserved for this slot</span>
                        ) : (
                          matchedApps.map(app => (
                            <button
                              key={app.id}
                              onClick={() => {
                                playSynthSound('click');
                                const availability = checkServiceAvailability(app.serviceType);
                                if (!availability.available) {
                                  setOfflineServiceError(availability.message);
                                } else {
                                  playSoundAndAlert('success', `✅ Service "${app.serviceType}" verified and active today.`);
                                }
                              }}
                              className="p-3 rounded-xl bg-slate-950 border border-cyan-500/10 hover:border-cyan-400 transition-all flex items-center gap-3 text-left cursor-pointer"
                            >
                              <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">{app.tokenNumber}</span>
                              <div>
                                <span className="text-slate-200 font-extrabold block">{app.name}</span>
                                <span className="text-[9px] text-slate-500 block">{app.serviceType}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DAILY VIEW / DEFAULT LIST OF ALL APPOINTMENTS */}
          {(currentView === 'daily') && (
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="p-12 text-center text-slate-500 rounded-3xl bg-slate-950/60 border border-slate-800">
                  <Calendar size={32} className="mx-auto text-cyan-500/20 mb-3 animate-pulse" />
                  <h3 className="font-black text-xs text-slate-300">No Reserved Schedule Logs</h3>
                  <p className="text-[10px] text-slate-500 mt-1">There are no appointments reserved for {selectedDate}. Adjust your filter or book a slot.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAppointments.map((app) => {
                    const assignedStaff = staff.find(s => s.id === app.assignedStaffId);
                    const isRescheduling = reschedulingId === app.id;

                    return (
                      <div 
                        key={app.id} 
                        className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/30 flex flex-col justify-between space-y-4 hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Premium Futuristic Header */}
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-500" />
                        
                        <div className="flex justify-between items-center pt-1">
                          <span className="px-3 py-1 rounded bg-slate-900 border border-cyan-500/30 text-cyan-400 font-black font-mono tracking-widest">
                            {app.tokenNumber || 'T-XX'}
                          </span>
                          <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                            app.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            app.status === 'Approved' ? 'bg-[#00f2fe]/10 text-[#00f2fe] border-[#00f2fe]/20' :
                            app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              playSynthSound('click');
                              const availability = checkServiceAvailability(app.serviceType);
                              if (!availability.available) {
                                setOfflineServiceError(availability.message);
                              } else {
                                playSoundAndAlert('success', `✅ Service "${app.serviceType}" verified and active today.`);
                              }
                            }}
                            className="w-full text-left block focus:outline-none"
                          >
                            <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                              <User size={14} className="text-cyan-400" />
                              {app.name}
                            </h4>
                          </button>
                          
                          <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-500" />
                            {app.mobileNumber}
                          </p>
                          {app.address && (
                            <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1.5">
                              <MapPin size={12} className="text-slate-500" />
                              {app.address}
                            </p>
                          )}
                          
                          <div className="pt-2 border-t border-slate-900 text-[10px] font-black text-cyan-400 flex items-center gap-1.5">
                            <Layers size={12} className="text-amber-400" />
                            {app.serviceType}
                          </div>
                          
                          <div className="space-y-1 pt-1.5 border-t border-slate-900">
                            <label className="text-[8px] text-slate-500 uppercase tracking-wider block font-black">Admin / Booking Notes</label>
                            <input
                              type="text"
                              defaultValue={app.notes || ''}
                              onBlur={(e) => {
                                updateAppointment(app.id, { notes: e.target.value });
                                triggerAlert('Appointment notes updated');
                              }}
                              placeholder="Add internal notes..."
                              className="w-full text-[10px] font-semibold bg-black/40 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-2.5 py-1 text-slate-300 placeholder-slate-700 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Reserved Slot & Assigned Executive */}
                        <div className="bg-black/40 p-3 rounded-2xl border border-slate-900 text-[10px] space-y-2">
                          {isRescheduling ? (
                            <div className="space-y-2">
                              <input 
                                type="date" 
                                value={newReschedDate}
                                onChange={(e) => setNewReschedDate(e.target.value)}
                                className="w-full bg-slate-950 border border-cyan-500/30 text-cyan-400 py-1.5 px-2.5 rounded-lg focus:outline-none font-mono"
                              />
                              <select 
                                value={newReschedSlot}
                                onChange={(e) => setNewReschedSlot(e.target.value)}
                                className="w-full bg-slate-950 border border-cyan-500/30 text-cyan-400 py-1.5 px-2.5 rounded-lg focus:outline-none font-mono"
                              >
                                {slots.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => setReschedulingId(null)}
                                  className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handleReschedule(app.id)}
                                  className="px-3 py-1 bg-cyan-400 text-black font-black rounded-lg"
                                >
                                  Confirm
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-500 font-bold uppercase">Reserved Slot:</span>
                              <span className="text-cyan-400 font-bold">{app.timeSlot}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-1 border-t border-slate-900">
                            <span className="text-slate-500 font-bold uppercase">Staff Executive:</span>
                            {app.status === 'Pending' ? (
                              <select
                                onChange={(e) => updateStatus(app.id, 'Approved', e.target.value)}
                                className="bg-slate-950 text-[10px] text-cyan-400 border border-cyan-500/20 rounded px-1.5 py-0.5 focus:outline-none"
                              >
                                <option value="">Assign staff...</option>
                                {staff.map(s => (
                                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-slate-300 font-black">{assignedStaff ? assignedStaff.name : 'Senior Executive'}</span>
                            )}
                          </div>
                        </div>

                        {/* Operational Actions */}
                        <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => triggerReminder(app)}
                              className="p-2 rounded-xl border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                              title="Send Alert notification"
                            >
                              <Bell size={13} />
                            </button>

                            <button 
                              onClick={() => {
                                playSynthSound('click');
                                setNewReschedDate(app.date);
                                setNewReschedSlot(app.timeSlot);
                                setReschedulingId(app.id);
                              }}
                              className="p-2 rounded-xl border border-cyan-500/20 text-[#00f2fe] hover:bg-cyan-500/10 transition-colors cursor-pointer"
                              title="Reschedule Booking"
                            >
                              <RefreshCw size={13} />
                            </button>
                          </div>

                          <div className="flex gap-1.5 items-center">
                            {app.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => updateStatus(app.id, 'Approved')}
                                  className="px-3 py-1.5 bg-emerald-500 text-black font-black rounded-xl text-[10px] hover:scale-105 transition-all cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(app.id, 'Rejected')}
                                  className="px-3 py-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold rounded-xl text-[10px] hover:bg-rose-500/20 transition-all cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {app.status === 'Approved' && (
                              <button
                                onClick={() => updateStatus(app.id, 'Completed')}
                                className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-black rounded-xl text-[10px] hover:scale-105 transition-all cursor-pointer"
                              >
                                Mark Completed
                              </button>
                            )}

                            {(app.status === 'Approved' || app.status === 'Completed') && (
                              <button
                                onClick={() => {
                                  playSynthSound('laser');
                                  if (goToBillingWithCustomer) {
                                    goToBillingWithCustomer(app.mobileNumber, app.serviceType);
                                  }
                                }}
                                className="px-3.5 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold rounded-xl text-[10px] hover:bg-amber-500/25 transition-all flex items-center gap-1 cursor-pointer"
                                title="Generate Bill"
                              >
                                <Receipt size={12} className="text-amber-400" />
                                <span>Bill Now</span>
                              </button>
                            )}

                            {(app.status === 'Pending' || app.status === 'Approved') && (
                              <button
                                onClick={() => updateStatus(app.id, 'Cancelled')}
                                className="p-1.5 border border-dashed border-red-500/40 text-red-400 rounded-xl text-[10px] hover:bg-red-500/10 transition-all cursor-pointer"
                                title="Cancel Appointment"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (1/3 SIZE): TODAY'S WORK PLANNER CHECKLIST FEATURE */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-950/90 border border-cyan-500/20 shadow-[0_4px_30px_rgba(0,242,254,0.1)] space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 tracking-wider uppercase flex items-center gap-2">
                  <CheckSquare size={16} className="text-amber-400" />
                  <span>Today's Work Planner</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Checklist of active work tasks for today</p>
              </div>

              <button
                onClick={() => { playSynthSound('click'); setShowTaskForm(!showTaskForm); }}
                className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all text-cyan-400"
                title="Add Work Goal"
              >
                <Plus size={14} className="stroke-[3]" />
              </button>
            </div>

            {/* Custom Task Form */}
            {showTaskForm && (
              <form onSubmit={handleAddNewTask} className="p-4 rounded-2xl bg-black border border-slate-800 space-y-3 animate-fade-in">
                <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-extrabold block border-b border-slate-900 pb-1">
                  Log New Operation
                </span>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block">Operation Title *</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Process Aadhaar biometric files"
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-[10px] focus:outline-none focus:border-cyan-500/40 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block">Time slot</label>
                    <input
                      type="text"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      placeholder="e.g. 11:30 AM"
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-[10px] focus:outline-none focus:border-cyan-500/40 font-bold font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 text-[10px] focus:outline-none focus:border-cyan-500/40 font-bold"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-cyan-400 text-black font-black rounded-lg text-[10px] uppercase tracking-wider"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            )}

            {/* List columns */}
            <div className="space-y-5">
              
              {/* PENDING TASKS SECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    ⏳ Remaining Tasks ({activeTasks.length})
                  </span>
                </div>

                {activeTasks.length === 0 ? (
                  <div className="py-8 text-center text-slate-600 bg-black/40 border border-slate-900 rounded-2xl text-[9px] italic">
                    All set! No pending tasks left for today.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                    {activeTasks.map(task => (
                      <div 
                        key={task.id}
                        className="p-3 rounded-xl bg-black border border-slate-900 hover:border-cyan-500/20 transition-all flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleTaskStatus(task)}
                            className="w-4 h-4 rounded border border-slate-700 bg-slate-950 hover:border-cyan-400 transition-colors flex items-center justify-center shrink-0"
                          >
                            <span className="text-transparent">✓</span>
                          </button>

                          <div className="min-w-0">
                            <span className="text-slate-200 font-extrabold text-[11px] block truncate">{task.title}</span>
                            <span className="text-[9px] font-mono text-slate-500 block">
                              {task.reminderTime || 'Whole Day'} • {task.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {deleteTask && (
                          <button
                            onClick={() => {
                              playSynthSound('alert');
                              deleteTask(task.id);
                              triggerAlert('Task removed');
                            }}
                            className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COMPLETED TASKS SECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest border-b border-slate-900 pb-1">
                  <span>🎯 Completed Milestones ({doneTasks.length})</span>
                </div>

                {doneTasks.length === 0 ? (
                  <div className="py-6 text-center text-slate-600 bg-black/25 border border-dashed border-slate-900 rounded-2xl text-[9px]">
                    No completed milestones recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                    {doneTasks.map(task => (
                      <div 
                        key={task.id}
                        className="p-3 rounded-xl bg-slate-950 border border-emerald-950/40 flex items-center justify-between gap-2.5 opacity-65"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleTaskStatus(task)}
                            className="w-4 h-4 rounded border border-emerald-500 bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0"
                          >
                            ✓
                          </button>

                          <div className="min-w-0">
                            <span className="text-slate-400 font-bold text-[11px] block line-through truncate">{task.title}</span>
                            <span className="text-[8px] font-mono text-slate-600 block">
                              Cleared
                            </span>
                          </div>
                        </div>

                        {deleteTask && (
                          <button
                            onClick={() => {
                              playSynthSound('alert');
                              deleteTask(task.id);
                              triggerAlert('Task removed');
                            }}
                            className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* SUPER-PREMIUM FUTURE-STYLISH CUSTOMER BOOKING DIALOG/MODAL */}
      {isBooking && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-8 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] animate-fade-in space-y-6 relative overflow-hidden">
            
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 to-indigo-600" />

            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-cyan-400 font-black block">SECURE REGISTRATION CHANNEL</span>
                <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 tracking-tight flex items-center gap-2 mt-1">
                  <Sparkles size={18} className="text-amber-400 animate-spin" />
                  Reserve Quantum Queue Slot
                </h3>
              </div>
              <button 
                onClick={() => { playSynthSound('click'); setIsBooking(false); }}
                className="p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* HIGH-TECH WIZARD STEP INDICATORS */}
            <div className="flex justify-between items-center bg-black/40 p-3.5 rounded-2xl border border-slate-900/60 font-mono text-[9px] uppercase tracking-wider">
              <div className={`flex items-center gap-1.5 font-bold transition-all ${bookingStep === 0 ? 'text-cyan-400 font-black' : 'text-slate-600'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] ${bookingStep === 0 ? 'border-cyan-400 bg-cyan-400/10' : 'border-slate-800'}`}>1</span>
                <span>Select Service</span>
              </div>
              <div className="h-[1px] w-6 bg-slate-900" />
              <div className={`flex items-center gap-1.5 font-bold transition-all ${bookingStep === 1 ? 'text-[#00f2fe] font-black' : 'text-slate-600'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] ${bookingStep === 1 ? 'border-cyan-400 bg-cyan-400/10' : 'border-slate-800'}`}>2</span>
                <span>Temporal Slot</span>
              </div>
              <div className="h-[1px] w-6 bg-slate-900" />
              <div className={`flex items-center gap-1.5 font-bold transition-all ${bookingStep === 2 ? 'text-emerald-400 font-black' : 'text-slate-600'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] ${bookingStep === 2 ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-800'}`}>3</span>
                <span>Verification</span>
              </div>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              
              {/* STEP 1: SELECT CENTRAL CSC SERVICE CATEGORY */}
              {bookingStep === 0 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center pb-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">STEP 01 OF 03</span>
                    <h4 className="text-sm font-black text-slate-100 uppercase mt-0.5">Select Service Platform</h4>
                    <p className="text-[10px] text-slate-400">Choose one of the authorized central citizens services below to synchronize.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {servicesList.map((s) => {
                      const serviceMetadata: { [key: string]: { description: string; icon: any; color: string } } = {
                        '🆔 Aadhaar Services': { description: 'New UIDAI enrollment, biometrics & address synchronization.', icon: UserCheck, color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400' },
                        '💳 PAN Card Services': { description: 'NSDL applications, core corrections & instant e-PAN generation.', icon: Receipt, color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400' },
                        '🗳️ Voter Card Services': { description: 'NVSP portal links, photo correction & offline Epic deliveries.', icon: CheckSquare, color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400' },
                        '📕 Passport Services': { description: 'Fresh application registrations, payments & slot appointments.', icon: Shield, color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400' },
                        '🏦 Banking Services': { description: 'AEPS withdrawals, deposits, account linkings & mini-statements.', icon: Layers, color: 'from-indigo-500/20 to-cyan-500/10 border-indigo-500/30 text-indigo-400' },
                        '💰 Money Transfer': { description: 'Instant DMT/IMPS transfer securely to any nationalized bank.', icon: Receipt, color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400' },
                        '🚆 Train Ticket Services': { description: 'IRCTC booking agent, reservation queues & instant PNR status.', icon: Play, color: 'from-orange-500/20 to-red-500/10 border-orange-500/30 text-orange-400' },
                        '✈️ Flight Ticket Services': { description: 'Domestic & international flight reservations with optimal rates.', icon: Play, color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400' },
                        '🖨️ Print & Xerox': { description: 'High-speed high-definition digital printouts & color copying.', icon: MessageSquare, color: 'from-slate-500/20 to-slate-400/10 border-slate-500/30 text-slate-300' },
                        '✨ Others (Specify task)': { description: 'Custom specialized task not indexed above. Enter specifications.', icon: Sparkles, color: 'from-yellow-400/20 to-amber-500/10 border-yellow-500/30 text-yellow-400' }
                      };

                      const meta = serviceMetadata[s] || { description: 'Custom citizens request operation', icon: Sparkles, color: 'from-slate-500/10 to-slate-400/10 border-slate-500/30 text-slate-300' };
                      const IconComponent = meta.icon;
                      const checkBlocked = checkServiceAvailability(s);
                      const isBlocked = !checkBlocked.available;

                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            if (isBlocked) {
                              playSynthSound('alert');
                              setOfflineServiceError(checkBlocked.message);
                            } else {
                              setServiceType(s);
                              playSynthSound('click');
                              if (s !== '✨ Others (Specify task)') {
                                playSynthSound('laser');
                                setBookingStep(1);
                              }
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-28 relative group transition-all duration-300 ${
                            isBlocked 
                              ? 'bg-red-950/20 border-red-900/40 opacity-60 cursor-not-allowed' 
                              : serviceType === s
                                ? 'bg-gradient-to-tr ' + meta.color.split(' ')[0] + ' ' + meta.color.split(' ')[1] + ' border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-[1.02]'
                                : 'bg-black/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/35'
                          }`}
                        >
                          {isBlocked && (
                            <span className="absolute top-2.5 right-2.5 text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 flex items-center gap-1 font-black uppercase">
                              <Lock size={8} /> Blocked
                            </span>
                          )}
                          
                          <div className={`p-1.5 rounded-lg w-fit ${isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-slate-900 text-cyan-400'}`}>
                            <IconComponent size={14} className={isBlocked ? '' : meta.color.split(' ')[2]} />
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[11px] font-black text-slate-200 block truncate group-hover:text-white transition-colors">{s}</span>
                            <span className="text-[9px] text-slate-500 block leading-tight truncate-2-lines">{meta.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {serviceType === '✨ Others (Specify task)' && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5 animate-fade-in">
                      <label className="text-[9px] uppercase tracking-wider text-amber-400 font-extrabold block">Specify Custom Citizens Operation *</label>
                      <input
                        type="text"
                        value={customService}
                        onChange={(e) => setCustomService(e.target.value)}
                        placeholder="E.g. Digital Life Certificate renewal..."
                        className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-amber-500/40 bg-black text-slate-200 focus:outline-none focus:border-cyan-400 placeholder-slate-800"
                      />
                      <button
                        type="button"
                        disabled={!customService.trim()}
                        onClick={() => { playSynthSound('laser'); setBookingStep(1); }}
                        className="w-full py-2 bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-black rounded-lg text-[9px] uppercase tracking-widest hover:scale-102 active:scale-98 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Confirm & Continue
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: TEMPORAL SPACE RESERVATION & REAL-TIME VALIDATOR */}
              {bookingStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center pb-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">STEP 02 OF 03</span>
                    <h4 className="text-sm font-black text-slate-100 uppercase mt-0.5">Reserve Chrono-Temporal Slot</h4>
                    <p className="text-[10px] text-slate-400">Synchronize appointment parameters with physical matrix schedule.</p>
                  </div>

                  {/* CUSTOM DATE MATRIX PRESYNC DECK */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-widest block">Select Operating Date</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: 'Today', dateStr: '2026-06-24', day: 'Wed' },
                        { label: 'Tomorrow', dateStr: '2026-06-25', day: 'Thu' },
                        { label: 'Fri', dateStr: '2026-06-26', day: 'Fri' },
                        { label: 'Sat', dateStr: '2026-06-27', day: 'Sat' },
                        { label: 'Sun', dateStr: '2026-06-28', day: 'Sun' }
                      ].map((p) => (
                        <button
                          key={p.dateStr}
                          type="button"
                          onClick={() => { playSynthSound('click'); setDate(p.dateStr); }}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            date === p.dateStr
                              ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                              : 'bg-black/40 border-slate-900 text-slate-500 hover:border-slate-800'
                          }`}
                        >
                          <span className="text-[8px] uppercase font-black block tracking-wider">{p.label}</span>
                          <span className="text-xs font-mono font-black block mt-0.5">{p.dateStr.split('-')[2]}</span>
                          <span className="text-[8px] text-slate-600 block mt-0.5">{p.day}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Fallback traditional selector with sci-fi frame */}
                    <div className="pt-1 flex items-center justify-between gap-4">
                      <span className="text-[8px] uppercase text-slate-600 font-bold">Or select other manual dates:</span>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-black border border-slate-800 px-2.5 py-1 rounded-xl text-[10px] font-mono text-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* INTERACTIVE TIMEPOCKETS GRID */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-widest block font-black">Select Available Time Window</label>
                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1.5 custom-scrollbar">
                      {slots.map((s) => {
                        // Check database booking status
                        const occupiedApp = appointments.find(a => a.date === date && a.timeSlot === s && a.status !== 'Cancelled' && a.status !== 'Rejected');
                        const isOccupied = !!occupiedApp;
                        
                        // Check Sifra AI lock
                        const blockedTask = (tasks || []).find(t => {
                          if (!t.blockAppointments) return false;
                          if (t.dueDate !== date) return false;
                          if (!t.reminderTime) return true;
                          const blockTimeStr = t.reminderTime.toLowerCase().trim();
                          const currentSlotStr = s.toLowerCase().trim();
                          return currentSlotStr.includes(blockTimeStr) || blockTimeStr.includes(currentSlotStr);
                        });
                        const isBlockedByAI = !!blockedTask;

                        let btnStyle = 'border-slate-850 text-slate-300 bg-black/60 hover:border-cyan-500/50';
                        if (timeSlot === s) {
                          btnStyle = 'border-[#00f2fe] bg-cyan-500/10 text-[#00f2fe] shadow-[0_0_12px_rgba(0,242,254,0.15)]';
                        } else if (isOccupied) {
                          btnStyle = 'border-rose-950/40 text-rose-500 bg-rose-950/10 line-through';
                        } else if (isBlockedByAI) {
                          btnStyle = 'border-amber-950/50 text-amber-500 bg-amber-950/10 border-dashed';
                        }

                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              playSynthSound('click');
                              setTimeSlot(s);
                            }}
                            className={`p-2.5 rounded-xl border text-left flex justify-between items-center transition-all ${btnStyle}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Clock size={11} className={timeSlot === s ? 'text-[#00f2fe]' : isOccupied ? 'text-rose-500' : 'text-slate-500'} />
                              <span className="font-mono text-[10px] font-bold">{s}</span>
                            </div>
                            
                            {isOccupied ? (
                              <span className="text-[7px] uppercase bg-rose-500/20 text-rose-400 px-1 rounded font-black">Taken</span>
                            ) : isBlockedByAI ? (
                              <span className="text-[7px] uppercase bg-amber-500/20 text-amber-400 px-1 rounded flex items-center gap-0.5 font-black"><Lock size={6} /> AI Lock</span>
                            ) : (
                              <span className="text-[7px] uppercase bg-emerald-500/25 text-emerald-400 px-1 rounded font-black">Free</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* REAL-TIME CHRONO MATRIX VALIDATOR STATUS CARD */}
                  {(() => {
                    const occupiedApp = appointments.find(a => a.date === date && a.timeSlot === timeSlot && a.status !== 'Cancelled' && a.status !== 'Rejected');
                    const isOccupied = !!occupiedApp;
                    const blockedTask = (tasks || []).find(t => {
                      if (!t.blockAppointments) return false;
                      if (t.dueDate !== date) return false;
                      if (!t.reminderTime) return true;
                      const blockTimeStr = t.reminderTime.toLowerCase().trim();
                      const currentSlotStr = timeSlot.toLowerCase().trim();
                      return currentSlotStr.includes(blockTimeStr) || blockTimeStr.includes(currentSlotStr);
                    });
                    const isBlockedByAI = !!blockedTask;
                    const suggestedSlot = slots.find(s => !appointments.some(a => a.date === date && a.timeSlot === s && a.status !== 'Cancelled' && a.status !== 'Rejected'));

                    return (
                      <div className={`p-4 rounded-2xl border text-[10px] space-y-1.5 transition-all duration-300 ${
                        isOccupied
                          ? 'bg-rose-500/5 border-rose-500/30 text-rose-300'
                          : isBlockedByAI
                            ? 'bg-amber-500/5 border-amber-500/30 text-amber-300'
                            : 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          {isOccupied ? (
                            <ShieldAlert size={14} className="text-rose-400 shrink-0" />
                          ) : isBlockedByAI ? (
                            <Lock size={12} className="text-amber-400 shrink-0" />
                          ) : (
                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0 animate-bounce" />
                          )}
                          <span className="font-extrabold uppercase tracking-wider">DATABASE INTEGRITY STATUS</span>
                        </div>
                        
                        <p className="leading-relaxed font-sans text-[10px] opacity-90">
                          {isOccupied && `⚠️ COLLISION DETECTED: This slot is booked by "${occupiedApp.name}" (Token: ${occupiedApp.tokenNumber}). Continuing will create duplicate queues.`}
                          {isBlockedByAI && `🛑 AI CALENDAR LOCK: Sifra AI reserved this slot for "${blockedTask.title}". System authorization will override.`}
                          {!isOccupied && !isBlockedByAI && `✅ TEMPORAL SLOT AVAILABLE: Chrono-Matrix verified. 0 active collisions found. Ready for instant reservation.`}
                        </p>

                        {isOccupied && suggestedSlot && (
                          <div className="pt-1.5 border-t border-rose-950/40 flex justify-between items-center">
                            <span>Next empty slot on {date}:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setTimeSlot(suggestedSlot);
                                playSynthSound('success');
                                triggerAlert(`Chrono-Matrix synchronized to suggested slot: ${suggestedSlot}`);
                              }}
                              className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 hover:bg-amber-500/30 transition-all font-black text-[8px] uppercase tracking-wider"
                            >
                              ⚡ Switch to {suggestedSlot.split(' ')[0]}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* NAVIGATION ROW */}
                  <div className="flex gap-3 justify-between pt-2 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => { playSynthSound('click'); setBookingStep(0); }}
                      className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft size={13} /> Back to Services
                    </button>
                    <button
                      type="button"
                      onClick={() => { playSynthSound('laser'); setBookingStep(2); }}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5"
                    >
                      <span>Next: Customer Details</span> <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CUSTOMER IDENTITY CREDENTIALS */}
              {bookingStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center pb-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">STEP 03 OF 03</span>
                    <h4 className="text-sm font-black text-slate-100 uppercase mt-0.5">Biometric Identity & Verification</h4>
                    <p className="text-[10px] text-slate-400">Enter citizen credentials and document verification notes to complete token issuance.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold block">Citizen Full Name *</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Sumit Sen"
                            className="w-full text-xs font-bold py-2.5 pl-8 pr-3 rounded-xl border border-slate-800 bg-black text-[#e2e8f0] focus:outline-none focus:border-cyan-400 placeholder-slate-800"
                          />
                          <User size={13} className="absolute left-3 top-3.5 text-slate-600" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold block">Temporal Comm Line *</label>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="9876543210"
                            className="w-full text-xs font-bold py-2.5 pl-8 pr-3 rounded-xl border border-slate-800 bg-black text-[#e2e8f0] focus:outline-none focus:border-cyan-400 placeholder-slate-800"
                          />
                          <Phone size={13} className="absolute left-3 top-3.5 text-slate-600" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold block">Location Address (Optional)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Kolkata, WB, India"
                          className="w-full text-xs font-bold py-2.5 pl-8 pr-3 rounded-xl border border-slate-800 bg-black text-[#e2e8f0] focus:outline-none focus:border-cyan-400 placeholder-slate-800"
                        />
                        <MapPin size={13} className="absolute left-3 top-3.5 text-slate-600" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold block">Documents & Requirements Verification Checklist</label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Bring physical voter ID card, 2 passport size color photographs, active mobile phone for OTP verification..."
                        className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-black text-[#e2e8f0] focus:outline-none focus:border-cyan-400 resize-none placeholder-slate-800 font-sans leading-relaxed text-[11px]"
                      />
                    </div>
                  </div>

                  {/* CORE COMPLIANCE VALIDATOR BAR */}
                  <div className="p-3 rounded-2xl bg-[#030712] border border-cyan-500/10 flex items-center justify-between text-[8px] uppercase tracking-wider font-mono">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Wifi size={10} className="text-emerald-400 animate-pulse" />
                      Chrono-Comms Status: ONLINE
                    </span>
                    <span className="text-[#00f2fe] font-black">
                      TOKEN SYSTEM VALIDATED
                    </span>
                  </div>

                  {/* NAVIGATION & SUBMIT ACTIONS */}
                  <div className="flex gap-3 justify-between pt-2 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => { playSynthSound('click'); setBookingStep(1); }}
                      className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft size={13} /> Back to Schedule
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5"
                    >
                      <span>🔒 Issue Secure Token & Book</span> <CheckCircle2 size={14} className="stroke-[3]" />
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

      {/* SERVICE OFFLINE/WARNING HOLOGRAPHIC MODAL */}
      {offlineServiceError && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-950 border border-rose-500/40 shadow-[0_0_50px_rgba(239,68,68,0.25)] space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto animate-bounce">
              <ShieldAlert size={24} />
            </div>

            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-rose-400 font-black">ACCESS DEACTIVATED BY CEO</span>
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-tight">সার্ভিস লকড / Service Offline</h3>
              <p className="text-slate-400 text-xs leading-relaxed mt-1 font-sans">
                {offlineServiceError}
              </p>
            </div>

            <button
              onClick={() => { playSynthSound('click'); setOfflineServiceError(null); }}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
            >
              Understand & Acknowledge
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
