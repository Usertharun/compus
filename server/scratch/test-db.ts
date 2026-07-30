import { Client } from 'pg';

const passwords = [
  'compus_password',
  'compus',
  'postgres',
  'admin',
  'password',
  '123456',
  '12345678',
  '12345',
  '1234',
  '123',
  'root',
  'tharun'
];

const users = ['postgres', 'compus_user'];

async function findCredentials() {
  for (const user of users) {
    for (const pw of passwords) {
      const connectionString = `postgresql://${user}:${pw}@localhost:5432/postgres`;
      const client = new Client({ connectionString });
      try {
        await client.connect();
        console.log(`✅ SUCCESS WITH CONNECTION: ${connectionString}`);
        await client.end();
        return;
      } catch (err: any) {
        console.log(`❌ Failed with ${user}:${pw}: ${err.message}`);
      }
    }
  }
}

findCredentials();
