export type OutboxEntity =
  | 'players'
  | 'matches'
  | 'observations'
  | 'invitations'
  | 'clubs'
  | 'teams'
  | 'persons'
  | 'dictionaries';

export type OutboxOperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface OutboxOperation {
  id: string;
  entity: OutboxEntity;
  op: OutboxOperationType;
  payload: unknown;
  createdAt: string;
  lastError?: string;
}

const OUTBOX_KEY = 'tt-outbox-v1';

function nowIso() {
  return new Date().toISOString();
}

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function readOps(): OutboxOperation[] {
  const parsed = safeParse(window.localStorage.getItem(OUTBOX_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((x) => x && typeof x === 'object')
    .map((x) => x as OutboxOperation)
    .filter((x) => typeof x.id === 'string' && typeof x.entity === 'string' && typeof x.op === 'string');
}

function writeOps(ops: OutboxOperation[]) {
  window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(ops));
}

function genId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `op_${Date.now()}_${Math.random()}`;
}

export function enqueue(entity: OutboxEntity, op: OutboxOperationType, payload: unknown): OutboxOperation {
  const next: OutboxOperation = {
    id: genId(),
    entity,
    op,
    payload,
    createdAt: nowIso(),
  };
  const ops = readOps();
  ops.push(next);
  writeOps(ops);
  return next;
}

export function listOutbox(): OutboxOperation[] {
  return readOps();
}

export function removeOutboxById(id: string): void {
  const ops = readOps().filter((o) => o.id !== id);
  writeOps(ops);
}

export function markOutboxError(id: string, message: string): void {
  const ops = readOps().map((o) => (o.id === id ? { ...o, lastError: message } : o));
  writeOps(ops);
}

export interface OutboxFlushResult {
  attempted: number;
  succeeded: number;
  failed: number;
}

/**
 * Generic outbox flusher. You pass a handler for an operation.
 * Later, this handler can be swapped to Supabase (RPC/SDK) without changing UI code.
 */
export async function flushOutbox(
  handler: (op: OutboxOperation) => Promise<void>
): Promise<OutboxFlushResult> {
  const ops = readOps();
  let attempted = 0;
  let succeeded = 0;
  let failed = 0;
  for (const op of ops) {
    attempted += 1;
    try {
      await handler(op);
      removeOutboxById(op.id);
      succeeded += 1;
    } catch (e) {
      failed += 1;
      markOutboxError(op.id, e instanceof Error ? e.message : String(e));
    }
  }
  return { attempted, succeeded, failed };
}

