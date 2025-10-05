import { Router } from 'express';
import prisma from '../prisma/client';

import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// GET all predictions for the authenticated user
router.get('/', async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const predictions = await prisma.prediction.findMany({
      where: { userId },
    });
    res.status(200).json(predictions);
  } catch (error) {
    console.error('Fetch predictions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new prediction
router.post('/', async (req, res) => {
  const userId = (req as any).user?.id;
  const { contestId, entryId, position } = req.body || {};
  const missingFields = [];
  if (!userId) missingFields.push('userId');
  if (!contestId) missingFields.push('contestId');
  if (!entryId) missingFields.push('entryId');
  if (typeof position !== 'number') missingFields.push('position');

  if (missingFields.length > 0) {
    res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
  } else {
    try {
      // Use upsert to replace an existing prediction if it exists
      const prediction = await prisma.prediction.upsert({
        where: {
          // Assumes a composite unique constraint on (userId, contestId, entryId)
          userId_contestId_entryId: { userId, contestId, entryId },
        },
        update: { position },
        create: { userId, contestId, entryId, position },
      });
      res.status(200).json(prediction);
    } catch (error: any) {
      if (error.code === 'P2003' && error.meta?.field_name?.includes('contestId')) {
        res.status(400).json({ error: 'Invalid contestId: referenced contest does not exist.' });
      } else {
        console.error('Upsert prediction error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
});

// PUT update prediction by id
router.put('/:id', async (req, res) => {
  const id = (req.params.id);
  const userId = (req as any).user?.id;
  const { contestId, entryId, position } = req.body || {};

  if (!id) {
    res.status(400).json({ error: 'Invalid prediction id' });
  } else {
    const missingFields = [];
    if (!userId) missingFields.push('userId');
    if (!contestId) missingFields.push('contestId');
    if (!entryId) missingFields.push('entryId');
    if (typeof position !== 'number') missingFields.push('position');

    if (missingFields.length > 0) {
      res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
    } else {
      try {
        const prediction = await prisma.prediction.update({
          where: { id },
          data: { userId, contestId, entryId, position },
        });
        res.json(prediction);
      } catch (error: any) {
        if (error.code === 'P2025') {
          res.status(404).json({ error: 'Prediction not found' });
        } else if (error.code === 'P2002') {
          res.status(409).json({ error: 'Prediction for this user, contest, and entry already exists.' });
        } else {
          console.error('Update prediction error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    }
  }
});

// DELETE prediction by id
router.delete('/:id', adminMiddleware, async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ error: 'Invalid prediction id' });
  } else {
    try {
      await prisma.prediction.delete({ where: { id } });
      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Prediction not found' });
      } else {
        console.error('Delete prediction error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
});

export default router;
