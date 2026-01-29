import type { Request, Response } from 'express';
import { Router } from 'express';
import type { CreateClubInput } from '../dto/clubs';
import { InMemoryClubsRepository } from '../repositories/InMemoryClubsRepository';

const router = Router();
const repo = new InMemoryClubsRepository();

router.get('/', async (_req: Request, res: Response) => {
  const list = await repo.findAll();
  return res.json(list);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const club = await repo.findById(id);
  if (!club) return res.status(404).json({ message: 'Klub nie znaleziony' });
  return res.json(club);
});

router.post('/', async (req: Request, res: Response) => {
  const input = req.body as Partial<CreateClubInput>;
  if (!input.name || String(input.name).trim().length < 2) {
    return res.status(400).json({ message: 'Błędne dane wejściowe', errors: ['Nazwa klubu jest wymagana (min. 2 znaki).'] });
  }
  const created = await repo.create({ name: input.name.trim() });
  return res.status(201).json(created);
});

export default router;
