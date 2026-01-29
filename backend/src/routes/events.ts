import type { Request, Response } from 'express';
import { Router } from 'express';
import type { Event } from '../models';
import type { CreateEventInput } from '../dto/events';
import { InMemoryEventsRepository } from '../repositories/InMemoryEventsRepository';

const router = Router();

// In-memory store – do zastąpienia bazą danych w chmurze
const initialEvents: Event[] = [
  {
    id: 'e1',
    type: 'MATCH',
    date: new Date().toISOString().slice(0, 10),
    time: '12:00',
    location: 'Stadion Miejski',
    ageCategory: 'U13',
    homeTeam: 'FC Przykład',
    awayTeam: 'Akademia Talentów',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    type: 'TOURNAMENT',
    date: new Date().toISOString().slice(0, 10),
    location: 'Hala Sportowa',
    ageCategory: 'U11',
    homeTeam: 'Turniej Zimowy',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const eventsRepo = new InMemoryEventsRepository(initialEvents);

router.get('/', async (_req: Request, res: Response) => {
  const all = await eventsRepo.findAll();
  res.json(all);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const event = await eventsRepo.findById(id);
  if (!event) {
    return res.status(404).json({ message: 'Wydarzenie nie znalezione' });
  }
  return res.json(event);
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const input = req.body as Partial<CreateEventInput>;
    const errors: string[] = [];

    if (!input.type || (input.type !== 'MATCH' && input.type !== 'TOURNAMENT')) {
      errors.push('Typ wydarzenia jest wymagany (MATCH lub TOURNAMENT).');
    }
    if (!input.date) {
      errors.push('Data jest wymagana.');
    }
    if (!input.location) {
      errors.push('Miejsce jest wymagane.');
    }
    if (!input.ageCategory) {
      errors.push('Kategoria wiekowa jest wymagana.');
    }
    if (!input.homeTeam) {
      errors.push('Gospodarz / nazwa turnieju jest wymagana.');
    }
    if (input.type === 'MATCH' && !input.awayTeam) {
      errors.push('Dla meczu wymagany jest zespół gości.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Błędne dane wejściowe', errors });
    }

    const created = await eventsRepo.create(input as CreateEventInput);
    return res.status(201).json(created);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Błąd serwera przy tworzeniu wydarzenia' });
  }
});

export default router;

