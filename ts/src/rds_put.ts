import * as mysql from 'mysql';

const B = 1000000000; // 1 Billion, no. of nanoseconds in a second
function hrtime2Seconds(hrtime: number[]): number {
  return (hrtime[0]*B + hrtime[1])/B
}

export const put = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;
  const value = event.body;

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
    const sql = `INSERT INTO kvpairs (\`key\`, value) VALUES('${key}', '${value}') ON DUPLICATE KEY UPDATE value='${value}'`;
    con.query(sql, function (err, result) {
      if (err) {
        con.destroy();
        throw err;
      }
      con.destroy();
      console.log(`Time in DB ops: ${hrtime2Seconds(process.hrtime(st))}`);
      console.log(`rdsPut succeeded: (${key}, ${value})`);
      callback(null, {statusCode: 200});
    });
  });
}
