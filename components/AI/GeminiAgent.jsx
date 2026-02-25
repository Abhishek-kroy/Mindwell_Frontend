import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Send, Loader2, Brain, Search, Youtube } from 'lucide-react';
import { toast } from 'react-toastify';

const GeminiAgent = ({ resources, userMood, userHistory, onSuggestionSelect }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [genAI, setGenAI] = useState(null);

  // Initialize Gemini AI
  useEffect(() => {
    const initGemini = async () => {
      try {
        // Note: In production, this should be stored securely (e.g., environment variable)
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-api-key-here';
        const genAIInstance = new GoogleGenerativeAI(API_KEY);
        setGenAI(genAIInstance);
      } catch (error) {
        console.error('Error initializing Gemini AI:', error);
        toast.error('Failed to initialize AI agent');
      }
    };

    initGemini();
  }, []);

  // Function to search web (placeholder - would need actual API)
  const searchWeb = async (query) => {
    // This is a placeholder. In a real implementation, you'd use:
    // - Google Custom Search API
    // - Bing Web Search API
    // - Or another search service
    try {
      // Placeholder implementation
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Web search error:', error);
      return [];
    }
  };

  // Function to search YouTube (placeholder - would need YouTube Data API)
  const searchYouTube = async (query) => {
    // This is a placeholder. In a real implementation, you'd use:
    // - YouTube Data API v3
    try {
      // Placeholder implementation
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.videos || [];
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  };

  // Generate AI suggestions
  const generateSuggestions = async (userQuery) => {
    if (!genAI) {
      toast.error('AI agent not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Prepare context from resources and user data
      const resourcesContext = Object.entries(resources).map(([mood, resourceList]) =>
        `${mood}: ${resourceList.map(r => `${r.title} (${r.type}) - ${r.description}`).join(', ')}`
      ).join('\n');

      const userContext = `
        Current mood: ${userMood}
        User history: ${userHistory ? JSON.stringify(userHistory) : 'No history available'}
      `;

      const prompt = `
        You are an AI wellness assistant. Based on the following context, suggest personalized wellness resources.

        Available Resources:
        ${resourcesContext}

        User Context:
        ${userContext}

        User Query: "${userQuery}"

        Please provide 3-5 personalized suggestions that:
        1. Match the user's current mood and query
        2. Include resources from the available list when relevant
        3. Suggest additional web resources and YouTube videos when appropriate
        4. Consider the user's history and preferences
        5. Explain why each suggestion is helpful

        Format your response as a JSON array of objects with these properties:
        - title: string
        - type: "resource" | "web" | "youtube"
        - description: string
        - url: string (if applicable)
        - whyHelpful: string
        - tags: array of strings
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const parsedSuggestions = JSON.parse(text);

      // Enhance with actual web and YouTube search results
      const enhancedSuggestions = await Promise.all(
        parsedSuggestions.map(async (suggestion) => {
          if (suggestion.type === 'web') {
            const webResults = await searchWeb(suggestion.title);
            return { ...suggestion, webResults };
          } else if (suggestion.type === 'youtube') {
            const youtubeResults = await searchYouTube(suggestion.title);
            return { ...suggestion, youtubeResults };
          }
          return suggestion;
        })
      );

      setSuggestions(enhancedSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    await generateSuggestions(query);
  };

  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <Brain className="w-6 h-6 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          AI Wellness Assistant
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask for wellness suggestions..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 dark:text-white">
            AI Suggestions:
          </h4>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h5 className="font-medium text-gray-800 dark:text-white mr-2">
                      {suggestion.title}
                    </h5>
                    {suggestion.type === 'web' && <Search className="w-4 h-4 text-green-500" />}
                    {suggestion.type === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                    {suggestion.type === 'resource' && <Brain className="w-4 h-4 text-blue-500" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {suggestion.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <strong>Why helpful:</strong> {suggestion.whyHelpful}
                  </p>
                  {suggestion.tags && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {suggestion.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {suggestion.url && (
                    <a
                      href={suggestion.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Resource →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600 dark:text-gray-300">
            Generating personalized suggestions...
          </span>
        </div>
      )}
    </div>
  );
};

export default GeminiAgent;
