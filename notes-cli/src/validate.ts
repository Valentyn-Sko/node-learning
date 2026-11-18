export function parseText(value: string | undefined): string {
  const text = value?.trim();
  if (!text) {
    throw new Error('Текст не может быть пустым');
  }
  return text;
}

export function parseId(value: string | undefined): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`ID должен быть целым положительным числом, получено: ${value}`);
  }
  return id;
}

const AVAILABLE_FILTERS = ['all', 'done', 'todo'] as const;

export type Filter = (typeof AVAILABLE_FILTERS)[number];

function isFilter(value: string): value is Filter {
  return AVAILABLE_FILTERS.some(filter => filter === value);
}

export function parseFilter(value: string | undefined): Filter {
  const text = value?.trim().replace(/^--/, '');;

  if (!text) {
    return 'all';
  }

  if (!isFilter(text)) {
    throw new Error('Список доступных фильтров: --all, --done, --todo');
  }

  return text;
}

export function getEnvNumber(envName: string, fallback: number): number {
  const raw = process.env[envName]?.trim();
  if (!raw) {
    return fallback;
  }
  const num = Number(raw);
  if (!Number.isInteger(num) || Number.isNaN(num)) {
    throw new Error(`Переменная ${ envName } должна быть числом, получено: ${ raw} `);
  }
  return num;
}