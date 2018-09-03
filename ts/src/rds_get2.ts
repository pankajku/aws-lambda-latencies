import * as mysql from 'mysql';

const B = 1000000000; // 1 Billion, no. of nanoseconds in a second
function hrtime2Seconds(hrtime: number[]): number {
  return (hrtime[0]*B + hrtime[1])/B
}

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
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;

  ensureDBConnection(function(){
    const st = process.hrtime();
    const sql = `SELECT value FROM kvpairs WHERE \`key\`='${key}'`;
    conn.query(sql, function (err, result) {
      if (err) {
        conn.destroy();
        conn = null;
        throw err;
      }
      console.log(`Time in DB ops: ${hrtime2Seconds(process.hrtime(st))}`);
      if (result && result.length > 0) {
        console.log('rdsGet succeeded:', result[0].value);
        callback(null, { statusCode: 200, body: (new Buffer(result[0].value)).toString('utf8') });
      } else {
        console.log(`entry not found.`);
        callback(null, { statusCode: 404, body: 'entry not found' });
      }
    });
  });
}
