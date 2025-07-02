import { Router } from 'express';
import prisma from '../prisma/client';

import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// GET all results (admin only)
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const results = await prisma.result.findMany({
      include: { entry: true, contest: false },
    });
    res.json(results);
  } catch (error) {
    console.error('Fetch all results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all results for a specific contest ID
router.get('/:id', async (req, res) => {
  const contestId = Number(req.params.id);
  if (isNaN(contestId)) {
    res.status(400).json({ error: 'Invalid contest id' });
    return;
  }
  try {
    const results = await prisma.result.findMany({
      where: { contestId },
      include: { entry: true, contest: false },
    });
    res.json(results);
  } catch (error) {
    console.error('Fetch results by contestId error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new result
router.post('/', adminMiddleware, async (req, res) => {
  const { entryId, position, contestId } = req.body || {};
  const missingFields = [];
  if (!entryId) missingFields.push('entryId');
  if (!position && position !== 0) missingFields.push('position');
  if (!contestId) missingFields.push('contestId');

  if (missingFields.length > 0) {
    res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
  } else {
    try {
      const result = await prisma.result.create({
        data: { entryId, position, contestId },
      });
      res.status(201).json(result);
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('Result_entryId_key')) {
        res.status(409).json({ error: 'A result for this entry already exists.' });
      } else if (error.code === 'P2003' && error.meta?.constraint?.includes('entryId')) {
        res.status(400).json({ error: 'Invalid entryId: referenced entry does not exist.' });
      } else {
        console.error('Create result error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
});

// PUT update result by id
router.put('/:id', adminMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { entryId, position, contestId } = req.body || {};

  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid result id' });
  } else {
    const missingFields = [];
    if (!entryId) missingFields.push('entryId');
    if (!position && position !== 0) missingFields.push('position');
    if (!contestId) missingFields.push('contestId');

    if (missingFields.length > 0) {
      res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
    } else {
      try {
        const result = await prisma.result.update({
          where: { id },
          data: { entryId, position, contestId },
        });
        res.json(result);
      } catch (error) {
        console.error('Update result error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
});

// DELETE result by id
router.delete('/:id', adminMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid result id' });
  } else {
    try {
      await prisma.result.delete({ where: { id } });
      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Result not found' });
      } else {
        console.error('Delete result error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
});

export default router;
