// useSessions.js
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../src/utils/api';

const useSessions = (idToken) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    if (!idToken) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load sessions');

      const parsed = data.sessions.map(session => {
        // Derive title: title field -> prompt field -> first user message -> default
        const title = session.title ||
          session.prompt ||
          (session.history?.[0]?.parts?.[0]?.text?.substring(0, 40)) ||
          'Untitled Conversation';

        // Derive lastMessage: lastMessage field -> reply field -> last model message -> default
        const lastMessage = session.lastMessage ||
          session.reply?.trim() ||
          (session.history?.[session.history.length - 1]?.parts?.[0]?.text?.substring(0, 60)) ||
          '';

        return {
          sessionRef: session.sessionRef,
          title: title,
          lastMessage: lastMessage,
          updatedAt: session.updatedAt || session.createdAt,
          createdAt: session.createdAt
        };
      });

      setSessions(parsed);
    } catch (err) {
      console.error('Session fetch error:', err);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [idToken]);

  return {
    sessions,
    setSessions,
    isLoading,
    refresh: fetchSessions
  };
};

export default useSessions;