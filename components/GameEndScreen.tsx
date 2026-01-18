import React from 'react';
import { translations, Language } from '../translations';

interface GameEndScreenProps {
  endingType: 'tyrannical' | 'stagnation' | 'awakening';
  onRestart: () => void;
  language: Language;
}

const GameEndScreen: React.FC<GameEndScreenProps> = ({ endingType, onRestart, language }) => {
  const t = translations[language];
  const endingInfo = t.endings[endingType];

  return (
    <div className="text-center p-4 bg-gray-900 border-2 border-amber-500 animate-fade-in-up mt-6">
      <h2 className="text-amber-400 font-bold uppercase text-2xl tracking-widest">{endingInfo.title}</h2>
      <p className="text-gray-400 mt-2 mb-6">Your chronicle has concluded.</p>
      <button
        onClick={onRestart}
        className="bg-amber-700 hover:bg-amber-600 text-gray-900 font-bold py-2 px-4 transition-colors duration-200 uppercase text-sm tracking-widest"
      >
        {t.restartChronicle}
      </button>
    </div>
  );
};

export default GameEndScreen;