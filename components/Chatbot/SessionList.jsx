import { Trash2 } from 'lucide-react';

const SessionList = ({ sessions, onSelectSession, onDeleteSession, searchTerm, isLoading, darkMode }) => {
    const filteredSessions = sessions.filter(session =>
        session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${darkMode ? 'border-blue-400' : 'border-[#7C9885]'
                    }`}></div>
            </div>
        );
    }

    if (filteredSessions.length === 0) {
        return (
            <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-[#4A4E69]/50'
                }`}>
                <p className="text-[11px] font-bold uppercase tracking-widest">No conversations found</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {filteredSessions.map((session) => (
                <div
                    key={session.sessionRef}
                    onClick={() => onSelectSession(session.sessionRef)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 group ${darkMode
                        ? 'border-gray-700 hover:bg-gray-700 bg-gray-800/50'
                        : 'bg-white border border-transparent hover:border-[#7C9885]/20'
                        } flex items-start gap-3 shadow-sm hover:shadow-md`}
                >
                    <div className='overflow-hidden flex-1'>
                        <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className={`text-[13px] font-bold truncate ${darkMode ? 'text-gray-100' : 'text-[#2D3142] group-hover:text-[#7C9885] transition-colors'
                                }`}>
                                {session.title || (session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Untitled Chat')}
                            </h3>
                            {session.createdAt && (
                                <span className={`text-[9px] font-bold uppercase tracking-widest whitespace-nowrap pt-0.5 ${darkMode ? 'text-gray-500' : 'text-[#4A4E69]/40'}`}>
                                    {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                        <p className={`text-[11px] leading-relaxed truncate font-medium ${darkMode ? 'text-gray-400' : 'text-[#4A4E69]/60'
                            }`}>
                            {session.lastMessage || 'No messages yet...'}
                        </p>
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div
                            className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.sessionRef);
                            }}
                        >
                            <Trash2
                                size={14}
                                className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-400 hover:text-red-500'
                                    }`}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SessionList;