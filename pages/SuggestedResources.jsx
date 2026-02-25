import React, { useState, useEffect } from 'react';
import GeminiAgent from '../components/AI/GeminiAgent.jsx';
import { resources } from '../src/resources.js';
import YouTubePlayer from '../components/YouTubePlayer.jsx';

const SuggestedResources = () => {
  const [currentMood, setCurrentMood] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    // Initialize with a default mood or detect from user input
    // For now, we'll start with no mood and let the AI handle it
  }, []);

  const handleSuggestionSelect = (suggestion) => {
    setSelectedSuggestion(suggestion);

    // If it's a YouTube video, extract the video ID and display it
    if (suggestion.type === 'youtube' && suggestion.url) {
      const videoId = getYouTubeVideoId(suggestion.url);
      if (videoId) {
        setSelectedSuggestion({ ...suggestion, videoId });
      }
    }

    // Update user history
    setUserHistory(prev => [...prev, suggestion]);
  };

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return match[2];
    } else {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            AI-Powered Wellness Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Get personalized wellness resource suggestions powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Agent Section */}
          <div className="space-y-6">
            <GeminiAgent
              resources={resources}
              userMood={currentMood}
              userHistory={userHistory}
              onSuggestionSelect={handleSuggestionSelect}
            />

            {/* Quick Mood Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Quick Mood Selection
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(resources).map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setCurrentMood(mood)}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      currentMood === mood
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Suggestion Display */}
          <div className="space-y-6">
            {selectedSuggestion ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Selected Resource
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                      {selectedSuggestion.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      {selectedSuggestion.description}
                    </p>
                  </div>

                  {selectedSuggestion.whyHelpful && (
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white mb-1">
                        Why This Helps
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedSuggestion.whyHelpful}
                      </p>
                    </div>
                  )}

                  {selectedSuggestion.tags && (
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white mb-2">
                        Tags
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedSuggestion.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display YouTube video if available */}
                  {selectedSuggestion.videoId && (
                    <div className="mt-4">
                      <YouTubePlayer videoId={selectedSuggestion.videoId} />
                    </div>
                  )}

                  {/* Display URL if available */}
                  {selectedSuggestion.url && !selectedSuggestion.videoId && (
                    <div className="mt-4">
                      <a
                        href={selectedSuggestion.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Resource
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Resource Selected</h3>
                  <p>Use the AI assistant to get personalized wellness suggestions</p>
                </div>
              </div>
            )}

            {/* User History */}
            {userHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Recent Suggestions
                </h3>
                <div className="space-y-3">
                  {userHistory.slice(-5).reverse().map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => setSelectedSuggestion(item)}
                    >
                      <h4 className="font-medium text-gray-800 dark:text-white text-sm">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {item.type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestedResources;
