import * as mysql from 'mysql';

let initialized: boolean = false;
let state: string = 'Cold Start';
let fn = 'rds_put';

export const put = (event, context, callback) => {
  const st = process.hrtime();
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;
  const value = event.body;
  
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
      let op = `PUT(${key}, ${value})`;
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
  });
}
