import { useState } from 'react';
import TitleScreen from './screens/TitleScreen';
import CharacterCreation from './screens/CharacterCreation';
import GameScreen from './screens/GameScreen';
import { api } from './services/api';
import './index.css';

function App() {
  const [screen, setScreen] = useState('title'); // title | creation | loading | game
  const [gameState, setGameState] = useState(null);
  const [loadingError, setLoadingError] = useState(null);

  const handleStartClick = () => {
    setScreen('creation');
  };

  const handleCharacterComplete = async (characterData) => {
    setScreen('loading');
    setLoadingError(null);

    try {
      const result = await api.startGame(
        characterData.name,
        characterData.race,
        characterData.charClass
      );
      setGameState(result);
      setScreen('game');
    } catch (err) {
      setLoadingError(err.message);
      setScreen('creation');
    }
  };

  // ── Loading Screen ──
  if (screen === 'loading') {
    return (
      <>
        <div className="game-bg" />
        <div className="screen title-screen" style={{ gap: '20px' }}>
          <div className="spinner" />
          <div className="loading-text">Forging your destiny...</div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', maxWidth: '300px', textAlign: 'center' }}>
            The Dungeon Master prepares your adventure
          </p>
        </div>
      </>
    );
  }

  // ── Error Toast ──
  const errorToast = loadingError && (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--crimson-dark)',
      color: 'var(--text-bright)',
      padding: '12px 28px',
      borderRadius: 'var(--radius-md)',
      fontSize: '0.85rem',
      zIndex: 1000,
      animation: 'fadeSlideIn 0.3s ease',
      cursor: 'pointer',
      border: '1px solid var(--crimson)',
    }}
      onClick={() => setLoadingError(null)}
    >
      ⚠️ {loadingError}
    </div>
  );

  return (
    <>
      {errorToast}

      {screen === 'title' && (
        <TitleScreen onStart={handleStartClick} />
      )}

      {screen === 'creation' && (
        <CharacterCreation onComplete={handleCharacterComplete} />
      )}

      {screen === 'game' && gameState && (
        <GameScreen gameState={gameState} setGameState={setGameState} />
      )}
    </>
  );
}

export default App;
