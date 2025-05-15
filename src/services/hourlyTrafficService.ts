import { MongoClient } from 'mongodb';
import { calculateGlobalStats } from './globalStatsService';
// import cron from 'node-cron';
import { DeviceData } from '@/types/network';

const MONGO_URI = 'mongodb://10.229.40.76:27017/';
const DB_NAME = 'NDR_database';
const COLLECTION_NAME = 'hourly_traffic';

async function recordHourlyTraffic(devices: DeviceData[]) {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION_NAME);

    // compute current stats
    const stats = calculateGlobalStats(devices);
    const now = new Date();
    const hourKey = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

    // fetch previous hour entry
    const prevDate = new Date(hourKey.getTime() - 1000 * 60 * 60);
    const prevEntry = await col.findOne({ timestamp: prevDate });

    // calculate delta
    const deltaReceived = prevEntry
      ? stats.totalBytesReceived - prevEntry.totalBytesReceived
      : stats.totalBytesReceived;
    const deltaSent = prevEntry
      ? stats.totalBytesSent - prevEntry.totalBytesSent
      : stats.totalBytesSent;

    // store
    await col.updateOne(
      { timestamp: hourKey },
      { $set: {
          timestamp: hourKey,
          totalBytesReceived: stats.totalBytesReceived,
          totalBytesSent: stats.totalBytesSent,
          deltaReceived,
          deltaSent
      }},
      { upsert: true }
    );
  } finally {
    await client.close();
  }
}