import React, { useState } from 'react';
import {
  Search, X, Hash, User, TrendingUp,
  Clock, ChevronRight, ChevronLeft, Zap, Target, Sparkles
} from 'lucide-react';

const SearchPanel = ({
  open,
  onToggle,
  searchTerm,
  setSearchTerm
}) => {
  const [filterType, setFilterType] = useState('all');
  const [searchHistory, setSearchHistory] = useState(['#mindfulness', '#recovery', '#hope']);

  const filters = [
    { id: 'all', label: 'All', icon: <Target className="h-4 w-4" /> },
    { id: 'hashtags', label: 'Hash', icon: <Hash className="h-4 w-4" /> },
    { id: 'users', label: 'Soul', icon: <User className="h-4 w-4" /> }
  ];

  const trendingTopics = [
    { tag: '#healing', count: "1.2k", growth: '+42%' },
    { tag: '#gratitude', count: "850", growth: '+15%' },
    { tag: '#strength', count: "620", growth: '+8%' },
    { tag: '#innerpeace', count: "540", growth: '+22%' }
  ];

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleTrendingClick = (tag) => {
    setSearchTerm(tag);
  };

  return (
    <div className={`${open ? 'w-[22rem]' : 'w-20'} bg-white border-l border-gray-50 flex flex-col transition-all duration-500 ease-in-out z-40 relative shadow-[-10px_0_40px_-15px_rgba(0,0,0,0.03)]`}>
      {/* Header */}
      <div className="p-8 pb-6 flex items-center justify-between bg-[#2D3142] rounded-bl-[3rem]">
        {open && (
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-xl">
              <Search className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Explorer</h2>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-3 rounded-2xl transition-all ${open ? 'bg-white/10 text-white' : 'mx-auto text-[#4A4E69]/40 hover:text-[#2D3142]'}`}
        >
          {open ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent ${open ? 'px-8 pb-8 opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
        {open && (
          <div className="space-y-10">
            {/* Search Input */}
            <div className="space-y-6">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4A4E69]/30 group-focus-within:text-[#7C9885] transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find stories, souls, tags..."
                  className="w-full pl-14 pr-12 py-4 bg-[#F9FBFF] border-none rounded-[1.5rem] focus:ring-2 focus:ring-[#7C9885] outline-none text-[#2D3142] text-sm placeholder:text-[#4A4E69]/30 font-medium transition-all shadow-sm"
                />
                {searchTerm && (
                  <button onClick={handleClearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A4E69]/30 hover:text-red-400">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex justify-between bg-gray-50/50 p-1 rounded-2xl border border-gray-50">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${filterType === f.id
                      ? 'bg-white text-[#7C9885] shadow-sm'
                      : 'text-[#4A4E69]/40 hover:text-[#4A4E69]'
                      }`}
                  >
                    {f.icon}
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-[#2D3142]">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Trending Now</h3>
                </div>
                <div className="h-[1px] flex-1 bg-gray-50 ml-4"></div>
              </div>
              <div className="space-y-3">
                {trendingTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => handleTrendingClick(topic.tag)}
                    className="w-full flex items-center justify-between p-4 bg-[#F9FBFF] rounded-[1.5rem] hover:bg-[#7C9885]/5 border border-transparent hover:border-[#7C9885]/10 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#7C9885] font-bold text-xs shadow-sm group-hover:scale-110 transition-transform">
                        #{i + 1}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-[#2D3142]">{topic.tag}</p>
                        <p className="text-[10px] font-bold text-[#4A4E69]/40 uppercase">{topic.count} stories</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-50 px-2 py-1 rounded-lg">
                      {topic.growth}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-[#2D3142]">
                <Clock className="h-5 w-5 text-[#4A4E69]/30" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#4A4E69]/40">Recent</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((h, i) => (
                  <button key={i} onClick={() => setSearchTerm(h)} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-[#4A4E69] hover:border-[#7C9885] hover:text-[#7C9885] transition-all shadow-sm">
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Insight Card */}
            <div className="bg-gradient-to-br from-[#4A4E69] to-[#2D3142] p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
              <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-white/5 rotate-12" />
              <h4 className="font-bold mb-2 relative z-10 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-amber-400 fill-amber-400" />
                Mindful Search
              </h4>
              <p className="text-xs text-white/60 leading-relaxed relative z-10">
                Discovering someone else's story can often help you write your own. Search with empathy and find your tribe.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;