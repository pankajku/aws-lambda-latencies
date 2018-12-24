let Memcached = require('memcached');

let initialized: boolean = false;
let state: string = 'Cold Start';
let fn = 'memcached_put';

export const put = (event, context, callback) => {
  const st = process.hrtime();
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;
  const value = event.body;

  let memcached = new Memcached(process.env.memcachedEndPoint);

  memcached.set(`pankaj:latencies:${key}`, value, 3600, function(err) {
    if (err) {
      throw err;
    }
    let op = `SET(${key}, ${value})`;
    const et = process.hrtime(st);
    let execTime = `${1000000*et[0] + et[1]/1000} micro secs`;
    let resp = {
      statusCode: 200,
      body: JSON.stringify({fn, state, op, execTime}, null, 2),
      headers: { 'Content-Type': 'application/json' },
    };
    if (!initialized) {
      initialized = true;
      state = 'Running';
    }
    callback(null, resp);
  });
}
