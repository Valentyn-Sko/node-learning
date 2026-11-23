export interface PathStats {
  count: number;
  totalTime: number;
}

export interface LogEntry {
  timestamp: string;
  ip: string;
  method: string;
  path: string;
  status: number;
  duration: number;
}

export interface Stats {
  totalLines: number;
  validLines: number;
  brokenLines: number;
  totalTime: number;
  maxTime: number;
  latencyHistogram: number[];
  ipCounters: Map<string, number>;
  pathCounters: Map<string, number>;
  pathTimings: Map<string, PathStats>;
  statusCounters: Map<string, number>;
}

export interface Report {
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

const MAX_DURATION = 2000;

const LOG_PATTERN =
  /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\s+((?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))\s+(GET|POST|PUT|DELETE)\s+(\S+)\s+([1-5]\d{2})\s+(\d+)ms$/;


export function createStats(): Stats {
  return {
    totalLines: 0,
    validLines: 0,
    brokenLines: 0,
    totalTime: 0,
    maxTime: 0,
    latencyHistogram: new Array<number>(MAX_DURATION + 1).fill(0),
    ipCounters: new Map(),
    pathCounters: new Map(),
    pathTimings: new Map(),
    statusCounters: new Map([
      ["2xx", 0],
      ["3xx", 0],
      ["4xx", 0],
      ["5xx", 0],
    ]),
  };
}


export function parseLine(line: string): LogEntry | null {
  const match = LOG_PATTERN.exec(line);

  if (!match) {
    return null;
  }

  const [, timestamp, ip, method, path, statusText, durationText] = match;

  if (!timestamp || !ip || !method || !path || !statusText || !durationText) {
    return null;
  }

  // Дополнительная проверка корректности даты (например, 2026-02-30).
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime()) || date.toISOString() !== timestamp) {
    return null;
  }

  const status = Number(statusText);
  const duration = Number(durationText);

  if (!Number.isInteger(duration) || duration < 0 || duration > MAX_DURATION) {
    return null;
  }

  return { timestamp, ip, method, path, status, duration };
}

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

// я исправил: analyzeLine принимает stats первым аргументом.
export function analyzeLine(stats: Stats, line: string): void {
  stats.totalLines++;

  const entry = parseLine(line);

  if (!entry) {
    stats.brokenLines++;
    return;
  }

  stats.validLines++;

  const { ip, method, path, status, duration } = entry;

  increment(stats.statusCounters, `${Math.floor(status / 100)}xx`);
  increment(stats.ipCounters, ip);

  const pathKey = `${method} ${path}`;

  increment(stats.pathCounters, pathKey);

  const pathStats = stats.pathTimings.get(pathKey) ?? { count: 0, totalTime: 0 };

  pathStats.count++;
  pathStats.totalTime += duration;
  stats.pathTimings.set(pathKey, pathStats);

  stats.latencyHistogram[duration]!++;
  stats.totalTime += duration;
  stats.maxTime = Math.max(stats.maxTime, duration);
}

// Получаем значение по позиции в гистограмме. rank начинается с нуля.
export function getPercentile(histogram: number[], rank: number): number {
  let cumulative = 0;

  for (let i = 0; i < histogram.length; i++) {
    cumulative += histogram[i]!;

    if (cumulative > rank) {
      return i;
    }
  }

  return 0;
}

export function getMedian(stats: Stats): number {
  const { validLines, latencyHistogram } = stats;

  if (validLines === 0) {
    return 0;
  }

  const middle = Math.floor(validLines / 2);

  if (validLines % 2 !== 0) {
    return getPercentile(latencyHistogram, middle);
  }

  return (
    (getPercentile(latencyHistogram, middle - 1) +
      getPercentile(latencyHistogram, middle)) /
    2
  );
}

function getTop<T>(
  map: Map<string, T>,
  toItem: (key: string, value: T) => { key: string; value: number },
  top: number,
): Array<{ key: string; value: number }> {
  return [...map.entries()]
    .map(([key, value]) => toItem(key, value))
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key))
    .slice(0, top);
}

function getPercentage(value: number, total: number): string {
  if (total === 0) {
    return "0.0%";
  }

  return `${((value / total) * 100).toFixed(1)}%`;
}

export function createReport(stats: Stats, top: number): Report {
  const { validLines } = stats;
  const statusGroups = ["2xx", "3xx", "4xx", "5xx"] as const;

  const statuses = Object.fromEntries(
    statusGroups.map((group) => [
      group,
      getPercentage(stats.statusCounters.get(group) ?? 0, validLines),
    ]),
  );

  return {
    totalLines: stats.totalLines,
    validLines,
    brokenLines: stats.brokenLines,
    statuses,
    responseTime: {
      average: validLines ? Math.round(stats.totalTime / validLines) : 0,
      median: getMedian(stats),
      p95: validLines
        ? getPercentile(stats.latencyHistogram, Math.ceil(validLines * 0.95) - 1)
        : 0,
      max: stats.maxTime,
    },
    topIps: getTop(stats.ipCounters, (key, value) => ({ key, value }), top).map(
      ({ key, value }) => ({ ip: key, count: value }),
    ),
    topPaths: getTop(stats.pathCounters, (key, value) => ({ key, value }), top).map(
      ({ key, value }) => ({ path: key, count: value }),
    ),
    slowestPaths: getTop(
      stats.pathTimings,
      (key, value) => ({ key, value: value.totalTime / value.count }),
      top,
    ).map(({ key, value }) => ({ path: key, average: Math.round(value) })),
  };
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export function printReport(
  filePath: string,
  report: Report,
  options: { top: number; json: boolean },
): void {
  if (options.json) {
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

  console.log(`\nТоп-${options.top} IP:`);

  for (const item of report.topIps) {
    console.log(`${item.ip} ${formatNumber(item.count)}`);
  }

  console.log(`\nТоп-${options.top} путей:`);

  for (const item of report.topPaths) {
    console.log(`${item.path} ${formatNumber(item.count)}`);
  }

  console.log("\nСамые медленные пути (среднее время):");

  for (const item of report.slowestPaths) {
    console.log(`${item.path} ${formatNumber(item.average)} мс`);
  }
}

export function printPerformance(startTime: number, endTime: number): void {
  const memory = process.memoryUsage();
  const toMb = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);

  console.error(`\nProcessed in: ${((endTime - startTime) / 1000).toFixed(2)} sec`);
  console.error(`Memory (RSS): ${toMb(memory.rss)} MB`);
  console.error(`Memory (Heap): ${toMb(memory.heapUsed)} MB`);
}

export function handleFileError(filePath: string, error: unknown): string {
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
