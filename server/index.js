// ─── Dungeon Master Server ───
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/game.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
}));
app.use(express.json());

// Routes
app.use('/api/game', gameRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'The Dungeon Master awaits...',
        aiEnabled: !!process.env.GROQ_API_KEY,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n⚔️  Dungeon Master Server running on port ${PORT}`);
    console.log(`🏰 Health: http://localhost:${PORT}/api/health`);
    console.log(`🤖 AI Mode: ${process.env.GROQ_API_KEY ? 'ENABLED (Groq - Llama 3.3 70B)' : 'MOCK MODE (no API key)'}\n`);
});
