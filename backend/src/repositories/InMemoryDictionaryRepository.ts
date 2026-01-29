import type { Dictionary, DictionaryType } from '../models';

const POSITIONS = ['GK', 'CB', 'FB', 'CM', 'AM', 'W', 'ST'];
const FEET = ['prawa', 'lewa', 'obunożny'];
const SOURCES = ['zgłoszenie', 'polecenie', 'scouting'];
const MATCH_CATEGORIES = ['U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19'];
const LEAGUE_RANKS = ['Ekstraklasa', 'I liga', 'II liga', 'III liga', 'IV liga', 'Liga okręgowa', 'Klasa'];

function seed(type: DictionaryType, values: string[]): Dictionary[] {
  return values.map((value, i) => ({
    id: `dict_${type}_${i}`,
    type,
    value,
    sortOrder: i,
    isActive: true,
  }));
}

const allEntries: Dictionary[] = [
  ...seed('POSITION', POSITIONS),
  ...seed('FOOT', FEET),
  ...seed('SOURCE', SOURCES),
  ...seed('MATCH_CATEGORY', MATCH_CATEGORIES),
  ...seed('LEAGUE_RANK', LEAGUE_RANKS),
];

export class InMemoryDictionaryRepository {
  private entries: Dictionary[] = [...allEntries];

  findAll(): Promise<Dictionary[]> {
    return Promise.resolve(this.entries.filter((e) => e.isActive));
  }

  findByType(type: DictionaryType): Promise<Dictionary[]> {
    return Promise.resolve(
      this.entries.filter((e) => e.type === type && e.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
    );
  }

  findById(id: string): Promise<Dictionary | null> {
    return Promise.resolve(this.entries.find((e) => e.id === id) ?? null);
  }
}
