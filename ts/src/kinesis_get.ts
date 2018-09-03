const AWS = require('aws-sdk');

const B = 1000000000; // 1 Billion, no. of nanoseconds in a second
function hrtime2Seconds(hrtime: number[]): number {
  return (hrtime[0]*B + hrtime[1])/B
}

AWS.config.apiVersions = {
  kinesis: '2013-12-02'
};

let kinesis = new AWS.Kinesis();
export const get = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let sn = null;
  if (event.queryStringParameters && event.queryStringParameters.sn) {
    sn = event.queryStringParameters.sn;
  }

  const st = process.hrtime();
  let params: any = {
    ShardId: process.env.shardId,
    ShardIteratorType: 'LATEST',
    StreamName: process.env.streamName
  };
  if (event.queryStringParameters && event.queryStringParameters.ssn) {
    params.ShardIteratorType = 'AT_SEQUENCE_NUMBER';
    params.StartingSequenceNumber = event.queryStringParameters.ssn;
  }
  kinesis.getShardIterator(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      throw err;
    } else {
      console.log(`Time in Kinesis getShardIterator call: ${hrtime2Seconds(process.hrtime(st))}`);
      console.log(`getShardIterator succeeded: ${data}`);
      const st1 = process.hrtime();
      params = { // Reuse variable
        ShardIterator: data.ShardIterator,
        Limit: 5
      };
      kinesis.getRecords(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          throw err;
        } else {
          console.log(`Time in Kinesis getRecords call: ${hrtime2Seconds(process.hrtime(st1))}`);
          console.log(`kinesisGet succeeded: ${JSON.stringify(data, null, 2)}`);
          callback(null, {statusCode: 200, body: JSON.stringify(data, null, 2)});
        }
      });
    }
  });

}
