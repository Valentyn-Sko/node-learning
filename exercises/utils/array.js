export function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const groupKey = item[key];      // например 'paid'
    acc[groupKey] ??= [];            // если группы ещё нет, создаём пустой массив
    acc[groupKey].push(item);
    return acc;                      // reduce обязательно должен вернуть аккумулятор
  }, {});                            // начальное значение — пустой объект
}

export function findDuplicates(arr) {
    const arrMap = new Map();
    for (const element of arr) {
        arrMap.set(element, (arrMap.get(element) ?? 0) + 1);
    }
    const arrRes = [...arrMap.entries()].filter(([key, value]) => value > 1).map(([key]) => key);
    return arrRes;
}

export function chunk(arr, size) {
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

export function countBy(arr, fn) {
    const resMap = new Map();
    for (const item of arr) {
        const key = fn(item)
        resMap.set(key, (resMap.get(key) ?? 0) + 1);
    }
    return resMap;
}


export function uniqueBy(arr, key) {
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


export function pick(obj, keys) {
    const newObj = {};
    for (const key of keys) {
        if (Object.hasOwn(obj, key)) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}

export function omit(obj, keys) {
    const newObj = {};
    for (const key of Object.keys(obj)) {
        if (!keys.includes(key)) {
            newObj[key] = obj[key];
        }
    }

    return newObj;
}