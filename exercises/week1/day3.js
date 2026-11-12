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
const [a, b, c] = await Promise.all([fakeRequest('name 300', 300), fakeRequest('name 300', 500), fakeRequest('name 300', 700)]);
const end2 = performance.now();
console.log(end2 - start2);

/* 2 */
function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), ms);
    });

    return Promise.race([promise, timeout]);
}
withTimeout(fakeRequest('name 300', 300), 400).then(console.log).catch(console.error);
withTimeout(fakeRequest('name 500', 500), 400).then(console.log).catch(console.error);
withTimeout(fakeRequest('name 700', 700), 700).then(console.log).catch(console.error);


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

sendAllNotifications();


/* 6 */