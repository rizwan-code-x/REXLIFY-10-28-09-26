/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  ImageIcon, 
  Code, 
  FileText, 
  Layout, 
  Eye, 
  Copy, 
  Check, 
  Save, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  Zap, 
  Layers, 
  UserCheck, 
  LogIn 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ImageAnalysisResult {
  summary: string;
  analysisText: string;
  tags: string[];
  detectedObjects: string[];
  codeSnippet?: string;
  modelUsed?: string;
}

const SAMPLE_IMAGES = [
  {
    name: 'Mobile App Wireframe',
    url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
    mode: 'ui-design',
    prompt: 'Evaluate the layout structure, typography hierarchy, and UI design contrast.'
  },
  {
    name: 'Dashboard UI Screenshot',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    mode: 'code-extractor',
    prompt: 'Extract the metrics overview layout into React + Tailwind code.'
  },
  {
    name: 'Document & Receipt',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    mode: 'ocr-text',
    prompt: 'Extract all numerical numbers, dates, and line items.'
  }
];

export const ImageAnalyzer: React.FC = () => {
  const { user, signInWithGoogle, savedAnalyses, saveAnalysisToFirestore } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_IMAGES[0].url);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [analysisMode, setAnalysisMode] = useState<'general' | 'ui-design' | 'code-extractor' | 'ocr-text'>('ui-design');
  const [customPrompt, setCustomPrompt] = useState<string>(SAMPLE_IMAGES[0].prompt);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    setMimeType(file.type);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleSelect = (sample: typeof SAMPLE_IMAGES[0]) => {
    setSelectedImage(sample.url);
    setAnalysisMode(sample.mode as any);
    setCustomPrompt(sample.prompt);
    setMimeType('image/jpeg');
    setResult(null);
    setErrorMsg(null);
  };

  const runAnalysis = async () => {
    if (!selectedImage) {
      setErrorMsg('Please upload or select an image first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      let base64Data = selectedImage;
      // If it's a external sample URL, fetch it and convert to base64
      if (selectedImage.startsWith('http')) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        base64Data = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          prompt: customPrompt,
          mode: analysisMode
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to analyze image with Gemini.');
      }

      const data: ImageAnalysisResult = await res.json();
      setResult(data);

      // Auto-save to Firestore if user is authenticated
      if (user) {
        await saveAnalysisToFirestore({
          prompt: customPrompt || 'Visual Image Analysis',
          mode: analysisMode,
          analysisResult: data.analysisText,
          summary: data.summary,
          modelUsed: data.modelUsed || 'gemini-3.1-pro-preview',
          imageUrl: selectedImage.length < 500 ? selectedImage : undefined
        });
        setSavedSuccess(true);
      }
    } catch (err: any) {
      console.error('Image analysis error:', err);
      setErrorMsg(err.message || 'An error occurred while calling Gemini Vision API.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyCode = () => {
    if (result?.codeSnippet) {
      navigator.clipboard.writeText(result.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 py-6 px-4 md:px-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-black p-8 border border-rose-500/20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs uppercase tracking-widest font-bold">
              <Sparkles size={14} className="animate-spin-slow" />
              Powered by gemini-3.1-pro-preview
            </div>
            <h1 className="text-3xl md:text-4xl font-sora font-extrabold text-white tracking-tight">
              AI Vision & Image Understanding
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl font-light">
              Upload photos, app wireframes, UI screenshots, or documents. Gemini 3.1 Pro Preview performs deep visual recognition, extracts UI code, and persists analysis history to your Firestore database.
            </p>
          </div>

          {!user ? (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-mono text-xs uppercase tracking-wider font-extrabold hover:bg-gray-200 transition-all shadow-lg cursor-pointer shrink-0"
            >
              <LogIn size={16} />
              Sign in to Save Scans
            </button>
          ) : (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
              <UserCheck size={16} className="text-emerald-400 shrink-0" />
              <div>
                <span className="text-white font-bold block">{user.displayName || 'Connected User'}</span>
                <span className="text-[10px] text-emerald-400">Syncing with Firestore</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Selector & Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Mode Selector */}
          <div className="bg-[#050212] border border-white/10 rounded-2xl p-5 space-y-4">
            <label className="font-mono text-xs text-rose-400 uppercase tracking-widest font-bold block">
              1. Choose Analysis Engine Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'ui-design', label: 'UI/UX Critique', icon: Layout },
                { id: 'code-extractor', label: 'React Code', icon: Code },
                { id: 'general', label: 'Scene Vision', icon: Eye },
                { id: 'ocr-text', label: 'Text OCR', icon: FileText },
              ].map((m) => {
                const Icon = m.icon;
                const active = analysisMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setAnalysisMode(m.id as any)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      active 
                        ? 'bg-rose-500/20 border-rose-500 text-white shadow-lg shadow-rose-500/10' 
                        : 'bg-black/40 border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-rose-400' : 'text-gray-500'} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Dropzone & Display */}
          <div className="bg-[#050212] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs text-rose-400 uppercase tracking-widest font-bold">
                2. Selected Image Target
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Upload size={14} /> Upload Custom
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Image Preview Box */}
            <div className="relative aspect-video rounded-xl border border-dashed border-white/15 bg-black/60 overflow-hidden flex items-center justify-center group">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Selected for analysis"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <ImageIcon size={32} className="mx-auto text-gray-600" />
                  <p className="text-xs text-gray-400 font-mono">No image loaded yet</p>
                </div>
              )}
            </div>

            {/* Preset Sample Thumbnails */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-bold block">
                Or pick sample preset:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleSelect(sample)}
                    className={`relative rounded-lg overflow-hidden border aspect-video transition-all cursor-pointer ${
                      selectedImage === sample.url ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/80 text-[8px] font-mono text-gray-300 p-1 truncate text-center">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Input & Execute */}
          <div className="bg-[#050212] border border-white/10 rounded-2xl p-5 space-y-4">
            <label className="font-mono text-xs text-rose-400 uppercase tracking-widest font-bold block">
              3. Prompt & Custom Instructions
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ask a specific question about the image..."
              rows={3}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-rose-500 transition-all resize-none"
            />

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-mono text-xs uppercase tracking-widest font-extrabold shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Analyzing with Gemini 3.1 Pro...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analyze Image with Gemini
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Analysis Results & Persistence History */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Output Canvas */}
          <div className="bg-[#050212] border border-white/10 rounded-2xl p-6 min-h-[450px] flex flex-col justify-between space-y-6 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-rose-400" />
                <h2 className="font-sora font-bold text-white text-lg">
                  Gemini Vision Insights
                </h2>
              </div>
              {result?.modelUsed && (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold">
                  {result.modelUsed}
                </span>
              )}
            </div>

            {/* Analysis Result State */}
            {isAnalyzing ? (
              <div className="my-auto py-16 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
                  <Sparkles size={24} className="absolute inset-0 m-auto text-rose-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-sm text-white font-bold">Processing Visual Multimodal Embeddings...</p>
                  <p className="text-xs font-mono text-gray-500">Gemini 3.1 Pro Preview is parsing visual features</p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6">
                
                {/* Executive Summary */}
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                  <span className="font-mono text-[10px] text-rose-400 uppercase tracking-widest font-bold block">
                    Executive Summary
                  </span>
                  <p className="text-sm text-gray-200 font-sora font-medium leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* Tags & Detected Objects */}
                {((result.tags && result.tags.length > 0) || (result.detectedObjects && result.detectedObjects.length > 0)) && (
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-bold block">
                      Visual Tags & Identified Components
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.tags?.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-[10px] font-mono">
                          #{t}
                        </span>
                      ))}
                      {result.detectedObjects?.map((obj, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                          ✓ {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Analysis Text */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-bold block">
                    Detailed Observations
                  </span>
                  <div className="p-4 rounded-xl bg-black/60 border border-white/5 text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto no-scrollbar">
                    {result.analysisText}
                  </div>
                </div>

                {/* Code Snippet if Extracted */}
                {result.codeSnippet && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-rose-400 uppercase tracking-widest font-bold">
                        Extracted React + Tailwind Code Snippet
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="text-[10px] font-mono text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedCode ? 'Copied' : 'Copy Snippet'}
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-[#02000a] border border-white/10 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-60 no-scrollbar">
                      <code>{result.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {savedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                    <Check size={14} />
                    <span>Analysis log saved to Firestore under user profile.</span>
                  </div>
                )}

              </div>
            ) : (
              <div className="my-auto py-16 text-center space-y-3">
                <Layers size={36} className="mx-auto text-gray-600" />
                <div className="space-y-1">
                  <p className="font-sora text-sm text-gray-300 font-bold">Ready for Image Analysis</p>
                  <p className="text-xs font-mono text-gray-500 max-w-sm mx-auto">
                    Select an image and click "Analyze Image with Gemini" to produce visual insights or extracted UI code.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Firestore Saved Scans History Panel */}
          {user && (
            <div className="bg-[#050212] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Save size={16} className="text-emerald-400" />
                  <h3 className="font-sora text-sm text-white font-bold">
                    Your Saved Scans (Firestore Sync)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-gray-500">
                  {savedAnalyses.length} Saved Records
                </span>
              </div>

              {savedAnalyses.length === 0 ? (
                <p className="text-xs font-mono text-gray-500 py-4 text-center">
                  No saved scans yet. Scans generated while logged in automatically store to Firestore.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto no-scrollbar">
                  {savedAnalyses.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all text-left space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[9px] font-mono font-bold uppercase">
                          {item.mode}
                        </span>
                        <span className="text-[9px] font-mono text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-sora text-gray-200 line-clamp-1 font-semibold">
                        {item.summary || item.prompt}
                      </p>
                      <p className="text-[10px] font-mono text-gray-400 line-clamp-2">
                        {item.analysisResult}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
