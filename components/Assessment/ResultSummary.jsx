import React from 'react';
import { motion } from 'framer-motion';
import { Star, RotateCcw, Zap, Info, ChevronRight } from 'lucide-react';

const ResultSummary = ({ result, selectedMood, onReset, onAnalyze }) => {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white/50 backdrop-blur-[60px] rounded-[4rem] p-10 md:p-16 border border-white/60 shadow-[0_40px_80px_-20px_rgba(74,78,105,0.1)] overflow-hidden max-w-4xl w-full"
            >
                {/* Glow & Texture */}
                <div className={`absolute -top-20 -right-20 w-80 h-80 opacity-20 blur-[100px] rounded-full bg-gradient-to-br ${result?.color || 'from-indigo-400 to-purple-500'} animate-pulse`} />
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

                <div className="relative text-center max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-white/50 backdrop-blur-3xl rounded-full border border-white/60 mb-10 shadow-lg shadow-[#7C9885]/5"
                    >
                        <Star size={12} className="text-[#7C9885] fill-[#7C9885]" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#2D3142]">Assessment Finalized</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-6xl font-bold text-[#2D3142] mb-8 tracking-tighter leading-tight"
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
                        className="flex items-center justify-center gap-4 mb-12"
                    >
                        <div className={`px-6 py-2 rounded-full text-white font-bold text-[9px] uppercase tracking-[0.2em] shadow-xl ${result?.color || 'bg-[#2D3142]'}`}>
                            {result?.level} Intensity
                        </div>
                        <div className="w-1 h-1 rounded-full bg-[#4A4E69]/20" />
                        <div className="text-[#4A4E69]/40 text-[9px] font-bold uppercase tracking-[0.3em]">Emotional Index</div>
                    </motion.div>

                    {result?.type === 'happy' && result?.quote ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="p-10 bg-white/30 rounded-[2.5rem] border border-white/60 shadow-xl mb-12"
                        >
                            <p className="italic text-xl md:text-2xl text-[#4A4E69] font-light leading-relaxed">
                                "{result.quote}"
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 max-w-lg mx-auto">
                            <div className="p-6 bg-white/30 rounded-3xl border border-white/50 text-left">
                                <div className="text-[#7C9885] mb-4"><Star size={20} /></div>
                                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#4A4E69]/40 mb-1">Energy Peak</div>
                                <div className="text-2xl font-bold text-[#2D3142]">{result?.score || 12}</div>
                            </div>
                            <div className="p-6 bg-white/30 rounded-3xl border border-white/50 text-left">
                                <div className="text-[#4A4E69] mb-4"><Zap size={20} /></div>
                                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#4A4E69]/40 mb-1">Pulse Sync</div>
                                <div className="text-2xl font-bold text-[#2D3142]">94%</div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onReset}
                            className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white text-[#2D3142] font-bold text-[10px] uppercase tracking-[0.2em] border border-white/60 hover:bg-[#F9FBFF] transition-all shadow-sm"
                        >
                            <RotateCcw size={16} className="text-[#7C9885]" />
                            Recalibrate
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onAnalyze}
                            className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-[#2D3142] text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#4A4E69] transition-all group"
                        >
                            <Zap size={16} className="text-[#7C9885]" />
                            Deep Dive
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
                <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-[#4A4E69]/20">Protocol Concluded — Data Integrated</span>
            </motion.div>
        </div>
    );
};

export default ResultSummary;
