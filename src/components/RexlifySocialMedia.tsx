/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Share2, Youtube, Play, Volume2, VolumeX, 
  ExternalLink, Sparkles, Film, ArrowLeft, Bookmark, Check, Flame, 
  Tv, Compass, Maximize2, X, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { ActiveView } from './Navbar';
import { RexlifyLogo } from './Logo';

interface RexlifySocialMediaProps {
  setView: (view: ActiveView) => void;
}

interface ReelItem {
  id: string;
  youtubeId: string;
  title: string;
  creator: string;
  likes: number;
  initialLikesFormatted: string;
  comments: number;
  shares: number;
  tag: string;
  caption: string;
}

const REELS_DATA: ReelItem[] = [
  {
    id: 'reel-1',
    youtubeId: '6gtZ4gCaoP8',
    title: 'Campus Vibe & Creative Energy',
    creator: '@rexlifyprimeofficial',
    likes: 5420,
    initialLikesFormatted: '5.4k',
    comments: 342,
    shares: 184,
    tag: '#CampusLife #RexlifyPrime',
    caption: 'Moments from the Kalyani University grounds. Feel the youth rhythm! 🎬✨'
  },
  {
    id: 'reel-2',
    youtubeId: '94K4g3NIl10',
    title: 'Behind the Scenes of Oi Villain!',
    creator: '@rexlifyprimeofficial',
    likes: 9240,
    initialLikesFormatted: '9.2k',
    comments: 618,
    shares: 432,
    tag: '#OiVillain #FilmMaking',
    caption: 'The hard work, laughter, and retakes behind our official campus drama. 🎥🔥'
  },
  {
    id: 'reel-3',
    youtubeId: 'aGS48fbzWD4',
    title: 'University Love Story Teaser',
    creator: '@rexlifyprimeofficial',
    likes: 14850,
    initialLikesFormatted: '14.8k',
    comments: 982,
    shares: 756,
    tag: '#LoveStory #KUStudents',
    caption: 'When glances speak louder than words in the library hallways. ❤️📖'
  },
  {
    id: 'reel-4',
    youtubeId: 'r2kNOjiTUg0',
    title: 'Campus Sunset Walk & Dialogue',
    creator: '@rexlifyprimeofficial',
    likes: 22310,
    initialLikesFormatted: '22.3k',
    comments: 1420,
    shares: 1120,
    tag: '#GoldenHour #BengaliCinema',
    caption: 'Golden hour at Kalyani. That one conversation that changed everything. 🌅'
  },
  {
    id: 'reel-5',
    youtubeId: 'klU9ivCrmiA',
    title: 'Original Soundtrack Sneak Peek',
    creator: '@rexlifyprimeofficial',
    likes: 18600,
    initialLikesFormatted: '18.6k',
    comments: 890,
    shares: 640,
    tag: '#OST #AcousticMelody',
    caption: 'Acoustic notes echoing across the auditorium. Listen with headphones! 🎧🎵'
  },
  {
    id: 'reel-6',
    youtubeId: 'bUSBWrO0GMQ',
    title: 'Climax Scene Behind The Lens',
    creator: '@rexlifyprimeofficial',
    likes: 31200,
    initialLikesFormatted: '31.2k',
    comments: 2140,
    shares: 1890,
    tag: '#DramaticClimax #Rexlify',
    caption: 'Director Rizwan RR setting up the final confrontation frame. Pure emotion! ⚡'
  }
];

export const RexlifySocialMedia: React.FC<RexlifySocialMediaProps> = ({ setView }) => {
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    REELS_DATA.forEach(r => { initial[r.id] = r.likes; });
    return initial;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalReel, setActiveModalReel] = useState<ReelItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const toggleLike = (id: string) => {
    setLikedReels(prev => {
      const isCurrentlyLiked = !!prev[id];
      const nextState = !isCurrentlyLiked;
      
      setLikeCounts(curr => ({
        ...curr,
        [id]: curr[id] + (nextState ? 1 : -1)
      }));

      return { ...prev, [id]: nextState };
    });
  };

  const handleShare = (reel: ReelItem) => {
    const url = `https://youtube.com/shorts/${reel.youtubeId}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(reel.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  };

  const openReelModal = (reel: ReelItem) => {
    setActiveModalReel(reel);
  };

  const closeReelModal = () => {
    setActiveModalReel(null);
  };

  const navigateReelModal = (direction: 'next' | 'prev') => {
    if (!activeModalReel) return;
    const currentIndex = REELS_DATA.findIndex(r => r.id === activeModalReel.id);
    if (currentIndex === -1) return;
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= REELS_DATA.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = REELS_DATA.length - 1;
    setActiveModalReel(REELS_DATA[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-[#07051a] dark:bg-[#07051a] text-white selection:bg-rose-500 selection:text-white pb-24 text-left transition-colors duration-300">
      
      {/* ----------------- SUB-NAVBAR HEADER ----------------- */}
      <div className="sticky top-0 z-40 bg-[#07051a]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('additional-systems')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Systems Hub</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-rose-600 text-white shadow-sm">
              <Film size={16} />
            </span>
            <span className="font-sora font-extrabold text-sm sm:text-base text-white tracking-tight">
              Rexlify Social Media
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[9px] font-mono text-rose-300 font-bold uppercase tracking-wider hidden md:inline">
              REELS HUB
            </span>
          </div>
        </div>

        {/* Subscribe Quick Link */}
        <a
          href="https://youtube.com/@rexlifyprimeofficial?sub_confirmation=1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-red-950/40 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Youtube size={15} />
          <span className="hidden sm:inline">Subscribe</span>
          <span className="bg-white/20 px-1.5 py-0.2 rounded text-[10px]">12.8k</span>
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* ----------------- HERO CHANNEL BANNER ----------------- */}
        <div className="relative rounded-3xl overflow-hidden border border-red-500/30 bg-gradient-to-r from-red-950/40 via-[#0f071a] to-rose-950/30 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 font-mono text-[10px] font-bold uppercase tracking-widest">
                <Youtube size={14} className="text-red-500 animate-pulse" />
                <span>OFFICIAL YOUTUBE MEDIA CHANNEL</span>
              </div>
              <h1 className="font-sora font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                Rexlify Prime Productions
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm font-sans leading-relaxed">
                Experience original Bengali campus cinema, immersive student narratives, creative university life reels, and technical innovation documentaries produced under the Rexlify banner.
              </p>
            </div>

            {/* Subscribe Banner Action */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
              <a
                href="https://youtube.com/@rexlifyprimeofficial?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                id="subscribe-rexlify-prime-banner-btn"
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-xl shadow-red-900/50 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Youtube size={20} />
                <span>Subscribe to Rexlify Prime</span>
              </a>
              <span className="text-[10px] font-mono text-gray-400 text-center">
                Channel URL: youtube.com/@rexlifyprimeofficial
              </span>
            </div>
          </div>
        </div>

        {/* ----------------- FEATURED LONG VIDEO ----------------- */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Film size={20} />
              </div>
              <div>
                <span className="font-mono text-[10px] text-rose-400 uppercase tracking-widest font-extrabold block">
                  FEATURED LONG PRODUCTION
                </span>
                <h2 className="font-sora font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                  Oi Villain! | Kalyani University Campus Love Story
                </h2>
              </div>
            </div>

            <a
              href="https://www.youtube.com/watch?v=PGuDG0MfryE"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              <span>Watch on YouTube</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Long Video Player Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 backdrop-blur-xl space-y-4 shadow-2xl">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-inner">
              <iframe
                src="https://www.youtube.com/embed/PGuDG0MfryE?rel=0&modestbranding=1"
                title="Oi Villain! | Kalyani University Campus Love Story"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 font-bold uppercase">
                    OFFICIAL RELEASE
                  </span>
                  <span className="text-gray-400 text-xs font-mono">18m 42s • Full HD</span>
                </div>
                <p className="text-xs text-gray-300 font-sans max-w-3xl leading-relaxed">
                  A heart-touching university romance drama directed by Rizwan RR. Shot on location across the historic Kalyani University campus, capturing true emotion, youth ambition, and unspoken promises.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://www.youtube.com/watch?v=PGuDG0MfryE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Play size={14} />
                  <span>Open Full Screen on YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------- SHORTS GRID / INSTAGRAM REELS-STYLE FEED ----------------- */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-500 text-white shadow-md">
                <Flame size={20} />
              </div>
              <div>
                <span className="font-mono text-[10px] text-rose-400 uppercase tracking-widest font-extrabold block">
                  VERTICAL SHORTS & REELS FEED
                </span>
                <h2 className="font-sora font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                  Instagram Reels-Style Social Feed
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 cursor-pointer"
                title="Toggle Audio Hint"
              >
                {isMuted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} className="text-emerald-400" />}
                <span>{isMuted ? 'Muted' : 'Audio Active'}</span>
              </button>
            </div>
          </div>

          {/* 9:16 Vertical Reels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {REELS_DATA.map((reel) => {
              const isLiked = !!likedReels[reel.id];
              const currentLikeCount = likeCounts[reel.id] || reel.likes;

              return (
                <div 
                  key={reel.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-rose-500/40 transition-all duration-300 flex flex-col group"
                >
                  {/* Reel Header */}
                  <div className="p-3.5 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-[#07051a] flex items-center justify-center text-[10px] font-bold text-white">
                          RR
                        </div>
                      </div>
                      <div className="leading-tight">
                        <span className="font-sora font-bold text-xs text-white block">
                          Rexlify Prime
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {reel.creator}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`https://youtube.com/shorts/${reel.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Open on YouTube Shorts"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Vertical 9:16 Player Container */}
                  <div className="relative w-full aspect-[9/16] bg-black overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${reel.youtubeId}?rel=0&modestbranding=1&loop=1&playlist=${reel.youtubeId}`}
                      title={reel.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />

                    {/* Floating Expand Overlay Button */}
                    <button
                      type="button"
                      onClick={() => openReelModal(reel)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/90 hover:scale-110 transition-all cursor-pointer opacity-80 hover:opacity-100 shadow-md"
                      title="Expand to Full Instagram Reel View"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>

                  {/* Reel Interactive Social Metrics Bar */}
                  <div className="p-4 space-y-3 bg-[#07051a]/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Like Heart Button */}
                        <button
                          type="button"
                          onClick={() => toggleLike(reel.id)}
                          className="flex items-center gap-1.5 group/btn cursor-pointer transition-transform active:scale-125"
                          title="Like Reel"
                        >
                          <Heart 
                            size={20} 
                            className={`transition-colors ${isLiked ? 'fill-rose-500 text-rose-500 animate-scaleUp' : 'text-gray-300 group-hover/btn:text-rose-400'}`} 
                          />
                          <span className={`text-xs font-mono font-bold ${isLiked ? 'text-rose-400' : 'text-gray-300'}`}>
                            {formatCount(currentLikeCount)}
                          </span>
                        </button>

                        {/* Comments Count */}
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <MessageCircle size={18} className="text-gray-400" />
                          <span className="text-xs font-mono">{reel.comments}</span>
                        </div>

                        {/* Share Button */}
                        <button
                          type="button"
                          onClick={() => handleShare(reel)}
                          className="flex items-center gap-1.5 text-gray-300 hover:text-cyan-400 transition-colors cursor-pointer"
                          title="Share Reel Link"
                        >
                          {copiedId === reel.id ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
                          <span className="text-xs font-mono">{copiedId === reel.id ? 'Copied!' : reel.shares}</span>
                        </button>
                      </div>

                      <a
                        href={`https://youtube.com/shorts/${reel.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                        title="Watch on YouTube"
                      >
                        <Youtube size={16} />
                      </a>
                    </div>

                    {/* Caption & Title */}
                    <div className="space-y-1 text-left">
                      <h4 className="font-sora font-bold text-xs text-white tracking-tight line-clamp-1">
                        {reel.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-sans line-clamp-2 leading-relaxed">
                        {reel.caption}
                      </p>
                      <span className="text-[10px] font-mono text-rose-400 block pt-0.5">
                        {reel.tag}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* ----------------- INSTAGRAM REELS EXPANDED FULL-SCREEN MODAL ----------------- */}
      {activeModalReel && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-6 animate-fadeIn"
          onClick={closeReelModal}
        >
          {/* Modal Container */}
          <div 
            className="relative w-full max-w-sm sm:max-w-md h-[90vh] bg-[#07051a] rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  Reel Viewer
                </span>
              </div>

              <button
                type="button"
                onClick={closeReelModal}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-all cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Iframe in Full Height 9:16 */}
            <div className="flex-1 w-full bg-black relative">
              <iframe
                src={`https://www.youtube.com/embed/${activeModalReel.youtubeId}?autoplay=1&rel=0&modestbranding=1&loop=1&playlist=${activeModalReel.youtubeId}`}
                title={activeModalReel.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

              {/* Navigation Arrows */}
              <button
                type="button"
                onClick={() => navigateReelModal('prev')}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all cursor-pointer"
                title="Previous Reel"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => navigateReelModal('next')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all cursor-pointer"
                title="Next Reel"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Bottom Meta & Action Bar */}
            <div className="p-4 bg-black/90 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleLike(activeModalReel.id)}
                    className="flex items-center gap-1.5 cursor-pointer text-xs font-mono font-bold"
                  >
                    <Heart 
                      size={22} 
                      className={likedReels[activeModalReel.id] ? 'fill-rose-500 text-rose-500' : 'text-white'} 
                    />
                    <span>{formatCount(likeCounts[activeModalReel.id] || activeModalReel.likes)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(activeModalReel)}
                    className="flex items-center gap-1.5 cursor-pointer text-xs font-mono"
                  >
                    <Share2 size={20} className="text-white" />
                    <span>{copiedId === activeModalReel.id ? 'Copied' : activeModalReel.shares}</span>
                  </button>
                </div>

                <a
                  href={`https://youtube.com/shorts/${activeModalReel.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white font-mono text-xs font-bold cursor-pointer"
                >
                  <Youtube size={14} />
                  <span>Open Shorts</span>
                </a>
              </div>

              <div className="text-left">
                <h3 className="font-sora font-bold text-sm text-white">{activeModalReel.title}</h3>
                <p className="text-xs text-gray-300 font-sans mt-0.5 line-clamp-2">{activeModalReel.caption}</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
