import { createServer } from 'node:http';
import { HttpError } from './httpError.ts';
import { sendJson } from './helpers/sendJson.helper.ts';
import { readJsonBody } from './helpers/readJson.helper.ts';
import { createApp } from './app.ts';



const server = createApp();
server.listen(3000, () => console.log('http://localhost:3000'));