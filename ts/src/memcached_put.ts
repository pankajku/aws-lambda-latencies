let Memcached = require('memcached');

const B = 1000000000; // 1 Billion, no. of nanoseconds in a second
function hrtime2Seconds(hrtime: number[]): number {
  return (hrtime[0]*B + hrtime[1])/B
}

export const put = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;
  const value = event.body;

  const st = process.hrtime();
  let memcached = new Memcached(process.env.memcachedEndPoint);

  memcached.set(`pankaj:latencies:${key}`, value, 3600, function(err) {
    if (err) {
      throw err;
    }
    console.log(`Time in memcached op: ${hrtime2Seconds(process.hrtime(st))}`);
    console.log('memcachedPut succeeded:', value);
    callback(null, { statusCode: 200 });
  });
}
