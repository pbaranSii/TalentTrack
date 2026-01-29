import type { Request, Response } from 'express';
import { Router } from 'express';
import type { CreateInvitationInput } from '../dto/invitations';
import { InMemoryInvitationsRepository } from '../repositories/InMemoryInvitationsRepository';
import { InMemoryPlayersRepository } from '../repositories/InMemoryPlayersRepository';

const router = Router();
const repo = new InMemoryInvitationsRepository();
const playersRepo = new InMemoryPlayersRepository();

const VALID_STATUSES = ['SENT', 'ACCEPTED', 'DECLINED', 'NO_RESPONSE'];

router.get('/', async (req: Request, res: Response) => {
  const playerId = req.query.playerId as string | undefined;
  const list = playerId ? await repo.findByPlayerId(playerId) : await repo.findAll();
  return res.json(list);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const inv = await repo.findById(id);
  if (!inv) return res.status(404).json({ message: 'Zaproszenie nie znalezione' });
  return res.json(inv);
});

router.post('/', async (req: Request, res: Response) => {
  const input = req.body as Partial<CreateInvitationInput>;
  const errors: string[] = [];
  if (!input.playerId) errors.push('playerId jest wymagane.');
  if (!input.invitationDate) errors.push('Data zaproszenia jest wymagana.');
  if (!input.status || !VALID_STATUSES.includes(input.status)) {
    errors.push('status musi być SENT, ACCEPTED, DECLINED lub NO_RESPONSE.');
  }
  if (errors.length) return res.status(400).json({ message: 'Błędne dane wejściowe', errors });
  const player = await playersRepo.findById(input.playerId!);
  if (!player) return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
  const created = await repo.create({
    playerId: input.playerId!,
    invitationDate: input.invitationDate!,
    month: input.month ?? null,
    teamId: input.teamId ?? null,
    status: input.status!,
    comment: input.comment ?? null,
  });
  return res.status(201).json(created);
});

export default router;
