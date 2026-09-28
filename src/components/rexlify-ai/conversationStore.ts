import { Conversation, ChatMessage, AttachmentPayload } from './types';
import { jsPDF } from 'jspdf';

const STORAGE_KEY = 'rexlify_ai_conversations_v5_live';
const ACTIVE_CONV_KEY = 'rexlify_ai_active_conv_id_v5';

// Live clean slate - starts from zero without placeholder data
const SEED_CONVERSATIONS: Conversation[] = [];

export class ConversationStore {
  static loadConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load conversations from localStorage:', e);
    }
    return [];
  }

  static saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed to save conversations to localStorage:', e);
    }
  }

  static getActiveConversationId(): string | null {
    const stored = localStorage.getItem(ACTIVE_CONV_KEY);
    if (stored) return stored;
    const all = ConversationStore.loadConversations();
    if (all.length > 0) {
      localStorage.setItem(ACTIVE_CONV_KEY, all[0].id);
      return all[0].id;
    }
    return null;
  }

  static setActiveConversationId(id: string): void {
    localStorage.setItem(ACTIVE_CONV_KEY, id);
  }

  static createConversation(initialPrompt?: string, attachment?: AttachmentPayload): Conversation {
    const id = `conv-${Date.now()}`;
    
    // Generate intelligent title from prompt or attachment
    let title = 'New Conversation';
    if (initialPrompt && initialPrompt.trim()) {
      const clean = initialPrompt.trim().replace(/\n/g, ' ');
      title = clean.length > 36 ? `${clean.substring(0, 34)}...` : clean;
    } else if (attachment) {
      title = `Analysis: ${attachment.name.replace(/\.[^/.]+$/, '')}`;
    }

    const newConv: Conversation = {
      id,
      title,
      messages: [],
      createdAt: 'Just now',
      updatedAt: 'Just now',
      lastMessagePreview: initialPrompt ? initialPrompt.slice(0, 60) : 'Started conversation...',
      syncStatus: 'synced',
      category: 'General'
    };

    const conversations = ConversationStore.loadConversations();
    const updated = [newConv, ...conversations];
    ConversationStore.saveConversations(updated);
    ConversationStore.setActiveConversationId(id);
    return newConv;
  }

  static renameConversation(id: string, newTitle: string): Conversation[] {
    const list = ConversationStore.loadConversations();
    const updated = list.map(c => c.id === id ? { ...c, title: newTitle, updatedAt: 'Just now' } : c);
    ConversationStore.saveConversations(updated);
    return updated;
  }

  static deleteConversation(id: string): Conversation[] {
    const list = ConversationStore.loadConversations();
    const updated = list.filter(c => c.id !== id);
    ConversationStore.saveConversations(updated);
    if (ConversationStore.getActiveConversationId() === id && updated.length > 0) {
      ConversationStore.setActiveConversationId(updated[0].id);
    }
    return updated;
  }

  static exportConversation(conv: Conversation, format: 'md' | 'txt' | 'pdf'): void {
    const sanitizedTitle = (conv.title || 'Conversation').replace(/[^a-zA-Z0-9_-]/g, '_');

    if (format === 'pdf') {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 18;
        const maxLineWidth = pageWidth - margin * 2;
        let y = margin;

        const checkNewPage = (neededSpace: number) => {
          if (y + neededSpace > pageHeight - margin) {
            doc.addPage();
            y = margin;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`REXLIFY AI Archive • ${conv.title}`, margin, y - 8);
            doc.setDrawColor(241, 245, 249);
            doc.line(margin, y - 5, pageWidth - margin, y - 5);
          }
        };

        // Header Banner
        doc.setFillColor(253, 242, 248);
        doc.rect(margin, y, maxLineWidth, 24, 'F');
        doc.setDrawColor(244, 114, 182);
        doc.setLineWidth(0.6);
        doc.rect(margin, y, maxLineWidth, 24, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(190, 24, 93);
        doc.text('REXLIFY AI SOFTWARE • EXECUTIVE ARCHIVE', margin + 6, y + 8);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text(doc.splitTextToSize(conv.title || 'Untitled Conversation', maxLineWidth - 12)[0], margin + 6, y + 16);

        y += 32;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Created: ${conv.createdAt}   |   Messages: ${conv.messages.length}   |   Export Date: ${new Date().toLocaleDateString()}`, margin, y);

        y += 8;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        if (conv.messages.length === 0) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(10);
          doc.setTextColor(148, 163, 184);
          doc.text('This conversation has no messages yet.', margin, y);
        } else {
          for (const msg of conv.messages) {
            const isUser = msg.role === 'user';
            const roleLabel = isUser ? 'USER (Rizwan)' : 'REXLIFY AI ASSISTANT';
            
            checkNewPage(24);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            if (isUser) {
              doc.setTextColor(219, 39, 119);
            } else {
              doc.setTextColor(124, 58, 237);
            }
            doc.text(`${roleLabel}   •   ${msg.timestamp}`, margin, y);
            y += 5;

            const rawContent = (msg.content || '')
              .replace(/[#*`_~[\]]/g, '')
              .replace(/https?:\/\/\S+/g, '');
            
            const lines = doc.splitTextToSize(rawContent, maxLineWidth);
            const blockHeight = lines.length * 5 + 6;
            
            checkNewPage(Math.min(blockHeight + 8, 40));
            doc.setFillColor(isUser ? 253 : 248, isUser ? 242 : 250, isUser ? 248 : 252);
            doc.roundedRect(margin, y, maxLineWidth, blockHeight, 2, 2, 'F');
            doc.setDrawColor(isUser ? 251 : 226, isUser ? 207 : 232, isUser ? 232 : 240);
            doc.roundedRect(margin, y, maxLineWidth, blockHeight, 2, 2, 'S');

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);

            let textY = y + 5;
            for (const line of lines) {
              if (textY > pageHeight - margin - 8) {
                doc.addPage();
                textY = margin + 5;
              }
              doc.text(line, margin + 4, textY);
              textY += 5;
            }

            y += blockHeight + 8;
          }
        }

        doc.save(`${sanitizedTitle}_RexlifyAI.pdf`);
        return;
      } catch (err) {
        console.error('jsPDF export error, falling back to text:', err);
      }
    }

    let content = `# ${conv.title}\nExported from REXLIFY AI on ${new Date().toLocaleString()}\n\n---\n\n`;
    conv.messages.forEach(m => {
      content += `### ${m.role === 'user' ? 'User' : 'REXLIFY AI'} (${m.timestamp})\n`;
      if (m.attachment) {
        content += `*Attachment: ${m.attachment.name} (${m.attachment.type})*\n\n`;
      }
      content += `${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizedTitle}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export a standalone document (e.g. Generated Academic Assignment, Report, or Note)
  static exportDocument(title: string, rawContent: string, format: 'pdf' | 'md' | 'txt' = 'pdf') {
    const sanitizedTitle = (title || 'Rexlify_Document').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);

    if (format === 'pdf') {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 18;
        const maxLineWidth = pageWidth - margin * 2;
        let y = margin;

        const checkNewPage = (requiredSpace: number) => {
          if (y + requiredSpace > pageHeight - margin) {
            doc.addPage();
            y = margin;
            // Running top border
            doc.setDrawColor(244, 114, 182);
            doc.line(margin, margin, pageWidth - margin, margin);
            y += 8;
          }
        };

        // Header Banner
        doc.setFillColor(236, 72, 153);
        doc.rect(margin, y, 4, 14, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text(title || 'Rexlify AI Document', margin + 7, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated by Rexlify AI Executive Core • ${new Date().toLocaleDateString()}`, margin + 7, y + 12);

        y += 20;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // Clean content
        const cleaned = rawContent
          .replace(/[#*`_~[\]]/g, '')
          .replace(/https?:\/\/\S+/g, '');

        const paragraphs = cleaned.split('\n');
        
        for (const para of paragraphs) {
          const trimmed = para.trim();
          if (!trimmed) {
            y += 4;
            continue;
          }

          const lines = doc.splitTextToSize(trimmed, maxLineWidth);
          checkNewPage(lines.length * 5 + 4);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(30, 41, 59);

          for (const line of lines) {
            checkNewPage(6);
            doc.text(line, margin, y);
            y += 5.2;
          }
          y += 2.5;
        }

        doc.save(`${sanitizedTitle}.pdf`);
        return;
      } catch (err) {
        console.error('jsPDF generation error:', err);
      }
    }

    const blob = new Blob([rawContent], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizedTitle}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
