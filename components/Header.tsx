import React from 'react';

interface HeaderProps {
    subtitle: string;
    codexLabel: string;
    onCodexClick?: () => void;
    showCodexButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ subtitle, codexLabel, onCodexClick, showCodexButton }) => {
  return (
    <header className="relative text-center p-4 pt-8 md:pt-12 w-full max-w-3xl">
      <h1 className="text-5xl md:text-6xl font-bold text-amber-400 tracking-wider uppercase" style={{ textShadow: '3px 3px 0px #18181b' }}>
        Versefall
      </h1>
      <p className="text-gray-500 mt-2 text-lg">{subtitle}</p>
      
      {showCodexButton && (
        <button 
          onClick={onCodexClick}
          className="absolute top-4 right-4 bg-gray-900 border border-amber-600/75 hover:bg-amber-600 hover:text-black text-white font-bold py-1 px-3 uppercase tracking-widest text-xs animate-fade-in"
        >
          {codexLabel}
        </button>
      )}
    </header>
  );
};

export default Header;
