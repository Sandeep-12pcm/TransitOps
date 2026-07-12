import { prisma } from '../db.js';
import { mapExpenseToFrontend, mapExpenseToDb } from '../src/utils/mappers.js';

export const getExpenses = async (req, res) => {
  try {
    const list = await prisma.expense.findMany({
      include: {
        vehicle: true
      },
      orderBy: { date: 'desc' }
    });
    return res.status(200).json(list.map(mapExpenseToFrontend));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const data = mapExpenseToDb(req.body);
    if (!data.vehicleId || !data.category || !data.date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (data.amount <= 0) {
      return res.status(400).json({ error: 'Expense amount must be greater than 0.' });
    }

    const created = await prisma.expense.create({ data });
    return res.status(201).json(mapExpenseToFrontend(created));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({
      where: { id: parseInt(id) }
    });
    return res.status(200).json({ success: true, message: 'Expense record deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
