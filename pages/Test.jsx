import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "../components/Assessment/useAssessment";
import AssessmentIntro from "../components/Assessment/AssessmentIntro";
import QuestionCard from "../components/Assessment/QuestionCard";
import ResultSummary from "../components/Assessment/ResultSummary";
import DetailedAnalysis from "../components/Assessment/DetailedAnalysis";

import { ChevronRight } from "lucide-react";
import { getAuth } from "firebase/auth";

const answerOptions = {
  anxiety: [
    { label: "Not at all", value: 0, emoji: "😌" },
    { label: "Several days", value: 1, emoji: "🤔" },
    { label: "More than half the days", value: 2, emoji: "😟" },
    { label: "Nearly every day", value: 3, emoji: "😰" }
  ],
  stress: [
    { label: "Never", value: 0, emoji: "😌" },
    { label: "Almost never", value: 1, emoji: "🤔" },
    { label: "Sometimes", value: 2, emoji: "😟" },
    { label: "Fairly often", value: 3, emoji: "😰" },
    { label: "Very often", value: 4, emoji: "😨" }
  ],
  anger: [
    { label: "Rarely", value: 0, emoji: "😌" },
    { label: "Sometimes", value: 1, emoji: "🤔" },
    { label: "Occasionally", value: 2, emoji: "😠" },
    { label: "Most of the time", value: 3, emoji: "😡" }
  ],
  low: [
    { label: "A little", value: 1, emoji: "😌" },
    { label: "Some", value: 2, emoji: "😕" },
    { label: "Good part", value: 3, emoji: "😞" },
    { label: "Most part", value: 4, emoji: "😩" }
  ],
  sad: [
    { label: "Not at all", value: 0, emoji: "😌" },
    { label: "Several days", value: 1, emoji: "😕" },
    { label: "Half the days", value: 2, emoji: "😞" },
    { label: "Every day", value: 3, emoji: "😢" }
  ]
};

const getMentalHealthLevel = (score, mood) => {
  if (mood === 'anxiety') {
    if (score <= 4) return { level: "Minimal", color: "bg-emerald-500", message: "Your anxiety looks minimal." };
    if (score <= 9) return { level: "Mild", color: "bg-blue-500", message: "You're experiencing mild anxiety." };
    if (score <= 14) return { level: "Moderate", color: "bg-amber-500", message: "You're experiencing moderate anxiety." };
    return { level: "Severe", color: "bg-rose-500", message: "You're experiencing severe anxiety." };
  }
  // Simplified for other moods
  if (score <= 5) return { level: "Excellent", color: "bg-emerald-500", message: "You're thriving!" };
  if (score <= 10) return { level: "Good", color: "bg-blue-500", message: "You're maintaining balance." };
  return { level: "Needs Support", color: "bg-rose-500", message: "Consider connecting with support." };
};

const happyQuotes = [
  "Happiness is not something ready-made. It comes from your own actions.",
  "The purpose of our lives is to be happy.",
  "Happiness is a choice, not a result."
];

const MentalHealthQuestionnaire = () => {
  const navigate = useNavigate();
  const {
    selectedMood,
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    setAnswers,
    result,
    setResult,
    stage,
    setStage,
    loading,
    startAssessment,
    saveResults,
    reset
  } = useAssessment();

  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleMoodSelect = (mood) => {
    startAssessment(mood);
  };

  const handleAnswer = (value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = value;
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate results
      if (selectedMood === 'happy') {
        const happyResult = {
          type: 'happy',
          level: 'Vibrant',
          color: 'bg-yellow-400',
          quote: happyQuotes[Math.floor(Math.random() * happyQuotes.length)]
        };
        setResult(happyResult);
        saveResults(happyResult);
        setStage(3);
      } else {
        const totalScore = updatedAnswers.reduce((a, b) => a + b, 0);
        const assessmentResult = getMentalHealthLevel(totalScore, selectedMood);
        setResult(assessmentResult);
        saveResults(assessmentResult);
        setStage(3);
      }
    }
  };

  const handleBack = () => {
    if (stage === 1) {
      navigate('/therapies');
    } else if (stage === 2) {
      if (currentQuestionIndex === 0) {
        setStage(1);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    } else if (stage === 3) {
      setStage(2);
      setCurrentQuestionIndex(questions.length - 1);
    } else if (stage === 4) {
      setStage(3);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Mocking API call for now to ensure theme works
    setTimeout(() => {
      setMoodAnalysis({
        summary: "Your recent reflections suggest a period of transition. While you're maintaining steady energy, there are subtle patterns of cortisol-driven anxiety in evening hours.",
        insights: [
          "Evening anxiety spikes linked to digital fatigue",
          "Strong resilience core despite periodic stress",
          "Balanced sleep-wake emotional cycle"
        ],
        recommendations: [
          "Implement a 'Digital Sunset' 2 hours before bed",
          "Practice Box Breathing during peak work hours",
          "Nature walk (15 mins) to recalibrate cortisol"
        ]
      });
      setStage(4);
      setIsAnalyzing(false);
    }, 1500);
  };

  useEffect(() => {
    // Initial stage setup
    if (stage === 0) setStage(1);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FBFF] selection:bg-[#7C9885]/20 pb-10">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#7C9885]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#4A4E69]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative pt-32">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40 gap-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[#7C9885]/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#7C9885] shadow-2xl border border-white/60">
                  <Waves size={32} />
                </div>
              </motion.div>
              <div className="space-y-2 text-center">
                <p className="text-[#2D3142] font-bold tracking-[0.4em] uppercase text-[10px] items-center flex gap-2">
                  Calibrating <span className="text-[#7C9885]">Emotional Resonance</span>
                </p>
                <div className="flex justify-center gap-1">
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1 h-1 rounded-full bg-[#7C9885]" />
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 rounded-full bg-[#7C9885]" />
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 rounded-full bg-[#7C9885]" />
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {stage === 1 && (
                <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AssessmentIntro
                    onSelectMood={handleMoodSelect}
                    onBack={() => navigate('/therapies')}
                  />
                </motion.div>
              )}

              {stage === 2 && (
                <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <QuestionCard
                    question={questions[currentQuestionIndex]}
                    options={answerOptions[selectedMood === 'happy' ? 'sad' : selectedMood] || []}
                    onAnswer={handleAnswer}
                    onBack={handleBack}
                    currentProgress={((currentQuestionIndex + 1) / questions.length) * 100}
                    currentIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                  />
                </motion.div>
              )}

              {stage === 3 && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ResultSummary
                    result={result}
                    selectedMood={selectedMood}
                    onReset={reset}
                    onAnalyze={handleAnalyze}
                  />
                </motion.div>
              )}

              {stage === 4 && (
                <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DetailedAnalysis
                    analysis={moodAnalysis}
                    onBack={() => setStage(3)}
                  />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Persistence Button - Reset */}
      {stage !== 1 && !loading && (
        <div className="mt-20 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
          <button
            onClick={reset}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4A4E69] hover:text-[#7C9885]"
          >
            Reset Assessment Session
          </button>
        </div>
      )}
    </div>
  );
};

const AnswerOption = ({ option, index, isSelected, onClick, isAnimating }) => (
  <div
    className={`relative p-4 rounded-xl cursor-pointer transition-all duration-400 transform hover:scale-102 ${isSelected
        ? `bg-gradient-to-r ${option.color} text-white shadow-xl scale-102 border-2 border-white/30`
        : "bg-white/70 backdrop-blur-xl hover:bg-white/80 shadow-md hover:shadow-lg border border-white/30"
      }`}
    onClick={() => onClick(option.value, index)}
    style={{ animationDelay: `${index * 0.075}s` }}
  >
    <div className="flex items-center space-x-4">
      <div className={`text-xl transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}>
        {option.emoji}
      </div>
      <div className="flex-1">
        <span className={`text-base font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
          {option.label}
        </span>
      </div>
      {isSelected && (
        <CheckCircle className="w-5 h-5 text-white animate-pulse" />
      )}
    </div>

    {isSelected && (
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl"></div>
    )}
  </div>
);

export default function MentalHealthQuestionnaire() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [happyResponse, setHappyResponse] = useState('');
  const [showHappyResult, setShowHappyResult] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [showDetailed, setShowDetailed] = useState(false);
  const auth = getAuth();

  // Load saved state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('mentalHealthAssessmentState');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.selectedMood) {
        setSelectedMood(state.selectedMood);
        setQuestions(state.questions || []);
        setCurrentQuestionIndex(state.currentQuestionIndex || 0);
        setAnswers(state.answers || []);
        setResult(state.result || null);
        setShowWelcome(false);
        if (state.happyResponse) setHappyResponse(state.happyResponse);
        if (state.showHappyResult) setShowHappyResult(true);
      }
    }
  }, []);

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    if (selectedMood) {
      const stateToSave = {
        selectedMood,
        questions,
        currentQuestionIndex,
        answers,
        result,
        happyResponse,
        showHappyResult
      };
      localStorage.setItem('mentalHealthAssessmentState', JSON.stringify(stateToSave));
    }
  }, [selectedMood, questions, currentQuestionIndex, answers, result, happyResponse, showHappyResult]);

  // Prevent horizontal scrolling
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = '';
    };
  }, []);

  const mockGetQuestionsByMood = (mood) => {
    const questionSets = {
      anxiety: [
        { text: "Do you feel nervous, anxious, or on edge?" },
        { text: "Do you find it difficult to stop or control worrying?" },
        { text: "Do you worry too much about different things?" },
        { text: "Do you have trouble relaxing?" },
        { text: "Are you so restless that it's hard to sit still?" },
      ],
      stress: [
        { text: "Do you feel overwhelmed by your daily responsibilities?" },
        { text: "Do you have trouble managing your time effectively?" },
        { text: "Do you feel like you're under constant pressure?" },
        { text: "Do you have difficulty sleeping due to stress?" },
        { text: "Do you feel irritable or short-tempered?" },
      ],
      low: [
        { text: "Do you feel tired even after a full night's sleep?" },
        { text: "Do you lack motivation to do things you usually enjoy?" },
        { text: "Do you feel like you have no energy throughout the day?" },
        { text: "Do you find it hard to concentrate on tasks?" },
        { text: "Do you feel disconnected from your daily activities?" },
      ],
      sad: [
        { text: "Do you feel down, depressed, or hopeless?" },
        { text: "Do you have little interest or pleasure in doing things?" },
        { text: "Do you feel bad about yourself or like you're a failure?" },
        { text: "Do you have trouble falling or staying asleep?" },
        { text: "Do you feel like you have little energy?" },
      ],
      happy: [
        { text: "What's making you feel so happy and excited today?" },
      ]
    };
    return questionSets[mood] || [];
  };

  useEffect(() => {
    setShowWelcome(true);
  }, []);

  const handleMoodSelect = (moodValue) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedMood(moodValue);
      setShowWelcome(false);

      if (moodValue === 'happy') {
        setQuestions(getQuestionsByMood('happy'));
        setAnswers([]);
        setCurrentQuestionIndex(0);
      } else {
        setQuestions(shuffle(getQuestionsByMood(moodValue)));
        setAnswers([]);
        setCurrentQuestionIndex(0);
      }

      setLoading(false);
    }, 900);
  };

  const handleAnswer = (value, index) => {
    if (selectedMood === 'happy') {
      setSelectedIndex(index);
      setTimeout(() => {
        const randomQuote = happyQuotes[Math.floor(Math.random() * happyQuotes.length)];
        const happyResult = {
          type: 'happy',
          quote: randomQuote,
          video: videoSuggestions[selectedMood].video,
        };
        setResult(happyResult);
        setShowHappyResult(true);

        if (auth.currentUser) {
          saveResultsToFirestore(selectedMood, [value], questions, happyResult);
        }
      }, 600);
      return;
    }

    setSelectedIndex(index);

    setTimeout(() => {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = parseInt(value);

      const nextIndex = currentQuestionIndex + 1;

      if (nextIndex < questions.length) {
        setAnswers(updatedAnswers);
        setCurrentQuestionIndex(nextIndex);
        setSelectedIndex(null);
      } else {
        const totalScore = updatedAnswers.reduce((a, b) => a + b, 0);
        const { level, color, message } = getMentalHealthLevel(totalScore, selectedMood);
        const assessmentResult = {
          score: totalScore,
          level,
          color,
          message,
          video: videoSuggestions[selectedMood][level],
        };
        setAnswers(updatedAnswers);
        setResult(assessmentResult);

        if (auth.currentUser) {
          saveResultsToFirestore(selectedMood, updatedAnswers, questions, assessmentResult);
        }
      }
    }, 600);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedIndex(null);
    }
  };

  const resetQuiz = () => {
    localStorage.removeItem('mentalHealthAssessmentState');
    setSelectedMood(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setSelectedIndex(null);
    setShowWelcome(true);
    setHappyResponse('');
    setShowHappyResult(false);
    setShowDetailed(false);
    setMoodAnalysis(null);
  };

  const fetchMoodAnalysis = async () => {
    if (!result || selectedMood === 'happy') return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const idToken = await auth.currentUser.getIdToken();

      // Prepare the complete assessment data to send
      const assessmentData = {
        moodType: selectedMood,
        score: result.score,
        level: result.level,
        answers: questions.map((question, index) => ({
          question: question.text,
          answer: answerOptions[selectedMood]?.find(opt => opt.value === answers[index])?.label || "",
          value: answers[index]
        })),
        date: new Date().toISOString()
      };

      // Log what we're sending to the backend
      console.log("Sending complete assessment to analyzeMoodTest:", JSON.stringify(assessmentData, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/analyzeMoodTest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(assessmentData)
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      console.log("Analysis results:", data);

      setMoodAnalysis({
        summary: data.analysis,
        recommendations: data.recommendations || [
          "Practice mindfulness meditation for 10 minutes daily",
          "Engage in regular physical activity",
          "Maintain a consistent sleep schedule",
          "Connect with supportive friends or family",
          "Consider journaling to process emotions"
        ],
        insights: data.insights || [
          `Your ${selectedMood} levels are currently marked as ${result.level}.`,
          "Your mood may be affected by specific recurring patterns.",
          "Try observing how your mood shifts throughout the day."
        ]
      });

      setShowDetailed(true);
    } catch (error) {
      console.error("Error fetching mood analysis:", error);
      setAnalysisError("Failed to load detailed analysis. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveResultsToFirestore = async (mood, answers, questions, result) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      const timestamp = Timestamp.fromDate(today);

      const concerns = answers.map((value, index) => {
        if (value >= 2) {
          return {
            question: questions[index]?.text || "",
            answer:
              answerOptions[mood]?.find((opt) => opt.value === value)?.label ||
              "",
            value,
          };
        }
        return null;
      }).filter(Boolean);

      const assessmentData = {
        date: timestamp,
        moodType: mood,
        score: result?.score || 0,
        level: result?.level || "Happy",
        answers: answers.map((value, index) => ({
          question: questions[index]?.text || "",
          answer:
            answerOptions[mood]?.find((opt) => opt.value === value)?.label || "",
          value,
        })),
        concerns,
        video: result?.video ?? videoSuggestions[mood]?.video ?? null,
        summary: happyResponse || null,
      };

      const userDocRef = doc(db, "users", user.uid);

      const moodDayRef = collection(userDocRef, `moodAssessment/${dateStr}/assessments`);
      await setDoc(doc(moodDayRef), assessmentData);

      const summaryRef = doc(db, "users", user.uid, "moodSummary", "summary");
      const summarySnap = await getDoc(summaryRef);
      if (!summarySnap.exists()) {
        await setDoc(summaryRef, { [mood]: 1 });
      } else {
        await updateDoc(summaryRef, { [mood]: increment(1) });
      }

      const dailyMoodRef = doc(db, "users", user.uid, "dailyMood", dateStr);
      const dailySnap = await getDoc(dailyMoodRef);

      let moodCounts = {};
      let mostFrequentMood = mood;
      let latestMood = mood;

      if (!dailySnap.exists()) {
        moodCounts[mood] = 1;
      } else {
        const prevData = dailySnap.data() || {};
        const prevCounts = { ...prevData };
        delete prevCounts.latestMood;
        delete prevCounts.mostFrequentMood;

        moodCounts = {
          ...prevCounts,
          [mood]: (prevCounts[mood] || 0) + 1,
        };

        let maxCount = 0;
        for (const key in moodCounts) {
          if (moodCounts[key] > maxCount) {
            mostFrequentMood = key;
            maxCount = moodCounts[key];
          }
        }
      }

      await setDoc(dailyMoodRef, {
        ...moodCounts,
        mostFrequentMood,
        latestMood,
      });

      console.log("✅ Assessment saved and stats updated.");
    } catch (error) {
      console.error("❌ Error saving assessment data:", error);
    }
  };

  const FuturisticBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-50/30 via-transparent to-pink-50/30"></div>
      <FloatingOrbs />
      <AnimatedGrid />

      <div className="absolute -top-30 -left-30 w-60 h-60 bg-gradient-to-r from-purple-300/20 via-pink-300/20 to-cyan-300/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute -bottom-30 -right-30 w-72 h-72 bg-gradient-to-r from-blue-300/15 via-indigo-300/15 to-purple-300/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-54 h-54 bg-gradient-to-r from-cyan-300/10 via-teal-300/10 to-emerald-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex flex-col overflow-x-hidden">
        <FuturisticBackground />
        <div className="flex-1 flex items-center justify-center pt-[81px]">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-18 h-18 border-3 border-purple-200/50 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-18 h-18 border-3 border-transparent border-t-purple-500 border-r-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
              <div className="absolute inset-1.5 w-15 h-15 border-1.5 border-transparent border-t-pink-400 rounded-full animate-spin" style={{ animationDuration: '0.9s' }}></div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">
                Preparing Your Journey
              </p>
              <p className="text-gray-600 text-sm">Calibrating personalized insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showWelcome && !selectedMood) {
    return (
      <div className="min-h-screen w-screen flex flex-col p-3 overflow-x-hidden">
        <FuturisticBackground />
        <div className="flex-1 flex items-center justify-center pt-[81px]">
          <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-12 space-y-6">

              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent leading-tight">
                How are you feeling today?
              </h1>

              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Step into the future of mental wellness. Our advanced assessment provides
                <span className="font-semibold text-purple-600"> personalized insights</span> and
                <span className="font-semibold text-cyan-600"> tailored resources</span> to support your journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
              <MoodCard
                mood="happy"
                emoji="😄"
                label="Happy"
                description="Feeling joyful, excited, or in high spirits today, share with us"
                onClick={handleMoodSelect}
                index={0}
              />
              <MoodCard
                mood="anxiety"
                emoji="😰"
                label="Anxious"
                description="Feeling worried, nervous, or on edge in various situations"
                onClick={handleMoodSelect}
                index={1}
              />
              <MoodCard
                mood="stress"
                emoji="😫"
                label="Stressed"
                description="Overwhelmed by daily pressures and responsibilities"
                onClick={handleMoodSelect}
                index={2}
              />
              <MoodCard
                mood="low"
                emoji="😞"
                label="Low Energy"
                description="Feeling tired, unmotivated, or lacking enthusiasm"
                onClick={handleMoodSelect}
                index={3}
              />
              <MoodCard
                mood="sad"
                emoji="😢"
                label="Sad"
                description="Experiencing feelings of sadness or hopelessness"
                onClick={handleMoodSelect}
                index={4}
              />
            </div>

            <div className="text-center mt-12 space-y-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-cyan-100/80 backdrop-blur-sm rounded-full border border-white/30 shadow-md">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-sm bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                  AI-Powered Wellness Assessment
                </span>
                <Sparkles className="w-4 h-4 text-cyan-600" />
              </div>
            </div>

            <div className="text-center mt-12 space-y-4">
              <div className="flex items-center justify-center space-x-4 text-gray-500">
                <div className="flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium">Completely Confidential</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="text-xs font-medium">Personalized for You</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Waves className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-medium">Science-Based</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (result && result.type === 'happy') {
    return (
      <div className="min-h-screen w-screen flex flex-col p-3 overflow-x-hidden">
        <FuturisticBackground />
        <div className="flex-1 flex items-center justify-center pt-[81px]">
          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 md:p-9">
              <div className="text-center space-y-7">
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-100/80 via-orange-100/80 to-pink-100/80 backdrop-blur-sm rounded-full border border-white/30 shadow-md">
                    <Sparkles className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-sm bg-gradient-to-r from-yellow-700 to-orange-600 bg-clip-text text-transparent">
                      Celebrating Your Joy!
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                    That's Wonderful! 🌟
                  </h2>

                  <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-yellow-50/80 to-orange-50/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
                    <div className="text-4xl mb-4">✨</div>
                    <blockquote className="text-base md:text-xl text-gray-700 font-medium leading-relaxed italic">
                      "{result.quote}"
                    </blockquote>
                  </div>

                  <p className="text-gray-600 text-base max-w-xl mx-auto">
                    Your happiness is truly beautiful! Keep nurturing these positive moments and remember to share your joy with others.
                    Here's an uplifting video to amplify your wonderful energy!
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl p-6 space-y-4 border border-white/30">
                  <div className="flex items-center justify-center space-x-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-pink-600 bg-clip-text text-transparent">
                      Spread the Joy
                    </h3>
                  </div>

                  <div className="max-w-xl mx-auto aspect-video rounded-xl overflow-hidden shadow-xl border border-white/20">
                    <iframe
                      className="w-full h-full"
                      src={result.video ? result.video.replace("watch?v=", "embed/") : "https://www.youtube.com/embed/d-diB65scQU"}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Happiness Resource"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={resetQuiz}
                    className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 hover:from-yellow-600 hover:via-orange-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Share More Joy
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-yellow-300 hover:border-yellow-400 bg-white/80 backdrop-blur-sm px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-md text-yellow-700 hover:text-yellow-800"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Spread Positivity
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen w-screen flex flex-col p-3 overflow-x-hidden">
        <FuturisticBackground />
        <div className="flex-1 flex items-center justify-center pt-[81px]">
          <div className="w-full max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 md:p-9">
              <div className="text-center space-y-7">
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100/80 via-emerald-100/80 to-cyan-100/80 backdrop-blur-sm rounded-full border border-white/30 shadow-md">
                    <Star className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-sm bg-gradient-to-r from-emerald-700 to-cyan-600 bg-clip-text text-transparent">
                      Assessment Complete
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Your Wellness Profile
                  </h2>
                  <p className="text-gray-600 text-base">{result.message}</p>
                </div>

                <div className="flex flex-col items-center space-y-6">
                  <div className={`relative w-30 h-30 rounded-full flex items-center justify-center bg-gradient-to-br ${result.color} shadow-xl`}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="relative text-center text-white">
                      <div className="text-2xl font-bold">{result.score}</div>
                      <div className="text-xs opacity-90 font-medium">wellness points</div>
                    </div>
                    <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-md"></div>
                  </div>

                  <div className={`px-6 py-2 rounded-full bg-gradient-to-r ${result.color} text-white font-bold text-lg shadow-lg border border-white/20`}>
                    {result.level}
                  </div>
                </div>

                {showDetailed && moodAnalysis ? (
                  <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-2xl p-6 space-y-4 border border-white/30">
                    <div className="flex items-center justify-center space-x-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Detailed Analysis
                      </h3>
                    </div>

                    <div className="space-y-4 text-left">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
                        <div className="text-gray-600">
                          <ReactMarkdown>{moodAnalysis.summary}</ReactMarkdown>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Key Insights</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {moodAnalysis.insights.map((insight, i) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Recommendations</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {moodAnalysis.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-2xl p-6 space-y-4 border border-white/30">
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Curated Resource
                      </h3>
                    </div>

                    <div className="max-w-xl mx-auto aspect-video rounded-xl overflow-hidden shadow-xl border border-white/20">
                      <iframe
                        className="w-full h-full"
                        src={result.video ? result.video.replace("watch?v=", "embed/") : "https://www.youtube.com/embed/d-diB65scQU"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Wellness Resource"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {!showDetailed ? (
                    <Button
                      onClick={fetchMoodAnalysis}
                      disabled={isAnalyzing}
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                    >
                      {isAnalyzing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Show Detailed Results
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowDetailed(false)}
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Results
                    </Button>
                  )}

                  <Button
                    onClick={resetQuiz}
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-gray-400 bg-white/80 backdrop-blur-sm px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-md"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Take Again
                  </Button>
                </div>

                {analysisError && (
                  <div className="text-red-500 text-sm mt-2">{analysisError}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen w-screen flex flex-col overflow-x-hidden">
      <FuturisticBackground />
      <div className="flex-1 flex items-center justify-center p-3 pt-[81px]">
        <div className="w-full max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-4 md:p-7">
            <div className="mb-9 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <span className="flex items-center space-x-1.5">
                  <Brain className="w-3 h-3" />
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                </span>
                <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  {Math.round(progress)}% Complete
                </span>
              </div>

              <div className="relative h-2 bg-gray-200/50 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full transition-all duration-700 ease-out shadow-md"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="space-y-7">
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-gray-800 bg-clip-text text-transparent leading-relaxed">
                  {currentQuestion?.text}
                </h2>

                {selectedMood === 'happy' ? (
                  <div className="max-w-xl mx-auto">
                    <textarea
                      className="w-full p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-md text-gray-700 text-base resize-none focus:outline-none focus:ring-1.5 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                      rows="3"
                      placeholder="Share what's bringing you joy today... 🌟"
                      value={happyResponse}
                      onChange={(e) => setHappyResponse(e.target.value)}
                    />
                    <Button
                      onClick={() => handleAnswer(0, 0)}
                      className="mt-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 hover:from-yellow-600 hover:via-orange-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Continue
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 text-base">
                      Select the response that best reflects your recent experience:
                    </p>
                    <div className="space-y-3 max-w-xl mx-auto">
                      {answerOptions[selectedMood]?.map((option, index) => (
                        <AnswerOption
                          key={index}
                          option={option}
                          index={index}
                          isSelected={selectedIndex === index}
                          isAnimating={selectedIndex === index}
                          onClick={handleAnswer}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-9 flex items-center justify-between">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="bg-gray-200/80 hover:bg-gray-300/80 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-white/30"
              >
                <ArrowLeft className="w-3 h-3 mr-1.5" />
                Previous
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center space-x-1.5">
                  <Shield className="w-3 h-3" />
                  <span>Your privacy is protected</span>
                </p>
              </div>

              <Button
                onClick={resetQuiz}
                className="bg-red-100/80 hover:bg-red-200/80 text-red-700 px-6 py-2 rounded-lg font-semibold transition-all duration-300 backdrop-blur-sm border border-white/30"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
