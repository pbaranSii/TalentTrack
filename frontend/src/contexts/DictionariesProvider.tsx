import { useEffect, useState } from 'react';
import type { Dictionary, DictionaryType } from '../types';
import { dictionariesRepo } from '../data/repositories/dictionariesRepo';
import { DictionariesContext, initialDictionariesState } from './dictionariesContext';
import type { DictionariesState } from './dictionariesContext';

function buildState(all: Dictionary[], error: string | null): DictionariesState {
  const byType: Partial<Record<DictionaryType, Dictionary[]>> = {};
  const types: DictionaryType[] = ['POSITION', 'FOOT', 'SOURCE', 'MATCH_CATEGORY', 'LEAGUE_RANK'];
  types.forEach((type) => {
    byType[type] = all.filter((e) => e.type === type).sort((a, b) => a.sortOrder - b.sortOrder);
  });
  return { byType, all, loading: false, error };
}

export function DictionariesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DictionariesState>(() => buildState(dictionariesRepo.getAllLocal(), null));

  useEffect(() => {
    let cancelled = false;
    dictionariesRepo.refreshFromRemote().then((res) => {
      if (cancelled) return;
      const updated = dictionariesRepo.getAllLocal();
      setState(buildState(updated, res.ok ? null : res.error ?? null));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep shape stable even if something goes wrong.
  const value = state ?? initialDictionariesState;

  return <DictionariesContext.Provider value={value}>{children}</DictionariesContext.Provider>;
}

