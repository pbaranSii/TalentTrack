import type { Request, Response } from 'express';
import { Router } from 'express';
import type { DictionaryType } from '../models';
import { InMemoryDictionaryRepository } from '../repositories/InMemoryDictionaryRepository';

const router = Router();
const repo = new InMemoryDictionaryRepository();

const VALID_TYPES: DictionaryType[] = ['POSITION', 'FOOT', 'SOURCE', 'MATCH_CATEGORY', 'LEAGUE_RANK'];

router.get('/', async (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;
  if (type) {
    if (!VALID_TYPES.includes(type as DictionaryType)) {
      return res.status(400).json({ message: 'Nieprawidłowy typ słownika', errors: [] });
    }
    const entries = await repo.findByType(type as DictionaryType);
    return res.json(entries);
  }
  const all = await repo.findAll();
  return res.json(all);
});

export default router;
