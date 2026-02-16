# ⚔️ Dungeon Master — AI-Powered RPG

A text-based RPG inspired by **Dungeons & Dragons**, powered by **Groq AI** (Llama 3.3 70B). The AI acts as your Dungeon Master — generating story scenes, creating enemies, reacting to your decisions, and remembering your past actions.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

- 🏰 **AI Dungeon Master** — Dynamic story narration with rich sensory detail
- 🧝 **Character Creation** — 5 races × 5 classes with D&D-style stat generation
- ⚔️ **Combat System** — D20 attack rolls, AC checks, critical hits, damage dice
- 🧠 **AI Memory** — Remembers your past decisions and weaves them into the story
- 👹 **Dynamic Enemies** — AI generates enemies with stats, abilities, and loot
- 📈 **Progression** — XP gain, level-ups, loot drops, inventory management
- 🎨 **Dark Fantasy UI** — Floating particles, typewriter narration, animated HP/MP bars
- 🛡️ **Mock Mode** — Works without an API key using built-in mock responses

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/)
- A [Groq API key](https://console.groq.com/)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/Dungeon-Master.git
cd Dungeon-Master

# Install backend
cd server
npm install

# Install frontend
cd ../client
npm install
```

### 2. Configure API Key

```bash
# In server/.env
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
```

### 3. Run

```bash
# Terminal 1 — Backend
cd server
node index.js

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser and begin your quest! 🗡️

---

## 🏗️ Architecture

```
Frontend (React + Vite)  →  Backend (Node.js + Express)  →  Groq API (Llama 3.3 70B)
     :5173                        :3001                       cloud
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/game/start` | Create new game with character |
| `POST` | `/api/game/action` | Send player action (exploration) |
| `POST` | `/api/game/combat` | Send combat action |
| `GET` | `/api/game/state/:id` | Get current game state |

---

## 🎮 How to Play

1. **Title Screen** — Click "Begin Your Quest"
2. **Character Creation** — Enter a name, pick your race and class
3. **Explore** — Read the AI narration and choose actions (click suggestions or type your own)
4. **Combat** — When enemies appear, use Attack, Defend, Spell, Item, or Flee
5. **Progress** — Gain XP, level up, collect loot, and go deeper into the dungeon

### Combat Actions

| Action | Effect |
|--------|--------|
| ⚔️ **Attack** | Roll d20 + modifier vs enemy AC |
| 🛡️ **Defend** | Halves incoming damage this round |
| ✨ **Spell** | Costs 3 MP, deals 2d6 + INT/WIS modifier |
| 🧪 **Item** | Uses a Health Potion from inventory |
| 🏃 **Flee** | DEX check (DC 12) to escape combat |

---

## 🧬 Character Options

### Races

| Race | Bonuses |
|------|---------|
| 👤 Human | +1 to all stats |
| 🧝 Elf | +2 DEX, +1 INT |
| ⛏️ Dwarf | +2 STR, +2 CON |
| 🍀 Halfling | +2 DEX, +2 CHA |
| 👹 Orc | +3 STR, +2 CON, -1 INT |

### Classes

| Class | Hit Die | Specialty |
|-------|---------|-----------|
| ⚔️ Warrior | d10 | Heavy armor, melee mastery |
| 🧙 Mage | d6 | Arcane spells, high INT |
| 🗡️ Rogue | d8 | Stealth, critical strikes |
| ✝️ Cleric | d8 | Healing, divine magic |
| 🏹 Ranger | d10 | Ranged combat, tracking |

---

## 📁 Project Structure

```
Dungeon-Master/
├── server/
│   ├── index.js                 # Express server entry point
│   ├── routes/game.js           # Game API routes
│   └── services/
│       ├── aiService.js         # Groq API integration
│       ├── gameState.js         # Session & memory management
│       └── combatEngine.js      # D&D combat mechanics
│
├── client/
│   └── src/
│       ├── App.jsx              # Screen routing
│       ├── index.css            # Dark-fantasy design system
│       ├── screens/             # Title, CharacterCreation, Game
│       ├── components/          # Narrative, Combat, CharacterSheet, ActionInput
│       ├── hooks/               # useTypewriter
│       └── services/api.js      # Backend API client
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7 |
| Backend | Node.js, Express |
| AI | Groq API, Llama 3.3 70B Versatile |
| Styling | Vanilla CSS, Google Fonts (Cinzel, Inter) |

---

<p align="center">
  <em>⚔️ May your rolls be high and your HP never reach zero. ⚔️</em>
</p>
