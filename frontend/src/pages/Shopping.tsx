import React, { useState } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Tag, ExternalLink, Sparkles, Loader } from 'lucide-react';

interface Deal {
  portal: string;
  price: number;
  coupon: string | null;
  link: string;
}

export const Shopping: React.FC = () => {
  const [query, setQuery] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/shopping/compare?query=${encodeURIComponent(query)}`);
      setDeals(res.data);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch real-time price comparisons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-200 flex items-center gap-2">
            Smart Shopping & Price Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare live prices across major retail platforms in Indian Rupees (₹) with direct product page routing.
          </p>
        </div>
        
        {/* Flash.co brand badge */}
        <div className="glass-card px-4 py-2 flex items-center gap-2.5 border border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan text-xs font-bold rounded-xl shrink-0">
          <Sparkles className="h-4.5 w-4.5 animate-pulse" />
          <span>Powered by flash.co API</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="glass-card p-6 border border-white/5">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What item are you looking to buy? (e.g. 'Samsung F15', 'Engineering textbooks')"
              className="glass-input pl-12 text-xs"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="neon-button-purple px-6 py-3.5 rounded-xl font-bold text-xs shrink-0 flex items-center gap-2"
          >
            {loading ? <Loader className="h-4.5 w-4.5 animate-spin" /> : 'Compare Prices'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* RESULTS DECK */}
      {searched && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deals.map((deal, idx) => (
            <div key={idx} className="glass-card p-6 border border-white/5 space-y-4 hover:border-brand-cyan/20 transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{deal.portal}</span>
                  <ShoppingCart className="h-4.5 w-4.5 text-brand-cyan" />
                </div>
                
                {/* Price Display in Indian Rupees (₹) */}
                <h3 className="text-2xl font-extrabold text-slate-200">
                  ₹{deal.price.toLocaleString('en-IN')}
                </h3>
                
                {deal.coupon && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
                    <Tag className="h-3 w-3" />
                    <span>Coupon: {deal.coupon}</span>
                  </div>
                )}
              </div>
              
              {/* Direct Redirect link */}
              <a
                href={deal.link}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-brand-cyan/10 hover:border-brand-cyan/20 text-xs font-bold text-slate-300 hover:text-slate-200 transition-all"
              >
                Go to Product Page <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="glass-card p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-brand-purple" />
          <span>Searching flash.co listings and scraping live prices in Rupees...</span>
        </div>
      )}
      
      {!searched && !loading && (
        <div className="glass-card p-12 text-center text-slate-500 italic text-sm">
          Enter a product name to search flash.co comparisons, or ask the AI: "Find deals for Samsung F15."
        </div>
      )}
    </div>
  );
};
