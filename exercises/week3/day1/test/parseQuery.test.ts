
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseListQuery } from '../src/parseQuery.ts';



test('parseListQuery', async (t) => {
  await t.test('использует значения по умолчанию', () => {
    const url = new URL('http://localhost/spawns');

    assert.deepEqual(parseListQuery(url), {
      limit: 50,
      offset: 0,
    });
  });

  await t.test('парсит все параметры', () => {
    const url = new URL(
      'http://localhost/spawns?type=vehicle&limit=100&offset=20'
    );

    assert.deepEqual(parseListQuery(url), {
      type: 'vehicle',
      limit: 100,
      offset: 20,
    });
  });

  await t.test('принимает все допустимые type', () => {
    const types = ['vehicle', 'boat', 'glider', 'secret-room'];

    for (const type of types) {
      const url = new URL(`http://localhost/spawns?type=${type}`);

      assert.equal(parseListQuery(url).type, type);
    }
  });

  await t.test('принимает минимальный limit', () => {
    const url = new URL('http://localhost/spawns?limit=1');

    assert.equal(parseListQuery(url).limit, 1);
  });

  await t.test('принимает максимальный limit', () => {
    const url = new URL('http://localhost/spawns?limit=200');

    assert.equal(parseListQuery(url).limit, 200);
  });

  await t.test('отклоняет некорректный type', () => {
    const url = new URL('http://localhost/spawns?type=airplane');

    assert.throws(
      () => parseListQuery(url),
      /Некорректный type/
    );
  });

  await t.test('отклоняет limit меньше 1', () => {
    const url = new URL('http://localhost/spawns?limit=0');

    assert.throws(
      () => parseListQuery(url),
      /limit должен быть целым числом от 1 до 200/
    );
  });

  await t.test('отклоняет limit больше 200', () => {
    const url = new URL('http://localhost/spawns?limit=201');

    assert.throws(
      () => parseListQuery(url),
      /limit должен быть целым числом от 1 до 200/
    );
  });

  await t.test('отклоняет дробный limit', () => {
    const url = new URL('http://localhost/spawns?limit=10.5');

    assert.throws(
      () => parseListQuery(url),
      /limit должен быть целым числом от 1 до 200/
    );
  });

  await t.test('отклоняет отрицательный offset', () => {
    const url = new URL('http://localhost/spawns?offset=-1');

    assert.throws(
      () => parseListQuery(url),
      /offset должен быть целым неотрицательным числом/
    );
  });

  await t.test('отклоняет дробный offset', () => {
    const url = new URL('http://localhost/spawns?offset=1.5');

    assert.throws(
      () => parseListQuery(url),
      /offset должен быть целым неотрицательным числом/
    );
  });

  await t.test('отклоняет нечисловой offset', () => {
    const url = new URL('http://localhost/spawns?offset=abc');

    assert.throws(
      () => parseListQuery(url),
      /offset должен быть целым неотрицательным числом/
    );
  });
});
