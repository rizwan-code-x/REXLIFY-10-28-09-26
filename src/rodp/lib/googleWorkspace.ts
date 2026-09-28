/**
 * Google Workspace APIs Integration Client
 * Supports Google Sheets (Business Register), Google Calendar (Schedule Sync), and Gmail (Receipt Delivery)
 */

import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// In-memory caching for Access Token & State
let workspaceAccessToken: string | null = null;
let googleUser: any = null;

export function getWorkspaceToken() {
  return workspaceAccessToken;
}

export function setWorkspaceToken(token: string | null) {
  workspaceAccessToken = token;
}

export function getGoogleWorkspaceUser() {
  return googleUser;
}

/**
 * Connect to Google Workspace and acquire token with required scopes
 */
export async function connectGoogleWorkspace(): Promise<{ user: any; accessToken: string }> {
  const provider = new GoogleAuthProvider();
  
  // Scopes requested by the applet
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  provider.addScope('https://www.googleapis.com/auth/gmail.send');

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (!token) {
      throw new Error('Failed to retrieve Google Access Token from Authentication popup.');
    }

    workspaceAccessToken = token;
    googleUser = result.user;

    localStorage.setItem('rodp_workspace_connected', 'true');
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Error connecting to Google Workspace:', error);
    throw error;
  }
}

export function disconnectGoogleWorkspace() {
  workspaceAccessToken = null;
  googleUser = null;
  localStorage.removeItem('rodp_workspace_connected');
}

/**
 * GOOGLE SHEETS API HELPERS
 */

// Create a new centralized business register spreadsheet
export async function createBusinessSpreadsheet(token: string): Promise<string> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title: 'RODP Central Business Register' },
      sheets: [
        {
          properties: { title: 'Appointments' },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'Appointment ID' } },
                { userEnteredValue: { stringValue: 'Customer Name' } },
                { userEnteredValue: { stringValue: 'Mobile Number' } },
                { userEnteredValue: { stringValue: 'Service Type' } },
                { userEnteredValue: { stringValue: 'Date' } },
                { userEnteredValue: { stringValue: 'Time Slot' } },
                { userEnteredValue: { stringValue: 'Token Number' } },
                { userEnteredValue: { stringValue: 'Status' } },
                { userEnteredValue: { stringValue: 'Assigned Staff' } }
              ]
            }]
          }]
        },
        {
          properties: { title: 'Invoices' },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'Invoice ID' } },
                { userEnteredValue: { stringValue: 'Invoice Number' } },
                { userEnteredValue: { stringValue: 'Customer Name' } },
                { userEnteredValue: { stringValue: 'Customer Mobile' } },
                { userEnteredValue: { stringValue: 'Subtotal (₹)' } },
                { userEnteredValue: { stringValue: 'Discount (₹)' } },
                { userEnteredValue: { stringValue: 'Total Amount (₹)' } },
                { userEnteredValue: { stringValue: 'Payment Method' } },
                { userEnteredValue: { stringValue: 'Payment Status' } },
                { userEnteredValue: { stringValue: 'Created At' } }
              ]
            }]
          }]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create spreadsheet: ${response.statusText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  localStorage.setItem('rodp_workspace_spreadsheet_id', spreadsheetId);
  return spreadsheetId;
}

// Get or auto-create the spreadsheet ID
export async function getSpreadsheetId(token: string): Promise<string> {
  const cached = localStorage.getItem('rodp_workspace_spreadsheet_id');
  if (cached) return cached;
  return await createBusinessSpreadsheet(token);
}

// Append an appointment entry to the sheet
export async function appendAppointmentToSheet(token: string, appt: any): Promise<void> {
  try {
    const spreadsheetId = await getSpreadsheetId(token);
    const range = 'Appointments!A:I';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`;

    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [[
          appt.id || '',
          appt.name || '',
          appt.mobileNumber || '',
          appt.serviceType || '',
          appt.date || '',
          appt.timeSlot || '',
          appt.tokenNumber || '',
          appt.status || 'Pending',
          appt.assignedStaffId || 'None'
        ]]
      })
    });
  } catch (err) {
    console.error('Error appending appointment to Sheets:', err);
  }
}

// Append an invoice entry to the sheet
export async function appendInvoiceToSheet(token: string, invoice: any): Promise<void> {
  try {
    const spreadsheetId = await getSpreadsheetId(token);
    const range = 'Invoices!A:J';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`;

    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [[
          invoice.id || '',
          invoice.invoiceNumber || '',
          invoice.customerName || '',
          invoice.customerMobile || '',
          invoice.subtotal || 0,
          invoice.discountAmount || 0,
          invoice.totalAmount || 0,
          invoice.paymentMethod || 'Cash',
          invoice.paymentStatus || 'Paid',
          invoice.createdAt || ''
        ]]
      })
    });
  } catch (err) {
    console.error('Error appending invoice to Sheets:', err);
  }
}


/**
 * GOOGLE CALENDAR API HELPERS
 */

// Convert 12 hour AM/PM time slot to standard ISO strings for calendar events
function parseTimeSlotToIso(dateStr: string, timeSlotStr: string): { startIso: string; endIso: string } {
  // Safe default: 10:00 AM on dateStr
  let startHour = 10;
  let startMin = 0;
  let durationMinutes = 30;

  try {
    const parts = timeSlotStr.split(' - ');
    const startTimePart = parts[0]?.trim();
    if (startTimePart) {
      const match = startTimePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let hour = parseInt(match[1], 10);
        const min = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();

        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;

        startHour = hour;
        startMin = min;
      }
    }
  } catch (e) {
    console.warn('Error parsing time slot, defaulting to 10:00 AM:', e);
  }

  // Set times in India Standard Time (+05:30)
  const pad = (n: number) => String(n).padStart(2, '0');
  const startIso = `${dateStr}T${pad(startHour)}:${pad(startMin)}:00+05:30`;
  
  // Calculate end time
  let endHour = startHour;
  let endMin = startMin + durationMinutes;
  if (endMin >= 60) {
    endHour += Math.floor(endMin / 60);
    endMin = endMin % 60;
  }
  const endIso = `${dateStr}T${pad(endHour)}:${pad(endMin)}:00+05:30`;

  return { startIso, endIso };
}

// Add appointment to Google Calendar
export async function addAppointmentToCalendar(token: string, appt: any): Promise<void> {
  try {
    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    const { startIso, endIso } = parseTimeSlotToIso(appt.date, appt.timeSlot);

    const event = {
      summary: `RODP Appointment: ${appt.serviceType} - ${appt.name}`,
      description: `Appointment Token: ${appt.tokenNumber || 'N/A'}\nCustomer: ${appt.name}\nPhone: ${appt.mobileNumber}\nNotes: ${appt.notes || 'None'}\nCreated via RIZWAN ONLINE DREAMS PLATFORM (RODP)`,
      start: {
        dateTime: startIso,
        timeZone: 'Asia/Kolkata'
      },
      end: {
        dateTime: endIso,
        timeZone: 'Asia/Kolkata'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 120 }
        ]
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      console.error('Calendar Event error status:', response.statusText);
    }
  } catch (err) {
    console.error('Error adding Calendar event:', err);
  }
}


/**
 * GMAIL API SEND HELPERS
 */

// Send booking or invoice receipt via email
export async function sendGmailNotification(token: string, toEmail: string, subject: string, htmlMessage: string): Promise<boolean> {
  try {
    const url = 'https://www.googleapis.com/gmail/v1/users/me/messages/send';
    
    const emailParts = [
      `To: ${toEmail}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      `Subject: ${subject}`,
      '',
      htmlMessage
    ];

    const emailStr = emailParts.join('\r\n');
    
    // Base64Url encode standard rfc2822 mail body
    const base64UrlEncoded = btoa(unescape(encodeURIComponent(emailStr)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64UrlEncoded
      })
    });

    return response.ok;
  } catch (err) {
    console.error('Error sending email via Gmail API:', err);
    return false;
  }
}
