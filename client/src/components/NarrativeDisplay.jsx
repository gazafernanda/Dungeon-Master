import { useEffect, useRef } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

export default function NarrativeDisplay({ messages, isLoading }) {
    const containerRef = useRef(null);
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    const { displayed, isTyping, isDone, skipToEnd } = useTypewriter(
        lastMessage?.text || '',
        15
    );

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [displayed, messages.length]);

    return (
        <div className="game-narrative" ref={containerRef} onClick={isTyping ? skipToEnd : undefined} style={{ cursor: isTyping ? 'pointer' : 'default' }}>
            {/* Previous messages */}
            {messages.slice(0, -1).map((msg, i) => (
                <div
                    key={i}
                    className={`narrative-text ${msg.type === 'combat' ? 'narrative-combat' :
                            msg.type === 'system' ? 'narrative-system' :
                                'narrative-dm'
                        }`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                >
                    {msg.text}
                </div>
            ))}

            {/* Current message with typewriter */}
            {lastMessage && (
                <div className={`narrative-text ${lastMessage.type === 'combat' ? 'narrative-combat' :
                        lastMessage.type === 'system' ? 'narrative-system' :
                            'narrative-dm'
                    }`}>
                    {displayed}
                    {isTyping && <span className="typewriter-cursor" />}
                </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
                    <div className="spinner" style={{ width: '24px', height: '24px' }} />
                    <span className="loading-text" style={{ fontSize: '0.75rem' }}>The Dungeon Master ponders...</span>
                </div>
            )}
        </div>
    );
}
