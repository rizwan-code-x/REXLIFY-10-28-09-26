const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const hookBlock = `
  const [sysStatus, setSysStatus] = useState({
    sifra: true,
    rexlify_ai: true,
    rodp: true,
    institute: true,
    neurax: true,
    global_maintenance: false
  });
  
  useEffect(() => {
    let rtdbInstance = null;
    import('../firebase-rexlify').then(async ({ rtdb }) => {
      if (!rtdb) return;
      rtdbInstance = rtdb;
      const statusRef = ref(rtdb, 'rexlify_system_status');
      onValue(statusRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setSysStatus(prev => ({ ...prev, ...val }));
        }
      });
    });
  }, []);

  const handleToggleSysStatus = async (key: string) => {
    const newValue = !sysStatus[key as keyof typeof sysStatus];
    try {
      const { rtdb } = await import('../firebase-rexlify');
      if (rtdb) {
        await set(ref(rtdb, 'rexlify_system_status/' + key), newValue);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };
`;

const componentStart = `export const AdminPanel: React.FC<AdminPanelProps> = ({`;
const componentEndIdx = code.indexOf('}) => {', code.indexOf(componentStart));
const componentAfter = code.indexOf('{', componentEndIdx) + 1;

code = code.substring(0, componentAfter) + "\\n" + hookBlock + "\\n" + code.substring(componentAfter);
code = code.replace(/\\n/g, '\n');

fs.writeFileSync('src/components/AdminPanel.tsx', code);
