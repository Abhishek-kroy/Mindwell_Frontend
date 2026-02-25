import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "../components/Assessment/useAssessment";
import AssessmentIntro from "../components/Assessment/AssessmentIntro";
import QuestionCard from "../components/Assessment/QuestionCard";
import ResultSummary from "../components/Assessment/ResultSummary";
import DetailedAnalysis from "../components/Assessment/DetailedAnalysis";
import { Waves } from "lucide-react";

/**
 * Immersive Fullscreen Assessment Orchestrator
 * Strictly 100vh, zero-scroll architecture.
 */
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
    reset,
    answerOptions
  } = useAssessment();

  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Constants mapping to thematic assets
  const backdrops = {
    1: "C:/Users/Abhishek Kumar Roy/.gemini/antigravity/brain/c0c50491-27aa-4a35-8a64-104b42b9f54b/assessment_pulse_bg_v2_1772000066219.png",
    3: "C:/Users/Abhishek Kumar Roy/.gemini/antigravity/brain/c0c50491-27aa-4a35-8a64-104b42b9f54b/weekly_synthesis_bg_1771999879232.png"
  };

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
      const happyQuotes = [
        "Happiness is not something ready-made. It comes from your own actions.",
        "The purpose of our lives is to be happy.",
        "Happiness is a choice, not a result."
      ];

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
        const getMentalHealthLevel = (score, mood) => {
          if (mood === 'anxiety') {
            if (score <= 4) return { level: "Minimal", color: "bg-emerald-500", message: "Your anxiety looks minimal." };
            if (score <= 9) return { level: "Mild", color: "bg-blue-500", message: "You're experiencing mild anxiety." };
            if (score <= 14) return { level: "Moderate", color: "bg-amber-500", message: "You're experiencing moderate anxiety." };
            return { level: "Severe", color: "bg-rose-500", message: "You're experiencing severe anxiety." };
          }
          if (score <= 5) return { level: "Excellent", color: "bg-emerald-500", message: "You're thriving!" };
          if (score <= 10) return { level: "Good", color: "bg-blue-500", message: "You're maintaining balance." };
          return { level: "Needs Support", color: "bg-rose-500", message: "Consider connecting with support." };
        };

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
    setTimeout(() => {
      setMoodAnalysis({
        summary: "Your recent reflections suggest a period of transition. While you're maintaining steady energy, there are subtle patterns in your cortisol rhythm.",
        insights: [
          "Spikes in evening anxiety clusters",
          "Resilient response to emotional triggers",
          "Balanced overall cognitive clarity"
        ],
        recommendations: [
          "Implement a 'Digital Sunset' 1 hour before bed",
          "Practice Box Breathing during transitions",
          "Short morning walks for daylight exposure"
        ]
      });
      setStage(4);
      setIsAnalyzing(false);
    }, 1500);
  };

  useEffect(() => {
    if (stage === 0) setStage(1);
    // Force zero scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="h-screen w-full bg-[#F9FBFF] overflow-hidden relative">
      <AnimatePresence mode="wait">
        {loading || isAnalyzing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full flex flex-col items-center justify-center gap-8 relative z-50 bg-white/40 backdrop-blur-xl"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#7C9885]/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-[#7C9885] shadow-2xl border border-white/60">
                <Waves size={40} className="animate-pulse" />
              </div>
            </motion.div>
            <div className="space-y-4 text-center">
              <p className="text-[#2D3142] font-bold tracking-[0.4em] uppercase text-[10px] items-center flex gap-2 justify-center">
                Calibrating <span className="text-[#7C9885]">Sanctuary</span>
              </p>
              <div className="flex justify-center gap-2">
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: d }}
                    className="w-1.5 h-1.5 rounded-full bg-[#7C9885]"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={stage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full relative"
          >
            {/* Stage Background */}
            <div className="absolute inset-0 z-0">
              {backdrops[stage] && (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.08 }}
                  src={backdrops[stage]}
                  className="w-full h-full object-cover grayscale contrast-125"
                  alt="Backdrop"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F9FBFF]/20 to-[#F9FBFF]/80" />
            </div>

            <div className="relative z-10 h-full w-full flex flex-col justify-center py-20">
              {stage === 1 && (
                <AssessmentIntro
                  onSelectMood={handleMoodSelect}
                  onBack={() => navigate('/therapies')}
                />
              )}

              {stage === 2 && (
                <QuestionCard
                  question={questions[currentQuestionIndex]}
                  options={answerOptions[selectedMood === 'happy' ? 'sad' : selectedMood] || []}
                  currentProgress={((currentQuestionIndex + 1) / questions.length) * 100}
                  currentIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                  onAnswer={handleAnswer}
                  onBack={handleBack}
                />
              )}

              {stage === 3 && (
                <ResultSummary
                  result={result}
                  selectedMood={selectedMood}
                  onReset={reset}
                  onAnalyze={handleAnalyze}
                />
              )}

              {stage === 4 && (
                <DetailedAnalysis
                  analysis={moodAnalysis}
                  onBack={() => setStage(3)}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistence Reset in stage > 1 */}
      {!loading && !isAnalyzing && stage > 1 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={reset}
            className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#4A4E69]/30 hover:text-[#7C9885] transition-colors"
          >
            Reset Journey
          </button>
        </div>
      )}
    </div>
  );
};


export default MentalHealthQuestionnaire;
