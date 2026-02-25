import { useState, useEffect } from 'react';
import {
    signInWithEmail,
    signInWithGoogle,
    auth,
    db
} from '../context/firebase/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

import {
    Brain, Lock, Mail, Eye, EyeOff, ArrowRight,
    Shield, ChevronRight,
    HeartPulse, User
} from 'lucide-react';

export default function UnifiedAuth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [college, setCollege] = useState('');

    const navigate = useNavigate();
    const { user } = useAuth();

    // Role Redirection Logic
    const redirectBasedOnRole = (role) => {
        switch (role) {
            case 'admin':
            case 'central_admin':
            case 'overall_admin':
                navigate('/view-requests');
                break;
            case 'psychiatrist':
            case 'doctor':
            case 'company_doctor':
                navigate('/psychiatrist');
                break;
            case 'member':
            case 'company_member':
            case 'student':
            default:
                navigate('/');
                break;
        }
    };

    useEffect(() => {
        if (user) {
            redirectBasedOnRole(user.role);
        }
    }, [user]);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await signInWithGoogle();
            const fbUser = result.user;

            const userRef = doc(db, "users", fbUser.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    email: fbUser.email,
                    name: fbUser.displayName,
                    college: college || "Not specified",
                    uid: fbUser.uid,
                    role: 'student', // Default role for new signups
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    provider: "google"
                });
            } else {
                await updateDoc(userRef, {
                    lastLogin: new Date()
                });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                if (!name) throw new Error('Please enter your name');
                if (!email || !password) throw new Error('Please fill in all fields');

                const { createUserWithEmailAndPassword } = await import('firebase/auth');
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                await setDoc(doc(db, "users", userCredential.user.uid), {
                    name,
                    email,
                    college: college || '',
                    uid: userCredential.user.uid,
                    role: 'student',
                    provider: "email",
                    createdAt: new Date(),
                    lastLogin: new Date()
                });
            } else {
                if (!email || !password) throw new Error('Please fill in all fields');
                await signInWithEmail(email, password);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        },
        exit: {
            opacity: 0,
            scale: 1.05,
            transition: { duration: 0.3 }
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FBFF] overflow-hidden relative selection:bg-[#7C9885]/30">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                {/* Animated Orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/40 to-transparent rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -60, 0],
                        y: [0, 40, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-15%] right-[-5%] w-[800px] h-[800px] bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-[150px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F9FBFF]/40 to-[#F9FBFF]" />
            </div>

            {/* Main Auth Container */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="relative z-10 w-full max-w-xl mx-4 py-12"
            >
                <div className="bg-white/40 backdrop-blur-[40px] rounded-[3.5rem] p-10 md:p-14 border border-white/60 shadow-[0_40px_100px_-20px_rgba(74,78,105,0.1)] overflow-hidden">
                    {/* Glass Surface Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isForgotPassword ? 'forgot' : isSignUp ? 'signup' : 'signin'}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            {/* Brand / Header */}
                            <div className="text-center mb-12">
                                <motion.div
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    className="inline-flex items-center justify-center w-20 h-20 bg-[#2D3142] rounded-[1.75rem] shadow-2xl mb-8 group"
                                >
                                    <Brain className="w-10 h-10 text-white group-hover:animate-pulse" />
                                </motion.div>
                                <h1 className="text-4xl md:text-5xl font-bold text-[#2D3142] mb-4 tracking-tighter leading-tight">
                                    {isForgotPassword ? 'Restore Access' : isSignUp ? 'Begin Journey' : 'Reconnect'}
                                </h1>
                                <p className="text-[#4A4E69]/60 text-lg font-light">
                                    {isForgotPassword ? 'Reset your secure gateway' :
                                        isSignUp ? 'Join our holistic wellness ecosystem' : 'Return to your personalized sanctuary'}
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-8 p-5 bg-rose-50/50 backdrop-blur-md border border-rose-100/50 rounded-2xl flex items-center gap-4 border-l-4 border-l-rose-400"
                                >
                                    <Shield className="w-5 h-5 text-rose-500 shrink-0" />
                                    <p className="text-rose-700 text-sm font-semibold leading-snug">{error}</p>
                                </motion.div>
                            )}

                            {resetSent ? (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-[#7C9885]/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                        <Mail className="w-10 h-10 text-[#7C9885]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#2D3142] mb-3 tracking-tight">Transmission Sent</h3>
                                    <p className="text-[#4A4E69]/60 mb-10 font-light italic">"{email}" is awaiting your command.</p>
                                    <button
                                        onClick={() => { setIsForgotPassword(false); setResetSent(false); }}
                                        className="text-[#2D3142] font-bold text-sm uppercase tracking-[0.2em] hover:text-[#7C9885] transition-colors"
                                    >
                                        Back to Entry
                                    </button>
                                </div>
                            ) : isForgotPassword ? (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4A4E69]/40 ml-1">Secure Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4E69]/20 group-focus-within:text-[#7C9885] transition-colors" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-[1.25rem] py-5 pl-14 pr-6 text-[#2D3142] placeholder:text-[#4A4E69]/30 focus:bg-white/80 focus:border-[#7C9885]/30 focus:shadow-[0_10px_40px_-15px_rgba(124,152,133,0.15)] outline-none transition-all font-medium"
                                                placeholder="Enter verified email"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePasswordReset}
                                        className="w-full bg-[#2D3142] text-white py-5 rounded-[1.25rem] font-bold text-[13px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#4A4E69] transition-all flex items-center justify-center gap-3 group"
                                    >
                                        Dispatch Recovery
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <div className="text-center">
                                        <button onClick={() => setIsForgotPassword(false)} className="text-[#4A4E69]/40 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-[#2D3142] transition-colors">
                                            Cancel Reset
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-7">
                                    {isSignUp && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2"
                                        >
                                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4A4E69]/40 ml-1">Identity</label>
                                            <div className="relative group">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4E69]/20 group-focus-within:text-[#7C9885] transition-colors" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-[1.25rem] py-5 pl-14 pr-6 text-[#2D3142] placeholder:text-[#4A4E69]/30 focus:bg-white/80 focus:border-[#7C9885]/30 outline-none transition-all font-medium"
                                                    placeholder="Full Name"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4A4E69]/40 ml-1">Credentials</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4E69]/20 group-focus-within:text-[#7C9885] transition-colors" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-[1.25rem] py-5 pl-14 pr-6 text-[#2D3142] placeholder:text-[#4A4E69]/30 focus:bg-white/80 focus:border-[#7C9885]/30 outline-none transition-all font-medium"
                                                placeholder="Email Address"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4A4E69]/40 ml-1">Pass-Key</label>
                                            {!isSignUp && (
                                                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7C9885] hover:text-[#8BA894] transition-colors">
                                                    Forgot?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4E69]/20 group-focus-within:text-[#7C9885] transition-colors" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-[1.25rem] py-5 pl-14 pr-16 text-[#2D3142] placeholder:text-[#4A4E69]/30 focus:bg-white/80 focus:border-[#7C9885]/30 outline-none transition-all font-medium"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-6 top-1/2 -translate-y-1/2 text-[#4A4E69]/20 hover:text-[#2D3142] transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#2D3142] text-white py-6 rounded-[1.5rem] font-bold text-[13px] uppercase tracking-[0.3em] shadow-2xl hover:bg-[#4A4E69] hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-4 group mt-10"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {isSignUp ? 'Initiate Session' : 'Authenticate Entry'}
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>

                                    <div className="relative my-10 flex items-center gap-6">
                                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#4A4E69]/10 to-transparent" />
                                        <span className="text-[#4A4E69]/30 text-[9px] font-bold tracking-[0.4em] uppercase">Connect With</span>
                                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#4A4E69]/10 to-transparent" />
                                    </div>

                                    <motion.button
                                        type="button"
                                        whileHover={{ y: -3 }}
                                        onClick={handleGoogleSignIn}
                                        className="w-full bg-white/20 border border-white/60 backdrop-blur-md py-5 rounded-[1.25rem] font-bold text-[#2D3142] text-[11px] uppercase tracking-[0.2em] hover:bg-white/40 hover:border-white transition-all flex items-center justify-center gap-4 shadow-sm"
                                    >
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 opacity-80" alt="Google" />
                                        Global Sync
                                    </motion.button>

                                    <div className="text-center mt-12">
                                        <button
                                            type="button"
                                            onClick={() => setIsSignUp(!isSignUp)}
                                            className="text-[#4A4E69]/40 font-bold text-[11px] uppercase tracking-[0.2em] hover:text-[#2D3142] transition-colors"
                                        >
                                            {isSignUp ? (
                                                <>Established <span className="text-[#7C9885] ml-1">Sign In</span></>
                                            ) : (
                                                <>New Identity <span className="text-[#7C9885] ml-1">Join Now</span></>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Secure Protocol Badges */}
                <div className="flex flex-wrap justify-center gap-6 mt-12 opacity-30">
                    <Badge icon={<ShieldCheck className="w-4 h-4 text-[#7C9885]" />} text="Protocol Sec" />
                    <Badge icon={<HeartPulse className="w-4 h-4 text-[#7C9885]" />} text="Pulse Encr" />
                    <Badge icon={<Sparkles className="w-4 h-4 text-[#7C9885]" />} text="AI Compliant" />
                </div>
            </motion.div>
        </div>
    );
}

function ShieldCheck(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

function Sparkles(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}

function Badge({ icon, text }) {
    return (
        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/30 text-[9px] font-bold uppercase tracking-[0.2em] text-[#2D3142]/60">
            {icon}
            {text}
        </div>
    );
}
