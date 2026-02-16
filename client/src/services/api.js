// ─── API Service ───
// Handles all communication with the backend server

const API_BASE = 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Make sure the backend is running on port 3001.');
        }
        throw error;
    }
}

export const api = {
    /** Check server health */
    health: () => request('/health'),

    /** Start a new game with character data */
    startGame: (name, race, charClass) =>
        request('/game/start', {
            method: 'POST',
            body: JSON.stringify({ name, race, charClass }),
        }),

    /** Send a player action (exploration/dialogue) */
    sendAction: (sessionId, action) =>
        request('/game/action', {
            method: 'POST',
            body: JSON.stringify({ sessionId, action }),
        }),

    /** Send a combat action (attack/defend/spell/item/flee) */
    combatAction: (sessionId, action) =>
        request('/game/combat', {
            method: 'POST',
            body: JSON.stringify({ sessionId, action }),
        }),

    /** Get current game state */
    getState: (sessionId) =>
        request(`/game/state/${sessionId}`),
};
