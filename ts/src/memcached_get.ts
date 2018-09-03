let Memcached = require('memcached');

const B = 1000000000; // 1 Billion, no. of nanoseconds in a second
function hrtime2Seconds(hrtime: number[]): number {
  return (hrtime[0]*B + hrtime[1])/B
}

export const get = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;

  const st = process.hrtime();
  let memcached = new Memcached(process.env.memcachedEndPoint);

  memcached.get(`pankaj:latencies:${key}`, function(err, data) {
    if (err) {
      throw err;
    }
    console.log(`Time in memcached op: ${hrtime2Seconds(process.hrtime(st))}`);
    if (data) {
      console.log('memcachedGet succeeded:', data);
      callback(null, { statusCode: 200, body: (new Buffer(data)).toString('utf8') });
    } else {
      console.log(`entry not found.`);
      callback(null, { statusCode: 404, body: 'entry not found' });
    }
  });
}
