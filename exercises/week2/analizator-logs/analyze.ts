import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createInterface } from "node:readline";
import { performance } from "node:perf_hooks";
import { parseOptions } from "./parseOptions.ts";

interface PathStats {
  count: number;
  totalTime: number;
}

interface Report {
  totalLines: number;
  validLines: number;
  brokenLines: number;
  statuses: Record<string, string>;
  responseTime: {
    average: number;
    median: number;
    p95: number;
    max: number;
  };
  topIps: Array<{ ip: string; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
  slowestPaths: Array<{ path: string; average: number }>;
}

const { file: filePath, top, json: jsonOutput } = parseOptions(process.argv.slice(2));

if (!filePath) {
  throw new Error("Usage: analyze.ts <file> [--top 5] [--json]");
}

if (!Number.isInteger(top) || top < 1) {
  throw new Error("--top must be a positive integer");
}

// Проверяем формат строки лога.
const LOG_PATTERN =
  /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\s+((?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))\s+(GET|POST|PUT|DELETE)\s+(\S+)\s+([1-5]\d{2})\s+(\d+)ms$/;

const latencyHistogram = new Array<number>(2001).fill(0);

const ipCounters = new Map<string, number>();
const pathCounters = new Map<string, number>();
const pathTimings = new Map<string, PathStats>();

const statusCounters = new Map<string, number>([
  ["2xx", 0],
  ["3xx", 0],
  ["4xx", 0],
  ["5xx", 0],
]);

let totalLines = 0;
let validLines = 0;
let brokenLines = 0;
let totalTime = 0;
let maxTime = 0;

// Получаем значение по позиции в гистограмме.
// rank начинается с нуля.
function getPercentile(rank: number): number {
  let cumulative = 0;

  for (let i = 0; i < latencyHistogram.length; i++) {
    cumulative += latencyHistogram[i]!;

    if (cumulative > rank) {
      return i;
    }
  }

  return 0;
}

function getMedian(): number {
  if (validLines === 0) {
    return 0;
  }

  const middle = Math.floor(validLines / 2);

  if (validLines % 2 !== 0) {
    return getPercentile(middle);
  }

  return (getPercentile(middle - 1) + getPercentile(middle)) / 2;
}

function getTopIps() {
  return [...ipCounters.entries()]
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count || a.ip.localeCompare(b.ip))
    .slice(0, top);
}

function getTopPaths() {
  return [...pathCounters.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))
    .slice(0, top);
}

function getSlowestPaths() {
  return [...pathTimings.entries()]
    .map(([path, stats]) => ({
      path,
      average: stats.totalTime / stats.count,
    }))
    .sort((a, b) => b.average - a.average || a.path.localeCompare(b.path))
    .slice(0, top);
}

function getPercentage(value: number): string {
  if (validLines === 0) {
    return "0.0%";
  }

  return `${((value / validLines) * 100).toFixed(1)}%`;
}

export function analyzeLine(line: string): void {
  totalLines++;

  const match = LOG_PATTERN.exec(line);

  if (!match) {
    brokenLines++;
    return;
  }

  const [, timestamp, ip, method, path, statusText, durationText] = match;

  if (!timestamp || !ip || !method || !path || !statusText || !durationText) {
    brokenLines++;
    return;
  }

  // Дополнительная проверка корректности даты.
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime()) || date.toISOString() !== timestamp) {
    brokenLines++;
    return;
  }

  const status = Number(statusText);
  const duration = Number(durationText);

  if (!Number.isInteger(duration) || duration < 0 || duration > 2000) {
    brokenLines++;
    return;
  }

  validLines++;

  // HTTP status counters.
  const statusGroup = `${Math.floor(status / 100)}xx`;

  statusCounters.set(statusGroup, (statusCounters.get(statusGroup) ?? 0) + 1);

  // IP counters.
  ipCounters.set(ip, (ipCounters.get(ip) ?? 0) + 1);

  // Path counters.
  const pathKey = `${method} ${path}`;

  pathCounters.set(pathKey, (pathCounters.get(pathKey) ?? 0) + 1);

  // Path response time.
  const currentPathStats = pathTimings.get(pathKey) ?? {
    count: 0,
    totalTime: 0,
  };

  currentPathStats.count++;
  currentPathStats.totalTime += duration;

  pathTimings.set(pathKey, currentPathStats);

  // Latency histogram.
  latencyHistogram[duration]!++;

  totalTime += duration;
  maxTime = Math.max(maxTime, duration);
}

export function createReport(): Report {
  const statusGroups = ["2xx", "3xx", "4xx", "5xx"] as const;

  const statuses = Object.fromEntries(
    statusGroups.map((group) => [
      group,
      getPercentage(statusCounters.get(group) ?? 0),
    ]),
  );

  return {
    totalLines,
    validLines,
    brokenLines,
    statuses,
    responseTime: {
      average: validLines ? Math.round(totalTime / validLines) : 0,
      median: getMedian(),
      p95: validLines ? getPercentile(Math.ceil(validLines * 0.95) - 1) : 0,
      max: maxTime,
    },
    topIps: getTopIps(),
    topPaths: getTopPaths(),
    slowestPaths: getSlowestPaths().map((item) => ({
      ...item,
      average: Math.round(item.average),
    })),
  };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function printReport(report: Report): void {
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`File: ${filePath}`);
  console.log(`Lines: ${formatNumber(report.totalLines)}`);
  console.log(`Valid: ${formatNumber(report.validLines)}`);
  console.log(`Broken: ${formatNumber(report.brokenLines)}`);

  console.log("\nСтатусы:");

  for (const [status, percentage] of Object.entries(report.statuses)) {
    console.log(`${status}: ${percentage}`);
  }

  console.log("\nВремя ответа:");
  console.log(`Среднее: ${report.responseTime.average} мс`);
  console.log(`Медиана: ${report.responseTime.median} мс`);
  console.log(`p95: ${report.responseTime.p95} мс`);
  console.log(`Максимум: ${report.responseTime.max} мс`);

  console.log(`\nТоп-${top} IP:`);

  for (const item of report.topIps) {
    console.log(`${item.ip} ${formatNumber(item.count)}`);
  }

  console.log(`\nТоп-${top} путей:`);

  for (const item of report.topPaths) {
    console.log(`${item.path} ${formatNumber(item.count)}`);
  }

  console.log("\nСамые медленные пути (среднее время):");

  for (const item of report.slowestPaths) {
    console.log(`${item.path} ${formatNumber(item.average)} мс`);
  }
}

function handleFileError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? error.code
      : undefined;

  switch (code) {
    case "ENOENT":
      return `File not found: ${filePath}`;

    case "EISDIR":
      return `Expected a file, but received a directory: ${filePath}`;

    case "EACCES":
    case "EPERM":
      return `Permission denied: ${filePath}`;

    default:
      return error instanceof Error ? error.message : "Unknown file error";
  }
}

async function main(): Promise<void> {
  const startTime = performance.now();

  // Проверяем существование файла и что это не директория.
  if (!filePath) {
    console.error("Usage: analyze.ts <file> [--top 5] [--json]");
    process.exit(1);
  }
  const fileStats = await stat(filePath);

  if (fileStats.isDirectory()) {
    throw new Error(`Expected a file, but received a directory: ${filePath}`);
  }

  const input = createReadStream(filePath);

  const readline = createInterface({
    input,
    crlfDelay: Infinity,
  });

  let streamError: NodeJS.ErrnoException | undefined;

  input.on("error", (error) => {
    streamError = error;
    readline.close();
  });

  for await (const line of readline) {
    analyzeLine(line);
  }

  if (streamError) {
    throw streamError;
  }

  const report = createReport();

  const endTime = performance.now();
  const memory = process.memoryUsage();

  // Отчёт отправляем в stdout.
  printReport(report);

  // Производительность отправляем в stderr.
  console.error(
    `\nProcessed in: ${((endTime - startTime) / 1000).toFixed(2)} sec`,
  );

  console.error(`Memory (RSS): ${(memory.rss / 1024 / 1024).toFixed(2)} MB`);

  console.error(
    `Memory (Heap): ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
  );
}

main().catch((error) => {
  console.error(`Error: ${handleFileError(error)}`);
  process.exitCode = 1;
});
