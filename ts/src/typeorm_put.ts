import { createConnection, Connection } from 'typeorm';
import { KVP } from './KVP';

const B = 1000000000; // 1 Billion, no. of nanoseconds in a second
function hrtime2Seconds(hrtime: number[]): number {
  return (hrtime[0]*B + hrtime[1])/B
}
export const put = async (event, context, callback) => {
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
    console.log(`Time in DB ops: ${hrtime2Seconds(process.hrtime(st))}`);
    console.log(`put succeeded: (${key}, ${value})`);
    callback(null, {statusCode: 200});
  } catch (err) {
    if (conn) {
      await conn.close();
    }
    console.log('put failed:', err);
    callback(null, {statusCode: 500, body: `put failed: ${err}`});
  }
}
