async function callDurableObject(env, method, ...args) {
    const id = env.MONGODB_DURABLE_OBJECT.idFromName('mongodb-connector');
    const stub = env.MONGODB_DURABLE_OBJECT.get(id);
    
    const request = new Request('http://internal/mongodb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, args })
    });
    
    const response = await stub.fetch(request);
    
    if (!response.ok) {
        throw new Error(await response.text());
    }
    
    return await response.json();
}

async function findAppById(env, dbName, collectionName, id) {
    return await callDurableObject(env, 'findAppById', dbName, collectionName, id);
}

async function findAppByUuid(env, dbName, collectionName, uuid) {
    return await callDurableObject(env, 'findAppByUuid', dbName, collectionName, uuid);
}

async function findAllApps(env, dbName, collectionName) {
    return await callDurableObject(env, 'findAllApps', dbName, collectionName);
}

async function findThemeById(env, dbName, collectionName, id) {
    return await callDurableObject(env, 'findThemeById', dbName, collectionName, id);
}

async function findThemeByUuid(env, dbName, collectionName, uuid) {
    return await callDurableObject(env, 'findThemeByUuid', dbName, collectionName, uuid);
}

async function findAllThemes(env, dbName, collectionName) {
    return await callDurableObject(env, 'findAllThemes', dbName, collectionName);
}

async function updateDownloads(env, dbName, collectionName, uuid) {
    return await callDurableObject(env, 'updateDownloads', dbName, collectionName, uuid);
}

async function findOneDocument(env, dbName, collectionName, query) {
    return await callDurableObject(env, 'findOneDocument', dbName, collectionName, query);
}

export {
    findAppById,
    findAppByUuid,
    findAllApps,
    findThemeById,
    findThemeByUuid,
    findAllThemes,
    updateDownloads,
    findOneDocument
};