import * as mysql from 'mysql';

let initialized: boolean = false;
let state: string = 'Cold Start';
let fn = 'rds_get2';

let conn = null;
function ensureDBConnection(cb) {
  if (!conn) {
    conn = mysql.createConnection({
      host: process.env.host,
      user: process.env.user,
      password: process.env.password,
      database: process.env.database
    });
    conn.connect(function(err) {
      if (err) {
        console.error('error connecting:', err);
        conn = null;
        return;
      }
      console.log('Connected to DB. Thread Id:', conn.threadId);
    });
  }
  cb();
}

export const get2 = (event, context, callback) => {
  const st = process.hrtime();
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;

  ensureDBConnection(function(){
    const sql = `SELECT value FROM kvpairs WHERE \`key\`='${key}'`;
    conn.query(sql, function (err, result) {
      if (err) {
        conn.destroy();
        conn = null;
        throw err;
      }
      let value;
      if (result && result.length > 0) {
        value = (new Buffer(result[0].value)).toString('utf8');
      } else {
        value = 'entry not found.';
      }
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
  });
}
