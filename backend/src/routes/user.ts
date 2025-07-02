import { Router } from 'express';
import prisma from '../prisma/client';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// GET all users (admin only)
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        profilePicture: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET user by id (public, limited fields)
router.get('/:id/public', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        profilePicture: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(user);
    }
  } catch (error) {
    console.error('Fetch public user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET user by id (admin or self)
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  const requestingUser = (req as any).user;
  if (!requestingUser) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Allow if admin or requesting own profile
  if (requestingUser.role !== 'admin' && requestingUser.id !== id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        profilePicture: true,
        createdAt: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(user);
    }
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update user by id (user can only edit self)
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { email, passwordHash, displayName, role, profilePicture } = req.body || {};

  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  const requestingUser = (req as any).user;
  if (!requestingUser) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Only allow if editing own profile
  if (requestingUser.id !== id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        displayName,
        // Prevent user from changing their own role
        profilePicture,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        profilePicture: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE user by id (admin or self)
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  const requestingUser = (req as any).user;
  if (!requestingUser) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Allow if admin or deleting own account
  if (requestingUser.role !== 'admin' && requestingUser.id !== id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
