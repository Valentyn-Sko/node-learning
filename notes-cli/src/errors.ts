export class NotFoundError extends Error {
  readonly id: number;
  constructor(id: number) {
    super(`Заметка #${id} не найдена`);
    this.name = "NotFoundError";
    this.id = id;
  }
}
