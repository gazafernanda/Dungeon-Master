// ─── D&D Combat Engine ───
// Dice rolling, attack resolution, damage calculation, HP tracking

/**
 * Roll a single die of the given sides
 */
export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice: e.g. roll(2, 6) = 2d6
 */
export function roll(count, sides) {
  let total = 0;
  const rolls = [];
  for (let i = 0; i < count; i++) {
    const r = rollDie(sides);
    rolls.push(r);
    total += r;
  }
  return { total, rolls };
}

/**
 * Roll a d20 for attack, skill checks, saving throws
 */
export function rollD20() {
  return rollDie(20);
}

/**
 * Calculate ability modifier from stat score (D&D formula)
 */
export function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * Base stats for each class
 */
const CLASS_BASE_STATS = {
  warrior: { STR: 16, DEX: 12, CON: 15, INT: 8, WIS: 10, CHA: 10, hitDie: 10 },
  mage:    { STR: 8,  DEX: 12, CON: 10, INT: 16, WIS: 14, CHA: 10, hitDie: 6  },
  rogue:   { STR: 10, DEX: 16, CON: 12, INT: 13, WIS: 10, CHA: 14, hitDie: 8  },
  cleric:  { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 16, CHA: 13, hitDie: 8  },
  ranger:  { STR: 13, DEX: 15, CON: 12, INT: 10, WIS: 14, CHA: 10, hitDie: 10 },
};

/**
 * Racial stat bonuses
 */
const RACE_BONUSES = {
  human:    { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
  elf:      { STR: 0, DEX: 2, CON: 0, INT: 1, WIS: 0, CHA: 0 },
  dwarf:    { STR: 2, DEX: 0, CON: 2, INT: 0, WIS: 0, CHA: 0 },
  halfling: { STR: 0, DEX: 2, CON: 0, INT: 0, WIS: 0, CHA: 2 },
  orc:      { STR: 3, DEX: 0, CON: 2, INT: -1, WIS: 0, CHA: 0 },
};

/**
 * Generate character stats from race + class selection
 */
export function generateCharacterStats(race, charClass) {
  const base = CLASS_BASE_STATS[charClass.toLowerCase()] || CLASS_BASE_STATS.warrior;
  const bonus = RACE_BONUSES[race.toLowerCase()] || RACE_BONUSES.human;

  const stats = {
    STR: base.STR + bonus.STR,
    DEX: base.DEX + bonus.DEX,
    CON: base.CON + bonus.CON,
    INT: base.INT + bonus.INT,
    WIS: base.WIS + bonus.WIS,
    CHA: base.CHA + bonus.CHA,
  };

  const conMod = abilityModifier(stats.CON);
  const maxHP = base.hitDie + conMod;
  const maxMP = charClass.toLowerCase() === 'mage' ? 10 + abilityModifier(stats.INT) * 2
    : charClass.toLowerCase() === 'cleric' ? 8 + abilityModifier(stats.WIS) * 2
    : 4;

  const ac = 10 + abilityModifier(stats.DEX) + (charClass.toLowerCase() === 'warrior' ? 4 : charClass.toLowerCase() === 'cleric' ? 3 : 1);

  return {
    stats,
    maxHP,
    currentHP: maxHP,
    maxMP,
    currentMP: maxMP,
    ac,
    level: 1,
    xp: 0,
    xpToNext: 100,
    gold: roll(3, 6).total * 10,
    inventory: getStartingInventory(charClass),
    hitDie: base.hitDie,
  };
}

/**
 * Starting inventory by class
 */
function getStartingInventory(charClass) {
  const inventories = {
    warrior: [
      { name: 'Longsword', type: 'weapon', damage: '1d8', equipped: true },
      { name: 'Shield', type: 'armor', acBonus: 2, equipped: true },
      { name: 'Health Potion', type: 'consumable', effect: 'heal', value: 10, quantity: 2 },
    ],
    mage: [
      { name: 'Staff', type: 'weapon', damage: '1d6', equipped: true },
      { name: 'Spellbook', type: 'misc', equipped: true },
      { name: 'Mana Potion', type: 'consumable', effect: 'mana', value: 8, quantity: 3 },
      { name: 'Health Potion', type: 'consumable', effect: 'heal', value: 10, quantity: 1 },
    ],
    rogue: [
      { name: 'Daggers (pair)', type: 'weapon', damage: '1d4+1d4', equipped: true },
      { name: 'Lockpick Set', type: 'tool', equipped: true },
      { name: 'Health Potion', type: 'consumable', effect: 'heal', value: 10, quantity: 2 },
      { name: 'Smoke Bomb', type: 'consumable', effect: 'escape', quantity: 1 },
    ],
    cleric: [
      { name: 'Mace', type: 'weapon', damage: '1d6', equipped: true },
      { name: 'Holy Symbol', type: 'focus', equipped: true },
      { name: 'Health Potion', type: 'consumable', effect: 'heal', value: 10, quantity: 3 },
    ],
    ranger: [
      { name: 'Longbow', type: 'weapon', damage: '1d8', equipped: true },
      { name: 'Short Sword', type: 'weapon', damage: '1d6', equipped: false },
      { name: 'Health Potion', type: 'consumable', effect: 'heal', value: 10, quantity: 2 },
    ],
  };
  return inventories[charClass.toLowerCase()] || inventories.warrior;
}

/**
 * Resolve a player attack against an enemy
 */
export function resolvePlayerAttack(character, enemy) {
  const attackRoll = rollD20();
  const strMod = abilityModifier(character.stats.STR);
  const dexMod = abilityModifier(character.stats.DEX);
  
  // Use higher of STR or DEX
  const attackMod = Math.max(strMod, dexMod);
  const totalAttack = attackRoll + attackMod;
  
  const isCrit = attackRoll === 20;
  const isMiss = attackRoll === 1;

  if (isMiss) {
    return { hit: false, critical: false, fumble: true, attackRoll, totalAttack, damage: 0, message: 'Critical fumble! Your attack goes wildly astray!' };
  }

  if (isCrit || totalAttack >= enemy.ac) {
    // Determine damage from weapon
    let damageRoll = roll(1, 8); // Default 1d8
    let damage = damageRoll.total + attackMod;
    if (isCrit) damage *= 2;
    damage = Math.max(1, damage);
    
    return { hit: true, critical: isCrit, fumble: false, attackRoll, totalAttack, damage, message: isCrit ? `CRITICAL HIT! You deal ${damage} damage!` : `Hit! You deal ${damage} damage.` };
  }

  return { hit: false, critical: false, fumble: false, attackRoll, totalAttack, damage: 0, message: `Miss! Your attack roll of ${totalAttack} doesn't beat AC ${enemy.ac}.` };
}

/**
 * Resolve an enemy attack against the player
 */
export function resolveEnemyAttack(enemy, character) {
  const attackRoll = rollD20();
  const totalAttack = attackRoll + (enemy.attackBonus || 3);
  
  const isCrit = attackRoll === 20;
  const isMiss = attackRoll === 1;

  if (isMiss) {
    return { hit: false, critical: false, attackRoll, damage: 0, message: `${enemy.name} fumbles!` };
  }

  if (isCrit || totalAttack >= character.ac) {
    let damage = roll(1, enemy.damageDie || 6).total + (enemy.damageBonus || 2);
    if (isCrit) damage *= 2;
    damage = Math.max(1, damage);
    
    return { hit: true, critical: isCrit, attackRoll, damage, message: isCrit ? `CRITICAL! ${enemy.name} hits for ${damage} damage!` : `${enemy.name} hits for ${damage} damage.` };
  }

  return { hit: false, critical: false, attackRoll, damage: 0, message: `${enemy.name} misses!` };
}

/**
 * Calculate XP reward for defeating an enemy
 */
export function calculateXPReward(enemy) {
  const baseXP = (enemy.level || 1) * 25;
  return baseXP + (enemy.maxHP || 10);
}

/**
 * Check for level up and apply if earned
 */
export function checkLevelUp(character) {
  if (character.xp >= character.xpToNext) {
    character.level += 1;
    character.xp -= character.xpToNext;
    character.xpToNext = Math.floor(character.xpToNext * 1.5);
    
    // HP increase
    const conMod = abilityModifier(character.stats.CON);
    const hpGain = roll(1, character.hitDie || 8).total + conMod;
    character.maxHP += Math.max(1, hpGain);
    character.currentHP = character.maxHP;
    
    // MP increase for casters
    character.maxMP += 2;
    character.currentMP = character.maxMP;

    return { leveledUp: true, newLevel: character.level, hpGain: Math.max(1, hpGain) };
  }
  return { leveledUp: false };
}

/**
 * Use a consumable item
 */
export function useItem(character, itemName) {
  const itemIndex = character.inventory.findIndex(
    i => i.name.toLowerCase() === itemName.toLowerCase() && i.type === 'consumable' && (i.quantity || 0) > 0
  );
  
  if (itemIndex === -1) {
    return { success: false, message: `You don't have any ${itemName} to use.` };
  }

  const item = character.inventory[itemIndex];
  let message = '';
  
  if (item.effect === 'heal') {
    const healed = Math.min(item.value, character.maxHP - character.currentHP);
    character.currentHP += healed;
    message = `You use ${item.name} and recover ${healed} HP! (${character.currentHP}/${character.maxHP})`;
  } else if (item.effect === 'mana') {
    const restored = Math.min(item.value, character.maxMP - character.currentMP);
    character.currentMP += restored;
    message = `You use ${item.name} and recover ${restored} MP! (${character.currentMP}/${character.maxMP})`;
  } else {
    message = `You use ${item.name}.`;
  }

  item.quantity -= 1;
  if (item.quantity <= 0) {
    character.inventory.splice(itemIndex, 1);
  }

  return { success: true, message };
}
