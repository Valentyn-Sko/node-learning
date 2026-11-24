import { createServer } from "node:http";
createServer((req, res) => {
  console.log(req.method, req.url, req.headers);
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Привет из Node\n");
}).listen(3000, () => console.log("http://localhost:3000"));

/*
    localhost:
        HTTP/1.1 200 OK
        Content-Type: text/plain; charset=utf-8
        Date: Tue, 24 Nov 2026 15:18:19 GMT
        Connection: keep-alive
        Keep-Alive: timeout=5
        Transfer-Encoding: chunked


    favicon: 
        HTTP/1.1 200 OK
        Content-Type: text/plain; charset=utf-8
        Date: Tue, 24 Nov 2026 15:18:19 GMT
        Connection: keep-alive
        Keep-Alive: timeout=5
        Transfer-Encoding: chunked
    */

    /*
        2 запроса, т.к. подгужается штмл страница, которая использует и иконку тоже.

        в консоле сервера 1 запрос: ip откуда пришел запрос и т.д...
        платформа, что может приянть..
        {
            host: 'localhost:3000',
            connection: 'keep-alive',
            pragma: 'no-cache',
            'cache-control': 'no-cache',
            'sec-ch-ua-platform': '"macOS"',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="152", "Not?A_Brand";v="24", "Google Chrome";v="152"',
            'sec-ch-ua-mobile': '?0',
            accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/ *,* / *;q=0.8',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'no-cors',
            'sec-fetch-dest': 'image',
            referer: 'http://localhost:3000/asdasd',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'en-US,en;q=0.9,uk-UA;q=0.8,uk;q=0.7,ru;q=0.6'
            }
    */