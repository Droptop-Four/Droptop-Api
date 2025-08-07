
const { MongoClient } = require('mongodb');

let clientInstance = null;

function getClient(uri) {

    clientInstance ??= new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        retryWrites: true,
        retryReads: true,
    });

    return clientInstance;
}

async function withMongoClient(uri, dbName, collectionName, operation) {
    const client = getClient(uri);

    try {
        await client.connect();
        const collection = client.db(dbName).collection(collectionName);
        return await operation(collection);
    } catch (error) {
        console.error("MongoDB operation error:", error);
        throw new Response(
            JSON.stringify({
                error: {
                    type: 'Database Error',
                    status: 500,
                    message: 'Failed to connect to database or retrieve data.',
                },
            }),
            { status: 500 }
        );
    } finally {
        try {
            await client.close();
        } catch (closeError) {
            console.error("Error closing MongoDB connection:", closeError);
        }
    }
}

async function findById(uri, dbName, collectionName, id) {
    return await withMongoClient(uri, dbName, collectionName,
        async (collection) => {
            return await collection.findOne({ id: Number(id) }, { projection: { _id: 0 } });
        }
    );
}

async function findByUuid(uri, dbName, collectionName, uuid) {
    return await withMongoClient(uri, dbName, collectionName,
        async (collection) => {
            return await collection.findOne({ uuid: uuid }, { projection: { _id: 0 } });
        }
    );
}

async function findAll(uri, dbName, collectionName) {
    return await withMongoClient(uri, dbName, collectionName,
        async (collection) => {
            return await collection.find({}, { projection: { _id: 0 } }).toArray();
        }
    );
}

async function findAppById(uri, dbName, collectionName, id) {
    return await findById(uri, dbName, collectionName, id);
}

async function findAppByUuid(uri, dbName, collectionName, uuid) {
    return await findByUuid(uri, dbName, collectionName, uuid);
}

async function findAllApps(uri, dbName, collectionName) {
    return await findAll(uri, dbName, collectionName);
}

async function findThemeById(uri, dbName, collectionName, id) {
    return await findById(uri, dbName, collectionName, id);
}

async function findThemeByUuid(uri, dbName, collectionName, uuid) {
    return await findByUuid(uri, dbName, collectionName, uuid);
}

async function findAllThemes(uri, dbName, collectionName) {
    return await findAll(uri, dbName, collectionName);
}

async function updateDownloads(uri, dbName, collectionName, uuid) {
    return await withMongoClient(uri, dbName, collectionName,
        async (collection) => {
            const item = await collection.findOne({ uuid: uuid }, { projection: { _id: 0 } });
            if (item) {
                const downloads = item.downloads + 1;
                await collection.updateOne({ uuid: uuid }, { $set: { downloads } });
                item.downloads = downloads;
                return item;
            }
            return null;
        }
    );
}

async function findOneDocument(uri, dbName, collectionName, query) {
    return await withMongoClient(uri, dbName, collectionName,
        async (collection) => {
            return await collection.findOne(query, { projection: { _id: 0 } });
        }
    );
}

export {
    withMongoClient,
    findById,
    findByUuid,
    findAll,
    findAppById,
    findAppByUuid,
    findAllApps,
    findThemeById,
    findThemeByUuid,
    findAllThemes,
    updateDownloads,
    findOneDocument
};
