// Helper functions

const checkAuthentication = (req, env) => {
	if (req.headers.get('authorization') !== env.DROPTOP_APIKEY) {
		return createErrorResponse('Unauthorized', 401, 'You need to specify a valid API KEY.');
	}
	return null;
};

const createErrorResponse = (type, status, message) => {
	return new Response(
		JSON.stringify({
			error: { type, status, message },
		}),
		{ status }
	);
};

const createGitHubHeaders = (githubApiKey) => ({
	Accept: 'application/vnd.github+json',
	Authorization: `Bearer ${githubApiKey}`,
	'X-GitHub-Api-Version': '2022-11-28',
	'User-Agent': 'droptop-api',
});

const handleError = (error) => {
	if (error instanceof Response) {
		return error;
	}
	return createErrorResponse('Something went wrong', 500, error.message);
};

const validateNumericId = (id) => {
	if (isNaN(id)) {
		return createErrorResponse('Invalid id', 400, `The '${id}' id is not a number.`);
	}
	return null;
};

export { checkAuthentication, createErrorResponse,  createGitHubHeaders, handleError, validateNumericId };
