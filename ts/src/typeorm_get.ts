import { createConnection, Connection } from 'typeorm';
import { KVP } from './KVP';

let initialized: boolean = false;
let state: string = 'Cold Start';
let fn = 'typeorm_get';

export const get = async (event, context, callback) => {
  const st = process.hrtime();
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;

  let conn: Connection = null;
  try {
    const conn = await createConnection({
      type: "mysql",
      host: process.env.host,
      port: 3306,
      username: process.env.user,
      password: process.env.password,
      database: process.env.database,
      entities: [KVP],
      synchronize: true,
      logging: false
    });
    let kvpRepo = conn.getRepository(KVP);
    const kvp = await kvpRepo.findOne({ key });
    await conn.close();
    let value = kvp ? kvp.value : `entry not found.`;
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
  } catch (err) {
    if (conn) {
      await conn.close();
    }
    console.log('get failed:', err);
    callback(null, { statusCode: 500, body: `get failed: ${err}` });
  }
}
