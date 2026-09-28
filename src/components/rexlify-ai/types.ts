export type RexlifyAiTab = 
  | 'dashboard'
  | 'chat'
  | 'voice'
  | 'assignment'
  | 'study'
  | 'pdf'
  | 'excel'
  | 'code'
  | 'uiux'
  | 'projects'
  | 'files'
  | 'tools'
  | 'memory'
  | 'analytics'
  | 'settings';

export type FileAnalysisStage = 
  | 'idle'
  | 'uploading'
  | 'reading'
  | 'analyzing'
  | 'preparing'
  | 'ready';

export interface ChartDataPayload {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: Array<{ [key: string]: string | number }>;
  xAxisKey: string;
  dataKeys: string[];
  explanation?: string;
}

export interface AttachmentPayload {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'excel' | 'doc' | 'code';
  size: string;
  dataUrl?: string;
  pageCount?: number;
  preview?: string;
  status?: FileAnalysisStage;
}

export interface GeneratedFileCard {
  id: string;
  title: string;
  filename: string;
  fileType: 'pdf' | 'excel' | 'markdown' | 'docx';
  size: string;
  downloadUrl?: string;
  content?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachment?: AttachmentPayload;
  analysisStage?: FileAnalysisStage;
  chartData?: ChartDataPayload;
  generatedFile?: GeneratedFileCard;
  isStreaming?: boolean;
  actions?: {
    isAssignment?: boolean;
    isCode?: boolean;
    isStudy?: boolean;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  lastMessagePreview?: string;
  syncStatus: 'synced' | 'syncing' | 'offline';
  category?: string;
}

export type VoiceEngineState = 
  | 'idle' 
  | 'listening' 
  | 'processing' 
  | 'speaking' 
  | 'interrupted' 
  | 'error';

export type VoiceSpeed = 'slow' | 'normal' | 'fast';

export type VoicePersonaId = 'ayesha' | 'priya' | 'zoya' | 'sophia';

export interface VoicePersona {
  id: VoicePersonaId;
  name: string;
  age: string;
  role: string;
  traits: string[];
  emotionDescription: string;
  pitch: number;
  rateMultiplier: number;
  sampleGreeting: {
    en: string;
    bn: string;
  };
}

export interface VoiceModeSettings {
  autoSpeak: boolean;
  speed: VoiceSpeed;
  personaId: VoicePersonaId;
  language: 'bn-BD' | 'en-US';
}


export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  notesCount: number;
  filesCount: number;
  tasksCount: number;
  tasks: TaskItem[];
  notes: string[];
}

export interface TaskItem {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  dueDate?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'image' | 'doc' | 'code';
  size: string;
  uploadedAt: string;
  projectId?: string;
  contentSnippet?: string;
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'style' | 'project' | 'academic';
  title: string;
  description: string;
  active: boolean;
}

export interface AiToolItem {
  id: string;
  name: string;
  category: 'Study' | 'Documents' | 'Data' | 'Coding' | 'Creative';
  description: string;
  icon: string;
  targetTab: RexlifyAiTab;
}

export interface AssignmentConfig {
  topic: string;
  subject: string;
  academicLevel: 'High School' | 'Undergraduate' | 'Graduate' | 'Doctoral';
  wordCount: number;
  citationStyle: 'APA 7th' | 'MLA 9th' | 'IEEE' | 'Chicago';
  language: 'en' | 'bn' | 'hi';
  format: 'Standard Academic' | 'Case Study' | 'Technical Report' | 'Literature Review';
}
