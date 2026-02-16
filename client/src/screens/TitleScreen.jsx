import { useMemo } from 'react';

export default function TitleScreen({ onStart }) {
    // Generate floating particles
    const particles = useMemo(() =>
        Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: `${2 + Math.random() * 3}px`,
            duration: `${8 + Math.random() * 15}s`,
            delay: `${Math.random() * 10}s`,
            opacity: 0.2 + Math.random() * 0.5,
        })), []);

    return (
        <>
            <div className="game-bg" />
            <div className="particles">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="particle"
                        style={{
                            left: p.left,
                            width: p.size,
                            height: p.size,
                            animationDuration: p.duration,
                            animationDelay: p.delay,
                        }}
                    />
                ))}
            </div>

            <div className="screen title-screen">
                {/* Decorative top flourish */}
                <div style={{ fontSize: '1.2rem', color: 'var(--gold-dark)', letterSpacing: '12px', opacity: 0.5 }}>
                    ✦ ✦ ✦
                </div>

                {/* Main Title */}
                <div className="animate-slide-up">
                    <h1 className="heading-xl" style={{ marginBottom: '8px' }}>
                        Dungeon Master
                    </h1>
                    <div className="title-subtitle">
                        An AI-Powered Adventure
                    </div>
                </div>

                {/* Divider */}
                <div className="title-divider animate-fade-in" style={{ animationDelay: '0.3s' }} />

                {/* Tagline */}
                <p className="animate-fade-in" style={{
                    animationDelay: '0.5s',
                    maxWidth: '450px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.7',
                }}>
                    Enter the <span style={{ color: 'var(--gold)' }}>Whispering Depths</span>,
                    where ancient treasures and unspeakable horrors await.
                    Your story is shaped by your choices alone.
                </p>

                {/* Start Button */}
                <button
                    className="btn btn-primary animate-slide-up animate-pulse-glow"
                    style={{ animationDelay: '0.7s', fontSize: '1rem', padding: '16px 48px' }}
                    onClick={onStart}
                >
                    Begin Your Quest
                </button>

                {/* Bottom info */}
                <div className="animate-fade-in" style={{
                    animationDelay: '1s',
                    color: 'var(--text-dim)',
                    fontSize: '0.75rem',
                    position: 'absolute',
                    bottom: '30px',
                    letterSpacing: '2px',
                }}>
                    Powered by AI • Inspired by D&D
                </div>
            </div>
        </>
    );
}
