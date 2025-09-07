import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import HomeImage from '../src/assets/HomeImage.png';
import {
  MessageCircle,
  Users,
  Brain,
  Heart,
  Smile,
  Calendar,
  ArrowRight,
  Shield,
  Clock,
  Star,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function Home() {
  const [userMood, setUserMood] = useState(null);
  const [showMoodTest, setShowMoodTest] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const audioRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("mindwell_audio_muted");
    return saved === "true"; // default to false if not present
  });

  const navigate = useNavigate();
  
  const moodQuestions = [
    {
      question: "How would you describe your energy level today?",
      options: ["Very low", "Low", "Moderate", "High", "Very high"]
    },
    {
      question: "How well did you sleep last night?",
      options: ["Very poorly", "Poorly", "Okay", "Well", "Very well"]
    },
    {
      question: "How are you feeling about the day ahead?",
      options: ["Anxious", "Worried", "Neutral", "Optimistic", "Excited"]
    },
    {
      question: "How connected do you feel to others right now?",
      options: ["Very isolated", "Lonely", "Neutral", "Connected", "Very connected"]
    }
  ];

//   const handleMoodAnswer = (answerIndex) => {
//     const newAnswers = [...answers, answerIndex];
//     setAnswers(newAnswers);

//     if (currentQuestion < moodQuestions.length - 1) {
//       setCurrentQuestion(currentQuestion + 1);
//     } else {
//       // Calculate mood based on answers
//       const avgScore = newAnswers.reduce((sum, score) => sum + score, 0) / newAnswers.length;
//       let mood;
//       if (avgScore < 1) mood = { text: "Struggling", color: "bg-red-100 text-red-800", emoji: "😔" };
//       else if (avgScore < 2) mood = { text: "Low", color: "bg-orange-100 text-orange-800", emoji: "😕" };
//       else if (avgScore < 3) mood = { text: "Okay", color: "bg-yellow-100 text-yellow-800", emoji: "😐" };
//       else if (avgScore < 4) mood = { text: "Good", color: "bg-green-100 text-green-800", emoji: "😊" };
//       else mood = { text: "Great", color: "bg-blue-100 text-blue-800", emoji: "😄" };
      
//       setUserMood(mood);
//       setShowMoodTest(false);
//       setCurrentQuestion(0);
//       setAnswers([]);
//     }
//   };


  const startMoodTest = () => {
    navigate("/test");
  };

  const handleChatNow = () => {
    // In a real app, this would redirect to chatbot
    alert("Redirecting to our AI wellness companion...");
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handleFirstInteraction = useCallback(() => {
    if (!hasInteracted && audioRef.current && !isMuted) {
      audioRef.current.volume = 0.2;
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Playback prevented:", error);
        });
      }
      setHasInteracted(true);
    }
  }, [hasInteracted, isMuted]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.2;
      audio.muted = isMuted;
    }
  }, [isMuted]);
  
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted && !isMuted && audioRef.current) {
        audioRef.current.play().catch(console.error);
        setHasInteracted(true);
      }
    };
  
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
  
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [hasInteracted, isMuted]);


  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !audioRef.current.muted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
      localStorage.setItem("mindwell_audio_muted", newMuted.toString());
      
      if (!newMuted) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Playback failed:", error);
          });
        }
      }
    }
  }, []);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <audio
        ref={audioRef}
        src="/calm.mp3"
        loop
        preload="auto"
        onPlay={() => console.log("Audio playing")}
        onPause={() => console.log("Audio paused")}
        onError={(e) => console.error("Audio error:", e)}
      />
      

      {/* Mood Test Modal */}
      {showMoodTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-in fade-in duration-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Question {currentQuestion + 1} of {moodQuestions.length}
            </h3>
            <p className="text-gray-600 mb-6">{moodQuestions[currentQuestion].question}</p>
            <div className="space-y-3">
              {moodQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodAnswer(index)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMoodTest(false)}
              className="mt-6 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="absolute inset-0 bg-black/20 rounded-2xl overflow-hidden">
          <img 
            src={HomeImage} 
            alt="Background" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="relative z-10 py-24 px-4" >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 flex justify-center items-center text-center" data-aos="fade-up">
            Your Mental Wellness
            <br />
            Journey Starts Here
          </h1>
          <div className="text-center max-w-3xl mx-auto mb-10" data-aos="fade-up">
            <p className="text-xl text-white/80">
              Take control of your mental health with personalized support, community connection,
            </p>
            <p className="text-xl text-white/80">
              and evidence-based tools designed to help you thrive.
            </p>
          </div>
          
          {/* Mood Status/Test Section */}
          <div className="text-center mb-12" data-aos="fade-up">
            <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
              How are you feeling today?
            </h3>
            <button
              onClick={startMoodTest}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full text-base font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 inline-flex items-center"
            >
              <Heart className="h-4 w-4 mr-2" />
              Take Mood Test
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleChatNow}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Wellness Chat
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <a href="#features" className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all duration-200">
              Explore Resources
            </a>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mb-16 px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12" data-aos="fade-up">
            Everything you need for better mental health
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8" data-aos="fade-up">
            <div 
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              data-aos="fade-up" data-aos-delay="0"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg w-fit mb-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">24/7 AI Support</h3>
              <p className="text-gray-600 mb-4">
                Get instant support from our AI wellness companion, trained to provide empathetic, 
                evidence-based guidance whenever you need it.
              </p>
              <button 
                onClick={handleChatNow}
                className="text-purple-600 font-medium hover:text-purple-700 flex items-center"
              >
                Chat now <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div 
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              data-aos="fade-up" data-aos-delay="150"
            >
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 rounded-lg w-fit mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Supportive Community</h3>
              <p className="text-gray-600 mb-4">
                Connect with others on similar journeys in our safe, moderated community spaces. 
                Share experiences and find encouragement.
              </p>
              <a href="#" className="text-purple-600 font-medium hover:text-purple-700 flex items-center">
                Join community <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            <div 
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              data-aos="fade-up" data-aos-delay="300"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-lg w-fit mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Personalized Tools</h3>
              <p className="text-gray-600 mb-4">
                Access mood tracking, guided meditations, cognitive behavioral therapy exercises, 
                and other tools tailored to your needs.
              </p>
              <a href="#" className="text-purple-600 font-medium hover:text-purple-700 flex items-center">
                Explore tools <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>

        </section>
        <section 
            id="what-we-do" 
            className="bg-white py-20 px-4 sm:px-6 lg:px-8 text-center"
            data-aos="fade-up"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">What We Do</h2>
            <p className="max-w-2xl mx-auto text-gray-600 text-lg mb-12">
              Our mission is to provide holistic support for mental wellness through education, connection, and compassionate care.
            </p>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-md" data-aos="fade-up">
                <Smile className="w-10 h-10 mx-auto text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Emotional Support</h3>
                <p className="text-gray-600">
                  We offer tools and resources that help individuals manage stress, anxiety, and emotional challenges with care.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-md" data-aos="fade-up" data-aos-delay="150">
                <Calendar className="w-10 h-10 mx-auto text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Resources</h3>
                <p className="text-gray-600">
                  Interactive and mindfulness resources designed for your well-being.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-md" data-aos="fade-up" data-aos-delay="300">
                <Heart className="w-10 h-10 mx-auto text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Healing with Compassion</h3>
                <p className="text-gray-600">
                  Whether through therapy, community, or AI companions, we ensure you’re never alone in your journey.
                </p>
              </div>
            </div>
          </section>

        {/* Trust Indicators */}
        <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Trusted by thousands</h2>
            <p className="text-gray-600">Safe, secure, and clinically informed</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Privacy First</h3>
              <p className="text-sm text-gray-600">Your data is encrypted and never shared</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Always Available</h3>
              <p className="text-sm text-gray-600">Support when you need it most</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-yellow-100 p-3 rounded-full mb-3">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Evidence-Based</h3>
              <p className="text-sm text-gray-600">Backed by clinical research</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section 
          className="relative overflow-hidden text-center rounded-2xl p-12 text-white my-20"
          data-aos="zoom-in"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/homebelow16-3.png"
              alt="Healing Background"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Optional overlay for better text contrast */}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Decorative gradient blobs */}
          <div className="absolute top-[-30px] left-[-30px] w-40 h-40 bg-purple-400 opacity-30 blur-3xl rounded-full animate-pulse z-10" />
          <div className="absolute bottom-[-40px] right-[-20px] w-48 h-48 bg-blue-400 opacity-30 blur-2xl rounded-full animate-bounce-slow z-10" />

          {/* Sparkle emojis or icons */}
          <div className="flex justify-center mb-4 relative z-20" data-aos="fade-up" data-aos-delay="50">
            <span className="text-4xl">🌟✨💜</span>
          </div>

          {/* Optimistic Heading */}
          <h2 
            className="text-4xl font-bold mb-3 tracking-tight leading-tight relative z-20"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            Start Your Healing Journey Today
          </h2>

          {/* Encouraging Paragraph */}
          <p 
            className="text-lg mb-8 opacity-90 max-w-xl mx-auto relative z-20"
            data-aos="fade-up"
            data-aos-delay="250"
          >
            Embrace calm, build resilience, and take the first step toward a better you.
            You’re never alone — and your peace of mind matters.
          </p>

          {/* Call to Action Button */}
          <button 
            onClick={handleChatNow}
            className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center mx-auto relative z-20"
            data-aos="fade-up"
            data-aos-delay="350"
          >
            <MessageCircle className="h-5 w-5 mr-2 text-purple-600" />
            Begin Your Journey
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  MindWell
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Supporting your mental wellness journey with compassionate, evidence-based tools and community.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/resources" className="hover:text-purple-600">Crisis Resources</a></li>
                <li><a href="mailto:aryabrata.swain.ug23@nsut.ac.in" className="hover:text-purple-600">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/community" className="hover:text-purple-600">Hive Network</a></li>
                <li><a href="/chatbot" className="hover:text-purple-600">24/7 Chat</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/privacy-policy" className="hover:text-purple-600">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-purple-600">Terms of Service</a></li>
                <li><a href="/cookie-policy" className="hover:text-purple-600">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2025 MindWell. All rights reserved. Not a substitute for professional medical advice.</p>
          </div>
        </div>
      </footer>
      <button 
        onClick={toggleMute}
        className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-full shadow-md p-3 hover:shadow-lg transition-all"
        title={isMuted ? "Unmute sound" : "Mute sound"}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-purple-600" />
        ) : (
          <Volume2 className="h-5 w-5 text-purple-600" />
        )}
      </button>
    </div>
  );
}