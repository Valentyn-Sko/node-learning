# Log Generator & Analyzer

A TypeScript utility for generating large access log files and analyzing HTTP request statistics.

## Requirements

- Node.js 20+
- npm

## Installation

Install dependencies:

```bash
npm install
```

Install TypeScript runner if it is not already installed:

```bash
npm install -D tsx typescript
```

## 1. Generate access logs

The `generate.ts` script generates a log file with configurable number of lines.

### Usage

```bash
node generate.ts [--lines <number>] [--out <filename>]
```

### Examples

Generate 1 million log entries (default):

```bash
node generate.ts
```

Generate 1 million entries and save to `access.log`:

```bash
node generate.ts --lines 1000000 --out access.log
```

Generate 100,000 entries:

```bash
node generate.ts --lines 100000 --out test.log
```

### Generated log format

```text
2026-11-11T10:00:00.123Z 192.168.1.15 GET /api/users 200 123ms
2026-11-11T10:00:00.456Z 10.0.0.7 POST /api/orders 201 87ms
2026-11-11T10:00:01.001Z 192.168.1.15 GET /api/users/42 404 12ms
```

Generated data includes:
- Approximately 50 different IP addresses with uneven distribution.
- Approximately 15 API endpoints.
- HTTP methods: GET, POST, PUT, DELETE.
- Realistic HTTP status code distribution (2xx, 4xx, rare 5xx).
- Response times between 5 and 2000 ms.
- Increasing timestamps.
- Approximately 0.1% malformed log entries.

The generator uses `createWriteStream` with backpressure handling to keep memory usage under control.

## 2. Analyze access logs

The `analyze.ts` script processes log files and generates HTTP request statistics.

### Usage

```bash
node analyze.ts <file> [--top <number>] [--json]
```

### Arguments

| Argument | Description | Default |
|---|---|---|
| `file` | Path to the log file | Required |
| `--top` | Number of top IPs and endpoints to display | `5` |
| `--json` | Output report in JSON format | `false` |

### Examples

Analyze a log file:

```bash
node analyze.ts access.log
```

Display top 10 IPs and endpoints:

```bash
node analyze.ts access.log --top 10
```

Analyze with JSON output:

```bash
node analyze.ts access.log --json
```

Arguments can be specified in any order:

```bash
node analyze.ts --top 3 access.log
node analyze.ts --json --top 10 access.log
```

### Analysis results

The analyzer calculates:

- Total number of log lines.
- Number of valid and malformed entries.
- HTTP status code distribution (2xx, 3xx, 4xx, 5xx).
- Average response time.
- Median response time (P50).
- 95th percentile response time (P95).
- Maximum response time.
- Top IP addresses by request count.
- Top endpoints by request count.
- Slowest endpoints by average response time.

The analyzer uses:
- `createReadStream` and `readline` for streaming file processing.
- `Map` for request counters and endpoint statistics.
- A fixed-size histogram (2001 elements) to calculate median and P95 without storing all response times.
- Error handling for malformed entries and file access errors.

Performance metrics (execution time and memory usage) are printed to `stderr`, while the report is printed to `stdout`.

### JSON output

Save the report to a JSON file:

```bash
node analyze.ts access.log --json > report.json
```

Save the report and performance metrics separately:

```bash
node analyze.ts access.log --json > report.json 2> performance.log
```

## 3. Complete workflow

Generate a log file:

```bash
node generate.ts --lines 1000000 --out access.log
```

Analyze the generated file:

```bash
node analyze.ts access.log --top 5
```

Export the analysis report:

```bash
node analyze.ts access.log --top 10 --json > report.json
```

## Error handling

The analyzer handles the following errors:

- Missing file.
- Directory passed instead of a file.
- Insufficient file permissions.
- Invalid or malformed log entries.
- Invalid CLI arguments.

Malformed entries are counted and skipped without interrupting analysis.



---------------------------------------------------------------------------------

MacBook-Pro-VS:analizator-logs valentyn$ node analyze.ts access-1m.log
File: access-1m.log
Lines: 1 000 000
Valid: 998 996
Broken: 1 004

Статусы:
2xx: 84.1%
3xx: 0.0%
4xx: 13.1%
5xx: 2.8%

Время ответа:
Среднее: 1002 мс
Медиана: 1002 мс
p95: 1901 мс
Максимум: 2000 мс

Топ-5 IP:
192.168.0.3 108 394
192.168.0.5 108 393
192.168.0.4 108 269
192.168.0.2 107 626
192.168.0.1 107 616

Топ-5 путей:
POST /api/reports 16 880
DELETE /api/payments/15 16 849
GET /api/dashboard 16 842
POST /api/products 16 814
DELETE /api/users 16 802

Самые медленные пути (среднее время):
PUT /api/users/15 1 012 мс
GET /api/products 1 010 мс
DELETE /api/notifications 1 010 мс
GET /api/auth/logout 1 009 мс
DELETE /api/reports 1 009 мс

Processed in: 0.90 sec
Memory (RSS): 99.08 MB
Memory (Heap): 14.62 MB

---------------------------------------------------------------------------------

MacBook-Pro-VS:analizator-logs valentyn$ node analyze.ts access-10m.log
File: access-10m.log
Lines: 10 000 000
Valid: 9 990 047
Broken: 9 953

Статусы:
2xx: 84.1%
3xx: 0.0%
4xx: 13.1%
5xx: 2.8%

Время ответа:
Среднее: 1003 мс
Медиана: 1002 мс
p95: 1901 мс
Максимум: 2000 мс

Топ-5 IP:
192.168.0.5 1 081 058
192.168.0.1 1 080 794
192.168.0.4 1 080 224
192.168.0.3 1 079 172
192.168.0.2 1 078 927

Топ-5 путей:
PUT /api/users/15 167 263
GET /api/users 167 207
POST /api/products 167 197
POST /api/orders 167 179
GET /api/users/42 167 103

Самые медленные пути (среднее время):
GET /api/notifications 1 005 мс
DELETE /api/payments 1 005 мс
GET /api/reports 1 005 мс
GET /api/payments/15 1 005 мс
PUT /api/products 1 005 мс

Processed in: 9.06 sec
Memory (RSS): 142.81 MB
Memory (Heap): 15.10 MB



--------------------------------------------------------------------------------

Processed in: 1.01 sec
Memory (RSS): 421.44 MB
Memory (Heap): 236.82 MB
Processed lines: 1000000
File: access-1m.log
Lines: 2 000 000
Valid: 1 997 992
Broken: 2 008

Статусы:
2xx: 84.1%
3xx: 0.0%
4xx: 13.1%
5xx: 2.8%

Время ответа:
Среднее: 1002 мс
Медиана: 1002 мс
p95: 1901 мс
Максимум: 2000 мс

Топ-5 IP:
192.168.0.3 216 788
192.168.0.5 216 786
192.168.0.4 216 538
192.168.0.2 215 252
192.168.0.1 215 232

Топ-5 путей:
POST /api/reports 33 760
DELETE /api/payments/15 33 698
GET /api/dashboard 33 684
POST /api/products 33 628
DELETE /api/users 33 604

Самые медленные пути (среднее время):
PUT /api/users/15 1 012 мс
GET /api/products 1 010 мс
DELETE /api/notifications 1 010 мс
GET /api/auth/logout 1 009 мс
DELETE /api/reports 1 009 мс

Processed in: 1.80 sec
Memory (RSS): 287.30 MB
Memory (Heap): 48.50 MB


---------------------------------------------------------------------------------

MacBook-Pro-VS:analizator-logs valentyn$ node analyze-readfile.ts access-10m.log
Error: Invalid string length
File: access-10m.log
Lines: 10 000 000
Valid: 9 990 047
Broken: 9 953

Статусы:
2xx: 84.1%
3xx: 0.0%
4xx: 13.1%
5xx: 2.8%

Время ответа:
Среднее: 1003 мс
Медиана: 1002 мс
p95: 1901 мс
Максимум: 2000 мс

Топ-5 IP:
192.168.0.5 1 081 058
192.168.0.1 1 080 794
192.168.0.4 1 080 224
192.168.0.3 1 079 172
192.168.0.2 1 078 927

Топ-5 путей:
PUT /api/users/15 167 263
GET /api/users 167 207
POST /api/products 167 197
POST /api/orders 167 179
GET /api/users/42 167 103

Самые медленные пути (среднее время):
GET /api/notifications 1 005 мс
DELETE /api/payments 1 005 мс
GET /api/reports 1 005 мс
GET /api/payments/15 1 005 мс
PUT /api/products 1 005 мс

Processed in: 8.99 sec
Memory (RSS): 732.55 MB
Memory (Heap): 539.03 MB