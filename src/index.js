import { Router } from '@tsndr/cloudflare-worker-router';
const JSONbig = require('json-bigint');

import endpoints from './enpoints';

import login from './realm_login';

const router = new Router();

const apiVersion = '/v1';

// Enabling build in CORS support
router.cors();

// router.debug();

// Register global middleware
// router.use(({ env, req }) => {
// 	// Intercept if token doesn't match
// 	// console.log(req);
// 	if (req.method == 'POST' && req.url.includes('announcements')) {
// 		if (req.headers.get('authorization') !== env.DROPTOP_APIKEY) {
// 			return new Response(
// 				JSON.stringify({
// 					error: {
// 						type: 'Unauthorizedt',
// 						status: 401,
// 						message: 'You need to specify a valid API KEY.',
// 					},
// 				}),
// 				{ status: 401 }
// 			);
// 		}
// 	}
// });

// '/'
router.get('/', () => {
	return new Response(
		JSON.stringify({
			error: {
				type: 'Bad Request',
				status: 400,
				message: 'You need to specify the api version.',
			},
		}),
		{ status: 400 }
	);
});

// /v1/
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
		return new Response(
			JSON.stringify({
				error: {
					type: 'Something went wrong',
					status: 500,
					message: error.message,
				},
			}),
			{ status: 500 }
		);
	}
});

router.post(
	`${apiVersion}/announcements`,
	async ({ env, req }) => {
		if (req.headers.get('authorization') !== env.DROPTOP_APIKEY) {
			return new Response(
				JSON.stringify({
					error: {
						type: 'Unauthorizedt',
						status: 401,
						message: 'You need to specify a valid API KEY.',
					},
				}),
				{ status: 401 }
			);
		}
	},
	async ({ env, req }) => {
		let new_announcement = await req.json();

		let headers = {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${env.GITHUB_APIKEY}`,
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'droptop-api',
		};

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

		if (response.status == 200) {
			return new Response(JSON.stringify(new_announcement));
		} else {
			return new Response(
				JSON.stringify({
					error: {
						type: response.statusText,
						status: response.status,
						message: message,
					},
				}),
				{ status: response.status }
			);
		}
	}
);

router.delete(
	`${apiVersion}/announcements`,
	async ({ env, req }) => {
		if (req.headers.get('authorization') !== env.DROPTOP_APIKEY) {
			return new Response(
				JSON.stringify({
					error: {
						type: 'Unauthorizedt',
						status: 401,
						message: 'You need to specify a valid API KEY.',
					},
				}),
				{ status: 401 }
			);
		}
	},
	async ({ env }) => {
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

		let headers = {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${env.GITHUB_APIKEY}`,
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'droptop-api',
		};

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

		if (response.status == 200) {
			return new Response(JSON.stringify(empty_obj));
		} else {
			return new Response(
				JSON.stringify({
					error: {
						type: response.statusText,
						status: response.status,
						message: message,
					},
				}),
				{ status: response.status }
			);
		}
	}
);

// /v1/announcements/[platform]
router.get(`${apiVersion}/announcements/:platform`, async ({ env, req }) => {
	const platform = decodeURIComponent(req.params.platform);

	const response = await fetch(`https://github.com/Droptop-Four/${env.GLOBALDATA_REPO}/raw/main/data/announcements.json`);
	const announcements = await response.json();

	if (platform === 'app') {
		return new Response(JSON.stringify(announcements.app));
	} else if (platform === 'website') {
		return new Response(JSON.stringify(announcements.website));
	}

	return new Response(JSON.stringify(announcements));
});

router.post(
	`${apiVersion}/announcements/:platform`,
	async ({ env, req }) => {
		if (req.headers.get('authorization') !== env.DROPTOP_APIKEY) {
			return new Response(
				JSON.stringify({
					error: {
						type: 'Unauthorizedt',
						status: 401,
						message: 'You need to specify a valid API KEY.',
					},
				}),
				{ status: 401 }
			);
		}
	},
	async ({ env, req }) => {
		const platform = decodeURIComponent(req.params.platform);

		if (platform !== 'app' && platform !== 'website') {
			return new Response(
				JSON.stringify({
					error: {
						type: 'Bad Request',
						status: 400,
						message: 'You need to specify a correct platform [app, website].',
					},
				}),
				{ status: 400 }
			);
		}

		let platform_announcement = await req.json();

		let headers = {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${env.GITHUB_APIKEY}`,
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'droptop-api',
		};

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

		if (response.status == 200) {
			return new Response(JSON.stringify(new_announcement));
		} else {
			return new Response(
				JSON.stringify({
					error: {
						type: response.statusText,
						status: response.status,
						message: message,
					},
				}),
				{ status: response.status }
			);
		}
	}
);

router.delete(
	`${apiVersion}/announcements/:platform`,
	async ({ env, req }) => {
		if (req.headers.get('authorization') !== env.DROPTOP_APIKEY) {
			return new Response(
				JSON.stringify({
					error: {
						type: 'Unauthorizedt',
						status: 401,
						message: 'You need to specify a valid API KEY.',
					},
				}),
				{ status: 401 }
			);
		}
	},
	async ({ env, req }) => {
		const platform = decodeURIComponent(req.params.platform);

		if (platform !== 'app' && platform !== 'website') {
			return new Response(
				JSON.stringify({
					error: {
						type: 'Bad Request',
						status: 400,
						message: 'You need to specify a correct platform [app, website].',
					},
				}),
				{ status: 400 }
			);
		}

		let headers = {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${env.GITHUB_APIKEY}`,
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'droptop-api',
		};

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

		if (response.status == 200) {
			return new Response(JSON.stringify(new_announcement));
		} else {
			return new Response(
				JSON.stringify({
					error: {
						type: response.statusText,
						status: response.status,
						message: message,
					},
				}),
				{ status: response.status }
			);
		}
	}
);

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

	const changenote = changelogData.changelog.find((entry) => entry.version === version);

	if (!changenote) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The changenote with the '${version}' version does not exist.`,
				},
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
router.get(`${apiVersion}/community-apps/`, async () => {
	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const text = await response.text();
	const communityAppsData = JSONbig.parse(text);

	return new Response(JSONbig.stringify(communityAppsData.apps));
});

// /v1/community-apps/[id]
router.get(`${apiVersion}/community-apps/:id`, async ({ req }) => {
	const id = req.params.id;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const text = await response.text();
	const communityAppsData = JSONbig.parse(text);

	if (isNaN(id)) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Invalid id',
					status: 400,
					message: `The '${id}' id is not a number.`,
				},
			}),
			{ status: 400 }
		);
	}

	const app = communityAppsData.apps.find((app) => app.app.id === Number(id));

	if (!app) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the '${id}' id does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(JSONbig.stringify(app.app));
});

// /v1/community-apps/[id]/download
router.get(`${apiVersion}/community-apps/:id/download`, async ({ req }) => {
	const id = req.params.id;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const text = await response.text();
	const communityAppsData = JSONbig.parse(text);

	if (isNaN(id)) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Invalid id',
					status: 400,
					message: `The '${id}' id is not a number.`,
				},
			}),
			{ status: 400 }
		);
	}

	const app = communityAppsData.apps.find((app) => app.app.id === Number(id));

	if (!app) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the '${id}' id does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(null, {
		status: 303,
		headers: {
			Location: app.app.direct_download_link,
		},
	});
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
					message: `The '${id}' id is not a number.`,
				},
			}),
			{ status: 400 }
		);
	}

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const text = await response.text();
	const communityAppsData = JSONbig.parse(text);

	const app = communityAppsData.apps.find((app) => app.app.id === Number(id));

	if (!app) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the '${id}' id does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(JSONbig.stringify(app.app));
});

// /v1/community-apps/id/[id]/download
router.get(`${apiVersion}/community-apps/id/:id/download`, async ({ req }) => {
	const id = req.params.id;

	if (isNaN(id)) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Invalid id',
					status: 400,
					message: `The '${id}' id is not a number.`,
				},
			}),
			{ status: 400 }
		);
	}

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const text = await response.text();
	const communityAppsData = JSONbig.parse(text);

	const app = communityAppsData.apps.find((app) => app.app.id === Number(id));

	if (!app) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the '${id}' id does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(null, {
		status: 303,
		headers: {
			Location: app.app.direct_download_link,
		},
	});
});

// /v1/community-apps/name/[name]
router.get(`${apiVersion}/community-apps/name/:name`, async ({ req }) => {
	const name = decodeURIComponent(req.params.name);

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const text = await response.text();
	const communityAppsData = JSONbig.parse(text);

	const app = communityAppsData.apps.find((app) => app.app.name.toLowerCase() == name.toLowerCase());

	if (!app) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the "'${name}' name does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(JSONbig.stringify(app.app));
});

// /v1/community-apps/name/[name]/download
router.get(`${apiVersion}/community-apps/name/:name/download`, async ({ req }) => {
	const name = decodeURIComponent(req.params.name);

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const text = await response.text();
	const communityAppsData = JSONbig.parse(text);

	const app = communityAppsData.apps.find((app) => app.app.name.toLowerCase() == name.toLowerCase());

	if (!app) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the "'${name}' name does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(null, {
		status: 303,
		headers: {
			Location: app.app.direct_download_link,
		},
	});
});

// /v1/community-apps/uuid/[uuid]
router.get(`${apiVersion}/community-apps/uuid/:uuid`, async ({ req }) => {
	const uuid = req.params.uuid;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const text = await response.text();
	const communityAppsData = JSONbig.parse(text);

	const app = communityAppsData.apps.find((app) => app.app.uuid == uuid);

	if (!app) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the '${uuid}' uuid does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(JSONbig.stringify(app.app));
});

// /v1/community-apps/uuid/[uuid]/download
router.get(`${apiVersion}/community-apps/uuid/:uuid/download`, async ({ req }) => {
	const uuid = req.params.uuid;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_apps/community_apps.json');
	const text = await response.text();
	const communityAppsData = JSONbig.parse(text);

	const app = communityAppsData.apps.find((app) => app.app.uuid == uuid);

	if (!app) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The app with the '${uuid}' uuid does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(null, {
		status: 303,
		headers: {
			Location: app.app.direct_download_link,
		},
	});
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
router.get(`${apiVersion}/community-themes/`, async () => {
	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const text = await response.text();
	const communityThemesData = JSONbig.parse(text);

	return new Response(JSONbig.stringify(communityThemesData.themes));
});

// /v1/community-themes/[id]
router.get(`${apiVersion}/community-themes/:id`, async ({ req }) => {
	const id = req.params.id;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const text = await response.text();
	const communityThemesData = JSONbig.parse(text);

	if (isNaN(id)) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Invalid id',
					status: 400,
					message: `The '${id}' id is not a number.`,
				},
			}),
			{ status: 400 }
		);
	}

	const theme = communityThemesData.themes.find((theme) => theme.theme.id === Number(id));

	if (!theme) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the '${id}' id does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(JSONbig.stringify(theme.theme));
});

// /v1/community-themes/[id]/download
router.get(`${apiVersion}/community-themes/:id/download`, async ({ req }) => {
	const id = req.params.id;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const text = await response.text();
	const communityThemesData = JSONbig.parse(text);

	if (isNaN(id)) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Invalid id',
					status: 400,
					message: `The '${id}' id is not a number.`,
				},
			}),
			{ status: 400 }
		);
	}

	const theme = communityThemesData.themes.find((theme) => theme.theme.id === Number(id));

	if (!theme) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the '${id}' id does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(null, {
		status: 303,
		headers: {
			Location: theme.theme.direct_download_link,
		},
	});
});

// /v1/community-themes/id/[id]
router.get(`${apiVersion}/community-themes/id/:id`, async ({ req }) => {
	const id = req.params.id;

	if (isNaN(id)) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Invalid id',
					status: 400,
					message: `The '${id}' id is not a number.`,
				},
			}),
			{ status: 400 }
		);
	}

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const text = await response.text();
	const communityThemesData = JSONbig.parse(text);

	const theme = communityThemesData.themes.find((theme) => theme.theme.id === Number(id));

	if (!theme) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the '${id}' id does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(JSONbig.stringify(theme.theme));
});

// /v1/community-themes/id/[id]/download
router.get(`${apiVersion}/community-themes/id/:id/download`, async ({ req }) => {
	const id = req.params.id;

	if (isNaN(id)) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Invalid id',
					status: 400,
					message: `The '${id}' id is not a number.`,
				},
			}),
			{ status: 400 }
		);
	}

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const text = await response.text();
	const communityThemesData = JSONbig.parse(text);

	const theme = communityThemesData.themes.find((theme) => theme.theme.id === Number(id));

	if (!theme) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the '${id}' id does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(null, {
		status: 303,
		headers: {
			Location: theme.theme.direct_download_link,
		},
	});
});

// /v1/community-themes/name/[name]
router.get(`${apiVersion}/community-themes/name/:name`, async ({ req }) => {
	const name = decodeURIComponent(req.params.name);

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const text = await response.text();
	const communityThemesData = JSONbig.parse(text);

	const theme = communityThemesData.themes.find((theme) => theme.theme.name.toLowerCase() == name.toLowerCase());

	if (!theme) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the "'${name}' name does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(JSONbig.stringify(theme.theme));
});

// /v1/community-themes/name/[name]/download
router.get(`${apiVersion}/community-themes/name/:name/download`, async ({ req }) => {
	const name = decodeURIComponent(req.params.name);

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const text = await response.text();
	const communityThemesData = JSONbig.parse(text);

	const theme = communityThemesData.themes.find((theme) => theme.theme.name.toLowerCase() == name.toLowerCase());

	if (!theme) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the "'${name}' name does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(null, {
		status: 303,
		headers: {
			Location: theme.theme.direct_download_link,
		},
	});
});

// /v1/community-themes/uuid/[uuid]
router.get(`${apiVersion}/community-themes/uuid/:uuid`, async ({ req }) => {
	const uuid = req.params.uuid;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const text = await response.text();
	const communityThemesData = JSONbig.parse(text);

	const theme = communityThemesData.themes.find((theme) => theme.theme.uuid == uuid);

	if (!theme) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the '${uuid}' uuid does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(JSONbig.stringify(theme.theme));
});

// /v1/community-themes/uuid/[uuid]/download
router.get(`${apiVersion}/community-themes/uuid/:uuid/download`, async ({ req }) => {
	const uuid = req.params.uuid;

	const response = await fetch('https://github.com/Droptop-Four/GlobalData/raw/main/data/community_themes/community_themes.json');
	const text = await response.text();
	const communityThemesData = JSONbig.parse(text);

	const theme = communityThemesData.themes.find((theme) => theme.theme.uuid == uuid);

	if (!theme) {
		return new Response(
			JSONbig.stringify({
				error: {
					type: 'Not found',
					status: 404,
					message: `The theme with the '${uuid}' uuid does not exist.`,
				},
			}),
			{ status: 404 }
		);
	}

	return new Response(null, {
		status: 303,
		headers: {
			Location: theme.theme.direct_download_link,
		},
	});
});

// /v1/downloads
router.get(`${apiVersion}/downloads`, async ({ env, req }) => {
	const user = await login(env.REALM_APPID, env.REALM_APIKEY);
	const collection = user.mongoClient('mongodb-atlas').db(env.DB).collection(env.DROPTOP_COLLECTION);

	try {
		const downloadsDocument = await collection.findOne({ title: 'downloads' });

		let basic_downloads = downloadsDocument.basic_downloads;
		let update_downloads = downloadsDocument.update_downloads;
		let supporter_downloads = downloadsDocument.supporter_downloads;

		return new Response(
			JSON.stringify({ basic_downloads: basic_downloads, update_downloads: update_downloads, supporter_downloads: supporter_downloads })
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Something went wrong',
					status: 500,
					message: error.message,
				},
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
				message: 'You need to specify an uuid.',
			},
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
				message: 'You need to specify an uuid.',
			},
		}),
		{ status: 400 }
	);
});

// /v1/downloads/community-apps/[uuid]
router.get(`${apiVersion}/downloads/community-apps/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	const user = await login(env.REALM_APPID, env.REALM_APIKEY);
	const collection = user.mongoClient('mongodb-atlas').db(env.DB).collection(env.APPS_COLLECTION);

	try {
		const app = await collection.findOne({ uuid: uuid });

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
		return new Response(
			JSON.stringify({
				error: {
					type: 'Something went wrong',
					status: 500,
					message: error.message,
				},
			}),
			{ status: 500 }
		);
	}
});

router.post(`${apiVersion}/downloads/community-apps/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	const user = await login(env.REALM_APPID, env.REALM_APIKEY);
	const collection = user.mongoClient('mongodb-atlas').db(env.DB).collection(env.APPS_COLLECTION);

	try {
		const app = await collection.findOne({ uuid: uuid });

		if (!app) {
			await collection.insertOne({
				uuid: uuid,
				downloads: 1,
			});
			let downloads = 1;

			const app_data = {
				uuid: uuid,
				downloads: downloads,
			};

			return new Response(JSON.stringify(app_data));
		} else {
			let downloads = app.downloads + 1;

			await collection.updateOne({ uuid: uuid }, { $set: { downloads } });

			const app_data = {
				uuid: app.uuid,
				downloads: downloads,
			};

			return new Response(JSON.stringify(app_data));
		}
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Something went wrong',
					status: 500,
					message: error.message,
				},
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
				message: 'You need to specify an uuid.',
			},
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
				message: 'You need to specify an uuid.',
			},
		}),
		{ status: 400 }
	);
});

// /v1/downloads/community-themes/[uuid]
router.get(`${apiVersion}/downloads/community-themes/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	const user = await login(env.REALM_APPID, env.REALM_APIKEY);
	const collection = user.mongoClient('mongodb-atlas').db(env.DB).collection(env.THEMES_COLLECTION);

	try {
		const theme = await collection.findOne({ uuid: uuid });

		if (!theme) {
			return new Response(
				JSON.stringify({
					error: {
						type: 'Not found',
						status: 404,
						message: `The theme with the '${uuid}' uuid does not exist.`,
					},
				}),
				{ status: 404 }
			);
		}

		const theme_data = {
			uuid: theme.uuid,
			downloads: theme.downloads,
		};

		return new Response(JSON.stringify(theme_data));
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Something went wrong',
					status: 500,
					message: error.message,
				},
			}),
			{ status: 500 }
		);
	}
});

router.post(`${apiVersion}/downloads/community-themes/:uuid`, async ({ env, req }) => {
	const uuid = req.params.uuid;

	const user = await login(env.REALM_APPID, env.REALM_APIKEY);
	const collection = user.mongoClient('mongodb-atlas').db(env.DB).collection(env.THEMES_COLLECTION);

	try {
		const theme = await collection.findOne({ uuid: uuid });

		if (!theme) {
			await collection.insertOne({
				uuid: uuid,
				downloads: 1,
			});
			let downloads = 1;

			const theme_data = {
				uuid: uuid,
				downloads: downloads,
			};

			return new Response(JSON.stringify(theme_data));
		} else {
			let downloads = theme.downloads + 1;

			await collection.updateOne({ uuid: uuid }, { $set: { downloads } });

			const theme_data = {
				uuid: theme.uuid,
				downloads: downloads,
			};

			return new Response(JSON.stringify(theme_data));
		}
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: {
					type: 'Something went wrong',
					status: 500,
					message: error.message,
				},
			}),
			{ status: 500 }
		);
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
router.get(`${apiVersion}/version`, async () => {
	const response = await fetch('https://raw.githubusercontent.com/Droptop-Four/GlobalData/main/data/version.json');
	const versionData = await response.json();

	return new Response(JSON.stringify(versionData));
});

router.any('*', () => {
	new Response(
		JSON.stringify({
			error: {
				type: 'Not Found',
				status: 404,
				message: '404, not found!',
			},
		}),
		{ status: 404 }
	);
});

export default {
	async fetch(request, env, ctx) {
		return router.handle(request, env, ctx);
	},
};
