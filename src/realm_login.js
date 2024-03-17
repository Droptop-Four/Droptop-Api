import * as Realm from 'realm-web';

const {
	BSON: { ObjectId },
} = Realm;

async function login(appId, apiKey) {
	const app = new Realm.App({ id: appId });
	const credentials = Realm.Credentials.apiKey(apiKey);
	const user = await app.logIn(credentials);
	console.assert(user.id === app.currentUser.id);
	return user;
}

export default login;
