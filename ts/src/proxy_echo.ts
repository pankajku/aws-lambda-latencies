
import * as AWS from 'aws-sdk';

let initialized: boolean = false;
let state: string = 'Cold Start';
console.log('Proxy Echo Cold Start');
let fn = 'proxy_echo';

export const proxyEcho = (event, context, callback) => {
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

  var lambda = new AWS.Lambda({
    region: process.env['AWS_REGION']
  });

  const ownName = process.env['AWS_LAMBDA_FUNCTION_NAME'];
  lambda.invoke({
    FunctionName: ownName.replace('proxyEcho', 'echo'),
    Payload: JSON.stringify(event) // pass params
  }, function(error, data) {
    const et = process.hrtime(st);
    let execTime = `${1000000*et[0] + et[1]/1000} micro secs`;
    let respToProxy = '';
    if (error) {
      respToProxy = `error: ${error}`;
    } else if (data && data.Payload) {
      var stmt = JSON.parse(<string>data.Payload);
      if (stmt.errorMessage){
        respToProxy = `stmt.errorMessage: ${stmt.errorMessage}`;
      } else {
        respToProxy = `stmt: ${JSON.stringify(stmt, null, 2)}`;
      }
    } else {
      respToProxy = `error: No Payload`;
    }
    let env = JSON.stringify(process.env, null, 2);
    let resp = {
      statusCode: 200,
      body: JSON.stringify({fn, state, msg, req, respToProxy, execTime}, null, 2),
      headers: { 'Content-Type': 'application/json' },
    };
    if (!initialized) {
      initialized = true;
      state = 'Running';
    }
    callback(null, resp);
  });
}