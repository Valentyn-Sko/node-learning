import { createApp } from './app.ts';



const server = createApp();
server.listen(3000, () => console.log('http://localhost:3000'));