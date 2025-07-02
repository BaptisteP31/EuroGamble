import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// ROUTES
import authRoutes from './routes/auth';
import entriesRouter from './routes/entry';
import contestRouter from './routes/contest';
import userRouter from './routes/user';
import resultRouter from './routes/result';

// MIDDLEWARES
import { authMiddleware } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/entry', authMiddleware, entriesRouter);
app.use('/contest', authMiddleware, contestRouter);
app.use('/user', authMiddleware, userRouter);
app.use('/result', authMiddleware, resultRouter);

// /ping route
app.get('/ping', (_, res) => {
  res.json({ message: 'pong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
