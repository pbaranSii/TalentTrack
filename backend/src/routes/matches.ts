import type { Request, Response } from 'express';
import { Router } from 'express';
import type { CreateMatchInput } from '../dto/matches';
import { InMemoryMatchesRepository } from '../repositories/InMemoryMatchesRepository';

const router = Router();
const repo = new InMemoryMatchesRepository();

router.get('/', async (_req: Request, res: Response) => {
  const list = await repo.findAll();
  return res.json(list);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const match = await repo.findById(id);
  if (!match) return res.status(404).json({ message: 'Mecz nie znaleziony' });
  return res.json(match);
});

router.post('/', async (req: Request, res: Response) => {
  const input = req.body as Partial<CreateMatchInput>;
  const errors: string[] = [];
  if (!input.matchType || !['LIVE', 'VIDEO'].includes(input.matchType)) errors.push('matchType musi być LIVE lub VIDEO.');
  if (!input.date) errors.push('Data jest wymagana.');
  if (!input.location || String(input.location).trim().length < 1) errors.push('Miejsce jest wymagane.');
  if (!input.teamHome || String(input.teamHome).trim().length < 1) errors.push('Gospodarz jest wymagany.');
  if (!input.teamAway || String(input.teamAway).trim().length < 1) errors.push('Goście są wymagani.');
  if (errors.length) return res.status(400).json({ message: 'Błędne dane wejściowe', errors });
  const created = await repo.create({
    matchType: input.matchType,
    date: input.date,
    month: input.month,
    location: input.location!.trim(),
    teamHome: input.teamHome!.trim(),
    teamAway: input.teamAway!.trim(),
    categoryId: input.categoryId ?? null,
    leagueRankId: input.leagueRankId ?? null,
    result: input.result ?? null,
    notes: input.notes ?? null,
  });
  return res.status(201).json(created);
});

export default router;
