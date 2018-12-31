let initialized: boolean = false;
let state: string = 'Cold Start';
console.log('Echo Cold Start');

function square4Helper(body) {
  const arr = JSON.parse(body);
  for (let i = 0; i < arr.length; i++) {
    arr[i] *= arr[i];
  }
  return JSON.stringify(arr, null, 2);
}

export const square4 = (event, context, callback) => {
  const st = process.hrtime();
  const result = square4Helper(event.body);
  const et = process.hrtime(st);
  let execTime = `${1000000000*et[0] + et[1]} ns`;
  let resp = {
    statusCode: 200,
    body: result,
    headers: { 'Content-Type': 'application/json' },
  };
  console.log(`state: ${state}, exec time: ${execTime}, inp length: ${event.body.length}, out length: ${result.length}`);
  if (!initialized) {
    initialized = true;
    state = 'Running';
  }
  callback(null, resp);
};
