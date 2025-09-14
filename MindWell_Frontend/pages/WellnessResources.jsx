import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Heart, Play, Pause, Book, Smartphone, Clock, Calendar, Download, Phone, MessageCircle, Globe, ChevronLeft, ChevronRight, Star, Check, Volume2, VolumeX, SkipBack, SkipForward, User, Menu, X, Plus, Minus, CheckCircle, Share2, Bell, Notebook, Award, Sun, Moon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';

import { deleteDoc } from 'firebase/firestore';

import {auth, db} from '../context/firebase/firebase';

const MentalWellnessResources = () => {
  // State management
  const [selectedMood, setSelectedMood] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    duration: 'all'
  });
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [completedResources, setCompletedResources] = useState([]);
  const [showPlanner, setShowPlanner] = useState(false);
  const [plannedPractices, setPlannedPractices] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [journalEntries, setJournalEntries] = useState({});
  const [currentJournalEntry, setCurrentJournalEntry] = useState('');
  const [currentResourceId, setCurrentResourceId] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moodHistory, setMoodHistory] = useState([]);
  
  const audioRef = useRef(null);
  const notificationRef = useRef(null);


 


  // Sample data for progress charts
  const weeklyProgressData = [
    { day: 'Mon', practices: 2 },
    { day: 'Tue', practices: 3 },
    { day: 'Wed', practices: 1 },
    { day: 'Thu', practices: 4 },
    { day: 'Fri', practices: 2 },
    { day: 'Sat', practices: 3 },
    { day: 'Sun', practices: 1 }
  ];

  const moods = [
    { id: 'all', name: 'All', icon: '🌈', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'happy', name: 'Happy', icon: '🟡', color: 'bg-yellow-400' },
    { id: 'anxious', name: 'Anxious', icon: '🔵', color: 'bg-blue-500' },
    { id: 'sad', name: 'Sad', icon: '🔴', color: 'bg-red-500' },
    { id: 'stressed', name: 'Stressed', icon: '🟠', color: 'bg-orange-500' },
    { id: 'low-energy', name: 'Low Energy', icon: '🟢', color: 'bg-green-500' },
    { id: 'grieving', name: 'Grieving', icon: '⚫', color: 'bg-gray-700' },
    { id: 'crisis', name: 'Crisis', icon: '🚨', color: 'bg-red-600' }
  ];

  const resources = {
  "anxious": [
    {
      "title": "Understanding and Stopping Anxiety & Fear",
      "type": "video",
      "url": "https://www.youtube.com/watch?v=FJ5tXuBi4EM",
      "description": "Dr. David Rosmarin (Harvard Medical School) explains what anxiety is, common pitfalls, and a four-step process to manage spiraling thoughts.",
      "tags": ["CBT", "mindset", "expert talk"],
      "whyHelpful": "Provides evidence-based strategies from a leading anxiety researcher to reframe anxious thoughts and build long-term resilience."
    },
    {
      "title": "Mindfulness Tricks to Help Reduce Anxiety",
      "type": "article",
      "url": "https://www.healthline.com/health/mindfulness-tricks-to-reduce-anxiety",
      "description": "List of 14 simple, everyday mindfulness practices (e.g., intention setting, doodling, walking) to calm anxious thoughts.",
      "tags": ["mindfulness", "relaxation", "daily practice"],
      "whyHelpful": "Offers bite-sized techniques that can be done anywhere, lowering physiological arousal and interrupting worry cycles."
    },
    {
      "title": "The Anxiety Podcast",
      "type": "podcast",
      "url": "https://podcasts.apple.com/us/podcast/the-anxiety-podcast/id1031117023",
      "description": "Weekly interviews and coping strategies hosted by Tim JP Collins, who shares personal stories and science-backed skills.",
      "tags": ["peer support", "CBT", "coping skills"],
      "whyHelpful": "Combines relatable narratives with actionable tips, reducing isolation and providing concrete tools for real-time anxiety relief."
    },
    {
      "title": "5-4-3-2-1 Grounding Exercise",
      "type": "video",
      "url": "https://www.youtube.com/watch?v=30VMIEmA114",
      "description": "A short guided grounding technique using the five senses to bring attention back to the present moment.",
      "tags": ["grounding", "mindfulness", "sensory"],
      "whyHelpful": "Quickly interrupts anxious thinking by engaging your senses, anchoring attention to the here and now."
    },
    {
      "title": "Breathing Exercises for Anxiety",
      "type": "article",
      "url": "https://www.healthline.com/health/breathing-exercises-for-anxiety",
      "description": "Step-by-step guide to eight evidence-based breathing techniques like box breathing and prolonged exhalation.",
      "tags": ["breathing", "relaxation", "parasympathetic"],
      "whyHelpful": "Activates the body’s relaxation response through controllable breath patterns, reducing physiological anxiety symptoms."
    },
    {
      "title": "Anxiety is a Blessing | David Rosmarin",
      "type": "video",
      "url": "https://www.youtube.com/watch?v=P1XG4bDQGGI",
      "description": "David Rosmarin reframes anxiety as an ally and shares practical steps to embrace uncertainty and thrive.",
      "tags": ["mindset", "acceptance", "uncertainty"],
      "whyHelpful": "Shifts perspective from fearing anxiety to using it as a catalyst for self-compassion and resilience."
    }
  ],
  "depressed": [
    {
      "title": "Self-care for Depression",
      "type": "article",
      "url": "https://www.mind.org.uk/information-support/types-of-mental-health-problems/depression/self-care/",
      "description": "Practical self-care ideas (e.g., journaling, creative activities, nature time) and peer-support options from Mind (UK).",
      "tags": ["self-care", "peer support", "creative"],
      "whyHelpful": "Broad toolkit of low-barrier strategies and links to community resources to counter withdrawal and boost mood."
    },
    {
      "title": "10 Podcasts to Listen to If You Struggle with Depression",
      "type": "article",
      "url": "https://www.healthline.com/health/mental-health/depression-podcast",
      "description": "Curated list of 10 top-rated podcasts, including “The SelfWork Podcast” and “The Hilarious World of Depression.”",
      "tags": ["podcast", "peer stories", "CBT"],
      "whyHelpful": "Offers expert interviews, personal stories, and humor to normalize depression and provide practical coping frameworks."
    },
    {
      "title": "Mindfulness for Depression: Tips & Exercises",
      "type": "article",
      "url": "https://psychcentral.com/depression/how-does-mindfulness-reduce-depression",
      "description": "Overview of mindfulness benefits for depression plus simple practices like mindful breathing and everyday mindfulness.",
      "tags": ["mindfulness", "MBCT", "breathing"],
      "whyHelpful": "Science-backed explanation of mindfulness mechanisms with exercises to reduce rumination and improve mood regulation."
    },
    {
      "title": "Guided Visualization Meditation for Depression",
      "type": "activity",
      "url": "https://www.mayoclinic.org/healthy-lifestyle/consumer-health/in-depth/mindfulness-exercises/art-20046356",
      "description": "Step-by-step body-scan and guided imagery meditations to cultivate present-moment awareness and reduce negative thought patterns.",
      "tags": ["meditation", "mindfulness", "guided"],
      "whyHelpful": "Structured approach to gently shift focus away from depressive thinking, fostering relaxation and emotional balance."
    },
    {
      "title": "Behavioral Activation for Depression",
      "type": "article",
      "url": "https://www.apa.org/monitor/2020/04/ce-corner",
      "description": "Explanation of behavioral activation techniques such as scheduling enjoyable and mastery activities.",
      "tags": ["behavioral activation", "activity scheduling", "CBT"],
      "whyHelpful": "Encourages gradual re-engagement in positive activities to counteract inactivity and elevate mood."
    },
    {
      "title": "The Science of Happiness Podcast (Depression Episodes)",
      "type": "podcast",
      "url": "https://greatergood.berkeley.edu/podcasts",
      "description": "Episodes on depression resilience, social connection, and gratitude research from Berkeley’s Greater Good.",
      "tags": ["positive psychology", "social support", "gratitude"],
      "whyHelpful": "Combines empirical research with actionable strategies to build emotional well-being and combat low mood."
    }
  ],
  "happy": [
    {
      "title": "The Happy Secret to Better Work",
      "type": "video",
      "url": "https://www.ted.com/talks/shawn_achor_the_happy_secret_to_better_work",
      "description": "Shawn Achor shares research on how happiness fuels productivity and simple “happiness habits” to boost positivity.",
      "tags": ["positive psychology", "productivity", "habits"],
      "whyHelpful": "Reframes success and happiness, offering small daily exercises (e.g., gratitude journaling, random acts of kindness) to amplify joy."
    },
    {
      "title": "Science of Happiness Podcast",
      "type": "podcast",
      "url": "https://greatergood.berkeley.edu/podcasts",
      "description": "Weekly episodes from UC Berkeley’s Greater Good Science Center exploring evidence-based strategies for well-being.",
      "tags": ["positive psychology", "mindfulness", "research"],
      "whyHelpful": "Integrates cutting-edge research with practical tips on gratitude, compassion, and connection to sustain positive mood."
    },
    {
      "title": "Gratitude Letter Exercise",
      "type": "activity",
      "url": "https://www.health.harvard.edu/healthbeat/saying-thank-you-a-powerful-thing-to-do",
      "description": "Write and deliver a letter of appreciation to someone who’s impacted your life positively.",
      "tags": ["gratitude", "writing", "connection"],
      "whyHelpful": "Boosts happiness by strengthening social bonds and activating positive emotions through intentional appreciation."
    },
    {
      "title": "Flow: The Psychology of Optimal Experience",
      "type": "article",
      "url": "https://www.psychologytoday.com/us/articles/200307/the-flow-experience",
      "description": "Mihaly Csikszentmihalyi’s overview of flow state and techniques to cultivate deep engagement and joy.",
      "tags": ["flow", "engagement", "positive psychology"],
      "whyHelpful": "Provides practical steps to enter flow, enhancing intrinsic happiness through focused, meaningful activities."
    },
    {
      "title": "Happier with Gretchen Rubin",
      "type": "podcast",
      "url": "https://gretchenrubin.com/podcasts/",
      "description": "Gretchen Rubin shares simple happiness habits and real-life experiments to boost joy and satisfaction.",
      "tags": ["habits", "experiments", "practical"],
      "whyHelpful": "Delivers research-backed habit-forming strategies to make joy a daily practice."
    }
  ],
  "angry": [
    {
      "title": "Anger Management: 10 Tips to Tame Your Temper",
      "type": "article",
      "url": "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/anger-management/art-20045434",
      "description": "Expert-recommended strategies including timeout techniques, cognitive reframing, and relaxation methods.",
      "tags": ["CBT", "relaxation", "timeout"],
      "whyHelpful": "Provides a comprehensive set of evidence-based tips to de-escalate anger and prevent impulsive reactions."
    },
    {
      "title": "6 Anger Management Exercises to Help You Relax",
      "type": "article",
      "url": "https://www.healthline.com/health/anger-management-exercises",
      "description": "Step-by-step guides for breathing exercises, progressive muscle relaxation, and mindfulness to calm anger.",
      "tags": ["breathing", "PMR", "mindfulness"],
      "whyHelpful": "Equips you with portable techniques to interrupt the physiological arousal that fuels anger outbreaks."
    },
    {
      "title": "ANGER MANAGEMENT Exercise Routine",
      "type": "video",
      "url": "https://www.youtube.com/watch?v=up__S3rjIxY",
      "description": "A 10-minute physical routine of vigorous shaking and fluid movement to dissipate angry energy.",
      "tags": ["movement", "embodied", "energy release"],
      "whyHelpful": "Harnesses physical activity to break up anger’s “cloud,” transmuting hot, tense energy into calmness."
    },
    {
      "title": "The Science of Anger Management",
      "type": "article",
      "url": "https://positivepsychology.com/anger-management-techniques/",
      "description": "Review of psychological techniques for anger management including cognitive restructuring and assertiveness training.",
      "tags": ["CBT", "assertiveness", "cognitive restructuring"],
      "whyHelpful": "Combines multiple empirically supported approaches into a structured toolkit for long-term anger regulation."
    },
    {
      "title": "Anger Coach Podcast",
      "type": "podcast",
      "url": "https://angercoach.com/podcast/",
      "description": "Interviews and exercises with anger experts on triggers, emotional regulation, and healthy expression.",
      "tags": ["expert interviews", "regulation", "practical"],
      "whyHelpful": "Provides real-world examples and actionable coping strategies for transforming anger into constructive energy."
    }
  ],
  "lonely": [
    {
      "title": "Me, Myself, & Isla – Lifting the Lid on Loneliness",
      "type": "podcast",
      "url": "https://open.spotify.com/show/7tQnYsy4nYjXDhkawAsXfw",
      "description": "Conversations exploring causes of loneliness, personal experiences, and strategies to build meaningful connections.",
      "tags": ["storytelling", "community", "connection"],
      "whyHelpful": "Normalizes loneliness through shared stories and offers actionable insights for forging new relationships."
    },
    {
      "title": "Finding Wisdom in Loneliness",
      "type": "podcast",
      "url": "https://www.headspace.com/content/podcast/finding-wisdom-in-loneliness/5935",
      "description": "Headspace guide Dora reframes loneliness as a growth edge and teaches how to cultivate self-connection.",
      "tags": ["mindfulness", "self-compassion", "growth"],
      "whyHelpful": "Encourages embracing solitude to deepen self-understanding and resilience before seeking external connection."
    },
    {
      "title": "The Moth",
      "type": "podcast",
      "url": "https://themoth.org/podcast",
      "description": "True, live storytelling series where narrators often share experiences of isolation, belonging, and human connection.",
      "tags": ["storytelling", "empathy", "shared experience"],
      "whyHelpful": "Hearing others’ vulnerable narratives fosters empathy, reduces isolation, and sparks hope for connection."
    },
    {
      "title": "Science of Happiness Podcast (Loneliness Episodes)",
      "type": "podcast",
      "url": "https://greatergood.berkeley.edu/podcasts",
      "description": "Episodes on social connection, gratitude, and combating loneliness from UC Berkeley’s Greater Good.",
      "tags": ["social support", "gratitude", "positive psychology"],
      "whyHelpful": "Offers research-driven practices to build community bonds and reduce feelings of isolation."
    },
    {
      "title": "Eleanor Oliphant Is Completely Fine",
      "type": "book (excerpt)",
      "url": "https://www.goodreads.com/book/show/31434883-eleanor-oliphant-is-completely-fine",
      "description": "Novel exploring loneliness and human connection through the journey of a socially isolated woman.",
      "tags": ["storytelling", "literature", "empathy"],
      "whyHelpful": "Fictional narrative that resonates with lonely readers, fostering a sense of shared experience and hope."
    }
  ],
  "stressed": [
    {
      "title": "If You Struggle With Stress & Anxiety, This Will Change Your Life",
      "type": "video",
      "url": "https://www.youtube.com/watch?v=6TiJuzF0iD0",
      "description": "Dr. Aditi Nerurkar (Harvard) shares science-backed steps to overcome burnout, reenergize, and build stress resilience.",
      "tags": ["public health", "resilience", "stress science"],
      "whyHelpful": "Delivers a concise toolkit to interrupt chronic stress responses and re-energize body and mind."
    },
    {
      "title": "Stress Management: Breathwork & Guided Meditation",
      "type": "activity",
      "url": "https://www.mindful.org/a-five-minute-mindfulness-breathing-practice",
      "description": "A 5-minute guided breathing meditation to quickly down-regulate the nervous system.",
      "tags": ["mindfulness", "breathing", "guided"],
      "whyHelpful": "Offers a rapid, portable practice to shift out of fight-or-flight and restore calm focus."
    },
    {
      "title": "The Science of Happiness Podcast (Stress Episodes)",
      "type": "podcast",
      "url": "https://greatergood.berkeley.edu/podcasts",
      "description": "Episodes on stress reappraisal, social support, and gratitude to buffer daily stressors.",
      "tags": ["positive psychology", "social support", "gratitude"],
      "whyHelpful": "Combines research findings with everyday strategies to transform stress into growth opportunities."
    },
    {
      "title": "Progressive Muscle Relaxation",
      "type": "video",
      "url": "https://www.youtube.com/watch?v=ihO02wUzgkc",
      "description": "Guided 10-minute session tensing and relaxing muscle groups to reduce physical tension and stress.",
      "tags": ["PMR", "relaxation", "body scan"],
      "whyHelpful": "Systematically releases bodily tension, leading to deep relaxation and stress reduction."
    },
    {
      "title": "The Mayo Clinic Guide to Stress-Free Living",
      "type": "book excerpt",
      "url": "https://www.mayoclinic.org/books",
      "description": "Evidence-based stress management techniques including time management, cognitive reframing, and relaxation.",
      "tags": ["CBT", "time management", "relaxation"],
      "whyHelpful": "Comprehensive strategies from a trusted medical authority to address both mental and lifestyle stressors."
    }
  ],
  "unmotivated": [
    {
      "title": "Motivation: The Scientific Guide on How to Get and Stay Motivated",
      "type": "article",
      "url": "https://jamesclear.com/motivation",
      "description": "Comprehensive breakdown of intrinsic vs. extrinsic motivation, habit formation, and the Goldilocks Rule.",
      "tags": ["behavioral science", "habit", "goal-setting"],
      "whyHelpful": "Transforms abstract motivation science into actionable steps to spark and sustain drive."
    },
    {
      "title": "The War of Art: Overcoming Resistance",
      "type": "podcast excerpt",
      "url": "https://tim.blog/2012/02/13/the-war-of-art-best-of-tim-ferriss/",
      "description": "Steven Pressfield on “Resistance” and how to acknowledge and move through creative or motivational blocks.",
      "tags": ["creative blocks", "self-help", "mindset"],
      "whyHelpful": "Illuminates the universal barrier of Resistance and offers mindset shifts to push past inertia."
    },
    {
      "title": "5 Minutes to Productivity – Micro-Tasking",
      "type": "activity",
      "url": "https://zenhabits.net/microtasks/",
      "description": "Break big tasks into 5-minute micro-tasks to make starting easier and build momentum.",
      "tags": ["productivity", "micro-tasks", "momentum"],
      "whyHelpful": "Leverages small wins to overcome overwhelm, triggering dopamine boosts to fuel ongoing effort."
    },
    {
      "title": "Getting Things Done (GTD) Summary",
      "type": "article",
      "url": "https://gettingthingsdone.com/",
      "description": "Overview of David Allen’s GTD system for capturing, clarifying, organizing, and engaging tasks.",
      "tags": ["productivity", "organization", "workflow"],
      "whyHelpful": "Provides a structured framework to clear mental clutter and maintain motivation through systematic task management."
    },
    {
      "title": "The 5 Second Rule",
      "type": "video",
      "url": "https://www.youtube.com/watch?v=xt7U77djVzE",
      "description": "Mel Robbins introduces the 5-second rule for immediate action to overcome hesitation and build momentum.",
      "tags": ["action", "habit", "momentum"],
      "whyHelpful": "Simple rule to interrupt procrastination loops and trigger prompt, motivated action."
    }
  ],
  "tired": [
    {
      "title": "Sleep Hygiene Tips: How to Get Better Sleep",
      "type": "article",
      "url": "https://www.healthline.com/health/sleep-hygiene",
      "description": "Evidence-based habits (consistent schedule, environment optimization, wind-down rituals) to improve sleep quality.",
      "tags": ["sleep hygiene", "routine", "environment"],
      "whyHelpful": "Addresses root causes of fatigue by establishing restorative sleep practices."
    },
    {
      "title": "Guided Progressive Muscle Relaxation for Sleep",
      "type": "video",
      "url": "https://www.youtube.com/watch?v=ihO02wUzgkc",
      "description": "A 10-minute PMR session designed to release tension before bedtime and facilitate deeper rest.",
      "tags": ["PMR", "sleep prep", "relaxation"],
      "whyHelpful": "Physically unwinds muscles and calms the mind, paving the way for more restorative sleep."
    },
    {
      "title": "Mindful Breathe-In for Energy",
      "type": "activity",
      "url": "https://www.mindful.org/six-ways-to-give-yourself-an-energy-boost/",
      "description": "Short breathing and movement sequences to counter mid-day grogginess and boost alertness.",
      "tags": ["mindfulness", "energy", "breathing"],
      "whyHelpful": "Provides a gentle, non-caffeinated method to reset mental clarity and physical vitality."
    },
    {
      "title": "Power Nap Techniques",
      "type": "article",
      "url": "https://www.sleepfoundation.org/how-sleep-works/napping",
      "description": "Guidelines for effective napping durations and timing to maximize alertness without sleep inertia.",
      "tags": ["napping", "alertness", "restoration"],
      "whyHelpful": "Optimizes brief rest periods to recharge energy levels and improve cognitive performance."
    },
    {
      "title": "Calm Sleep Stories",
      "type": "app-based audio (free)",
      "url": "https://www.calm.com/sleep",
      "description": "Narrated bedtime stories and soundscapes designed to lull listeners into sleep.",
      "tags": ["storytelling", "audio", "relaxation"],
      "whyHelpful": "Distracts the mind from rumination and creates a soothing audio environment conducive to sleep."
    }
  ]
};

 const normalizedResources = useMemo(() => {
  const moodKeys = selectedMood === 'all'
    ? Object.keys(resources)
    : selectedMood === 'bookmarked'
    ? Object.keys(resources)
    : [selectedMood];

  const all = moodKeys.flatMap((key) =>
    (resources[key] || []).map((res, index) => ({
      ...res,
      id: `${key}-${index}`, // or use a UUID if needed
      mood: key,
      duration: res.duration || '5-10 min', // fallback duration if missing
      type: res.type?.toLowerCase() || 'article',
    }))
  );

  if (selectedMood === 'bookmarked') {
    return all.filter(res => bookmarkedResources.includes(res.id));
  }

  return all;
}, [resources, selectedMood, bookmarkedResources]);

const filteredResources = useMemo(() => {
  return normalizedResources.filter((resource) => {
    const matchesSearch =
      searchTerm === '' ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedFilters.type === 'all' ||
      resource.type === selectedFilters.type;

    const matchesDuration =
      selectedFilters.duration === 'all' ||
      (resource.duration &&
        (
          (selectedFilters.duration === '<5 min' && resource.duration.includes('<5')) ||
          (selectedFilters.duration === '5-10 min' && resource.duration.includes('5-10')) ||
          (selectedFilters.duration === '10-20 min' && resource.duration.includes('10-20')) ||
          (selectedFilters.duration === '20+ min' && resource.duration.includes('20'))
        ));

    return matchesSearch && matchesType && matchesDuration;
  });
}, [normalizedResources, searchTerm, selectedFilters]);


  // Flatten resources for filtering
  const allResources = Object.values(resources).flat();

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await loadUserData(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load user data from Firestore
  const loadUserData = async (userId) => {
    try {
      // Load bookmarks
      const bookmarksRef = doc(db, 'users', userId, 'preferences', 'bookmarks');
      const bookmarksSnap = await getDoc(bookmarksRef);
      if (bookmarksSnap.exists()) {
        setBookmarkedResources(bookmarksSnap.data().resources || []);
      }

      // Load completed resources
      const completedRef = doc(db, 'users', userId, 'preferences', 'completed');
      const completedSnap = await getDoc(completedRef);
      if (completedSnap.exists()) {
        setCompletedResources(completedSnap.data().resources || []);
      }

      // Load planner
      const plannerRef = collection(db, 'users', userId, 'planner');
      const plannerQuery = query(plannerRef);
      const plannerSnap = await getDocs(plannerQuery);
      setPlannedPractices(plannerSnap.docs.map(doc => doc.data()));

      // Load journal entries
      const journalRef = collection(db, 'users', userId, 'journal');
      const journalQuery = query(journalRef, orderBy('date', 'desc'));
      const journalSnap = await getDocs(journalQuery);
      const entries = {};
      journalSnap.forEach(doc => {
        const data = doc.data();
        if (!entries[data.resourceId]) {
          entries[data.resourceId] = [];
        }
        entries[data.resourceId].push({
          id: doc.id,
          date: data.date,
          text: data.text
        });
      });
      setJournalEntries(entries);

      // Load mood history
      const moodHistoryRef = collection(db, 'users', userId, 'dailyMood');
      const moodHistoryQuery = query(moodHistoryRef, orderBy('date', 'desc'));
      const moodHistorySnap = await getDocs(moodHistoryQuery);
      setMoodHistory(moodHistorySnap.docs.map(doc => doc.data()));

      // Load settings
      const settingsRef = doc(db, 'users', userId, 'preferences', 'settings');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const settings = settingsSnap.data();
        setDarkMode(settings.darkMode || false);
        setNotificationTime(settings.notificationTime || '09:00');
        setNotificationEnabled(settings.notificationEnabled || false);
      }

      // Calculate streak
      calculateStreak(moodHistorySnap.docs.map(doc => doc.data()));

      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
      setLoading(false);
    }
  };

  // Save data to Firestore when it changes
  useEffect(() => {
    if (!user) return;

    const saveData = async () => {
      try {
        // Save bookmarks
        const bookmarksRef = doc(db, 'users', user.uid, 'preferences', 'bookmarks');
        await setDoc(bookmarksRef, { resources: bookmarkedResources });

        // Save completed resources
        const completedRef = doc(db, 'users', user.uid, 'preferences', 'completed');
        await setDoc(completedRef, { resources: completedResources });

        // Save settings
        const settingsRef = doc(db, 'users', user.uid, 'preferences', 'settings');
        await setDoc(settingsRef, {
          darkMode,
          notificationTime,
          notificationEnabled
        }, { merge: true });
      } catch (error) {
        console.error("Error saving user data:", error);
      }
    };

    saveData();
  }, [bookmarkedResources, completedResources, darkMode, notificationTime, notificationEnabled, user]);

  // Save planner to Firestore
  useEffect(() => {
    if (!user || !plannedPractices.length) return;

    const savePlanner = async () => {
      try {
        // First clear existing planner
        const plannerRef = collection(db, 'users', user.uid, 'planner');
        const plannerQuery = query(plannerRef);
        const plannerSnap = await getDocs(plannerQuery);
        
        const batch = [];
        

plannerSnap.forEach(doc => {
  batch.push(deleteDoc(doc.ref));
});

        
        await Promise.all(batch);

        // Add new planner items
        const addBatch = [];
        plannedPractices.forEach(practice => {
          const newDocRef = doc(plannerRef);
          addBatch.push(setDoc(newDocRef, {
            ...practice,
            id: newDocRef.id
          }));
        });

        await Promise.all(addBatch);
      } catch (error) {
        console.error("Error saving planner:", error);
      }
    };

    savePlanner();
  }, [plannedPractices, user]);

  // Notification setup
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          scheduleDailyNotification();
        }
      });
    }

    return () => {
      if (notificationRef.current) {
        clearInterval(notificationRef.current);
      }
    };
  }, [notificationEnabled, notificationTime]);

  const scheduleDailyNotification = () => {
    if (!notificationEnabled) return;

    const [hours, minutes] = notificationTime.split(':').map(Number);
    const now = new Date();
    const notificationTimeToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    // If time already passed today, schedule for tomorrow
    if (notificationTimeToday < now) {
      notificationTimeToday.setDate(notificationTimeToday.getDate() + 1);
    }

    const timeout = notificationTimeToday.getTime() - now.getTime();

    notificationRef.current = setTimeout(() => {
      showPracticeNotification();
      // Schedule next notification for tomorrow
      scheduleDailyNotification();
    }, timeout);
  };

  const showPracticeNotification = () => {
    if (!notificationEnabled) return;

    const notification = new Notification('Mindful Moment Reminder', {
      body: 'Time for your daily wellness practice!',
      icon: '/mindful-icon.png'
    });

    notification.onclick = () => {
      window.focus();
    };

    toast.info('Time for your daily wellness practice!', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };

  const calculateStreak = (moodData = moodHistory) => {
    if (!moodData.length) {
      setStreakCount(0);
      return;
    }

    // Sort by date ascending
    const sorted = [...moodData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let streak = 1;
    let prevDate = new Date(sorted[sorted.length - 1].date);
    
    // Check consecutive days from most recent
    for (let i = sorted.length - 2; i >= 0; i--) {
      const currentDate = new Date(sorted[i].date);
      const diffTime = prevDate - currentDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
        prevDate = currentDate;
      } else if (diffDays > 1) {
        break;
      }
    }
    
    setStreakCount(streak);
  };

  // Audio player functions
  const playAudio = (resource) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentlyPlaying(resource);
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentlyPlaying(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Resource management functions
  const toggleBookmark = async (resourceId) => {
    const newBookmarks = bookmarkedResources.includes(resourceId) 
      ? bookmarkedResources.filter(id => id !== resourceId)
      : [...bookmarkedResources, resourceId];
    
    setBookmarkedResources(newBookmarks);
    
    toast.success(
      bookmarkedResources.includes(resourceId) 
        ? 'Removed from bookmarks' 
        : 'Added to bookmarks'
    );
  };

  const markCompleted = async (resourceId) => {
    const newCompleted = completedResources.includes(resourceId) 
      ? completedResources.filter(id => id !== resourceId)
      : [...completedResources, resourceId];
    
    setCompletedResources(newCompleted);
    
    if (!completedResources.includes(resourceId)) {
      toast.success('Marked as completed!', {
        icon: <CheckCircle className="text-green-500" />
      });
      calculateStreak();
    }
  };

  const addToPlan = async (resource) => {
    if (!plannedPractices.find(p => p.id === resource.id)) {
      const newPlanned = [...plannedPractices, resource];
      setPlannedPractices(newPlanned);
      toast.success('Added to your planner!');
    } else {
      toast.info('Already in your planner');
    }
  };

  const removeFromPlan = async (resourceId) => {
    const newPlanned = plannedPractices.filter(p => p.id !== resourceId);
    setPlannedPractices(newPlanned);
    toast.success('Removed from planner');
  };

  const saveJournalEntry = async () => {
    if (!user || !currentResourceId || !currentJournalEntry.trim()) return;

    try {
      const journalRef = collection(db, 'users', user.uid, 'journal');
      const newEntry = {
        resourceId: currentResourceId,
        date: new Date().toISOString(),
        text: currentJournalEntry
      };
      
      await addDoc(journalRef, newEntry);
      
      // Update local state
      setJournalEntries(prev => ({
        ...prev,
        [currentResourceId]: [
          ...(prev[currentResourceId] || []),
          newEntry
        ]
      }));

      setCurrentJournalEntry('');
      setShowJournalModal(false);
      toast.success('Journal entry saved');
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast.error("Failed to save journal entry");
    }
  };

  const openJournalForResource = (resourceId) => {
    setCurrentResourceId(resourceId);
    setShowJournalModal(true);
  };

  const featuredResources = allResources.filter(resource => resource.featured);

  // UI helper functions
  const getTypeIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'audio': return <Volume2 className="w-4 h-4" />;
      case 'exercise': return <Book className="w-4 h-4" />;
      case 'app': return <Smartphone className="w-4 h-4" />;
      case 'tool': return <Star className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  const getActionButton = (resource) => {
    if (resource.type.toLowerCase() === 'audio') {
      return (
        <button
          onClick={() => playAudio(resource)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Play</span>
        </button>
      );
    } else if (resource.type.toLowerCase() === 'video') {
      return (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Watch</span>
        </a>
      );
    } else if (resource.type.toLowerCase() === 'exercise') {
      return (
        <button
          onClick={() => window.open(resource.url, '_blank')}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      );
    } else {
      return (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>Open</span>
        </a>
      );
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(`Switched to ${!darkMode ? 'dark' : 'light'} mode`);
  };

  const toggleNotificationSetting = () => {
    const newSetting = !notificationEnabled;
    setNotificationEnabled(newSetting);
    if (newSetting && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          scheduleDailyNotification();
        }
      });
    }
    toast.info(`Daily notifications ${newSetting ? 'enabled' : 'disabled'}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Loading your wellness resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors relative top-20 duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800'}`}>
      {/* Toast Notifications */}
      <ToastContainer position="top-right" theme={darkMode ? 'dark' : 'light'} />

      {/* Crisis Help Bar */}
      <div className="bg-red-600 text-white p-3 text-center top-0 z-50">
        <div className="flex items-center justify-center space-x-4 text-sm">
          <span className="font-medium">Need urgent help? You're not alone.</span>
          <div className="flex items-center space-x-4">
            <a href="tel:988" className="flex items-center space-x-1 hover:underline">
              <Phone className="w-4 h-4" />
              <span>Call 988</span>
            </a>
            <a href="sms:741741" className="flex items-center space-x-1 hover:underline">
              <MessageCircle className="w-4 h-4" />
              <span>Text HOME to 741741</span>
            </a>
            <a href="https://www.nami.org/help" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:underline">
              <Globe className="w-4 h-4" />
              <span>NAMI Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {currentlyPlaying && (
        <div className={`border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 sticky bottom-0 z-40`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currentlyPlaying.title}</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{currentlyPlaying.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={isPlaying ? pauseAudio : resumeAudio}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={stopAudio}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-12`}>{formatTime(currentTime)}</span>
              <div className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 cursor-pointer`} onClick={handleSeek}>
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-12`}>{formatTime(duration)}</span>
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>
          </div>
          
          <audio
            ref={audioRef}
            src={currentlyPlaying.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={stopAudio}
            autoPlay
            volume={volume}
          />
        </div>
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className={`fixed inset-0 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
          <button 
            onClick={() => setShowMobileMenu(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col space-y-6 mt-12">
            <button 
              onClick={() => {
                setShowPlanner(true);
                setShowMobileMenu(false);
              }}
              className="flex items-center space-x-3 text-lg"
            >
              <Calendar className="w-5 h-5" />
              <span>My Planner</span>
            </button>
            
            <button 
              onClick={() => {
                setSelectedMood('all');
                setShowMobileMenu(false);
              }}
              className="flex items-center space-x-3 text-lg"
            >
              <Book className="w-5 h-5" />
              <span>All Resources</span>
            </button>
            
            <button 
              onClick={() => {
                setSelectedMood('bookmarked');
                setShowMobileMenu(false);
              }}
              className="flex items-center space-x-3 text-lg"
            >
              <Heart className="w-5 h-5" />
              <span>Saved Resources</span>
            </button>
            
            <button 
              onClick={toggleDarkMode}
              className="flex items-center space-x-3 text-lg"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5" />
                <div className="flex-1">
                  <label htmlFor="notification-time" className="block text-sm font-medium mb-1">
                    Daily Reminder
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      id="notification-time"
                      value={notificationTime}
                      onChange={(e) => setNotificationTime(e.target.value)}
                      className="px-2 py-1 border rounded"
                      disabled={!notificationEnabled}
                    />
                    <button
                      onClick={toggleNotificationSetting}
                      className={`p-1 rounded-full ${notificationEnabled ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      {notificationEnabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journal Modal */}
      {showJournalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Journal Entry</h3>
              <button 
                onClick={() => setShowJournalModal(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">
                {allResources.find(r => r.id === currentResourceId)?.title}
              </h4>
              <textarea
                value={currentJournalEntry}
                onChange={(e) => setCurrentJournalEntry(e.target.value)}
                placeholder="Write your thoughts, reflections, or notes here..."
                className={`w-full h-40 p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Previous Entries</h4>
              {journalEntries[currentResourceId]?.length > 0 ? (
                <div className="space-y-3">
                  {journalEntries[currentResourceId].map((entry, index) => (
                    <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className="text-sm">{entry.text}</p>
                      <p className="text-xs mt-1 text-gray-500">
                        {new Date(entry.date).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No previous entries</p>
              )}
            </div>
            
            <button
              onClick={saveJournalEntry}
              disabled={!currentJournalEntry.trim()}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="text-center md:text-left">
            <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Mental Wellness Resources</h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Tools for your mental health journey
            </p>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <div className="flex items-center">
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="px-2 py-1 border rounded w-28"
                  disabled={!notificationEnabled}
                />
                <button
                  onClick={toggleNotificationSetting}
                  className={`ml-2 p-1 rounded-full ${notificationEnabled ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  {notificationEnabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {user ? (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
            ) : (
              <button 
                onClick={() => signInWithGoogle()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Mood Selector */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>How are you feeling today?</h2>
          <div className="flex overflow-x-auto pb-4 space-x-3">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl min-w-[100px] transition-all ${selectedMood === mood.id ? 
                  `${mood.color} text-white shadow-lg transform scale-105` : 
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} shadow`}
              >
                <span className="text-2xl mb-1">{mood.icon}</span>
                <span className="text-sm font-medium">{mood.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`rounded-xl shadow-lg p-6 mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 md:max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={selectedFilters.type}
                  onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
                  className={`appearance-none pl-3 pr-8 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Types</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                  <option value="article">Articles</option>
                  <option value="exercise">Exercises</option>
                  <option value="app">Apps</option>
                </select>
                <Filter className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} pointer-events-none`} />
              </div>
              
              <div className="relative">
                <select
                  value={selectedFilters.duration}
                  onChange={(e) => setSelectedFilters({...selectedFilters, duration: e.target.value})}
                  className={`appearance-none pl-3 pr-8 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">Any Duration</option>
                  <option value="<5 min">Under 5 min</option>
                  <option value="5-10 min">5-10 min</option>
                  <option value="10-20 min">10-20 min</option>
                  <option value="20+ min">20+ min</option>
                </select>
                <Clock className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} pointer-events-none`} />
              </div>
              
              <button
                onClick={() => setShowPlanner(!showPlanner)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <Calendar className="w-5 h-5" />
                <span>{showPlanner ? 'Hide Planner' : 'Show Planner'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Planner Section */}
        {showPlanner && (
          <div className={`rounded-xl shadow-lg p-6 mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>My Wellness Planner</h2>
              <button
                onClick={() => setShowPlanner(false)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {plannedPractices.length > 0 ? (
              <div className="space-y-4">
                {plannedPractices.map((practice) => (
                  <div 
                    key={practice.id} 
                    className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{practice.title}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{practice.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                            {practice.duration}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                            {practice.type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {getActionButton(practice)}
                        <button
                          onClick={() => removeFromPlan(practice.id)}
                          className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-500'}`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg">Your planner is empty</p>
                <p className="mb-4">Add resources to plan your wellness activities</p>
                <button
                  onClick={() => setShowPlanner(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Resources
                </button>
              </div>
            )}
          </div>
        )}

        {/* Featured Resources Carousel */}
        {featuredResources.length > 0 && (
          <div className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Featured Resources</h2>
            <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <Carousel 
                showArrows={true} 
                showStatus={false} 
                showThumbs={false}
                infiniteLoop={true}
                autoPlay={true}
                interval={5000}
                renderArrowPrev={(onClickHandler, hasPrev, label) => (
                  <button
                    onClick={onClickHandler}
                    disabled={!hasPrev}
                    className={`absolute top-1/2 left-2 z-10 transform -translate-y-1/2 p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'} shadow`}
                    aria-label={label}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                renderArrowNext={(onClickHandler, hasNext, label) => (
                  <button
                    onClick={onClickHandler}
                    disabled={!hasNext}
                    className={`absolute top-1/2 right-2 z-10 transform -translate-y-1/2 p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'} shadow`}
                    aria-label={label}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              >
                {featuredResources.map((resource) => (
                  <div key={resource.id} className={`h-64 md:h-96 relative ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0"></div>
                    <div className="relative z-10 h-full flex flex-col justify-end p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                          {resource.duration}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                          {resource.type}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{resource.title}</h3>
                      <p className="text-gray-200 mb-4">{resource.description}</p>
                      <div className="flex space-x-3">
                        {getActionButton(resource)}
                        <button
                          onClick={() => toggleBookmark(resource.id)}
                          className={`p-2 rounded-full ${bookmarkedResources.includes(resource.id) ? 'bg-pink-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                          <Heart className="w-5 h-5" fill={bookmarkedResources.includes(resource.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => addToPlan(resource)}
                          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        )}

        {/* Resources Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {selectedMood === 'all' ? 'All Resources' : 
               selectedMood === 'bookmarked' ? 'Saved Resources' : 
               `Resources for ${moods.find(m => m.id === selectedMood)?.name}`}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div 
                  key={resource.id} 
                  className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow hover:shadow-lg transition-shadow`}
                >
                  <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{resource.title}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleBookmark(resource.id)}
                          className={`p-1 rounded-full ${bookmarkedResources.includes(resource.id) ? 'text-pink-500' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          <Heart className="w-5 h-5" fill={bookmarkedResources.includes(resource.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => markCompleted(resource.id)}
                          className={`p-1 rounded-full ${completedResources.includes(resource.id) ? 'text-green-500' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          <CheckCircle className="w-5 h-5" fill={completedResources.includes(resource.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{resource.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {resource.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(resource.type)}
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{resource.duration}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openJournalForResource(resource.id)}
                          className={`p-1 rounded-full ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          <Notebook className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => addToPlan(resource)}
                          className={`p-1 rounded-full ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-3">
                      <h4 className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>WHY THIS HELPS</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{resource.whyHelpful}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      {getActionButton(resource)}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(resource.url);
                          toast.success('Link copied to clipboard');
                        }}
                        className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'} shadow`}>
              <Search className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg">No resources found</p>
              <p>Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentalWellnessResources;