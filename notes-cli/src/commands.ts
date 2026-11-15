import { parseText, parseId } from "./validate.ts";

type Command = { kind: 'add'; text: string; }
    | { kind: 'done'; id: number }
    | { kind: 'undone'; id: number }
    | { kind: 'edit'; id: number; text: string; }
    | { kind: 'delete'; id: number }
    | { kind: 'help'; }
    | { kind: 'list'; };

export function parseCommand(argv: string[]): Command {
  const [cmd, ...args] = argv;
  if (!cmd) throw new Error('Введите команду, например: notes help');
  switch (cmd?.toLowerCase()) {
    case 'add': return { kind: 'add', text: parseText(args[0]) };
    case 'done': return { kind: 'done', id: parseId(args[0]) };
    case 'undone': return { kind: 'undone', id: parseId(args[0]) };
    case 'list': return { kind: 'list' };
    case 'delete': return { kind: 'delete', id: parseId(args[0]) };
    case 'edit': return { kind: 'edit', id: parseId(args[0]), text: parseText(args[1]) };
    case 'help': return { kind: 'help' };
    default: throw new Error(`Неизвестная команда: ${cmd}`);
  }
}