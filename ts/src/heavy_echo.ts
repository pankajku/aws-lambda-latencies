let AWS = require('aws-sdk');
let Memcached = require('memcached');
let typeorm = require('typeorm');

let initialized: boolean = false;
let state: string = 'Cold Start';

console.log('Heavy Echo Cold Start');
export const heavyEcho = (event, context, callback) => {
  var lambda = new AWS.Lambda({
    region: 'us-west-2' //change to your region
  });
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
  let resp = {
    statusCode: 200,
    body: JSON.stringify({state, msg, req}, null, 2),
    headers: { 'Content-Type': 'application/json' },
  };
  if (!initialized) {
    initialized = true;
    state = 'Running';
  }
  callback(null, resp);
}