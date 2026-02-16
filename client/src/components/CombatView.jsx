export default function CombatView({ combat, onAction, isLoading, combatLog }) {
    if (!combat || !combat.active || !combat.enemies?.length) return null;

    const enemy = combat.enemies[0];

    return (
        <div className="animate-slide-in">
            {/* Enemy Card */}
            <div className="enemy-card">
                <div className="enemy-card-header">
                    <span className="enemy-name">⚔️ {enemy.name}</span>
                    <span className="enemy-level">LVL {enemy.level || 1}</span>
                </div>

                {enemy.description && (
                    <div className="enemy-description">{enemy.description}</div>
                )}

                {/* Enemy HP Bar */}
                <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                        <span style={{ color: 'var(--crimson-light)' }}>HP</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                            {Math.max(0, enemy.currentHP)} / {enemy.maxHP}
                        </span>
                    </div>
                    <div className="stat-bar stat-bar-hp">
                        <div
                            className="stat-bar-fill"
                            style={{ width: `${Math.max(0, (enemy.currentHP / enemy.maxHP)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Enemy Stats */}
                <div className="enemy-stats-row">
                    <span className="enemy-stat">AC: <strong>{enemy.ac}</strong></span>
                    <span className="enemy-stat">ATK: <strong>+{enemy.attackBonus}</strong></span>
                    <span className="enemy-stat">DMG: <strong>1d{enemy.damageDie}+{enemy.damageBonus}</strong></span>
                </div>

                {enemy.abilities && enemy.abilities.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--purple-light)' }}>
                        ✦ {enemy.abilities.join(' • ')}
                    </div>
                )}
            </div>

            {/* Combat Log */}
            {combatLog && combatLog.length > 0 && (
                <div style={{ marginBottom: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                    {combatLog.map((entry, i) => (
                        <div key={i} className={`combat-log-entry ${entry.actor}`}>
                            {entry.message}
                        </div>
                    ))}
                </div>
            )}

            {/* Combat Actions */}
            <div className="combat-actions">
                <button
                    className="combat-btn attack"
                    onClick={() => onAction('attack')}
                    disabled={isLoading}
                >
                    <span className="combat-btn-icon">⚔️</span>
                    Attack
                </button>
                <button
                    className="combat-btn defend"
                    onClick={() => onAction('defend')}
                    disabled={isLoading}
                >
                    <span className="combat-btn-icon">🛡️</span>
                    Defend
                </button>
                <button
                    className="combat-btn spell"
                    onClick={() => onAction('spell')}
                    disabled={isLoading}
                >
                    <span className="combat-btn-icon">✨</span>
                    Spell
                </button>
                <button
                    className="combat-btn item"
                    onClick={() => onAction('item')}
                    disabled={isLoading}
                >
                    <span className="combat-btn-icon">🧪</span>
                    Item
                </button>
                <button
                    className="combat-btn flee"
                    onClick={() => onAction('flee')}
                    disabled={isLoading}
                >
                    <span className="combat-btn-icon">🏃</span>
                    Flee
                </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                Round {combat.round}
            </div>
        </div>
    );
}
