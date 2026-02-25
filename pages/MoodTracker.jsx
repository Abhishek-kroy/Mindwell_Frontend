import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMoodTracker } from '../components/MoodTracker/useMoodTracker';
import MoodHero from '../components/MoodTracker/MoodHero';
import MoodStatsCard from '../components/MoodTracker/MoodStatsCard';
import MoodActionCards from '../components/MoodTracker/MoodActionCards';
import MoodPickerModal from '../components/MoodTracker/MoodPickerModal';

const MoodDashboard = () => {
  const {
    moodData,
    latestTest,
    loading,
    todayMoodLogged,
    latestMood,
    logMood,
    submitting
  } = useMoodTracker();

  const [showMoodPicker, setShowMoodPicker] = useState(false);

  // Layout logic
  const showMoodLog = !todayMoodLogged;
  const showTest = !latestTest || !latestTest.recent;
  const showResources = todayMoodLogged && latestMood;

  const handleLogMood = async (selectedMood, moodReason) => {
    const success = await logMood(selectedMood, moodReason);
    if (success) {
      setShowMoodPicker(false);
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] selection:bg-[#7C9885]/20">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[80vw] h-[80vw] bg-[#7C9885]/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] bg-[#4A4E69]/5 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <MoodHero />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Stats */}
          <div className="lg:col-span-7">
            <MoodStatsCard
              moodData={moodData}
              latestMood={latestMood}
              loading={loading}
            />
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-5">
            <MoodActionCards
              showMoodLog={showMoodLog}
              showTest={showTest}
              showResources={showResources}
              onLogClick={() => setShowMoodPicker(true)}
              onTestClick={() => {/* Navigate to test or handle */ }}
            />
          </div>
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