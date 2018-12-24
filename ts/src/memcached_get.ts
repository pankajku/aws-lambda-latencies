let Memcached = require('memcached');

let initialized: boolean = false;
let state: string = 'Cold Start';
let fn = 'memcached_get';

export const get = (event, context, callback) => {
  const st = process.hrtime();
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;

  let memcached = new Memcached(process.env.memcachedEndPoint);

  memcached.get(`pankaj:latencies:${key}`, function(err, data) {
    if (err) {
      throw err;
    }
    const value = data ? (new Buffer(data)).toString('utf8') : `entry not found`;

    const et = process.hrtime(st);
    let execTime = `${1000000*et[0] + et[1]/1000} micro secs`;
    let resp = {
      statusCode: 200,
      body: JSON.stringify({fn, state, value, execTime}, null, 2),
      headers: { 'Content-Type': 'application/json' },
    };
    if (!initialized) {
      initialized = true;
      state = 'Running';
    }
    callback(null, resp);
  });
}
