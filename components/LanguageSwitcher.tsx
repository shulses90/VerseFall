import React from 'react';
import { Language } from '../translations';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange
}) => {
  return (
    <div className="flex justify-center space-x-2">
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-3 py-1 text-xs uppercase tracking-widest transition-colors ${currentLanguage === 'en' ? 'text-amber-400 bg-gray-800' : 'text-gray-600 hover:text-amber-400'}`}
      >
        English
      </button>
      <button
        onClick={() => onLanguageChange('fr')}
        className={`px-3 py-1 text-xs uppercase tracking-widest transition-colors ${currentLanguage === 'fr' ? 'text-amber-400 bg-gray-800' : 'text-gray-600 hover:text-amber-400'}`}
      >
        Français
      </button>
    </div>
  );
};

export default LanguageSwitcher;
