
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { HttpError } from '../httpError.ts';
import { matchPath } from './matchPath.helper.ts';

describe('matchPath', () => {
  it('должен вернуть пустой объект для совпадающего статического маршрута', () => {
    const result = matchPath('/api/notes', '/api/notes');

    assert.deepEqual(result, {});
  });

  it('должен извлечь один параметр', () => {
    const result = matchPath('/api/notes/:id', '/api/notes/123');

    assert.deepEqual(result, { id: '123' });
  });

  it('должен извлечь несколько параметров', () => {
    const result = matchPath(
      '/api/users/:userId/notes/:noteId',
      '/api/users/10/notes/25'
    );

    assert.deepEqual(result, {
      userId: '10',
      noteId: '25',
    });
  });

  it('должен вернуть null, если статический сегмент не совпадает', () => {
    const result = matchPath('/api/notes', '/api/users');

    assert.equal(result, null);
  });

  it('должен вернуть null, если количество сегментов отличается', () => {
    const result = matchPath('/api/notes/:id', '/api/notes');

    assert.equal(result, null);
  });

  it('должен декодировать URL-параметры', () => {
    const result = matchPath(
      '/api/notes/:text',
      '/api/notes/%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82'
    );

    assert.deepEqual(result, { text: 'Привет' });
  });

  it('должен выбросить HttpError 400 при некорректном URL-кодировании', () => {
    assert.throws(
      () => matchPath('/api/notes/:id', '/api/notes/%E0%A4%A'),
      (error: unknown) => {
        assert.ok(error instanceof HttpError);
        assert.equal(error.statusCode, 400);

        return true;
      }
    );
  });

  it('должен корректно обрабатывать слеши в начале и конце', () => {
    const result = matchPath('/api/notes/:id/', '/api/notes/123');

    assert.deepEqual(result, { id: '123' });
  });

  it('должен возвращать пустую строку для пустого параметра', () => {
    const result = matchPath('/api/notes/:id', '/api/notes/');

    assert.equal(result, null);
  });
});
