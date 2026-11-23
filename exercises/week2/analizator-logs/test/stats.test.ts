import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeLine, createReport, createStats, parseLine } from "../src/stats.ts";

const VALID = "2026-11-11T10:00:00.123Z 192.168.1.15 GET /api/users 200 123ms";

describe("parseLine", () => {
  it("разбирает корректную строку", () => {
    assert.deepEqual(parseLine(VALID), {
      timestamp: "2026-11-11T10:00:00.123Z",
      ip: "192.168.1.15",
      method: "GET",
      path: "/api/users",
      status: 200,
      duration: 123,
    });
  });

  const broken: Array<[string, string]> = [
    ["пустая строка", ""],
    ["мусор", "INVALID LOG ENTRY !!!"],
    ["обрезанный IP", "2026-11-11T10:00:00.123Z 192.168."],
    ["IP > 255", "2026-11-11T10:00:00.123Z 192.168.1.256 GET /a 200 1ms"],
    ["несуществующая дата", "2026-02-30T10:00:00.123Z 1.1.1.1 GET /a 200 1ms"],
    ["неизвестный метод", "2026-11-11T10:00:00.123Z 1.1.1.1 PATCH /a 200 1ms"],
    ["статус 600", "2026-11-11T10:00:00.123Z 1.1.1.1 GET /a 600 1ms"],
    ["время > 2000", "2026-11-11T10:00:00.123Z 1.1.1.1 GET /a 200 2001ms"],
  ];

  for (const [name, line] of broken) {
    it(`возвращает null: ${name}`, () => {
      assert.equal(parseLine(line), null);
    });
  }
});

describe("analyzeLine + createReport", () => {
  it("считает строки, статусы, медиану и топы", () => {
    const stats = createStats();

    analyzeLine(stats, "2026-11-11T10:00:00.000Z 1.1.1.1 GET /a 200 10ms");
    analyzeLine(stats, "2026-11-11T10:00:01.000Z 1.1.1.1 GET /a 404 20ms");
    analyzeLine(stats, "2026-11-11T10:00:02.000Z 2.2.2.2 POST /b 500 30ms");
    analyzeLine(stats, "garbage");

    const report = createReport(stats, 1);

    assert.equal(report.totalLines, 4);
    assert.equal(report.validLines, 3);
    assert.equal(report.brokenLines, 1);
    assert.equal(report.statuses["2xx"], "33.3%");
    assert.equal(report.statuses["4xx"], "33.3%");
    assert.equal(report.statuses["5xx"], "33.3%");
    assert.deepEqual(report.responseTime, { average: 20, median: 20, p95: 30, max: 30 });
    assert.deepEqual(report.topIps, [{ ip: "1.1.1.1", count: 2 }]);
    assert.deepEqual(report.topPaths, [{ path: "GET /a", count: 2 }]);
    assert.deepEqual(report.slowestPaths, [{ path: "POST /b", average: 30 }]);
  });

  it("медиана для чётного числа строк — среднее двух центральных", () => {
    const stats = createStats();

    analyzeLine(stats, "2026-11-11T10:00:00.000Z 1.1.1.1 GET /a 200 10ms");
    analyzeLine(stats, "2026-11-11T10:00:01.000Z 1.1.1.1 GET /a 200 20ms");

    assert.equal(createReport(stats, 5).responseTime.median, 15);
  });

  it("два независимых stats не смешивают числа", () => {
    const first = createStats();
    const second = createStats();

    analyzeLine(first, VALID);

    assert.equal(first.totalLines, 1);
    assert.equal(second.totalLines, 0);
  });

  it("пустой файл даёт нули", () => {
    const report = createReport(createStats(), 5);

    assert.equal(report.totalLines, 0);
    assert.equal(report.statuses["2xx"], "0.0%");
    assert.deepEqual(report.responseTime, { average: 0, median: 0, p95: 0, max: 0 });
  });
});
