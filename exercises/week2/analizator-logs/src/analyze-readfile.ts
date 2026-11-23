// readFile-версия: читает весь файл в память целиком (для сравнения со stream-версией).
import { readFile } from "node:fs/promises";
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

  const content = await readFile(filePath, "utf8").catch((error: unknown) => {
    throw new Error(handleFileError(filePath, error));
  });

  const lines = content.split("\n");

  // Убираем последнюю пустую строку, если файл заканчивается \n.
  if (lines.at(-1) === "") {
    lines.pop();
  }

  const stats = createStats();

  for (const line of lines) {
    analyzeLine(stats, line.replace(/\r$/, ""));
  }

  const report = createReport(stats, top);
  const endTime = performance.now();

  printReport(filePath, report, { top, json });
  printPerformance(startTime, endTime);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
