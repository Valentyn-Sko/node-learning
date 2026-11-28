с защитой:
curl -i "localhost:3000/..%2F..%2Fpackage.json"
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8
Content-Length: 41
Date: Sat, 28 Nov 2026 11:18:36 GMT
Connection: keep-alive
Keep-Alive: timeout=5

без защиты:
curl -i "localhost:3000/..%2F..%2Fpackage.json"
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
Content-Length: 38
Date: Sat, 28 Nov 2026 11:20:19 GMT
Connection: keep-alive
Keep-Alive: timeout=5