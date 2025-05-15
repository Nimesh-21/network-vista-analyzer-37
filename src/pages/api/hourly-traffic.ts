import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://10.229.40.76:27017/';
const DB_NAME = 'NDR_database';
const COLLECTION_NAME = 'hourly_traffic';
let cachedClient: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const client = await getClient();
      const col = client.db(DB_NAME).collection(COLLECTION_NAME);

      const now = new Date();
      const since = new Date(now.getTime() - 11 * 60 * 60 * 1000);

      const docs = await col
        .find({ timestamp: { $gte: since } })
        .sort({ timestamp: 1 })
        .limit(12)
        .toArray();

      const data = docs.map(doc => ({
        time: doc.timestamp.getHours().toString().padStart(2, '0') + ':00',
        received: doc.deltaReceived,
        sent: doc.deltaSent
      }));

      // return as array directly
      return res.status(200).json(data);
    } catch (err) {
      console.error('Error fetching hourly traffic:', err);
      return res.status(500).json({ error: 'Failed to fetch hourly traffic.' });
    }
  }

  res.setHeader('Allow', 'GET,OPTIONS');
  res.status(405).end('Method Not Allowed');
}