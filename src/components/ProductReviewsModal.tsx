import React, { useEffect, useState } from 'react';
import { X, Check, Star, MessageSquare, Send } from 'lucide-react';
import { ProductItem, Review } from '../types';

interface ProductReviewsModalProps {
  products: ProductItem[];
  onUpdateProducts: (products: any[]) => void; // Syncs up state
}

export const ProductReviewsModal: React.FC<ProductReviewsModalProps> = ({ products, onUpdateProducts }) => {
  const [activeProduct, setActiveProduct] = useState<ProductItem | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const product = (e as CustomEvent).detail as ProductItem;
      // Fetch latest product reference from array to grab any newly made reviews
      const freshProd = products.find(p => p.id === product.id) || product;
      setActiveProduct(freshProd);
      setIsSuccess(false);
    };

    const root = document.getElementById('product-reviews-modal-root');
    if (root) {
      root.addEventListener('open-reviews', handleOpen);
    }

    return () => {
      if (root) {
        root.removeEventListener('open-reviews', handleOpen);
      }
    };
  }, [products]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !reviewContent || !activeProduct) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: authorName,
      rating: reviewRating,
      comment: reviewContent,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedReviews = [newReview, ...activeProduct.reviews];
    
    // Calculate new average rating
    const totalScore = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalScore / updatedReviews.length).toFixed(1));

    const nextProducts = products.map(p => {
      if (p.id === activeProduct.id) {
        return {
          ...p,
          rating: avgRating,
          reviews: updatedReviews
        };
      }
      return p;
    });

    onUpdateProducts(nextProducts);
    
    // Save to local storage for persistence
    localStorage.setItem('rexlify_products', JSON.stringify(nextProducts));

    // Update locally too
    setActiveProduct({
      ...activeProduct,
      rating: avgRating,
      reviews: updatedReviews
    });
    
    setIsSuccess(true);
    setAuthorName('');
    setReviewContent('');
    setReviewRating(5);
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  if (!activeProduct) {
    return <div id="product-reviews-modal-root" className="hidden" />;
  }

  return (
    <div 
      id="product-reviews-modal-root" 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={() => setActiveProduct(null)}
    >
      <div 
        className="glassmorphic-card w-full max-w-xl rounded-3xl border border-white/10 bg-[#08051e] p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="space-y-1">
            <span className="font-mono text-[9px] text-[#22d3ee] uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/10">
              Reviews Desk
            </span>
            <h3 className="font-sora text-lg md:text-xl font-extrabold text-white">
              {activeProduct.name} Evaluations
            </h3>
          </div>
          <button 
            onClick={() => setActiveProduct(null)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Existing reviews list */}
        <div className="space-y-4 max-h-60 overflow-y-auto hide-scrollbar">
          <h4 className="font-sora text-xs font-bold text-gray-400 uppercase tracking-wider">
            Diagnostic Submissions ({activeProduct.reviews.length})
          </h4>
          
          {activeProduct.reviews.length === 0 ? (
            <div className="text-center py-6 text-gray-500 font-mono text-[10px]">
              NO REPORT LOGS RECORDED. WRITE AN EVALUATION DATA MATRIX!
            </div>
          ) : (
            <div className="space-y-3">
              {activeProduct.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sora font-semibold text-rose-400">{rev.author}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={10} 
                            className={i < rev.rating ? 'fill-current' : 'text-gray-700'} 
                          />
                        ))}
                      </div>
                      <span className="font-mono text-gray-500 text-[9px]">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-xs font-light leading-relaxed">{rev.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create new review form */}
        <div className="border-t border-white/5 pt-6 space-y-4">
          <h4 className="font-sora text-xs font-bold text-rose-500 uppercase tracking-wider">
            Log New Diagnostic Review
          </h4>

          {isSuccess ? (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center text-emerald-400 text-xs font-mono">
              ✓ REVIEW REGISTERED INTO PUBLIC CATALYST LOGS.
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-gray-500 uppercase">Operator Alias</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="E.g., DevNet-1"
                    id="new-review-form-author"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white focus:outline-none focus:border-rose-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-gray-500 uppercase">Star Matrix Rate (1-5)</label>
                  <div className="flex items-center gap-1.5 h-10">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewRating(i + 1)}
                        className="text-amber-400 hover:scale-110 active:scale-95 transition-all text-sm cursor-pointer"
                      >
                        <Star size={16} className={i < reviewRating ? 'fill-current' : 'text-gray-600'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[9px] text-gray-500 uppercase">Feedback content</label>
                <textarea
                  rows={2}
                  required
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Record empirical reviews, features evaluations, or crash exceptions info..."
                  id="new-review-form-text"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white focus:outline-none focus:border-rose-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-700 via-[#be123c] to-amber-600 font-mono text-xs font-bold text-white uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={12} />
                Submit Evaluation Review
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
