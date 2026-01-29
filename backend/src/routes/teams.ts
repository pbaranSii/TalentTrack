import type { Request, Response } from 'express';
import { Router } from 'express';
import type { CreateTeamInput } from '../dto/teams';
import { InMemoryTeamsRepository } from '../repositories/InMemoryTeamsRepository';

const router = Router();
const repo = new InMemoryTeamsRepository();

router.get('/', async (req: Request, res: Response) => {
  const clubId = req.query.clubId as string | undefined;
  const list = clubId ? await repo.findByClubId(clubId) : await repo.findAll();
  return res.json(list);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const team = await repo.findById(id);
  if (!team) return res.status(404).json({ message: 'Drużyna nie znaleziona' });
  return res.json(team);
});

router.post('/', async (req: Request, res: Response) => {
  const input = req.body as Partial<CreateTeamInput>;
  const errors: string[] = [];
  if (!input.clubId) errors.push('clubId jest wymagane.');
  if (!input.name || String(input.name).trim().length < 2) errors.push('Nazwa drużyny jest wymagana (min. 2 znaki).');
  if (errors.length) return res.status(400).json({ message: 'Błędne dane wejściowe', errors });
  const created = await repo.create({
    clubId: input.clubId!,
    name: input.name!.trim(),
    categoryId: input.categoryId ?? null,
  });
  return res.status(201).json(created);
});

export default router;
