import { Router } from 'express';
import prisma from '../prisma/client';

import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// GET all entries
router.get('/', async (req, res) => {
  try {
    const entries = await prisma.entry.findMany();
    res.json(entries);
  } catch (error) {
    console.error('Fetch entries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new entry
router.post('/', adminMiddleware, async (req, res) => {
  const { contestId, countryCode, title, artist } = req.body || {};
  const missingFields = [];
  if (!contestId) missingFields.push('contestId');
  if (!countryCode) missingFields.push('countryCode');
  if (!title) missingFields.push('title');
  if (!artist) missingFields.push('artist');

  if (missingFields.length > 0) {
    res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
  } else {
    try {
      const entry = await prisma.entry.create({
        data: { contestId, countryCode, title, artist },
      });
      res.status(201).json(entry);
    } catch (error: any) {
      if (error.code === 'P2003' && error.meta?.constraint?.includes('contestId')) {
        res.status(400).json({ error: 'Invalid contestId: referenced contest does not exist.' });
      } else {
        console.error('Create entry error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
});

// PUT update entry by id
router.put('/:id', adminMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { contestId, countryCode, title, artist } = req.body || {};

  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid entry id' });
  } else {
    const missingFields = [];
    if (!contestId) missingFields.push('contestId');
    if (!countryCode) missingFields.push('countryCode');
    if (!title) missingFields.push('title');
    if (!artist) missingFields.push('artist');

    if (missingFields.length > 0) {
      res.status(400).json({ error: `Missing fields: ${missingFields.join(', ')}` });
    } else {
      try {
        const entry = await prisma.entry.update({
          where: { id },
          data: { contestId, countryCode, title, artist },
        });
        res.json(entry);
      } catch (error) {
        console.error('Update entry error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
});

// DELETE entry by id
router.delete('/:id', adminMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid entry id' });
  } else {
    try {
      await prisma.entry.delete({ where: { id } });
      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Entry not found' });
      } else {
        console.error('Delete entry error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
});

export default router;
