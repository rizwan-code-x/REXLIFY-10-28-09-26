const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Extract the broken hook block
const hookBlockStart = "  const [sysStatus, setSysStatus] = useState({";
const hookBlockEnd = `      if (rtdb) {
        await set(ref(rtdb, 'rexlify_system_status/' + key), newValue);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };`;

const startIndex = code.indexOf(hookBlockStart);
const endIndex = code.indexOf(hookBlockEnd) + hookBlockEnd.length;

const hookBlock = code.substring(startIndex, endIndex);

// Remove it from the current location
code = code.replace(hookBlock, "");

// Insert it inside the component
const componentStart = `export const AdminPanel: React.FC<AdminPanelProps> = ({
  setView,
  applications,
  addApplication,
  updateApplication,
  deleteApplication,
  projects,
  addProject,
  updateProject,
  deleteProject,
  maintenanceMode,
  onUpdateMaintenanceMode,
  teamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  apkDownloadLink,
  onUpdateApkDownloadLink,
  customUiComponents,
  onUpdateCustomUiComponents,
  socialMediaLinks,
  onUpdateSocialMediaLinks,
  onLogout
}) => {`;

code = code.replace(componentStart, componentStart + "\n" + hookBlock);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
