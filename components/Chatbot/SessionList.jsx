import { Trash2 } from 'lucide-react';

const SessionList = ({ sessions, onSelectSession, onDeleteSession, searchTerm, isLoading, darkMode }) => {
    const filteredSessions = sessions.filter(session =>
        session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'
                    }`}></div>
            </div>
        );
    }

    if (filteredSessions.length === 0) {
        return (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                <p className="text-sm">No conversations found</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {filteredSessions.map((session) => (
                <div
                    key={session.sessionRef}
                    onClick={() => onSelectSession(session.sessionRef)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${darkMode
                        ? 'border-gray-700 hover:bg-gray-700 bg-gray-800/50'
                        : 'border border-gray-200 hover:bg-gray-50 bg-white'
                        } flex items-start gap-2 border shadow-sm hover:shadow-md`}
                >
                    <div className='overflow-hidden flex-1'>
                        <div className="flex justify-between items-start gap-2">
                            <h3 className={`text-sm font-semibold truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'
                                }`}>
                                {session.title || (session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Untitled Chat')}
                            </h3>
                            {session.createdAt && (
                                <span className={`text-[10px] whitespace-nowrap ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                        <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            {session.lastMessage || 'No messages yet...'}
                        </p>
                    </div>
                    <div>
                        <Trash2
                            size={16}
                            className={`mt-2 cursor-pointer ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.sessionRef);
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SessionList;