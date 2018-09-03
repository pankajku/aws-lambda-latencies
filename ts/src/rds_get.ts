import * as mysql from 'mysql';

const B = 1000000000; // 1 Billion, no. of nanoseconds in a second
function hrtime2Seconds(hrtime: number[]): number {
  return (hrtime[0]*B + hrtime[1])/B
}

export const get = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;

  const st = process.hrtime();
  var con = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
  });

  con.connect(function(err) {
    if (err) {
      con.destroy();
      throw err;
    }
    console.log("Connected to DB!");
    const sql = `SELECT value FROM kvpairs WHERE \`key\`='${key}'`;
    con.query(sql, function (err, result) {
      if (err) {
        con.destroy();
        throw err;
      }
      con.destroy();
      console.log(`Time in DB ops: ${hrtime2Seconds(process.hrtime(st))}`);
      if (result && result.length > 0) {
        console.log('rdsGet succeeded:', result[0].value);
        callback(null, {statusCode: 200, body: (new Buffer(result[0].value)).toString('utf8')});
      } else {
        console.log(`entry not found.`);
        callback(null, { statusCode: 404, body: 'entry not found' });
      }
    });
  });
}
