const interval = setInterval(() => {
    console.log('tick', Date.now());
}, 100);

setTimeout(() => {
    console.log('Start timeout');
    const start = Date.now();

    while (Date.now() - start < 2000) {
    }
    console.log('Finish timout logic');
    clearInterval(interval);
}, 1000);