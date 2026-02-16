import { useState, useCallback } from 'react';
import NarrativeDisplay from '../components/NarrativeDisplay';
import CharacterSheet from '../components/CharacterSheet';
import CombatView from '../components/CombatView';
import ActionInput from '../components/ActionInput';
import { api } from '../services/api';

export default function GameScreen({ gameState, setGameState }) {
    const [messages, setMessages] = useState(
        gameState?.narrative
            ? [{ text: gameState.narrative, type: 'dm' }]
            : []
    );
    const [isLoading, setIsLoading] = useState(false);
    const [combatLog, setCombatLog] = useState([]);
    const [playerDead, setPlayerDead] = useState(false);
    const [error, setError] = useState(null);

    const sessionId = gameState?.sessionId;
    const inCombat = gameState?.combat?.active;

    // ── Handle Exploration / Dialogue Action ──
    const handleAction = useCallback(async (action) => {
        if (!sessionId || isLoading) return;
        setError(null);
        setIsLoading(true);

        // Add player action to messages
        setMessages(prev => [...prev, { text: `> ${action}`, type: 'player' }]);

        try {
            const result = await api.sendAction(sessionId, action);

            // Update game state
            setGameState(prev => ({
                ...prev,
                ...result,
            }));

            // Add AI response
            setMessages(prev => [
                ...prev,
                { text: result.narrative, type: result.combat?.active ? 'combat' : 'dm' },
            ]);

            // If combat started
            if (result.combat?.active) {
                setCombatLog([]);
            }
        } catch (err) {
            setError(err.message);
            setMessages(prev => [
                ...prev,
                { text: `⚠️ ${err.message}`, type: 'system' },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, isLoading, setGameState]);

    // ── Handle Combat Action ──
    const handleCombatAction = useCallback(async (action) => {
        if (!sessionId || isLoading) return;
        setError(null);
        setIsLoading(true);

        try {
            const result = await api.combatAction(sessionId, action);

            // Update game state
            setGameState(prev => ({
                ...prev,
                ...result,
            }));

            // Update combat log
            if (result.combatLog) {
                setCombatLog(result.combatLog);
            }

            // Add narrative
            if (result.narrative) {
                setMessages(prev => [
                    ...prev,
                    { text: result.narrative, type: 'combat' },
                ]);
            }

            // Add combat log entries to messages
            if (result.combatLog) {
                result.combatLog.forEach(entry => {
                    setMessages(prev => [
                        ...prev,
                        { text: entry.message, type: 'combat' },
                    ]);
                });
            }

            // Check for combat end
            if (result.combatEnded) {
                if (result.victory) {
                    setMessages(prev => [
                        ...prev,
                        { text: '🏆 Victory! The enemy has been vanquished!', type: 'system' },
                    ]);
                    setCombatLog([]);
                } else if (result.fled) {
                    setMessages(prev => [
                        ...prev,
                        { text: '🏃 You escape into the shadows...', type: 'system' },
                    ]);
                    setCombatLog([]);
                }
            }

            // Check for player death
            if (result.playerDead) {
                setPlayerDead(true);
            }
        } catch (err) {
            setError(err.message);
            setMessages(prev => [
                ...prev,
                { text: `⚠️ ${err.message}`, type: 'system' },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, isLoading, setGameState]);

    // ── Restart Game ──
    const handleRestart = () => {
        window.location.reload();
    };

    // ── Death Screen ──
    if (playerDead) {
        return (
            <div className="death-overlay">
                <div className="death-text">You Died</div>
                <div className="death-sub">Your adventure has come to an end...</div>
                <button className="btn btn-danger" onClick={handleRestart} style={{ marginTop: '16px' }}>
                    ☠️ Try Again
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="game-bg" />
            <div className="game-layout">
                {/* Main Content Area */}
                <div className="game-main">
                    {/* Narrative / Story Display */}
                    <NarrativeDisplay messages={messages} isLoading={isLoading} />

                    {/* Combat or Exploration Actions */}
                    {inCombat ? (
                        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                            <CombatView
                                combat={gameState.combat}
                                onAction={handleCombatAction}
                                isLoading={isLoading}
                                combatLog={combatLog}
                            />
                        </div>
                    ) : (
                        <ActionInput
                            suggestedActions={gameState?.suggestedActions || []}
                            onAction={handleAction}
                            isLoading={isLoading}
                            disabled={false}
                        />
                    )}
                </div>

                {/* Sidebar — Character Sheet */}
                <CharacterSheet character={gameState?.character} />
            </div>

            {/* Error Toast */}
            {error && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--crimson-dark)',
                    color: 'var(--text-bright)',
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    zIndex: 1000,
                    animation: 'fadeSlideIn 0.3s ease',
                    cursor: 'pointer',
                }}
                    onClick={() => setError(null)}
                >
                    ⚠️ {error}
                </div>
            )}
        </>
    );
}
