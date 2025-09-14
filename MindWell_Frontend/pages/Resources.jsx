import React, { useState } from 'react';

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [requestUrl, setRequestUrl] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const resources = {
    all: [
      {
        id: 'video1',
        type: 'video',
        title: 'Mindfulness for Beginners',
        description: 'A 10-minute introduction to mindfulness meditation',
        url: 'https://example.com/video1',
        thumbnail: 'https://via.placeholder.com/300x170/4F46E5/FFFFFF?text=Video+1'
      },
      {
        id: 'article1',
        type: 'article',
        title: 'The Science of Breathing',
        description: 'How controlled breathing affects your nervous system',
        url: 'https://example.com/article1',
        source: 'Scientific American'
      },
      {
        id: 'exercise1',
        type: 'exercise',
        title: '5-Minute Grounding Technique',
        description: 'Quick exercise to bring you back to the present moment',
        duration: '5 min',
        category: 'Anxiety Relief'
      },
      {
        id: 'video2',
        type: 'video',
        title: 'Yoga for Stress Relief',
        description: 'Gentle yoga sequence to release tension',
        url: 'https://example.com/video2',
        thumbnail: 'https://via.placeholder.com/300x170/4F46E5/FFFFFF?text=Video+2'
      },
      {
        id: 'article2',
        type: 'article',
        title: 'Sleep Hygiene Tips',
        description: 'Evidence-based strategies for better sleep',
        url: 'https://example.com/article2',
        source: 'Sleep Foundation'
      }
    ],
    videos: [
      {
        id: 'video1',
        type: 'video',
        title: 'Mindfulness for Beginners',
        description: 'A 10-minute introduction to mindfulness meditation',
        url: 'https://example.com/video1',
        thumbnail: 'https://via.placeholder.com/300x170/4F46E5/FFFFFF?text=Video+1'
      },
      {
        id: 'video2',
        type: 'video',
        title: 'Yoga for Stress Relief',
        description: 'Gentle yoga sequence to release tension',
        url: 'https://example.com/video2',
        thumbnail: 'https://via.placeholder.com/300x170/4F46E5/FFFFFF?text=Video+2'
      }
    ],
    articles: [
      {
        id: 'article1',
        type: 'article',
        title: 'The Science of Breathing',
        description: 'How controlled breathing affects your nervous system',
        url: 'https://example.com/article1',
        source: 'Scientific American'
      },
      {
        id: 'article2',
        type: 'article',
        title: 'Sleep Hygiene Tips',
        description: 'Evidence-based strategies for better sleep',
        url: 'https://example.com/article2',
        source: 'Sleep Foundation'
      }
    ],
    exercises: [
      {
        id: 'exercise1',
        type: 'exercise',
        title: '5-Minute Grounding Technique',
        description: 'Quick exercise to bring you back to the present moment',
        duration: '5 min',
        category: 'Anxiety Relief'
      }
    ],
    recommended: [
      {
        id: 'video1',
        type: 'video',
        title: 'Mindfulness for Beginners',
        description: 'A 10-minute introduction to mindfulness meditation',
        url: 'https://example.com/video1',
        thumbnail: 'https://via.placeholder.com/300x170/4F46E5/FFFFFF?text=Video+1'
      },
      {
        id: 'exercise1',
        type: 'exercise',
        title: '5-Minute Grounding Technique',
        description: 'Quick exercise to bring you back to the present moment',
        duration: '5 min',
        category: 'Anxiety Relief'
      }
    ]
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log(`Submitted ${requestType} request: ${requestUrl}`);
    setRequestSubmitted(true);
    setTimeout(() => {
      setShowRequestForm(false);
      setRequestSubmitted(false);
      setRequestUrl('');
    }, 2000);
  };

  const ResourceCard = ({ resource }) => {
    if (resource.type === 'video') {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 transition-all hover:shadow-lg hover:scale-[1.02] h-full flex flex-col">
          <div className="aspect-video w-full mb-4 rounded-lg overflow-hidden bg-white/50">
            <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{resource.title}</h3>
          <p className="text-gray-600 mb-4 flex-grow">{resource.description}</p>
          <a 
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full transition-colors text-center"
          >
            Watch Video
          </a>
        </div>
      );
    } else if (resource.type === 'article') {
      return (
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 transition-all hover:shadow-lg hover:scale-[1.02] h-full flex flex-col">
          <div className="h-12 w-12 bg-green-100 rounded-lg mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{resource.title}</h3>
          <p className="text-gray-600 mb-2 flex-grow">{resource.description}</p>
          <p className="text-sm text-gray-500 mb-4">Source: {resource.source}</p>
          <a 
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-auto bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full transition-colors text-center"
          >
            Read Article
          </a>
        </div>
      );
    } else if (resource.type === 'exercise') {
      return (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5 transition-all hover:shadow-lg hover:scale-[1.02] h-full flex flex-col">
          <div className="h-12 w-12 bg-purple-100 rounded-lg mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{resource.title}</h3>
          <p className="text-gray-600 mb-2 flex-grow">{resource.description}</p>
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>{resource.duration}</span>
            <span>{resource.category}</span>
          </div>
          <button className="mt-auto bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-full transition-colors">
            Start Exercise
          </button>
        </div>
      );
    }
  };

  const RequestForm = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-blue-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Request New {requestType === 'videos' ? 'Video' : 'Article'}</h2>
          <button 
            onClick={() => {
              setShowRequestForm(false);
              setRequestSubmitted(false);
              setRequestUrl('');
            }}
            className="bg-white/80 hover:bg-white rounded-full p-1 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {requestSubmitted ? (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Request Submitted!</h3>
            <p className="text-gray-600">Your {requestType === 'videos' ? 'video' : 'article'} request has been sent for admin review.</p>
          </div>
        ) : (
          <form onSubmit={handleRequestSubmit}>
            <div className="mb-4">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                {requestType === 'videos' ? 'Video URL' : 'Article URL'}
              </label>
              <input
                type="url"
                id="url"
                required
                value={requestUrl}
                onChange={(e) => setRequestUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${requestType === 'videos' ? 'YouTube or Vimeo link' : 'article web address'}`}
              />
            </div>
            <button
              type="submit"
              className={`w-full ${requestType === 'videos' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} text-white py-3 px-4 rounded-md font-medium transition-colors`}
            >
              Submit for Review
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12 pt-16">  {/* Added pt-16 for top padding */}
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Wellness Resource Hub</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Curated collection of tools and knowledge to support your mental wellbeing journey
          </p>
        </header>
        
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2 rounded-full font-medium transition-all ${activeTab === 'all' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
            >
              All Resources
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-5 py-2 rounded-full font-medium transition-all ${activeTab === 'videos' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
            >
              Helpful Videos
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-5 py-2 rounded-full font-medium transition-all ${activeTab === 'articles' ? 'bg-green-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
            >
              Helpful Articles
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`px-5 py-2 rounded-full font-medium transition-all ${activeTab === 'exercises' ? 'bg-purple-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
            >
              Guided Exercises
            </button>
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-5 py-2 rounded-full font-medium transition-all ${activeTab === 'recommended' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
            >
              Recommended For You
            </button>
          </div>
          
          {(activeTab === 'videos' || activeTab === 'articles') && (
            <div className="text-center mb-8">
              <button
                onClick={() => {
                  setRequestType(activeTab);
                  setShowRequestForm(true);
                }}
                className={`inline-flex items-center ${activeTab === 'videos' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded-full text-sm font-medium transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Request to Add {activeTab === 'videos' ? 'Video' : 'Article'}
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources[activeTab].map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
        
        {showRequestForm && <RequestForm />}
      </div>
    </div>
  );
};

export default ResourcesPage;