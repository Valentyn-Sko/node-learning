
export type SpawnType = 'vehicle' | 'boat' | 'glider' | 'secret-room';

interface ListQuery {
  type?: SpawnType;
  limit: number;
  offset: number;
}

const SPAWN_TYPES: SpawnType[] = [
  'vehicle',
  'boat',
  'glider',
  'secret-room',
];

export function parseListQuery(url: URL): ListQuery {
  const params = url.searchParams;

  const rawType = params.get('type');
  const rawLimit = params.get('limit');
  const rawOffset = params.get('offset');

  if (rawType !== null && !SPAWN_TYPES.includes(rawType as SpawnType)) {
    throw new Error(
      `Некорректный type: "${rawType}". Допустимые значения: ${SPAWN_TYPES.join(', ')}`
    );
  }

  const limit = rawLimit === null ? 50 : Number(rawLimit);

  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    throw new Error('Параметр limit должен быть целым числом от 1 до 200');
  }

  const offset = rawOffset === null ? 0 : Number(rawOffset);

  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error('Параметр offset должен быть целым неотрицательным числом');
  }

  return {
    ...(rawType !== null ? { type: rawType as SpawnType } : {}),
    limit,
    offset,
  };
}
