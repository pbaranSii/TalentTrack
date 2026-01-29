import type { Request, Response } from 'express';
import { Router } from 'express';
import type { CreateObservationInput } from '../dto/observations';
import { InMemoryObservationsRepository } from '../repositories/InMemoryObservationsRepository';

const router = Router();
const repo = new InMemoryObservationsRepository();

const VALID_TYPES = ['LIVE', 'VIDEO', 'SCOUT', 'COACH'];
const VALID_GRADES = ['A', 'B', 'C', 'D'];

router.get('/', async (req: Request, res: Response) => {
  const playerId = req.query.playerId as string | undefined;
  const list = playerId ? await repo.findByPlayerId(playerId) : await repo.findAll();
  return res.json(list);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const obs = await repo.findById(id);
  if (!obs) return res.status(404).json({ message: 'Obserwacja nie znaleziona' });
  return res.json(obs);
});

router.post('/', async (req: Request, res: Response) => {
  const input = req.body as Partial<CreateObservationInput>;
  const errors: string[] = [];
  if (!input.playerId) errors.push('playerId jest wymagane.');
  if (!input.observationDate) errors.push('Data obserwacji jest wymagana.');
  if (!input.observationType || !VALID_TYPES.includes(input.observationType)) {
    errors.push('observationType musi być LIVE, VIDEO, SCOUT lub COACH.');
  }
  if (input.potentialGrade != null && !VALID_GRADES.includes(input.potentialGrade)) {
    errors.push('potentialGrade musi być A, B, C lub D.');
  }
  if (input.potentialNow != null && (input.potentialNow < 1 || input.potentialNow > 5)) {
    errors.push('potentialNow musi być 1–5.');
  }
  if (input.potentialFuture != null && (input.potentialFuture < 1 || input.potentialFuture > 5)) {
    errors.push('potentialFuture musi być 1–5.');
  }
  if (errors.length) return res.status(400).json({ message: 'Błędne dane wejściowe', errors });
  const created = await repo.create({
    playerId: input.playerId!,
    observationDate: input.observationDate!,
    observationType: input.observationType!,
    sourceId: input.sourceId ?? null,
    matchId: input.matchId ?? null,
    teamContext: input.teamContext ?? null,
    potentialGrade: input.potentialGrade ?? null,
    potentialNow: input.potentialNow ?? null,
    potentialFuture: input.potentialFuture ?? null,
    comment: input.comment ?? null,
    notes: input.notes ?? null,
    scoutId: input.scoutId ?? null,
    createdOffline: input.createdOffline ?? false,
    syncStatus: input.syncStatus ?? 'SYNCED',
  });
  return res.status(201).json(created);
});

export default router;
