import { Router } from 'express';
import prisma from '../prisma/client';

import { adminMiddleware } from '../middlewares/adminMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// GET all contests (only for authenticated users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const contests = await prisma.contest.findMany();
    res.json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE a new contest (admin only)
router.post('/', adminMiddleware, async (req, res) => {
  const { year, hostCountryCode, submissionDeadline } = req.body || {};

  if (!year || !hostCountryCode || !submissionDeadline) {
    const missing = [];
    if (!year) missing.push('year');
    if (!hostCountryCode) missing.push('hostCountryCode');
    if (!submissionDeadline) missing.push('submissionDeadline');
    res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
    return;
  }

  try {
    // Adjusted to query by `year` if it's unique, otherwise use `id`
    const existing = await prisma.contest.findFirst({ where: { year } });
    if (existing) {
      res.status(400).json({ error: `Contest for year ${year} already exists` });
    } else {
      const contest = await prisma.contest.create({
        data: { year, hostCountryCode, submissionDeadline },
      });
      res.status(201).json(contest);
    }
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE a contest (admin only)
router.put('/:id', adminMiddleware, async (req, res) => {
  const contestId = parseInt(req.params.id);
  const { hostCountryCode } = req.body || {};

  try {
    const contest = await prisma.contest.update({
      where: { id: contestId },
      data: { hostCountryCode },
    });
    res.json(contest);
  } catch (error) {
    console.error('Error updating contest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a contest (admin only)
router.delete('/:id', adminMiddleware, async (req, res) => {
  const contestId = parseInt(req.params.id);

  try {
    await prisma.contest.delete({ where: { id: contestId } });
    res.status(204).end();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Contest not found' });
    } else {
      console.error('Error deleting contest:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
