import React from 'react';
import { X, Smile, Frown, Meh, Angry, Send, Eye, EyeOff } from 'lucide-react';

const CreatePostModal = ({
  show,
  onClose,
  newPostContent,
  setNewPostContent,
  selectedMood,
  setSelectedMood,
  postAnonymously,
  setPostAnonymously,
  isLoading,
  handlePostSubmit,
  darkMode
}) => {
  const moods = [
    { value: 'happy', label: 'Happy', icon: <Smile className="h-5 w-5" />, color: 'text-emerald-500' },
    { value: 'neutral', label: 'Neutral', icon: <Meh className="h-5 w-5" />, color: 'text-amber-500' },
    { value: 'sad', label: 'Sad', icon: <Frown className="h-5 w-5" />, color: 'text-blue-500' },
    { value: 'angry', label: 'Angry', icon: <Angry className="h-5 w-5" />, color: 'text-red-500' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePostSubmit();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handlePostSubmit();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Post
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Post Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What's on your mind?
            </label>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts... Use #hashtags to categorize your post!"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows="5"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tip: Use Ctrl/Cmd + Enter to post quickly
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {newPostContent.length}/1000
              </p>
            </div>
          </div>

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How are you feeling?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition ${
                    selectedMood === mood.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className={mood.color}>{mood.icon}</span>
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              {postAnonymously ? (
                <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Post Anonymously
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your identity will be hidden from other users
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={postAnonymously}
                onChange={(e) => setPostAnonymously(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Post Preview */}
          {newPostContent.trim() && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                  {postAnonymously ? 'A' : 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {postAnonymously ? 'Anonymous' : 'You'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Preview</p>
                </div>
                <span className={moods.find(m => m.value === selectedMood)?.color}>
                  {moods.find(m => m.value === selectedMood)?.icon}
                </span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {newPostContent}
              </p>
              {newPostContent.match(/#\w+/g) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {newPostContent.match(/#\w+/g).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePostSubmit}
              disabled={isLoading || !newPostContent.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;