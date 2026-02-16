// ─── AI Service ───
// Groq API integration for story generation, enemy creation, and dynamic narrative

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Groq uses an OpenAI-compatible API
const groq = process.env.GROQ_API_KEY
    ? new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
    })
    : null;

const AI_MODEL = 'llama-3.3-70b-versatile';

// ── System Prompts ──

const DUNGEON_MASTER_SYSTEM = `You are an expert, dramatic, and immersive Dungeon Master for a fantasy RPG game inspired by Dungeons & Dragons.

RULES:
- Narrate scenes vividly with rich sensory details (sights, sounds, smells)
- Create compelling NPCs with distinct voices and motivations
- Present meaningful choices that affect the story
- Maintain tension, mystery, and excitement
- Remember and reference past events the player has experienced
- React dynamically to player decisions—reward creativity
- Keep responses between 100-200 words for pacing
- End each response with 2-4 suggested actions the player can take (prefixed with "►")
- When danger is near, describe it ominously to build suspense
- Track the player's character details (race, class, stats) and incorporate them naturally

FORMAT your response as JSON with this exact structure:
{
  "narrative": "The story text here...",
  "suggestedActions": ["Action 1", "Action 2", "Action 3"],
  "sceneType": "exploration|combat|dialogue|rest",
  "mood": "tense|calm|mysterious|dangerous|triumphant"
}`;

const COMBAT_SYSTEM = `You are a dramatic Dungeon Master narrating combat encounters. 

RULES:
- Describe attacks, hits, and misses with dramatic flair
- Make combat feel dangerous and exciting
- Describe enemy reactions and behaviors
- Mention the environment and how it affects combat
- Keep combat narration to 50-100 words
- If an enemy is defeated, describe their death dramatically

FORMAT your response as JSON:
{
  "narrative": "Combat description...",
  "enemyAction": "What the enemy does or intends",
  "mood": "dangerous|desperate|triumphant|tense"
}`;

const ENEMY_GENERATOR_SYSTEM = `You are a D&D monster creator. Generate an enemy appropriate for the player's level and current scene.

FORMAT your response as ONLY a JSON object (no other text):
{
  "name": "Enemy Name",
  "description": "A vivid 1-2 sentence description",
  "level": 1,
  "maxHP": 15,
  "ac": 12,
  "attackBonus": 3,
  "damageDie": 6,
  "damageBonus": 2,
  "abilities": ["ability 1", "ability 2"],
  "loot": [{"name": "item name", "type": "weapon|armor|consumable|misc", "value": 10}],
  "xpReward": 50
}`;

// ── Mock Responses (for when no API key is set) ──

const MOCK_SCENES = [
    {
        narrative: "You step into a vast underground chamber. Bioluminescent mushrooms cast an eerie blue glow across jagged stalactites. The air is thick with moisture and the distant sound of dripping water echoes through the darkness. A narrow path winds between pools of stagnant water, and you notice strange scratch marks along the stone walls—something large has been here recently.\n\nAhead, the path splits: one route leads deeper into shadow, while the other slopes upward toward a faint orange glow.",
        suggestedActions: ["Follow the path toward the orange glow", "Investigate the scratch marks on the walls", "Descend deeper into the shadows", "Search the mushroom clusters for useful ingredients"],
        sceneType: "exploration",
        mood: "mysterious",
    },
    {
        narrative: "A guttural growl reverberates through the cavern as a hulking figure emerges from behind a boulder. Matted fur, yellow eyes, and jagged claws—a Cave Troll blocks your path. It sniffs the air, catching your scent, and lets out a thunderous roar that shakes loose pebbles from the ceiling above.\n\nThe troll hefts a crude stone club and lurches toward you. There's no avoiding this fight.",
        suggestedActions: ["Draw your weapon and attack!", "Try to dodge around the troll", "Look for environmental advantages", "Attempt to intimidate the creature"],
        sceneType: "combat",
        mood: "dangerous",
    },
    {
        narrative: "Beyond the iron door, you discover a small sanctuary—a forgotten shrine dedicated to an ancient goddess of healing. Soft golden light emanates from a cracked crystal at the altar's center. Tattered prayer scrolls line the walls, and a peaceful warmth washes over you.\n\nA spectral figure materializes—an elderly priestess, translucent and serene. \"Weary traveler,\" she whispers, \"I have waited long for one to find this place. Rest here, and I shall share what knowledge I possess.\"",
        suggestedActions: ["Rest at the shrine and recover HP", "Ask the priestess about the dungeon's history", "Examine the prayer scrolls", "Offer a prayer at the altar"],
        sceneType: "dialogue",
        mood: "calm",
    },
];

const MOCK_ENEMY = {
    name: "Shadow Goblin",
    description: "A wiry, hunched creature with obsidian-black skin that seems to absorb light. Its eyes glow with a sickly green luminescence.",
    level: 1,
    maxHP: 12,
    ac: 13,
    attackBonus: 4,
    damageDie: 6,
    damageBonus: 2,
    abilities: ["Shadow Step", "Poison Dagger"],
    loot: [{ name: "Goblin Dagger", type: "weapon", value: 5 }, { name: "Shadow Dust", type: "misc", value: 15 }],
    xpReward: 35,
};

// ── Public Functions ──

/**
 * Generate a story scene based on game context
 */
export async function generateScene(gameContext, playerAction, messageHistory) {
    if (!groq) {
        // Return a mock response
        const scene = MOCK_SCENES[Math.floor(Math.random() * MOCK_SCENES.length)];
        return scene;
    }

    try {
        const messages = [
            { role: 'system', content: DUNGEON_MASTER_SYSTEM },
        ];

        // Add story summary if exists
        if (gameContext.storySummary) {
            messages.push({ role: 'system', content: `STORY SO FAR: ${gameContext.storySummary}` });
        }

        // Add character context
        const char = gameContext.character;
        messages.push({
            role: 'system',
            content: `PLAYER CHARACTER: ${char.name}, a Level ${char.level} ${char.race} ${char.class}. HP: ${char.currentHP}/${char.maxHP}, MP: ${char.currentMP}/${char.maxMP}. Stats: STR ${char.stats.STR}, DEX ${char.stats.DEX}, CON ${char.stats.CON}, INT ${char.stats.INT}, WIS ${char.stats.WIS}, CHA ${char.stats.CHA}. Inventory: ${char.inventory.map(i => i.name).join(', ')}. Gold: ${char.gold}.`
        });

        // Add story flags
        if (Object.keys(gameContext.storyFlags).length > 0) {
            messages.push({
                role: 'system',
                content: `IMPORTANT STORY EVENTS: ${JSON.stringify(gameContext.storyFlags)}`
            });
        }

        // Add conversation history
        messages.push(...messageHistory);

        // Add the player's action
        messages.push({ role: 'user', content: playerAction });

        const response = await groq.chat.completions.create({
            model: AI_MODEL,
            messages,
            temperature: 0.85,
            max_tokens: 500,
            response_format: { type: 'json_object' },
        });

        const parsed = JSON.parse(response.choices[0].message.content);
        return parsed;
    } catch (error) {
        console.error('AI scene generation error:', error.message);
        const fallback = MOCK_SCENES[0];
        fallback.narrative = "The path ahead shifts and changes... " + fallback.narrative;
        return fallback;
    }
}

/**
 * Generate combat narration
 */
export async function narrateCombat(gameContext, combatAction, combatResult, messageHistory) {
    if (!groq) {
        return {
            narrative: combatResult.message,
            enemyAction: "The enemy snarls and prepares to strike back.",
            mood: "dangerous",
        };
    }

    try {
        const char = gameContext.character;
        const enemy = gameContext.combat.enemies[0];

        const messages = [
            { role: 'system', content: COMBAT_SYSTEM },
            { role: 'system', content: `PLAYER: ${char.name} (${char.race} ${char.class}), HP: ${char.currentHP}/${char.maxHP}. ENEMY: ${enemy.name}, HP: ${enemy.currentHP}/${enemy.maxHP}.` },
            ...messageHistory.slice(-6), // Only last few messages for combat speed
            { role: 'user', content: `Player action: ${combatAction}. Result: ${combatResult.message} (Roll: ${combatResult.attackRoll}, Damage: ${combatResult.damage})` },
        ];

        const response = await groq.chat.completions.create({
            model: AI_MODEL,
            messages,
            temperature: 0.9,
            max_tokens: 200,
            response_format: { type: 'json_object' },
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('AI combat narration error:', error.message);
        return {
            narrative: combatResult.message,
            enemyAction: "The enemy readies another attack.",
            mood: "dangerous",
        };
    }
}

/**
 * Generate an enemy for the current scene
 */
export async function generateEnemy(playerLevel, sceneDescription) {
    if (!groq) {
        const enemy = { ...MOCK_ENEMY };
        enemy.maxHP = 8 + playerLevel * 5;
        enemy.level = playerLevel;
        return enemy;
    }

    try {
        const response = await groq.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: ENEMY_GENERATOR_SYSTEM },
                { role: 'user', content: `Player level: ${playerLevel}. Scene: ${sceneDescription}. Generate an appropriate enemy.` },
            ],
            temperature: 0.9,
            max_tokens: 300,
            response_format: { type: 'json_object' },
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('AI enemy generation error:', error.message);
        return { ...MOCK_ENEMY, maxHP: 8 + playerLevel * 5, level: playerLevel };
    }
}
