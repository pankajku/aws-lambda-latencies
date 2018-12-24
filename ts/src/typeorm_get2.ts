import { createConnection, Connection } from 'typeorm';
import { KVP } from './KVP';


let initialized: boolean = false;
let state: string = 'Cold Start';
let fn = 'typeorm_get2';

let conn: Connection = null;
async function ensureDBConnection() {
  if (!conn) {
    conn = await createConnection({
      type: "mysql",
      host: process.env.host,
      port: 3306,
      username: process.env.user,
      password: process.env.password,
      database: process.env.database,
      entities: [KVP],
      synchronize: false,
      logging: false
    });
  }
}
export const get2 = async (event, context, callback) => {
  const st = process.hrtime();
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;

  try {
    await ensureDBConnection();
    let kvpRepo = conn.getRepository(KVP);
    const kvp = await kvpRepo.findOne({ key });
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
