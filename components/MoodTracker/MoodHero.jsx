import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

const MoodHero = ({ streak = 12 }) => {
    return (
        <div className="relative w-full h-[500px] mb-16 overflow-hidden rounded-[4rem] group shadow-2xl">
            {/* Premium Hero Image with Parallax-like Movement */}
            <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1.05 }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                className="absolute inset-0 z-0"
            >
                <img
                    src="/moodtracker_hero_premium.png"
                    alt="Emotional Sanctuary"
                    className="w-full h-full object-cover filter brightness-90 group-hover:brightness-100 transition-all duration-700"
                />
                {/* Overlays for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#2D3142]/40 via-transparent to-[#F9FBFF]/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#F9FBFF]/40 via-transparent to-transparent" />
            </motion.div>

            {/* Floating Elements for Atmosphere */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <motion.div
                    animate={{ x: [-30, 30], y: [-20, 20], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-white blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{ x: [30, -30], y: [20, -20], opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-[#7C9885] blur-[140px] rounded-full"
                />
            </div>

            <div className="relative z-20 h-full flex flex-col justify-center px-10 md:px-20 max-w-5xl">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-6 py-2 bg-white/20 backdrop-blur-3xl rounded-full border border-white/40 shadow-xl">
                        <div className="w-2 h-2 rounded-full bg-[#7C9885] animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2D3142]">Personal Sanctuary</span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl font-bold text-[#2D3142] leading-[1.05] tracking-tighter"
                    >
                        Nurture Your <br />
                        <span className="text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]">Inner Peace.</span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-xl md:text-2xl text-[#2D3142]/70 font-light max-w-xl leading-relaxed"
                    >
                        A gentle space to reflect, track your emotional landscape, and discover paths to balance.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex items-center gap-10 pt-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A4E69]/60 mb-2">Mindful Streak</span>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-2xl flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform duration-500">
                                    🌱
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-[#2D3142]">{streak} Days</span>
                                    <span className="text-[10px] text-[#7C9885] font-bold uppercase tracking-widest">Consistency is care</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default MoodHero;
