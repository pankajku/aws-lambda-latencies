import { createConnection, Connection } from 'typeorm';
import { KVP } from './KVP';

let initialized: boolean = false;
let state: string = 'Cold Start';
let fn = 'typeorm_put';

export const put = async (event, context, callback) => {
  const st = process.hrtime();
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;
  const value = event.body;

  let conn: Connection = null;
  try {
    const st = process.hrtime();
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
    let kvp = await kvpRepo.findOne({ key });
    if (kvp){
      kvp.value = value;
    } else {
      kvp = new KVP();
      kvp.key = key;
      kvp.value = value;
    }
    
    await kvpRepo.save(kvp);
    await conn.close();
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
  } catch (err) {
    if (conn) {
      await conn.close();
    }
    console.log('put failed:', err);
    callback(null, {statusCode: 500, body: `put failed: ${err}`});
  }
}
