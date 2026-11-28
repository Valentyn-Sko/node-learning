import path from 'node:path';
import { createApp } from './app.ts';


const server = createApp({ publicDir: path.join(import.meta.dirname, '..', 'public') });
server.listen(3000, () => console.log('http://localhost:3000'));

function shutdown(signal: string) {
  console.log(`${signal}: закрываю сервер...`);
  server.close(() => {                       // новые соединения не принимаем, ждём текущие
    console.log('Сервер остановлен');
    process.exit(0);
  });
  server.closeIdleConnections();             // простаивающие keep-alive закрыть сразу
  setTimeout(() => {
    console.error('Не успели за 10 с — выходим принудительно');
    process.exit(1);
  }, 10_000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));