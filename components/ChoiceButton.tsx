import React from 'react';

interface ChoiceButtonProps {
  text: string;
  onClick: (choice: string) => void;
  disabled?: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ text, onClick, disabled = false }) => {
  return (
    <button
      onClick={() => onClick(text)}
      disabled={disabled}
      className="w-full text-left bg-gray-900 border border-amber-600/75 hover:bg-amber-600 hover:text-black disabled:bg-gray-800 disabled:text-gray-600 disabled:border-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 focus:outline-none focus:bg-amber-600 focus:text-black uppercase tracking-widest text-sm"
    >
      » {text}
    </button>
  );
};

export default ChoiceButton;