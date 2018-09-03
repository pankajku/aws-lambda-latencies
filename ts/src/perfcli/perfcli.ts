import axios from 'axios';

const commandLineArgs = require('command-line-args');
const B = 1000000000; // 1 Billion, no. of nanoseconds in a second
function hrtime2Seconds(hrtime: number[]): number {
  return (hrtime[0]*B + hrtime[1])/B
}
const optionDefinitions = [
	{ name: 'url', alias: 'u', type: String },
	{ name: 'method', alias: 'm', type: String, defaultValue: 'get' },
	{ name: 'threads', alias: 't', type: Number, defaultValue: 1 },
	{ name: 'times', alias: 'n', type: Number, defaultValue: 1 },
	{ name: 'minDelay', alias: 'x', type: Number, defaultValue: 100 },
	{ name: 'maxDelay', alias: 'X', type: Number, defaultValue: 1000 },
];
const options = commandLineArgs(optionDefinitions);

if (!options.url) {
	console.log('No url specified');
	process.exit(1);
}
if (options.maxDelay <= options.minDelay) {
	options.maxDelay = options.minDelay + 1
}
console.log('options:', options);
execute().catch(error => { console.log('Error:', error); });

async function execute() {
	const st = process.hrtime();
	for (let i = 0; i < options.threads; i++) {
		await clientSimulator(i);
	}
	const et = process.hrtime(st);
	console.log(`Total Elapsed Time: ${hrtime2Seconds(et)} secs`);
}

async function sleepMilliSecs(msecs: number) {
	return new Promise(resolve => setTimeout(resolve, msecs));
}

async function clientSimulator(index: number) {
	let [firstDuration, minDuration, maxDuration, totalDuration, avgDuration] = [0.0, 100.0, 0.0, 0.0, 0.0];
	const start = process.hrtime();
	for (let k = 0; k < options.times; k++) {
		const delay = options.minDelay + Math.floor(Math.random()*(options.maxDelay - options.minDelay));
		await sleepMilliSecs(delay);
		const st = process.hrtime();
		let et = null;
		try {
			await axios.get(options.url);
			et = process.hrtime(st);
		} catch (e) {
			console.log(`[${index}, ${k}] Error:`, e);
			continue;
		}
		let respDuration = hrtime2Seconds(et);
		console.log(`[${index}, ${k}] Response Time: ${respDuration} secs.`);
		if (k === 0) {
			firstDuration = respDuration;
		} else {
			totalDuration += respDuration
			if (respDuration < minDuration) {
				minDuration = respDuration;
			} else if (respDuration > maxDuration) {
				maxDuration = respDuration
			}
		}
	}
	if (options.times > 1) {
		avgDuration = totalDuration/(options.times - 1);
	}
	const elapsedDuration = hrtime2Seconds(process.hrtime(start));
	console.log(`[${index}] Times: ${options.times}, Elapsed: ${elapsedDuration.toFixed(3)} secs, ` +
		`First: ${firstDuration.toFixed(3)} secs, Min: ${minDuration.toFixed(3)} secs, ` +
		`Max: ${maxDuration.toFixed(3)} secs, Avg: ${avgDuration.toFixed(3)} secs`);
}
