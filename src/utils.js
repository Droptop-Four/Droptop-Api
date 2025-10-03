// Helper functions
const createErrorResponse = (type, status, message) => {
    return new Response(
        JSON.stringify({
            error: { type, status, message }
        }),
        { status }
    );
};

const validateNumericId = (id) => {
    if (isNaN(id)) {
        return createErrorResponse('Invalid id', 400, `The '${id}' id is not a number.`);
    }
    return null;
};

const checkAuthentication = (req, env) => {
    if (req.headers.get('authorization') !== env.DROPTOP_APIKEY) {
        return createErrorResponse('Unauthorized', 401, 'You need to specify a valid API KEY.');
    }
    return null;
};

const createGitHubHeaders = (githubApiKey) => ({
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${githubApiKey}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'droptop-api',
});

const handleMongoError = (error) => {
    if (error instanceof Response) {
        return error;
    }
    return createErrorResponse('Something went wrong', 500, error.message);
};

// Generic handler for finding items by ID with validation
const handleFindById = async (env, id, findFunction, itemType, dbName, collection) => {
    const validationError = validateNumericId(id);
    if (validationError) return validationError;

    try {
        const item = await findFunction(env, dbName, collection, id);
        if (!item) {
            return createErrorResponse('Not found', 404, `The ${itemType} with the '${id}' id does not exist.`);
        }
        return new Response(JSON.stringify(item));
    } catch (error) {
        return handleMongoError(error);
    }
};

// Generic handler for download endpoints
const handleDownloadById = async (env, id, findFunction, itemType, dbName, collection) => {
    const validationError = validateNumericId(id);
    if (validationError) return validationError;

    try {
        const item = await findFunction(env, dbName, collection, id);
        if (!item) {
            return createErrorResponse('Not found', 404, `The ${itemType} with the '${id}' id does not exist.`);
        }
        return new Response(null, {
            status: 303,
            headers: { Location: item.direct_download_link }
        });
    } catch (error) {
        return handleMongoError(error);
    }
};

export {
    createErrorResponse,
    validateNumericId,
    checkAuthentication,
    createGitHubHeaders,
    handleMongoError,
    handleFindById,
    handleDownloadById
}
