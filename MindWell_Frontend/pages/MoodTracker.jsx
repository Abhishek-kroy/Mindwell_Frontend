import React, { useState, useEffect } from 'react';
import { TrendingUp, Heart, Frown, Zap, AlertCircle, Battery, ChevronRight, X, Moon } from 'lucide-react';
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, setDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../context/firebase/firebase";
import { Link, Navigate, useNavigate } from 'react-router-dom';

const getDateStr = (date) => date.toLocaleDateString('en-CA'); // YYYY-MM-DD

const MoodDashboard = () => {
  const [moodData, setMoodData] = useState([]);
  const [latestTest, setLatestTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayMoodLogged, setTodayMoodLogged] = useState(false);
  const [latestMood, setLatestMood] = useState(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodReason, setMoodReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const moodConfig = {
    happy: { color: 'bg-yellow-300', icon: '😊', name: 'Happy' },
    sad: { color: 'bg-blue-400', icon: '😢', name: 'Sad' },
    stress: { color: 'bg-red-400', icon: '😰', name: 'Stressed' },
    anxious: { color: 'bg-orange-400', icon: '😰', name: 'Anxious' },
    lowEnergy: { color: 'bg-gray-400', icon: '😴', name: 'Low Energy' },
    neutral: { color: 'bg-gray-300', icon: '😐', name: 'Neutral' }
  };
  
  const navigate = useNavigate();

  const fetchLatestMood = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      // Check today's mood first
      const today = getDateStr(new Date());
      const todayDocRef = doc(db, "users", user.uid, "dailyMood", today);
      const todayDocSnap = await getDoc(todayDocRef);
      
      if (todayDocSnap.exists()) {
        const data = todayDocSnap.data();
        return {
          date: today,
          mood: data.latestMood || 'neutral'
        };
      }

      // // Check past 7 days if today doesn't exist
      // const dates = [];
      // const dateObj = new Date();
      // for (let i = 1; i <= 7; i++) {
      //   const checkDate = new Date(dateObj);
      //   checkDate.setDate(dateObj.getDate() - i);
      //   dates.push(getDateStr(checkDate));
      // }

      // for (const dateStr of dates) {
      //   const docRef = doc(db, "users", user.uid, "dailyMood", dateStr);
      //   const docSnap = await getDoc(docRef);
        
      //   if (docSnap.exists()) {
      //     const data = docSnap.data();
      //     return {
      //       date: dateStr,
      //       mood: data.latestMood || 'neutral'
      //     };
      //   }
      // }

      return null;
    } catch (error) {
      console.error("Error fetching latest mood:", error);
      return null;
    }
  };

  const fetchDailyMoods = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return [];

      const today = new Date();
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(getDateStr(date));
      }

      const dailyMoods = [];
      for (const dateStr of dates) {
        const docRef = doc(db, "users", user.uid, "dailyMood", dateStr);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          dailyMoods.push({
            date: dateStr,
            mood: data.latestMood || 'neutral',
            isToday: dateStr === getDateStr(today)
          });
        } else {
          dailyMoods.push({
            date: dateStr,
            mood: 'neutral',
            isToday: dateStr === getDateStr(today)
          });
        }
      }

      return dailyMoods;
    } catch (error) {
      console.error("Error fetching daily moods:", error);
      return [];
    }
  };

  const logMood = async () => {
    if (!selectedMood) return;
    
    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = getDateStr(new Date());
      const moodDocRef = doc(db, "users", user.uid, "dailyMood", today);
      
      // Check if document exists
      const docSnap = await getDoc(moodDocRef);
      
      if (docSnap.exists()) {
        // Document exists, update it
        const updateData = {
          latestMood: selectedMood,
          timestamp: new Date()
        };
        
        // Increment the selected mood counter
        updateData[selectedMood] = increment(1);
        
        await updateDoc(moodDocRef, updateData);
      } else {
        // Document doesn't exist, create it with initial structure
        const allMoods = ['happy', 'sad', 'stress', 'anxious', 'lowEnergy', 'neutral'];
        const newDocData = {
          latestMood: selectedMood,
          mostFrequent: selectedMood, // Set mostFrequent to the selected mood
          timestamp: new Date()
        };
        
        // Set all mood counts to 0, then set selected mood to 1
        allMoods.forEach(mood => {
          newDocData[mood] = mood === selectedMood ? 1 : 0;
        });
        
        await setDoc(moodDocRef, newDocData);
      }

      // Refresh data
      await loadData();
      setShowMoodPicker(false);
      setSelectedMood(null);
      setMoodReason('');
    } catch (error) {
      console.error("Error logging mood:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const checkRecentAssessment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // Check current date and past 7 days for assessments
      const today = new Date();
      const dates = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(getDateStr(date));
      }

      for (const dateStr of dates) {
        // Check if assessment document exists for this date
        const assessmentDocRef = doc(db, "users", user.uid, "moodAssessment", dateStr);
        const assessmentDocSnap = await getDoc(assessmentDocRef);
        
        if (assessmentDocSnap.exists()) {
          // Check if there's an assessment subcollection document
          const assessmentSubDocRef = doc(db, "users", user.uid, "moodAssessment", dateStr, "assessment");
          const assessmentSubDocSnap = await getDoc(assessmentSubDocRef);
          
          if (assessmentSubDocSnap.exists()) {
            return true; // Found recent assessment
          }
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking recent assessment:", error);
      return false;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const [dailyMoods, test, latestMoodData, hasRecentAssessment] = await Promise.all([
        fetchDailyMoods(),
        fetchLatestTest(),
        fetchLatestMood(),
        checkRecentAssessment()
      ]);
      
      setMoodData(dailyMoods);
      setLatestTest(test);
      setLatestMood(latestMoodData);
      
      // Check if today's mood is logged
      const today = getDateStr(new Date());
      const todayDocRef = doc(db, "users", user.uid, "dailyMood", today);
      const todayDocSnap = await getDoc(todayDocRef);
      
      const moodLoggedToday = todayDocSnap.exists() && todayDocSnap.data().latestMood;
      setTodayMoodLogged(moodLoggedToday);
      
      // Set latest test based on recent assessment check
      if (hasRecentAssessment) {
        setLatestTest({ recent: true }); // Mark as recent to hide test option
      }
      
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestTest = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      // Check current date and past 7 days for the most recent assessment
      const today = new Date();
      const dates = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(getDateStr(date));
      }

      // Check each date for assessments (most recent first)
      for (const dateStr of dates) {
        const assessmentDocRef = doc(db, "users", user.uid, "moodAssessment", dateStr);
        const assessmentDocSnap = await getDoc(assessmentDocRef);
        
        if (assessmentDocSnap.exists()) {
          // Check if there's an assessment subcollection document
          const assessmentSubDocRef = doc(db, "users", user.uid, "moodAssessment", dateStr, "assessment");
          const assessmentSubDocSnap = await getDoc(assessmentSubDocRef);
          
          if (assessmentSubDocSnap.exists()) {
            const assessmentData = assessmentSubDocSnap.data();
            return {
              id: assessmentSubDocSnap.id,
              date: dateStr,
              recent: true, // Within 7 days
              ...assessmentData
            };
          }
        }
      }

      // If no recent assessment found, check older assessments
      const assessmentRef = collection(db, "users", user.uid, "moodAssessment");
      const assessmentSnapshot = await getDocs(assessmentRef);
      
      if (!assessmentSnapshot.empty) {
        // Found older assessments, return the most recent one
        let latestAssessment = null;
        let latestDate = null;
        
        for (const dateDoc of assessmentSnapshot.docs) {
          const assessmentSubDocRef = doc(db, "users", user.uid, "moodAssessment", dateDoc.id, "assessment");
          const assessmentSubDocSnap = await getDoc(assessmentSubDocRef);
          
          if (assessmentSubDocSnap.exists()) {
            const assessmentData = assessmentSubDocSnap.data();
            const assessmentDate = new Date(dateDoc.id);
            
            if (!latestDate || assessmentDate > latestDate) {
              latestDate = assessmentDate;
              latestAssessment = {
                id: assessmentSubDocSnap.id,
                date: dateDoc.id,
                recent: false, // Older than 7 days
                ...assessmentData
              };
            }
          }
        }
        
        return latestAssessment;
      }

      return null;
    } catch (error) {
      console.error("Error fetching latest test:", error);
      return null;
    }
  };

  const calculateTrend = (moods) => {
    if (moods.length < 2) return 'neutral';
    
    const positiveMoods = ['happy'];
    const negativeMoods = ['sad', 'stress', 'anxious', 'lowEnergy'];
    
    let positiveDays = 0;
    let negativeDays = 0;
    
    moods.forEach(day => {
      if (positiveMoods.includes(day.mood)) positiveDays++;
      if (negativeMoods.includes(day.mood)) negativeDays++;
    });
    
    // Compare first half and second half of the week
    const firstHalf = moods.slice(0, 3).filter(day => positiveMoods.includes(day.mood)).length;
    const secondHalf = moods.slice(3).filter(day => positiveMoods.includes(day.mood)).length;
    
    if (secondHalf > firstHalf) return 'improving';
    if (secondHalf < firstHalf) return 'declining';
    return 'stable';
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) loadData();
    });
    return () => unsubscribe();
  }, []);

  const trend = calculateTrend(moodData);
  const today = new Date();
  const lastTestDate = latestTest ? new Date(latestTest.date) : null;
  const daysSinceLastTest = lastTestDate ? Math.floor((today - lastTestDate) / (1000 * 60 * 60 * 24)) : 7;
  
  // Logic for showing different panels
  const showMoodLog = !todayMoodLogged; // Show if today's mood hasn't been logged
  const showTest = false // Show if no recent assessment
  const showResources = todayMoodLogged && latestMood; // Show if mood logged AND has latest mood AND test not overdue
  const isDarkMode = false;
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900' 
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
    }`}>
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 ${isDarkMode ? 'bg-white' : 'bg-indigo-300'} rounded-full opacity-20 animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen p-6">
        {/* Theme Toggle */}
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-full backdrop-blur-lg transition-all duration-300 hover:scale-110 ${
              isDarkMode 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-black/10 text-gray-800 hover:bg-black/20'
            }`}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        <div className="max-w-6xl mx-auto transform translate-y-[81px]">
          {/* Hero Section with Image */}
          <div className="mb-8 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="/moodtrackerbg.jpeg" 
                alt="Mood Tracker Background" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
                  Hey there, beautiful soul ✨
                </h1>
                <p className="text-xl opacity-90 drop-shadow-md">
                  I'm here to walk with you through every emotion, every day
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Mood Summary */}
            <div className={`relative rounded-3xl shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-3xl ${
              isDarkMode 
                ? 'bg-white/5 border border-white/10' 
                : 'bg-white/80 border border-white/20'
            }`}>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'} mr-4`}>
                    <TrendingUp className={`${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} size={24} />
                  </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {latestMood ? `Your heart spoke on ${new Date(latestMood.date).toLocaleDateString()}` : 'Your emotional journey this week'}
                  </h2>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className={`animate-spin rounded-full h-12 w-12 border-4 border-transparent ${
                      isDarkMode ? 'border-t-indigo-400' : 'border-t-indigo-600'
                    }`}></div>
                  </div>
                ) : (
                  <>
                    {/* Mood Calendar */}
                    <div className="grid grid-cols-7 gap-3 mb-8">
                      {moodData.map((day, index) => {
                        const date = new Date(day.date);
                        const moodInfo = moodConfig[day.mood] || moodConfig.neutral;
                        return (
                          <div key={index} className="flex flex-col items-center group">
                            <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${moodInfo.color} 
                              flex items-center justify-center text-2xl mb-2 transition-all duration-300 
                              group-hover:scale-110 group-hover:shadow-lg ${moodInfo.glow} ${
                              day.isToday ? 'ring-4 ring-indigo-500 ring-opacity-50' : ''
                            }`}>
                              {moodInfo.icon}
                              {day.isToday && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {date.getDate()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Trend Analysis */}
                    <div className={`rounded-2xl p-6 ${
                      isDarkMode ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50' : 'bg-gradient-to-r from-indigo-50 to-purple-50'
                    }`}>
                      <h3 className={`font-bold text-lg mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        How you've been feeling lately
                      </h3>
                      {trend === 'improving' ? (
                        <div className={`flex items-center ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          <div className="p-2 rounded-full bg-green-500/20 mr-3">
                            <Zap size={20} />
                          </div>
                          <p className="text-lg">
                            Your spirit is lifting! I can see the light growing brighter in your days. Keep nurturing that beautiful energy! 🌟
                          </p>
                        </div>
                      ) : trend === 'declining' ? (
                        <div className={`flex items-center ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                          <div className="p-2 rounded-full bg-amber-500/20 mr-3">
                            <AlertCircle size={20} />
                          </div>
                          <p className="text-lg">
                            I notice you've been carrying some heaviness lately. Remember, I'm here for you, and it's okay to not be okay. Let's find some gentle ways to support you. 💙
                          </p>
                        </div>
                      ) : (
                        <div className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          <div className="p-2 rounded-full bg-blue-500/20 mr-3">
                            <Battery size={20} />
                          </div>
                          <p className="text-lg">
                            Your emotions have been steady, like a calm river. There's beauty in consistency, and I'm proud of how you're maintaining your balance. 🌊
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Right Side - Actions */}
            <div className={`relative rounded-3xl shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-3xl ${
              isDarkMode 
                ? 'bg-white/5 border border-white/10' 
                : 'bg-white/80 border border-white/20'
            }`}>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-pink-500/20' : 'bg-pink-100'} mr-4`}>
                    <Heart className={`${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} size={24} />
                  </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Let's connect with your heart
                  </h2>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className={`animate-spin rounded-full h-12 w-12 border-4 border-transparent ${
                      isDarkMode ? 'border-t-pink-400' : 'border-t-pink-600'
                    }`}></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Mood Picker Modal */}
                    {showMoodPicker && (
                      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className={`rounded-3xl shadow-2xl max-w-md w-full mx-4 ${
                          isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'
                        }`}>
                          <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                What's in your heart today?
                              </h3>
                              <button 
                                onClick={() => setShowMoodPicker(false)}
                                className={`p-2 rounded-full transition-colors ${
                                  isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <X size={24} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              {Object.entries(moodConfig).map(([key, mood]) => (
                                <button
                                  key={key}
                                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                                    selectedMood === key 
                                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                                      : isDarkMode 
                                        ? 'border-gray-600 hover:border-indigo-400 bg-gray-800/50' 
                                        : 'border-gray-200 hover:border-indigo-300 bg-gray-50'
                                  }`}
                                  onClick={() => setSelectedMood(key)}
                                >
                                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mood.color} flex items-center justify-center text-3xl mb-3 shadow-lg ${mood.glow}`}>
                                    {mood.icon}
                                  </div>
                                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {mood.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                            
                            {selectedMood && (
                              <div className="mb-6">
                                <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {['sad', 'stress', 'anxious', 'lowEnergy'].includes(selectedMood)
                                    ? "I'm sorry you're going through this. Want to share what's weighing on your heart?"
                                    : "That's wonderful to hear! What's bringing you this feeling?"}
                                </label>
                                <textarea
                                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                                    isDarkMode 
                                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                  }`}
                                  rows={3}
                                  placeholder="Your thoughts are safe with me..."
                                  value={moodReason}
                                  onChange={(e) => setMoodReason(e.target.value)}
                                />
                                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  This helps me understand you better and provide more caring support.
                                </p>
                              </div>
                            )}
                            
                            <div className="flex justify-end space-x-4">
                              <button
                                className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                                  isDarkMode 
                                    ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                }`}
                                onClick={() => {
                                  setShowMoodPicker(false);
                                  setSelectedMood(null);
                                  setMoodReason('');
                                }}
                              >
                                Maybe later
                              </button>
                              <button
                                className={`px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 ${
                                  !selectedMood ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
                                }`}
                                onClick={logMood}
                                disabled={!selectedMood || submitting}
                              >
                                {submitting ? 'Saving your heart...' : 'Share with me'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Cards */}
                    {showMoodLog && (
                      <div className={`rounded-2xl p-6 border-2 border-dashed transition-all duration-300 hover:shadow-lg ${
                        isDarkMode 
                          ? 'bg-yellow-900/20 border-yellow-500/50 hover:bg-yellow-900/30' 
                          : 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'
                      }`}>
                        <h3 className={`font-bold text-lg mb-3 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                          Tell me about your day 🌅
                        </h3>
                        <p className={`mb-4 text-lg ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                          I'd love to hear how you're feeling right now. Your emotions matter, and sharing them helps me understand your beautiful, unique journey.
                        </p>
                        <button
                          onClick={() => setShowMoodPicker(true)}
                          className={`inline-flex items-center font-semibold text-lg transition-all duration-300 hover:scale-105 ${
                            isDarkMode ? 'text-yellow-300 hover:text-yellow-200' : 'text-yellow-700 hover:text-yellow-600'
                          }`}
                        >
                          Open your heart to me <ChevronRight className="ml-2" size={20} />
                        </button>
                      </div>
                    )}

                    {showTest && (
                      <div className={`rounded-2xl p-6 border-2 border-dashed transition-all duration-300 hover:shadow-lg ${
                        isDarkMode 
                          ? 'bg-blue-900/20 border-blue-500/50 hover:bg-blue-900/30' 
                          : 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                      }`}>
                        <h3 className={`font-bold text-lg mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                          Let's dive deeper together 🔍
                        </h3>
                        <p className={`mb-4 text-lg ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                          I'd love to understand you on a deeper level. Let's explore your emotional landscape together with some gentle questions.
                        </p>
                        <button className={`inline-flex items-center font-semibold text-lg transition-all duration-300 hover:scale-105 ${
                          isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-600'
                        }`}>
                          Start our journey <ChevronRight className="ml-2" size={20} />
                        </button>
                      </div>
                    )}

                    {showResources && (
                      <div className={`rounded-2xl p-6 border-2 border-dashed transition-all duration-300 hover:shadow-lg ${
                        isDarkMode 
                          ? 'bg-purple-900/20 border-purple-500/50 hover:bg-purple-900/30' 
                          : 'bg-purple-50 border-purple-300 hover:bg-purple-100'
                      }`}>
                        <h3 className={`font-bold text-lg mb-3 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                          I have something special for you ✨
                        </h3>
                        <p className={`mb-4 text-lg ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                          Based on our conversations and your beautiful emotional journey, I've gathered some resources that I think will speak to your heart.
                        </p>
                        <button
                          className={`inline-flex items-center font-semibold text-lg transition-all duration-300 hover:scale-105 ${
                            isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-purple-700 hover:text-purple-600'
                          }`}
                          onClick={() => {
                            navigate('/resources');
                          }}
                        >
                          Discover what I found <ChevronRight className="ml-2" size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodDashboard;