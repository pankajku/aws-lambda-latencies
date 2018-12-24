if (process.argv.length < 5) {
    console.log('Usage:: node main.js <function> <array-size> <loop-count>');
    process.exit(0);
}

const funcName = process.argv[2];
const arraySize = Number(process.argv[3]);
const loopCount = Number(process.argv[4]);

const fns = require('./' + funcName);
console.log(`function:   ${funcName}`);
console.log(`array-size: ${arraySize}`);
console.log(`loop-count: ${loopCount}`);

execute().then(() => {}).catch(err => console.log(err));

async function execute() {
    for (let i = 0; i < loopCount; i++) {
        const execTime = await runFn(arraySize);
        console.log(`${i}: ${rjust(execTime)} ns`);
    }
}

async function runFn(arraySize) {
    const src = [];
    for (let i = 0; i < arraySize; i++) {
        src[i] = Math.floor(Math.random() * (1024 + 1));
    }

    const st = process.hrtime();
    const result = await fns.fn(src);
    const et = process.hrtime(st);
    const execTime = (et[0] * (10 ** 9) + et[1]);
    if (!fns.validate(src, result)) {
        console.log('Validation failed.');
        process.exit(1);
    }
    return execTime;
}

function rjust(e) {
    let s = '' + e;
    while (s.length < 10) {
        s = ' ' + s;
    }
    return s;
}
