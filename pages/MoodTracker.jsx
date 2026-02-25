import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMoodTracker } from '../components/MoodTracker/useMoodTracker';
import MoodHero from '../components/MoodTracker/MoodHero';
import MoodStatsCard from '../components/MoodTracker/MoodStatsCard';
import MoodActionCards from '../components/MoodTracker/MoodActionCards';
import MoodPickerModal from '../components/MoodTracker/MoodPickerModal';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MoodDashboard = () => {
  const navigate = useNavigate();
  const {
    moodData,
    latestTest,
    loading,
    todayMoodLogged,
    latestMood,
    logMood,
    submitting
  } = useMoodTracker();

  const [stage, setStage] = useState(1);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const handleLogMood = async (selectedMood, moodReason) => {
    const success = await logMood(selectedMood, moodReason);
    if (success) {
      setShowMoodPicker(false);
    }
    return success;
  };

  const nextStage = () => setStage(prev => Math.min(prev + 1, 3));
  const prevStage = () => setStage(prev => Math.max(prev - 1, 1));

  return (
    <div className="h-screen w-full bg-[#f8f9fa] overflow-hidden relative">
      <AnimatePresence mode="wait">
        {stage === 1 && (
          <motion.section
            key="stage1"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden px-6"
          >
            <div className="absolute inset-0 z-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F9FBFF]" />
            </div>
            <div className="relative z-10 w-full max-w-7xl mx-auto pt-20">
              <MoodHero />
            </div>
          </motion.section>
        )}

        {stage === 2 && (
          <motion.section
            key="stage2"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden px-6"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="C:\Users\Abhishek Kumar Roy\.gemini\antigravity\brain\c0c50491-27aa-4a35-8a64-104b42b9f54b\weekly_synthesis_bg_1771999879232.png"
                className="w-full h-full object-cover opacity-10"
                alt="Synthesis Background"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#F9FBFF] via-transparent to-[#F9FBFF]" />
            </div>
            <div className="relative z-10 w-full max-w-5xl mx-auto">
              <MoodStatsCard
                moodData={moodData}
                latestMood={latestMood}
                loading={loading}
              />
            </div>
          </motion.section>
        )}

        {stage === 3 && (
          <motion.section
            key="stage3"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden px-6"
          >
            <div className="absolute inset-0 z-0 opacity-10">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#7C9885]/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#4A4E69]/10 rounded-full blur-[120px]" />
            </div>
            <div className="relative z-10 w-full max-w-4xl mx-auto">
              <MoodActionCards
                showMoodLog={!todayMoodLogged}
                showTest={!latestTest || !latestTest.recent}
                showResources={todayMoodLogged && latestMood}
                onLogClick={() => setShowMoodPicker(true)}
                onTestClick={() => navigate('/test')}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-8 items-center">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`w-1.5 transition-all duration-500 rounded-full ${stage === s ? 'h-8 bg-[#7C9885]' : 'h-1.5 bg-[#4A4E69]/20 hover:bg-[#4A4E69]/40'
                }`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {stage > 1 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevStage}
              className="p-3 rounded-full bg-white/80 backdrop-blur-md shadow-lg text-[#4A4E69] border border-white/50"
            >
              <ChevronUp size={20} />
            </motion.button>
          )}
          {stage < 3 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextStage}
              className="p-3 rounded-full bg-[#2D3142] shadow-lg text-white"
            >
              <ChevronDown size={20} />
            </motion.button>
          )}
        </div>
      </div>

      <MoodPickerModal
        isOpen={showMoodPicker}
        onClose={() => setShowMoodPicker(false)}
        onLogMood={handleLogMood}
        submitting={submitting}
      />
    </div>
  );
};

export default MoodDashboard;
