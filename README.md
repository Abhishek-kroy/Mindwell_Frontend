# 🧠 MindWell – Because Your Mind Deserves Kindness

Welcome to **MindWell**, a comprehensive mental wellness platform designed to provide compassionate, evidence-based support through modern technology. This README guides you through the project structure, features, and technical details to help you understand the full scope of the application without needing to open individual files.

---

## 📌 Project Overview

MindWell is a digital companion for mental health, offering:

- **Mood Testing:** Clinically validated mood assessments with AI-driven insights.
- **AI Chatbot:** A Gemini AI-powered chatbot providing empathetic, 24/7 conversational support.
- **Community Network:** A moderated, supportive social space for sharing and connection.
- **Personalized Resources:** Evidence-based tools, articles, and videos tailored to user moods.
- **Professional Help:** Easy connection to psychiatrists and mental health professionals.

---

## 🗂️ Project Structure & Key Components

### 1. **src/**

- **App.jsx:** Main React app entry point. Sets up routing, authentication guards for students, psychiatrists, and admins, and lazy loads pages for performance.
- **main.jsx:** React DOM root rendering the App component.
- **hooks/**: Custom React hooks for authentication (`useAuth`), chat management (`useChat`), and session handling (`useSessions`).
- **utils/**: Utility functions including API interaction, encryption, and message sending.
- **App.css & index.css:** Global styling files.

### 2. **components/**

- **Chatbot/**: Core chatbot UI components including `ChatWindow.jsx` (main chat interface), `ChatInput.jsx`, `MessageBubble.jsx`, `SessionList.jsx`, and loading indicators.
- **Header/**: Application header with navigation.
- **ui/**: Reusable UI components like buttons, cards, progress bars, radio groups, and modals.
- **Sidebar.jsx, SearchPanel.jsx, CreatePostModal.jsx, Post.jsx:** Various UI components supporting community and content creation features.
- **Particles.jsx:** Visual particle effects for UI enhancement.

### 3. **pages/**

- **Home.jsx:** Landing page with mood test prompt, AI chat access, community links, and psychiatrist connection.
- **Auth.jsx, PsychiatristAuth.jsx, AdminAuth.jsx:** Authentication pages for different user roles.
- **PsychiatristDashboard.jsx, PsychiatristRegister.jsx:** Psychiatrist-specific pages.
- **MoodTracker.jsx:** Mood tracking and therapy tools.
- **Community.jsx:** Hive network community page.
- **Resources.jsx, WellnessResources.jsx:** Mental health resources and tools.
- **AddRequest.jsx, ViewRequests.jsx, AdminReportsPage.jsx:** Request management and admin reporting.
- **TermsOfService.jsx, PrivacyPolicy.jsx, CookiePolicy.jsx:** Legal and policy pages.
- **Test.jsx:** Mood test page.
- **MyChats.jsx:** User chat history.

### 4. **context/firebase/**

- Firebase initialization and authentication helpers (`firebase.jsx`).

### 5. **public/**

- Static assets including images (`calm.mp3`, `chatbotbg.png`, `favicon.png`, etc.) and redirect rules.

---

## ⚙️ Technology Stack

- **Frontend:** React.js with React Router, Tailwind CSS for styling, Framer Motion for animations.
- **Backend:** Node.js with Express.js (API endpoints not shown here but implied).
- **Authentication & Database:** Firebase Authentication and Firestore.
- **AI Integration:** Gemini API for chatbot intelligence.
- **Utilities:** Lodash, Lucide React icons, React Markdown, React Responsive Carousel, Recharts for charts.
- **Build Tools:** Vite for fast development and build.

---

## 🚀 Features & User Flow

1. **User Authentication:** Supports students, psychiatrists, and admins with role-based protected routes.
2. **Mood Test:** Interactive mood questionnaire with AI interpretation.
3. **AI Chatbot:** 24/7 conversational AI assistant with session history and encrypted chat.
4. **Community Hive:** Anonymous or open posting with moderation.
5. **Resource Library:** Personalized mental health resources.
6. **Professional Connection:** Request and manage psychiatrist consultations.
7. **Admin Tools:** View and manage user requests and reports.

---

## 🖼️ Visual Overview

![MindWell Home Page](public/homebelow16-3.png)

![Chatbot Interface](public/chatbotbg.png)

---

## 📦 Installation & Running Locally

```bash
# Clone the repo
git clone <repo-url>
cd MindWell

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the app.

---

## 🧩 How to Navigate the Codebase

- Start with `src/App.jsx` to understand routing and authentication.
- Explore `pages/` for UI screens and user flows.
- Dive into `components/Chatbot/` for chatbot UI and logic.
- Check `context/firebase/` for Firebase setup.
- Use `utils/` for helper functions and API calls.

---

## 📜 Additional Notes

- The project uses environment variables for Firebase config (see `.env` file).
- Chat sessions are encrypted and stored securely.
- The AI chatbot uses Gemini API for empathetic responses.
- Tailwind CSS ensures responsive and accessible UI.
- The app supports dark mode toggling (partially implemented).

---

## 🧑‍💻 Contributors

- Developed with care by a dedicated team passionate about mental health and technology.

---

This README aims to provide a clear, concise, and comprehensive guide to the MindWell project for judges and reviewers. For any questions or further details, please refer to the source code or contact the development team.
