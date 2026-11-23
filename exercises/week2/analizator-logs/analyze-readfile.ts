
import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { analyzeLine, createReport } from './analyze.ts';
import { parseOptions } from './parseOptions.ts';



async function main(): Promise<void> {
  const { file: filePath, top, json } =
    parseOptions(process.argv.slice(2));

  const startTime = performance.now();

  // Читаем весь файл в память.
  const content = await readFile(filePath, 'utf8');

  // Разбиваем содержимое на строки.
  const lines = content.split('\n');

  // Убираем последнюю пустую строку, если файл заканчивается \n.
  if (lines.at(-1) === '') {
    lines.pop();
  }

  for (const line of lines) {
    analyzeLine(line.replace(/\r$/, ''));
  }

  const report = createReport();

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
  const memory = process.memoryUsage();

  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(JSON.stringify(report, null, 2));
  }

  console.error(`Processed in: ${elapsed} sec`);
  console.error(
    `Memory (RSS): ${(memory.rss / 1024 / 1024).toFixed(2)} MB`
  );
  console.error(
    `Memory (Heap): ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`
  );

  // Предупреждаем о размере массива строк.
  console.error(`Processed lines: ${lines.length}`);
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
