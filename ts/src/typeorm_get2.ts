import { createConnection, Connection } from 'typeorm';
import { KVP } from './KVP';

const B = 1000000000; // 1 Billion, no. of nanoseconds in a second
function hrtime2Seconds(hrtime: number[]): number {
  return (hrtime[0]*B + hrtime[1])/B
}
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
  context.callbackWaitsForEmptyEventLoop = false;
  const key = event.pathParameters.key;

  try {
    await ensureDBConnection();
    const st = process.hrtime();
    let kvpRepo = conn.getRepository(KVP);
    const kvp = await kvpRepo.findOne({ key });
    console.log(`Time in DB ops: ${hrtime2Seconds(process.hrtime(st))}`);
    if (kvp) {
      console.log(`get succeeded: (${kvp.key}, ${kvp.value})`);
      callback(null, { statusCode: 200, body: kvp.value });
    } else {
      console.log(`entry not found.`);
      callback(null, { statusCode: 404, body: 'entry not found' });
    }
  } catch (err) {
    if (conn) {
      await conn.close();
    }
    console.log('get failed:', err);
    callback(null, { statusCode: 500, body: `get failed: ${err}` });
  }
}
