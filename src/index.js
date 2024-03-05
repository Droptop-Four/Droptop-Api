import { Router } from '@tsndr/cloudflare-worker-router';

import endpoints from './enpoints';

import login from './realm_login';

const router = new Router();

const apiVersion = '/v1';

// Enabling build in CORS support
router.cors();

// router.debug();

// Register global middleware
// router.use(({ env, req }) => {
//     // Intercept if token doesn't match
//     if (req.headers.get('authorization') !== env.SECRET_TOKEN)
//         return new Response(null, { status: 401 })
// })

// '/'
router.get('/', () => {
	return new Response(
		JSON.stringify({
			error: {
				type: 'Bad Request',
				status: 400,
				message: 'You need to specify the api version.'
			}
		}),
		{ status: 400 }
	);
});

// /v1/
router.get(`${apiVersion}`, () => {
	return new Response(JSON.stringify(endpoints));
});

// /v1/changelog
router.get(`${apiVersion}/changelog/`, async () => {
	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/changelog.json');
	const changelogData = await response.json();

	return new Response(JSON.stringify(changelogData.changelog));
});

// /v1/changelog/[version]
router.get(`${apiVersion}/changelog/:version`, async ({ req }) => {
	const version = req.params.version;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/changelog.json');
	const changelogData = await response.json();

	if (!version) {
		return new Response(JSON.stringify(changelogData.changelog));
	}

	const changenote = changelogData.changelog.find(entry => entry.version === version);

	if (!changenote) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The changenote with the '${version}' version does not exist.`
				}
			}),
			{ status: 404 }
		);
	}

	return new Response(JSON.stringify(changenote));
});

// /v1/community-apps/id
router.get(`${apiVersion}/community-apps/id`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-apps/'
		}
	});
});

// /v1/community-apps/name
router.get(`${apiVersion}/community-apps/name`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-apps/'
		}
	});
});

// /v1/community-apps/uuid
router.get(`${apiVersion}/community-apps/uuid`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-apps/'
		}
	});
});

// /v1/community-apps
router.get(`${apiVersion}/community-apps/`, async () => {
	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const communityAppsData = await response.json();

	return new Response(JSON.stringify(communityAppsData.apps));
});

// /v1/community-apps/[id]
router.get(`${apiVersion}/community-apps/:id`, async ({ req }) => {
	const id = req.params.id;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const communityAppsData = await response.json();

	if (isNaN(id)) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Invalid id',
					status: 400,
					message: `The '${id}' id is not a number.`
				}
			}),
			{ status: 400 }
		);
	}

	const app = communityAppsData.apps.find(app => app.app.id === Number(id));

	if (!app) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the '${id}' id does not exist.`
				}
			}),
			{ status: 404 }
		);
	}

	return new Response(JSON.stringify(app.app));
});

// /v1/community-apps/id/[id]
router.get(`${apiVersion}/community-apps/id/:id`, async ({ req }) => {
	const id = req.params.id;

	if (isNaN(id)) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Invalid id',
					status: 400,
					message: `The '${id}' id is not a number.`
				}
			}),
			{ status: 400 }
		);
	}

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const communityAppsData = await response.json();

	const app = communityAppsData.apps.find(app => app.app.id === Number(id));

	if (!app) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the '${id}' id does not exist.`
				}
			}),
			{ status: 404 }
		);
	}

	return new Response(JSON.stringify(app.app));
});

// /v1/community-apps/name/[name]
router.get(`${apiVersion}/community-apps/name/:name`, async ({ req }) => {
	const name = decodeURIComponent(req.params.name);

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const communityAppsData = await response.json();

	const app = communityAppsData.apps.find(app => app.app.name.toLowerCase() == name.toLowerCase());

	if (!app) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the "'${name}' name does not exist.`
				}
			}),
			{ status: 404 }
		);
	}

	return new Response(JSON.stringify(app.app));
});

// /v1/community-apps/uuid/[uuid]
router.get(`${apiVersion}/community-apps/uuid/:uuid`, async ({ req }) => {
	const uuid = req.params.uuid;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const communityAppsData = await response.json();

	const app = communityAppsData.apps.find(app => app.app.uuid == uuid);

	if (!app) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the '${uuid}' uuid does not exist.`
				}
			}),
			{ status: 404 }
		);
	}

	return new Response(JSON.stringify(app.app));
});

// /v1/community-themes/id
router.get(`${apiVersion}/community-themes/id`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-themes/'
		}
	});
});

// /v1/community-themes/name
router.get(`${apiVersion}/community-themes/name`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-themes/'
		}
	});
});

// /v1/community-themes/uuid
router.get(`${apiVersion}/community-themes/uuid`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-themes/'
		}
	});
});

// /v1/community-themes
router.get(`${apiVersion}/community-themes/`, async () => {
	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const communityThemesData = await response.json();

	return new Response(JSON.stringify(communityThemesData.themes));
});

// /v1/community-themes/[id]
router.get(`${apiVersion}/community-themes/:id`, async ({ req }) => {
	const id = req.params.id;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const communityThemesData = await response.json();

	if (isNaN(id)) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Invalid id',
					status: 400,
					message: `The '${id}' id is not a number.`
				}
			}),
			{ status: 400 }
		);
	}

	const theme = communityThemesData.themes.find(theme => theme.theme.id === Number(id));

	if (!theme) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the '${id}' id does not exist.`
				}
			}),
			{ status: 404 }
		);
	}

	return new Response(JSON.stringify(theme.theme));
});

// /v1/community-themes/id/[id]
router.get(`${apiVersion}/community-themes/id/:id`, async ({ req }) => {
	const id = req.params.id;

	if (isNaN(id)) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Invalid id',
					status: 400,
					message: `The '${id}' id is not a number.`
				}
			}),
			{ status: 400 }
		);
	}

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const communityThemesData = await response.json();

	const theme = communityThemesData.themes.find(theme => theme.theme.id === Number(id));

	if (!theme) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the '${id}' id does not exist.`
				}
			}),
			{ status: 404 }
		);
	}

	return new Response(JSON.stringify(theme.theme));
});

// /v1/community-themes/name/[name]
router.get(`${apiVersion}/community-themes/name/:name`, async ({ req }) => {
	const name = decodeURIComponent(req.params.name);

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const communityThemesData = await response.json();

	const theme = communityThemesData.themes.find(theme => theme.theme.name.toLowerCase() == name.toLowerCase());

	if (!theme) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the "'${name}' name does not exist.`
				}
			}),
			{ status: 404 }
		);
	}

	return new Response(JSON.stringify(theme.theme));
});

// /v1/community-themes/uuid/[uuid]
router.get(`${apiVersion}/community-themes/uuid/:uuid`, async ({ req }) => {
	const uuid = req.params.uuid;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const communityThemesData = await response.json();

	const theme = communityThemesData.themes.find(theme => theme.theme.uuid == uuid);

	if (!theme) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the '${uuid}' uuid does not exist.`
				}
			}),
			{ status: 404 }
		);
	}

	return new Response(JSON.stringify(theme.theme));
});

// /v1/downloads
router.get(`${apiVersion}/downloads`, async ({ env, req }) => {
	const user = await login(env.REALM_APPID, env.REALM_APIKEY);
	const collection = user
		.mongoClient('mongodb-atlas')
		.db(env.DB)
		.collection(env.DROPTOP_COLLECTION);

	try {
		const downloadsDocument = await collection.findOne({ title: 'downloads' });

		let basic_downloads = downloadsDocument.basic_downloads;
		let update_downloads = downloadsDocument.update_downloads;

		return new Response(JSON.stringify({ basic_downloads: basic_downloads, update_downloads: update_downloads }));
	} catch (error) {
		console.error('Error updating downloads:', error.message);

		return new Response(
			JSON.stringify({
				error: {
					type: 'Something went wrong',
					status: 500,
					message: error.message
				}
			}),
			{ status: 500 }
		);
	}
});

// /v1/downloads/community-apps
router.get(`${apiVersion}/downloads/community-apps`, async ({ env, req }) => {
	return new Response(
		JSON.stringify({
			error: {
				type: 'Bad Request',
				status: 400,
				message: 'You need to specify an uuid.'
			}
		}),
		{ status: 400 }
	);
});

router.post(`${apiVersion}/downloads/community-apps`, async ({ env, req }) => {
	return new Response(
		JSON.stringify({
			error: {
				type: 'Bad Request',
				status: 400,
				message: 'You need to specify an uuid.'
			}
		}),
		{ status: 400 }
	);
});

// /v1/downloads/community-apps/[uuid]
router.get(`${apiVersion}/downloads/community-apps/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	const user = await login(env.REALM_APPID, env.REALM_APIKEY);
	const collection = user
		.mongoClient('mongodb-atlas')
		.db(env.DB)
		.collection(env.APPS_COLLECTION);

	try {
		const app = await collection.findOne({ uuid: uuid });

		if (!app) {
			return new Response(
				JSON.stringify({
					error: {
						type: 'Not found',
						status: 404,
						message: `The app with the '${uuid}' uuid does not exist.`
					}
				}),
				{ status: 404 }
			);
		}

		const app_data = {
			uuid: app.uuid,
			downloads: app.downloads
		};

		return new Response(JSON.stringify(app_data));
	} catch (error) {
		console.error('Error updating downloads:', error.message);

		return new Response(
			JSON.stringify({
				error: {
					type: 'Something went wrong',
					status: 500,
					message: error.message
				}
			}),
			{ status: 500 }
		);
	}
});

router.post(`${apiVersion}/downloads/community-apps/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	console.log(uuid);

	const user = await login(env.REALM_APPID, env.REALM_APIKEY);
	const collection = user
		.mongoClient('mongodb-atlas')
		.db(env.DB)
		.collection(env.APPS_COLLECTION);

	try {
		const app = await collection.findOne({ uuid: uuid });

		if (!app) {
			await collection.insertOne({
				uuid: uuid,
				downloads: 1
			});
			let downloads = 1;

			const app_data = {
				uuid: uuid,
				downloads: downloads
			};

			return new Response(JSON.stringify(app_data));
		} else {
			let downloads = app.downloads + 1;

			await collection.updateOne({ uuid: uuid }, { $set: { downloads } });
			console.log('Downloads updated successfully');

			const app_data = {
				uuid: app.uuid,
				downloads: downloads
			};

			return new Response(JSON.stringify(app_data));
		}
	} catch (error) {
		console.error('Error updating downloads:', error.message);

		return new Response(
			JSON.stringify({
				error: {
					type: 'Something went wrong',
					status: 500,
					message: error.message
				}
			}),
			{ status: 500 }
		);
	}
});

// /v1/downloads/community-themes
router.get(`${apiVersion}/downloads/community-themes`, async ({ env, req }) => {
	return new Response(
		JSON.stringify({
			error: {
				type: 'Bad Request',
				status: 400,
				message: 'You need to specify an uuid.'
			}
		}),
		{ status: 400 }
	);
});

router.post(`${apiVersion}/downloads/community-themes`, async ({ env, req }) => {
	return new Response(
		JSON.stringify({
			error: {
				type: 'Bad Request',
				status: 400,
				message: 'You need to specify an uuid.'
			}
		}),
		{ status: 400 }
	);
});

// /v1/downloads/community-themes/[uuid]
router.get(`${apiVersion}/downloads/community-themes/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	const user = await login(env.REALM_APPID, env.REALM_APIKEY);
	const collection = user
		.mongoClient('mongodb-atlas')
		.db(env.DB)
		.collection(env.THEMES_COLLECTION);

	try {
		const theme = await collection.findOne({ uuid: uuid });

		if (!theme) {
			return new Response(
				JSON.stringify({
					error: {
						type: 'Not found',
						status: 404,
						message: `The theme with the '${uuid}' uuid does not exist.`
					}
				}),
				{ status: 404 }
			);
		}

		const theme_data = {
			uuid: theme.uuid,
			downloads: theme.downloads
		};

		return new Response(JSON.stringify(theme_data));
	} catch (error) {
		console.error('Error updating downloads:', error.message);

		return new Response(
			JSON.stringify({
				error: {
					type: 'Something went wrong',
					status: 500,
					message: error.message
				}
			}),
			{ status: 500 }
		);
	}
});

router.post(`${apiVersion}/downloads/community-themes/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	const user = await login(env.REALM_APPID, env.REALM_APIKEY);
	const collection = user
		.mongoClient('mongodb-atlas')
		.db(env.DB)
		.collection(env.THEMES_COLLECTION);

	try {
		const theme = await collection.findOne({ uuid: uuid });

		if (!theme) {
			await collection.insertOne({
				uuid: uuid,
				downloads: 1
			});
			let downloads = 1;

			const theme_data = {
				uuid: uuid,
				downloads: downloads
			};

			return new Response(JSON.stringify(theme_data));
		} else {
			let downloads = theme.downloads + 1;

			await collection.updateOne({ uuid: uuid }, { $set: { downloads } });
			console.log('Downloads updated successfully');

			const theme_data = {
				uuid: theme.uuid,
				downloads: downloads
			};

			return new Response(JSON.stringify(theme_data));
		}
	} catch (error) {
		console.error('Error updating downloads:', error.message);

		return new Response(
			JSON.stringify({
				error: {
					type: 'Something went wrong',
					status: 500,
					message: error.message
				}
			}),
			{ status: 500 }
		);
	}
});

router.any('*', () => {
	new Response(
		JSON.stringify({
			error: {
				type: 'Not Found',
				status: 404,
				message: '404, not found!'
			}
		}),
		{ status: 404 }
	);
});

export default {
	async fetch(request, env, ctx) {
		return router.handle(request, env, ctx);
	}
};
