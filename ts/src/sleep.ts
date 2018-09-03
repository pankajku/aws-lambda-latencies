
let initialized: boolean = false;
let state: string = 'Cold Start';

console.log('Sleep Cold Start');

function sleepSecs(secs: number) {
  return new Promise(resolve => setTimeout(resolve, secs * 1000));
}
export const sleep = async (event, context, callback) => {
  let secs: number = 1;
  if (event.queryStringParameters && event.queryStringParameters.secs) {
    secs = parseInt(event.queryStringParameters.secs);
  }
  console.log(`Sleeping for ${secs} secs.`)
  await sleepSecs(secs);

  let resp = {
    statusCode: 200,
    body: JSON.stringify({state, 'message': `Slept for ${secs} secs.`}),
    headers: { 'Content-Type': 'application/json' },
  };
  if (!initialized) {
    initialized = true;
    state = 'Running';
  }
  callback(null, resp);
};