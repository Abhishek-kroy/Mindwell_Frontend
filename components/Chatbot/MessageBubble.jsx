import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message, videoSuggestions, isUser, timestamp, darkMode, jsxContent }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = message ? message.split(' ') : [];

  useEffect(() => {
    if (currentWordIndex < words.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex((prev) => prev + 1);
      }, 50); // Adjust speed here
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, words.length]);

  const visibleMessage = words.slice(0, currentWordIndex).join(' ');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`mt-4 lg:max-w-[75%] px-6 py-4 rounded-3xl overflow-hidden shadow-sm ${isUser
          ? darkMode
            ? 'bg-[#2D3142] text-white rounded-br-sm'
            : 'bg-[#2D3142] text-white rounded-br-sm'
          : darkMode
            ? 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm'
            : 'bg-white border border-[#7C9885]/20 text-[#4A4E69] rounded-bl-sm'
          }`}
      >
        {jsxContent ? (
          jsxContent
        ) : (
          <div className="overflow-y-auto break-words whitespace-pre-wrap">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className={`text-sm ${isUser ? 'text-white' : darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {children}
                  </p>
                ),
                code: ({ inline, className, children, ...props }) => {
                  const baseStyle = darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800';
                  return inline ? (
                    <code className={`${baseStyle} px-1 py-0.5 rounded text-xs ${className || ''}`} {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className={`${baseStyle} text-sm p-2 rounded my-2 overflow-x-auto`} {...props}>
                      <code>{children}</code>
                    </pre>
                  );
                },
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {children}
                  </a>
                )
              }}
            >
              {visibleMessage}
            </ReactMarkdown>
          </div>
        )}

        {timestamp && (
          <p className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${isUser
            ? 'text-white/40'
            : darkMode ? 'text-gray-400' : 'text-[#4A4E69]/40'
            }`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {!isUser && videoSuggestions && videoSuggestions.length > 0 && currentWordIndex === words.length && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold mb-2">🎥 Suggested by Videos :</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {videoSuggestions.map((v) => (
                <a
                  key={v.url}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 border rounded hover:shadow"
                >
                  <img src={v.thumbnail} alt={v.title} className="w-16 h-9 object-cover rounded" />
                  <p className="text-xs font-medium line-clamp-2">{v.title}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;