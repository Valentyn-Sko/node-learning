export function parseText(value: string | undefined): string {
  const text = value?.trim();
  if (!text) {
    throw new Error('Текст не может быть пустым');
  }
  return text;
}