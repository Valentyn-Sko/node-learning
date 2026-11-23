// Stream-версия: читает файл построчно через createReadStream + readline.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createInterface } from "node:readline";
import { performance } from "node:perf_hooks";
import { parseOptions } from "./parse-options.ts";
import {
  analyzeLine,
  createReport,
  createStats,
  handleFileError,
  printPerformance,
  printReport,
} from "./stats.ts";

async function main(argv: string[]): Promise<void> {
  const { file: filePath, top, json } = parseOptions(argv);

  const startTime = performance.now();

  const fileStats = await stat(filePath).catch((error: unknown) => {
    throw new Error(handleFileError(filePath, error));
  });

  if (fileStats.isDirectory()) {
    throw new Error(`Expected a file, but received a directory: ${filePath}`);
  }

  const input = createReadStream(filePath);
  const readline = createInterface({ input, crlfDelay: Infinity });

  let streamError: NodeJS.ErrnoException | undefined;

  input.on("error", (error) => {
    streamError = error;
    readline.close();
  });

  // я исправил: своё состояние на каждый запуск, а не глобальные счётчики.
  const stats = createStats();

  for await (const line of readline) {
    analyzeLine(stats, line);
  }

  if (streamError) {
    throw new Error(handleFileError(filePath, streamError));
  }

  const report = createReport(stats, top);
  const endTime = performance.now();

  // Отчёт — в stdout, производительность — в stderr.
  printReport(filePath, report, { top, json });
  printPerformance(startTime, endTime);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
