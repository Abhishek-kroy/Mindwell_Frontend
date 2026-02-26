import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, History, Plus } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import useChat from '../hooks/useChat';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import SessionPanel from './SessionPanel';
import { API_BASE_URL } from '../../src/utils/api';
// import { decryptText } from '../../src/utils/encryption';

const ChatWindow = ({ darkMode, currentUser, checkingAuth }) => {
  const [showHistory, setShowHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const {
    messages,
    isLoading,
    error,
    sessionRef,
    sendMessage,
    loadSession,
    clearChat,
    clearError,
  } = useChat();

  useEffect(() => {
    if (!checkingAuth && !currentUser) {
      navigate('/auth');
    }
  }, [checkingAuth, currentUser, navigator]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showHistory]);

  if (checkingAuth) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-400 to-black text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
        <p className="mt-4 text-lg font-medium animate-pulse">
          Checking authentication...
        </p>
      </div>
    );
  }




  const handleSelectSession = async (sessionRef) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionRef}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load session');

      const history = data.session.history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts[0].text }],
        videos: msg.videos || [],
      }));

      loadSession({
        sessionRef: data.session.sessionRef,
        history,
      });

      setShowHistory(false);
    } catch (err) {
      console.error('Failed to load session:', err.message);
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  const handleNewChat = () => {
    clearChat();
    setShowHistory(false);
  };

  return (
    <div className={`w-full h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col font-sans`}>
      <header className="w-full h-[81px] flex-shrink-0" />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Side Panel */}
        <aside
          className={`
            ${showHistory ? 'w-80 p-5' : 'w-0 p-0'}
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#F9FBFF]/80 backdrop-blur-3xl border-[#7C9885]/10'}
            border-r
            flex flex-col h-full overflow-hidden
            shadow-[4px_0_24px_-12px_rgba(45,49,66,0.1)] z-10
          `}
        >
          {showHistory && (
            <>
              <div className="flex justify-between items-center mb-6 pl-2">
                <h2 className={`text-sm font-bold tracking-widest uppercase ${darkMode ? 'text-gray-200' : 'text-[#4A4E69]/60'}`}>Session History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className={`p-2 rounded-2xl transition-all ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-[#4A4E69]/40 hover:text-[#2D3142] hover:bg-white border hover:border-[#7C9885]/20 shadow-sm'}`}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                <SessionPanel
                  onSelectSession={handleSelectSession}
                  darkMode={darkMode}
                />
              </div>
            </>
          )}
        </aside>

        {/* Chat Area */}
        <main className={`flex-1 flex flex-col relative overflow-hidden ${darkMode ? 'bg-gray-800/80 text-gray-200' : 'bg-[#f8f9fa] text-gray-900'}`}>

          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#F9FBFF] via-white/40 to-white" />

          {/* Chat Header */}
          <header className={`px-6 py-4 flex items-center justify-between flex-shrink-0 z-10 bg-white/60 backdrop-blur-xl border-b ${darkMode ? 'border-gray-700' : 'border-[#7C9885]/10 shadow-sm'
            }`}>
            <div className="flex items-center space-x-4">
              {!showHistory && (
                <button
                  onClick={handleShowHistory}
                  className={`p-2.5 rounded-2xl transition-all ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-[#4A4E69]/60 hover:text-[#2D3142] hover:bg-white border border-transparent hover:border-[#7C9885]/20 shadow-sm'}`}
                >
                  <History size={20} />
                </button>
              )}
              <div className="flex flex-col">
                <h1 className={`text-xl font-extrabold tracking-tighter ${darkMode ? 'text-white' : 'text-[#1D1F2D]'}`}>
                  <span className="text-[#7C9885]">MindWell</span> Intelligence
                </h1>
                {sessionRef ? (
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-[#4A4E69]/50'
                    }`}>
                    Session / {sessionRef.split('T')[0]}
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-[#4A4E69]/50'
                    }`}>
                    New Therapeutic Space
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleNewChat}
                className="flex items-center space-x-2 py-2.5 px-4 rounded-2xl text-[12px] uppercase tracking-widest font-bold text-white bg-[#2D3142] hover:bg-[#4A4E69] transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
              >
                <Plus size={16} />
                <span>New Focus</span>
              </button>
              {/* <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button> */}
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 z-10">
            {messages.length === 0 && !isLoading ? (
              <div className={`text-center h-full flex flex-col justify-center items-center ${darkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border ${darkMode ? 'bg-blue-900/50 border-blue-900' : 'bg-white border-[#7C9885]/10'
                  }`}>
                  <div className="text-4xl filter drop-shadow-sm">🌱</div>
                </div>
                <h2 className="text-3xl font-extrabold text-[#2D3142] tracking-tighter mb-4">
                  Welcome to <span className="text-[#7C9885]">your space.</span>
                </h2>
                <p className={`text-[#4A4E69] max-w-sm mx-auto leading-relaxed font-medium mb-10`}>
                  I'm your AI companion. Feel free to share your thoughts, explore your emotions, or ask for guidance. This is a judgment-free zone.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto w-full">
                  <button onClick={() => setInput("I've been feeling overwhelmed lately...")} className="p-4 rounded-2xl bg-white border border-transparent hover:border-[#7C9885]/20 shadow-sm hover:shadow-md text-left transition-all group">
                    <p className="font-bold text-[#2D3142] text-sm mb-1 group-hover:text-[#7C9885]">Feeling overwhelmed?</p>
                    <p className="text-[11px] text-[#4A4E69]/60 font-medium">Let's untangle those thoughts.</p>
                  </button>
                  <button onClick={() => setInput("Can you guide me through a breathing exercise?")} className="p-4 rounded-2xl bg-white border border-transparent hover:border-[#7C9885]/20 shadow-sm hover:shadow-md text-left transition-all group">
                    <p className="font-bold text-[#2D3142] text-sm mb-1 group-hover:text-[#7C9885]">Need a quick reset?</p>
                    <p className="text-[11px] text-[#4A4E69]/60 font-medium">Take a mindful moment.</p>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message.content}
                  videoSuggestions={message.videoSuggestions || []}
                  isUser={message.sender === 'user'}
                  timestamp={message.timestamp}
                  darkMode={darkMode}
                />
              ))
            )}
            {isLoading && <LoadingIndicator darkMode={darkMode} />}
            {error && (
              <div className={`p-3 rounded-lg flex justify-between items-center text-sm ${darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                }`}>
                <span>⚠️ {error}</span>
                <button onClick={clearError} className="font-semibold hover:opacity-80">
                  Dismiss
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <footer className={`p-4 border-t flex-shrink-0 ${darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <div className="max-w-4xl mx-auto">
              <ChatInput onSendMessage={sendMessage} disabled={isLoading} darkMode={darkMode} />
              <p className={`text-xs text-center mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                AI can make mistakes. Consider checking important information.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ChatWindow;