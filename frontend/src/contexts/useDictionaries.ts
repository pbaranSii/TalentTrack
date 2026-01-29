import { useContext } from 'react';
import type { Dictionary, DictionaryType } from '../types';
import { DictionariesContext } from './dictionariesContext';

export function useDictionaries() {
  const ctx = useContext(DictionariesContext);
  if (!ctx) throw new Error('useDictionaries must be used within DictionariesProvider');
  return ctx;
}

export function useDictionaryByType(type: DictionaryType): Dictionary[] {
  const { byType } = useDictionaries();
  return byType[type] ?? [];
}

