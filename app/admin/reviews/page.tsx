'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/Toast';
import { Check, X, Star, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Review {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  product: {
    name: string;
    images: string[] | { url: string }[];
  };
}

// ✅ DEFAULT EXPORT (Fixes the Vercel Build Error)
export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, approve: boolean) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approve }),
      });

      if (res.ok) {
        setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: approve } : r));
        toast.success(approve ? 'Review approved' : 'Review hidden');
      }
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setActionId(null);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id));
        toast.success('Review deleted');
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
    </div>
  );

  return (
    <div className="p-6 bg-[#111008] min-h-screen text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[#C9A84C]">Client Reviews</h1>
        <p className="text-gray-400">Approve or moderate feedback from your customers.</p>
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-lg">
            <p className="text-gray-500">No reviews found.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white/5 border border-white/10 p-5 rounded-lg flex flex-col md:flex-row gap-6 items-start">
              {/* Product Info */}
              <div className="w-full md:w-48 shrink-0">
                <p className="text-xs font-bold text-[#C9A84C] uppercase mb-2">Product</p>
                <p className="text-sm font-medium line-clamp-2">{review.product.name}</p>
              </div>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-600"} />
                  ))}
                  <span className="text-xs text-gray-500 ml-2">
                    by {review.user.name || 'Anonymous'}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic">"{review.comment}"</p>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  review.isApproved ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {review.isApproved ? 'Live' : 'Pending'}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusChange(review.id, !review.isApproved)}
                    disabled={actionId === review.id}
                    className={`p-2 rounded hover:bg-white/10 transition-colors ${review.isApproved ? 'text-amber-500' : 'text-green-500'}`}
                    title={review.isApproved ? "Unapprove" : "Approve"}
                  >
                    {review.isApproved ? <X size={18} /> : <Check size={18} />}
                  </button>
                  <button 
                    onClick={() => deleteReview(review.id)}
                    className="p-2 text-red-500 rounded hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}