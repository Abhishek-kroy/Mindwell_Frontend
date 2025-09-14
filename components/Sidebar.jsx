import React from 'react';
import { 
  Bookmark, Heart, User, MessageSquare, ChevronLeft, ChevronRight,
  Home, BookOpen, Star, Archive, TrendingUp
} from 'lucide-react';

const Sidebar = ({
  open,
  onToggle,
  bookmarkedPosts,
  posts,
  activeTab,
  setActiveTab,
  currentUser,
  darkMode
}) => {
  const tabs = [
    { id: 'all', label: 'All Posts', icon: <Home className="h-5 w-5" />, count: posts.length },
    { id: 'my-posts', label: 'My Posts', icon: <User className="h-5 w-5" />, count: posts.filter(p => p.userId === currentUser?.id).length },
    { id: 'liked', label: 'Liked Posts', icon: <Heart className="h-5 w-5" />, count: posts.filter(p => p.userId === currentUser?.id).length },
    { id: 'bookmarked', label: 'Bookmarked', icon: <Bookmark className="h-5 w-5" />, count: bookmarkedPosts.length }
  ];

  const getBookmarkedPostsPreview = () => {
    return posts
      .filter(post => bookmarkedPosts.includes(post.id))
      .slice(0, 5);
  };

  const formatPreviewText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`${open ? 'w-80' : 'w-16'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {open && (
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Navigation
              </h2>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent hover:scrollbar-thumb-indigo-600">
          <nav className="p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className={`${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {tab.icon}
                </span>
                {open && (
                  <>
                    <span className="flex-1 text-left font-medium">{tab.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* Bookmarked Posts Preview */}
          {open && bookmarkedPosts.length > 0 && (
            <div className="mt-6 p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Recent Bookmarks
                </h3>
              </div>
              <div className="space-y-2">
                {getBookmarkedPostsPreview().map((post) => (
                  <div
                    key={post.id}
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-medium">
                        {post.anonymous ? 'A' : post.userInitials?.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {post.username}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                      {formatPreviewText(post.content)}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{post.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {open && (
            <div className="mt-6 p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Quick Stats
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {posts.length}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Total Posts
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {posts.filter(p => p.userId === currentUser?.id).length}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Your Posts
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {bookmarkedPosts.length}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    Bookmarked
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">
                    {posts.filter(p => p.userId === currentUser?.id).reduce((acc, post) => acc + (post.likes || 0), 0)}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Total Likes
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Section */}
        {open && currentUser && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {currentUser.initials}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentUser.username}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Active now
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;