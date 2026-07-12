import { prisma } from '../db.js';
import { mapDriverToFrontend, mapDriverToDb } from '../src/utils/mappers.js';

export const getDrivers = async (req, res) => {
  try {
    const list = await prisma.driver.findMany({
      orderBy: { name: 'asc' }
    });
    return res.status(200).json(list.map(mapDriverToFrontend));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createDriver = async (req, res) => {
  try {
    const data = mapDriverToDb(req.body);
    if (!data.name || !data.licenseNumber || !data.licenseCategory || !data.licenseExpiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (data.name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }

    const contactRegex = /^[6-9]\d{9}$/;
    if (data.contactNumber && !contactRegex.test(data.contactNumber)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit contact number.' });
    }

    const licenseRegex = /^[A-Z0-9 -]{5,20}$/i;
    if (!licenseRegex.test(data.licenseNumber)) {
      return res.status(400).json({ error: 'Invalid license number. Must be between 5 and 20 alphanumeric characters.' });
    }

    if (data.safetyScore !== undefined && (data.safetyScore < 0 || data.safetyScore > 100)) {
      return res.status(400).json({ error: 'Safety score must be between 0 and 100.' });
    }

    // Unique check
    const duplicate = await prisma.driver.findUnique({
      where: { licenseNumber: data.licenseNumber }
    });
    if (duplicate) {
      return res.status(400).json({ error: 'License number already exists' });
    }

    const created = await prisma.driver.create({ data });
    return res.status(201).json(mapDriverToFrontend(created));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const data = mapDriverToDb(req.body);

    if (data.name !== undefined && data.name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }

    const contactRegex = /^[6-9]\d{9}$/;
    if (data.contactNumber !== undefined && !contactRegex.test(data.contactNumber)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit contact number.' });
    }

    if (data.licenseNumber !== undefined) {
      const licenseRegex = /^[A-Z0-9 -]{5,20}$/i;
      if (!licenseRegex.test(data.licenseNumber)) {
        return res.status(400).json({ error: 'Invalid license number. Must be between 5 and 20 alphanumeric characters.' });
      }
    }

    if (data.safetyScore !== undefined && (data.safetyScore < 0 || data.safetyScore > 100)) {
      return res.status(400).json({ error: 'Safety score must be between 0 and 100.' });
    }

    if (data.licenseNumber) {
      const duplicate = await prisma.driver.findFirst({
        where: {
          licenseNumber: data.licenseNumber,
          NOT: { id: parseInt(id) }
        }
      });
      if (duplicate) {
        return res.status(400).json({ error: 'License number already exists' });
      }
    }

    const updated = await prisma.driver.update({
      where: { id: parseInt(id) },
      data
    });
    return res.status(200).json(mapDriverToFrontend(updated));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.driver.delete({
      where: { id: parseInt(id) }
    });
    return res.status(200).json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    if (error.code === 'P2003' || error.message.includes('foreign key constraint') || error.message.includes('violates RESTRICT')) {
      return res.status(400).json({ error: 'Cannot delete driver: They have associated trips in the system.' });
    }
    return res.status(500).json({ error: error.message });
  }
};
