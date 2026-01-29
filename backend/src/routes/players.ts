import type { Request, Response } from 'express';
import { Router } from 'express';
import type { CreatePlayerInput } from '../dto/players';
import { InMemoryPlayersRepository } from '../repositories/InMemoryPlayersRepository';

const router = Router();
const repo = new InMemoryPlayersRepository();

router.get('/', async (_req: Request, res: Response) => {
  const list = await repo.findAll();
  return res.json(list);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const player = await repo.findById(id);
  if (!player) return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
  return res.json(player);
});

router.post('/', async (req: Request, res: Response) => {
  const input = req.body as Partial<CreatePlayerInput>;
  const errors: string[] = [];
  if (!input.firstName || String(input.firstName).trim().length < 2) errors.push('Imię jest wymagane (min. 2 znaki).');
  if (!input.lastName || String(input.lastName).trim().length < 2) errors.push('Nazwisko jest wymagane (min. 2 znaki).');
  if (!input.dominantFootId) errors.push('dominantFootId jest wymagane.');
  if (!input.mainPositionId) errors.push('mainPositionId jest wymagane.');
  if (errors.length) return res.status(400).json({ message: 'Błędne dane wejściowe', errors });
  const created = await repo.create({
    firstName: input.firstName!.trim(),
    lastName: input.lastName!.trim(),
    birthYear: input.birthYear,
    birthDate: input.birthDate ?? null,
    dominantFootId: input.dominantFootId!,
    mainPositionId: input.mainPositionId!,
    clubId: input.clubId ?? null,
  });
  return res.status(201).json(created);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const player = await repo.findById(id);
  if (!player) return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
  const updated = await repo.update(id, req.body);
  return res.json(updated!);
});

export default router;
