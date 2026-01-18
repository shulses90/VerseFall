import React, { useMemo, useState } from 'react';
import { LoreEntry } from '../types';
import { Language } from '../translations';
import { LORE_DATA } from '../lore';

interface EncyclopediaProps {
  unlockedIds: Set<string>;
  onClose: () => void;
  language: Language;
}

const allLore: LoreEntry[] = Object.values(LORE_DATA);

const Encyclopedia: React.FC<EncyclopediaProps> = ({ unlockedIds, onClose, language }) => {
  const groupedLore = useMemo(() => {
    return allLore.reduce((acc, entry) => {
      const category = language === 'fr' ? entry.category_fr : entry.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(entry);
      return acc;
    }, {} as Record<string, LoreEntry[]>);
  }, [language]);

  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null);

  const renderEntry = (entry: LoreEntry) => {
    const isUnlocked = unlockedIds.has(entry.id);
    const title = language === 'fr' ? entry.title_fr : entry.title;
    
    return (
      <button
        key={entry.id}
        onClick={() => isUnlocked && setSelectedEntry(entry)}
        disabled={!isUnlocked}
        className={`w-full text-left p-2 transition-colors duration-200 ${isUnlocked ? 'text-amber-400 hover:bg-amber-900/50' : 'text-gray-600 cursor-not-allowed'}`}
      >
        {isUnlocked ? `» ${title}` : `» [CLASSIFIED]`}
      </button>
    );
  };
  
  const renderDetailView = () => {
      if (!selectedEntry) {
          return (
              <div className="flex-grow flex items-center justify-center text-gray-600 p-8 text-center">
                <p>{language === 'fr' ? 'Sélectionnez une entrée déverrouillée dans la liste pour voir les détails.' : 'Select an unlocked entry from the list to view details.'}</p>
              </div>
          )
      }
      const title = language === 'fr' ? selectedEntry.title_fr : selectedEntry.title;
      const content = language === 'fr' ? selectedEntry.content_fr : selectedEntry.content;

      return (
        <div className="flex-grow p-4 md:p-6 overflow-y-auto">
            <h3 className="text-2xl text-amber-400 mb-4">{title}</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-xl">{content}</p>
        </div>
      )
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-4xl h-[90vh] max-h-[800px] bg-gray-950 border-2 border-amber-600/50 flex flex-col font-pixel"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b-2 border-amber-600/50">
          <h2 className="text-3xl text-gray-300 uppercase tracking-wider">{language === 'fr' ? 'Codex Multiversel' : 'Multiverse Codex'}</h2>
          <button onClick={onClose} aria-label="Close Codex" className="text-gray-500 hover:text-amber-400 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            <aside className="w-full md:w-1/3 border-b-2 md:border-b-0 md:border-r-2 border-amber-600/50 overflow-y-auto p-2">
                {/* FIX: Sort entries during render to ensure reliable ordering and to fix type inference issues. */}
                {Object.entries(groupedLore)
                  .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB))
                  .map(([category, entries]) => (
                    <div key={category} className="mb-4">
                        <h4 className="text-gray-500 uppercase tracking-widest px-2 pb-1 text-sm">{category}</h4>
                        {/* FIX: Use Array.isArray as a type guard because TypeScript infers `entries` as `unknown`. */}
                        {Array.isArray(entries) && entries.map(renderEntry)}
                    </div>
                ))}
            </aside>
            <main className="flex-grow flex flex-col">
                {renderDetailView()}
            </main>
        </div>
      </div>
    </div>
  );
};

export default Encyclopedia;