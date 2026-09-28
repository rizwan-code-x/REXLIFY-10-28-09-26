import { auth, isFirebaseAvailable } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// In-memory token cache
let cachedAccessToken: string | null = null;
let googleUser: any = null;

export function getCachedToken() {
  return cachedAccessToken;
}

export function setCachedToken(token: string | null) {
  cachedAccessToken = token;
}

export function getGoogleUser() {
  return googleUser;
}

// Sign in with Google and request Google Drive File scope
export async function connectGoogleDrive(): Promise<{ user: any; accessToken: string }> {
  if (!isFirebaseAvailable || !auth) {
    throw new Error('Firebase Authentication is not available.');
  }

  const provider = new GoogleAuthProvider();
  // Request scopes for Google Drive, Sheets, Calendar and Gmail send
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  provider.addScope('https://www.googleapis.com/auth/gmail.send');
  provider.addScope('https://www.googleapis.com/auth/contacts');

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (!token) {
      throw new Error('Failed to retrieve Google Access Token from Authentication popup.');
    }

    cachedAccessToken = token;
    googleUser = result.user;

    // Save token state in session storage for refreshing session (not persistent across tabs/reloads as requested, but session safe)
    sessionStorage.setItem('rodp_gdrive_connected', 'true');
    
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Error connecting to Google Drive:', error);
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error(`Your application domain is not authorized in Firebase. Please go to Firebase Console > Authentication > Settings > Authorized Domains, and add this URL: ${window.location.hostname}`);
    }
    throw error;
  }
}

export function disconnectGoogleDrive() {
  cachedAccessToken = null;
  googleUser = null;
  sessionStorage.removeItem('rodp_gdrive_connected');
}

// Drive API Helpers
async function handleResponseError(response: Response, defaultMessage: string): Promise<never> {
  let detail = '';
  try {
    const json = await response.json();
    if (json?.error?.message) {
      detail = json.error.message;
    } else {
      detail = JSON.stringify(json);
    }
  } catch {
    try {
      detail = await response.text();
    } catch {}
  }
  throw new Error(`${defaultMessage}: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`);
}

async function getOrCreateFolder(token: string, folderName: string, parentId?: string): Promise<string> {
  let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!searchRes.ok) {
    await handleResponseError(searchRes, 'Folder search failed');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const body: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentId) {
    body.parents = [parentId];
  }

  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!createRes.ok) {
    await handleResponseError(createRes, 'Folder creation failed');
  }

  const createData = await createRes.json();
  return createData.id;
}

async function uploadOrUpdateFile(token: string, parentFolderId: string, filename: string, contentObj: any): Promise<string> {
  const query = `name='${filename}' and '${parentFolderId}' in parents and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;
  
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  let fileId = '';
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      fileId = searchData.files[0].id;
    }
  } else {
    await handleResponseError(searchRes, 'File search failed');
  }

  const contentStr = JSON.stringify(contentObj, null, 2);

  if (fileId) {
    // PATCH content (Media update)
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: contentStr
    });

    if (!updateRes.ok) {
      await handleResponseError(updateRes, 'File content update failed');
    }
    return fileId;
  } else {
    // 1. Create File Metadata
    const createMetaUrl = 'https://www.googleapis.com/drive/v3/files';
    const metaRes = await fetch(createMetaUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: filename,
        mimeType: 'application/json',
        parents: [parentFolderId]
      })
    });

    if (!metaRes.ok) {
      await handleResponseError(metaRes, 'File metadata creation failed');
    }

    const metaData = await metaRes.json();
    const newFileId = metaData.id;

    // 2. Upload Content
    const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${newFileId}?uploadType=media`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: contentStr
    });

    if (!uploadRes.ok) {
      await handleResponseError(uploadRes, 'File media upload failed');
    }

    return newFileId;
  }
}

export interface SyncStatus {
  success: boolean;
  message: string;
  timestamp: string;
  filesSynced: number;
}

// Master Sync function for Invoices, Customers, Security Logs, and Branches/Shops
export async function syncToGoogleDrive(
  token: string, 
  invoices: any[], 
  customers: any[],
  securityLogs: any[],
  shops: any[]
): Promise<SyncStatus> {
  try {
    // 1. Get or create root folder "RIZWAN_ONLINE_DREAMS_BACKUP"
    const rootFolderId = await getOrCreateFolder(token, 'RIZWAN_ONLINE_DREAMS_BACKUP');

    let filesSyncedCount = 0;

    // 2. Sync consolidated invoices summary
    await uploadOrUpdateFile(token, rootFolderId, 'invoices_backup.json', {
      platform: 'Rizwan Online Dreams Platform (RODP)',
      backupType: 'Invoices Backup',
      totalInvoices: invoices.length,
      syncedAt: new Date().toISOString(),
      data: invoices
    });
    filesSyncedCount++;

    // 3. Sync consolidated customers list
    await uploadOrUpdateFile(token, rootFolderId, 'customers_backup.json', {
      platform: 'Rizwan Online Dreams Platform (RODP)',
      backupType: 'Customers Backup',
      totalCustomers: customers.length,
      syncedAt: new Date().toISOString(),
      data: customers
    });
    filesSyncedCount++;

    // 4. Sync consolidated security logs
    await uploadOrUpdateFile(token, rootFolderId, 'security_logs_backup.json', {
      platform: 'Rizwan Online Dreams Platform (RODP)',
      backupType: 'Security Logs Backup',
      totalLogs: securityLogs.length,
      syncedAt: new Date().toISOString(),
      data: securityLogs
    });
    filesSyncedCount++;

    // 5. Sync consolidated branches/shops status
    await uploadOrUpdateFile(token, rootFolderId, 'branches_backup.json', {
      platform: 'Rizwan Online Dreams Platform (RODP)',
      backupType: 'Branches/Shops Backup',
      totalBranches: shops.length,
      syncedAt: new Date().toISOString(),
      data: shops
    });
    filesSyncedCount++;

    return {
      success: true,
      message: 'Successfully backed up and synchronized all data in Google Drive!',
      timestamp: new Date().toLocaleString(),
      filesSynced: filesSyncedCount
    };
  } catch (err: any) {
    console.error('Google Drive Sync error:', err);
    return {
      success: false,
      message: `Sync failed: ${err.message || err}`,
      timestamp: new Date().toLocaleString(),
      filesSynced: 0
    };
  }
}

export interface GoogleContact {
  name: string;
  mobile: string;
  email?: string;
}

export async function fetchGoogleContacts(token: string): Promise<GoogleContact[]> {
  try {
    const url = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers,emailAddresses&pageSize=1000';
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Google Contacts search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const contacts: GoogleContact[] = [];

    if (data.connections) {
      for (const person of data.connections) {
        const name = person.names?.[0]?.displayName || person.names?.[0]?.givenName || 'Unnamed Contact';
        const phoneNumbers = person.phoneNumbers || [];
        const emailAddresses = person.emailAddresses || [];
        const email = emailAddresses[0]?.value || '';

        if (phoneNumbers.length > 0) {
          for (const phone of phoneNumbers) {
            contacts.push({
              name,
              mobile: phone.value || '',
              email
            });
          }
        } else {
          contacts.push({
            name,
            mobile: '',
            email
          });
        }
      }
    }
    return contacts;
  } catch (err) {
    console.error('fetchGoogleContacts error:', err);
    throw err;
  }
}

export async function createGoogleContact(token: string, contact: { name: string; mobile: string; email?: string }): Promise<void> {
  try {
    const url = 'https://people.googleapis.com/v1/people:createContact';
    const body = {
      names: [
        {
          displayName: contact.name,
          givenName: contact.name
        }
      ],
      phoneNumbers: contact.mobile ? [
        {
          value: contact.mobile,
          type: 'mobile'
        }
      ] : [],
      emailAddresses: contact.email ? [
        {
          value: contact.email,
          type: 'home'
        }
      ] : []
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API responded with status ${response.status}: ${errorText}`);
    }
  } catch (err) {
    console.error('createGoogleContact error:', err);
    throw err;
  }
}

