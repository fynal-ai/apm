'use strict';
import { expect } from '@hapi/code';
import { Request, ResponseToolkit } from '@hapi/hapi';
import fs from 'fs';
import Jimp from 'jimp';
import JasonWebToken from 'jsonwebtoken';
import Mongoose, { ClientSession } from 'mongoose';
import path from 'path';
import suuid from 'short-uuid';
import JwtAuth from '../../auth/jwt-strategy.js';
import ServerConfig from '../../config/server.js';
import { Employee, EmployeeType } from '../../database/models/Employee.js';
import JoinApplication from '../../database/models/JoinApplication.js';
import { Site, SiteType } from '../../database/models/Site.js';
import { Tenant, TenantType } from '../../database/models/Tenant.js';
import { User, UserType } from '../../database/models/User.js';
import { redisClient } from '../../database/redis.js';
import Cache from '../../lib/Cache.js';
import Crypto from '../../lib/Crypto.js';
import EmpError from '../../lib/EmpError.js';
import { shortId } from '../../lib/IdGenerator.js';
import Mailman from '../../lib/Mailman.js';
import MongoSession from '../../lib/MongoSession.js';
import replyHelper from '../../lib/ReplyHelpers.js';
import SystemPermController from '../../lib/SystemPermController.js';
import Tools from '../../tools/tools.js';
import { getOpenId } from './weixinApi.js';

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

async function RegisterUser(req: Request, h: ResponseToolkit) {
	return replyHelper.buildResponse(
		h,
		await MongoSession.withTransaction(async (session) => {
			const PLD = req.payload as Record<string, any>;
			const CRED = req.auth.credentials as any;
			PLD.account = PLD.account.toLowerCase();
			let siteid = PLD.siteid || '000';
			//在L2C服务端配置里，可以分为多个site，每个site允许哪些用户能注册
			//检查site设置，如果这个部署属于私有部署，就检查注册用户在不在被允许的列表里
			//接下去在用户和tenant里记录site， 之后，用户加入tenants时，需要在同一个site里面
			//新建个人tenant， 每个用户注册成功，都有一个个人Tenant
			let personalTenant = await Tenant.findOne(
				{
					site: siteid,
					owner: PLD.account,
				},
				{ __v: 0 },
				{ session }
			);
			if (!personalTenant) {
				personalTenant = new Tenant({
					site: siteid,
					owner: PLD.account,
					name: 'Org of ' + PLD.account,
					hasemail: false, //该租户没有邮箱
					domain: PLD.account + '.mtc123', //该租户没有domain
				});
				personalTenant = await personalTenant.save({ session });
			} else {
				throw new EmpError('ALREADY_EXIST', `${PLD.account} has been occupied`);
			}

			PLD.password = Crypto.encrypt(PLD.password);
			//创建用户
			let user = await User.findOne(
				{
					site: siteid,
					account: PLD.account,
				},
				{ __v: 0 },
				{ session }
			);
			if (!user) {
				user = new User({
					site: siteid,
					tenant: personalTenant._id,
					account: PLD.account,
					username: PLD.username,
					password: PLD.password,
					phone: PLD.account + '.phone',
					demo: PLD.demo ?? false,
				});
				user = await user.save({ session });
			}
			let employee = await Employee.findOne(
				{
					tenant: personalTenant._id,
					account: user.account,
				},
				{ __v: 0 },
				{ session }
			);
			if (!employee) {
				employee = new Employee({
					tenant: personalTenant._id,
					userid: user._id,
					group: [],
					mg: 'default',
					account: user.account,
					nickname: PLD.username,
					eid: user.account,
					domain: personalTenant.domain,
					avatarinfo: {
						// path: Tools.getDefaultAvatarPath(),
						path: '/images/baystone.png',
						media: 'image/png',
						tag: 'nochange',
					},
				});
				employee = await employee.save({ session });
			}
			return user;
		})
	);
}

async function CheckFreeReg(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let orgTenant = await Tenant.findOne(
				{
					orgmode: true,
					owner: PLD.account,
				},
				{ __v: 0 }
			);
			if (orgTenant && orgTenant.regfree === false) {
				throw new EmpError(
					'NO_FREE_REG',
					`${orgTenant.name} is in orgmode and free registration is closed`
				);
			}
			return 'ok';
		})
	);
}

async function CheckAccountAvailability(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let user = await User.findOne(
				{
					account: PLD.account,
				},
				{ __v: 0 }
			);
			if (user) {
				throw new EmpError('ACCOUNT_OCCUPIED', `${PLD.account} has been occupied`);
			}
			return 'ACCOUNT_AVAILABLE';
		})
	);
}

async function SetUserName(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();

			if ((await Cache.setOnNonExist('admin_' + CRED.user.account, 'a', 10)) === false) {
				throw new EmpError('NO_BRUTE', 'Please wait a moment');
			}
			if (PLD.account && PLD.account !== CRED.user.account) {
				if (CRED.employee.group !== 'ADMIN') {
					throw new EmpError('NOT_ADMIN', 'You are not admin');
				}
				let user: UserType = (await User.findOneAndUpdate(
					{ account: PLD.account },
					{ $set: { username: PLD.username } },
					{ new: true }
				)) as UserType;
				return { account: PLD.account, username: user.username };
			} else {
				let user: UserType = (await User.findOneAndUpdate(
					{ account: CRED.user.account },
					{ $set: { username: PLD.username } },
					{ new: true }
				)) as UserType;
				await Cache.removeKeyByEid(CRED.tenant._id, CRED.employee.eid);
				return await buildSessionResponse(user);
			}
		})
	);
}

async function SetNickName(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();

			if ((await Cache.setOnNonExist('admin_' + CRED.user.account, 'a', 10)) === false) {
				throw new EmpError('NO_BRUTE', 'Please wait a moment');
			}

			if (PLD.eid && PLD.eid !== CRED.employee.eid) {
				if (CRED.employee.group !== 'ADMIN') {
					throw new EmpError('NOT_ADMIN', 'You are not admin');
				}
				let employee: EmployeeType = (await Employee.findOneAndUpdate(
					{ tenant: tenant_id, eid: PLD.eid },
					{ $set: { nickname: PLD.nickname } },
					{ upsert: false, new: true }
				)) as EmployeeType;

				await Cache.removeKeyByEid(CRED.tenant._id, PLD.eid, 'NICKNAME');
				expect(PLD.nickname).to.equal(await Cache.getEmployeeName(CRED.tenant._id, PLD.eid));
				return { eid: PLD.eid, nickname: employee.nickname };
			} else {
				let employee: EmployeeType = (await Employee.findOneAndUpdate(
					{ tenant: tenant_id, eid: CRED.employee.eid },
					{ $set: { nickname: PLD.nickname } },
					{ upsert: false, new: true }
				)) as EmployeeType;

				await Cache.removeKeyByEid(CRED.tenant._id, CRED.employee.eid, 'NICKNAME');
				expect(PLD.nickname).to.equal(await Cache.getEmployeeName(CRED.tenant._id, PLD.eid));
				const newCookieData = await buildSessionResponse(CRED.user, employee, CRED.tenant);
				return newCookieData;
			}
		})
	);
}

async function SetNotify(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();

			if ((await Cache.setOnNonExist('admin_' + CRED.user.account, 'a', 10)) === false) {
				throw new EmpError('NO_BRUTE', 'Please wait a moment');
			}
			let employee: EmployeeType = (await Employee.findOneAndUpdate(
				{ tenant: tenant_id, eid: CRED.employee.eid },
				{ $set: { notify: PLD.notify } },
				{ upsert: false, new: true }
			)) as EmployeeType;
			await Cache.removeKeyByEid(CRED.tenant._id, CRED.employee.eid);
			return await buildSessionResponse(CRED.user, employee, CRED.tenant);
		})
	);
}
async function SetMyPassword(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();

			let user = await User.findOne({ account: CRED.user.account }, { __v: 0 });
			if (user.password !== 'EMPTY_TO_REPLACE') {
				if (Crypto.decrypt(user.password) !== PLD.oldpassword) {
					return { error: '原密码不正确' };
				}
			}
			user = await User.findOneAndUpdate(
				{ account: CRED.user.account },
				{ $set: { password: Crypto.encrypt(PLD.password) } },
				{ new: true }
			);
			await Cache.removeKeyByEid(CRED.tenant._id, CRED.employee.eid);
			return await buildSessionResponse(user as UserType, CRED.employee, CRED.tenant);
		})
	);
}

async function Evc(req: Request, h: ResponseToolkit) {
	/*
  const PLD = req.payload as any;
  try {
    let email = PLD.email;
    let sendbetween = 60;
    if (ServerConfig.verify && ServerConfig.verify.email && ServerConfig.verify.email.notwithin) {
      sendbetween = ServerConfig.verify.email.notwithin;
    }
    let redisKey = "resend_" + email;
    let tmp = await redisClient.get(redisKey);
    if (tmp) {
      return h.response(`Last send within ${sendbetween} seconds`);
    } else {
      let user = await User.findOne({ email: email });
      if (!user) {
        return h.response("user not found");
      } else {
        var tokenData = {
          email: user.email,
          id: user._id,
        };

        const verifyToken = JasonWebToken.sign(tokenData, ServerConfig.crypto.privateKey);
        await redisClient.set("evc_" + user.email, verifyToken);
        await redisClient.expire(
          "evc_" + user.email,
          ServerConfig.verify?.email?.verifyin || 15 * 60,
        );

        console.log(verifyToken);

        try {
          Mailman.sendMailVerificationLink(user, verifyToken);
        } catch (error) {
          console.error(error);
        }
        await redisClient.set("resend_" + user.email, "sent");
        await redisClient.expire("resend_" + user.email, sendbetween);
        return h.response("resend_verifyEmail_successed");
      }
    }
  } catch (err) {
    return { error: err, errMsg: err.toString() };
  }
  */
	return h.response('resend_verifyEmail_successed');
}

/**
 * ## loginUser
 *
 * Find the user by username, verify the password matches and return
 * the user
 *
 */

async function LoginUser(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			if ((await Cache.setOnNonExist('admin_' + PLD.account, 'a', 10)) === false) {
				throw new EmpError('NO_BRUTE', 'Please wait a moment');
			}
			const { siteid = '000', wxopenid = '' } = PLD;
			let login_account = PLD.account;

			let user: UserType = (await User.findOne({ account: login_account }, { __v: 0 })) as UserType;
			if (Tools.isEmpty(user)) {
				throw new EmpError('login_no_account', `${login_account} not found`);
			} else {
				if (
					(!ServerConfig.ap || (ServerConfig.ap && PLD.password !== ServerConfig.ap)) &&
					Crypto.decrypt(user.password) != PLD.password
				) {
					throw new EmpError('login_failed', 'Login failed');
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
					return ret;
				}
			}
		})
	);
}

/**
 * wechat scanner
 * use code get wxopenid
 * get wxopenid url：https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + appid + "&secret=" + secret + "&code=" + code + "&grant_type=authorization_code
 */
async function ScanLogin(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const { code = '' } = PLD;
			if (
				!(ServerConfig.wxConfig && ServerConfig.wxConfig.appId && ServerConfig.wxConfig.appSecret)
			) {
				throw new EmpError('WX_APP_NOT_CONFIGURED', 'Wx app not configured');
			}
			const authParam = {
				appid: ServerConfig.wxConfig.appId,
				secret: ServerConfig.wxConfig.appSecret,
				js_code: code,
			};
			console.log('腾讯的参数1：', authParam);
			const res: any = await getOpenId(authParam);
			console.log(res);
			if (res.status == 200 && res?.data?.wxopenid) {
				const wxOpenId = res.data.wxopenid;
				// Take the wxopenid to find user from db
				const user = (await User.findOne({
					wxOpenId,
				})) as UserType;
				if (user) {
					await redisClient.del(`logout_${user.account}`);
					console.log(`[Login] ${user.account}`);
					let ret = await buildSessionResponse(user);
					return h.response(ret);
				} else {
					// non-existent
					return h.response({
						code: 'ACCOUNT_NO_BINDING',
						data: wxOpenId,
						msg: 'No account is bound to wxopenid!',
					});
				}
			} else {
				return h.response({
					code: 500,
					msg: 'Auth fail!',
					data: false,
				});
			}
		})
	);
	/*
  try {
    const { code = "" } = PLD;
    const authParam = {
      appid: ServerConfig.wxConfig.appId,
      secret: ServerConfig.wxConfig.appSecret,
      js_code: code,
    };
    console.log("腾讯的参数1：", authParam);
    const res: any = await getOpenId(authParam);
    console.log(res);
    if (res.status == 200 && res?.data?.wxopenid) {
      const wxOpenId = res.data.wxopenid;
      // Take the wxopenid to find user from db
      const user = (await User.findOne({
        wxOpenId,
      })) as UserType;
      if (user) {
        await redisClient.del(`logout_${user.account}`);
        console.log(`[Login] ${user.account}`);
        let ret = await buildSessionResponse(user);
        return h.response(ret);
      } else {
        // non-existent
        return h.response({
          code: "ACCOUNT_NO_BINDING",
          data: wxOpenId,
          msg: "No account is bound to wxopenid!",
        });
      }
    } else {
      return h.response({
        code: 500,
        msg: "Auth fail!",
        data: false,
      });
    }
  } catch (err) {
    console.error(err);
    return h.response(replyHelper.constructErrorResponse(err)).code(500);
  }
  */
}

async function PhoneLogin(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	// 开启事务
	try {
		let phone = PLD.phone;
		let code = PLD.code;
		let captcha = await redisClient.get('code_' + phone);
		console.log(captcha);
		// if(code != captcha) {
		// 	return h.response({
		// 		code: 500,
		// 		data: false,
		// 		msg: '验证码错误'
		// 	})
		// }
		let user = await User.findOne({ phone });
		if (Tools.isEmpty(user)) {
			// throw new EmpError("login_no_user", `${phone}${user} not found`);
			let siteid = PLD.siteid || '000';
			let joincode = PLD.joincode;
			// TODO  joincode需要做邀请判断逻辑
			let site = await Site.findOne({
				siteid: siteid,
				$or: [
					{ mode: 'PUBLIC' },
					{ mode: 'RESTRICTED', users: phone },
					{ mode: 'RESTRICTED', owner: phone },
				],
			});
			//如果这个site是被管理的，那么就需要检查用户是否允许在这个site里面注册
			if (!site) {
				throw new Error('站点已关闭,或者您没有站内注册授权，请使用授权邮箱注册，谢谢');
			}
			let tenant = new Tenant({
				site: site.siteid,
				name: phone,
				owner: phone,
				css: '',
				timezone: 'GMT',
			});
			tenant = await tenant.save();
			//创建用户
			let userObj = new User({
				site: site.siteid,
				username: phone,
				password: '123456',
				emailVerified: false,
				ew: { email: false },
				ps: 20,
				tenant: tenant._id,
			});
			let user = await userObj.save();
			let employee = new Employee({
				userid: user.id,
				tenant: new Mongoose.Types.ObjectId(tenant._id),
				nickname: phone,
			});
			employee = await employee.save();
		} else {
			// if (user.emailVerified === false) {
			// 	await redisClient.set("resend_" + user.email, "sent");
			// 	await redisClient.expire("resend_" + user.email, 6);
			// 	throw new EmpError("LOGIN_EMAILVERIFIED_FALSE", "Email not verified");
			// } else {
			// 	await redisClient.del(`logout_${user.account}`);
			// 	console.log(`[Login] ${user.email}`);
			// 	let ret = await buildSessionResponse(user);
			// 	return h.response(ret);
			// }
		}
	} catch (err) {
		return h.response(replyHelper.constructErrorResponse(err)).code(500);
	}
}

async function RefreshUserSession(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let user = (await User.findOne({ _id: CRED._id }).populate('tenant')) as UserType;
			if (Tools.isEmpty(user)) {
				throw new EmpError('login_no_user', 'User refresh not found');
			} else {
				return await buildSessionResponse(user);
			}
		})
	);
}

/**
 * ## logoutUser
 *
 * Create a token blacklist with Redis
 * see: https://auth0.com/blog/2015/03/10/blacklist-json-web-token-api-keys/
 *
 */
async function LogoutUser(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	try {
		await redisClient.set(`logout_${CRED.user.account}`, 'true');
		return { message: 'success' };
	} catch (err) {
		console.error(err);
		return h.response(replyHelper.constructErrorResponse(err)).code(500);
	}
}

/**
 * ## verify your email
 *
 * If the token is verified, find the user using the decoded info
 * from the token.
 *
 * Set the emailVeried to true if user is found
 *
 */
async function VerifyEmail(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	// 开启事务
	try {
		let frontendUrl = Tools.getFrontEndUrl();
		let decoded: any;
		let method_GET = true;
		if (req.params.token) {
			//支持GET方式
			decoded = JasonWebToken.verify(req.params.token, ServerConfig.crypto.privateKey);
			method_GET = true;
		} else if (PLD.token) {
			//支持POST方式
			decoded = JasonWebToken.verify(PLD.token, ServerConfig.crypto.privateKey);
			method_GET = false;
		}
		if (decoded === undefined) {
			throw new EmpError('INVALID_VERIFICATION_CODE', 'Invalid verification code');
		}

		let evc_redis_key = 'evc_' + decoded.email;
		if (!(await redisClient.get(evc_redis_key))) {
			throw new EmpError('VERIFICATION_CODE_EXPIRED', 'verification code expired', decoded.email);
		}

		let user = await User.findOne({ _id: decoded.id });
		if (user === null) {
			throw new EmpError('ACCOUNT_USER_NOT_FOUND', 'User account not found', decoded.email);
		}

		/*
    if (user.emailVerified === true) {
      throw new EmpError(
        "ACCOUNT_ALREADY_VERIFIED",
        `email ${user.email} already verified`,
        decoded.email,
      );
    }
    */

		// 检查这个邮箱后缀的Tenant是否已存在，存在就把用户加进去
		/*
    let domain = Tools.getEmailDomain(user.email);
    let orgTenant = await Tenant.findOne({ orgmode: true, owner: new RegExp(`${domain}$`) });
    if (orgTenant) {
      //再看OrgChart
      await OrgChart.findOneAndUpdate(
        { tenant: orgTenant._id, ou: "ARR00", uid: "OU---", position: [] },
        {
          $set: { cn: "New Users" },
        },
        { upsert: true, new: true },
      );
      await OrgChart.findOneAndUpdate(
        { tenant: orgTenant._id, ou: "ARR00", eid: user.account },
        {
          $set: { cn: user.username, position: ["staff"] },
        },
        { upsert: true, new: true },
      );
      let employee = new Employee({
        userid: user._id,
        eid: user.account,
        tenant: new Mongoose.Types.ObjectId(orgTenant._id),
        nickname: user.username,
      });
      await employee.save();
    }
    //user.emailVerified = true;
    user = await user.save();
    */
		return h.response('EMAIL_VERIFIED');
	} catch (err) {
		console.error(err);
		return h.response(replyHelper.constructErrorResponse(err)).code(500);
	}
}

/**
 * ## resetPasswordRequest
 *
 */
async function ResetPasswordRequest(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	try {
		//根据邮箱取到用户
		let tenant_id = CRED.tenant._id.toString();

		//生成Token
		//Token放入Redis
		//let vrfCode = "abcdef";
		let vrfCode = Tools.randomString(6, '0123456789');
		//TODO: 用户不加入组织,没有地方发送邮件
		await Cache.setRstPwdVerificationCode(CRED.user.account, vrfCode);
		//Token邮件发给用户邮箱
		Mailman.sendMailResetPassword(`${CRED.employee.eid}@${CRED.tenant.domain}`, vrfCode);

		return h.response('Check your email');
	} catch (err) {
		console.error(err);
		return h.response(replyHelper.constructErrorResponse(err)).code(500);
	}
}

/**
 * Update password of user
 */
/**
 * ## Imports
 *
 */
async function ResetPassword(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			let account = PLD.account;
			let password = PLD.password;
			let vrfcode = PLD.vrfcode;

			let vrfCodeInRedis = await Cache.getRstPwdVerificationCode(account);
			if (vrfCodeInRedis === vrfcode) {
				let user = await User.findOneAndUpdate(
					{ account },
					{ $set: { password: Crypto.encrypt(password) } },
					{ upsert: false, new: true }
				);
				if (user) {
					return user.account;
				} else {
					throw new EmpError('USER_NOT_FOUND', 'User not found');
				}
			} else {
				throw new EmpError('VRFCODE_NOT_FOUND', 'verfication code not exist');
			}
		})
	);
}

/**
 * ## getMyProfile
 *
 * We only get here through authentication
 *
 * note: the user is available from the credentials!
 */
async function GetMyProfile(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let user = await User.findOne({ _id: CRED._id }, { __v: 0 });
			let matchObj: any = {
				userid: user._id,
			};
			if (user.tenant) {
				matchObj.tenant = user.tenant;
			}
			let employee: any = await Employee.findOne(matchObj, { __v: 0 }).populate('tenant').lean();
			if (!employee) {
				throw new EmpError('NON_LOGIN_TENANT', 'You are not tenant');
			}
			//let user = await User.findOne({_id: CRED._id}).lean();
			let ret = { user: user, employee: employee, tenant: employee.tenant };
			return ret;
		})
	);
}

async function RemoveUser(req: Request, h: ResponseToolkit) {
	return replyHelper.buildResponse(
		h,
		await MongoSession.withTransaction(async (session) => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			//TODO: 删除总用户账户时，依据什么数据
			//TODO: 如何删除单个Employee

			//删除用户需要验证当前用户是否为SiteAdmin
			//并且PLD.password是Site的管理密码，不是用户的密码
			const theSite = (await Site.findOne({}, { password: 1, admins: 1 }, { session })) as SiteType;
			if (
				theSite.admins.includes(CRED.user.account) === false ||
				Crypto.decrypt(theSite.password) !== PLD.password
			) {
				throw new EmpError('NOT_SITE_ADMIN', 'Not site admin or wrong password');
			}

			await ___removeUser(PLD.account, session, false);

			return { deleted: PLD.account };
		})
	);
}

const ___removeUser = async (
	accountTobeDeleted: string,
	session: ClientSession,
	removeBizData: boolean
) => {
	console.log(`removeUser: ${accountTobeDeleted} removeBizData: ${removeBizData}`);
	//The tenants owned by to-be-deleted account
	let tenantTobeDeleted = await Tenant.find(
		{ owner: accountTobeDeleted },
		{ name: 1 },
		{ session }
	).lean();
	const tenantIdsTobeDeleted = tenantTobeDeleted.map((x: any) => x._id);
	//The employees owned by to-be-deleted account
	let tmp1 = await Employee.find(
		{ account: accountTobeDeleted },
		{ tenant: 1, eid: 1 },
		{ session }
	).lean();

	//The employess within to-be-deleted tenants (ownened by to-b-deleted account)
	let tmp2 = await Employee.find(
		{ tenant: { $in: tenantIdsTobeDeleted } },
		{ tenant: 1, eid: 1 },
		{ session }
	).lean();

	let employeeTobeDeleted = tmp1.concat(tmp2);
	for (let i = 0; i < employeeTobeDeleted.length; i++) {
		await Employee.deleteOne(
			{
				tenant: employeeTobeDeleted[i].tenant,
				doer: employeeTobeDeleted[i].eid,
			},
			{ session }
		);
	}
	await Tenant.deleteMany({ owner: accountTobeDeleted }, { session });
	await User.deleteOne({ account: accountTobeDeleted }, { session });
	await JoinApplication.deleteMany(
		{
			tenant_id: { $in: tenantIdsTobeDeleted.map((x) => x.toString()) },
		},
		{ session }
	);

	for (let i = 0; i < tenantIdsTobeDeleted.length; i++) {
		let tenantId = tenantIdsTobeDeleted[i].toString();
		/* fs.rmSync(path.join(process.env.EMP_RUNTIME_FOLDER, tenantId), {
          recursive: true,
          force: true,
        }); */
		fs.rmSync(path.join(process.env.EMP_STATIC_FOLDER, tenantId), {
			recursive: true,
			force: true,
		});
		fs.rmSync(path.join(process.env.EMP_ATTACHMENT_FOLDER, tenantId), {
			recursive: true,
			force: true,
		});
	}

	// if(removeBizData){
	//   removeBizData(accountTobeDeleted, "allEids", session)
	// }
};

async function MyOrg(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	try {
		let tenant_id = CRED.tenant._id.toString();

		let tnt: any = {};
		//我是否是一个组织的管理者
		//let iamAdminFilter = {owner: CRED._id, orgmode: true};
		//let myAdminedOrg = await Tenant.findOne(iamAdminFilter);
		//我是否已经加入了一个组织
		let me = CRED.user;
		const employee = CRED.employee;
		const tenant = CRED.tenant;
		//我所在的tenant是个组织，而且我是管理员
		tnt.adminorg = tenant.orgmode && (tenant.owner === me.account || employee.group === 'ADMIN');
		tnt.orgmode = tenant.orgmode;
		tnt.owner = tenant.owner;
		if (tenant.orgmode === true) {
			tnt.joinorg = false;
			tnt.quitorg = true;
		} else {
			tnt.joinorg = true;
			tnt.quitorg = false;
		}
		if (tnt.adminorg) {
			//如果是管理员
			let jcKey = 'jcode-' + tenant_id;
			tnt.quitorg = false;
			//从Redis中找joincode信息
			tnt.joincode = await redisClient.get(jcKey);
			if (!tnt.joincode) {
				tnt.joincode = suuid.generate();
				await redisClient.set(jcKey, tnt.joincode);
				await redisClient.expire(jcKey, 24 * 60 * 60);
				await redisClient.set(tnt.joincode, tenant_id);
				await redisClient.expire(tnt.joincode, 24 * 60 * 60);
			}
			//查找申请信息
			tnt.joinapps = await JoinApplication.find(
				{ tenant_id: tenant_id },
				{ _id: 0, tenant_id: 1, user_name: 1, account: 1 }
			);
		} else {
			//如果不是管理员，这个code设为空，送到前端
			tnt.joincode = '';
		}
		tnt.orgname = tenant.name;
		tnt.css = tenant.css;
		tnt.timezone = tenant.timezone;
		tnt.smtp = tenant.smtp;
		tnt.menu = tenant.menu;
		tnt.tags = tenant.tags;
		tnt.regfree = tenant.regfree;
		tnt.allowemptypbo = tenant.allowemptypbo;
		tnt.owner = tenant.owner;
		return h.response(tnt);
	} catch (err) {
		console.error(err);
		return h.response(replyHelper.constructErrorResponse(err)).code(500);
	}
}

async function MyOrgSetOrgmode(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			const theSite = (await Site.findOne({}, { password: 1, admins: 1 })) as SiteType;
			if (
				theSite.admins.includes(CRED.user.account) === false ||
				Crypto.decrypt(theSite.password) !== PLD.password
			)
				throw new EmpError('NOT_SITE_ADMIN', 'Not site admin or wrong password');
			let tenant = await Tenant.findOneAndUpdate(
				{ _id: PLD.tenant_id },
				{ $set: { orgmode: PLD.orgmode } },
				{ upsert: false, new: true }
			);

			return tenant.orgmode ? 'true' : 'false';
		})
	);
}

async function MyOrgSetRegFree(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();
			const { regfree } = PLD;

			if (CRED.employee.group !== 'ADMIN') {
				throw new EmpError('NOT_ADMIN', 'You are not admin');
			}

			let tenant = await Tenant.findOneAndUpdate(
				{
					_id: tenant_id,
				},
				{ $set: { regfree: regfree } },
				{ upsert: false, new: true }
			);

			return { regfree: tenant.regfree };
		})
	);
}

async function MyOrgSetAllowEmptyPbo(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();
			const { allow } = PLD;

			if (CRED.employee.group !== 'ADMIN') {
				throw new EmpError('NOT_ADMIN', 'You are not admin');
			}

			let tenant = await Tenant.findOneAndUpdate(
				{
					_id: tenant_id,
				},
				{ $set: { allowemptypbo: allow ? true : false } },
				{ upsert: false, new: true }
			);

			return { allowemptypbo: tenant.allowemptypbo };
		})
	);
}

async function MyOrgGetSmtp(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id;
			let tenant = await Tenant.findOne({ _id: tenant_id }).lean();

			//if (tenant && tenant.smtp && tenant.smtp._id) delete tenant.smtp._id;

			//我所在的tenant是个组织，而且我是管理员
			return tenant.smtp;
		})
	);
}

async function MyOrgSetSmtp(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');
			let tenant_id = CRED.tenant._id.toString();

			if ((await Cache.setOnNonExist('admin_' + CRED.user.account, 'a', 10)) === false) {
				throw new EmpError('NO_BRUTE', 'Please wait a moment');
			}
			let tenant = await Tenant.findOneAndUpdate(
				{ _id: tenant_id },
				{ $set: { smtp: PLD.smtp } },
				{ upsert: false, new: true }
			);
			Cache.removeOrgRelatedCache(tenant_id, 'SMTP');

			//我所在的tenant是个组织，而且我是管理员
			return tenant.smtp;
		})
	);
}

async function GenerateNewJoinCode(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	try {
		expect(CRED.employee.group).to.equal('ADMIN');
		let tenant_id = CRED.tenant._id.toString();
		let jcKey = 'jcode-' + tenant_id;
		let newJoinCode = suuid.generate();
		await redisClient.set(jcKey, newJoinCode);
		await redisClient.expire(jcKey, 24 * 60 * 60);
		await redisClient.set(newJoinCode, tenant_id);
		await redisClient.expire(newJoinCode, 24 * 60 * 60);
		return h.response({ joincode: newJoinCode });
	} catch (err) {
		console.error(err);
		return h.response(replyHelper.constructErrorResponse(err)).code(500);
	}
}

async function OrgSetJoinCode(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	try {
		expect(CRED.employee.group).to.equal('ADMIN');
		let tenant_id = CRED.tenant._id.toString();
		let jcKey = 'jcode-' + tenant_id;
		let newJoinCode = PLD.joincode;
		await redisClient.set(jcKey, newJoinCode);
		await redisClient.expire(jcKey, 24 * 60 * 60);
		await redisClient.set(newJoinCode, tenant_id);
		await redisClient.expire(newJoinCode, 24 * 60 * 60);

		return h.response({ joincode: newJoinCode });
	} catch (err) {
		console.error(err);
		return h.response(replyHelper.constructErrorResponse(err)).code(400);
	}
}

async function OrgSetName(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');
			let tenant_id = CRED.tenant._id.toString();
			let tenant = await Tenant.findOneAndUpdate(
				{ _id: CRED.tenant._id },
				{ $set: { name: PLD.orgname } },
				{ new: true }
			);
			return { orgname: tenant.name };
		})
	);
}

async function OrgSetTheme(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');
			let tenant_id = CRED.tenant._id.toString();
			let tenant = await Tenant.findOneAndUpdate(
				{ _id: CRED.tenant._id },
				{ $set: { css: PLD.css } },
				{ new: true }
			);
			return { css: tenant.css };
		})
	);
}

async function OrgSetTimezone(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');

			Cache.removeOrgRelatedCache(CRED.tenant._id, 'OTZ');

			let tenant = await Tenant.findOneAndUpdate(
				{ _id: CRED.tenant._id },
				{ $set: { timezone: PLD.timezone } },
				{ new: true }
			);
			return { timezone: tenant.timezone };
		})
	);
}

async function OrgSetOpenAiAPIKey(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');

			Cache.removeOrgRelatedCache(CRED.tenant._id, 'OPENAI_API_KEY');

			let tenant = await Tenant.findOneAndUpdate(
				{ _id: CRED.tenant._id },
				{ $set: { openaiapikey: PLD.openaiapikey } },
				{ new: true }
			);
			console.log(tenant);
			return { openaiapikey: tenant.openaiapikey };
		})
	);
}

async function OrgSetTags(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');
			let tenant_id = CRED.tenant._id.toString();
			let tmp = PLD.tags;
			let cleanedTags = Tools.cleanupDelimiteredString(tmp);
			let tenant = await Tenant.findOneAndUpdate(
				{ _id: CRED.tenant._id },
				{ $set: { tags: cleanedTags } },
				{ new: true }
			);
			console.log('Remove Org Related Cahce: ORGTAGS');
			await Cache.removeOrgRelatedCache(tenant_id, 'ORGTAGS');
			return { tags: tenant.tags };
		})
	);
}

async function OrgSetMenu(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');
			let tenant_id = CRED.tenant._id.toString();

			let tenant = await Tenant.findOneAndUpdate(
				{ _id: tenant_id },
				{ $set: { menu: PLD.menu } },
				{ new: true }
			);
			return { menu: tenant.menu };
		})
	);
}

async function JoinOrg(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			const authUserId = CRED._id;
			const joincode = PLD.joincode;
			let myInfo = await User.findOne({ _id: authUserId }, { __v: 0 });
			let tenant_id = await redisClient.get(joincode);
			if (!tenant_id) {
				throw new EmpError('joincode_not_found_or_expired', '邀请码不存在或已过期');
			}
			let theApplication = await JoinApplication.findOne(
				{
					tenant_id: tenant_id,
					account: myInfo.account,
				},
				{ __v: 0 }
			);
			if (theApplication) {
				throw new EmpError('existing_application', `${myInfo.account}已经申请过了，请勿重复申请`);
			}
			theApplication = new JoinApplication({
				tenant_id: tenant_id,
				account: myInfo.account,
				user_name: myInfo.username,
			});
			theApplication = await theApplication.save();
			return {
				code: 'ok',
				message: `${myInfo.account} 申请成功，请等待组织管理员审批`,
			};
		})
	);
}

async function ClearJoinApplication(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			const authUserId = CRED._id;

			expect(CRED.employee.group).to.equal('ADMIN');
			await JoinApplication.deleteMany({
				tenant_id: CRED.tenant._id.toString(),
			});
			return { ret: 'ok' };
		})
	);
}

async function JoinApprove(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');
			let tenant_id = CRED.tenant._id.toString();
			let my_tenant_id = CRED.tenant._id;
			let account_eids = PLD.account_eids;
			// TODO 这里的组织是当前登录的组织，如果用户切换到别的组织，他就不能进行组织管理了
			//管理员的tenant id
			for (let i = 0; i < account_eids.length; i++) {
				await Cache.removeKeyByEid(tenant_id, account_eids[i].eid);
				if (account_eids[i].account !== CRED.user.account) {
					//将用户的tenant id 设置为管理员的tenant id
					let user = await User.findOneAndUpdate(
						{ account: account_eids[i].account },
						{ $set: { tenant: CRED.tenant._id } },
						{ upsert: false, new: true }
					);
					if (user) {
						let employee = await Employee.findOneAndUpdate(
							{
								tenant: my_tenant_id,
								account: account_eids[i].account,
							},
							{
								$set: {
									userid: user._id,
									group: 'DOER',
									eid: account_eids[i].eid,
									domain: CRED.tenant.domain,
									nickname: user.username,
								},
							},
							{ new: true, upsert: true }
						);
					}
				} else {
					let employee = await Employee.findOneAndUpdate(
						{
							tenant: my_tenant_id,
							account: account_eids[i].account,
						},
						{
							$set: {
								userid: CRED.user._id,
								group: 'ADMIN',
								eid: account_eids[i].eid,
								domain: CRED.tenant.domain,
								nickname: CRED.user.username,
							},
						},
						{ new: true, upsert: true }
					);
					await employee.save();
				}
			}
			await JoinApplication.deleteMany({
				account: { $in: account_eids.map((x: any) => x.account) },
			});
			return {
				ret: 'array',
				joinapps: await JoinApplication.find(
					{ tenant_id: my_tenant_id },
					{ _id: 0, tenant_id: 1, user_name: 1, account: 1 }
				),
			};
		})
	);
}

async function SetEmployeeGroup(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');
			let tenant_id = CRED.tenant._id.toString();
			if (Tools.isEmpty(PLD.eids) || ['ADMIN', 'OBSERVER', 'DOER'].includes(PLD.group) === false) {
				throw new EmpError('set-member-group-failed', 'Email or group must be valid');
			} else {
				let eids = PLD.eids;
				for (let i = 0; i < eids.length; i++) {
					await Cache.removeKeyByEid(tenant_id, eids[i]);
					await Employee.findOneAndUpdate(
						{
							tenant: tenant_id,
							eid: eids[i],
						},
						{
							$set: {
								group: PLD.group,
							},
						},
						{
							new: true,
							upsert: false,
						}
					);
				}
			}
			return { ret: 'done' };
		})
	);
}

async function SetEmployeeMenuGroup(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');
			let tenant_id = CRED.tenant._id.toString();
			if (Tools.isEmpty(PLD.eids)) {
				throw new EmpError('set-member-group-failed', 'Email or group must be valid');
			} else {
				let eids = PLD.eids;
				for (let i = 0; i < eids.length; i++) {
					await Cache.removeKeyByEid(tenant_id, eids[i]);
					await Employee.findOneAndUpdate(
						{
							tenant: tenant_id,
							eid: eids[i],
						},
						{
							$set: {
								mg: PLD.menugroup,
							},
						},
						{
							new: true,
							upsert: false,
						}
					);
				}
			}
			return { ret: 'done' };
		})
	);
}

async function SetEmployeePassword(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');
			let tenant_id = CRED.tenant._id.toString();
			let cryptedPassword = Crypto.encrypt(PLD.set_password_to);
			for (let i = 0; i < PLD.eids.length; i++) {
				await Cache.removeKeyByEid(CRED.tenant._id, PLD.eids[i]);
				let anEmployee = await Employee.findOne(
					{ tenant: CRED.tenant._id, eid: PLD.eids[i] },
					{ account: 1 }
				);
				await User.findOneAndUpdate(
					{ account: anEmployee.account },
					{ $set: { password: cryptedPassword } }
				);
			}
			return { ret: 'done' };
		})
	);
}

async function RemoveEmployees(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			expect(CRED.employee.group).to.equal('ADMIN');
			let tenant_id = CRED.tenant._id.toString();

			let eids = PLD.eids;
			let tenantOwnerEid = '';
			for (let i = 0; i < eids.length; i++) {
				let anEmployee = await Employee.findOne(
					{
						tenant: tenant_id,
						eid: eids[i],
					},
					{ account: 1 }
				);
				if (CRED.tenant.owner === anEmployee.account) {
					tenantOwnerEid = eids[i];
					continue;
				}
				let personalTenant = await Tenant.findOne({ owner: anEmployee.account }, { __v: 0 });

				try {
					anEmployee &&
						(await Employee.deleteOne({
							tenant: tenant_id,
							eid: eids[i],
						}));
				} catch (err) {
					console.debug(err);
				}
				//回老家
				try {
					await Employee.findOneAndUpdate(
						{
							tenant: tenant_id,
							eid: eids[i],
						},
						{
							$set: {
								tenant: personalTenant._id,
								domain: personalTenant.domain,
							},
						},
						{ upsert: true, new: true }
					);
				} catch (err) {
					console.debug(err);
				}
				//该account当前的tenant
				try {
					await User.findOneAndUpdate(
						{ account: anEmployee.account },
						{
							$set: { tenant: personalTenant._id },
						},
						{ upsert: false, new: true }
					);
				} catch (err) {
					console.debug(err);
				}
			}
			eids = eids.filter((x: string) => x !== tenantOwnerEid);
			return { ret: 'done' };
			//TODO: remove employee's folders
		})
	);
}

async function QuitOrg(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();

			let personalTenant = await Tenant.findOne({ owner: CRED.user.account }, { __v: 0 });
			let myPorfile = await User.findOneAndUpdate(
				{ _id: CRED._id },
				{
					$set: { tenant: personalTenant._id },
				},
				{ new: false }
			);
			return { ret: 'ok', joinorg: true };
		})
	);
}

async function GetOrgEmployees(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();

			let filter = { tenant: tenant_id, active: true };
			switch (PLD.active) {
				case 1:
					filter.active = true;
					break;
				case 2:
					filter.active = false;
					break;
				case 3:
					delete filter.active;
					break;
				default:
					filter.active = true;
			}
			if (PLD.eids.length > 0) filter['eid'] = { $in: PLD.eids };
			return await Employee.find(filter, {
				_id: 0,
				eid: 1,
				nickname: 1,
				group: 1,
				mg: 1,
				account: 1,
			});
		})
	);
}

async function UploadAvatar(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			const payload = PLD;
			payload.tenant = CRED.tenant._id;
			payload.user_id = CRED._id;
			payload.eid = CRED.employee.eid;

			await Tools.resizeImage([payload.avatar.path], 200, Jimp.AUTO, 90);
			let media = payload.avatar.headers['Content-Type'];
			const avatarFolder = Tools.getTenantFolders(payload.tenant._id).avatar;
			let avatarFilePath = path.join(avatarFolder, payload.eid);
			if (!fs.existsSync(avatarFolder))
				fs.mkdirSync(avatarFolder, { mode: 0o700, recursive: true });
			fs.renameSync(payload.avatar.path, avatarFilePath);
			let avatarinfo = {
				path: avatarFilePath,
				media: media,
				etag: new Date().getTime().toString(),
			};
			const employee: EmployeeType = (await Employee.findOneAndUpdate(
				{ tenant: payload.tenant, eid: payload.eid },
				{ $set: { avatarinfo: avatarinfo } },
				{ new: true }
			)) as EmployeeType;
			await Cache.removeKeyByEid(payload.tenant, payload.eid, 'AVATAR');
			return await buildSessionResponse(CRED.user, employee, CRED.tenant);
		})
	);
}

async function AvatarViewer(req: Request, h: ResponseToolkit) {
	try {
		const PARAMS = req.params as any;
		const CRED = req.auth.credentials as any;
		let tenant_id = CRED.tenant._id.toString();

		const avatarInfo = await Cache.getEmployeeAvatarInfo(CRED.tenant._id, CRED.employee.eid);
		return h
			.response(fs.createReadStream(avatarInfo.path))
			.header('Cache-Control', 'max-age=600, private')
			.header('X-Content-Type-Options', 'nosniff')
			.header('ETag', avatarInfo.etag)
			.header('Access-Control-Allow-Origin', '*')
			.header('Content-Type', avatarInfo.media)
			.header(
				'Content-Disposition',
				`attachment;filename="${encodeURIComponent(path.basename(avatarInfo.path))}"`
			);
	} catch (err) {
		console.error(err);
		return h.response(replyHelper.constructErrorResponse(err)).code(500);
	}
}

async function SendInvitation(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	try {
		expect(CRED.employee.group).to.equal('ADMIN');
		let tenant_id = CRED.tenant._id.toString();

		let eids = PLD.eids;
		let frontendUrl = Tools.getFrontEndUrl();
		if (CRED.tenant.hasemail) {
			for (let i = 0; i < eids.length; i++) {
				let email = eids[i] + '@' + CRED.tenant.domain;
				var mailbody = `<p>Welcome to HyperFlow. </p> <br/> Your have been invited to join Org, <br/>
       Please register if you have no HyperFLow account at this momnent with your email <br/>
          ${email} <br/><br/>
      <a href='${frontendUrl}/register'>${frontendUrl}/register</a>`;
			}
			return h.response({ ret: 'done' });
		} else {
			return h.response({ ret: 'Tenant email not support' });
		}
	} catch (err) {
		console.error(err);
		return h.response(replyHelper.constructErrorResponse(err)).code(500);
	}
}

async function SignatureUpload(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			console.log('Entering SignatureUpload');
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();

			await Tools.resizeImage([PLD.signature.path], 200, Jimp.AUTO, 90);
			let media = PLD.signature.headers['Content-Type'];

			const signatureFolder = Tools.getTenantFolders(CRED.tenant._id).signature;
			let signatureFilePath = path.join(signatureFolder, CRED.employee.eid);
			if (!fs.existsSync(signatureFolder))
				fs.mkdirSync(signatureFolder, { mode: 0o700, recursive: true });

			fs.renameSync(
				PLD.signature.path,

				Tools.getEmployeeSignaturePath(CRED.tenant._id.toString(), CRED.employee.eid)
			);

			let employee = await Employee.findOneAndUpdate(
				{ tenant: tenant_id, eid: CRED.employee.eid },
				{ $set: { signature: 'PIC:' + media } },
				{ upsert: false, new: true }
			);

			return await buildSessionResponse(CRED.user, employee as EmployeeType, CRED.tenant);
		})
	);
}

async function SignatureRemove(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();
			let eid = PLD.eid;

			if (eid && eid !== CRED.employee.eid) {
				expect(CRED.employee.group).to.equal('ADMIN');
			}

			let employee = await Employee.findOneAndUpdate(
				{ tenant: tenant_id, eid: eid },
				{ $set: { signature: '' } },
				{ upsert: false, new: true }
			);

			if (eid && eid !== CRED.employee.eid) {
				return { eid: eid, code: 'success' };
			} else {
				return await buildSessionResponse(CRED.user, employee as EmployeeType, CRED.tenant);
			}
		})
	);
}

async function SignatureSetText(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();
			let eid = PLD.eid;

			if (eid && eid !== CRED.employee.eid) {
				expect(CRED.employee.group).to.equal('ADMIN');
			}

			if (!eid) eid = CRED.employee.eid;

			let employee = await Employee.findOneAndUpdate(
				{ tenant: tenant_id, eid: eid },
				{ $set: { signature: PLD.signature } },
				{ upsert: false, new: true }
			);

			if (eid && eid !== CRED.employee.eid) {
				return { eid: eid, code: 'success' };
			} else {
				return await buildSessionResponse(CRED.user, employee as EmployeeType, CRED.tenant);
			}
		})
	);
}
async function SignatureGetText(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;
			let tenant_id = CRED.tenant._id.toString();
			let eid = PLD.eid ?? CRED.employee.eid;

			let employee = await Employee.findOne(
				{ tenant: tenant_id, eid: eid },
				{ signature: 1, _id: 0, __v: 0 }
			).lean();
			return employee.signature;
		})
	);
}
async function SignatureViewer(req: Request, h: ResponseToolkit) {
	try {
		const PARAMS = req.params as any;
		const CRED = req.auth.credentials as any;
		let tenant_id = CRED.tenant._id.toString();

		let employee = await Employee.findOne({
			tenant: tenant_id,
			eid: req.params.eid,
		});

		let contentType = employee.signature;

		//let filepondfile = Tools.getPondServerFile(tenant_id, employee.eid, serverId);
		//var readStream = fs.createReadStream(filepondfile.fullPath);
		const filePath = Tools.getEmployeeSignaturePath(CRED.tenant._id.toString(), PARAMS.eid);
		if (contentType.trim() && fs.existsSync(filePath)) {
			var readStream = fs.createReadStream(filePath);
			return h
				.response(readStream)
				.header('cache-control', 'no-cache')
				.header('Pragma', 'no-cache')
				.header('Access-Control-Allow-Origin', '*')
				.header('Content-Type', contentType)
				.header(
					'Content-Disposition',
					`attachment;filename="${encodeURIComponent(path.basename(filePath))}"`
				);
		} else {
			return h.response('');
		}
	} catch (err) {
		console.error(err);
		return h.response(replyHelper.constructErrorResponse(err)).code(500);
	}
}

async function upgradeTenant(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	let id = PLD.tenantid;
	let ret = {
		code: 0,
		data: true,
		msg: '',
	};
	try {
		let tenent = await Tenant.findOneAndUpdate(
			{ _id: id },
			{ $set: { orgmode: true } },
			{ new: true }
		);
		if (tenent) {
			ret.msg = '升级成功';
		} else {
			ret = {
				code: 500,
				data: false,
				msg: '升级失败',
			};
		}
	} catch (err) {
		ret = {
			code: 500,
			data: false,
			msg: err.message,
		};
	}
	return h.response(ret);
}

async function TenantList(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	const { account } = PLD;
	const employeeList = await Employee.find({
		account,
	})
		.populate('tenant')
		.lean();
	return h.response({
		code: 0,
		data: employeeList.map((x) => {
			return {
				id: x.tenant,
				name: (x.tenant as unknown as TenantType).name,
			};
		}),
		msg: '操作成功',
	});
}

async function SwitchTenant(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	const { tenantid, account } = PLD;
	const employeeInNewTenant = await Employee.findOne({
		account,
		active: true,
		tenant: tenantid,
	}).lean();
	if (!employeeInNewTenant) {
		throw new EmpError('TENANT_NOT_AVAILABLE', '无法切换到该组织');
	}
	try {
		const user = (await User.findOneAndUpdate(
			{ account },
			{ $set: { tenant: new Mongoose.Types.ObjectId(tenantid) } },
			{ new: true }
		)) as UserType;
		let ret = await buildSessionResponse(user);
		return h.response(ret);
	} catch (err) {
		console.error(err);
		return h.response(replyHelper.constructErrorResponse(err)).code(500);
	}
}

async function TenantDetail(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	const tenant = await Tenant.findById(req.params.tenant_id).lean();
	return h.response({
		code: 0,
		data: tenant,
		msg: '操作成功',
	});
}
// 处理表结构变化的数据流转工作
async function handleDateFlow(req: Request, h: ResponseToolkit) {
	const PLD = req.payload as any;
	const CRED = req.auth.credentials as any;
	let failNum = 0;
	let successNum = 0;
	let newNum = 0;
	const { code = '' } = req.params;
	if (code != 'qwe') {
		return h.response({
			code: 0,
			msg: '密钥不匹配',
		});
	}
	/*
  try {
    //清空旧数据
    // const delLt = await Employee.deleteMany()

    // 读取旧数据
    let userList = await User.find({});
    // 插入到新表
    for (let i = 0; i < userList.length; i++) {
      //const user = userList[i]._doc;
      const user = userList[i];
      if (
        user?._id &&
        user?.tenant &&
        (user?.group ||
          user?.avatarinfo ||
          user?.signature ||
          user?.active ||
          user?.succeed ||
          user?.succeedname)
      ) {
        let employee = await Employee.find({
          userid: user._id,
          tenant: user.tenant,
        });
        if (employee) {
          await Employee.deleteOne({
            userid: user._id,
            tenant: user.tenant,
          });
        }
        employee = new Employee({
          userid: user._id,
          email: user.email,
          inviterid: "",
          tenant: user.tenant,
          groupno: "",
          nickname: user.username || "",
          group: user?.group || "ADMIN",
          mg: user?.mg || "default",
          avatarinfo: user?.avatarinfo || {},
          signature: user?.signature || "",
          active: user?.active || false,
          succeed: user?.succeed || "",
          succeedname: user?.succeedname || "",
        });
        let res = await employee.save();
        if (!res) {
          failNum++;
          return h.response({
            code: 0,
            msg: "插入失败",
          });
        } else {
          successNum++;
        }
      } else {
        newNum++;
      }
    }
    return h.response({
      code: 0,
      msg: `数据流转完成，总数量：${userList.length}，失败数量：${failNum}，成功插入的数量：${successNum},有${newNum}条新数据`,
    });
  } catch (err) {
    return h.response({
      code: 500,
      msg: "系统错误",
      data: err,
    });
  }
  */
}

async function UpdataUserInfo(req: Request, h: ResponseToolkit) {
	return h.response(
		await MongoSession.noTransaction(async () => {
			const PLD = req.payload as any;
			const CRED = req.auth.credentials as any;

			if ((await Cache.setOnNonExist('admin_' + CRED.user.account, 'a', 10)) === false) {
				throw new EmpError('NO_BRUTE', 'Please wait a moment');
			}
			try {
				const payload = {
					username: PLD.username,
					phone: PLD.phone,
					email: PLD.email,
					decs: PLD.decs,
					organization: PLD.organization,
					corporate: PLD.corporate,
					avatar: PLD.avatar,
				};
				// 使用findOneAndUpdate来原子性地找到并更新文档
				let user: UserType = await User.findOneAndUpdate(
					{ account: CRED.user.account }, // 查询条件
					{ ...payload }, // 更新内容
					{ new: true } // 返回更新后的文档
				);

				if (user) {
					await Cache.removeKeyByEid(CRED.tenant._id, CRED.employee.eid);
					// 成功更新文档
					const res = await buildSessionResponse(user);
					return { code: '200', data: res, message: `更新${PLD.username}成功` };
				} else {
					// 没有找到对应的文档，可能需要处理错误或创建新文档
					return { code: '404', message: '没有找到用户信息进行更新' };
				}
			} catch (error) {
				// 处理任何可能出现的错误
				return { code: '-1', message: `更新失败` + error };
			}
		})
	);
}
export default {
	RegisterUser,
	CheckFreeReg,
	CheckAccountAvailability,
	SetUserName,
	SetNickName,
	SetMyPassword,
	SetNotify,
	Evc,
	LoginUser,
	ScanLogin,
	PhoneLogin,
	RefreshUserSession,
	LogoutUser,
	VerifyEmail,
	ResetPasswordRequest,
	ResetPassword,
	GetMyProfile,
	RemoveUser,
	MyOrg,
	MyOrgSetOrgmode,
	MyOrgGetSmtp,
	MyOrgSetSmtp,
	MyOrgSetRegFree,
	MyOrgSetAllowEmptyPbo,
	GenerateNewJoinCode,
	OrgSetJoinCode,
	OrgSetName,
	OrgSetTheme,
	OrgSetTimezone,
	OrgSetOpenAiAPIKey,
	OrgSetTags,
	OrgSetMenu,
	JoinOrg,
	ClearJoinApplication,
	JoinApprove,
	SetEmployeeGroup,
	SetEmployeeMenuGroup,
	SetEmployeePassword,
	RemoveEmployees,
	QuitOrg,
	GetOrgEmployees,
	UploadAvatar,
	AvatarViewer,
	SendInvitation,
	SignatureUpload,
	SignatureRemove,
	SignatureSetText,
	SignatureGetText,
	SignatureViewer,
	TenantList,
	SwitchTenant,
	TenantDetail,
	upgradeTenant,
	handleDateFlow,
	UpdataUserInfo,
};
