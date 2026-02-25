import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Heart, Play, Pause, Book, Smartphone, Clock, Calendar, Download, Phone, MessageCircle, Globe, ChevronLeft, ChevronRight, Star, Check, Volume2, VolumeX, SkipBack, SkipForward, User, Menu, X, Plus, Minus, CheckCircle, Share2, Bell, Notebook, Award, Sun, Moon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';

import { deleteDoc } from 'firebase/firestore';

import {auth, db} from '../context/firebase/firebase';

import { resources } from '../src/resources.js';

const MentalWellnessResources = () => {
  // State management
  const [selectedMood, setSelectedMood] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    duration: 'all'
  });
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [completedResources, setCompletedResources] = useState([]);
  const [showPlanner, setShowPlanner] = useState(false);
  const [plannedPractices, setPlannedPractices] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [journalEntries, setJournalEntries] = useState({});
  const [currentJournalEntry, setCurrentJournalEntry] = useState('');
  const [currentResourceId, setCurrentResourceId] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moodHistory, setMoodHistory] = useState([]);
  
  const audioRef = useRef(null);
  const notificationRef = useRef(null);

  
 
  

  // Sample data for progress charts
  const weeklyProgressData = [
    { day: 'Mon', practices: 2 },
    { day: 'Tue', practices: 3 },
    { day: 'Wed', practices: 1 },
    { day: 'Thu', practices: 4 },
    { day: 'Fri', practices: 2 },
    { day: 'Sat', practices: 3 },
    { day: 'Sun', practices: 1 }
  ];

  const moods = [
    { id: 'all', name: 'All', icon: '🌈', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'happy', name: 'Happy', icon: '🟡', color: 'bg-yellow-400' },
    { id: 'anxious', name: 'Anxious', icon: '🔵', color: 'bg-blue-500' },
    { id: 'sad', name: 'Sad', icon: '🔴', color: 'bg-red-500' },
    { id: 'stressed', name: 'Stressed', icon: '🟠', color: 'bg-orange-500' },
    { id: 'low-energy', name: 'Low Energy', icon: '🟢', color: 'bg-green-500' },
    { id: 'grieving', name: 'Grieving', icon: '⚫', color: 'bg-gray-700' },
    { id: 'crisis', name: 'Crisis', icon: '🚨', color: 'bg-red-600' }
  ];


 const normalizedResources = useMemo(() => {
  const moodKeys = selectedMood === 'all'
    ? Object.keys(resources)
    : selectedMood === 'bookmarked'
    ? Object.keys(resources)
    : [selectedMood];

  const all = moodKeys.flatMap((key) =>
    (resources[key] || []).map((res, index) => ({
      ...res,
      id: `${key}-${index}`, // or use a UUID if needed
      mood: key,
      duration: res.duration || '5-10 min', // fallback duration if missing
      type: res.type?.toLowerCase() || 'article',
    }))
  );

  if (selectedMood === 'bookmarked') {
    return all.filter(res => bookmarkedResources.includes(res.id));
  }

  return all;
}, [resources, selectedMood, bookmarkedResources]);

const filteredResources = useMemo(() => {
  return normalizedResources.filter((resource) => {
    const matchesSearch =
      searchTerm === '' ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedFilters.type === 'all' ||
      resource.type === selectedFilters.type;

    const matchesDuration =
      selectedFilters.duration === 'all' ||
      (resource.duration &&
        (
          (selectedFilters.duration === '<5 min' && resource.duration.includes('<5')) ||
          (selectedFilters.duration === '5-10 min' && resource.duration.includes('5-10')) ||
          (selectedFilters.duration === '10-20 min' && resource.duration.includes('10-20')) ||
          (selectedFilters.duration === '20+ min' && resource.duration.includes('20'))
        ));

    return matchesSearch && matchesType && matchesDuration;
  });
}, [normalizedResources, searchTerm, selectedFilters]);


  // Flatten resources for filtering
  const allResources = Object.values(resources).flat();

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await loadUserData(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load user data from Firestore
  const loadUserData = async (userId) => {
    try {
      // Load bookmarks
      const bookmarksRef = doc(db, 'users', userId, 'preferences', 'bookmarks');
      const bookmarksSnap = await getDoc(bookmarksRef);
      if (bookmarksSnap.exists()) {
        setBookmarkedResources(bookmarksSnap.data().resources || []);
      }

      // Load completed resources
      const completedRef = doc(db, 'users', userId, 'preferences', 'completed');
      const completedSnap = await getDoc(completedRef);
      if (completedSnap.exists()) {
        setCompletedResources(completedSnap.data().resources || []);
      }

      // Load planner
      const plannerRef = collection(db, 'users', userId, 'planner');
      const plannerQuery = query(plannerRef);
      const plannerSnap = await getDocs(plannerQuery);
      setPlannedPractices(plannerSnap.docs.map(doc => doc.data()));

      // Load journal entries
      const journalRef = collection(db, 'users', userId, 'journal');
      const journalQuery = query(journalRef, orderBy('date', 'desc'));
      const journalSnap = await getDocs(journalQuery);
      const entries = {};
      journalSnap.forEach(doc => {
        const data = doc.data();
        if (!entries[data.resourceId]) {
          entries[data.resourceId] = [];
        }
        entries[data.resourceId].push({
          id: doc.id,
          date: data.date,
          text: data.text
        });
      });
      setJournalEntries(entries);

      // Load mood history
      const moodHistoryRef = collection(db, 'users', userId, 'dailyMood');
      const moodHistoryQuery = query(moodHistoryRef, orderBy('date', 'desc'));
      const moodHistorySnap = await getDocs(moodHistoryQuery);
      setMoodHistory(moodHistorySnap.docs.map(doc => doc.data()));

      // Load settings
      const settingsRef = doc(db, 'users', userId, 'preferences', 'settings');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const settings = settingsSnap.data();
        setDarkMode(settings.darkMode || false);
        setNotificationTime(settings.notificationTime || '09:00');
        setNotificationEnabled(settings.notificationEnabled || false);
      }

      // Calculate streak
      calculateStreak(moodHistorySnap.docs.map(doc => doc.data()));

      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
      setLoading(false);
    }
  };

  // Save data to Firestore when it changes
  useEffect(() => {
    if (!user) return;

    const saveData = async () => {
      try {
        // Save bookmarks
        const bookmarksRef = doc(db, 'users', user.uid, 'preferences', 'bookmarks');
        await setDoc(bookmarksRef, { resources: bookmarkedResources });

        // Save completed resources
        const completedRef = doc(db, 'users', user.uid, 'preferences', 'completed');
        await setDoc(completedRef, { resources: completedResources });

        // Save settings
        const settingsRef = doc(db, 'users', user.uid, 'preferences', 'settings');
        await setDoc(settingsRef, {
          darkMode,
          notificationTime,
          notificationEnabled
        }, { merge: true });
      } catch (error) {
        console.error("Error saving user data:", error);
      }
    };

    saveData();
  }, [bookmarkedResources, completedResources, darkMode, notificationTime, notificationEnabled, user]);

  // Save planner to Firestore
  useEffect(() => {
    if (!user || !plannedPractices.length) return;

    const savePlanner = async () => {
      try {
        // First clear existing planner
        const plannerRef = collection(db, 'users', user.uid, 'planner');
        const plannerQuery = query(plannerRef);
        const plannerSnap = await getDocs(plannerQuery);
        
        const batch = [];
        

plannerSnap.forEach(doc => {
  batch.push(deleteDoc(doc.ref));
});

        
        await Promise.all(batch);

        // Add new planner items
        const addBatch = [];
        plannedPractices.forEach(practice => {
          const newDocRef = doc(plannerRef);
          addBatch.push(setDoc(newDocRef, {
            ...practice,
            id: newDocRef.id
          }));
        });

        await Promise.all(addBatch);
      } catch (error) {
        console.error("Error saving planner:", error);
      }
    };

    savePlanner();
  }, [plannedPractices, user]);

  // Notification setup
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          scheduleDailyNotification();
        }
      });
    }

    return () => {
      if (notificationRef.current) {
        clearInterval(notificationRef.current);
      }
    };
  }, [notificationEnabled, notificationTime]);

  const scheduleDailyNotification = () => {
    if (!notificationEnabled) return;

    const [hours, minutes] = notificationTime.split(':').map(Number);
    const now = new Date();
    const notificationTimeToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    // If time already passed today, schedule for tomorrow
    if (notificationTimeToday < now) {
      notificationTimeToday.setDate(notificationTimeToday.getDate() + 1);
    }

    const timeout = notificationTimeToday.getTime() - now.getTime();

    notificationRef.current = setTimeout(() => {
      showPracticeNotification();
      // Schedule next notification for tomorrow
      scheduleDailyNotification();
    }, timeout);
  };

  const showPracticeNotification = () => {
    if (!notificationEnabled) return;

    const notification = new Notification('Mindful Moment Reminder', {
      body: 'Time for your daily wellness practice!',
      icon: '/mindful-icon.png'
    });

    notification.onclick = () => {
      window.focus();
    };

    toast.info('Time for your daily wellness practice!', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };

  const calculateStreak = (moodData = moodHistory) => {
    if (!moodData.length) {
      setStreakCount(0);
      return;
    }

    // Sort by date ascending
    const sorted = [...moodData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let streak = 1;
    let prevDate = new Date(sorted[sorted.length - 1].date);
    
    // Check consecutive days from most recent
    for (let i = sorted.length - 2; i >= 0; i--) {
      const currentDate = new Date(sorted[i].date);
      const diffTime = prevDate - currentDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
        prevDate = currentDate;
      } else if (diffDays > 1) {
        break;
      }
    }
    
    setStreakCount(streak);
  };

  // Audio player functions
  const playAudio = (resource) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentlyPlaying(resource);
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentlyPlaying(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Resource management functions
  const toggleBookmark = async (resourceId) => {
    const newBookmarks = bookmarkedResources.includes(resourceId) 
      ? bookmarkedResources.filter(id => id !== resourceId)
      : [...bookmarkedResources, resourceId];
    
    setBookmarkedResources(newBookmarks);
    
    toast.success(
      bookmarkedResources.includes(resourceId) 
        ? 'Removed from bookmarks' 
        : 'Added to bookmarks'
    );
  };

  const markCompleted = async (resourceId) => {
    const newCompleted = completedResources.includes(resourceId) 
      ? completedResources.filter(id => id !== resourceId)
      : [...completedResources, resourceId];
    
    setCompletedResources(newCompleted);
    
    if (!completedResources.includes(resourceId)) {
      toast.success('Marked as completed!', {
        icon: <CheckCircle className="text-green-500" />
      });
      calculateStreak();
    }
  };

  const addToPlan = async (resource) => {
    if (!plannedPractices.find(p => p.id === resource.id)) {
      const newPlanned = [...plannedPractices, resource];
      setPlannedPractices(newPlanned);
      toast.success('Added to your planner!');
    } else {
      toast.info('Already in your planner');
    }
  };

  const removeFromPlan = async (resourceId) => {
    const newPlanned = plannedPractices.filter(p => p.id !== resourceId);
    setPlannedPractices(newPlanned);
    toast.success('Removed from planner');
  };

  const saveJournalEntry = async () => {
    if (!user || !currentResourceId || !currentJournalEntry.trim()) return;

    try {
      const journalRef = collection(db, 'users', user.uid, 'journal');
      const newEntry = {
        resourceId: currentResourceId,
        date: new Date().toISOString(),
        text: currentJournalEntry
      };
      
      await addDoc(journalRef, newEntry);
      
      // Update local state
      setJournalEntries(prev => ({
        ...prev,
        [currentResourceId]: [
          ...(prev[currentResourceId] || []),
          newEntry
        ]
      }));

      setCurrentJournalEntry('');
      setShowJournalModal(false);
      toast.success('Journal entry saved');
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast.error("Failed to save journal entry");
    }
  };

  const openJournalForResource = (resourceId) => {
    setCurrentResourceId(resourceId);
    setShowJournalModal(true);
  };

  const featuredResources = allResources.filter(resource => resource.featured);

  // UI helper functions
  const getTypeIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'audio': return <Volume2 className="w-4 h-4" />;
      case 'exercise': return <Book className="w-4 h-4" />;
      case 'app': return <Smartphone className="w-4 h-4" />;
      case 'tool': return <Star className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  const getActionButton = (resource) => {
    if (resource.type.toLowerCase() === 'audio') {
      return (
        <button
          onClick={() => playAudio(resource)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Play</span>
        </button>
      );
    } else if (resource.type.toLowerCase() === 'video') {
      return (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Watch</span>
        </a>
      );
    } else if (resource.type.toLowerCase() === 'exercise') {
      return (
        <button
          onClick={() => window.open(resource.url, '_blank')}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      );
    } else {
      return (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>Open</span>
        </a>
      );
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(`Switched to ${!darkMode ? 'dark' : 'light'} mode`);
  };

  const toggleNotificationSetting = () => {
    const newSetting = !notificationEnabled;
    setNotificationEnabled(newSetting);
    if (newSetting && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          scheduleDailyNotification();
        }
      });
    }
    toast.info(`Daily notifications ${newSetting ? 'enabled' : 'disabled'}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Loading your wellness resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors relative top-20 duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800'}`}>
      {/* Toast Notifications */}
      <ToastContainer position="top-right" theme={darkMode ? 'dark' : 'light'} />

      {/* Crisis Help Bar */}
      <div className="bg-red-600 text-white p-3 text-center top-0 z-50">
        <div className="flex items-center justify-center space-x-4 text-sm">
          <span className="font-medium">Need urgent help? You're not alone.</span>
          <div className="flex items-center space-x-4">
            <a href="tel:988" className="flex items-center space-x-1 hover:underline">
              <Phone className="w-4 h-4" />
              <span>Call 988</span>
            </a>
            <a href="sms:741741" className="flex items-center space-x-1 hover:underline">
              <MessageCircle className="w-4 h-4" />
              <span>Text HOME to 741741</span>
            </a>
            <a href="https://www.nami.org/help" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:underline">
              <Globe className="w-4 h-4" />
              <span>NAMI Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {currentlyPlaying && (
        <div className={`border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 sticky bottom-0 z-40`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currentlyPlaying.title}</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{currentlyPlaying.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={isPlaying ? pauseAudio : resumeAudio}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={stopAudio}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-12`}>{formatTime(currentTime)}</span>
              <div className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 cursor-pointer`} onClick={handleSeek}>
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-12`}>{formatTime(duration)}</span>
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>
          </div>
          
          <audio
            ref={audioRef}
            src={currentlyPlaying.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={stopAudio}
            autoPlay
            volume={volume}
          />
        </div>
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className={`fixed inset-0 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
          <button 
            onClick={() => setShowMobileMenu(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col space-y-6 mt-12">
            <button 
              onClick={() => {
                setShowPlanner(true);
                setShowMobileMenu(false);
              }}
              className="flex items-center space-x-3 text-lg"
            >
              <Calendar className="w-5 h-5" />
              <span>My Planner</span>
            </button>
            
            <button 
              onClick={() => {
                setSelectedMood('all');
                setShowMobileMenu(false);
              }}
              className="flex items-center space-x-3 text-lg"
            >
              <Book className="w-5 h-5" />
              <span>All Resources</span>
            </button>
            
            <button 
              onClick={() => {
                setSelectedMood('bookmarked');
                setShowMobileMenu(false);
              }}
              className="flex items-center space-x-3 text-lg"
            >
              <Heart className="w-5 h-5" />
              <span>Saved Resources</span>
            </button>
            
            <button 
              onClick={toggleDarkMode}
              className="flex items-center space-x-3 text-lg"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5" />
                <div className="flex-1">
                  <label htmlFor="notification-time" className="block text-sm font-medium mb-1">
                    Daily Reminder
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      id="notification-time"
                      value={notificationTime}
                      onChange={(e) => setNotificationTime(e.target.value)}
                      className="px-2 py-1 border rounded"
                      disabled={!notificationEnabled}
                    />
                    <button
                      onClick={toggleNotificationSetting}
                      className={`p-1 rounded-full ${notificationEnabled ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      {notificationEnabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journal Modal */}
      {showJournalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Journal Entry</h3>
              <button 
                onClick={() => setShowJournalModal(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">
                {allResources.find(r => r.id === currentResourceId)?.title}
              </h4>
              <textarea
                value={currentJournalEntry}
                onChange={(e) => setCurrentJournalEntry(e.target.value)}
                placeholder="Write your thoughts, reflections, or notes here..."
                className={`w-full h-40 p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Previous Entries</h4>
              {journalEntries[currentResourceId]?.length > 0 ? (
                <div className="space-y-3">
                  {journalEntries[currentResourceId].map((entry, index) => (
                    <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className="text-sm">{entry.text}</p>
                      <p className="text-xs mt-1 text-gray-500">
                        {new Date(entry.date).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No previous entries</p>
              )}
            </div>
            
            <button
              onClick={saveJournalEntry}
              disabled={!currentJournalEntry.trim()}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="text-center md:text-left">
            <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Mental Wellness Resources</h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Tools for your mental health journey
            </p>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <div className="flex items-center">
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="px-2 py-1 border rounded w-28"
                  disabled={!notificationEnabled}
                />
                <button
                  onClick={toggleNotificationSetting}
                  className={`ml-2 p-1 rounded-full ${notificationEnabled ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  {notificationEnabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {user ? (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
            ) : (
              <button 
                onClick={() => signInWithGoogle()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Mood Selector */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>How are you feeling today?</h2>
          <div className="flex overflow-x-auto pb-4 space-x-3">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl min-w-[100px] transition-all ${selectedMood === mood.id ? 
                  `${mood.color} text-white shadow-lg transform scale-105` : 
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} shadow`}
              >
                <span className="text-2xl mb-1">{mood.icon}</span>
                <span className="text-sm font-medium">{mood.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`rounded-xl shadow-lg p-6 mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 md:max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={selectedFilters.type}
                  onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
                  className={`appearance-none pl-3 pr-8 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Types</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                  <option value="article">Articles</option>
                  <option value="exercise">Exercises</option>
                  <option value="app">Apps</option>
                </select>
                <Filter className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} pointer-events-none`} />
              </div>
              
              <div className="relative">
                <select
                  value={selectedFilters.duration}
                  onChange={(e) => setSelectedFilters({...selectedFilters, duration: e.target.value})}
                  className={`appearance-none pl-3 pr-8 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">Any Duration</option>
                  <option value="<5 min">Under 5 min</option>
                  <option value="5-10 min">5-10 min</option>
                  <option value="10-20 min">10-20 min</option>
                  <option value="20+ min">20+ min</option>
                </select>
                <Clock className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} pointer-events-none`} />
              </div>
              
              <button
                onClick={() => setShowPlanner(!showPlanner)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <Calendar className="w-5 h-5" />
                <span>{showPlanner ? 'Hide Planner' : 'Show Planner'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Planner Section */}
        {showPlanner && (
          <div className={`rounded-xl shadow-lg p-6 mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>My Wellness Planner</h2>
              <button
                onClick={() => setShowPlanner(false)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {plannedPractices.length > 0 ? (
              <div className="space-y-4">
                {plannedPractices.map((practice) => (
                  <div 
                    key={practice.id} 
                    className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{practice.title}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{practice.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                            {practice.duration}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                            {practice.type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {getActionButton(practice)}
                        <button
                          onClick={() => removeFromPlan(practice.id)}
                          className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg">Your planner is empty</p>
                <p className="mb-4">Add resources to plan your wellness activities</p>
                <button
                  onClick={() => setShowPlanner(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Resources
                </button>
              </div>
            )}
          </div>
        )}

        {/* Featured Resources Carousel */}
        {featuredResources.length > 0 && (
          <div className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Featured Resources</h2>
            <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <Carousel 
                showArrows={true} 
                showStatus={false} 
                showThumbs={false}
                infiniteLoop={true}
                autoPlay={true}
                interval={5000}
                renderArrowPrev={(onClickHandler, hasPrev, label) => (
                  <button
                    onClick={onClickHandler}
                    disabled={!hasPrev}
                    className={`absolute top-1/2 left-2 z-10 transform -translate-y-1/2 p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'} shadow`}
                    aria-label={label}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                renderArrowNext={(onClickHandler, hasNext, label) => (
                  <button
                    onClick={onClickHandler}
                    disabled={!hasNext}
                    className={`absolute top-1/2 right-2 z-10 transform -translate-y-1/2 p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'} shadow`}
                    aria-label={label}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              >
                {featuredResources.map((resource) => (
                  <div key={resource.id} className={`h-64 md:h-96 relative ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0"></div>
                    <div className="relative z-10 h-full flex flex-col justify-end p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                          {resource.duration}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                          {resource.type}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{resource.title}</h3>
                      <p className="text-gray-200 mb-4">{resource.description}</p>
                      <div className="flex space-x-3">
                        {getActionButton(resource)}
                        <button
                          onClick={() => toggleBookmark(resource.id)}
                          className={`p-2 rounded-full ${bookmarkedResources.includes(resource.id) ? 'bg-pink-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                          <Heart className="w-5 h-5" fill={bookmarkedResources.includes(resource.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => addToPlan(resource)}
                          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        )}

        {/* Resources Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {selectedMood === 'all' ? 'All Resources' : 
               selectedMood === 'bookmarked' ? 'Saved Resources' : 
               `Resources for ${moods.find(m => m.id === selectedMood)?.name}`}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div 
                  key={resource.id} 
                  className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow hover:shadow-lg transition-shadow`}
                >
                  <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{resource.title}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleBookmark(resource.id)}
                          className={`p-1 rounded-full ${bookmarkedResources.includes(resource.id) ? 'text-pink-500' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          <Heart className="w-5 h-5" fill={bookmarkedResources.includes(resource.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => markCompleted(resource.id)}
                          className={`p-1 rounded-full ${completedResources.includes(resource.id) ? 'text-green-500' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          <CheckCircle className="w-5 h-5" fill={completedResources.includes(resource.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{resource.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {resource.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(resource.type)}
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{resource.duration}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openJournalForResource(resource.id)}
                          className={`p-1 rounded-full ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          <Notebook className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => addToPlan(resource)}
                          className={`p-1 rounded-full ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-3">
                      <h4 className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>WHY THIS HELPS</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{resource.whyHelpful}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      {getActionButton(resource)}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(resource.url);
                          toast.success('Link copied to clipboard');
                        }}
                        className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'} shadow`}>
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg">No resources found</p>
              <p>Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentalWellnessResources;