import type { Dictionary, DictionaryType } from '../../types';
import { api } from '../../api';
import { getTable, setTable } from '../storage';
import { seedDictionaries } from '../seeds/dictionaries';

const TABLE = 'dictionaries' as const;

function normalize(list: Dictionary[]): Dictionary[] {
  return list
    .filter((d) => d.isActive !== false)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export const dictionariesRepo = {
  ensureSeeded(): Dictionary[] {
    const current = getTable<Dictionary[]>(TABLE) ?? [];
    if (Array.isArray(current) && current.length > 0) return normalize(current);
    const seeded = seedDictionaries();
    setTable(TABLE, seeded);
    return normalize(seeded);
  },

  getAllLocal(): Dictionary[] {
    const current = getTable<Dictionary[]>(TABLE) ?? [];
    if (!Array.isArray(current) || current.length === 0) return this.ensureSeeded();
    return normalize(current);
  },

  getByTypeLocal(type: DictionaryType): Dictionary[] {
    return this.getAllLocal().filter((d) => d.type === type);
  },

  async refreshFromRemote(type?: DictionaryType): Promise<{ ok: boolean; error?: string }> {
    try {
      const remote = await api.getDictionaries(type);
      if (type) {
        // Merge typed fetch into existing store.
        const current = this.getAllLocal();
        const withoutType = current.filter((d) => d.type !== type);
        setTable(TABLE, normalize([...withoutType, ...remote]));
      } else {
        setTable(TABLE, normalize(remote));
      }
      return { ok: true };
    } catch (e) {
      // Do not block UI; keep cached/seeded dictionaries.
      this.ensureSeeded();
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

