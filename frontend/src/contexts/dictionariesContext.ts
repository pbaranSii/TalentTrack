import { createContext } from 'react';
import type { Dictionary, DictionaryType } from '../types';

export interface DictionariesState {
  byType: Partial<Record<DictionaryType, Dictionary[]>>;
  all: Dictionary[];
  loading: boolean;
  error: string | null;
}

export const initialDictionariesState: DictionariesState = {
  byType: {},
  all: [],
  loading: true,
  error: null,
};

export const DictionariesContext = createContext<DictionariesState>(initialDictionariesState);

