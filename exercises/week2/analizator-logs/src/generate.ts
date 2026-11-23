
import { createWriteStream } from 'node:fs';
import { once } from 'node:events';
import { performance } from 'node:perf_hooks';

const args = process.argv.slice(2);

function getArg(name: string, defaultValue: string): string {
  const index = args.indexOf(name);
  return index !== -1 ? args[index + 1] ?? defaultValue : defaultValue;
}
const lines = Number(getArg('--lines', '1000000'));
const output = getArg('--out', 'access.log');

if (!Number.isInteger(lines) || lines < 1) {
  throw new Error('--lines must be a positive integer');
}

const ips = Array.from({ length: 50 }, (_, i) => {
  return `192.168.${Math.floor(i / 250)}.${i + 1}`;
});

// Неравномерное распределение IP: первые адреса встречаются чаще.
const weightedIps = ips.flatMap((ip, index) =>
  Array(index < 5 ? 20 : index < 15 ? 5 : 1).fill(ip)
);

const paths = [
  '/api/users',
  '/api/users/42',
  '/api/users/15',
  '/api/orders',
  '/api/orders/123',
  '/api/products',
  '/api/products/42',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/payments',
  '/api/payments/15',
  '/api/reports',
  '/api/settings',
  '/api/notifications',
  '/api/dashboard',
];

const methods = ['GET', 'POST', 'PUT', 'DELETE'];

// Реалистичное распределение HTTP-статусов.
const statuses = [
  ...Array(75).fill(200),
  ...Array(10).fill(201),
  ...Array(5).fill(204),
  ...Array(4).fill(400),
  ...Array(3).fill(401),
  ...Array(2).fill(403),
  ...Array(4).fill(404),
  ...Array(1).fill(429),
  ...Array(1).fill(500),
  ...Array(1).fill(502),
  ...Array(1).fill(503),
];

function randomItem<T>(items: T[]): T {
  const item = items[Math.floor(Math.random() * items.length)];

  if (item === undefined) {
    throw new Error('Array is empty');
  }

  return item;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateLogLine(timestamp: number): string {
  const date = new Date(timestamp).toISOString();

  const ip = randomItem(weightedIps);
  const method = randomItem(methods);
  const path = randomItem(paths);
  const status = randomItem(statuses);
  const duration = randomInt(5, 2000);

  return `${date} ${ip} ${method} ${path} ${status} ${duration}ms\n`;
}

function generateBrokenLine(): string {
  const brokenLines = [
    'INVALID LOG ENTRY !!!\n',
    '2026-11-11T10:00:00.123Z 192.168.\n',
    'some random garbage data\n',
    '2026-11-11T10:00:00.123Z UNKNOWN\n',
  ];

  return randomItem(brokenLines);
}

async function main(): Promise<void> {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  const stream = createWriteStream(output, {
    encoding: 'utf8',
  });

  // Начальная дата.
  let timestamp = Date.parse('2026-11-11T10:00:00.000Z');

  let generated = 0;
  let broken = 0;

  try {
    for (let i = 0; i < lines; i++) {
      // Время всегда возрастает.
      timestamp += randomInt(1, 1000);

      let line: string;

      // Примерно 0.1% поврежденных строк.
      if (Math.random() < 0.001) {
        line = generateBrokenLine();
        broken++;
      } else {
        line = generateLogLine(timestamp);
      }

      generated++;

      // Учитываем backpressure.
      if (!stream.write(line)) {
        await once(stream, 'drain');
      }
    }

    stream.end();

    await once(stream, 'finish');
  } catch (error) {
    stream.destroy();
    throw error;
  }

  const endTime = performance.now();
  const endMemory = process.memoryUsage();

  console.log('\nGeneration completed!');
  console.log(`File: ${output}`);
  console.log(`Lines: ${generated}`);
  console.log(`Broken lines: ${broken}`);
  console.log(`Time: ${((endTime - startTime) / 1000).toFixed(2)} sec`);

  console.log('\nMemory usage:');
  console.log(
    `Heap: ${(endMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `RSS: ${(endMemory.rss / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `Heap difference: ${(
      (endMemory.heapUsed - startMemory.heapUsed) /
      1024 /
      1024
    ).toFixed(2)} MB`
  );
}

main().catch(console.error);
