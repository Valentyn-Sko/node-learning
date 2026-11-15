export function parseId(value: string | undefined): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`ID должен быть целым положительным числом, получено: ${value}`);
  }
  return id;
}

export function chechIsText(value: string, command = false) {
    if (!value || !value.trim()) {
        const errorText = !command ? 'Текст не может быть пустым' : 'Введите корректную команду, например help';
        throw new Error(errorText);
    }
}