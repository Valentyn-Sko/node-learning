import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { parseText, parseId, getEnvNumber } from "../src/validate.ts";

describe("parseText", () => {
    it("Возвращает ошибку с текстом 'Текст не может быть пустым' если текст пустой", () => {
        assert.throws(() => parseText(""), /Текст не может быть пустым/i);
    });
    it("Убирает пробелы до и после строки", () => {
        const result = parseText("    Купить молоко     ");
        assert.equal(result, "Купить молоко");
        assert.equal(result.length, "Купить молоко".length);
    });

    it("Возвращает ошибку с текстом 'ID должен быть целым положительным числом, получено: ${value}' если отправлено '    '", () => {
        assert.throws(() => parseText("        "), /Текст не может быть пустым/i);
    });
});


describe("parseId", () => {
    it("Возвращает ошибку с текстом 'ID должен быть целым положительным числом, получено: ${value}' если отпрвлена пустая строка", () => {
        assert.throws(() => parseId(""), /ID должен быть целым положительным числом, получено: /i);
    });
    it("Возвращает тип данных number", () => {
        assert.equal(parseId("  1  "), 1)
    });
    it("Возвращает ошибку с текстом 'ID должен быть целым положительным числом, получено: ${value}' если отправлено отрицательнео значение", () => {
        assert.throws(() => parseId("-6"), /ID должен быть целым положительным числом, получено: -6/i);
    });

    it("Возвращает ошибку с текстом 'ID должен быть целым положительным числом, получено: ${value}' если отправлено abc", () => {
        assert.throws(() => parseId("abc"), /ID должен быть целым положительным числом, получено: abc/i);
    });
    it("Возвращает ошибку с текстом 'ID должен быть целым положительным числом, получено: ${value}' если отправлено 0", () => {
        assert.throws(() => parseId("0"), /ID должен быть целым положительным числом, получено: 0/i);
    });
    it("Возвращает ошибку с текстом 'ID должен быть целым положительным числом, получено: ${value}' если отправлено undefined", () => {
        assert.throws(() => parseId(undefined), /ID должен быть целым положительным числом, получено: undefined/i);
    });
});


describe("getEnvNumber", () => {

    const VAR = 'TEST_NOTES_PORT';
    beforeEach(() => {
        delete process.env[VAR];
    });

    it("Не задано числоб вернет fallback", () => {
        assert.equal(getEnvNumber("PORT", 3000), 3000);
    })

    it("Задано число 8080", () => {
        process.env['PORT'] = '8080';
        assert.equal(getEnvNumber("PORT", 1000), 8080);
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


    it("Задано 'пробелы'", () => {
        process.env['PORT'] = '    ';
        assert.equal(getEnvNumber("PORT", 3000), 3000);
    })

    it("Задано 'дробное'", () => {
        process.env['PORT'] = '3500.4';
        assert.throws(()=>getEnvNumber("PORT", 3000), /Переменная PORT должна быть числом, получено: 3500.4/);
    })
    
    it("Задано 'abc'", () => {
        process.env['PORT'] = 'abc';
        assert.throws(() => getEnvNumber("PORT", 8080), /Переменная PORT должна быть числом, получено: abc/);
    })
});

