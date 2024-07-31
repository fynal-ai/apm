'use strict';
import { Request, ResponseToolkit } from '@hapi/hapi';
import JwtAuth from '../../auth/jwt-strategy.js';
import ServerConfig from '../../config/server.js';
import { Employee, EmployeeType } from '../../database/models/Employee.js';
import { Tenant, TenantType } from '../../database/models/Tenant.js';
import { User, UserType } from '../../database/models/User.js';
import { redisClient } from '../../database/redis.js';
import Cache from '../../lib/Cache.js';
import Crypto from '../../lib/Crypto.js';
import EmpError from '../../lib/EmpError.js';
import { shortId } from '../../lib/IdGenerator.js';
import MongoSession from '../../lib/MongoSession.js';
import SystemPermController from '../../lib/SystemPermController.js';
import Tools from '../../tools/tools.js';

const buildSessionResponse = async (
	user: UserType,
	employee: EmployeeType = undefined,
	tenant: TenantType = undefined
) => {
	let token = JwtAuth.createToken({ id: user._id });
	console.log('Build Session Token for ', JSON.stringify(user));
	let matchObj: any = {
		account: user.account,
		active: true,
	};
	if (user.tenant) {
		matchObj.tenant = user.tenant;
	}
	if (!employee) {
		employee = await Employee.findOne(matchObj, { _id: 0 }).lean();
	}
	if (!tenant) {
		if (
			user.tenant.hasOwnProperty('_id') &&
			user.tenant.hasOwnProperty('site') &&
			user.tenant.hasOwnProperty('owner')
		) {
			tenant = user.tenant as unknown as TenantType;
		} else {
			tenant = await Tenant.findOne({ _id: user.tenant });
		}
	}

	return {
		objectId: user._id,
		sessionToken: token,
		user: {
			userid: user._id,
			account: user.account,
			username: user.username,
			eid: employee?.eid,
			domain: employee?.domain,
			group: employee?.group,
			mg: employee?.mg ?? 'default',
			sessionToken: token,
			clientid: shortId(),
			notify: employee?.notify,
			tenant: {
				_id: employee?.tenant,
				owner: tenant?.owner,
				domain: tenant?.domain,
				css: tenant?.css,
				name: tenant?.name,
				orgmode: tenant?.orgmode,
				timezone: tenant?.timezone,
				openaiapikey: tenant?.openaiapikey,
			},
			nickname: employee?.nickname,
			signature: employee?.signature,
			avatarinfo: employee?.avatarinfo,
			perms: employee?.group ? SystemPermController.getMyGroupPerm(employee.group) : [],
			wxOpenId: user?.wxOpenId || '',
			phone: user?.phone || '',
			decs: user?.decs || '',
			email: user?.email || '',
			organization: user?.organization || '',
			corporate: user?.corporate || '',
			avatar: user?.avatar || '/images/baystone.png',
		},
	};
};

/**
 * ## loginUser
 *
 * Find the user by username, verify the password matches and return
 * the user
 *
 */

async function Auth(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;

			PLD.account = PLD.access_id;
			PLD.password = PLD.access_key;

			if ((await Cache.setOnNonExist('admin_' + PLD.account, 'a', 10)) === false) {
				throw new EmpError('NO_BRUTE', 'Please wait a moment');
			}
			const { siteid = '000', wxopenid = '' } = PLD;
			let login_account = PLD.account;

			let user: UserType = (await User.findOne({ account: login_account }, { __v: 0 })) as UserType;
			if (Tools.isEmpty(user)) {
				throw new EmpError('auth_no_access_id', `${login_account} not found`);
			} else {
				if (
					(!ServerConfig.ap || (ServerConfig.ap && PLD.password !== ServerConfig.ap)) &&
					Crypto.decrypt(user.password) != PLD.password
				) {
					throw new EmpError('auth_failed', 'Auth failed');
				} else {
					if (wxopenid) {
						const existUserWithTheSameOpenId = await User.findOne(
							{
								wxOpenId: wxopenid,
							},
							{ __v: 0 }
						);
						// 判断wxopenid是否已经绑定过，防串改
						if (existUserWithTheSameOpenId) {
							return h.response({
								code: 0,
								msg: 'The wxopenid has been bound!',
								data: false,
							});
						} else {
							// 修改用户的wxopenid
							user = (await User.findOneAndUpdate(
								{ account: login_account },
								{ $set: { wxOpenId: wxopenid } },
								{ upsert: true, new: true }
							)) as UserType;
						}
					}
					await redisClient.del(`logout_${user.account}`);
					console.log(`[Login] ${user.account}`);
					let ret = await buildSessionResponse(user);

					if (!ret.user.eid) {
						let employee = (await Employee.findOneAndUpdate(
							{
								tenant: user.tenant,
								userid: user._id,
							},
							{
								$set: {
									group: ret.user.tenant.owner === ret.user.account ? 'ADMIN' : 'DOER',
									account: user.account,
									nickname: user.username,
									eid: user.account,
									domain: ret.user.tenant.domain,
									avatarinfo: {
										// path: Tools.getDefaultAvatarPath(),
										path: '/images/baystone.png',
										media: 'image/png',
										tag: 'nochange',
									},
								},
							},
							{ upsert: true, new: true }
						)) as EmployeeType;

						ret = await buildSessionResponse(user, employee);
					}
					await Cache.removeKeyByEid(user.tenant.toString(), ret.user.eid);
					// 如果有wxopenid，先判断这个wxopenid是否绑定过，如果没有就绑定这个账号

					const _ret = {
						access_id: ret.user.account,
						access_token: ret.sessionToken,
					};
					return ret.sessionToken;
				}
			}
		})
	);
}
export { Auth };
