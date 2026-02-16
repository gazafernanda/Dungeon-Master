import { useState, useRef, useEffect } from 'react';

export default function ActionInput({ suggestedActions, onAction, isLoading, disabled }) {
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (!isLoading && !disabled && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isLoading, disabled]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading || disabled) return;
        onAction(input.trim());
        setInput('');
    };

    const handleSuggestion = (action) => {
        if (isLoading || disabled) return;
        onAction(action);
    };

    return (
        <div className="game-actions">
            {/* Suggested Actions */}
            {suggestedActions && suggestedActions.length > 0 && (
                <div className="action-suggestions">
                    {suggestedActions.map((action, i) => (
                        <button
                            key={i}
                            className="action-btn animate-slide-in"
                            style={{ animationDelay: `${i * 0.08}s` }}
                            onClick={() => handleSuggestion(action)}
                            disabled={isLoading || disabled}
                        >
                            ► {action}
                        </button>
                    ))}
                </div>
            )}

            {/* Free-text Input */}
            <form onSubmit={handleSubmit} className="action-input-row">
                <input
                    ref={inputRef}
                    className="input-field"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isLoading ? 'Awaiting the Dungeon Master...' : 'What do you do? (type your action)'}
                    disabled={isLoading || disabled}
                />
                <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isLoading || disabled || !input.trim()}
                    style={{ whiteSpace: 'nowrap' }}
                >
                    {isLoading ? '...' : '⚔️ Act'}
                </button>
            </form>
        </div>
    );
}
