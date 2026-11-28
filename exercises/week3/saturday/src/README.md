с защитой:
curl -i "localhost:3000/..%2F..%2F..%2F..%2Fpackage.json"
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8
Content-Length: 41
Date: Sat, 28 Nov 2026 11:29:33 GMT
Connection: keep-alive
Keep-Alive: timeout=5

без защиты:
curl -i "localhost:3000/..%2F..%2F..%2F..%2Fpackage.json"
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 750
Date: Sat, 28 Nov 2026 11:30:26 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{
  "name": "node-learning",
  "version": "1.0.0",
  "description": "",
  "private": true,
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "node --test notes-cli/test/*.test.ts exercises/week3/*/test/*.test.ts",
    "check": "npm run typecheck && npm test"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Valentyn-Sko/node-learning.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "bugs": {
    "url": "https://github.com/Valentyn-Sko/node-learning/issues"
  },
  "homepage": "https://github.com/Valentyn-Sko/node-learning#readme",
  "devDependencies": {
    "@types/node": "^26.6.6",
    "typescript": "^7.0.2"
  },
  "bin": {
    "notes": "./notes-cli/src/cli.ts"
  }
}