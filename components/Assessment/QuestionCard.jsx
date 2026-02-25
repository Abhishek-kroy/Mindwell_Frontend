import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react';

const QuestionCard = ({
    question,
    options,
    onAnswer,
    onBack,
    currentProgress,
    currentIndex,
    totalQuestions
}) => {
    const [selectedIdx, setSelectedIdx] = useState(null);

    const handleSelect = (value, index) => {
        setSelectedIdx(index);
        setTimeout(() => {
            onAnswer(value);
            setSelectedIdx(null);
        }, 600); // Slightly slower for elegance
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-6 py-10">
            <div className="mb-16 flex items-center justify-between">
                <motion.button
                    whileHover={{ x: -4 }}
                    onClick={onBack}
                    className="inline-flex items-center gap-3 text-[#4A4E69]/40 hover:text-[#2D3142] transition-all group"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono">Previous Layer</span>
                </motion.button>
                <div className="text-right space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C9885] block">Phase Sync</span>
                    <div className="text-sm font-bold text-[#2D3142] font-mono tracking-tighter">
                        {currentIndex + 1} <span className="text-[#4A4E69]/20 mx-1">/</span> {totalQuestions}
                    </div>
                </div>
            </div>

            <div className="mb-20">
                <div className="h-1 w-full bg-[#7C9885]/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentProgress}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="h-full bg-[#7C9885] rounded-full shadow-[0_0_20px_rgba(124,152,133,0.5)]"
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.98, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -20 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative bg-white/40 backdrop-blur-[40px] rounded-[4rem] p-12 md:p-20 border border-white/60 shadow-[0_50px_100px_-20px_rgba(74,78,105,0.15)] overflow-hidden"
                >
                    {/* Grain texture overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-5xl font-bold text-[#2D3142] mb-16 leading-[1.1] tracking-tighter"
                    >
                        {question.text}
                    </motion.h2>

                    <div className="space-y-6">
                        {options.map((option, index) => (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + (index * 0.1) }}
                                whileHover={{ x: 10, scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => handleSelect(option.value, index)}
                                className={`w-full text-left p-8 rounded-[2rem] border-2 transition-all duration-500 flex items-center justify-between group relative overflow-hidden ${selectedIdx === index
                                        ? 'bg-[#2D3142] border-[#2D3142] text-white shadow-2xl scale-[1.02]'
                                        : 'bg-white/50 border-white/40 text-[#4A4E69] hover:bg-white hover:border-white shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:rotate-6 ${selectedIdx === index ? 'bg-white/10' : 'bg-[#F9FBFF] shadow-inner'
                                        }`}>
                                        {option.emoji}
                                    </div>
                                    <span className="font-bold text-xl tracking-tight">{option.label}</span>
                                </div>

                                <div className="relative z-10">
                                    {selectedIdx === index ? (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                                            <CheckCircle className="h-8 w-8 text-[#7C9885]" />
                                        </motion.div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <ChevronRight className="h-6 w-6 text-[#7C9885]" />
                                        </div>
                                    )}
                                </div>

                                {/* Subtle shine effect on select */}
                                {selectedIdx === index && (
                                    <motion.div
                                        initial={{ left: '-100%' }}
                                        animate={{ left: '100%' }}
                                        transition={{ duration: 0.8 }}
                                        className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-16 text-center">
                <motion.div
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="flex items-center justify-center gap-3"
                >
                    <div className="w-1 h-1 rounded-full bg-[#7C9885]" />
                    <p className="text-[#4A4E69] text-[10px] font-bold uppercase tracking-[0.4em]">
                        Processing Sincere Response
                    </p>
                    <div className="w-1 h-1 rounded-full bg-[#7C9885]" />
                </motion.div>
            </div>
        </div>
    );
};

export default QuestionCard;
