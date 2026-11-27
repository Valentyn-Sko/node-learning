import { createServer } from 'node:http';
import { HttpError } from './httpError.ts';
import { sendJson } from './helpers/sendJson.helper.ts';
import { readJsonBody } from './helpers/readJson.helper.ts';

const notes = new Map<number, { id: number; text: string }>([
  [1, { id: 1, text: 'Первая заметка' }],
  [2, { id: 2, text: 'Вторая' }],
]);
let nextId = 3;

/*
три маршрута:
GET /api/notes → список;
GET /api/notes/:id → одна заметка или 404 (id пока разбираете вручную через split, роутер будет в дне 3);
POST /api/notes → readJsonBody, проверка поля text, 201;
все ошибки — через HttpError и общий try/catch;
проверить curl-ом каждый код: 200, 201, 400, 404, 413, 415.
*/


const server = createServer(async (req, res) => {
  const started = performance.now();
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    switch (true) {
      case req.method === 'GET' && url.pathname === '/api/notes': {
        sendJson(res, 200, [...notes.values()]);
        break;
      }

      case req.method === 'GET' && /^\/api\/notes\/[^/]+$/.test(url.pathname): {
        const id = Number(url.pathname.split('/')[3]);

        if (!Number.isSafeInteger(id) || id <= 0) {
          throw new HttpError(400, 'Некорректный ID');
        }

        const note = notes.get(id);

        if (!note) {
          throw new HttpError(404, 'Заметка не найдена');
        }

        sendJson(res, 200, note);
        break;
      }

      case req.method === 'POST' && url.pathname === '/api/notes': {
        const body = await readJsonBody(req);

        if (
          typeof body !== 'object' ||
          body === null ||
          !('text' in body) ||
          typeof body.text !== 'string' ||
          !body.text.trim()
        ) {
          throw new HttpError(400, 'Некорректное поле text');
        }

        const note = {
          id: nextId++,
          text: body.text.trim(),
        };

        notes.set(note.id, note);

        sendJson(res, 201, note, {
          Location: `/api/notes/${note.id}`,
        });
        break;
      }
        
      case (req.method === 'GET' && url.pathname === '/slow'): {
        const start = Date.now();

          while (Date.now() - start < 3000) {
            
          }

          sendJson(res, 200, {
            message: 'Slow request completed',
          });

        break;
      } 

      case (req.method === 'GET' && url.pathname === '/health'): {
        sendJson(res, 200, {
          status: 'ok',
        });

        break;
      }

      default:
        throw new HttpError(405, 'Маршрут не найден');
    }
    
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(res, error.statusCode, { error: error.message });
    } else {
      console.error(error);
      sendJson(res, 500, { error: 'Внутренняя ошибка сервера' });
    }
    
  } finally {
    console.log(`${req.method} ${req.url} → ${res.statusCode} (${(performance.now() - started).toFixed(1)} ms)`);
  }
});
server.listen(3000, () => console.log('http://localhost:3000'));