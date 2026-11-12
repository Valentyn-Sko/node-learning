import assert from 'node:assert/strict';

const arr = [1, 2, 4, 5, 6, 7, 3, 2, 1, 4, 6, 123, 324, 112];

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const groupKey = item[key];      // например 'paid'
    acc[groupKey] ??= [];            // если группы ещё нет, создаём пустой массив
    acc[groupKey].push(item);
    return acc;                      // reduce обязательно должен вернуть аккумулятор
  }, {});                            // начальное значение — пустой объект
}

const orders = [
  { id: 1, status: 'paid' },
  { id: 2, status: 'new' },
  { id: 3, status: 'paid' },
];

console.log(groupBy(orders, 'status'));

// 1. Основной случай: результат совпадает с ожидаемым объектом целиком
assert.deepEqual(groupBy(orders, 'status'), {
  paid: [{ id: 1, status: 'paid' }, { id: 3, status: 'paid' }],
  new: [{ id: 2, status: 'new' }],
});

// 2. Граничный случай: пустой массив
assert.deepEqual(groupBy([], 'status'), {});

// 3. Точечная проверка одного значения
assert.equal(groupBy(orders, 'status').paid.length, 2);




// findDuplicates(arr) → массив значений, встречающихся больше одного раза. Через Set / Map, за один проход.
function findDuplicates(arr) {
    const arrMap = new Map();
    for (const element of arr) {
        arrMap.set(element, (arrMap.get(element) ?? 0) + 1);
    }
    const arrRes = [...arrMap.entries()].filter(([key, value]) => value > 1).map(([key]) => key);
    return arrRes;
}

console.log(findDuplicates(arr));

assert.deepEqual(findDuplicates(arr), [1, 2, 4, 6]);
assert.deepEqual(findDuplicates([]), []);
assert.equal(findDuplicates(arr).length, 4);

//chunk(arr, size) → chunk([1, 2, 3, 4, 5], 2) = [[1, 2], [3, 4], [5]](пригодится для батч-вставки в БД).
function chunk(arr, size) {
    if (!Number.isInteger(size) || size <= 0) {
        throw new RangeError(`size должен быть целым числом > 0, получено: ${size}`);
    }
    const res = arr.reduce((acc, item, index) => {
        const chunkIndex = Math.floor(index / size);
        if (!acc[chunkIndex]) {
            acc[chunkIndex] = [];
        }
        acc[chunkIndex].push(item);
        return acc;
    }, []);
    return res;
}


console.log(chunk(arr, 2));
assert.deepEqual(chunk(arr, 2), [
  [ 1, 2 ],
  [ 4, 5 ],
  [ 6, 7 ],
  [ 3, 2 ],
  [ 1, 4 ],
  [ 6, 123 ],
  [ 324, 112 ]
]);
assert.deepEqual(chunk([], 5), []);
assert.throws(() => chunk([1], 0), RangeError);
assert.throws(() => chunk([1, 2, 3], -1), RangeError)
assert.equal(chunk(arr, 2).length, 7);
assert.equal(chunk(arr, 3).length, 5);
assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);

// countBy(arr, fn) → Map «ключ → количество».
function countBy(arr, fn) {
    const resMap = new Map();
    for (const item of arr) {
        const key = fn(item)
        resMap.set(key, (resMap.get(key) ?? 0) + 1);
    }
    return resMap;
}

console.log((countBy(orders, (order) => order.status)))
assert.deepEqual(countBy(orders, (order) => order.status), new Map(Object.entries({new: 1, paid: 2})));
assert.deepEqual(countBy([], (order) => order.status), new Map());
assert.equal([...countBy(orders, (order) => order.status)].length, 2);

console.log(countBy(arr, (n) => (n % 2 === 0 ? 'even' : 'odd')));


// uniqueBy(arr, key) → убрать дубли по полю, оставить первое вхождение.

const users = [
  { id: 1, email: 'ann@mail.com', name: 'Ann' },
  { id: 2, email: 'bob@mail.com', name: 'Bob' },
  { id: 3, email: 'ann@mail.com', name: 'Anna' }, 
];

function uniqueBy(arr, key) {
    const uniqueSet = new Set();
    const result = [];
    for (const item of arr) {
        if (!uniqueSet.has(item[key])) {
            uniqueSet.add(item[key]);
            result.push(item);
        }
    }
    return result;
}

console.log(uniqueBy(users, 'email'));
assert.deepEqual(uniqueBy(users, 'email'), [
  { id: 1, email: 'ann@mail.com', name: 'Ann' },
  { id: 2, email: 'bob@mail.com', name: 'Bob' }
]);
assert.deepEqual(uniqueBy([], 'email'), []);
assert.equal(uniqueBy(users, 'email').length, 2);


// pick(obj, keys) и omit(obj, keys) — без мутации исходного объекта.
const user = { id: 1, name: 'Ann', email: 'ann@mail.com', password: 'hash' };
const cloneUser = structuredClone(user);

function pick(obj, keys) {
    const newObj = {};
    for (const key of keys) {
        if (Object.hasOwn(obj, key)) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}

function omit(obj, keys) {
    const newObj = {};
    for (const key of Object.keys(obj)) {
        if (!keys.includes(key)) {
            newObj[key] = obj[key];
        }
    }

    return newObj;
}
console.log(pick(user, ['id', 'name']));
console.log(pick(user, ['id', 'age']));
assert.deepEqual(pick(user, ['id', 'name']), { id: 1, name: 'Ann' });
assert.deepEqual(pick(user, ['id', 'age']), { id: 1 });

console.log(omit(user, ['password']));

assert.deepEqual(omit(user, ['password', 'age']), { id: 1, name: 'Ann', email: 'ann@mail.com' });

assert.deepEqual(user, cloneUser);
console.log('Все проверки прошли');