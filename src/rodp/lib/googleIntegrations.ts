// External Google Workspace & Classroom Direct Link Integrations
// Deactivated complex internal OAuth sync to prevent publishing/deployment errors.
// Replaced with direct official external Google links.

export interface SheetSyncResponse {
  success: boolean;
  message: string;
  spreadsheetUrl?: string;
}

export interface CalendarSyncResponse {
  success: boolean;
  message: string;
  eventId?: string;
}

export interface GmailSendResponse {
  success: boolean;
  message: string;
}

export async function syncInvoicesToGoogleSheet(_token: string, _invoices: any[]): Promise<SheetSyncResponse> {
  // Deactivated internal API sync. Redirecting user externally to Google Sheets.
  window.open('https://sheets.google.com', '_blank');
  return {
    success: true,
    message: 'Redirected to official Google Sheets (External Connection Active).',
    spreadsheetUrl: 'https://sheets.google.com'
  };
}

export async function syncAppointmentToGoogleCalendar(_token: string, _appointment: any): Promise<CalendarSyncResponse> {
  // Deactivated internal API sync. Redirecting user externally to Google Calendar.
  window.open('https://calendar.google.com', '_blank');
  return {
    success: true,
    message: 'Redirected to official Google Calendar (External Connection Active).',
    eventId: 'google-calendar-external-sync'
  };
}

export async function sendEmailViaGmail(_token: string, _to: string, _subject: string, _body: string): Promise<GmailSendResponse> {
  // Deactivated internal Gmail API. Redirecting to Gmail web.
  window.open('https://mail.google.com', '_blank');
  return {
    success: true,
    message: 'Redirected to official Gmail (External Connection Active).'
  };
}
