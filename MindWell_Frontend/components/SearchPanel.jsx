import React, { useState } from 'react';
import { 
  Search, X, Filter, Hash, Calendar, User, TrendingUp, 
  Clock, ChevronRight, ChevronLeft, Zap, Target
} from 'lucide-react';

const SearchPanel = ({
  open,
  onToggle,
  searchTerm,
  setSearchTerm,
  darkMode
}) => {
  const [filterType, setFilterType] = useState('all');
  const [searchHistory, setSearchHistory] = useState(['#mentalhealth', '#motivation', '#productivity']);

  const filters = [
    { id: 'all', label: 'All', icon: <Search className="h-4 w-4" /> },
    { id: 'hashtags', label: 'Hashtags', icon: <Hash className="h-4 w-4" /> },
    { id: 'users', label: 'Users', icon: <User className="h-4 w-4" /> },
    { id: 'recent', label: 'Recent', icon: <Clock className="h-4 w-4" /> }
  ];

  const trendingTopics = [
    { tag: '#mentalhealth', count: 42, growth: '+12%' },
    { tag: '#motivation', count: 38, growth: '+8%' },
    { tag: '#productivity', count: 29, growth: '+15%' },
    { tag: '#wellness', count: 24, growth: '+5%' },
    { tag: '#support', count: 19, growth: '+22%' }
  ];

  const suggestedSearches = [
    'How to stay motivated',
    'Dealing with anxiety',
    'Work-life balance tips',
    'Mental health resources',
    'Productivity hacks'
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Add to search history if not already present
      if (!searchHistory.includes(searchTerm)) {
        setSearchHistory(prev => [searchTerm, ...prev].slice(0, 5));
      }
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleSuggestedSearch = (suggestion) => {
    setSearchTerm(suggestion);
  };

  const handleTrendingClick = (tag) => {
    setSearchTerm(tag);
  };

  return (
    <div className={`${open ? 'w-80' : 'w-16'} bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300`}>
      {/* Search Panel Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {open && (
          <div className="flex items-center space-x-2">
            <Search className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search
            </h2>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          {open ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Search Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent hover:scrollbar-thumb-indigo-600">
    
        {open && (
          <>
            {/* Search Input */}
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search posts, hashtags, users..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Filters */}
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterType(filter.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition ${
                      filterType === filter.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results or Default Content */}
            {searchTerm ? (
              <div className="px-4 pb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Searching for: <span className="font-medium">"{searchTerm}"</span>
                </div>
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Search results will appear here
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Trending Topics */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Trending Topics
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {trendingTopics.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => handleTrendingClick(topic.tag)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {topic.tag}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {topic.count} posts
                          </span>
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {topic.growth}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Recent Searches
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {searchHistory.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchTerm(term)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {term}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Searches */}
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Suggested Searches
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {suggestedSearches.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedSearch(suggestion)}
                        className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {suggestion}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Tips */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 m-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                    Search Tips
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Use #hashtags to find specific topics</li>
                    <li>• Search for @username to find user posts</li>
                    <li>• Use quotes for exact phrases</li>
                    <li>• Try different keywords for better results</li>
                  </ul>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;