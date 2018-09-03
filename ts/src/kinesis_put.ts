const AWS = require('aws-sdk');

const B = 1000000000; // 1 Billion, no. of nanoseconds in a second
function hrtime2Seconds(hrtime: number[]): number {
  return (hrtime[0]*B + hrtime[1])/B
}

AWS.config.apiVersions = {
  kinesis: '2013-12-02'
};

let kinesis = new AWS.Kinesis();
export const put = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;
  const value = event.body;

  const st = process.hrtime();
  var params = {
    Data: value,
    PartitionKey: key,
    StreamName: process.env.streamName
  };
  kinesis.putRecord(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      throw err;
    } else {
      console.log(`Time in Kinesis call: ${hrtime2Seconds(process.hrtime(st))}`);
      console.log(`kinesisPut succeeded: (${key}, ${value}). response data: ${data}`);
      callback(null, {statusCode: 200, body: JSON.stringify(data, null, 2)});
    }
  });
}
