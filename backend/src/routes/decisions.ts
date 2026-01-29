import type { Request, Response } from 'express';
import { Router } from 'express';
import type { CreatePlayerDecisionInput } from '../dto/decisions';
import { InMemoryPlayerDecisionsRepository } from '../repositories/InMemoryPlayerDecisionsRepository';
import { InMemoryPlayersRepository } from '../repositories/InMemoryPlayersRepository';

const router = Router();
const decisionsRepo = new InMemoryPlayerDecisionsRepository();
const playersRepo = new InMemoryPlayersRepository();

const VALID_TYPES = ['SIGNED', 'RESIGNED', 'WATCH', 'REJECTED', 'INVITE_AGAIN'];

router.get('/player/:playerId', async (req: Request, res: Response) => {
  const playerId = req.params.playerId;
  const player = await playersRepo.findById(playerId);
  if (!player) return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
  const list = await decisionsRepo.findByPlayerId(playerId);
  return res.json(list);
});

router.get('/player/:playerId/latest', async (req: Request, res: Response) => {
  const playerId = req.params.playerId;
  const player = await playersRepo.findById(playerId);
  if (!player) return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
  const latest = await decisionsRepo.findLatestByPlayerId(playerId);
  return res.json(latest ?? null);
});

router.post('/', async (req: Request, res: Response) => {
  const input = req.body as Partial<CreatePlayerDecisionInput>;
  const errors: string[] = [];
  if (!input.playerId) errors.push('playerId jest wymagane.');
  if (!input.decisionType || !VALID_TYPES.includes(input.decisionType)) {
    errors.push('decisionType musi być SIGNED, RESIGNED, WATCH, REJECTED lub INVITE_AGAIN.');
  }
  if (!input.decisionDate) errors.push('Data decyzji jest wymagana.');
  if (errors.length) return res.status(400).json({ message: 'Błędne dane wejściowe', errors });
  const player = await playersRepo.findById(input.playerId!);
  if (!player) return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
  const created = await decisionsRepo.create({
    playerId: input.playerId!,
    decisionType: input.decisionType!,
    decisionDate: input.decisionDate!,
    comment: input.comment ?? null,
  });
  return res.status(201).json(created);
});

export default router;
