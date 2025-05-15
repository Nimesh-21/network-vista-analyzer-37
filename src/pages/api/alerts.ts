import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://10.229.40.76:27017/';
const DB_NAME = 'NDR_database';
const COLLECTION_NAME = 'scan_detection';
let cachedClient: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1) CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');            // allow any origin (dev only!)
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // 2) Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    // 3) Actual GET logic
    if (req.method === 'GET') {
      try {
        const client = await getClient();
        const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
        const docs = await collection.find({}).sort({ _id: -1 }) .limit(100).toArray();
        console.log(docs);
        
        return res.status(200).json({ alerts: docs });
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
        return res.status(500).json({ error: 'Failed to fetch alerts.' });
      }
    }
  
    // // 4) Method not allowed
    // res.setHeader('Allow', 'GET,OPTIONS');
    // res.status(405).end('Method Not Allowed');
}
