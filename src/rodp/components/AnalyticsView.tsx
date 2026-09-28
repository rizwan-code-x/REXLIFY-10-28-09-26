import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  TrendingUp, IndianRupee, Users, Calendar, AlertCircle, Layers, BarChart4, 
  PieChart as PieIcon, LineChart as LineIcon, Plus, Download, ArrowLeft, 
  CheckCircle2, Clock, User, FileText, Phone, MapPin, Ban, Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Appointment, CustomerCRM, Invoice, FinanceRecord } from '../types';

interface AnalyticsViewProps {
  theme: 'light' | 'dark';
  appointments: Appointment[];
  customers: CustomerCRM[];
  invoices: Invoice[];
  finance: FinanceRecord[];
  addFinanceRecord?: (record: FinanceRecord) => void;
  deleteFinanceRecord?: (id: string) => void;
  updateCustomer?: (id: string, updates: any) => void;
  addCustomer?: (cust: CustomerCRM) => void;
  setCurrentTab?: (tab: string) => void;
}

export default function AnalyticsView({
  theme,
  appointments,
  customers,
  invoices,
  finance,
  addFinanceRecord,
  deleteFinanceRecord,
  updateCustomer,
  addCustomer,
  setCurrentTab
}: AnalyticsViewProps) {
  const todayStr = '2026-06-24';
  const currentMonthStr = '2026-06';

  const [activeSection, setActiveSection] = useState<'overview' | 'revenue' | 'pending' | 'completed' | 'approved' | 'rejected' | 'daily_ledger' | 'business_analysis'>('overview');
  const [selectedBusinessMonth, setSelectedBusinessMonth] = useState<string>('2026-06');
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Local state for daily ledger & discount options
  const [excludedRecordIds, setExcludedRecordIds] = useState<string[]>([]);
  const [selectedLedgerDate, setSelectedLedgerDate] = useState<string>(todayStr);
  
  // Custom transaction states
  const [newTxType, setNewTxType] = useState<'income' | 'expense'>('income');
  const [newTxCategory, setNewTxCategory] = useState<string>('CSC Service Charge');
  const [newTxAmount, setNewTxAmount] = useState<string>('');
  const [newTxDesc, setNewTxDesc] = useState<string>('');
  const [newTxDate, setNewTxDate] = useState<string>(todayStr);

  // Custom customer discount states
  const [discCustomerId, setDiscCustomerId] = useState<string>('');
  const [discCustomerName, setDiscCustomerName] = useState<string>('');
  const [discAmount, setDiscAmount] = useState<string>('');
  const [discPurpose, setDiscPurpose] = useState<string>('');
  const [discDate, setDiscDate] = useState<string>(todayStr);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // --- MATHEMATICAL SYSTEM (REAL OPERATIONS ONLY) ---
  const totalInvoicesRevenue = invoices
    .filter(i => i.paymentStatus === 'Paid' || i.paymentStatus === 'Partial')
    .reduce((sum, i) => sum + (i.paymentStatus === 'Partial' ? i.amountPaid || 0 : i.totalAmount), 0);

  const totalFinanceIncome = finance.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  const totalRevenue = totalInvoicesRevenue + totalFinanceIncome;

  const monthlyIncome = invoices
    .filter(i => i.createdAt.startsWith(currentMonthStr) && (i.paymentStatus === 'Paid' || i.paymentStatus === 'Partial'))
    .reduce((sum, i) => sum + (i.paymentStatus === 'Partial' ? i.amountPaid || 0 : i.totalAmount), 0) +
    finance.filter(f => f.date.startsWith(currentMonthStr) && f.type === 'income').reduce((sum, f) => sum + f.amount, 0);

  const totalOutstandingDues = invoices
    .filter(i => i.paymentStatus === 'Unpaid' || i.paymentStatus === 'Partial')
    .reduce((sum, i) => sum + (i.totalAmount - (i.paymentStatus === 'Partial' ? i.amountPaid || 0 : 0)), 0);

  const monthlyOutstandingDues = invoices
    .filter(i => i.createdAt.startsWith(currentMonthStr) && (i.paymentStatus === 'Unpaid' || i.paymentStatus === 'Partial'))
    .reduce((sum, i) => sum + (i.totalAmount - (i.paymentStatus === 'Partial' ? i.amountPaid || 0 : 0)), 0);

  const completedApps = appointments.filter(a => a.status === 'Completed');
  const approvedApps = appointments.filter(a => a.status === 'Approved');
  const rejectedApps = appointments.filter(a => a.status === 'Rejected');

  const todayIncome = invoices
    .filter(i => i.createdAt.startsWith(todayStr) && (i.paymentStatus === 'Paid' || i.paymentStatus === 'Partial'))
    .reduce((sum, i) => sum + (i.paymentStatus === 'Partial' ? i.amountPaid || 0 : i.totalAmount), 0) +
    finance.filter(f => f.date === todayStr && f.type === 'income').reduce((sum, f) => sum + f.amount, 0);

  const todayExpense = finance.filter(f => f.date === todayStr && f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
  const todayProfit = todayIncome - todayExpense;
  const hasAnyBusinessData = invoices.length > 0 || finance.length > 0;

  const chartTrendData = (() => {
    const dateMap: { [date: string]: { dateLabel: string; Income: number; Expense: number } } = {};
    invoices.forEach(inv => {
      const date = inv.createdAt.substring(0, 10);
      if (!dateMap[date]) dateMap[date] = { dateLabel: date.substring(5), Income: 0, Expense: 0 };
      if (inv.paymentStatus === 'Paid' || inv.paymentStatus === 'Partial') {
        dateMap[date].Income += inv.paymentStatus === 'Partial' ? inv.amountPaid || 0 : inv.totalAmount;
      }
    });
    finance.forEach(f => {
      if (!dateMap[f.date]) dateMap[f.date] = { dateLabel: f.date.substring(5), Income: 0, Expense: 0 };
      if (f.type === 'income') dateMap[f.date].Income += f.amount;
      else dateMap[f.date].Expense += f.amount;
    });
    return Object.keys(dateMap).sort().map(d => ({
      name: dateMap[d].dateLabel,
      Income: dateMap[d].Income,
      Expense: dateMap[d].Expense
    }));
  })();

  const categoryChartData = (() => {
    const counts: { [cat: string]: number } = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => { counts[item.name] = (counts[item.name] || 0) + item.quantity * item.price; });
    });
    const colors = ['#dfac5d', '#00f2fe', '#a855f7', '#3b82f6', '#10b981'];
    return Object.keys(counts).map((key, idx) => ({
      name: key.length > 15 ? key.substring(0, 15) + '...' : key,
      value: counts[key],
      fill: colors[idx % colors.length]
    }));
  })();

  // --- DAILY INCOME & EXPENSE LEDGER SYSTEM ---
  // Aggregate all transactions (bills + custom logs)
  const getAllDailyTransactions = () => {
    const list: any[] = [];

    // 1. Invoices (connected directly with Bill History)
    invoices.forEach(inv => {
      const date = inv.createdAt.substring(0, 10);
      const isExcluded = excludedRecordIds.includes(inv.id);
      const amount = inv.paymentStatus === 'Partial' ? (inv.amountPaid || 0) : inv.totalAmount;
      const purpose = inv.items.map(item => item.name).join(', ') || 'Digital Services';
      
      list.push({
        id: inv.id,
        source: 'bill',
        type: 'income',
        date,
        amount,
        purpose: `বিল জেনারেট (Bill) #${inv.invoiceNumber} - ${purpose}`,
        clientName: inv.customerName,
        isExcluded,
        originalRecord: inv
      });
    });

    // 2. Custom manual entries
    finance.forEach(f => {
      const isExcluded = excludedRecordIds.includes(f.id);
      list.push({
        id: f.id,
        source: 'manual',
        type: f.type, // 'income' | 'expense'
        date: f.date,
        amount: f.amount,
        purpose: f.description || f.category,
        clientName: f.category || 'Custom Ledger',
        isExcluded,
        originalRecord: f
      });
    });

    // 3. Customer Discounts given (automatically logged to daily report as out/expense)
    customers.forEach(cust => {
      if (cust.discounts) {
        cust.discounts.forEach(disc => {
          const isExcluded = excludedRecordIds.includes(disc.id);
          list.push({
            id: disc.id,
            source: 'discount',
            type: 'expense', // discounts represent reduction in revenue/amount out
            date: disc.date,
            amount: disc.amount,
            purpose: `ডিসকাউন্ট ছাড় (Discount) - ${disc.purpose}`,
            clientName: cust.name,
            isExcluded,
            originalRecord: disc
          });
        });
      }
    });

    return list;
  };

  const getAllDiscounts = () => {
    const list: any[] = [];
    customers.forEach(cust => {
      if (cust.discounts) {
        cust.discounts.forEach(disc => {
          list.push({
            id: disc.id,
            customerId: cust.id,
            clientName: cust.name,
            date: disc.date,
            amount: disc.amount,
            purpose: disc.purpose
          });
        });
      }
    });
    return list;
  };

  const allTx = getAllDailyTransactions();
  const allDiscs = getAllDiscounts();
  
  // All active dates with transactions
  const activeDates = Array.from(new Set([
    ...allTx.map(tx => tx.date),
    ...allDiscs.map(d => d.date)
  ])).sort((a, b) => b.localeCompare(a));

  // Monthly Report summary
  const getMonthlyReportSummary = (monthStr: string) => {
    const monthTx = allTx.filter(tx => tx.date.startsWith(monthStr) && !tx.isExcluded);
    const monthIncome = monthTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const monthExpense = monthTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const monthNet = monthIncome - monthExpense;

    const monthDiscs = allDiscs.filter(d => d.date.startsWith(monthStr));
    const monthDiscounts = monthDiscs.reduce((sum, d) => sum + d.amount, 0);

    return {
      income: monthIncome,
      expense: monthExpense,
      net: monthNet,
      discounts: monthDiscounts
    };
  };

  const handleDownloadDailyLedgerPDF = (date: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, 210, 42, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('RIZWAN ONLINE DREAMS PLATFORM', 15, 18);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(223, 172, 93);
    doc.text(`DAILY BUSINESS LEDGER REPORT: ${date}`, 15, 26);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('System Compiled Audit Log - Secure & Connected to Billing Database', 15, 32);
    
    // Day data
    const dayTx = allTx.filter(tx => tx.date === date);
    const dayDiscs = allDiscs.filter(d => d.date === date);
    
    const includedTx = dayTx.filter(tx => !tx.isExcluded);
    const dayIncome = includedTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const dayExpense = includedTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const dayNet = dayIncome - dayExpense;

    // Summary Cards in PDF
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, 48, 55, 22, 3, 3, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('INCLUDED INCOME', 20, 54);
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.text(`Rs. ${dayIncome.toFixed(2)}`, 20, 64);
    
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(77, 48, 55, 22, 3, 3, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('INCLUDED EXPENSE', 82, 54);
    doc.setFontSize(11);
    doc.setTextColor(239, 68, 68);
    doc.text(`Rs. ${dayExpense.toFixed(2)}`, 82, 64);
    
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(140, 48, 55, 22, 3, 3, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('NET BALANCE', 145, 54);
    doc.setFontSize(11);
    doc.setTextColor(dayNet >= 0 ? 16 : 239, dayNet >= 0 ? 185 : 68, dayNet >= 0 ? 129 : 68);
    doc.text(`Rs. ${dayNet.toFixed(2)}`, 145, 64);
    
    // Transactions Table
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Transactions Ledger Details', 15, 82);
    
    let y = 88;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    
    // Table Headers
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Type', 17, y + 5);
    doc.text('Client / Category', 38, y + 5);
    doc.text('Purpose / Description', 78, y + 5);
    doc.text('Status', 145, y + 5);
    doc.text('Amount', 175, y + 5);
    
    y += 8;
    doc.line(15, y, 195, y);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    
    if (dayTx.length === 0) {
      doc.setTextColor(100, 116, 139);
      doc.text('No transaction data logged on this date.', 17, y + 6);
      y += 10;
    } else {
      dayTx.forEach((tx) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        const typeStr = tx.type.toUpperCase();
        const statusStr = tx.isExcluded ? 'EXCLUDED' : 'ACTIVE';
        
        doc.setTextColor(tx.type === 'income' ? 16 : 239, tx.type === 'income' ? 150 : 68, tx.type === 'income' ? 80 : 68);
        doc.text(typeStr, 17, y + 5);
        
        doc.setTextColor(30, 41, 59);
        doc.text((tx.clientName || '').substring(0, 22), 38, y + 5);
        doc.text((tx.purpose || '').substring(0, 36), 78, y + 5);
        
        doc.setTextColor(tx.isExcluded ? 148 : 100, tx.isExcluded ? 163 : 116, tx.isExcluded ? 184 : 139);
        doc.text(statusStr, 145, y + 5);
        
        doc.setTextColor(tx.isExcluded ? 148 : (tx.type === 'income' ? 16 : 239), tx.isExcluded ? 163 : (tx.type === 'income' ? 150 : 68), tx.isExcluded ? 184 : (tx.type === 'income' ? 80 : 68));
        doc.text(`Rs. ${tx.amount.toFixed(2)}`, 175, y + 5);
        
        y += 7;
        doc.setDrawColor(241, 245, 249);
        doc.line(15, y, 195, y);
      });
    }
    
    // Discounts table
    if (dayDiscs.length > 0) {
      y += 10;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Discounts Granted Details', 15, y);
      
      y += 6;
      doc.setDrawColor(226, 232, 240);
      doc.line(15, y, 195, y);
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Customer Name', 17, y + 5);
      doc.text('Purpose / Remarks', 65, y + 5);
      doc.text('Discount Amount', 165, y + 5);
      
      y += 8;
      doc.line(15, y, 195, y);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      
      dayDiscs.forEach((d) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.text(d.clientName, 17, y + 5);
        doc.text(d.purpose, 65, y + 5);
        doc.setTextColor(168, 85, 247);
        doc.text(`Rs. ${d.amount.toFixed(2)}`, 165, y + 5);
        doc.setTextColor(30, 41, 59);
        
        y += 7;
        doc.setDrawColor(241, 245, 249);
        doc.line(15, y, 195, y);
      });
    }
    
    // Footer signature
    y += 15;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setDrawColor(200, 200, 200);
    doc.line(140, y + 10, 190, y + 10);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CEO Verification Signature', 142, y + 14);
    
    doc.save(`RODP_Daily_Ledger_${date}.pdf`);
    showToast(`✓ Daily ledger report downloaded successfully!`);
  };

  const handleDownloadMonthlyBusinessReportPDF = (monthStr: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, 210, 42, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('RIZWAN ONLINE DREAMS PLATFORM', 15, 18);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(223, 172, 93);
    doc.text(`MONTHLY BUSINESS PERFORMANCE STATEMENT: ${monthStr}`, 15, 26);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Official Monthly Business Ledger Audit Log - Verified & Compiled Safely', 15, 32);
    
    // Filter transactions for this month
    const monthTx = allTx.filter(tx => tx.date.startsWith(monthStr));
    const sortedMonthTx = [...monthTx].sort((a, b) => a.date.localeCompare(b.date));
    
    const includedTx = sortedMonthTx.filter(tx => !tx.isExcluded);
    const monthIncome = includedTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const monthExpense = includedTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const monthNet = monthIncome - monthExpense;

    // Summary Cards in PDF
    doc.setFillColor(240, 244, 248);
    doc.roundedRect(15, 48, 55, 22, 3, 3, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL INCOME (IN)', 20, 54);
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.text(`Rs. ${monthIncome.toFixed(2)}`, 20, 64);
    
    doc.setFillColor(240, 244, 248);
    doc.roundedRect(77, 48, 55, 22, 3, 3, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL EXPENSE (OUT)', 82, 54);
    doc.setFontSize(11);
    doc.setTextColor(239, 68, 68);
    doc.text(`Rs. ${monthExpense.toFixed(2)}`, 82, 64);
    
    doc.setFillColor(240, 244, 248);
    doc.roundedRect(140, 48, 55, 22, 3, 3, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('MONTH NET BALANCE', 145, 54);
    doc.setFontSize(11);
    doc.setTextColor(monthNet >= 0 ? 16 : 239, monthNet >= 0 ? 185 : 68, monthNet >= 0 ? 129 : 68);
    doc.text(`Rs. ${monthNet.toFixed(2)}`, 145, 64);
    
    // Transactions Table
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Monthly Ledger Statement Log', 15, 82);
    
    let y = 88;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    
    // Table Headers
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Date', 17, y + 5);
    doc.text('Customer/Source', 38, y + 5);
    doc.text('Amount In (আয়)', 85, y + 5);
    doc.text('Amount Out (ব্যয়)', 120, y + 5);
    doc.text('Purpose / Remarks', 150, y + 5);
    
    y += 8;
    doc.line(15, y, 195, y);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    
    if (sortedMonthTx.length === 0) {
      doc.setTextColor(100, 116, 139);
      doc.text('No ledger transaction data found for this month.', 17, y + 6);
      y += 10;
    } else {
      sortedMonthTx.forEach((tx) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
          
          // Print headers on new page
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text('Date', 17, y + 5);
          doc.text('Customer/Source', 38, y + 5);
          doc.text('Amount In (আয়)', 85, y + 5);
          doc.text('Amount Out (ব্যয়)', 120, y + 5);
          doc.text('Purpose / Remarks', 150, y + 5);
          y += 8;
          doc.line(15, y, 195, y);
          doc.setFont('Helvetica', 'normal');
        }
        
        doc.setTextColor(tx.isExcluded ? 150 : 30, tx.isExcluded ? 150 : 41, tx.isExcluded ? 150 : 59);
        
        // Date
        doc.text(tx.date, 17, y + 5);
        
        // Client/Source
        const clientLabel = tx.isExcluded ? `[EXCL] ${tx.clientName}` : tx.clientName;
        doc.text(clientLabel.substring(0, 22), 38, y + 5);
        
        // Amount In
        if (tx.type === 'income' && !tx.isExcluded) {
          doc.setTextColor(16, 185, 129);
          doc.text(`Rs. ${tx.amount.toFixed(2)}`, 85, y + 5);
        } else {
          doc.setTextColor(150, 150, 150);
          doc.text('-', 85, y + 5);
        }
        
        // Amount Out
        if (tx.type === 'expense' && !tx.isExcluded) {
          doc.setTextColor(239, 68, 68);
          doc.text(`Rs. ${tx.amount.toFixed(2)}`, 120, y + 5);
        } else {
          doc.setTextColor(150, 150, 150);
          doc.text('-', 120, y + 5);
        }
        
        // Purpose
        doc.setTextColor(tx.isExcluded ? 150 : 100, tx.isExcluded ? 150 : 116, tx.isExcluded ? 150 : 139);
        doc.text((tx.purpose || '').substring(0, 24), 150, y + 5);
        
        y += 7;
        doc.setDrawColor(241, 245, 249);
        doc.line(15, y, 195, y);
      });
    }
    
    // Footer signature
    y += 15;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setDrawColor(200, 200, 200);
    doc.line(140, y + 10, 190, y + 10);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CEO Verification Signature', 142, y + 14);
    
    doc.save(`RODP_Monthly_Report_${monthStr}.pdf`);
    showToast(`✓ Monthly business report PDF for ${monthStr} downloaded successfully!`);
  };

  // Dynamically map and fetch client profile
  const getCustomerProfile = (mobile: string, name: string) => {
    const cleanMob = mobile ? mobile.replace(/\s+/g, '').slice(-10) : '';
    const existing = customers.find(c => {
      const cMob = c.mobile ? c.mobile.replace(/\s+/g, '').slice(-10) : '';
      return (cleanMob && cMob === cleanMob) || c.name.toLowerCase() === name.toLowerCase();
    });

    const clientInvs = invoices.filter(i => {
      const iMob = i.customerMobile ? i.customerMobile.replace(/\s+/g, '').slice(-10) : '';
      return (cleanMob && iMob === cleanMob) || i.customerName.toLowerCase() === name.toLowerCase();
    });

    const clientAppts = appointments.filter(a => {
      const aMob = a.mobileNumber ? a.mobileNumber.replace(/\s+/g, '').slice(-10) : '';
      return (cleanMob && aMob === cleanMob) || a.name.toLowerCase() === name.toLowerCase();
    });

    const totalSpent = clientInvs.reduce((sum, i) => sum + (i.paymentStatus === 'Partial' ? i.amountPaid || 0 : i.totalAmount), 0);
    const totalDues = clientInvs.reduce((sum, i) => {
      if (i.paymentStatus === 'Paid') return sum;
      return sum + (i.totalAmount - (i.paymentStatus === 'Partial' ? i.amountPaid || 0 : 0));
    }, 0);

    return {
      name: existing?.name || name,
      mobile: existing?.mobile || mobile || 'N/A',
      email: existing?.email || 'N/A',
      address: existing?.address || 'Jalangi, West Bengal',
      status: existing?.status || 'active',
      totalSpending: totalSpent,
      totalDues,
      registeredAt: existing?.createdAt || clientInvs[0]?.createdAt || clientAppts[0]?.createdAt || '2026-06-24',
      invoices: clientInvs,
      appointments: clientAppts
    };
  };

  const handleDownloadPDF = () => {
    showToast('📥 Compiling PDF report...');
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 42, 'F');

      doc.setTextColor(223, 172, 93);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('RIZWAN ONLINE DREAMS PLATFORM', 15, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text('MONTHLY PERFORMANCE AUDIT REPORT', 15, 25);
      doc.text(`Generated: ${new Date().toLocaleString()} | Active Date: ${todayStr}`, 15, 30);

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('LEDGER AT A GLANCE', 140, 18);
      doc.setFontSize(8.5);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Total Revenue: INR ${totalRevenue.toLocaleString()}`, 140, 24);
      doc.text(`Pending Dues: INR ${totalOutstandingDues.toLocaleString()}`, 140, 29);
      doc.text(`Queue Tokens: ${appointments.length}`, 140, 34);

      // Section 1
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('1. CORE REVENUE & LEDGER ANALYSIS', 15, 52);
      doc.setDrawColor(223, 172, 93);
      doc.line(15, 54, 195, 54);

      doc.setFillColor(248, 250, 252);
      doc.rect(15, 58, 55, 22, 'F'); doc.rect(15, 58, 55, 22, 'D');
      doc.setFontSize(7); doc.setTextColor(100, 116, 139); doc.text('REVENUE ACCUMULATED', 17, 63);
      doc.setFontSize(11); doc.setTextColor(223, 172, 93); doc.text(`INR ${totalRevenue.toLocaleString()}`, 17, 72);

      doc.setFillColor(248, 250, 252);
      doc.rect(75, 58, 55, 22, 'F'); doc.rect(75, 58, 55, 22, 'D');
      doc.setFontSize(7); doc.setTextColor(100, 116, 139); doc.text('OUTSTANDING DUES', 77, 63);
      doc.setFontSize(11); doc.setTextColor(239, 68, 68); doc.text(`INR ${totalOutstandingDues.toLocaleString()}`, 77, 72);

      doc.setFillColor(248, 250, 252);
      doc.rect(135, 58, 60, 22, 'F'); doc.rect(135, 58, 60, 22, 'D');
      doc.setFontSize(7); doc.setTextColor(100, 116, 139); doc.text('COMPLETED QUEUES', 137, 63);
      doc.setFontSize(11); doc.setTextColor(15, 23, 42); doc.text(`${completedApps.length} Jobs Done`, 137, 72);

      // Section 2
      doc.setFont('Helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(15, 23, 42);
      doc.text('2. TOP DEMAND SERVICES SUMMARY', 15, 90);
      doc.line(15, 92, 195, 92);

      const serviceCounts: { [key: string]: { qty: number; revenue: number } } = {};
      invoices.forEach(inv => {
        inv.items.forEach(item => {
          if (!serviceCounts[item.name]) serviceCounts[item.name] = { qty: 0, revenue: 0 };
          serviceCounts[item.name].qty += item.quantity;
          serviceCounts[item.name].revenue += item.quantity * item.price;
        });
      });
      const sorted = Object.keys(serviceCounts).map(n => ({ name: n, ...serviceCounts[n] })).sort((a,b)=>b.revenue-a.revenue).slice(0, 5);

      let y = 96;
      doc.setFillColor(15, 23, 42); doc.rect(15, y, 180, 6, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.text('SERVICE TYPE', 17, y + 4.5); doc.text('QUANTITY', 120, y + 4.5); doc.text('SUBTOTAL', 160, y + 4.5);
      y += 6;
      doc.setFont('Helvetica', 'normal'); doc.setTextColor(15, 23, 42);
      sorted.forEach((srv, idx) => {
        if (idx % 2 === 1) { doc.setFillColor(248, 250, 252); doc.rect(15, y, 180, 6, 'F'); }
        doc.text(srv.name.substring(0, 48), 17, y + 4.5); doc.text(srv.qty.toString(), 120, y + 4.5); doc.text(`INR ${srv.revenue.toLocaleString()}`, 160, y + 4.5);
        y += 6;
      });

      // Section 3
      y += 4;
      doc.setFont('Helvetica', 'bold'); doc.setFontSize(11); doc.text('3. SUCCESSFUL CLEARANCES HISTORY (LATEST)', 15, y + 2);
      doc.line(15, y + 4, 195, y + 4);
      y += 8;
      doc.setFillColor(15, 23, 42); doc.rect(15, y, 180, 6, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.text('BILL NO', 17, y + 4.5); doc.text('CLIENT NAME', 45, y + 4.5); doc.text('METHOD', 115, y + 4.5); doc.text('PAID AMOUNT', 155, y + 4.5);
      y += 6;
      doc.setFont('Helvetica', 'normal'); doc.setTextColor(15, 23, 42);
      invoices.filter(i => i.paymentStatus === 'Paid' || i.paymentStatus === 'Partial').slice(0, 8).forEach((inv, idx) => {
        if (idx % 2 === 1) { doc.setFillColor(248, 250, 252); doc.rect(15, y, 180, 6, 'F'); }
        doc.text(inv.invoiceNumber, 17, y + 4.5); doc.text(inv.customerName.substring(0, 28), 45, y + 4.5); doc.text(inv.paymentMethod, 115, y + 4.5);
        const sum = inv.paymentStatus === 'Partial' ? inv.amountPaid || 0 : inv.totalAmount;
        doc.text(`INR ${sum.toLocaleString()}`, 155, y + 4.5);
        y += 6;
      });

      doc.setDrawColor(226, 232, 240); doc.line(15, 265, 195, 265);
      doc.setFontSize(7); doc.setTextColor(100, 116, 139);
      doc.text('Certified security auditing trail. Computed from real-time operational database logs.', 15, 270);
      doc.text('RIZWAN ROUSHAN (CEO), JALANGI DIGITAL CENTER HUB, WEST BENGAL', 15, 274);
      doc.save(`RODP_Monthly_Audit_Report_${new Date().toISOString().substring(0, 10)}.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const getRevenueItems = () => {
    const list: any[] = [];
    invoices.forEach(inv => {
      if (inv.paymentStatus === 'Paid' || inv.paymentStatus === 'Partial') {
        list.push({
          id: inv.id, source: 'Invoice', name: inv.customerName, mobile: inv.customerMobile,
          date: inv.createdAt.substring(0, 10), amount: inv.paymentStatus === 'Partial' ? inv.amountPaid || 0 : inv.totalAmount,
          method: inv.paymentMethod, details: `Bill: ${inv.invoiceNumber}`, status: inv.paymentStatus
        });
      }
    });
    finance.forEach(f => {
      if (f.type === 'income') {
        list.push({
          id: f.id, source: 'Manual Ledger', name: f.category || 'Direct Income', mobile: '',
          date: f.date, amount: f.amount, method: 'Cash/Other', details: f.description || 'Logged via ledger', status: 'Paid'
        });
      }
    });
    return list.sort((a,b) => b.date.localeCompare(a.date));
  };

  const getPendingDebtors = () => {
    return invoices.filter(i => i.paymentStatus === 'Unpaid' || i.paymentStatus === 'Partial').map(inv => {
      const due = inv.totalAmount - (inv.paymentStatus === 'Partial' ? inv.amountPaid || 0 : 0);
      return {
        id: inv.id, name: inv.customerName, mobile: inv.customerMobile, invoiceNumber: inv.invoiceNumber,
        date: inv.createdAt.substring(0, 10), totalAmount: inv.totalAmount, paidAmount: inv.paymentStatus === 'Partial' ? inv.amountPaid || 0 : 0,
        dueAmount: due, status: inv.paymentStatus
      };
    }).filter(x => x.dueAmount > 0).sort((a,b)=>b.date.localeCompare(a.date));
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold select-none">
      
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 font-extrabold flex items-center gap-2 shadow-[0_4px_30px_rgba(223,172,93,0.2)] animate-slide-in">
          <Sparkles size={16} className="text-[#00f2fe] animate-pulse" />
          <span>{feedback}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="p-8 rounded-3xl liquid-glass-panel glow-border-gold flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#dfac5d] text-[10px] tracking-widest uppercase font-extrabold flex items-center gap-1.5 mb-2 w-max shadow-[0_0_12px_rgba(223,172,93,0.15)]">
            <BarChart4 size={11} className="text-[#00f2fe]" /> Analytical Ledger Overview
          </span>
          <h1 className="text-3xl font-black text-gold-gradient tracking-tight">Business Analytics</h1>
          <p className="text-slate-400 text-xs font-medium mt-1">
            Real data-driven metrics compiled directly from active service operations and verified client bills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleDownloadPDF}
            className="px-5 py-3 bg-gradient-to-tr from-[#dfac5d] to-[#b88e3d] text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-[0_4px_20px_rgba(223,172,93,0.25)] flex items-center justify-center gap-2"
          >
            <Download size={13} className="stroke-[3] text-slate-950" />
            Monthly Business Report (PDF)
          </button>
          
          <div className="bg-[#050505]/60 p-3.5 rounded-xl border border-amber-500/15 text-center font-mono text-[9px] text-slate-400">
            <div>DATA INTEGRITY COORDINATE</div>
            <div className="text-emerald-400 font-extrabold mt-0.5">100% REAL & SECURED</div>
          </div>
        </div>
      </div>

      {/* CLIENT PROFILE CARD MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-[#050505]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0a0c10] border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(223,172,93,0.15)] max-h-[85vh] flex flex-col animate-scale-up">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-[#0a0c10] border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#dfac5d]">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#dfac5d] uppercase tracking-wide">{selectedProfile.name}</h3>
                  <p className="text-[9px] text-slate-500 font-mono">{selectedProfile.mobile}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProfile(null)} className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer p-2">✕</button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <span className="text-[9px] uppercase text-slate-500 block">Total Spent (মোট পরিশোধিত)</span>
                  <span className="text-xl font-black text-gold-gradient block mt-1">₹{selectedProfile.totalSpending.toLocaleString()}</span>
                </div>
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                  <span className="text-[9px] uppercase text-slate-500 block">Outstanding Due (বকেয়া পরিমাণ)</span>
                  <span className={`text-xl font-black block mt-1 ${selectedProfile.totalDues > 0 ? 'text-rose-400' : 'text-slate-400'}`}>₹{selectedProfile.totalDues.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#050505]/40 border border-slate-800 space-y-1.5 text-slate-300">
                <div className="flex items-center gap-1.5"><Phone size={10} /> <strong>Mobile:</strong> {selectedProfile.mobile}</div>
                <div className="flex items-center gap-1.5"><MapPin size={10} /> <strong>Address:</strong> {selectedProfile.address}</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-emerald-400" /> <strong>Standing:</strong> Active Operational Client</div>
              </div>

              {/* Bills list */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Billing History ({selectedProfile.invoices.length})</span>
                {selectedProfile.invoices.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No bill receipts logged.</p>
                ) : (
                  <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 max-h-40 overflow-y-auto">
                    {selectedProfile.invoices.map((inv: Invoice) => (
                      <div key={inv.id} className="p-3 bg-[#050505]/30 flex justify-between items-center text-[10px]">
                        <div>
                          <div className="font-extrabold text-slate-200">#{inv.invoiceNumber}</div>
                          <div className="text-[8px] text-slate-500">{inv.createdAt.substring(0,10)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-slate-200">₹{inv.totalAmount}</div>
                          <span className={`text-[8px] font-bold ${inv.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-rose-400'}`}>{inv.paymentStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABS LIST */}
      <div className="flex flex-wrap gap-2">
        {['overview', 'business_analysis', 'daily_ledger', 'revenue', 'pending', 'completed', 'approved', 'rejected'].map(sec => (
          <button
            key={sec}
            onClick={() => { setActiveSection(sec as any); setSelectedProfile(null); }}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer font-extrabold tracking-wider text-[9px] uppercase ${
              activeSection === sec
                ? 'bg-slate-900 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(223,172,93,0.15)]'
                : 'bg-[#0a0a0c]/40 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {sec === 'overview' 
              ? 'Ledger Overview' 
              : sec === 'business_analysis' 
                ? '💼 Business Analysis' 
                : sec === 'daily_ledger' 
                  ? 'Daily Ledger (ডেলি আয়-ব্যয়)' 
                  : sec === 'revenue' 
                    ? 'Successful Payments' 
                    : sec === 'pending' 
                      ? 'Pending Dues' 
                      : sec === 'completed' 
                        ? 'Completed Services' 
                        : sec === 'approved' 
                          ? 'Approved Queue' 
                          : 'CEO Rejections'}
          </button>
        ))}
      </div>

      {/* STATS CARDS GRID - FULLY CLICABLE ACCORDING TO REQUIREMENTS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Card 1: Revenue Clickable */}
        <div 
          onClick={() => { setActiveSection('revenue'); setSelectedProfile(null); }}
          className={`p-4 rounded-xl bg-[#0a0a0c]/80 border border-slate-800 flex flex-col justify-between h-36 hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(223,172,93,0.15)] transition-all cursor-pointer ${
            activeSection === 'revenue' ? 'ring-1 ring-amber-500 bg-slate-900/40' : ''
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">Total Revenue</span>
            <IndianRupee size={12} className="text-[#dfac5d]" />
          </div>
          <div>
            <span className="text-2xl font-black text-gold-gradient block">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="text-[8px] text-amber-400 block mt-1 underline">বিশদ এনালাইসিস ➔</span>
          </div>
        </div>

        {/* Card 2: Pending Clickable */}
        <div 
          onClick={() => { setActiveSection('pending'); setSelectedProfile(null); }}
          className={`p-4 rounded-xl bg-[#0a0a0c]/80 border border-slate-800 flex flex-col justify-between h-36 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] transition-all cursor-pointer ${
            activeSection === 'pending' ? 'ring-1 ring-rose-500 bg-slate-900/40' : ''
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">Pending Dues</span>
            <Clock size={12} className="text-rose-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-rose-400 block">₹{totalOutstandingDues.toLocaleString('en-IN')}</span>
            <span className="text-[8px] text-rose-400 block mt-1 underline">বকেয়াদার তালিকা ➔</span>
          </div>
        </div>

        {/* Card 3: Completed Clickable */}
        <div 
          onClick={() => { setActiveSection('completed'); setSelectedProfile(null); }}
          className={`p-4 rounded-xl bg-[#0a0a0c]/80 border border-slate-800 flex flex-col justify-between h-36 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all cursor-pointer ${
            activeSection === 'completed' ? 'ring-1 ring-emerald-500 bg-slate-900/40' : ''
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">Completed Jobs</span>
            <CheckCircle2 size={12} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-400 block">{completedApps.length}</span>
            <span className="text-[8px] text-emerald-400 block mt-1 underline">সম্পন্ন সেবা ➔</span>
          </div>
        </div>

        {/* Card 4: Approved Clickable */}
        <div 
          onClick={() => { setActiveSection('approved'); setSelectedProfile(null); }}
          className={`p-4 rounded-xl bg-[#0a0a0c]/80 border border-slate-800 flex flex-col justify-between h-36 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all cursor-pointer ${
            activeSection === 'approved' ? 'ring-1 ring-blue-500 bg-slate-900/40' : ''
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">Approved Queue</span>
            <Calendar size={12} className="text-blue-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-blue-400 block">{approvedApps.length}</span>
            <span className="text-[8px] text-blue-400 block mt-1 underline">অনুমোদিত কিউ ➔</span>
          </div>
        </div>

        {/* Card 5: Rejected Clickable */}
        <div 
          onClick={() => { setActiveSection('rejected'); setSelectedProfile(null); }}
          className={`p-4 rounded-xl bg-[#0a0a0c]/80 border border-slate-800 flex flex-col justify-between h-36 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] transition-all cursor-pointer ${
            activeSection === 'rejected' ? 'ring-1 ring-rose-500 bg-slate-900/40' : ''
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">CEO Rejected</span>
            <Ban size={12} className="text-rose-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-rose-500 block">{rejectedApps.length}</span>
            <span className="text-[8px] text-rose-500 block mt-1 underline">বাতিল অনুরোধ ➔</span>
          </div>
        </div>

        {/* Card 6: Daily Ledger Clickable */}
        <div 
          onClick={() => { setActiveSection('daily_ledger'); setSelectedProfile(null); }}
          className={`p-4 rounded-xl bg-[#0a0a0c]/80 border border-slate-800 flex flex-col justify-between h-36 hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(223,172,93,0.15)] transition-all cursor-pointer ${
            activeSection === 'daily_ledger' ? 'ring-1 ring-amber-500 bg-slate-900/40' : ''
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">Daily Ledger</span>
            <TrendingUp size={12} className="text-[#00f2fe]" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#00f2fe] block">₹{todayProfit.toLocaleString('en-IN')}</span>
            <span className="text-[8px] text-[#00f2fe] block mt-1 underline">ডেলি আয়-ব্যয় হিসাব ➔</span>
          </div>
        </div>

      </div>

      {/* --- DETAIL PAGES OR GENERAL CHARTS PAGE --- */}
      {activeSection !== 'overview' ? (
        <div className="p-6 rounded-3xl liquid-glass-panel glow-border-gold space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <button
              onClick={() => { setActiveSection('overview'); setSelectedProfile(null); }}
              className="flex items-center gap-1.5 text-[#dfac5d] hover:text-[#b88e3d] text-[10px] font-black uppercase cursor-pointer"
            >
              <ArrowLeft size={14} className="stroke-[3]" /> Overview এ ফিরুন (Back)
            </button>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-[8px] text-slate-500">
              PANEL: {activeSection.toUpperCase()}
            </span>
          </div>

          {/* Revenue view */}
          {activeSection === 'revenue' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-gold-gradient uppercase">Revenue Collections Audit (পেমেন্ট ও রাজস্ব এনালাইসিস)</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">সব পেইড এবং পার্শিয়াল পেমেন্টের তালিকা। নামের ওপরে ক্লিক করে কাস্টমার প্রোফাইল দেখুন।</p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-[#050505]/60 border-b border-slate-800 text-slate-500 uppercase font-mono">
                      <th className="p-3">Customer Details</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount Cleared</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Reference Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {getRevenueItems().length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-500 italic">কোনো পরিশোধিত বিল পাওয়া যায়নি।</td></tr>
                    ) : (
                      getRevenueItems().map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedProfile(getCustomerProfile(item.mobile, item.name))}
                              className="font-black text-[#dfac5d] hover:underline cursor-pointer text-left block"
                            >
                              {item.name}
                            </button>
                            <span className="text-[8px] text-slate-500 font-mono block mt-0.5">{item.mobile}</span>
                          </td>
                          <td className="p-3 text-slate-300 font-mono">{item.date}</td>
                          <td className="p-3 text-emerald-400 font-mono font-black">₹{item.amount.toLocaleString()}</td>
                          <td className="p-3 text-slate-300 font-bold">{item.method}</td>
                          <td className="p-3 text-slate-400 font-mono text-[9px]">{item.source} ({item.details})</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pending view */}
          {activeSection === 'pending' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-rose-400 uppercase">Outstanding Debtors Audit (বকেয়া বিল ও পেমেন্ট এনালাইসিস)</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">যেসব গ্রাহকের পেমেন্ট পেন্ডিং বা আনপেইড রয়েছে। নামের ওপরে ক্লিক করে সরাসরি কাস্টমার প্রোফাইল চেক করুন।</p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-[#050505]/60 border-b border-slate-800 text-slate-500 uppercase font-mono">
                      <th className="p-3">Customer Details</th>
                      <th className="p-3">Bill No</th>
                      <th className="p-3">Bill Date</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Amount Paid</th>
                      <th className="p-3 text-rose-400 font-black">Outstanding Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {getPendingDebtors().length === 0 ? (
                      <tr><td colSpan={6} className="p-6 text-center text-slate-500 italic">অভিনন্দন! কোনো কাস্টমারের বকেয়া বিল অবশিষ্ট নেই।</td></tr>
                    ) : (
                      getPendingDebtors().map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedProfile(getCustomerProfile(item.mobile, item.name))}
                              className="font-black text-rose-400 hover:underline cursor-pointer text-left block"
                            >
                              {item.name}
                            </button>
                            <span className="text-[8px] text-slate-500 font-mono block mt-0.5">{item.mobile}</span>
                          </td>
                          <td className="p-3 text-slate-300 font-mono">#{item.invoiceNumber}</td>
                          <td className="p-3 text-slate-400 font-mono">{item.date}</td>
                          <td className="p-3 text-slate-300 font-mono font-bold">₹{item.totalAmount}</td>
                          <td className="p-3 text-slate-400 font-mono">₹{item.paidAmount}</td>
                          <td className="p-3 text-rose-400 font-mono font-black text-xs">₹{item.dueAmount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Completed view */}
          {activeSection === 'completed' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-emerald-400 uppercase font-bold">Completed Services Tracker (সম্পন্ন সেবা সমূহের তালিকা)</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">সফলভাবে সমাপ্ত হওয়া সকল সেবা ও কাস্টমার টোকেনের অডিট ট্রেইল।</p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-[#050505]/60 border-b border-slate-800 text-slate-500 uppercase font-mono">
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Service Type</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Time Slot</th>
                      <th className="p-3">Token Number</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {completedApps.length === 0 ? (
                      <tr><td colSpan={6} className="p-6 text-center text-slate-500 italic">এই মুহূর্তে কোনো সম্পন্ন হওয়া সার্ভিসের ইতিহাস নেই।</td></tr>
                    ) : (
                      completedApps.map((appt, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedProfile(getCustomerProfile(appt.mobileNumber, appt.name))}
                              className="font-black text-emerald-400 hover:underline cursor-pointer text-left block"
                            >
                              {appt.name}
                            </button>
                            <span className="text-[8px] text-slate-500 font-mono block mt-0.5">{appt.mobileNumber}</span>
                          </td>
                          <td className="p-3 font-extrabold text-slate-200">{appt.serviceType}</td>
                          <td className="p-3 font-mono text-slate-300">{appt.date}</td>
                          <td className="p-3 font-mono text-slate-400">{appt.timeSlot}</td>
                          <td className="p-3 font-mono font-bold text-[#dfac5d]">{appt.tokenNumber || 'N/A'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[7px] font-black uppercase rounded-full">Completed</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Approved view */}
          {activeSection === 'approved' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-blue-400 uppercase font-bold">Approved Queue Execution (অনুমোদিত সেবা ট্র্যাকার)</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">সিইও দ্বারা এপ্রুভড হওয়া কিন্তু এখনো বিল বা কাজ সম্পূর্ণ না হওয়া কাস্টমার কিউ।</p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-[#050505]/60 border-b border-slate-800 text-slate-500 uppercase font-mono">
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Service Requested</th>
                      <th className="p-3">Target Date</th>
                      <th className="p-3">Time Slot</th>
                      <th className="p-3">Queue Token</th>
                      <th className="p-3">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {approvedApps.length === 0 ? (
                      <tr><td colSpan={6} className="p-6 text-center text-slate-500 italic">লাইনে কোনো অনুমোদিত সেবা অপেক্ষমান নেই।</td></tr>
                    ) : (
                      approvedApps.map((appt, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedProfile(getCustomerProfile(appt.mobileNumber, appt.name))}
                              className="font-black text-blue-400 hover:underline cursor-pointer text-left block"
                            >
                              {appt.name}
                            </button>
                            <span className="text-[8px] text-slate-500 font-mono block mt-0.5">{appt.mobileNumber}</span>
                          </td>
                          <td className="p-3 text-slate-200 font-bold">{appt.serviceType}</td>
                          <td className="p-3 font-mono text-slate-300">{appt.date}</td>
                          <td className="p-3 font-mono text-slate-400">{appt.timeSlot}</td>
                          <td className="p-3 font-mono font-black text-amber-500">{appt.tokenNumber || 'Pending'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[7px] font-black uppercase rounded-full">Approved</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rejected view */}
          {activeSection === 'rejected' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-rose-500 uppercase font-bold">CEO Panel Rejections (সিইও প্যানেল প্রত্যাখ্যাত তালিকা)</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">সিইও প্যানেল দ্বারা বাতিল বা রিজেক্ট করা কাস্টমারদের ইতিহাস লগ।</p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-[#050505]/60 border-b border-slate-800 text-slate-500 uppercase font-mono">
                      <th className="p-3">Rejected Client</th>
                      <th className="p-3">Denied Service</th>
                      <th className="p-3">Request Date</th>
                      <th className="p-3">Time Slot</th>
                      <th className="p-3">Status Code</th>
                      <th className="p-3">Notes / Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {rejectedApps.length === 0 ? (
                      <tr><td colSpan={6} className="p-6 text-center text-slate-500 italic">অডিট ট্রেইল সম্পন্ন। বাতিল বা প্রত্যাখ্যাত অনুরোধ নেই।</td></tr>
                    ) : (
                      rejectedApps.map((appt, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedProfile(getCustomerProfile(appt.mobileNumber, appt.name))}
                              className="font-black text-rose-400 hover:underline cursor-pointer text-left block"
                            >
                              {appt.name}
                            </button>
                            <span className="text-[8px] text-slate-500 font-mono block mt-0.5">{appt.mobileNumber}</span>
                          </td>
                          <td className="p-3 text-slate-200 font-extrabold">{appt.serviceType}</td>
                          <td className="p-3 font-mono text-slate-300">{appt.date}</td>
                          <td className="p-3 font-mono text-slate-400">{appt.timeSlot}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[7px] font-black uppercase rounded-full">Rejected</span>
                          </td>
                          <td className="p-3 text-rose-300 italic">{appt.notes || 'No remarks logged'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Daily Ledger View */}
          {activeSection === 'daily_ledger' && (
            <div className="space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#050507]/60 p-5 rounded-2xl border border-amber-500/10">
                <div>
                  <h3 className="text-base font-black text-gold-gradient uppercase flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#dfac5d]" />
                    Daily Income &amp; Expense Ledger (দৈনিক আয় ও ব্যয় হিসাব)
                  </h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    বিল হিস্ট্রি ও ম্যানুয়াল লেনদেন ট্র্যাকার। হিসাবের সুবিধার জন্য যেকোনো এন্ট্রি সাময়িকভাবে বাদ বা যুক্ত (Include/Exclude) করতে পারবেন।
                  </p>
                </div>
                
                {/* Current Month Report Quick Card */}
                {(() => {
                  const currentMonthKey = selectedLedgerDate.substring(0, 7); // e.g., "2026-06"
                  const mSummary = getMonthlyReportSummary(currentMonthKey);
                  return (
                    <div className="bg-[#0a0c10] border border-slate-800 p-4 rounded-xl min-w-[240px] space-y-2">
                      <div className="flex justify-between text-[8px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-800 pb-1">
                        <span>Monthly Summary ({currentMonthKey})</span>
                        <span className="text-[#dfac5d]">স্বয়ংক্রিয় হিসাব</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-slate-400 block">Total Income:</span>
                          <span className="text-emerald-400 font-extrabold font-mono">₹{mSummary.income.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Total Expense:</span>
                          <span className="text-rose-400 font-extrabold font-mono">₹{mSummary.expense.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="col-span-2 border-t border-slate-900 pt-1 flex justify-between">
                          <span className="text-slate-300 font-bold">Net Profit/Loss:</span>
                          <span className={`font-mono font-black ${mSummary.net >= 0 ? 'text-[#00f2fe]' : 'text-rose-500'}`}>
                            ₹{mSummary.net.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Two Column Layout: Forms on Left, Active Ledger on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: FORMS */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* FORM A: ADD MANUAL TRANSACTION */}
                  <div className="p-5 rounded-2xl bg-[#07090d]/90 border border-slate-800 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Plus size={14} className="text-emerald-400" />
                        ম্যানুয়াল লেনদেন যুক্ত করুন (Add Transaction)
                      </h4>
                      <p className="text-[8px] text-slate-500 mt-0.5 font-medium">ভাড়া, রিফিল, স্টাফ বেতন, অনলাইন আয় ইত্যাদি দৈনিক রেকর্ড করুন।</p>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!newTxAmount || isNaN(Number(newTxAmount)) || Number(newTxAmount) <= 0) {
                        showToast('⚠️ অনুগ্রহ করে সঠিক পরিমাণ টাকা প্রদান করুন!');
                        return;
                      }
                      if (!newTxCategory.trim()) {
                        showToast('⚠️ অনুগ্রহ করে ক্যাটাগরি উল্লেখ করুন!');
                        return;
                      }
                      if (addFinanceRecord) {
                        addFinanceRecord({
                          id: 'manual_' + Date.now(),
                          type: newTxType,
                          category: newTxCategory,
                          amount: Number(newTxAmount),
                          date: newTxDate,
                          description: newTxDesc || undefined,
                          paymentMethod: 'Cash',
                          shopId: 'main_hq'
                        });
                        showToast('✓ লেনদেনটি সফলভাবে সেভ করা হয়েছে!');
                        setNewTxAmount('');
                        setNewTxDesc('');
                      }
                    }} className="space-y-3 text-[10px]">
                      
                      {/* Transaction Type Select */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewTxType('income')}
                          className={`py-2 px-3 rounded-lg font-black uppercase text-center border transition-all ${
                            newTxType === 'income'
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                              : 'bg-[#030304] border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          Income (আয়)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTxType('expense')}
                          className={`py-2 px-3 rounded-lg font-black uppercase text-center border transition-all ${
                            newTxType === 'expense'
                              ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                              : 'bg-[#030304] border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          Expense (ব্যয়)
                        </button>
                      </div>

                      {/* Category & Amount */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-extrabold uppercase text-[8px]">Category (ক্যাটাগরি)</label>
                          <select
                            value={newTxCategory}
                            onChange={(e) => setNewTxCategory(e.target.value)}
                            className="w-full bg-[#030304] border border-slate-800 rounded-lg p-2 text-slate-300 font-medium focus:border-amber-500/50 outline-none"
                          >
                            <option value="CSC Service Charge">CSC Service Charge</option>
                            <option value="Form Fillup">Form Fillup</option>
                            <option value="Internet / Portal Charges">Internet Charges</option>
                            <option value="Ink Refill & Stationery">Ink & Stationery</option>
                            <option value="Rent & Utilities">Rent & Utilities</option>
                            <option value="Staff Salaries">Staff Salaries</option>
                            <option value="Other Expenses">Other Expenses</option>
                            <option value="Other Income">Other Income</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-extrabold uppercase text-[8px]">Amount (পরিমাণ - ₹)</label>
                          <input
                            type="number"
                            required
                            placeholder="যেমন: 500"
                            value={newTxAmount}
                            onChange={(e) => setNewTxAmount(e.target.value)}
                            className="w-full bg-[#030304] border border-slate-800 rounded-lg p-2 text-slate-300 font-mono font-bold focus:border-amber-500/50 outline-none"
                          />
                        </div>
                      </div>

                      {/* Date & Description */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-extrabold uppercase text-[8px]">Date (তারিখ)</label>
                          <input
                            type="date"
                            required
                            value={newTxDate}
                            onChange={(e) => setNewTxDate(e.target.value)}
                            className="w-full bg-[#030304] border border-slate-800 rounded-lg p-1.5 text-slate-300 font-mono focus:border-amber-500/50 outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-extrabold uppercase text-[8px]">Description (বিবরণ/পারপাস)</label>
                          <input
                            type="text"
                            placeholder="যেমন: ঘর ভাড়া / UPI রিচার্জ"
                            value={newTxDesc}
                            onChange={(e) => setNewTxDesc(e.target.value)}
                            className="w-full bg-[#030304] border border-slate-800 rounded-lg p-2 text-slate-300 font-medium focus:border-amber-500/50 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-tr from-emerald-600 to-[#10b981] text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-wider hover:opacity-95 cursor-pointer mt-1"
                      >
                        লেনদেন সংরক্ষণ করুন (Save Transaction)
                      </button>
                    </form>
                  </div>

                  {/* FORM B: RECORD CLIENT DISCOUNT GIVEN */}
                  <div className="p-5 rounded-2xl bg-[#07090d]/90 border border-slate-800 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <User size={14} className="text-purple-400" />
                        কাস্টমার ডিসকাউন্ট দিন (Record Discount Given)
                      </h4>
                      <p className="text-[8px] text-slate-500 mt-0.5 font-medium">আজকের দিনে কাস্টমারকে কত টাকা ছাড় দিলেন তা তার প্রোফাইলে সেভ হবে।</p>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!discCustomerId) {
                        showToast('⚠️ অনুগ্রহ করে কাস্টমার সিলেক্ট করুন!');
                        return;
                      }

                      let matchedCust: CustomerCRM | undefined = undefined;
                      let finalName = '';

                      if (discCustomerId === 'custom_name') {
                        if (!discCustomerName.trim()) {
                          showToast('⚠️ অনুগ্রহ করে কাস্টমারের নাম লিখুন!');
                          return;
                        }
                        finalName = discCustomerName.trim();
                        // Search for an existing customer profile with this name
                        matchedCust = customers.find(c => c.name.toLowerCase() === finalName.toLowerCase());
                      } else {
                        matchedCust = customers.find(c => c.id === discCustomerId);
                        finalName = matchedCust ? matchedCust.name : '';
                      }

                      if (!discAmount || isNaN(Number(discAmount)) || Number(discAmount) <= 0) {
                        showToast('⚠️ অনুগ্রহ করে ডিসকাউন্টের সঠিক পরিমাণ প্রদান করুন!');
                        return;
                      }
                      if (!discPurpose.trim()) {
                        showToast('⚠️ ছাড় দেওয়ার কারণ/পারপাস উল্লেখ করুন!');
                        return;
                      }

                      const newDisc = {
                        id: 'disc_' + Date.now(),
                        date: discDate,
                        amount: Number(discAmount),
                        purpose: discPurpose
                      };

                      if (matchedCust) {
                        const existingDiscounts = matchedCust.discounts || [];
                        if (updateCustomer) {
                          updateCustomer(matchedCust.id, {
                            discounts: [...existingDiscounts, newDisc]
                          });
                        }
                        showToast(`✓ ₹${discAmount} ছাড় "${matchedCust.name}" এর প্রোফাইল হিস্ট্রিতে সফলভাবে যুক্ত হয়েছে!`);
                      } else {
                        // Create a new customer profile automatically
                        const newCustId = `cust_${Date.now()}`;
                        const newCust: CustomerCRM = {
                          id: newCustId,
                          name: finalName,
                          mobile: `${Math.floor(6000000000 + Math.random() * 3999999999)}`,
                          createdAt: new Date().toISOString(),
                          totalSpending: 0,
                          shopId: 'shop_1',
                          isPermanent: true,
                          discounts: [newDisc]
                        };
                        if (addCustomer) {
                          addCustomer(newCust);
                        }
                        showToast(`✓ ₹${discAmount} ছাড় দিয়ে "${finalName}" নামে নতুন প্রোফাইল তৈরি ও হিস্ট্রি আপডেট করা হয়েছে!`);
                      }

                      setDiscAmount('');
                      setDiscPurpose('');
                      setDiscCustomerName('');
                      setDiscCustomerId('');
                    }} className="space-y-3 text-[10px]">
                      
                      {/* Customer select */}
                      <div className="space-y-1">
                        <label className="text-slate-400 font-extrabold uppercase text-[8px]">Select Customer (কাস্টমার সিলেক্ট)</label>
                        <select
                          required
                          value={discCustomerId}
                          onChange={(e) => setDiscCustomerId(e.target.value)}
                          className="w-full bg-[#030304] border border-slate-800 rounded-lg p-2 text-slate-300 font-medium focus:border-amber-500/50 outline-none"
                        >
                          <option value="">-- কাস্টমার নির্বাচন করুন --</option>
                          <option value="custom_name">➕ [Type Custom Name / নতুন নাম লিখুন]</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.mobile})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Alternate manual customer name input field */}
                      {discCustomerId === 'custom_name' && (
                        <div className="space-y-1 animate-fadeIn">
                          <label className="text-slate-400 font-extrabold uppercase text-[8px] text-purple-400">Customer Name (কাস্টমারের নাম লিখুন)</label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: আবদুর রহমান"
                            value={discCustomerName}
                            onChange={(e) => setDiscCustomerName(e.target.value)}
                            className="w-full bg-[#030304] border border-purple-500/30 rounded-lg p-2 text-slate-200 font-bold focus:border-purple-500 outline-none placeholder-slate-600"
                          />
                        </div>
                      )}

                      {/* Discount Amount & Date */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-extrabold uppercase text-[8px]">Discount (ছাড়ের পরিমাণ - ₹)</label>
                          <input
                            type="number"
                            required
                            placeholder="যেমন: 50"
                            value={discAmount}
                            onChange={(e) => setDiscAmount(e.target.value)}
                            className="w-full bg-[#030304] border border-slate-800 rounded-lg p-2 text-slate-300 font-mono font-bold focus:border-amber-500/50 outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-extrabold uppercase text-[8px]">Date Given (তারিখ)</label>
                          <input
                            type="date"
                            required
                            value={discDate}
                            onChange={(e) => setDiscDate(e.target.value)}
                            className="w-full bg-[#030304] border border-slate-800 rounded-lg p-1.5 text-slate-300 font-mono focus:border-amber-500/50 outline-none"
                          />
                        </div>
                      </div>

                      {/* Purpose */}
                      <div className="space-y-1">
                        <label className="text-slate-400 font-extrabold uppercase text-[8px]">Discount Purpose (কি পারপাসে ছাড়)</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: পরিচিত কাস্টমার / বাল্ক সার্ভিস ছাড়"
                          value={discPurpose}
                          onChange={(e) => setDiscPurpose(e.target.value)}
                          className="w-full bg-[#030304] border border-slate-800 rounded-lg p-2 text-slate-300 font-medium focus:border-amber-500/50 outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black rounded-lg text-[10px] uppercase tracking-wider hover:opacity-95 cursor-pointer mt-1"
                      >
                        ছাড় রেকর্ড করুন (Record Discount)
                      </button>
                    </form>
                  </div>

                </div>

                {/* RIGHT COLUMN: ACTIVE LEDGER LOGS & MATH */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Ledger Date Selector & PDF Download */}
                  <div className="p-5 rounded-2xl bg-[#07090d]/90 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-extrabold uppercase text-[8px] tracking-widest block">Select Statement Date (হিসাবের তারিখ নির্বাচন করুন)</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedLedgerDate}
                          onChange={(e) => setSelectedLedgerDate(e.target.value)}
                          className="bg-[#030304] border border-slate-800 rounded-lg p-2 text-slate-200 font-mono font-bold focus:border-amber-500/50 outline-none"
                        >
                          {activeDates.length === 0 ? (
                            <option value={todayStr}>{todayStr} (আজ)</option>
                          ) : (
                            activeDates.map(d => (
                              <option key={d} value={d}>
                                {d} {d === todayStr ? '(আজ)' : ''}
                              </option>
                            ))
                          )}
                        </select>
                        <input
                          type="date"
                          value={selectedLedgerDate}
                          onChange={(e) => setSelectedLedgerDate(e.target.value)}
                          className="bg-[#030304] border border-slate-800 rounded-lg p-1.5 text-slate-400 font-mono text-[10px] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadDailyLedgerPDF(selectedLedgerDate)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-tr from-[#dfac5d] to-[#b88e3d] text-slate-950 font-black rounded-xl text-[9px] uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_2px_12px_rgba(223,172,93,0.2)] flex items-center justify-center gap-1.5"
                    >
                      <Download size={12} className="stroke-[3]" />
                      Download Daily Ledger (PDF)
                    </button>
                  </div>

                  {/* Dynamic Daily Math Summary */}
                  {(() => {
                    const dayTx = allTx.filter(tx => tx.date === selectedLedgerDate);
                    const dayDiscs = allDiscs.filter(d => d.date === selectedLedgerDate);
                    
                    const includedTx = dayTx.filter(tx => !tx.isExcluded);
                    const dayIncome = includedTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
                    const dayExpense = includedTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
                    const dayNet = dayIncome - dayExpense;
                    const dayDiscounts = dayDiscs.reduce((sum, d) => sum + d.amount, 0);

                    return (
                      <div className="space-y-4">
                        
                        {/* Summary mini cards row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 rounded-xl bg-slate-900/30 border border-slate-800 text-center">
                            <span className="text-[8px] text-slate-500 uppercase font-extrabold block">Today's Income</span>
                            <span className="text-sm font-black text-emerald-400 font-mono">₹{dayIncome.toLocaleString('en-IN')}</span>
                          </div>
                          
                          <div className="p-3 rounded-xl bg-slate-900/30 border border-slate-800 text-center">
                            <span className="text-[8px] text-slate-500 uppercase font-extrabold block">Today's Expense</span>
                            <span className="text-sm font-black text-rose-400 font-mono">₹{dayExpense.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900/30 border border-slate-800 text-center">
                            <span className="text-[8px] text-slate-500 uppercase font-extrabold block">Net Balance</span>
                            <span className={`text-sm font-black font-mono ${dayNet >= 0 ? 'text-[#00f2fe]' : 'text-rose-500'}`}>
                              ₹{dayNet.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900/30 border border-slate-800 text-center">
                            <span className="text-[8px] text-slate-500 uppercase font-extrabold block">Discounts Given</span>
                            <span className="text-sm font-black text-purple-400 font-mono">₹{dayDiscounts.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Transactions Table for selected Ledger Date */}
                        <div className="p-5 rounded-2xl bg-[#07090d]/90 border border-slate-800 space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                              Ledger Statement Details ({selectedLedgerDate})
                            </span>
                            <span className="text-[8px] text-slate-500 font-mono">
                              {dayTx.length} items logged
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[10px]">
                              <thead>
                                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[8px] font-mono">
                                  <th className="py-2">Type</th>
                                  <th className="py-2">Category / Source</th>
                                  <th className="py-2">Purpose / Bill Item</th>
                                  <th className="py-2 text-right">Amount</th>
                                  <th className="py-2 text-center">Calculation Status</th>
                                  <th className="py-2 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {dayTx.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                                      এই তারিখে কোনো লেনদেন রেকর্ড করা হয়নি। উপরে ফর্মে গিয়ে ম্যানুয়াল লেনদেন যোগ করুন।
                                    </td>
                                  </tr>
                                ) : (
                                  dayTx.map((tx) => (
                                    <tr key={tx.id} className={`hover:bg-slate-900/20 transition-colors ${tx.isExcluded ? 'opacity-40' : ''}`}>
                                      <td className="py-2.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${
                                          tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                        }`}>
                                          {tx.type}
                                        </span>
                                      </td>
                                      <td className="py-2.5 font-bold text-slate-300">
                                        {tx.clientName}
                                        {tx.source === 'bill' && (
                                          <span className="text-[7px] block text-emerald-500 font-mono font-medium">Auto-synced Bill</span>
                                        )}
                                      </td>
                                      <td className="py-2.5 text-slate-400 max-w-[140px] truncate">{tx.purpose}</td>
                                      <td className="py-2.5 text-right font-mono font-extrabold text-slate-200">
                                        ₹{tx.amount.toLocaleString('en-IN')}
                                      </td>
                                      <td className="py-2.5 text-center">
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold">
                                          <input
                                            type="checkbox"
                                            checked={!tx.isExcluded}
                                            onChange={() => {
                                              if (tx.isExcluded) {
                                                setExcludedRecordIds(prev => prev.filter(id => id !== tx.id));
                                              } else {
                                                setExcludedRecordIds(prev => [...prev, tx.id]);
                                              }
                                              showToast(`✓ হিসাবের তালিকা ${tx.isExcluded ? 'যুক্ত করা হয়েছে' : 'থেকে বাদ দেওয়া হয়েছে'}!`);
                                            }}
                                            className="accent-amber-500 w-3.5 h-3.5 bg-[#030304] border border-slate-800 rounded"
                                          />
                                          <span className="text-[8px] font-bold text-slate-500">Include</span>
                                        </label>
                                      </td>
                                      <td className="py-2.5 text-center">
                                        {tx.source === 'manual' ? (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (confirm('লেনদেনটি চিরতরে মুছে ফেলতে চান?') && deleteFinanceRecord) {
                                                deleteFinanceRecord(tx.id);
                                                showToast('✓ ম্যানুয়াল লেনদেনটি চিরতরে মুছে ফেলা হয়েছে!');
                                              }
                                            }}
                                            className="px-2 py-1 bg-rose-950/30 border border-rose-500/20 text-rose-400 rounded hover:bg-rose-500/20 transition-all text-[8px] font-black cursor-pointer"
                                          >
                                            Delete
                                          </button>
                                        ) : (
                                          <span className="text-[7px] text-slate-500 font-mono">Permanent Bill</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Customer Discounts Log list */}
                        {dayDiscs.length > 0 && (
                          <div className="p-5 rounded-2xl bg-[#07090d]/90 border border-slate-800 space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                              <span className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles size={11} className="text-[#00f2fe]" />
                                Customer Discounts Approved List (প্রদানকৃত ছাড়ের তালিকা)
                              </span>
                              <span className="text-[8px] text-slate-500 font-mono">
                                ₹{dayDiscounts} total discounts
                              </span>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[10px]">
                                <thead>
                                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[8px] font-mono">
                                    <th className="py-2">Client Name</th>
                                    <th className="py-2">Purpose / Remarks</th>
                                    <th className="py-2 text-right">Discount Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                  {dayDiscs.map((disc) => (
                                    <tr key={disc.id} className="hover:bg-purple-950/5 transition-colors">
                                      <td className="py-2.5 font-extrabold text-purple-400">{disc.clientName}</td>
                                      <td className="py-2.5 text-slate-300 italic">{disc.purpose}</td>
                                      <td className="py-2.5 text-right font-mono font-black text-purple-400">
                                        ₹{disc.amount.toLocaleString('en-IN')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })()}

                </div>

              </div>

            </div>
          )}

          {/* Business Analysis View */}
          {activeSection === 'business_analysis' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#050507]/60 p-5 rounded-2xl border border-amber-500/10">
                <div>
                  <h3 className="text-base font-black text-gold-gradient uppercase flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#dfac5d]" />
                    Monthly Business Performance Analysis (মাসিক বিজনেস এনালাইসিস)
                  </h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    প্রতি মাসের দৈনিক আয় ও ব্যয়ের তালিকা এবং নিখুঁত বিজনেস সামারি ট্র্যাকার।
                  </p>
                </div>
                
                {/* Month Selector & PDF Download */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-[#030304] border border-slate-800 rounded-lg px-2 py-1">
                    <span className="text-[8px] text-slate-500 uppercase font-black">Month:</span>
                    <select
                      value={selectedBusinessMonth}
                      onChange={(e) => setSelectedBusinessMonth(e.target.value)}
                      className="bg-[#030304] text-slate-200 font-mono font-bold text-xs outline-none border-none py-1 px-1 cursor-pointer"
                    >
                      {(() => {
                        const activeMonths = Array.from(new Set(allTx.map(tx => tx.date.substring(0, 7))));
                        if (activeMonths.length === 0) activeMonths.push('2026-06');
                        // Sort descending so recent is first
                        activeMonths.sort().reverse();
                        return activeMonths.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ));
                      })()}
                    </select>
                  </div>

                  <button
                    onClick={() => handleDownloadMonthlyBusinessReportPDF(selectedBusinessMonth)}
                    className="px-4 py-2 bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-[9px] uppercase tracking-wider transition-all shadow-[0_2px_12px_rgba(223,172,93,0.2)] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={12} className="stroke-[3]" />
                    Generate PDF Report (মাসিক রিপোর্ট)
                  </button>
                </div>
              </div>

              {/* Monthly Math Summary Cards */}
              {(() => {
                const monthTx = allTx.filter(tx => tx.date.startsWith(selectedBusinessMonth));
                const sortedMonthTx = [...monthTx].sort((a, b) => a.date.localeCompare(b.date));
                
                const includedTx = sortedMonthTx.filter(tx => !tx.isExcluded);
                const monthIncome = includedTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
                const monthExpense = includedTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
                const monthNet = monthIncome - monthExpense;
                
                return (
                  <div className="space-y-4">
                    
                    {/* Summary row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-1">
                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Total Amount In (মোট আয়)</span>
                        <span className="text-lg font-extrabold text-emerald-400 font-mono">₹{monthIncome.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-1">
                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Total Amount Out (মোট ব্যয়)</span>
                        <span className="text-lg font-extrabold text-rose-400 font-mono">₹{monthExpense.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-1">
                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Net Balance (নিট লাভ/ক্ষতি)</span>
                        <span className={`text-lg font-extrabold font-mono ${monthNet >= 0 ? 'text-[#00f2fe]' : 'text-rose-500'}`}>
                          ₹{monthNet.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-1">
                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Total Transactions</span>
                        <span className="text-lg font-extrabold text-purple-400 font-mono">{sortedMonthTx.length} Items</span>
                      </div>
                    </div>

                    {/* Table of Monthly Transactions */}
                    <div className="p-5 rounded-2xl bg-[#07090d]/90 border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                          Monthly Business Ledger - {selectedBusinessMonth}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono">
                          Showing {sortedMonthTx.length} entries for this month
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[10px]">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-500 uppercase text-[8px] font-mono">
                              <th className="py-2.5">Date</th>
                              <th className="py-2.5">Customer / Category</th>
                              <th className="py-2.5 text-right">Amount In (আয়)</th>
                              <th className="py-2.5 text-right">Amount Out (ব্যয়)</th>
                              <th className="py-2.5">Purpose / Description</th>
                              <th className="py-2.5 text-center">Status</th>
                              <th className="py-2.5 text-center">Action (মুছে ফেলুন)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {sortedMonthTx.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                                  এই মাসে কোনো আয় বা ব্যয় রেকর্ড করা হয়নি।
                                </td>
                              </tr>
                            ) : (
                              sortedMonthTx.map((tx) => (
                                <tr key={tx.id} className={`hover:bg-slate-900/20 transition-colors ${tx.isExcluded ? 'opacity-30' : ''}`}>
                                  <td className="py-3 font-mono font-bold text-slate-400">{tx.date}</td>
                                  <td className="py-3 font-extrabold text-slate-200">
                                    {tx.clientName}
                                    {tx.source === 'bill' && (
                                      <span className="text-[7px] block text-emerald-500 font-mono font-bold uppercase tracking-widest">Auto-Synced Bill</span>
                                    )}
                                    {tx.source === 'discount' && (
                                      <span className="text-[7px] block text-purple-400 font-mono font-bold uppercase tracking-widest">Customer Discount</span>
                                    )}
                                  </td>
                                  <td className="py-3 text-right font-mono font-black text-emerald-400">
                                    {tx.type === 'income' && !tx.isExcluded ? `₹${tx.amount.toLocaleString('en-IN')}` : '-'}
                                  </td>
                                  <td className="py-3 text-right font-mono font-black text-rose-400">
                                    {tx.type === 'expense' && !tx.isExcluded ? `₹${tx.amount.toLocaleString('en-IN')}` : '-'}
                                  </td>
                                  <td className="py-3 text-slate-300 italic max-w-[150px] truncate">{tx.purpose}</td>
                                  <td className="py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${
                                      tx.isExcluded ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500/10 text-emerald-400'
                                    }`}>
                                      {tx.isExcluded ? 'Excluded' : 'Active'}
                                    </span>
                                  </td>
                                  <td className="py-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {/* Exclude / Include check to allow non-destructive correct */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (tx.isExcluded) {
                                            setExcludedRecordIds(prev => prev.filter(id => id !== tx.id));
                                            showToast('✓ লেনদেনটি হিসাবে পুনরায় অন্তর্ভুক্ত করা হয়েছে!');
                                          } else {
                                            setExcludedRecordIds(prev => [...prev, tx.id]);
                                            showToast('✓ লেনদেনটি সাময়িকভাবে হিসাব থেকে বাদ দেওয়া হয়েছে!');
                                          }
                                        }}
                                        className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded hover:text-slate-200 transition-all text-[8px] font-bold cursor-pointer"
                                        title={tx.isExcluded ? "Include in totals" : "Exclude from totals"}
                                      >
                                        {tx.isExcluded ? 'Include' : 'Exclude'}
                                      </button>
                                      
                                      {/* Real delete button next to each daily entry row */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm('লেনদেনটি চিরতরে মুছে ফেলতে চান? (অপশনটি রিভার্স করা যাবে না)')) {
                                            if (tx.source === 'manual') {
                                              if (deleteFinanceRecord) deleteFinanceRecord(tx.id);
                                            } else {
                                              // For auto-generated bill/discount transactions, exclude them permanently
                                              setExcludedRecordIds(prev => [...prev, tx.id]);
                                            }
                                            showToast('✓ লেনদেনটি সফলভাবে মুছে ফেলা হয়েছে ও টোটাল আপডেট হয়েছে!');
                                          }
                                        }}
                                        className="px-2 py-1 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded hover:bg-rose-500/20 transition-all text-[8px] font-black cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      ) : (
        /* STANDARD TRENDS & CHARTS AREA */
        <div className="p-6 rounded-3xl liquid-glass-panel glow-border-cyan">
          {!hasAnyBusinessData ? (
            <div className="py-24 text-center max-w-lg mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 mx-auto animate-bounce">
                <AlertCircle size={32} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-lg font-black text-gold-gradient tracking-tight uppercase">No Business Data Available Yet</h2>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Rizwan Online Dreams Platform runs strictly on real-data. Since you start completely empty, there are no charts or reports to compile.
                </p>
              </div>

              <p className="text-slate-500 text-[11px] bg-[#050505]/60 p-4 rounded-xl border border-slate-800">
                Create manual bills under the **Smart Billing** desk or add financial transactions to watch your business trend history build live.
              </p>

              {setCurrentTab && (
                <button 
                  onClick={() => setCurrentTab('billing')}
                  className="px-6 py-3 bg-gradient-to-tr from-[#dfac5d] to-[#b88e3d] text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_4px_20px_rgba(223,172,93,0.3)] flex items-center gap-2 mx-auto"
                >
                  <Plus size={14} className="stroke-[3] text-slate-950" /> Create First Bill
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Financial Trend */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                      <LineIcon size={14} className="text-[#dfac5d]" /> Revenue & Ledger Trend
                    </h3>
                  </div>

                  <div className="h-64 w-full bg-[#050505]/40 p-4 rounded-2xl border border-slate-800">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dfac5d" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#dfac5d" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(223,172,93,0.15)', borderRadius: '10px' }} />
                        <Area type="monotone" dataKey="Income" stroke="#dfac5d" strokeWidth={1.5} fillOpacity={1} fill="url(#colorInc)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Service distribution */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                      <PieIcon size={14} className="text-[#00f2fe]" /> Revenue Share By Service
                    </h3>
                  </div>

                  <div className="h-64 w-full bg-[#050505]/40 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-around gap-4">
                    {categoryChartData.length === 0 ? (
                      <span className="text-slate-500 italic text-[10px]">No bill details to compile</span>
                    ) : (
                      <>
                        <div className="h-44 w-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                                {categoryChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="space-y-2 text-[10px] max-w-[150px]">
                          {categoryChartData.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                              <span className="text-slate-300 font-extrabold truncate">{entry.name}:</span>
                              <span className="text-[#dfac5d] font-mono font-black shrink-0">₹{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center text-slate-400 leading-relaxed font-mono text-[9px] uppercase tracking-wider">
                REPORTS RECALCULATE AUTOMATICALLY | AUDITING INTEGRITY SECURED
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
