import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { parseText, parseId, getEnvNumber } from "../src/validate.ts";

describe("parseText", () => {

  beforeEach(() => {
  });
    
    it("Возвращает ошибку с текстом 'Текст не может быть пустым' если текст пустой", () => {
        assert.throws(() => parseText(""), /Текст не может быть пустым/i);
    });
    it("Возвращает тип данных строка", () => {
        const result = parseText("    Купить молоко     ");
        assert.equal(typeof result, "string");
    });
    it("Убирает пробелы до и после строки", () => {
        const result = parseText("    Купить молоко     ");
        assert.equal(result, "Купить молоко");
        assert.equal(result.length, "Купить молоко".length);
    });
});


describe("parseId", () => {

    beforeEach(() => {
    });
    
    it("Возвращает ошибку с текстом 'ID должен быть целым положительным числом, получено: ${value}' если отпрвлена пустая строка", () => {
        assert.throws(() => parseId(""), /ID должен быть целым положительным числом, получено: /i);
    });
    it("Возвращает тип данных number", () => {
        const result = parseId("    1     ");
        assert.equal(typeof result, "number");
    });
    it("Возвращает ошибку с текстом 'ID должен быть целым положительным числом, получено: ${value}' если отправлено отрицательнео значение", () => {
        assert.throws(() => parseId("-6"), /ID должен быть целым положительным числом, получено: -6/i);
    });
});


describe("getEnvNumber", () => {

    beforeEach(() => {
        
    });

    it("Не задано числоб вернет fallback", () => {
        assert.equal(getEnvNumber("PORT", 3000), 3000);
    })

    it("Задано число 8080", () => {
        process.env['PORT'] = '8080';
        assert.equal(getEnvNumber("PORT", 8080), 8080);
    })
    
    it("Задано число 0", () => {
        process.env['PORT'] = '0';
        assert.equal(getEnvNumber("PORT", 8080), 0);
    })

    it("Задано число -1", () => {
        process.env['PORT'] = '-1';
        assert.equal(getEnvNumber("PORT", 8080), -1);
    })

    it("Задано число 1e3", () => {
        process.env['PORT'] = '1e3';
        assert.equal(getEnvNumber("PORT", 8080), 1000);
    })
    
    it("Задано 'abc'", () => {
        process.env['PORT'] = 'abc';
        assert.throws(() => getEnvNumber("PORT", 8080), /Переменная PORT должна быть числом, получено: abc/);
    })
});

