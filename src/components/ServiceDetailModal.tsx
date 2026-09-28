import React, { useEffect, useState } from 'react';
import { X, Check, Mail, Send } from 'lucide-react';
import { ServiceItem, UserMessage } from '../types';

interface ServiceDetailModalProps {
  services: ServiceItem[];
  onAddMessage: (msg: Omit<UserMessage, 'id' | 'date' | 'isImportant' | 'isRead'>) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ services, onAddMessage }) => {
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const service = (e as CustomEvent).detail as ServiceItem;
      setActiveService(service);
      setIsSuccess(false);
    };

    const root = document.getElementById('service-detail-modal-root');
    if (root) {
      root.addEventListener('open-service', handleOpen);
    }

    return () => {
      if (root) {
        root.removeEventListener('open-service', handleOpen);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !activeService) return;

    onAddMessage({
      senderName: userName,
      senderEmail: userEmail,
      subject: `Project Inquiry: ${activeService.name}`,
      category: 'Inquiry',
      message: `Client requested quote for [${activeService.name}] listed under ${activeService.category}.\n\nNotes:\n${bookingNote || 'N/A'}`
    });

    setIsSuccess(true);
    setTimeout(() => {
      setActiveService(null);
      setUserName('');
      setUserEmail('');
      setBookingNote('');
      setIsSuccess(false);
    }, 3000);
  };

  if (!activeService) {
    return <div id="service-detail-modal-root" className="hidden" />;
  }

  return (
    <div 
      id="service-detail-modal-root" 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={() => setActiveService(null)}
    >
      <div 
        className="glassmorphic-card w-full max-w-xl rounded-3xl border border-white/10 bg-[#08051e] p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="space-y-1">
            <span className="font-mono text-[9px] text-[#22d3ee] uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/10">
              {activeService.category}
            </span>
            <h3 className="font-sora text-xl md:text-2xl font-extrabold text-white">
              {activeService.name} Specification
            </h3>
          </div>
          <button 
            onClick={() => setActiveService(null)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300 text-xs md:text-sm font-light leading-relaxed">
            {activeService.description}
          </p>

          <div className="space-y-2.5">
            <h4 className="font-sora text-xs font-bold text-rose-400 uppercase tracking-wider">
              Diagnostic Scope & Deliverables
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeService.deliverables.map((deliv, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                  <Check size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{deliv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Appointment / quote form */}
        <div className="border-t border-white/5 pt-6 space-y-4">
          <h4 className="font-sora text-xs font-bold text-[#be123c] uppercase tracking-wider">
            Request Cost Matrix & Scope Evaluation
          </h4>

          {isSuccess ? (
            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 mx-auto flex items-center justify-center text-emerald-400">
                <Check size={24} className="animate-pulse" />
              </div>
              <p className="font-sora text-sm font-bold text-white">Inquiry Cataloged Successfully</p>
              <p className="font-mono text-[10px] text-gray-400">Rizwan's neural workspace will transmit evaluate hashes shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-gray-500 uppercase">Sender Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="E.g., Dr. Foster"
                    id="service-booking-form-name"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white focus:outline-none focus:border-[#be123c]/50 focus:bg-white/[0.04]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-gray-500 uppercase">Secure Email</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="diagnostic@foster.com"
                    id="service-booking-form-email"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white focus:outline-none focus:border-[#be123c]/50 focus:bg-white/[0.04]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[9px] text-gray-500 uppercase">Integration Briefing / Scope requirements</label>
                <textarea
                  rows={2}
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  placeholder="Note specific parameters, APIs, or launch window targets..."
                  id="service-booking-form-notes"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white focus:outline-none focus:border-[#be123c]/50 focus:bg-white/[0.04] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-700 via-[#be123c] to-amber-600 font-mono text-xs font-bold text-white uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/20"
              >
                <Send size={12} />
                Transmit Scope Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
