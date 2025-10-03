import { Router } from '@tsndr/cloudflare-worker-router';
import { Toucan } from 'toucan-js';

import endpoints from './endpoints';
import { checkAuthentication, createErrorResponse, createGitHubHeaders, handleError, validateNumericId } from './utils';

export { MongoDBDurableConnector } from './MongoDBDurableConnector';

const router = new Router();
const apiVersion = '/v1';

function getProxy(env) {
	const id = env.MONGODB_DURABLE_OBJECT.idFromName('mongodb-connector');
	const proxy = env.MONGODB_DURABLE_OBJECT.get(id);

	return proxy;
}

// Enabling built-in CORS support
router.cors();

// '/'
router.get('/', () => {
	return createErrorResponse('Bad Request', 400, 'You need to specify the api version.');
});

// /v1
router.get(`${apiVersion}`, () => {
	return new Response(JSON.stringify(endpoints));
});

// /v1/announcements
router.get(`${apiVersion}/announcements`, async ({ env }) => {
	try {
		const response = await fetch(`https://github.com/Droptop-Four/${env.GLOBALDATA_REPO}/raw/main/data/announcements.json`);
		const announcements = await response.json();

		return new Response(JSON.stringify(announcements));
	} catch (error) {
		return handleError(error);
	}
});

router.post(
	`${apiVersion}/announcements`,
	async ({ env, req }) => {
		const authError = checkAuthentication(req, env);
		if (authError) return authError;
	},
	async ({ env, req }) => {
		try {
			let new_announcement = await req.json();

			const headers = createGitHubHeaders(env.GITHUB_APIKEY);

			let url = `https://api.github.com/repos/Droptop-Four/${env.GLOBALDATA_REPO}/contents/data/announcements.json`;

			let github_content = await fetch(url, {
				method: 'GET',
				headers: headers,
			});
			github_content = await github_content.json();

			let body = {
				message: 'New announcement',
				content: btoa(JSON.stringify(new_announcement, null, 4)),
				sha: github_content.sha,
			};

			let response = await fetch(`${url}`, {
				method: 'PUT',
				headers: headers,
				body: JSON.stringify(body),
			});

			const message = await response.json();

			if (response.status === 200) {
				return new Response(JSON.stringify(new_announcement));
			} else {
				return createErrorResponse(response.statusText, response.status, message);
			}
		} catch (error) {
			return handleError(error);
		}
	}
);

router.delete(
	`${apiVersion}/announcements`,
	async ({ env, req }) => {
		const authError = checkAuthentication(req, env);
		if (authError) return authError;
	},
	async ({ env }) => {
		try {
			let empty_obj = {
				app: {
					date: null,
					expiration: null,
					announcement: '',
					type: '',
				},
				website: {
					date: null,
					expiration: null,
					announcement: '',
					type: '',
				},
			};

			let headers = createGitHubHeaders(env.GITHUB_APIKEY);

			let url = `https://api.github.com/repos/Droptop-Four/${env.GLOBALDATA_REPO}/contents/data/announcements.json`;

			let github_content = await fetch(url, {
				method: 'GET',
				headers: headers,
			});
			github_content = await github_content.json();

			let body = {
				message: 'Deleted announcements',
				content: btoa(JSON.stringify(empty_obj, null, 4)),
				sha: github_content.sha,
			};

			let response;
			response = await fetch(`${url}`, {
				method: 'PUT',
				headers: headers,
				body: JSON.stringify(body),
			});

			const message = await response.json();

			if (response.status === 200) {
				return new Response(JSON.stringify(empty_obj));
			} else {
				return createErrorResponse(response.statusText, response.status, message);
			}
		} catch (error) {
			return handleError(error);
		}
	}
);

// /v1/announcements/[platform]
router.get(`${apiVersion}/announcements/:platform`, async ({ env, req }) => {
	const platform = decodeURIComponent(req.params.platform);

	try {
		const response = await fetch(`https://github.com/Droptop-Four/${env.GLOBALDATA_REPO}/raw/main/data/announcements.json`);
		const announcements = await response.json();

		if (platform === 'app') {
			return new Response(JSON.stringify(announcements.app));
		} else if (platform === 'website') {
			return new Response(JSON.stringify(announcements.website));
		}

		return new Response(JSON.stringify(announcements));
	} catch (error) {
		return handleError(error);
	}
});

router.post(
	`${apiVersion}/announcements/:platform`,
	async ({ env, req }) => {
		const authError = checkAuthentication(req, env);
		if (authError) return authError;
	},
	async ({ env, req }) => {
		try {
			const platform = decodeURIComponent(req.params.platform);

			if (platform !== 'app' && platform !== 'website') {
				return createErrorResponse('Bad Request', 400, 'You need to specify a correct platform [app, website].');
			}

			let platform_announcement = await req.json();

			let headers = createGitHubHeaders(env.GITHUB_APIKEY);

			let url = `https://api.github.com/repos/Droptop-Four/${env.GLOBALDATA_REPO}/contents/data/announcements.json`;

			let github_content = await fetch(url, {
				method: 'GET',
				headers: headers,
			});
			github_content = await github_content.json();
			let complete_announcement = JSON.parse(atob(github_content.content));

			let new_announcement;
			if (platform === 'app') {
				new_announcement = {
					app: platform_announcement,
					website: complete_announcement.website,
				};
			} else {
				new_announcement = {
					app: complete_announcement.app,
					website: platform_announcement,
				};
			}

			let body = {
				message: `New ${platform} announcement`,
				content: btoa(JSON.stringify(new_announcement, null, 4)),
				sha: github_content.sha,
			};

			let response = await fetch(`${url}`, {
				method: 'PUT',
				headers: headers,
				body: JSON.stringify(body),
			});

			const message = await response.json();

			if (response.status === 200) {
				return new Response(JSON.stringify(new_announcement));
			} else {
				return createErrorResponse(response.statusText, response.status, message);
			}
		} catch (error) {
			return handleError(error);
		}
	}
);

router.delete(
	`${apiVersion}/announcements/:platform`,
	async ({ env, req }) => {
		const authError = checkAuthentication(req, env);
		if (authError) return authError;
	},
	async ({ env, req }) => {
		try {
			const platform = decodeURIComponent(req.params.platform);

			if (platform !== 'app' && platform !== 'website') {
				return createErrorResponse('Bad Request', 400, 'You need to specify a correct platform [app, website].');
			}

			let headers = createGitHubHeaders(env.GITHUB_APIKEY);

			let url = `https://api.github.com/repos/Droptop-Four/${env.GLOBALDATA_REPO}/contents/data/announcements.json`;

			let github_content = await fetch(url, {
				method: 'GET',
				headers: headers,
			});
			github_content = await github_content.json();
			let complete_announcement = JSON.parse(atob(github_content.content));

			let empty_obj = {
				date: null,
				expiration: null,
				announcement: '',
				type: '',
			};

			let new_announcement;
			if (platform === 'app') {
				new_announcement = {
					app: empty_obj,
					website: complete_announcement.website,
				};
			} else {
				new_announcement = {
					app: complete_announcement.app,
					website: empty_obj,
				};
			}

			let body = {
				message: `Deleted ${platform} announcement`,
				content: btoa(JSON.stringify(new_announcement, null, 4)),
				sha: github_content.sha,
			};

			let response = await fetch(`${url}`, {
				method: 'PUT',
				headers: headers,
				body: JSON.stringify(body),
			});

			const message = await response.json();

			if (response.status === 200) {
				return new Response(JSON.stringify(new_announcement));
			} else {
				return createErrorResponse(response.statusText, response.status, message);
			}
		} catch (error) {
			return handleError(error);
		}
	}
);

// /v1/changelog
router.get(`${apiVersion}/changelog/`, async () => {
	try {
		const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/changelog.json');
		const changelogData = await response.json();

		return new Response(JSON.stringify(changelogData.changelog));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/changelog/[version]
router.get(`${apiVersion}/changelog/:version`, async ({ req }) => {
	try {
		const version = req.params.version;

		const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/changelog.json');
		const changelogData = await response.json();

		if (!version) {
			return new Response(JSON.stringify(changelogData.changelog));
		}

		const changenote = changelogData.changelog.find((entry) => entry.version === version);

		if (!changenote) {
			return createErrorResponse('Not found', 404, `The changenote with the '${version}' version does not exist.`);
		}

		return new Response(JSON.stringify(changenote));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-apps/id
router.get(`${apiVersion}/community-apps/id`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-apps/',
		},
	});
});

// /v1/community-apps/name
router.get(`${apiVersion}/community-apps/name`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-apps/',
		},
	});
});

// /v1/community-apps/uuid
router.get(`${apiVersion}/community-apps/uuid`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-apps/',
		},
	});
});

// /v1/community-apps
router.get(`${apiVersion}/community-apps/`, async ({ env }) => {
	try {
		const communityAppsData = await getProxy(env).findAll(env.CREATIONS_DB, env.APPS_COLLECTION);

		return new Response(JSON.stringify(communityAppsData));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-apps/[id]
router.get(`${apiVersion}/community-apps/:id`, async ({ env, req }) => {
	const id = req.params.id;

	const validationError = validateNumericId(id);
	if (validationError) return validationError;

	try {
		const app = await getProxy(env).findOne(env.CREATIONS_DB, env.APPS_COLLECTION, { id: id });

		if (!app) {
			return createErrorResponse('Not found', 404, `The app with the '${id}' id does not exist.`);
		}

		return new Response(JSON.stringify(app));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-apps/[id]/download
router.get(`${apiVersion}/community-apps/:id/download`, async ({ env, req }) => {
	const id = req.params.id;

	const validationError = validateNumericId(id);
	if (validationError) return validationError;

	try {
		const app = await getProxy(env).findOne(env.CREATIONS_DB, env.APPS_COLLECTION, { id: id });

		if (!app) {
			return createErrorResponse('Not found', 404, `The app with the '${id}' id does not exist.`);
		}

		return new Response(null, {
			status: 303,
			headers: {
				Location: app.direct_download_link,
			},
		});
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-apps/id/[id]
router.get(`${apiVersion}/community-apps/id/:id`, async ({ env, req }) => {
	const id = req.params.id;

	const validationError = validateNumericId(id);
	if (validationError) return validationError;

	try {
		const app = await getProxy(env).findOne(env.CREATIONS_DB, env.APPS_COLLECTION, { id: id });

		if (!app) {
			return createErrorResponse('Not found', 404, `The app with the '${id}' id does not exist.`);
		}

		return new Response(JSON.stringify(app));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-apps/id/[id]/download
router.get(`${apiVersion}/community-apps/id/:id/download`, async ({ env, req }) => {
	const id = req.params.id;

	const validationError = validateNumericId(id);
	if (validationError) return validationError;

	try {
		const app = await getProxy(env).findOne(env.CREATIONS_DB, env.APPS_COLLECTION, { id: id });

		if (!app) {
			return createErrorResponse('Not found', 404, `The app with the '${id}' id does not exist.`);
		}

		return new Response(null, {
			status: 303,
			headers: {
				Location: app.direct_download_link,
			},
		});
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-apps/name/[name]
router.get(`${apiVersion}/community-apps/name/:name`, async ({ env, req }) => {
	const name = decodeURIComponent(req.params.name);

	try {
		const app = await getProxy(env).findOne(env.CREATIONS_DB, env.APPS_COLLECTION, { name: name });

		if (!app) {
			return createErrorResponse('Not found', 404, `The app with the '${name}' name does not exist.`);
		}

		return new Response(JSON.stringify(app));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-apps/name/[name]/download
router.get(`${apiVersion}/community-apps/name/:name/download`, async ({ env, req }) => {
	const name = decodeURIComponent(req.params.name);

	try {
		const app = await getProxy(env).findOne(env.CREATIONS_DB, env.APPS_COLLECTION, { name: name });

		if (!app) {
			return createErrorResponse('Not found', 404, `The app with the '${name}' name does not exist.`);
		}

		return new Response(null, {
			status: 303,
			headers: {
				Location: app.direct_download_link,
			},
		});
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-apps/uuid/[uuid]
router.get(`${apiVersion}/community-apps/uuid/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	try {
		const app = await getProxy(env).findOne(env.CREATIONS_DB, env.APPS_COLLECTION, { uuid: uuid });

		if (!app) {
			return createErrorResponse('Not found', 404, `The app with the '${uuid}' uuid does not exist.`);
		}

		return new Response(JSON.stringify(app));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-apps/uuid/[uuid]/download
router.get(`${apiVersion}/community-apps/uuid/:uuid/download`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	try {
		const app = await getProxy(env).findOne(env.CREATIONS_DB, env.APPS_COLLECTION, { uuid: uuid });

		if (!app) {
			return createErrorResponse('Not found', 404, `The app with the '${uuid}' uuid does not exist.`);
		}

		return new Response(null, {
			status: 303,
			headers: {
				Location: app.direct_download_link,
			},
		});
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-creations
router.get(`${apiVersion}/community-creations`, async ({ env }) => {
	try {
		const [communityAppsData, communityThemesData] = await Promise.all([
			getProxy(env).findAll(env.CREATIONS_DB, env.APPS_COLLECTION),
			getProxy(env).findAll(env.CREATIONS_DB, env.THEMES_COLLECTION),
		]);

		const creations = {
			apps: communityAppsData,
			themes: communityThemesData,
		};

		return new Response(JSON.stringify(creations));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-themes/id
router.get(`${apiVersion}/community-themes/id`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-themes/',
		},
	});
});

// /v1/community-themes/name
router.get(`${apiVersion}/community-themes/name`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-themes/',
		},
	});
});

// /v1/community-themes/uuid
router.get(`${apiVersion}/community-themes/uuid`, async () => {
	return new Response(null, {
		status: 303,
		headers: {
			Location: '/v1/community-themes/',
		},
	});
});

// /v1/community-themes
router.get(`${apiVersion}/community-themes/`, async ({ env }) => {
	try {
		const communityThemesData = await getProxy(env).findAll(env.CREATIONS_DB, env.THEMES_COLLECTION);

		return new Response(JSON.stringify(communityThemesData));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-themes/[id]
router.get(`${apiVersion}/community-themes/:id`, async ({ env, req }) => {
	const id = req.params.id;

	const validationError = validateNumericId(id);
	if (validationError) return validationError;

	try {
		const theme = await getProxy(env).findOne(env.CREATIONS_DB, env.THEMES_COLLECTION, { id: id });

		if (!theme) {
			return createErrorResponse('Not found', 404, `The theme with the '${id}' id does not exist.`);
		}

		return new Response(JSON.stringify(theme));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-themes/[id]/download
router.get(`${apiVersion}/community-themes/:id/download`, async ({ env, req }) => {
	const id = req.params.id;

	const validationError = validateNumericId(id);
	if (validationError) return validationError;

	try {
		const theme = await getProxy(env).findOne(env.CREATIONS_DB, env.THEMES_COLLECTION, { id: id });

		if (!theme) {
			return createErrorResponse('Not found', 404, `The theme with the '${id}' id does not exist.`);
		}

		return new Response(null, {
			status: 303,
			headers: {
				Location: theme.direct_download_link,
			},
		});
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-themes/id/[id]
router.get(`${apiVersion}/community-themes/id/:id`, async ({ env, req }) => {
	const id = req.params.id;

	const validationError = validateNumericId(id);
	if (validationError) return validationError;

	try {
		const theme = await getProxy(env).findOne(env.CREATIONS_DB, env.THEMES_COLLECTION, { id: id });

		if (!theme) {
			return createErrorResponse('Not found', 404, `The theme with the '${id}' id does not exist.`);
		}

		return new Response(JSON.stringify(theme));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-themes/id/[id]/download
router.get(`${apiVersion}/community-themes/id/:id/download`, async ({ env, req }) => {
	const id = req.params.id;

	const validationError = validateNumericId(id);
	if (validationError) return validationError;

	try {
		const theme = await getProxy(env).findOne(env.CREATIONS_DB, env.THEMES_COLLECTION, { id: id });

		if (!theme) {
			return createErrorResponse('Not found', 404, `The theme with the '${id}' id does not exist.`);
		}

		return new Response(null, {
			status: 303,
			headers: {
				Location: theme.direct_download_link,
			},
		});
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-themes/name/[name]
router.get(`${apiVersion}/community-themes/name/:name`, async ({ env, req }) => {
	const name = decodeURIComponent(req.params.name);

	try {
		const theme = await getProxy(env).findOne(env.CREATIONS_DB, env.THEMES_COLLECTION, { name: name });

		if (!theme) {
			return createErrorResponse('Not found', 404, `The theme with the '${name}' name does not exist.`);
		}

		return new Response(JSON.stringify(theme));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-themes/name/[name]/download
router.get(`${apiVersion}/community-themes/name/:name/download`, async ({ env, req }) => {
	const name = decodeURIComponent(req.params.name);

	try {
		const theme = await getProxy(env).findOne(env.CREATIONS_DB, env.THEMES_COLLECTION, { name: name });

		if (!theme) {
			return createErrorResponse('Not found', 404, `The theme with the '${name}' name does not exist.`);
		}

		return new Response(null, {
			status: 303,
			headers: {
				Location: theme.direct_download_link,
			},
		});
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-themes/uuid/[uuid]
router.get(`${apiVersion}/community-themes/uuid/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	try {
		const theme = await getProxy(env).findOne(env.CREATIONS_DB, env.THEMES_COLLECTION, { uuid: uuid });

		if (!theme) {
			return createErrorResponse('Not found', 404, `The theme with the '${uuid}' uuid does not exist.`);
		}

		return new Response(JSON.stringify(theme));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/community-themes/uuid/[uuid]/download
router.get(`${apiVersion}/community-themes/uuid/:uuid/download`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	try {
		const theme = await getProxy(env).findOne(env.CREATIONS_DB, env.THEMES_COLLECTION, { uuid: uuid });

		if (!theme) {
			return createErrorResponse('Not found', 404, `The theme with the '${uuid}' uuid does not exist.`);
		}

		return new Response(null, {
			status: 303,
			headers: {
				Location: theme.direct_download_link,
			},
		});
	} catch (error) {
		return handleError(error);
	}
});

// /v1/downloads
router.get(`${apiVersion}/downloads`, async ({ env }) => {
	try {
		const downloadsDocument = await getProxy(env).findOne(env.DROPTOP_DB, env.DROPTOP_DOWNLOADS, { query: { title: 'downloads' } });

		if (!downloadsDocument) {
			return createErrorResponse('Not found', 404, 'Downloads data not found.');
		}

		const { basic_downloads, update_downloads, supporter_downloads } = downloadsDocument;

		return new Response(JSON.stringify({ basic_downloads, update_downloads, supporter_downloads }));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/downloads/community-apps
router.get(`${apiVersion}/downloads/community-apps`, async () => {
	return createErrorResponse('Bad Request', 400, 'You need to specify an uuid.');
});

router.post(`${apiVersion}/downloads/community-apps`, async () => {
	return createErrorResponse('Bad Request', 400, 'You need to specify an uuid.');
});

// /v1/downloads/community-apps/[uuid]
router.get(`${apiVersion}/downloads/community-apps/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	try {
		const app = await getProxy(env).findOne(env.CREATIONS_DB, env.APPS_COLLECTION, { uuid: uuid });

		if (!app) {
			return new Response(
				JSON.stringify({
					error: {
						type: 'Not found',
						status: 404,
						message: `The app with the '${uuid}' uuid does not exist.`,
					},
				}),
				{ status: 404 }
			);
		}

		const app_data = {
			uuid: app.uuid,
			downloads: app.downloads,
		};

		return new Response(JSON.stringify(app_data));
	} catch (error) {
		return handleError(error);
	}
});

router.post(`${apiVersion}/downloads/community-apps/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	try {
		const app = await updateDownloads(env.CREATIONS_DB, env.APPS_COLLECTION, uuid);

		if (!app) {
			return createErrorResponse('Not found', 404, `The app with the '${uuid}' uuid does not exist.`);
		}

		return new Response(JSON.stringify(app));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/downloads/community-themes
router.get(`${apiVersion}/downloads/community-themes`, async () => {
	return createErrorResponse('Bad Request', 400, 'You need to specify an uuid.');
});

router.post(`${apiVersion}/downloads/community-themes`, async () => {
	return createErrorResponse('Bad Request', 400, 'You need to specify an uuid.');
});

// /v1/downloads/community-themes/[uuid]
router.get(`${apiVersion}/downloads/community-themes/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	try {
		const theme = await getProxy(env).findOne(env.CREATIONS_DB, env.THEMES_COLLECTION, { uuid: uuid });

		if (!theme) {
			return createErrorResponse('Not found', 404, `The theme with the '${uuid}' uuid does not exist.`);
		}

		const theme_data = {
			uuid: theme.uuid,
			downloads: theme.downloads,
		};

		return new Response(JSON.stringify(theme_data));
	} catch (error) {
		return handleError(error);
	}
});

router.post(`${apiVersion}/downloads/community-themes/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	try {
		const theme = await getProxy(env).findOne(env.CREATIONS_DB, env.THEMES_COLLECTION, { uuid: uuid });

		if (!theme) {
			return createErrorResponse('Not found', 404, `The theme with the '${uuid}' uuid does not exist.`);
		} else {
			const updatedTheme = await updateDownloads(env, env.CREATIONS_DB, env.THEMES_COLLECTION, uuid);

			return new Response(JSON.stringify(updatedTheme));
		}
	} catch (error) {
		return handleError(error);
	}
});

// /v1/droptop
router.get(`${apiVersion}/droptop`, async ({ env, req }) => {
	try {
		const versionData = await getProxy(env).findOne(env.DROPTOP_DB, env.VERSION_COLLECTION);

		const appsData = await getProxy(env).findAll(env.CREATIONS_DB, env.APPS_COLLECTION);

		const appVersions = {};
		let appIndex = 1;
		for (let param in req.query) {
			const app = appsData.find((app) => app.name.toLowerCase() == req.query[param].toLowerCase());
			if (app) {
				appVersions[`CustomApp${appIndex}`] = app.version;
			} else {
				appVersions[`CustomApp${appIndex}`] = '0';
			}
			appIndex++;
		}

		const response = {
			version: versionData.base.version,
			miniversion: versionData.base.miniversion,
			...appVersions,
		};

		return new Response(JSON.stringify(response));
	} catch (error) {
		return handleError(error);
	}
});

// /v1/ping
router.get(`${apiVersion}/ping`, () => {
	return new Response(
		JSON.stringify({
			version: 'v1',
			timestamp: new Date().toISOString(),
		})
	);
});

// /v1/version
router.get(`${apiVersion}/version`, async ({ env }) => {
	try {
		const versionData = await getProxy(env).findOne(env.DROPTOP_DB, env.VERSION_COLLECTION);

		if (!versionData) {
			return createErrorResponse('Not found', 404, 'Version data not found.');
		}

		return new Response(JSON.stringify(versionData.base));
	} catch (error) {
		return handleError(error);
	}
});

router.any('*', () => {
	return createErrorResponse('Not Found', 404, '404, not found!');
});

export default {
	async fetch(request, env, ctx) {
		const sentry = new Toucan({
			dsn: env.SENTRY_DSN,
			context: ctx,
			request: request,
		});

		try {
			return await router.handle(request, env, ctx);
		} catch (error) {
			sentry.captureException(error);
			console.error(error);

			return createErrorResponse('Something went wrong', 500, 'Team has been notified.');
		}
	},
};
