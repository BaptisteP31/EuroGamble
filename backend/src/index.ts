import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// ROUTES
import authRoutes from './routes/auth';
import entriesRouter from './routes/entry';

// MIDDLEWARES
import { authMiddleware } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/entries', authMiddleware, entriesRouter);

// /ping route
app.get('/ping', (_, res) => {
  res.json({ message: 'pong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
