import type { Request, Response } from 'express';
import { Router } from 'express';
import { InMemoryPlayerParentsRepository } from '../repositories/InMemoryPlayerParentsRepository';
import { InMemoryPlayersRepository } from '../repositories/InMemoryPlayersRepository';
import { InMemoryPersonsRepository } from '../repositories/InMemoryPersonsRepository';

const router = Router();
const repo = new InMemoryPlayerParentsRepository();
const playersRepo = new InMemoryPlayersRepository();
const personsRepo = new InMemoryPersonsRepository();

router.get('/player/:playerId', async (req: Request, res: Response) => {
  const playerId = req.params.playerId;
  const player = await playersRepo.findById(playerId);
  if (!player) return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
  const relations = await repo.findByPlayerId(playerId);
  const persons = await Promise.all(relations.map((r) => personsRepo.findById(r.personId)));
  return res.json(persons.filter(Boolean));
});

router.post('/player/:playerId/parents', async (req: Request, res: Response) => {
  const playerId = req.params.playerId;
  const personId = req.body.personId as string | undefined;
  if (!personId) return res.status(400).json({ message: 'personId jest wymagane' });
  const player = await playersRepo.findById(playerId);
  if (!player) return res.status(404).json({ message: 'Zawodnik nie znaleziony' });
  const person = await personsRepo.findById(personId);
  if (!person) return res.status(404).json({ message: 'Osoba nie znaleziona' });
  if (person.personType !== 'PARENT') {
    return res.status(400).json({ message: 'Tylko osoba typu PARENT może być opiekunem zawodnika.' });
  }
  const relation = await repo.add(playerId, personId);
  return res.status(201).json(relation);
});

router.delete('/player/:playerId/parents/:personId', async (req: Request, res: Response) => {
  const { playerId, personId } = req.params;
  const removed = await repo.remove(playerId, personId);
  if (!removed) return res.status(404).json({ message: 'Powiązanie nie znalezione' });
  return res.status(204).send();
});

export default router;
