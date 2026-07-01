import React, { useState } from 'react';
import { ShoppingCart, Search, Tag, ExternalLink } from 'lucide-react';

interface Deal {
  portal: string;
  price: number;
  coupon: string | null;
  link: string;
}

export const Shopping: React.FC = () => {
  const [query, setQuery] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Simulate search comparison API
    setDeals([
      { portal: 'Amazon Student', price: 180, coupon: 'AMZSTUDENT20 (Save 10%)', link: 'https://amazon.com' },
      { portal: 'Flipkart Campus', price: 195, coupon: 'None active', link: 'https://flipkart.com' },
      { portal: 'AJIO Student Club', price: 210, coupon: 'CLUBSTUDENT (Save $15)', link: 'https://ajio.com' }
    ]);
    setSearched(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">Smart Shopping & Deals</h2>
        <p className="text-xs text-slate-400 mt-1">Compare prices, find student coupons, and track deals across major retail platforms</p>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-6 border border-white/5">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What item are you looking to buy? (e.g. 'Engineering textbooks', 'Wireless headphones')"
              className="glass-input pl-12 text-xs"
            />
          </div>
          <button type="submit" className="neon-button-purple px-6 py-3.5 rounded-xl font-bold text-xs shrink-0">
            Compare Prices
          </button>
        </form>
      </div>

      {searched && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deals.map((deal, idx) => (
            <div key={idx} className="glass-card p-6 border border-white/5 space-y-4 hover:border-brand-cyan/20 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{deal.portal}</span>
                  <ShoppingCart className="h-4.5 w-4.5 text-brand-cyan" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-200">${deal.price}</h3>
                {deal.coupon && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
                    <Tag className="h-3 w-3" />
                    <span>Coupon: {deal.coupon}</span>
                  </div>
                )}
              </div>
              
              <a
                href={deal.link}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-slate-200 transition-colors"
              >
                Go to Portal <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
      
      {!searched && (
        <div className="glass-card p-12 text-center text-slate-500 italic text-sm">
          Search for an item or tell the AI: "I need to buy a laptop, check deals for me".
        </div>
      )}
    </div>
  );
};
