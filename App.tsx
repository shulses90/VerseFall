import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, StoryTurn, Faction } from './types';
import { getNextScene, generateImageForScene } from './services/geminiService';
import { playMusic, stopMusic, toggleMute } from './services/audioManager';
import Header from './components/Header';
import StoryBlock from './components/StoryBlock';
import ChoiceButton from './components/ChoiceButton';
import LoadingSpinner from './components/LoadingSpinner';
import SceneImage from './components/SceneImage';
import GameEndScreen from './components/GameEndScreen';
import Encyclopedia from './components/Encyclopedia';
import AudioControl from './components/AudioControl';
import { translations, Language } from './translations';

const FACTION_IDS: (keyof typeof translations.en.factions)[] = [
    'aethelgard',
    'veridian',
    'chronomach',
    'celestial',
    'weavers',
    'pantheon',
];


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [storyTurns, setStoryTurns] = useState<StoryTurn[]>([]);
  const [playerFaction, setPlayerFaction] = useState<Faction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [ending, setEnding] = useState<'tyrannical' | 'stagnation' | 'awakening' | null>(null);
  const [unlockedLore, setUnlockedLore] = useState<Set<string>>(new Set());
  const [isEncyclopediaOpen, setIsEncyclopediaOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const storyEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const scrollToBottom = () => {
    if (storyEndRef.current) {
        storyEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    // Scroll when new turns are added
    scrollToBottom();
  }, [storyTurns]);

  // Keep scrolling while typing is active to ensure text doesn't go off screen
  useEffect(() => {
      if (isTyping) {
          const interval = setInterval(scrollToBottom, 200);
          return () => clearInterval(interval);
      }
      // One final scroll when typing ends
      scrollToBottom();
  }, [isTyping]);

  useEffect(() => {
    // Audio State Management
    if (gameState === GameState.GAME_OVER && ending) {
        if (ending === 'awakening') {
            playMusic('victory');
        } else {
            playMusic('defeat');
        }
    } else if (gameState === GameState.PLAYING || gameState === GameState.LOADING) {
        // PLAY FACTION SPECIFIC THEME
        // Use the faction ID to trigger the procedural composition
        if (playerFaction) {
             playMusic(playerFaction.id);
        } else {
             playMusic('menu'); // Fallback
        }
    } else if (gameState === GameState.FACTION_SELECTION) {
        playMusic('menu');
    } else if (gameState === GameState.START_SCREEN || gameState === GameState.ERROR) {
        stopMusic();
    }
  }, [gameState, ending, playerFaction]);


  const handleAdventure = useCallback(async (choice: string | null) => {
    if (!playerFaction) return;

    setGameState(GameState.LOADING);
    setError(null);

    let textResponse;
    try {
      // 1. Get the text part of the story first
      textResponse = await getNextScene(storyTurns, choice, playerFaction, language);
    } catch (err) {
      setError(t.errorContinue);
      setGameState(GameState.ERROR);
      return;
    }

    // Unlock lore entries
    if (textResponse.unlockedLore) {
      setUnlockedLore(prev => {
        const newSet = new Set(prev);
        textResponse.unlockedLore!.forEach(id => newSet.add(id));
        return newSet;
      });
    }

    // 2. Create the new turn
    const newTurn: StoryTurn = {
      id: storyTurns.length,
      scene: textResponse.scene,
      choices: textResponse.choices,
      imageUrl: null,
      imageState: 'loading',
      ending: textResponse.ending,
      intensity: textResponse.intensity || 'low',
    };
    
    // Play sound based on intensity
    // NOTE: We generally want the faction theme to persist to create the "10 minute loop" feel,
    // but high intensity moments (battles) can override it temporarily.
    // Logic: If intensity is high, play battle music. Else, revert to faction theme (handled by useEffect on gameState)
    if (newTurn.intensity === 'high') {
       playMusic('battle');
    } else {
       // The useEffect will catch the state change back to PLAYING and restore the faction theme
       // providing a seamless background track for normal exploration.
    }

    setStoryTurns(prevTurns => [...prevTurns, newTurn]);
    setIsTyping(true); // Start typing effect
    
    // 3. Check for ending to change game state
    if (textResponse.ending) {
        setEnding(textResponse.ending);
        setGameState(GameState.GAME_OVER);
    } else {
        setGameState(GameState.PLAYING);
    }

    // 4. Asynchronously generate the image
    try {
        const imageUrl = await generateImageForScene(textResponse.scene, playerFaction.name);
        setStoryTurns(prevTurns => 
            prevTurns.map(turn => 
                turn.id === newTurn.id ? { ...turn, imageUrl: imageUrl, imageState: 'loaded' } : turn
            )
        );
    } catch (imageError) {
        console.error("Could not generate image, continuing without it.", imageError);
        setStoryTurns(prevTurns => 
            prevTurns.map(turn => 
                turn.id === newTurn.id ? { ...turn, imageState: 'error' } : turn
            )
        );
    }
  }, [storyTurns, playerFaction, language, t.errorContinue]);
  
  const handleFactionSelect = (faction: Faction) => {
    // Interaction required to start audio context
    // We start the theme immediately upon selection to give feedback
    playMusic(faction.id);
    setPlayerFaction(faction);
    handleAdventure(null);
  }

  const handleStart = () => {
    // Interaction required to start audio context
    playMusic('menu');
    setGameState(GameState.FACTION_SELECTION);
  };

  const handleRestart = () => {
    stopMusic();
    setGameState(GameState.START_SCREEN);
    setStoryTurns([]);
    setPlayerFaction(null);
    setError(null);
    setEnding(null);
    setUnlockedLore(new Set());
    setIsEncyclopediaOpen(false);
  };
  
  const handleToggleMute = () => {
    const newMutedState = toggleMute();
    setIsMuted(newMutedState);
  };

  const renderContent = () => {
    const lastTurn = storyTurns.length > 0 ? storyTurns[storyTurns.length - 1] : null;

    return (
      <>
        {storyTurns.map((turn, index) => (
            <div key={turn.id}>
                <SceneImage 
                  src={turn.imageUrl} 
                  alt={`Pixel art for the scene`} 
                  state={turn.imageState} 
                />
                <StoryBlock 
                    text={turn.scene} 
                    onComplete={index === storyTurns.length - 1 ? () => setIsTyping(false) : undefined} 
                />
            </div>
        ))}
        
        {lastTurn && gameState === GameState.PLAYING && !isTyping && (
          <div className="space-y-2 animate-fade-in-up mt-4 pb-8">
            {lastTurn.choices.map((choice, index) => (
              <ChoiceButton key={index} text={choice} onClick={() => handleAdventure(choice)} />
            ))}
          </div>
        )}

        {gameState === GameState.LOADING && <LoadingSpinner text={t.queryingCogitators} />}
        
        {gameState === GameState.GAME_OVER && ending && !isTyping && (
          <GameEndScreen endingType={ending} onRestart={handleRestart} language={language} />
        )}

        {gameState === GameState.ERROR && (
          <div className="text-center p-4 bg-red-950 border-2 border-red-500 animate-fade-in-up">
            <p className="text-red-400 font-bold uppercase text-lg">{t.transmissionError}</p>
            <p className="text-red-400 mt-2">{error}</p>
            <button
              onClick={handleRestart}
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 transition-colors uppercase text-xs tracking-widest"
            >
              {t.restartVoxLink}
            </button>
          </div>
        )}
      </>
    );
  };

  const renderFactionSelection = () => {
    return (
        <div className="text-center animate-fade-in-up">
            <h2 className="text-3xl text-gray-300 mb-2 uppercase tracking-wider">{t.selectYourChapter}</h2>
            <p className="text-gray-500 mb-8 text-lg">{t.factionChoiceSubtext}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FACTION_IDS.map(factionId => {
                    const factionInfo = t.factions[factionId];
                    return (
                        <div key={factionId} className="bg-gray-900/75 border border-gray-700 p-4 text-left flex flex-col hover:border-amber-500/50 transition-colors">
                            <h3 className="text-xl font-bold text-amber-400 uppercase tracking-wider">{factionInfo.name}</h3>
                            <p className="text-gray-400 mt-2 flex-grow text-base leading-tight">{factionInfo.description}</p>
                            <button 
                                onClick={() => handleFactionSelect({ id: factionId, name: factionInfo.name })}
                                className="bg-amber-700 hover:bg-amber-600 text-gray-900 font-bold py-2 px-4 transition-colors duration-200 mt-4 self-start uppercase text-xs tracking-widest"
                            >
                                {t.selectChapter}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    );
  }
  
  const renderStartScreen = () => {
    return (
        <div className="text-center animate-fade-in-up">
            <p className="text-gray-400 mb-8 text-xl leading-relaxed">{t.yourChoiceDictates}</p>
            <button
                onClick={handleStart}
                className="bg-amber-700 hover:bg-amber-600 text-gray-900 font-bold py-3 px-8 transition-colors duration-200 uppercase text-lg tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.5)] hover:shadow-[0_0_25px_rgba(217,119,6,0.8)]"
            >
                {t.beginTransmission}
            </button>
        </div>
    );
  }

  const LanguageSwitcher = () => (
    <div className="flex justify-center space-x-2">
      <button 
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-xs uppercase tracking-widest transition-colors ${language === 'en' ? 'text-amber-400 bg-gray-800' : 'text-gray-600 hover:text-amber-400'}`}
      >
        English
      </button>
      <button 
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1 text-xs uppercase tracking-widest transition-colors ${language === 'fr' ? 'text-amber-400 bg-gray-800' : 'text-gray-600 hover:text-amber-400'}`}
      >
        Français
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative z-10">
      {isEncyclopediaOpen && <Encyclopedia unlockedIds={unlockedLore} onClose={() => setIsEncyclopediaOpen(false)} language={language} />}
      <Header 
        subtitle={t.headerSubtitle} 
        codexLabel={t.codex}
        showCodexButton={unlockedLore.size > 0}
        onCodexClick={() => setIsEncyclopediaOpen(true)}
      />
      <main className="w-full max-w-3xl mx-auto flex-grow flex flex-col justify-center py-8">
        {(() => {
            switch (gameState) {
                case GameState.START_SCREEN:
                    return renderStartScreen();
                case GameState.FACTION_SELECTION:
                    return renderFactionSelection();
                default:
                    return (
                        <div className="w-full">
                            {renderContent()}
                            <div ref={storyEndRef} className="h-4" />
                        </div>
                    );
            }
        })()}
      </main>
      <footer className="text-center py-4 h-20 flex flex-col justify-end relative z-20">
        {gameState !== GameState.START_SCREEN && gameState !== GameState.FACTION_SELECTION && gameState !== GameState.GAME_OVER ? (
            <button onClick={handleRestart} className="text-gray-600 hover:text-amber-400 transition-colors uppercase text-xs tracking-widest mb-4">
                {t.restartChronicle}
            </button>
        ) : <div className="h-8"/>}
        <div className="flex items-center justify-center space-x-4 bg-gray-950/50 p-2 rounded-full backdrop-blur-sm mx-auto">
            <AudioControl isMuted={isMuted} onToggleMute={handleToggleMute} />
            <LanguageSwitcher />
        </div>
      </footer>
    </div>
  );
};

export default App;