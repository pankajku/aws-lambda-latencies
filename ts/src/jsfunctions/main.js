const utils = require('./utils');

if (process.argv.length < 5) {
    console.log(`
Usage::
    node main.js <function> <array-size> <loop-count>

Descriptions::
    Invokes the specified function <function> <loop-count> times,
    passing an array of length <array-size>, filled with ranodm integers in range [0, 1024],
    as argument and reports execution time for each invocation.
    `);
    process.exit(0);
}

const funcName = process.argv[2];
const arraySize = Number(process.argv[3]);
const loopCount = Number(process.argv[4]);

const fns = require('./' + funcName);
console.log(`function:   ${funcName}`);
console.log(`array-size: ${arraySize}`);
console.log(`loop-count: ${loopCount}`);
for (let i = 0; i < loopCount; i++) {
    const execTime = runFn(arraySize);
    console.log(`${i}: ${utils.rjust(execTime)} ns`);
}

function runFn(arraySize) {
    const src = [];
    for (let i = 0; i < arraySize; i++) {
        src[i] = Math.floor(Math.random() * 1024);
    }

    const st = process.hrtime();
    const result = fns.fn(src);
    const et = process.hrtime(st);
    const execTime = (et[0] * (10 ** 9) + et[1]);
    if (!fns.validate(src, result)) {
        console.log('Validation failed.');
        process.exit(1);
    }
    return execTime;
}
