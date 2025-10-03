import { DurableObject } from "cloudflare:workers";
import { MongoClient } from "mongodb";

export class MongoDBDurableConnector extends DurableObject {
    constructor(state, env) {
        super(state, env);
        this.env = env;
        this.client = null;
        this.isConnected = false;
    }

    async ensureConnection() {
        console.error("ensuring connection")
        if (!this.isConnected) {
            console.error("MongoDB client is not connected");
            try {
                this.client = new MongoClient(this.env.MONGO_URI, {
                    serverSelectionTimeoutMS: 5000,
                    maxIdleTimeMS: 20 * 1000,
                });
                
                await this.client.connect();
                this.isConnected = true;
            } catch (error) {
                console.error('MongoDB connection error:', error);
                throw error;
            }
        }
        console.error("MongoDB client is connected");
    }

    async findOne(dbName, collectionName, { id, uuid, name, query } = {}) {
        await this.ensureConnection();
        console.error("findOne")
    
        const collection = this.client.db(dbName).collection(collectionName);
        let searchQuery = {};
    
        if (id !== undefined) {
            searchQuery = { id: Number(id) };
        } else if (uuid !== undefined) {
            searchQuery = { uuid: uuid };
        } else if (name !== undefined) {
            searchQuery = { name: name };
        } else if (query !== undefined) {
            searchQuery = query;
        }
    
        return await collection.findOne(searchQuery, { projection: { _id: 0 } });
    }

    async findAll(dbName, collectionName) {
        await this.ensureConnection();
        console.error("findAll")

        const collection = this.client.db(dbName).collection(collectionName);

        return await collection.find({}, { projection: { _id: 0 } }).toArray();
    }

    async updateDownloads(dbName, collectionName, uuid) {
        await this.ensureConnection();
        console.error("updateDownloads")

        const collection = this.client.db(dbName).collection(collectionName);

        const item = await collection.findOne({ uuid: uuid }, { projection: { _id: 0 } });
        if (item) {
            const downloads = item.downloads + 1;
            await collection.updateOne({ uuid: uuid }, { $set: { downloads } });
            item.downloads = downloads;
            return item;
        }
        return null;
    }
}