import { useState, useMemo } from 'react';

const RACES = [
    { id: 'human', name: 'Human', icon: '👤', desc: 'Versatile and adaptable' },
    { id: 'elf', name: 'Elf', icon: '🧝', desc: '+2 DEX, +1 INT' },
    { id: 'dwarf', name: 'Dwarf', icon: '⛏️', desc: '+2 STR, +2 CON' },
    { id: 'halfling', name: 'Halfling', icon: '🍀', desc: '+2 DEX, +2 CHA' },
    { id: 'orc', name: 'Orc', icon: '👹', desc: '+3 STR, +2 CON' },
];

const CLASSES = [
    { id: 'warrior', name: 'Warrior', icon: '⚔️', desc: 'Heavy armor, melee master' },
    { id: 'mage', name: 'Mage', icon: '🧙', desc: 'Arcane spells, high INT' },
    { id: 'rogue', name: 'Rogue', icon: '🗡️', desc: 'Stealth, critical strikes' },
    { id: 'cleric', name: 'Cleric', icon: '✝️', desc: 'Healing, divine magic' },
    { id: 'ranger', name: 'Ranger', icon: '🏹', desc: 'Ranged combat, tracking' },
];

const BASE_STATS = {
    warrior: { STR: 16, DEX: 12, CON: 15, INT: 8, WIS: 10, CHA: 10 },
    mage: { STR: 8, DEX: 12, CON: 10, INT: 16, WIS: 14, CHA: 10 },
    rogue: { STR: 10, DEX: 16, CON: 12, INT: 13, WIS: 10, CHA: 14 },
    cleric: { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 16, CHA: 13 },
    ranger: { STR: 13, DEX: 15, CON: 12, INT: 10, WIS: 14, CHA: 10 },
};

const RACE_BONUSES = {
    human: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
    elf: { STR: 0, DEX: 2, CON: 0, INT: 1, WIS: 0, CHA: 0 },
    dwarf: { STR: 2, DEX: 0, CON: 2, INT: 0, WIS: 0, CHA: 0 },
    halfling: { STR: 0, DEX: 2, CON: 0, INT: 0, WIS: 0, CHA: 2 },
    orc: { STR: 3, DEX: 0, CON: 2, INT: -1, WIS: 0, CHA: 0 },
};

export default function CharacterCreation({ onComplete }) {
    const [name, setName] = useState('');
    const [race, setRace] = useState('');
    const [charClass, setCharClass] = useState('');

    const previewStats = useMemo(() => {
        if (!race || !charClass) return null;
        const base = BASE_STATS[charClass];
        const bonus = RACE_BONUSES[race];
        return Object.fromEntries(
            Object.entries(base).map(([key, val]) => [key, val + (bonus[key] || 0)])
        );
    }, [race, charClass]);

    const isReady = name.trim() && race && charClass;

    const handleSubmit = () => {
        if (!isReady) return;
        onComplete({ name: name.trim(), race, charClass });
    };

    return (
        <>
            <div className="game-bg" />
            <div className="screen creation-screen">
                <div className="creation-container">
                    <div className="animate-slide-up" style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <h2 className="heading-lg">Forge Your Hero</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                            Choose wisely — your fate depends on it
                        </p>
                    </div>

                    {/* Name */}
                    <div className="creation-section" style={{ animationDelay: '0.1s' }}>
                        <div className="creation-section-title">Character Name</div>
                        <input
                            className="input-field"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your hero's name..."
                            maxLength={30}
                            autoFocus
                        />
                    </div>

                    {/* Race */}
                    <div className="creation-section" style={{ animationDelay: '0.2s' }}>
                        <div className="creation-section-title">Race</div>
                        <div className="selection-grid">
                            {RACES.map(r => (
                                <div
                                    key={r.id}
                                    className={`selection-card ${race === r.id ? 'selected' : ''}`}
                                    onClick={() => setRace(r.id)}
                                >
                                    <div className="selection-card-icon">{r.icon}</div>
                                    <div className="selection-card-label">{r.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                        {r.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Class */}
                    <div className="creation-section" style={{ animationDelay: '0.3s' }}>
                        <div className="creation-section-title">Class</div>
                        <div className="selection-grid">
                            {CLASSES.map(c => (
                                <div
                                    key={c.id}
                                    className={`selection-card ${charClass === c.id ? 'selected' : ''}`}
                                    onClick={() => setCharClass(c.id)}
                                >
                                    <div className="selection-card-icon">{c.icon}</div>
                                    <div className="selection-card-label">{c.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                        {c.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {previewStats && name.trim() && (
                        <div className="creation-section animate-slide-in" style={{ animationDelay: '0.1s' }}>
                            <div className="creation-section-title">Character Preview</div>
                            <div className="char-preview">
                                <div className="char-preview-icon">
                                    {CLASSES.find(c => c.id === charClass)?.icon || '⚔️'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="heading-md" style={{ fontSize: '1.1rem', marginBottom: '2px' }}>
                                        {name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {RACES.find(r => r.id === race)?.name} {CLASSES.find(c => c.id === charClass)?.name}
                                    </div>
                                    <div className="char-preview-stats">
                                        {Object.entries(previewStats).map(([key, val]) => (
                                            <div className="char-preview-stat" key={key}>
                                                <strong>{val}</strong>
                                                {key}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Start Button */}
                    <div style={{ textAlign: 'center', paddingBottom: '40px' }}>
                        <button
                            className={`btn btn-primary ${isReady ? 'animate-pulse-glow' : ''}`}
                            onClick={handleSubmit}
                            disabled={!isReady}
                            style={{
                                opacity: isReady ? 1 : 0.4,
                                padding: '14px 48px',
                            }}
                        >
                            ⚔️ Enter the Dungeon
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
