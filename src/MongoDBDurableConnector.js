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
        if (!this.isConnected) {
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
    }

    async fetch(request) {
        try {
            const { method, args } = await request.json();
            
            // Chiama il metodo appropriato
            const result = await this[method](...args);
            
            return new Response(JSON.stringify(result), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Durable Object error:', error);
            return new Response(error.message, { status: 500 });
        }
    }

    async findById(dbName, collectionName, id) {
        await this.ensureConnection();
        const collection = this.client.db(dbName).collection(collectionName);
        return await collection.findOne({ id: Number(id) }, { projection: { _id: 0 } });
    }

    async findByUuid(dbName, collectionName, uuid) {
        await this.ensureConnection();
        const collection = this.client.db(dbName).collection(collectionName);
        return await collection.findOne({ uuid: uuid }, { projection: { _id: 0 } });
    }

    async findAll(dbName, collectionName) {
        await this.ensureConnection();
        const collection = this.client.db(dbName).collection(collectionName);
        return await collection.find({}, { projection: { _id: 0 } }).toArray();
    }

    async updateDownloads(dbName, collectionName, uuid) {
        await this.ensureConnection();
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

    async findOneDocument(dbName, collectionName, query) {
        await this.ensureConnection();
        const collection = this.client.db(dbName).collection(collectionName);
        return await collection.findOne(query, { projection: { _id: 0 } });
    }

    // Metodi specializzati
    async findAppById(dbName, collectionName, id) {
        return await this.findById(dbName, collectionName, id);
    }

    async findAppByUuid(dbName, collectionName, uuid) {
        return await this.findByUuid(dbName, collectionName, uuid);
    }

    async findAllApps(dbName, collectionName) {
        return await this.findAll(dbName, collectionName);
    }

    async findThemeById(dbName, collectionName, id) {
        return await this.findById(dbName, collectionName, id);
    }

    async findThemeByUuid(dbName, collectionName, uuid) {
        return await this.findByUuid(dbName, collectionName, uuid);
    }

    async findAllThemes(dbName, collectionName) {
        return await this.findAll(dbName, collectionName);
    }
}