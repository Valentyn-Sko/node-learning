/*
1. Напишите fakeRequest(name, ms), которая через ms миллисекунд возвращает
name. Запустите три запроса (300, 500, 700 мс) последовательно и параллельно,
замерьте время через performance.now().
2. withTimeout(promise, ms) через Promise.race : если промис не успел — reject с
Error('Timeout').
3. retry(fn, attempts, delayMs) : вызывает async-функцию, при ошибке повторяет до
attempts раз с паузой. Протестируйте функцией, которая падает первые 2 раза.
4. Воспроизведите ошибку с forEach + async, затем исправьте двумя способами.
5. Через Promise.allSettled «отправьте» 5 уведомлений, 2 из которых падают;
выведите «доставлено: 3, ошибок: 2».
6.
*Со звёздочкой: mapWithConcurrency(items, limit, fn) — обработать массив, но не
более limit операций одновременно.
*/
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
import {chunk} from '../utils/array.js'

/* 1 */
const fakeRequest = (name, ms) => (delay(ms).then(() => {
    console.log('Выполнилось: ', name);
    return name;
}));
const start1 = performance.now();
console.log(await fakeRequest('name 300', 300));
console.log(await fakeRequest('name 500', 500));
console.log(await fakeRequest('name 700', 700));
const end1 = performance.now();
console.log(end1 - start1);

const start2 = performance.now();
const [a, b, c] = await Promise.all([fakeRequest('name 300', 300), fakeRequest('name 500', 500), fakeRequest('name 700', 700)]);
const end2 = performance.now();
console.log(end2 - start2);

assert.ok(end1 - start1 >= 1500);
assert.ok(end2 - start2 < 800);

/* 2 */
function withTimeout(promise, ms) {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Timeout')), ms);
    });

    return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}
await withTimeout(fakeRequest('name 300', 300), 400).then(console.log).catch(console.error);
await withTimeout(fakeRequest('name 500', 500), 400).then(console.log).catch(console.error);
await withTimeout(fakeRequest('name 700', 700), 700).then(console.log).catch(console.error);


/* 3 */
let counter = 0;

const fakeRequest3Rd = async () => {
    counter++;

    console.log(`Attempt: ${counter}`);

    if (counter <= 2) {
        throw new Error('Request failed');
    }

    return 'Success!';
};

const fakeRequest1St = async () => {
    counter++;

    console.log(`Attempt: ${counter}`);

    if (counter > 1){
        throw new Error('Request failed');
    }

    return 'Success!';
};


async function retry(fn, attempts, delayMs) {
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();  
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error.message);

            if (i === attempts-1) {
                throw error;
            }
            await delay(delayMs)
        }   
    }
}

const result = await retry(fakeRequest3Rd, 3, 100);
assert.equal(result, 'Success!');
assert.equal(counter, 3);  

counter = 0;
await assert.rejects(
    retry(fakeRequest3Rd, 2, 100),
    /Request failed/
);
assert.equal(counter, 2)
counter = 0;
const result1 = await retry(fakeRequest1St, 1, 100);
assert.equal(result1, 'Success!');


/* 4 */
const items = [2300, 2500, 2700];
items.forEach(async (item) => { await fakeRequest('forEach name '+ item, item); });
console.log('готово - результата не дожидались, все три подряд без задержки');

for (const item of items) await fakeRequest('for name ' + item, item);

await Promise.all(items.map((item) => fakeRequest('Promise.all name ' + item, item)));

/* 5 */
const sendNotification = (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if ([2, 4].includes(id)) {
                reject(new Error(`Notification ${id} failed`));
            } else {
                resolve(`Notification ${id} delivered`);
            }
        }, 500);
    });
};

async function sendAllNotifications() {
    const notifications = Array.from({ length: 5 }, (_, i) =>
        sendNotification(i + 1)
    );

    const results = await Promise.allSettled(notifications);

    const delivered = results.filter(
        result => result.status === 'fulfilled'
    ).length;

    const errors = results.filter(
        result => result.status === 'rejected'
    ).length;

    console.log(`доставлено: ${delivered}, ошибок: ${errors}`);
}

await sendAllNotifications();


/* 6 */
const items6th = [300, 500, 700, 200, 400];
async function mapWithConcurrency(items, limit, fn) {
    const chunkArr = chunk(items, limit);
    const results = [];

    for (const [index, batch] of chunkArr.entries()) {
        results.push(...await Promise.all(batch.map(fn)));
        console.log(`Batch ${index + 1} completed`);
    }

    return results;
}

const results = await mapWithConcurrency(
  items6th,
  2,                                             
  (ms) => fakeRequest(`name ${ms}`, ms),
);

console.log(results)


async function mapWithConcurrencyW(items, limit, fn) {
     if (!Number.isInteger(limit) || limit <= 0) {
        throw new RangeError(`limit должен быть целым числом > 0, получено: ${limit}`);
    }
    const results = new Array(items.length);
    let index = 0;

    async function worker() {
        while (index < items.length) {
            const currentIndex = index++;

            results[currentIndex] = await fn(items[currentIndex], currentIndex);
        }
    }

    const workers = Array.from(
        { length: Math.min(limit, items.length) },
        () => worker()
    );

    await Promise.all(workers);

    return results;
}

let active = 0;
let maxActive = 0;

async function fakeRequestForW(item) {
    active++;
    maxActive = Math.max(maxActive, active);
    console.log(`Start ${item}. Active: ${active}`);
    await delay(Math.random() * 500);
    active--;
    console.log(`Finish ${item}. Active: ${active}`);
    return `${item} done`;
}

const itemsW = [1, 2, 3, 4, 5, 6, 7];

const resultW = await mapWithConcurrencyW(itemsW, 3, fakeRequestForW);

console.log(resultW);
console.log('Max concurrent:', maxActive);

await assert.rejects(mapWithConcurrencyW([1, 2], 0, fakeRequestForW), RangeError);

console.log('All done')

console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');