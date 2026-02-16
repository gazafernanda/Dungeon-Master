// ─── Game State Manager ───
// In-memory session store for game state, conversation history, and character tracking

import { v4 as uuidv4 } from 'uuid';
import { generateCharacterStats } from './combatEngine.js';

const sessions = new Map();
const MAX_HISTORY = 30; // Keep last N messages for AI context

/**
 * Create a new game session
 */
export function createSession(characterData) {
    const sessionId = uuidv4();
    const { name, race, charClass } = characterData;

    const charStats = generateCharacterStats(race, charClass);

    const session = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        character: {
            name,
            race,
            class: charClass,
            ...charStats,
        },
        // AI conversation memory
        messageHistory: [],
        // Summary of older events (condensed memory)
        storySummary: '',
        // Current scene context
        currentScene: {
            type: 'exploration', // exploration, combat, dialogue, rest
            description: '',
            enemies: [],
            npcs: [],
        },
        // Combat state
        combat: {
            active: false,
            enemies: [],
            turn: 'player',
            round: 1,
            log: [],
        },
        // Flags & journal for story continuity
        storyFlags: {},
        journal: [],
        // Suggested actions from AI
        suggestedActions: [],
    };

    sessions.set(sessionId, session);
    return session;
}

/**
 * Get a session by ID
 */
export function getSession(sessionId) {
    return sessions.get(sessionId) || null;
}

/**
 * Add a message to conversation history
 */
export function addMessage(sessionId, role, content) {
    const session = sessions.get(sessionId);
    if (!session) return;

    session.messageHistory.push({ role, content, timestamp: Date.now() });

    // Trim old messages but keep the story summary
    if (session.messageHistory.length > MAX_HISTORY) {
        // Take the oldest messages to summarize
        const overflow = session.messageHistory.splice(0, 10);
        const summaryText = overflow
            .filter(m => m.role === 'assistant')
            .map(m => m.content.substring(0, 150))
            .join(' | ');
        session.storySummary += '\n' + summaryText;
        // Cap summary length
        if (session.storySummary.length > 2000) {
            session.storySummary = session.storySummary.substring(session.storySummary.length - 2000);
        }
    }
}

/**
 * Get formatted message history for AI context
 */
export function getMessageHistory(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return [];
    return session.messageHistory.map(m => ({ role: m.role, content: m.content }));
}

/**
 * Update the current scene
 */
export function updateScene(sessionId, sceneData) {
    const session = sessions.get(sessionId);
    if (!session) return;
    Object.assign(session.currentScene, sceneData);
}

/**
 * Set a story flag (for the AI to remember key decisions)
 */
export function setStoryFlag(sessionId, key, value) {
    const session = sessions.get(sessionId);
    if (!session) return;
    session.storyFlags[key] = value;
}

/**
 * Add a journal entry
 */
export function addJournalEntry(sessionId, entry) {
    const session = sessions.get(sessionId);
    if (!session) return;
    session.journal.push({ text: entry, timestamp: Date.now() });
}

/**
 * Start combat
 */
export function startCombat(sessionId, enemies) {
    const session = sessions.get(sessionId);
    if (!session) return;
    session.combat = {
        active: true,
        enemies: enemies.map(e => ({ ...e, currentHP: e.maxHP })),
        turn: 'player',
        round: 1,
        log: [],
    };
    session.currentScene.type = 'combat';
}

/**
 * End combat
 */
export function endCombat(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return;
    session.combat = {
        active: false,
        enemies: [],
        turn: 'player',
        round: 1,
        log: [],
    };
    session.currentScene.type = 'exploration';
}

/**
 * Update suggested actions
 */
export function updateSuggestedActions(sessionId, actions) {
    const session = sessions.get(sessionId);
    if (!session) return;
    session.suggestedActions = actions;
}

/**
 * Get a sanitized game state to send to the client
 */
export function getClientState(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return null;

    return {
        sessionId: session.id,
        character: session.character,
        currentScene: session.currentScene,
        combat: session.combat,
        journal: session.journal.slice(-10), // Last 10 entries
        suggestedActions: session.suggestedActions,
    };
}
