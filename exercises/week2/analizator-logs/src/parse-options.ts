
import { parseArgs } from 'node:util';

interface Options {
  file: string;
  top: number;
  json: boolean;
}

export function parseOptions(argv: string[]): Options {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      top: {
        type: 'string',
        default: '5',
      },
      json: {
        type: 'boolean',
        default: false,
      },
    },
    strict: true,
  });

  const file = positionals[0];

  if (!file) {
    throw new Error('Usage: analyze.ts <file> [--top 5] [--json]');
  }

  if (positionals.length > 1) {
    throw new Error(`Unexpected argument: ${positionals[1]}`);
  }

  const top = Number(values.top);

  if (!Number.isSafeInteger(top) || top < 1) {
    throw new Error('--top must be a positive integer');
  }

  return {
    file,
    top,
    json: values.json,
  };
}
