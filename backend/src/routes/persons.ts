import type { Request, Response } from 'express';
import { Router } from 'express';
import type { CreatePersonInput } from '../dto/persons';
import type { PersonType } from '../models';
import { InMemoryPersonsRepository } from '../repositories/InMemoryPersonsRepository';

const router = Router();
const repo = new InMemoryPersonsRepository();

const VALID_TYPES: PersonType[] = ['PARENT', 'SCOUT', 'COACH'];

router.get('/', async (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;
  const list = type && VALID_TYPES.includes(type as PersonType)
    ? await repo.findByType(type as PersonType)
    : await repo.findAll();
  return res.json(list);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const person = await repo.findById(id);
  if (!person) return res.status(404).json({ message: 'Osoba nie znaleziona' });
  return res.json(person);
});

router.post('/', async (req: Request, res: Response) => {
  const input = req.body as Partial<CreatePersonInput>;
  const errors: string[] = [];
  if (!input.personType || !VALID_TYPES.includes(input.personType)) errors.push('personType musi być PARENT, SCOUT lub COACH.');
  if (!input.firstName || String(input.firstName).trim().length < 2) errors.push('Imię jest wymagane (min. 2 znaki).');
  if (!input.lastName || String(input.lastName).trim().length < 2) errors.push('Nazwisko jest wymagane (min. 2 znaki).');
  if (errors.length) return res.status(400).json({ message: 'Błędne dane wejściowe', errors });
  const created = await repo.create({
    personType: input.personType,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: input.phone ?? null,
    email: input.email ?? null,
  });
  return res.status(201).json(created);
});

export default router;
