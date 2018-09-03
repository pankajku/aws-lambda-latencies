
import * as AWS from 'aws-sdk';

export const proxyEcho = (event, context, callback) => {
  var lambda = new AWS.Lambda({
    region: 'us-west-2' //change to your region
  });
  const st = process.hrtime();
  lambda.invoke({
    FunctionName: 'aws-lambda-latencies-pankajk-echo',
    Payload: JSON.stringify(event) // pass params
  }, function(error, data) {
    const et = process.hrtime(st);
    console.log('Elapsed Time:' , et[0], 'secs, ', Math.round(et[1]/1000000), 'milli secs.');
    if (error) {
      console.error('error:', error);
      context.done('error', error);
    }
    if (data && data.Payload) {
      var stmt = JSON.parse(<string>data.Payload);
      if (stmt.errorMessage){
        console.log("stmt.errorMessage:", stmt.errorMessage);
        context.fail(stmt.errorMessage);
      } else {
        console.log("stmt:", stmt);
        context.succeed(stmt);
      }
    } else {
      console.log("data:", data);
      context.fail("No Payload");
    }
  });
}