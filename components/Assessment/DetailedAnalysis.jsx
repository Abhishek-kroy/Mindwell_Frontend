import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2, ListChecks, MessageSquare, ArrowLeft } from 'lucide-react';

const InsightCard = ({ title, icon, items, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white/40 backdrop-blur-[40px] rounded-[3rem] p-10 md:p-12 border border-white/60 shadow-[0_30px_60px_-15px_rgba(74,78,105,0.1)] h-full flex flex-col group overflow-hidden"
    >
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

        <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-white rounded-2xl text-[#7C9885] shadow-xl group-hover:rotate-6 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="text-[10px] font-bold text-[#2D3142] uppercase tracking-[0.4em]">{title}</h3>
        </div>

        <ul className="space-y-6 flex-1">
            {items.map((item, idx) => (
                <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: delay + 0.3 + (idx * 0.1) }}
                    className="flex gap-4 text-lg text-[#4A4E69]/80 font-light leading-relaxed"
                >
                    <div className="h-6 w-6 rounded-full bg-[#7C9885]/10 flex-shrink-0 flex items-center justify-center mt-1">
                        <div className="h-1.5 w-1.5 bg-[#7C9885] rounded-full" />
                    </div>
                    {item}
                </motion.li>
            ))}
        </ul>
    </motion.div>
);

const DetailedAnalysis = ({ analysis, onBack }) => {
    if (!analysis) return null;

    return (
        <div className="w-full max-w-7xl mx-auto px-6 pb-24">
            <div className="mb-20">
                <motion.button
                    whileHover={{ x: -4 }}
                    onClick={onBack}
                    className="inline-flex items-center gap-3 text-[#4A4E69]/40 hover:text-[#2D3142] transition-all group p-2 px-4 rounded-full hover:bg-white/50 border border-transparent hover:border-white"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono">Consolidate Summary</span>
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white/20 backdrop-blur-[60px] rounded-[4rem] p-12 md:p-20 border border-white/60 shadow-[0_80px_160px_-40px_rgba(74,78,105,0.15)] mb-16 overflow-hidden"
            >
                {/* Grain texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

                <div className="flex flex-col md:flex-row items-center gap-10 mb-20 relative z-10">
                    <div className="p-8 bg-[#2D3142] rounded-[2.5rem] text-white shadow-2xl shadow-[#2D3142]/40 relative overflow-hidden group">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"
                        />
                        <MessageSquare size={48} className="relative z-10" />
                    </div>
                    <div className="text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F9FBFF] rounded-full border border-[#7C9885]/20 mb-4"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C9885] animate-ping" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2D3142]">AI Synthesis Protocol</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-bold text-[#2D3142] tracking-tighter leading-none mb-3">Your Emotional <span className="text-[#7C9885]">Narrative.</span></h2>
                        <p className="text-[#4A4E69]/40 text-[10px] font-bold uppercase tracking-[0.3em]">Precision Insights for Sustained Harmony</p>
                    </div>
                </div>

                <div className="relative z-10 mb-24 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="prose prose-slate max-w-none"
                    >
                        <p className="text-3xl md:text-4xl text-[#4A4E69] font-light leading-relaxed italic border-l-4 border-[#7C9885]/20 pl-10 py-4">
                            "{analysis.summary}"
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                    <InsightCard
                        title="Strategic Insights"
                        icon={<Lightbulb size={24} />}
                        items={analysis.insights}
                        delay={0.6}
                    />
                    <InsightCard
                        title="Mindful Protocol"
                        icon={<ListChecks size={24} />}
                        items={analysis.recommendations}
                        delay={0.8}
                    />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1.5 }}
                className="max-w-3xl mx-auto flex items-center justify-center gap-4 text-center"
            >
                <div className="h-[1px] flex-1 bg-[#2D3142]/20" />
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] font-mono text-[#2D3142]">Medical Disclaimer: AI Guidance Protocol 0.8.4</span>
                <div className="h-[1px] flex-1 bg-[#2D3142]/20" />
            </motion.div>
        </div>
    );
};

export default DetailedAnalysis;
