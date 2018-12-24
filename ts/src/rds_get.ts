import * as mysql from 'mysql';

let initialized: boolean = false;
let state: string = 'Cold Start';
let fn = 'rds_get';

export const get = (event, context, callback) => {
  const st = process.hrtime();
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;

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
