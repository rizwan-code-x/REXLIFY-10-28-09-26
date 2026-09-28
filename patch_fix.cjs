const fs = require('fs');

// Fix AdminLogin.tsx
let adminCode = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');
adminCode = adminCode.replace("import { ShieldCheck, Lock, Sparkles, KeyRound, AlertTriangle, Fingerprint, Users, Crown } from 'lucide-react';", "import { ShieldCheck, Lock, Sparkles, KeyRound, AlertTriangle, Fingerprint, Users, Crown, Brain } from 'lucide-react';");
fs.writeFileSync('src/components/AdminLogin.tsx', adminCode);

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
const offlineBannerCode = `
const OfflineBanner = () => {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-rose-500 text-white py-2 px-4 text-center text-xs font-mono font-bold tracking-widest uppercase shadow-[0_-5px_20px_rgba(244,63,94,0.4)] flex items-center justify-center gap-3 animate-slideUp">
      <AlertTriangle size={14} className="animate-pulse" />
      <span>অনুগ্রহ করে ইন্টারনেট কানেক্ট করুন (Offline Mode Active)</span>
    </div>
  );
};
`;

if (!appCode.includes("const OfflineBanner")) {
    appCode = appCode.replace("export const AppContent = () => {", offlineBannerCode + "\nexport const AppContent = () => {");
}

fs.writeFileSync('src/App.tsx', appCode);
