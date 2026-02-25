import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Heart, Shield, Waves, Battery, Zap, Brain } from 'lucide-react';

const moodOptions = [
    { id: 'happy', icon: <Sparkles className="h-6 w-6" />, label: "Radiant", description: "Joyful and full of vitality", color: "bg-yellow-50", textColor: "text-yellow-700", iconBg: "bg-yellow-100" },
    { id: 'anxiety', icon: <Waves className="h-6 w-6" />, label: "Restless", description: "Wavering or on several edges", color: "bg-purple-50", textColor: "text-purple-700", iconBg: "bg-purple-100" },
    { id: 'stress', icon: <Zap className="h-6 w-6" />, label: "Tense", description: "Heavy under pressure", color: "bg-orange-50", textColor: "text-orange-700", iconBg: "bg-orange-100" },
    { id: 'low', icon: <Battery className="h-6 w-6" />, label: "Quiet", description: "Withdrawn or low energy", color: "bg-blue-50", textColor: "text-blue-700", iconBg: "bg-blue-100" },
    { id: 'sad', icon: <Heart className="h-6 w-6" />, label: "Melancholy", description: "Reflective and soft", color: "bg-rose-50", textColor: "text-rose-700", iconBg: "bg-rose-100" }
];

const AssessmentIntro = ({ onSelectMood, onBack }) => {
    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-24 space-y-8"
            >
                <motion.button
                    whileHover={{ x: -4 }}
                    onClick={onBack}
                    className="inline-flex items-center gap-3 text-[#4A4E69]/40 hover:text-[#2D3142] transition-all mb-12 group p-2 px-4 rounded-full hover:bg-white/50"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono">Back to Sanctuary</span>
                </motion.button>

                <h1 className="text-5xl md:text-8xl font-bold text-[#2D3142] tracking-tighter leading-[0.9] max-w-4xl mx-auto">
                    How is your <br /> <span className="text-[#7C9885]">pulse</span> today?
                </h1>
                <p className="text-xl md:text-2xl text-[#4A4E69]/40 max-w-xl mx-auto font-light leading-relaxed">
                    Honest reflection is the threshold of peace. Choose the energy that resonates with you most right now.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-24">
                {moodOptions.map((mood, index) => (
                    <motion.button
                        key={mood.id}
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                        }}
                        whileHover={{ y: -12, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectMood(mood.id)}
                        className="group relative flex flex-col items-center p-10 bg-white/40 backdrop-blur-[40px] rounded-[3.5rem] border border-white/60 shadow-[0_40px_80px_-20px_rgba(74,78,105,0.1)] hover:shadow-2xl transition-all duration-700 overflow-hidden"
                    >
                        {/* Texture overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

                        <div className={`w-20 h-20 rounded-[2rem] ${mood.iconBg} flex items-center justify-center text-[#2D3142] mb-8 shadow-xl transition-transform duration-700 group-hover:rotate-12`}>
                            {mood.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-[#2D3142] mb-3 tracking-tight">{mood.label}</h3>
                        <p className="text-[#4A4E69]/40 text-[10px] font-bold uppercase tracking-[0.2em] text-center leading-relaxed max-w-[120px]">
                            {mood.description}
                        </p>

                        <div className="absolute bottom-5 opacity-0 group-hover:opacity-20 transition-opacity">
                            <Sparkles size={12} className="text-[#7C9885]" />
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-12 opacity-30 mt-10">
                <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Confidential Protocol</span>
                </div>
                <div className="w-[1px] h-6 bg-[#4A4E69]/20" />
                <div className="flex items-center gap-3">
                    <Brain className="h-4 w-4" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Adaptive Insight</span>
                </div>
            </div>
        </div>
    );
};

export default AssessmentIntro;
