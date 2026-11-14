import { MongoClient, type Db } from "mongodb";

export class StorageUnavailableError extends Error {
  constructor() { super("Content storage is unavailable. Please try again later."); }
}

const shared = globalThis as typeof globalThis & { atelierMongo?: Promise<MongoClient> };

/** One bounded connection pool per server process; failed connections may be retried. */
export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new StorageUnavailableError();
  if (!shared.atelierMongo) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10, minPoolSize: 0, maxIdleTimeMS: 60_000,
      serverSelectionTimeoutMS: 5_000, connectTimeoutMS: 5_000,
      waitQueueTimeoutMS: 5_000, retryWrites: true,
    });
    shared.atelierMongo = client.connect().catch(async () => {
      shared.atelierMongo = undefined;
      await client.close().catch(() => {});
      throw new StorageUnavailableError();
    });
  }
  const client = await shared.atelierMongo;
  return client.db(process.env.MONGODB_DB_NAME?.trim() || "atelier");
}
