import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Globe, Search, Newspaper, ExternalLink, Calendar, RefreshCw, 
  Cpu, Shield, Code, Cloud, TrendingUp, Rocket, GraduationCap, 
  Award, Briefcase, SlidersHorizontal, BookOpen, Layers
} from 'lucide-react';

interface EcosystemResource {
  type: string;
  title: string;
  url: string;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  date: string;
  category: string;
  border_color: string;
  text_color: string;
  bg_color: string;
  icon: string;
  resources?: EcosystemResource[];
}

const AVAILABLE_INTERESTS = [
  'AI', 'Cybersecurity', 'Web Development', 'ECE', 
  'Embedded Systems', 'Data Science', 'Blockchain', 
  'Robotics', 'IoT', 'Cloud', 'Android', 'Finance', 'Startups'
];

export const News: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showInterestSelector, setShowInterestSelector] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      // Query parameters for interests
      const interestsQuery = selectedInterests.length > 0 
        ? selectedInterests.join(',') 
        : 'all';
      
      const res = await axios.get(`/api/news?interests=${encodeURIComponent(interestsQuery)}`);
      setArticles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load tech news", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedInterests]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const handleToggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Icon mapper helper
  const renderCategoryIcon = (iconName: string, colorClass: string) => {
    const props = { className: `h-4 w-4 ${colorClass}` };
    switch (iconName) {
      case 'Cpu': return <Cpu {...props} />;
      case 'Shield': return <Shield {...props} />;
      case 'Code': return <Code {...props} />;
      case 'Cloud': return <Cloud {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'Rocket': return <Rocket {...props} />;
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'Award': return <Award {...props} />;
      case 'Briefcase': return <Briefcase {...props} />;
      default: return <Globe {...props} />;
    }
  };

  // Get unique categories for filter tabs
  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category)))];

  // Filter articles based on search & category tab
  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || article.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-200 flex items-center gap-2.5">
            <Newspaper className="h-6.5 w-6.5 text-brand-cyan" /> Tech News & Ecosystem Feed
          </h2>
          <p className="text-xs text-slate-400 mt-1">Unified smart feed connecting real-time updates, career links, and student guides.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowInterestSelector(!showInterestSelector)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              showInterestSelector 
                ? 'bg-brand-violet/20 border-brand-violet/40 text-brand-neon' 
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Customize Feed</span>
          </button>
          
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 active:scale-95 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Personalized Interests Selector Drawer */}
      {showInterestSelector && (
        <div className="glass-card p-5 border border-white/5 space-y-3.5 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-violet" /> Personalize Your Stream Interests (Your USP)
            </h3>
            {selectedInterests.length > 0 && (
              <button 
                onClick={() => setSelectedInterests([])}
                className="text-[10px] text-brand-cyan hover:underline font-bold"
              >
                Reset All Filters
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_INTERESTS.map(interest => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => handleToggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-violet/30 to-brand-purple/25 border border-brand-violet/50 text-brand-neon shadow-neon-sm'
                      : 'bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Category Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === category
                  ? 'bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan shadow-sm'
                  : 'bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="Search feed, jobs, tech..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="glass-input pl-9 text-xs w-full"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="glass-card p-6 border-l-4 border-white/10 space-y-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/4" />
              <div className="h-5 bg-white/10 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <Globe className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500 italic">No ecosystem updates found matching your selected interests.</p>
        </div>
      ) : (
        /* Dynamic Grid List with Category Border Colors */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article, idx) => (
            <div 
              key={idx} 
              className="glass-card p-6 flex flex-col justify-between hover:scale-[1.005] hover:shadow-lg transition-all duration-300"
              style={{ borderLeft: `5px solid ${article.border_color}` }}
            >
              <div className="space-y-4">
                {/* Meta Header */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-slate-400" /> {article.date}
                  </span>
                  
                  {/* Category Pill Tag */}
                  <span className={`px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${article.bg_color} ${article.text_color} border border-white/5`}>
                    {renderCategoryIcon(article.icon, article.text_color)}
                    <span>{article.category}</span>
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="font-extrabold text-sm text-slate-200 hover:text-brand-cyan transition-colors">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
                </h3>

                {/* Description */}
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {article.description}
                </p>

                {/* Ecosystem Linked Resources (USP Feature) */}
                {article.resources && article.resources.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-brand-cyan" /> Connected Opportunity Pipeline (USP)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {article.resources.map((resource, rIdx) => (
                        <a
                          key={rIdx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-brand-violet/10 border border-white/5 hover:border-brand-violet/25 text-[10px] text-slate-300 hover:text-brand-neon transition-all"
                        >
                          <span className="truncate max-w-[85%] font-medium">
                            <span className="font-extrabold text-[9px] uppercase mr-1 text-brand-cyan">{resource.type}:</span>
                            {resource.title}
                          </span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-white/5 mt-5 flex items-center justify-between">
                <span className="text-[9px] text-slate-500 font-extrabold tracking-wide uppercase">Source: {article.source}</span>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-all"
                >
                  <span>Read Article</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
