/**
 * # ErrorAlert.js
 *
 * This class uses a component which displays the appropriate alert
 * depending on the platform
 *
 * The main purpose here is to determine if there is an error and then
 * plucking off the message depending on the shape of the error object.
 */
'use strict';
/**
 * ## Imports
 *
 */
import { Request, ResponseToolkit } from '@hapi/hapi';
import ServerConfig from '../config/server.js';
//the authentication package
import Jwt from 'jsonwebtoken';
import { redisClient } from '../database/redis.js';
//mongoose user object
import { Employee } from '../database/models/Employee.js';
import { Tenant } from '../database/models/Tenant.js';
import { User } from '../database/models/User.js';

// private key for signing
const JwtAuth = {
	privateKey: ServerConfig.crypto.privateKey,

	/**
	 *
	 * ## validate
	 *
	 *  When a route is configured w/ 'auth', this validate function is
	 * invoked
	 *
	 * If the token wasn't invalidated w/ logout, then validate
	 * its for a user
	 *
	 * When a user logs out, the token they were using is saved to Redis
	 * and checked here to prevent re-use
	 *
	 */
	validate: async function (decoded: Record<string, any>, request: Request, h: ResponseToolkit) {
		try {
			return await JwtAuth._validate(decoded, request, h);
		} catch (e) {
			console.log('JWT Error: ', e.message);
			throw e;
		}
	},
	_validate: async function (decoded: Record<string, any>, request: Request, h: ResponseToolkit) {
		//POST方式，在headers中放了 authorization
		let authorization = request.headers.authorization;
		if (!authorization) {
			//GET方式，在访问URL后面要加 ?token=${session.user.sessionToken}
			authorization = request.query['token'];
		}
		// ok - valid token, do we have a user?
		// note we're only using 'id' - that's because
		// the user can change their email and username
		let credentials: any = {};
		let result = { isValid: false, credentials: credentials };
		let credentials_redisKey = `cred_${decoded.id}`;
		let cachedCredential = await redisClient.get(credentials_redisKey);
		cachedCredential = null;
		let account = '';
		if (cachedCredential) {
			result = { isValid: true, credentials: JSON.parse(cachedCredential) };
			account = result.credentials.user.account;
		}
		if (await redisClient.get('cred_force_reload')) {
			console.log('Found FORCE RELOAD, force reload from database then');
			cachedCredential = null;
		}
		if (!cachedCredential) {
			const user = await User.findOne({ _id: decoded.id }).lean();
			const tenant = user ? await Tenant.findOne({ _id: user.tenant }).lean() : null;
			const employee = user
				? await Employee.findOne({
						userid: user._id,
						tenant: tenant._id,
						active: true,
					}).lean()
				: null;
			if (user && employee && tenant) {
				result = {
					isValid: true,
					credentials: {
						_id: user._id,
						tenant: tenant,
						user: user,
						employee: employee,
					},
				};
				account = user.account;
				await redisClient.set(credentials_redisKey, JSON.stringify(result.credentials));
				await redisClient.expire(credentials_redisKey, 10 * 60 * 60);
				//	console.log("Refreshed credentials from database successfully");
			} else {
				result = { isValid: false, credentials: {} };
				await redisClient.del(credentials_redisKey);
				console.log('Refreshed credentials from database failed, active user not found');
			}
		}

		////////////////////////////////////////////////////////////////////////////////
		// 即便检查正确,也要再进一步坚持是否被管理员踢出(inblack list)
		////////////////////////////////////////////////////////////////////////////////
		if (result.isValid) {
			//does redis have the token
			let inblack = await redisClient.get(`logout_${account}`);
			//oops - it's been blacklisted - sorry
			if (inblack) {
				console.log(`invalid: authorizaiton token inblack, user ${account} logged out?`);
				result = {
					isValid: false,
					credentials: {},
				};
			}
		}
		return result;
	},

	// create token
	createToken: function (obj: string | Buffer | object) {
		return Jwt.sign(obj, JwtAuth.privateKey);
	},
	verify: function (tk: string, options: any, callback: any) {
		return Jwt.verify(tk, JwtAuth.privateKey);
	},

	// set jwt auth strategy
	setJwtStrategy: async function (server: any) {
		server.auth.strategy('token', 'jwt', {
			key: JwtAuth.privateKey,
			validate: JwtAuth.validate,
		});
	},
};

export default JwtAuth;
