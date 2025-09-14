import React, { useState, useEffect } from 'react';

const Breathing = ({ onClose }) => {
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState('box');

  const patterns = {
    box: { inhale: 4, hold: 4, exhale: 4, holdAfterExhale: 4 },
    '478': { inhale: 4, hold: 7, exhale: 8, holdAfterExhale: 0 }
  };

  useEffect(() => {
    let timer;
    if (isActive && count > 0) {
      timer = setTimeout(() => setCount(count - 1), 1000);
    } else if (isActive && count === 0) {
      switch (phase) {
        case 'inhale':
          setPhase('hold');
          setCount(patterns[selectedPattern].hold);
          break;
        case 'hold':
          setPhase('exhale');
          setCount(patterns[selectedPattern].exhale);
          break;
        case 'exhale':
          setPhase('holdAfterExhale');
          setCount(patterns[selectedPattern].holdAfterExhale);
          break;
        default:
          setPhase('inhale');
          setCount(patterns[selectedPattern].inhale);
      }
    }
    return () => clearTimeout(timer);
  }, [count, isActive, phase, selectedPattern]);

  const getCircleSize = () => {
    return phase === 'inhale' || phase === 'hold' ? 'scale-110' : 'scale-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Breathing Exercise</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setSelectedPattern('box')}
          className={`px-4 py-2 rounded-md ${selectedPattern === 'box' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Box Breathing (4-4-4-4)
        </button>
        <button
          onClick={() => setSelectedPattern('478')}
          className={`px-4 py-2 rounded-md ${selectedPattern === '478' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          4-7-8 Breathing
        </button>
      </div>

      <div className="relative w-64 h-64 mx-auto mb-8">
        <div 
          className={`absolute inset-0 rounded-full bg-blue-500 transition-all duration-1000 flex flex-col items-center justify-center text-white font-bold text-xl ${getCircleSize()}`}
        >
          <span>{phase.charAt(0).toUpperCase() + phase.slice(1)}</span>
          <span className="text-3xl mt-2">{count}s</span>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => setIsActive(!isActive)}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
};

export default Breathing;