import { prisma } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

function signToken(user) {
  const secret = process.env.JWT_SECRET || 'transitops_jwt_secret_key';
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role.name.toLowerCase() },
    secret,
    { expiresIn: '24h' }
  );
}

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Find Role
    let rawRole = role || 'driver';
    // Map driver/fleet_manager to uppercase with underscores
    let dbRoleName = rawRole.toUpperCase().replace(' ', '_');
    
    const dbRole = await prisma.role.findUnique({ where: { name: dbRoleName } });
    if (!dbRole) {
      return res.status(400).json({ message: `Role ${dbRoleName} does not exist.` });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashed,
        roleId: dbRole.id
      },
      include: { role: true }
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name.toLowerCase() }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    // Try bcrypt compare
    // Note: If seeded passwords are plain strings, they must be hashed. We will hash them during seeding.
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name.toLowerCase() }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/profile
export const profile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name.toLowerCase(),
      createdAt: user.createdAt
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
