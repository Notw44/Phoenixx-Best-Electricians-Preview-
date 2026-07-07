import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquare, Plus, PenTool, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Review } from '../types';
import { supabase } from '../lib/supabase';

interface ReviewsSectionProps {
  reviews: Review[];
  onAddReview: (review: Review) => void;
}

export default function ReviewsSection({ reviews, onAddReview }: ReviewsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isAddingReview, setIsAddingReview] = useState(false);
  
  // New review form states
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'panel' | 'solar' | 'breaker' | 'ceiling_fan' | 'general'>('general');
  const [newTags, setNewTags] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Filter keys matching available reviews
  const filters = [
    { id: 'all', label: 'All Reviews (129+)' },
    { id: 'panel', label: 'Panel Upgrades' },
    { id: 'solar', label: 'Solar Systems' },
    { id: 'breaker', label: 'Breakers & Faults' },
    { id: 'ceiling_fan', label: 'Ceiling Fans & Switches' },
    { id: 'general', label: 'Condo & Custom' }
  ];

  const filteredReviews = activeFilter === 'all'
    ? reviews
    : reviews.filter(r => r.category === activeFilter);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newText) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    const tagsArray = newTags 
      ? newTags.split(',').map(t => t.trim()) 
      : [newCategory === 'panel' ? 'Panel' : newCategory === 'solar' ? 'Solar' : 'Service', 'Skilled'];

    let savedToSupabase = false;

    if (supabase) {
      try {
        // Attempt to insert with the exact requested mapped fields
        const { error } = await supabase
          .from('reviews')
          .insert([{
            name: newAuthor.trim(),
            service: newCategory,
            rating: newRating,
            review: newText.trim(),
            tags: tagsArray,
            approved: false
          }]);

        if (!error) {
          savedToSupabase = true;
          console.log("Review successfully saved directly to Supabase with mapped fields.");
        } else {
          // If error is about missing columns, try fallback to legacy schema
          if (error.message.includes('column') || error.message.includes('does not exist')) {
            console.warn("New schema columns missing, falling back to legacy reviews table columns.");
            const { error: fallbackError } = await supabase
              .from('reviews')
              .insert([{
                customer_name: newAuthor.trim(),
                rating: newRating,
                review: newText.trim(),
                approved: false
              }]);

            if (!fallbackError) {
              savedToSupabase = true;
              console.log("Review successfully saved to legacy Supabase reviews table.");
            } else {
              console.error("Direct Supabase fallback insert failed:", fallbackError.message);
              setSubmitStatus('error');
              setErrorMessage("Supabase error: " + fallbackError.message);
              setIsSubmitting(false);
              return;
            }
          } else {
            console.error("Direct Supabase insert failed:", error.message);
            setSubmitStatus('error');
            setErrorMessage("Supabase error: " + error.message);
            setIsSubmitting(false);
            return;
          }
        }
      } catch (err: any) {
        console.error("Direct Supabase exception:", err);
        setSubmitStatus('error');
        setErrorMessage("Supabase exception: " + (err.message || err));
        setIsSubmitting(false);
        return;
      }
    } else {
      console.warn("Supabase client is not configured/initialized. Trying server fallback...");
    }

    // Trigger API backend sync/fallback to maintain local database consistency
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newAuthor.trim(),
          service: newCategory,
          rating: newRating,
          review: newText.trim(),
          tags: tagsArray,
          approved: false,
          skipSupabase: savedToSupabase
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitSuccess(true);
        // Clear fields
        setNewAuthor('');
        setNewRating(5);
        setNewText('');
        setNewTags('');
      } else {
        const data = await response.json().catch(() => ({}));
        if (savedToSupabase) {
          setSubmitStatus('success');
          setSubmitSuccess(true);
          setNewAuthor('');
          setNewRating(5);
          setNewText('');
          setNewTags('');
          console.warn("Server sync returned a non-ok status, but direct Supabase insert succeeded:", data.error);
        } else {
          setSubmitStatus('error');
          setErrorMessage(data.error || 'Failed to sync with server.');
        }
      }
    } catch (err) {
      console.error("Failed to sync review via API:", err);
      if (savedToSupabase) {
        setSubmitStatus('success');
        setSubmitSuccess(true);
        setNewAuthor('');
        setNewRating(5);
        setNewText('');
        setNewTags('');
        console.info("Server sync network error, but direct Supabase insert succeeded.");
      } else {
        setSubmitStatus('error');
        setErrorMessage('A network error occurred during server sync.');
      }
    } finally {
      setIsSubmitting(false);
      // Reset success overlay after delay
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Visual Analytics Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-[#111111]/75 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
        {/* Left: Score Card */}
        <div className="text-center md:border-r md:border-white/10 md:pr-8 py-4">
          <p className="text-xs font-semibold text-[#888888] uppercase tracking-widest font-mono">Google Rating</p>
          <div className="flex justify-center items-baseline gap-2 mt-2">
            <span className="serif text-6xl font-light text-white leading-none">4.7</span>
            <span className="text-[#888888] text-sm font-mono">/ 5.0</span>
          </div>
          <div className="flex justify-center items-center gap-1 mt-3 text-[#FDE047]">
            {[1, 2, 3, 4].map(n => <Star key={n} className="w-5 h-5 fill-[#FDE047] text-[#FDE047]" />)}
            <div className="relative">
              <Star className="w-5 h-5 text-neutral-800" />
              <div className="absolute top-0 left-0 overflow-hidden w-[75%]">
                <Star className="w-5 h-5 fill-[#FDE047] text-[#FDE047]" />
              </div>
            </div>
          </div>
          <p className="text-neutral-400 text-xs mt-3 font-medium">
            Based on 129 authentic local reviews
          </p>
        </div>

        {/* Center: Rating Breakdown */}
        <div className="space-y-2 md:col-span-2">
          {[
            { stars: 5, pct: '88%', count: 114 },
            { stars: 4, pct: '9%', count: 12 },
            { stars: 3, pct: '2%', count: 2 },
            { stars: 2, pct: '1%', count: 1 },
            { stars: 1, pct: '0%', count: 0 },
          ].map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-xs sm:text-sm">
              <span className="w-3 text-[#888888] font-mono font-bold">{item.stars}</span>
              <Star className="w-3.5 h-3.5 fill-[#FDE047] text-[#FDE047]" />
              <div className="flex-1 h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-[#FDE047] rounded-full transition-all duration-1000" style={{ width: item.pct }} />
              </div>
              <span className="w-10 text-right text-neutral-400 font-mono text-xs">{item.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter.id === 'all' ? 'animate-luxury-glow' : ''
              } ${
                activeFilter === filter.id
                  ? 'bg-[#FDE047] text-[#0C0C0C]'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-[#888888] hover:text-white border border-white/5'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddingReview(!isAddingReview)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FDE047] hover:bg-[#FDE047]/90 text-[#0C0C0C] text-xs font-bold rounded-xl transition-all shadow-md active:scale-98 cursor-pointer animate-luxury-glow"
        >
          <PenTool className="w-4 h-4 text-[#0C0C0C]" /> Write Verified Review
        </button>
      </div>

      {/* Dynamic Review Submission Form */}
      {isAddingReview && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 relative shadow-2xl">
          {submitSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-12 h-12 bg-amber-950 text-[#FDE047] rounded-full flex items-center justify-center border border-[#FDE047]/25">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <p className="font-semibold text-white text-sm">Review Submitted Successfully!</p>
              <p className="text-xs text-neutral-300 max-w-sm text-center">
                Thank you for rating Phoenix Best Electricians! Your review is currently pending security verification and will appear on the live website once approved by central dispatch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="serif font-normal text-white text-base">Write a verified consumer review</h4>
                <button 
                  type="button" 
                  onClick={() => setIsAddingReview(false)} 
                  disabled={isSubmitting}
                  className="text-xs text-[#888888] hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              {submitStatus === 'error' && errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-955/20 border border-red-500/20 text-red-400 text-xs font-mono">
                  ⚠️ {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider font-mono">Your Name</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Sophie Copeland"
                    className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0C0C0C] text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider font-mono">Related Service</label>
                  <select
                    value={newCategory}
                    disabled={isSubmitting}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0C0C0C] text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm disabled:opacity-50"
                  >
                    <option value="panel" className="bg-[#111111]">Electrical Panel Upgrade</option>
                    <option value="solar" className="bg-[#111111]">Solar Installation</option>
                    <option value="breaker" className="bg-[#111111]">Breaker & Troubleshooting</option>
                    <option value="ceiling_fan" className="bg-[#111111]">Ceiling Fan & Switches</option>
                    <option value="general" className="bg-[#111111]">Condo / HOA Work</option>
                  </select>
                </div>
              </div>

              {/* Star rating selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider font-mono">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setNewRating(star)}
                      className="focus:outline-none group transition-transform active:scale-90 cursor-pointer disabled:opacity-50"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= newRating 
                            ? 'fill-[#FDE047] text-[#FDE047]' 
                            : 'text-neutral-700 hover:text-[#FDE047]'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-xs text-neutral-400 ml-2 font-semibold">({newRating}.0 / 5.0)</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider font-mono">Review Comments</label>
                <textarea
                  required
                  disabled={isSubmitting}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Tell others about your experience with Tracy..."
                  className="w-full p-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm min-h-[90px] disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider font-mono">Tags / Keywords (comma separated)</label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. Quick Service, Tracy, Knowledgeable"
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0C0C0C] text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#FDE047] hover:bg-[#FDE047]/90 text-[#0C0C0C] font-semibold text-sm rounded-xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Publishing Review...' : 'Publish Anonymous Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Reviews Render Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 pt-10 pb-16">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full py-12 text-center text-neutral-400 text-sm border border-dashed border-white/10 rounded-2xl bg-[#111111]/75 backdrop-blur-md">
            No reviews match this specific category yet. Write one above!
          </div>
        ) : (
          filteredReviews.map((review, index) => {
            // Expensive, organic floating offsets for asymmetric magazine-style layouts
            const offsets = [
              'md:-translate-y-5 shadow-[0_15px_30px_rgba(253,224,71,0.02)]',
              'md:translate-y-3 bg-[#13120E]/85 border-yellow-500/15 shadow-[0_25px_45px_rgba(253,224,71,0.06)]',
              'md:translate-y-8 shadow-[0_15px_30px_rgba(0,0,0,0.3)]',
              'md:-translate-y-2 shadow-[0_18px_35px_rgba(253,224,71,0.03)]',
              'md:translate-y-5 bg-[#111111]/90 shadow-[0_20px_40px_rgba(0,0,0,0.4)]',
              'md:-translate-y-7 shadow-[0_15px_25px_rgba(253,224,71,0.015)]'
            ];
            const offsetClass = offsets[index % offsets.length];

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.08, 0.45), ease: "easeOut" }}
                whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                className={`bg-[#111111]/70 backdrop-blur-md border border-white/10 hover:border-[#FDE047]/30 rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between group ${offsetClass}`}
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      {review.avatarUrl ? (
                        <img
                          src={review.avatarUrl}
                          alt={review.author}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                          onError={(e) => {
                            // Fallback to initial
                            (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${review.author}`;
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center font-bold text-white text-sm uppercase">
                          {review.author[0]}
                        </div>
                      )}
                      <div>
                        <h5 className="font-semibold text-white text-sm leading-tight">{review.author}</h5>
                        <span className="text-[10px] text-neutral-400 font-mono">{review.timeAgo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#FDE047] text-[#FDE047] group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
                      ))}
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm mt-5 leading-relaxed font-normal">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-1.5 items-center">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-6 transition-transform" />
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mr-2 font-mono">Verified Call</span>
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-neutral-900 text-neutral-400 rounded font-mono text-[9px] uppercase tracking-wide font-medium group-hover:text-white transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
