# Log Generator & Analyzer
A TypeScript utility that generates large access logs and analyzes HTTP request statistics.

## Requirements

- **Node.js 22.18+** (runs `.ts` files natively, no `tsx` or build step)
- `npm install` in the repository root — only for `tsc` type checking

## Structure

```text
analizator-logs/
  src/
    parse-options.ts    — CLI argument parsing
    stats.ts            — parseLine, analyzeLine, createReport, ... (functions only, no main)
    analyze.ts          — stream version (createReadStream + readline)
    analyze-readfile.ts — readFile version (whole file in memory), for comparison
    generate.ts         — log generator
  test/
    parse-options.test.ts
    stats.test.ts
```

## Usage

```bash
# Generate a log (default: 1 000 000 lines → access.log)
node src/generate.ts --lines 1000000 --out access-1m.log

# Analyze
node src/analyze.ts access-1m.log
node src/analyze.ts --top 10 access-1m.log --json > report.json 2> perf.log

# Tests (from the repository root)
node --test exercises/week2/analizator-logs/test/*.test.ts
```

| Argument | Description | Default |
|---|---|---|
| `file` | Path to the log file | required |
| `--top <n>` | Number of top IPs / paths | `5` |
| `--json` | Print the report as JSON | `false` |

Arguments can go in any order. The report goes to `stdout`, time and memory go to `stderr`.

Log line format:

```text
2026-11-11T10:00:00.123Z 192.168.1.15 GET /api/users 200 123ms
```

Malformed lines (~0.1% in generated files) are counted as `Broken` and skipped.

## Experiment: stream vs readFile

| File | Version | Time | RSS | Heap | Result |
|---|---|---|---|---|---|
| 1M lines (65 MB) | stream | 0.92 s | **115 MB** | 18 MB | ✅ |
| 1M lines (65 MB) | readFile | 0.92 s | **420 MB** | 180 MB | ✅ |
| 1M lines (65 MB) | readFile, `--max-old-space-size=256` | 0.91 s | 324 MB | 119 MB | ✅ |
| 10M lines (645 MB) | stream | 9.20 s | **146 MB** | 29 MB | ✅ |
| 10M lines (645 MB) | stream, `--max-old-space-size=256` | 9.34 s | 146 MB | 18 MB | ✅ |
| 10M lines (645 MB) | readFile | — | — | — | ❌ `Invalid string length` |
| 10M lines (645 MB) | readFile, `--max-old-space-size=256` | — | — | — | ❌ `JavaScript heap out of memory` |

Node v24.13.0, macOS.

**Conclusion.** Speed is the same, but memory is not. The stream version keeps only one line plus counters in memory, so its memory stays almost flat (115 → 146 MB) when the file grows 10×. The readFile version needs memory proportional to the file: the whole file as one string plus an array of 1M line strings (~420 MB RSS for a 65 MB file). With 10M lines it cannot work at all: a 645 MB file is larger than V8's maximum string length (~512 MB, `buffer.constants.MAX_STRING_LENGTH`), and with a 256 MB heap limit it crashes with OOM. Use streams for files whose size you do not control.

## How the analyzer works

- `createReadStream` + `readline` — streaming line-by-line reading.
- `Map` for counters by IP, path and path timings.
- A fixed 2001-element histogram (response time 0–2000 ms) for median and p95, so individual times are not stored.
- All state lives in a `Stats` object from `createStats()`, not in module-level variables, so two analyses never mix their numbers.
