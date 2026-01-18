import React, { useEffect, useState, useRef } from 'react';

interface StoryBlockProps {
  text: string;
  onComplete?: () => void;
}

const StoryBlock: React.FC<StoryBlockProps> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);
  // Faster typing speed for better pacing
  const speed = 20; 

  useEffect(() => {
    // Only reset if text changes significantly or at init
    if (indexRef.current === 0) {
        setDisplayedText('');
    }
    
    const intervalId = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current++;
      } else {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, onComplete]);

  const isTyping = indexRef.current < text.length;
  
  return (
    <div className="bg-black/50 border-2 border-amber-600/50 p-4 mb-6 animate-fade-in-up shadow-[0_0_15px_rgba(217,119,6,0.1)]">
      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-xl min-h-[2rem]">
        {displayedText}
        {/* Show cursor while typing or if this is the active block awaiting completion */}
        {(isTyping || onComplete) && (
             <span className="inline-block w-2 h-5 ml-1 bg-amber-500 animate-blink align-middle"></span>
        )}
      </p>
    </div>
  );
};

export default StoryBlock;