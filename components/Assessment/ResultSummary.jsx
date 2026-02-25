import React from 'react';
import { motion } from 'framer-motion';
import { Star, RotateCcw, Zap, Info, ChevronRight } from 'lucide-react';

const ResultSummary = ({ result, selectedMood, onReset, onAnalyze }) => {
    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white/40 backdrop-blur-[40px] rounded-[4rem] p-12 md:p-20 border border-white/60 shadow-[0_60px_120px_-30px_rgba(74,78,105,0.2)] overflow-hidden"
            >
                {/* Grain texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

                {/* Sophisticated background glow */}
                <div className={`absolute -top-40 -right-40 w-96 h-96 opacity-30 blur-[120px] rounded-full bg-gradient-to-br ${result?.color || 'from-indigo-400 to-purple-500'} animate-pulse`} />

                <div className="relative text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-3 px-6 py-2 bg-white/50 backdrop-blur-3xl rounded-full border border-white/60 mb-16 shadow-lg shadow-[#7C9885]/10"
                    >
                        <div className="p-1.5 bg-[#7C9885] rounded-full">
                            <Star className="h-3 w-3 text-white fill-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#2D3142]">Reflection Synthesis</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-7xl font-bold text-[#2D3142] mb-10 tracking-tighter leading-[1.05]"
                    >
                        {result?.type === 'happy' ? (
                            <>Radiance <br /> <span className="text-[#7C9885]">detected.</span></>
                        ) : (
                            result?.message
                        )}
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center justify-center gap-4 mb-16"
                    >
                        <div className={`px-8 py-2.5 rounded-full text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl ${result?.color || 'bg-[#2D3142]'}`}>
                            {result?.level} Intensity
                        </div>
                        <div className="h-[1px] w-12 bg-[#4A4E69]/10" />
                        <div className="text-[#4A4E69]/40 text-[10px] font-bold uppercase tracking-[0.3em]">Emotional Index</div>
                    </motion.div>

                    {result?.type === 'happy' && result?.quote && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="relative p-12 bg-white/30 rounded-[3rem] border border-white/60 shadow-xl overflow-hidden mb-20 group"
                        >
                            <Info className="absolute top-6 left-6 h-6 w-6 text-[#7C9885] opacity-20" />
                            <p className="italic text-2xl md:text-3xl text-[#4A4E69] font-light leading-relaxed">
                                "{result.quote}"
                            </p>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        <motion.button
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onReset}
                            className="flex items-center justify-center gap-4 p-8 rounded-[2.5rem] bg-white text-[#2D3142] font-bold text-xs uppercase tracking-[0.2em] border border-white/60 hover:bg-[#F9FBFF] transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]"
                        >
                            <RotateCcw size={20} className="text-[#7C9885]" />
                            New Flow
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onAnalyze}
                            className="flex items-center justify-center gap-4 p-8 rounded-[2.5rem] bg-[#2D3142] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-[0_30px_60px_-15px_rgba(45,49,66,0.4)] hover:bg-[#4A4E69] transition-all group"
                        >
                            <Zap size={20} className="text-[#7C9885]" />
                            Deep Analysis
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-12 text-center"
            >
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#4A4E69]/20">Protocol Concluded — Finalizing Data</span>
            </motion.div>
        </div>
    );
};

export default ResultSummary;
