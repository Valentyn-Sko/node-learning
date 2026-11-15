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