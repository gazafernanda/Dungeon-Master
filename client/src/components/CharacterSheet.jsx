export default function CharacterSheet({ character }) {
    if (!character) return null;

    const { name, race, class: charClass, level, xp, xpToNext, stats, currentHP, maxHP, currentMP, maxMP, ac, gold, inventory } = character;

    return (
        <div className="game-sidebar">
            {/* Character Identity */}
            <div className="sidebar-section">
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '4px' }}>
                        {getClassIcon(charClass)}
                    </div>
                    <div className="heading-md" style={{ fontSize: '1rem' }}>{name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {race} {charClass}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', marginTop: '4px' }}>
                        Level {level}
                    </div>
                </div>

                {/* XP Bar */}
                <div style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '3px' }}>
                        <span>XP</span>
                        <span>{xp} / {xpToNext}</span>
                    </div>
                    <div className="stat-bar stat-bar-xp">
                        <div className="stat-bar-fill" style={{ width: `${(xp / xpToNext) * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* HP & MP */}
            <div className="sidebar-section">
                <div className="sidebar-section-title">Vitals</div>

                <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                        <span style={{ color: 'var(--crimson-light)' }}>❤️ HP</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{currentHP} / {maxHP}</span>
                    </div>
                    <div className="stat-bar stat-bar-hp">
                        <div className="stat-bar-fill" style={{ width: `${(currentHP / maxHP) * 100}%` }} />
                    </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                        <span style={{ color: 'var(--mana-blue)' }}>🔮 MP</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{currentMP} / {maxMP}</span>
                    </div>
                    <div className="stat-bar stat-bar-mp">
                        <div className="stat-bar-fill" style={{ width: `${(currentMP / maxMP) * 100}%` }} />
                    </div>
                </div>

                <div className="stat-row">
                    <span className="stat-label">🛡️ AC</span>
                    <span className="stat-value">{ac}</span>
                </div>
            </div>

            {/* Ability Scores */}
            <div className="sidebar-section">
                <div className="sidebar-section-title">Attributes</div>
                {Object.entries(stats).map(([key, val]) => (
                    <div className="stat-row" key={key}>
                        <span className="stat-label">{getStatEmoji(key)} {key}</span>
                        <span className="stat-value">
                            {val} <span style={{ fontSize: '0.7rem', color: getModColor(val) }}>({getModifier(val)})</span>
                        </span>
                    </div>
                ))}
            </div>

            {/* Inventory */}
            <div className="sidebar-section">
                <div className="sidebar-section-title">Inventory</div>
                <div className="stat-row" style={{ marginBottom: '8px' }}>
                    <span className="stat-label">💰 Gold</span>
                    <span className="stat-value" style={{ color: 'var(--gold)' }}>{gold}</span>
                </div>
                {inventory.map((item, i) => (
                    <div className="inventory-item" key={i}>
                        <span className="inventory-item-name">
                            {getItemIcon(item.type)} {item.name}
                            {item.quantity ? ` (×${item.quantity})` : ''}
                        </span>
                        <span className="inventory-item-type">{item.type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getClassIcon(charClass) {
    const icons = {
        warrior: '⚔️',
        mage: '🧙',
        rogue: '🗡️',
        cleric: '✝️',
        ranger: '🏹',
    };
    return icons[charClass?.toLowerCase()] || '⚔️';
}

function getStatEmoji(stat) {
    const emojis = { STR: '💪', DEX: '🏃', CON: '🛡️', INT: '📖', WIS: '👁️', CHA: '✨' };
    return emojis[stat] || '';
}

function getItemIcon(type) {
    const icons = { weapon: '⚔️', armor: '🛡️', consumable: '🧪', tool: '🔧', focus: '✨', misc: '📦' };
    return icons[type] || '📦';
}

function getModifier(score) {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

function getModColor(score) {
    const mod = Math.floor((score - 10) / 2);
    if (mod >= 2) return 'var(--emerald)';
    if (mod >= 0) return 'var(--text-secondary)';
    return 'var(--crimson-light)';
}
