// ─── Game API Routes ───
import { Router } from 'express';
import {
    createSession, getSession, addMessage, getMessageHistory,
    updateScene, startCombat, endCombat, updateSuggestedActions,
    getClientState, addJournalEntry, setStoryFlag,
} from '../services/gameState.js';
import {
    resolvePlayerAttack, resolveEnemyAttack, calculateXPReward,
    checkLevelUp, useItem, roll, rollD20, abilityModifier,
} from '../services/combatEngine.js';
import {
    generateScene, narrateCombat, generateEnemy,
} from '../services/aiService.js';

const router = Router();

// ── Start a new game ──
router.post('/start', async (req, res) => {
    try {
        const { name, race, charClass } = req.body;
        if (!name || !race || !charClass) {
            return res.status(400).json({ error: 'name, race, and charClass are required' });
        }

        const session = createSession({ name, race, charClass });
        const sessionId = session.id;

        // Generate opening scene
        const openingPrompt = `A new adventure begins! The player is ${name}, a ${race} ${charClass}. They stand at the entrance of the Whispering Depths, an ancient dungeon rumored to hold untold treasures and unspeakable horrors. Set the scene dramatically and present their first choices.`;

        const scene = await generateScene(session, openingPrompt, []);

        addMessage(sessionId, 'user', openingPrompt);
        addMessage(sessionId, 'assistant', scene.narrative);
        updateScene(sessionId, { description: scene.narrative, type: scene.sceneType || 'exploration' });
        updateSuggestedActions(sessionId, scene.suggestedActions || []);
        addJournalEntry(sessionId, `Adventure began at the Whispering Depths.`);

        const state = getClientState(sessionId);
        res.json({
            ...state,
            narrative: scene.narrative,
            suggestedActions: scene.suggestedActions || [],
            mood: scene.mood || 'mysterious',
        });
    } catch (error) {
        console.error('Start game error:', error);
        res.status(500).json({ error: 'Failed to start game' });
    }
});

// ── Player action (exploration / dialogue) ──
router.post('/action', async (req, res) => {
    try {
        const { sessionId, action } = req.body;
        if (!sessionId || !action) {
            return res.status(400).json({ error: 'sessionId and action are required' });
        }

        const session = getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const history = getMessageHistory(sessionId);
        const scene = await generateScene(session, action, history);

        addMessage(sessionId, 'user', action);
        addMessage(sessionId, 'assistant', scene.narrative);
        updateScene(sessionId, { description: scene.narrative, type: scene.sceneType || 'exploration' });
        updateSuggestedActions(sessionId, scene.suggestedActions || []);

        // Check if AI triggered combat
        if (scene.sceneType === 'combat') {
            const enemy = await generateEnemy(session.character.level, scene.narrative);
            startCombat(sessionId, [enemy]);
            addJournalEntry(sessionId, `Encountered ${enemy.name}!`);
        }

        const state = getClientState(sessionId);
        res.json({
            ...state,
            narrative: scene.narrative,
            suggestedActions: scene.suggestedActions || [],
            mood: scene.mood || 'mysterious',
        });
    } catch (error) {
        console.error('Action error:', error);
        res.status(500).json({ error: 'Failed to process action' });
    }
});

// ── Combat action ──
router.post('/combat', async (req, res) => {
    try {
        const { sessionId, action } = req.body;
        if (!sessionId || !action) {
            return res.status(400).json({ error: 'sessionId and action are required' });
        }

        const session = getSession(sessionId);
        if (!session || !session.combat.active) {
            return res.status(400).json({ error: 'No active combat session' });
        }

        const character = session.character;
        const enemy = session.combat.enemies[0];
        let combatLog = [];
        let combatEnded = false;
        let victory = false;
        let fled = false;

        switch (action.toLowerCase()) {
            case 'attack': {
                // Player attacks
                const playerResult = resolvePlayerAttack(character, enemy);
                combatLog.push({ actor: 'player', ...playerResult });

                if (playerResult.hit) {
                    enemy.currentHP -= playerResult.damage;
                }

                // Check if enemy is defeated
                if (enemy.currentHP <= 0) {
                    combatEnded = true;
                    victory = true;
                    const xp = enemy.xpReward || calculateXPReward(enemy);
                    character.xp += xp;

                    // Loot
                    if (enemy.loot) {
                        enemy.loot.forEach(item => {
                            character.inventory.push({ ...item, quantity: 1 });
                        });
                    }

                    const levelResult = checkLevelUp(character);
                    combatLog.push({ actor: 'system', message: `${enemy.name} defeated! Gained ${xp} XP.${levelResult.leveledUp ? ` LEVEL UP! Now level ${levelResult.newLevel}!` : ''}` });

                    endCombat(sessionId);
                    addJournalEntry(sessionId, `Defeated ${enemy.name} and gained ${xp} XP.`);
                } else {
                    // Enemy counter-attacks
                    const enemyResult = resolveEnemyAttack(enemy, character);
                    combatLog.push({ actor: 'enemy', ...enemyResult });

                    if (enemyResult.hit) {
                        character.currentHP -= enemyResult.damage;
                    }

                    if (character.currentHP <= 0) {
                        character.currentHP = 0;
                        combatEnded = true;
                        combatLog.push({ actor: 'system', message: 'You have fallen in battle...' });
                    }

                    session.combat.round += 1;
                }
                break;
            }

            case 'defend': {
                // Player defends - halves incoming damage
                const enemyResult = resolveEnemyAttack(enemy, character);
                combatLog.push({ actor: 'player', message: 'You raise your guard and brace for impact.' });

                if (enemyResult.hit) {
                    const reducedDamage = Math.max(1, Math.floor(enemyResult.damage / 2));
                    character.currentHP -= reducedDamage;
                    combatLog.push({ actor: 'enemy', ...enemyResult, damage: reducedDamage, message: `${enemyResult.message} (Reduced to ${reducedDamage} by your guard!)` });
                } else {
                    combatLog.push({ actor: 'enemy', ...enemyResult });
                }

                if (character.currentHP <= 0) {
                    character.currentHP = 0;
                    combatEnded = true;
                    combatLog.push({ actor: 'system', message: 'You have fallen in battle...' });
                }

                session.combat.round += 1;
                break;
            }

            case 'spell': {
                if (character.currentMP < 3) {
                    combatLog.push({ actor: 'system', message: 'Not enough MP to cast a spell!' });
                } else {
                    character.currentMP -= 3;
                    const intMod = abilityModifier(character.stats.INT);
                    const wisMod = abilityModifier(character.stats.WIS);
                    const spellMod = Math.max(intMod, wisMod);
                    const spellDamage = roll(2, 6).total + spellMod;

                    enemy.currentHP -= spellDamage;
                    combatLog.push({ actor: 'player', hit: true, damage: spellDamage, message: `You channel arcane energy and blast the enemy for ${spellDamage} damage!` });

                    if (enemy.currentHP <= 0) {
                        combatEnded = true;
                        victory = true;
                        const xp = enemy.xpReward || calculateXPReward(enemy);
                        character.xp += xp;
                        if (enemy.loot) {
                            enemy.loot.forEach(item => character.inventory.push({ ...item, quantity: 1 }));
                        }
                        const levelResult = checkLevelUp(character);
                        combatLog.push({ actor: 'system', message: `${enemy.name} defeated! Gained ${xp} XP.${levelResult.leveledUp ? ` LEVEL UP! Now level ${levelResult.newLevel}!` : ''}` });
                        endCombat(sessionId);
                        addJournalEntry(sessionId, `Defeated ${enemy.name} with magic.`);
                    } else {
                        const enemyResult = resolveEnemyAttack(enemy, character);
                        combatLog.push({ actor: 'enemy', ...enemyResult });
                        if (enemyResult.hit) character.currentHP -= enemyResult.damage;
                        if (character.currentHP <= 0) {
                            character.currentHP = 0;
                            combatEnded = true;
                            combatLog.push({ actor: 'system', message: 'You have fallen in battle...' });
                        }
                        session.combat.round += 1;
                    }
                }
                break;
            }

            case 'item': {
                const itemResult = useItem(character, 'Health Potion');
                combatLog.push({ actor: 'player', message: itemResult.message });

                // Enemy still attacks
                const enemyResult = resolveEnemyAttack(enemy, character);
                combatLog.push({ actor: 'enemy', ...enemyResult });
                if (enemyResult.hit) character.currentHP -= enemyResult.damage;
                if (character.currentHP <= 0) {
                    character.currentHP = 0;
                    combatEnded = true;
                    combatLog.push({ actor: 'system', message: 'You have fallen in battle...' });
                }
                session.combat.round += 1;
                break;
            }

            case 'flee': {
                // DEX check to flee
                const dexCheck = rollD20() + abilityModifier(character.stats.DEX);
                if (dexCheck >= 12) {
                    fled = true;
                    combatEnded = true;
                    endCombat(sessionId);
                    combatLog.push({ actor: 'system', message: 'You manage to escape!' });
                    addJournalEntry(sessionId, `Fled from ${enemy.name}.`);
                } else {
                    combatLog.push({ actor: 'system', message: 'You fail to escape!' });
                    const enemyResult = resolveEnemyAttack(enemy, character);
                    combatLog.push({ actor: 'enemy', ...enemyResult });
                    if (enemyResult.hit) character.currentHP -= enemyResult.damage;
                    if (character.currentHP <= 0) {
                        character.currentHP = 0;
                        combatEnded = true;
                        combatLog.push({ actor: 'system', message: 'You have fallen in battle...' });
                    }
                    session.combat.round += 1;
                }
                break;
            }

            default:
                combatLog.push({ actor: 'system', message: 'Unknown action. Use: attack, defend, spell, item, or flee.' });
        }

        // Get AI narration for combat
        const history = getMessageHistory(sessionId);
        const narration = await narrateCombat(session, action, combatLog[0] || { message: '' }, history);
        addMessage(sessionId, 'user', `[COMBAT] ${action}`);
        addMessage(sessionId, 'assistant', narration.narrative);

        const state = getClientState(sessionId);
        res.json({
            ...state,
            combatLog,
            narrative: narration.narrative,
            combatEnded,
            victory,
            fled,
            playerDead: character.currentHP <= 0,
            mood: narration.mood || 'dangerous',
        });
    } catch (error) {
        console.error('Combat error:', error);
        res.status(500).json({ error: 'Failed to process combat action' });
    }
});

// ── Get game state ──
router.get('/state/:sessionId', (req, res) => {
    const state = getClientState(req.params.sessionId);
    if (!state) {
        return res.status(404).json({ error: 'Session not found' });
    }
    res.json(state);
});

export default router;
