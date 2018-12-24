let initialized: boolean = false;
let state: string = 'Cold Start';
console.log('Echo Cold Start');
let fn = 'echo';

export const echo = (event, context, callback) => {
  const st = process.hrtime();
  let msg: string = 'No Message';
  if (event.queryStringParameters && event.queryStringParameters.msg) {
    msg = event.queryStringParameters.msg;
  }
  let req: any = {
    awsRequestId: context.awsRequestId,
    requestId: event.requestContext.requestId,
    Via: event.headers.Via,
    'X-Forwarded-For': event.headers['X-Forwarded-For']
  };

  const et = process.hrtime(st);
  let execTime = `${1000000*et[0] + et[1]/1000} micro secs`;
  let resp = {
    statusCode: 200,
    body: JSON.stringify({fn, state, msg, req, execTime}, null, 2),
    headers: { 'Content-Type': 'application/json' },
  };
  if (!initialized) {
    initialized = true;
    state = 'Running';
  }
  callback(null, resp);
};