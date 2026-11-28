import path from 'node:path';
import { createApp } from './app.ts';


const server = createApp({ publicDir: path.join(import.meta.dirname, '..', 'public') });
server.listen(3000, () => console.log('http://localhost:3000'));