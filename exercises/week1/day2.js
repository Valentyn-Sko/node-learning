import assert from 'node:assert/strict';

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

console.log('Все проверки прошли');