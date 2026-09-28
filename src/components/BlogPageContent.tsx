import React, { useState, useRef } from 'react';
import { Calendar, Search, X, ArrowLeft, Send, MessageSquare, Clock, Globe, BookOpen } from 'lucide-react';
import { BlogItem, BlogComment } from '../types';
import { ReadingProgressBar } from './ReadingProgressBar';

const techThumbnails = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800'
];

const getTechImage = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % techThumbnails.length;
  return techThumbnails[index];
};

interface BlogPageContentProps {
  is3DMode?: boolean;
  blogPosts: BlogItem[];
  onUpdateBlogPosts: (posts: BlogItem[]) => void;
  renderSearchBar: (placeholder: string) => React.ReactNode;
  searchQuery: string;
}

export const BlogPageContent: React.FC<BlogPageContentProps> = ({
  is3DMode = true,
  blogPosts,
  onUpdateBlogPosts,
  renderSearchBar,
  searchQuery
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<BlogItem | null>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedArticle(null);
      }
    };
    const handleSelectBlogPost = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.postId) {
        const found = blogPosts.find(p => p.id === customEvent.detail.postId);
        if (found) {
          setSelectedArticle(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('rexlify-select-blog-post', handleSelectBlogPost);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('rexlify-select-blog-post', handleSelectBlogPost);
    };
  }, [blogPosts]);

  // New comment states for selected article
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Categorization
  const categories = ['All', 'AI Tech', 'Web Development', 'Cybersecurity', 'Web3 & Cloud'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured post is the first unmatched one or simply the first
  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor || !commentText || !selectedArticle) return;

    const newComment: BlogComment = {
      id: `bc-${Date.now()}`,
      author: commentAuthor,
      content: commentText,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedPosts = blogPosts.map(p => {
      if (p.id === selectedArticle.id) {
        return {
          ...p,
          comments: [newComment, ...p.comments]
        };
      }
      return p;
    });

    onUpdateBlogPosts(updatedPosts);
    localStorage.setItem('rexlify_blog', JSON.stringify(updatedPosts));

    // Update local state reader copy
    setSelectedArticle({
      ...selectedArticle,
      comments: [newComment, ...selectedArticle.comments]
    });

    setCommentAuthor('');
    setCommentText('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 3000);
  };

  // Full reading view overlay
  if (selectedArticle) {
    return (
      <div ref={articleContentRef} className="py-12 space-y-8 animate-fadeIn relative">
        <ReadingProgressBar
          targetRef={articleContentRef}
          title={selectedArticle.title}
          category={selectedArticle.category}
          estimatedTime={selectedArticle.readingTime}
          showFloatingControls={true}
        />

        <button 
          onClick={() => setSelectedArticle(null)}
          className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          RETURN TO ARCHIVE
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Article Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-[10px]">
                <span className="font-mono text-[#be123c] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded font-bold uppercase">
                  {selectedArticle.category}
                </span>
                <span className="font-mono text-gray-500 flex items-center gap-1">
                  <Clock size={11} />
                  {selectedArticle.readingTime}
                </span>
                <span className="font-mono text-gray-500 flex items-center gap-1">
                  <Calendar size={11} />
                  {selectedArticle.date}
                </span>
              </div>

              <h1 className="font-sora text-2xl md:text-4xl font-extrabold text-white leading-tight">
                {selectedArticle.title}
              </h1>

              <p className="text-gray-400 font-mono text-[11px] leading-relaxed uppercase border-l-2 border-[#be123c] pl-4">
                TRANSMISSION AUTHOR: {selectedArticle.author} // CORE MATRIX LOGS
              </p>
            </div>

            {/* Simulated Hero Header Banner */}
            <div className="h-64 rounded-3xl bg-gradient-to-tr from-rose-950/40 via-purple-950/20 to-cyan-950/30 border border-white/5 relative overflow-hidden flex items-center justify-center p-6 text-center">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="z-10 bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 max-w-md">
                <span className="text-2xl">⚡</span>
                <p className="text-xs font-mono text-gray-300 mt-2">SECURE END-TO-END DEPLOYMENT GRAPH VIEW</p>
              </div>
            </div>

            {/* Rich text body layout */}
            <div 
              className="text-gray-300 text-xs md:text-sm font-light leading-loose space-y-4 text-justify whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />

            {/* Tags collection */}
            <div className="flex flex-wrap gap-2 border-t border-white/5 pt-6">
              {selectedArticle.tags.map((tag, idx) => (
                <span key={idx} className="font-mono text-[9px] text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Sidebar Engagement, comments matrix */}
          <div className="space-y-6">
            <div className="glassmorphic-card p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h3 className="font-sora text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare size={15} className="text-emerald-400" />
                  Operator Comments
                </h3>
                <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">
                  {selectedArticle.comments.length} transmissions audited
                </p>
              </div>

              {/* Add comment Form */}
              <div className="space-y-4">
                <h4 className="font-sora text-[10px] text-gray-400 uppercase font-bold tracking-wide">Write a feedback comment</h4>
                
                {commentSuccess ? (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-lg text-center font-mono text-[9px]">
                    ✓ COMMENT INTEGRATED SECURELY.
                  </div>
                ) : (
                  <form onSubmit={handlePostComment} className="space-y-3">
                    <div className="space-y-1">
                      <input 
                        type="text" 
                        required
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        placeholder="Alias (e.g. AgentSmith)" 
                        id="blog-comment-form-author"
                        className="w-full text-xs font-mono px-3.5 py-2 rounded-xl border border-white/5 bg-white/[0.01] text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <textarea 
                        rows={3} 
                        required
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Type commentary notes..." 
                        id="blog-comment-form-text"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/[0.01] text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-2 bg-[#be123c] hover:bg-rose-700 text-white rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send size={11} />
                      Transmit comment
                    </button>
                  </form>
                )}
              </div>

              {/* Feed items list */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 hide-scrollbar">
                {selectedArticle.comments.length === 0 ? (
                  <p className="font-mono text-[9px] text-gray-500 text-center py-4">NO COMMENT ENTRIES LOGGED.</p>
                ) : (
                  selectedArticle.comments.map((comm) => (
                    <div key={comm.id} className="p-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-sora font-semibold text-[#be123c]">{comm.author}</span>
                        <span className="font-mono text-gray-500 text-[8px]">{comm.date}</span>
                      </div>
                      <p className="text-gray-300 text-xs font-light leading-relaxed">{comm.content}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-12 animate-fadeIn">
      {/* Search and category filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="space-y-1">
          <span className="font-mono text-xs tracking-[0.25em] text-[#be123c] uppercase font-semibold">REXLIFY LOGICAL BLUEPRINTS</span>
          <h1 className="font-sora text-3xl font-extrabold text-white tracking-tight">Ecosystem Tech Library</h1>
        </div>
        
        {renderSearchBar('Search articles registry...')}
      </div>

      {/* Category Selection Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-white/5 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-wider transition-all border-b-2 cursor-pointer ${
              activeCategory === cat
                ? 'border-[#be123c] text-white'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-mono text-xs space-y-2">
          <span>📪</span>
          <p className="uppercase">No blueprints resolved under search criteria.</p>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Top Featured Post Highlight Banner with Image */}
          {featuredPost && searchQuery === '' && activeCategory === 'All' && (
            <div 
              onClick={() => setSelectedArticle(featuredPost)}
              className="glassmorphic-card rounded-3xl border border-white/5 overflow-hidden grid grid-cols-1 md:grid-cols-5 hover:border-emerald-500/20 hover:shadow-[0_0_35px_rgba(244,63,94,0.12)] transition-all cursor-pointer group relative"
            >
              {/* Glowing Glastic pulse point indicating featured status */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-widest text-emerald-400 z-10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                FEATURED BLUEPRINT
              </div>

              {/* Image Column */}
              <div className="md:col-span-2 min-h-[250px] relative overflow-hidden">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60 md:to-[#07080d]/90" />
              </div>

              {/* Details Column */}
              <div className="md:col-span-3 p-6 md:p-10 flex flex-col justify-between gap-4 relative z-0">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="font-mono text-emerald-400 uppercase tracking-wide font-extrabold">{featuredPost.category}</span>
                    <span>•</span>
                    <span className="font-mono flex items-center gap-1">
                      <Clock size={11} /> 
                      {featuredPost.readTime || (featuredPost as any).readingTime || "5 min read"}
                    </span>
                  </div>
                  <h3 className="font-sora text-xl md:text-2xl font-extrabold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-400 text-xs font-light leading-relaxed line-clamp-3">
                    {featuredPost.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 leading-none">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[8px] font-bold">R</div>
                    <span>{featuredPost.author}</span>
                  </div>
                  <span className="text-xs text-emerald-500 font-mono font-bold hover:text-white transition-all flex items-center gap-1.5 group-hover:translate-x-1 duration-300">
                    READ BLUEPRINT
                    <ArrowLeft size={12} className="rotate-180" />
                  </span>
                </div>
              </div>
            </div>
          )}
               {/* Feed articles grid list with rich thumbnail photos and glastic points */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance] space-y-6">
            {(searchQuery !== '' || activeCategory !== 'All' ? filteredPosts : gridPosts).map((post) => {
              const thumbnailSrc = getTechImage(post.id);
              // Staggered aspects to make the masonry highly visible and authentic
              let titleHash = 0;
              for (let i = 0; i < post.title.length; i++) {
                titleHash = post.title.charCodeAt(i) + ((titleHash << 5) - titleHash);
              }
              const aspectClass = Math.abs(titleHash) % 3 === 0 ? 'aspect-[4/3]' : Math.abs(titleHash) % 3 === 1 ? 'aspect-video' : 'aspect-square';

              return (
                <div 
                  key={post.id}
                  onClick={() => setSelectedArticle(post)}
                  className={`break-inside-avoid inline-block w-full mb-8 bg-[#050505] rounded-[2rem] overflow-hidden border border-white/10 transition-all cursor-pointer group relative text-left ${is3DMode ? "hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:-translate-y-2 duration-500 shadow-2xl transform perspective-1000" : "hover:border-emerald-500/20 hover:shadow-[0_0_35px_rgba(16,185,129,0.12)] duration-300"}`}
                >
                  {/* Glowing neon hover gradient overlay */}
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-emerald-500/0 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Visual Glastic point on card head */}
                  <div className="absolute top-3 right-3 flex h-2 w-2 z-10 font-mono">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>

                  {/* Grid Item Card Thumbnail Image */}
                  <div className={`${aspectClass} w-full overflow-hidden relative border-b border-white/5`}>
                    <img 
                      src={thumbnailSrc} 
                      alt={post.title} 
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700 pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-2.5 left-3 font-mono text-[8px] text-emerald-400 tracking-widest uppercase bg-black/60 border border-white/10 px-2.5 py-0.5 rounded font-extrabold select-none">
                      {post.category}
                    </span>
                  </div>

                  {/* Grid Item Content Area */}
                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] font-mono text-gray-500">
                        <span>{post.date}</span>
                        <span>{post.readTime || (post as any).readingTime || "4 min read"}</span>
                      </div>
                      <h3 className="font-sora text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors duration-200 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-xxs font-light leading-relaxed line-clamp-3">
                        {post.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <span className="text-[9px] text-gray-500 font-mono">
                        👤 {post.author}
                      </span>
                      <span className="text-[9px] text-emerald-500 font-mono font-extrabold flex items-center gap-1 uppercase group-hover:text-white transition-colors duration-200">
                        READ SPEC
                        <Clock size={10} className="animate-pulse" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};
