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