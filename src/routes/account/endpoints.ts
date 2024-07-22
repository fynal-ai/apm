'use strict';
import Joi from 'joi';
import Handlers from './handlers.js';
const validation = {
	account: /^[a-zA-Z][a-zA-Z0-9_]{2,28}[a-zA-Z0-9]$/,
	username: /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9. \-_\u4e00-\u9fa5]{0,28}[a-zA-Z0-9\u4e00-\u9fa5]$/,
	nickname: /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9. \-_\u4e00-\u9fa5]{0,28}[a-zA-Z0-9\u4e00-\u9fa5]$/,
	password: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/,
	notify: /[esw]{0,3}/,
};

const internals = {
	endpoints: [
		{
			method: 'POST',
			path: '/account/register',
			handler: Handlers.RegisterUser,
			config: {
				// Include this API in swagger documentation
				tags: ['api'],
				description: '注册用户',
				notes: '注册一个新用户',
				validate: {
					payload: {
						account: Joi.string()
							.regex(validation.account)
							.lowercase()
							.required()
							.description('要注册的账户名称'),
						username: Joi.string()
							.regex(validation.username)
							.required()
							.description('该账户的用户名'),
						password: Joi.string().regex(validation.password).required().description('登录密码'),
						demo: Joi.boolean().optional().default(false),
						siteid: Joi.string().optional().description('可以为空'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/check/freereg',
			handler: Handlers.CheckFreeReg,
			config: {
				description: '检查组织是否允许自由注册',
				notes: 'Check account owned Tenant is able to able to register freely or not',
				// Include this API in swagger documentation
				tags: ['deprecated'],
				validate: {
					payload: {
						account: Joi.string().email().lowercase().required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/account/check/availability',
			handler: Handlers.CheckAccountAvailability,
			config: {
				description: 'Check account availability',
				tags: ['private'],
				validate: {
					payload: {
						account: Joi.string().lowercase().min(3).required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/account/login',
			handler: Handlers.LoginUser,
			config: {
				// Include this API in swagger documentation
				tags: ['api'],
				description: '用户登录',
				notes: '如登录成功,返回session数据',
				validate: {
					payload: {
						account: Joi.string().lowercase().required().description('用户账号'),
						//password required with same regex as client
						password: Joi.string().required().description('用户密码'),
						siteid: Joi.string().optional().description('站点ID, 可省略'),
						openid: Joi.string()
							.optional()
							.allow('')
							.description(
								'微信openid, 仅用于使用微信openid登录时, 之前需要绑定。用账号密码登录时可省略'
							),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/account/scanner',
			handler: Handlers.ScanLogin,
			config: {
				tags: ['api'],
				description: '微信扫码登录',
				notes:
					'扫码登录成功后, 返回session数据. 用户扫码后,后台从微信获得openid, 然后根据openid匹配之前绑定的账号信息',
				validate: {
					payload: {
						code: Joi.string().required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/account/loginByPhone',
			handler: Handlers.PhoneLogin,
			config: {
				// auth: "token",
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: {
						code: Joi.string().required(),
						phone: Joi.string().required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/session/refresh',
			handler: Handlers.RefreshUserSession,
			config: {
				// Include this API in swagger documentation
				auth: 'token',
				tags: ['api'],
				description: 'Refresh user session',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/account/logout',
			handler: Handlers.LogoutUser,
			config: {
				// Include this API in swagger documentation
				tags: ['api'],
				description: '从客户端退出登录',
				notes: '退出登录以后,将不能再正常调用API',
				//authorization optional
				auth: 'token',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/employee/upload/avatar',
			handler: Handlers.UploadAvatar,
			config: {
				auth: 'token',
				description: "Uplaod an avatar image with file input field 'avatar'",
				tags: ['api', 'employee'],
				payload: {
					maxBytes: 1024 * 1024 * 5,
					output: 'file',
					parse: true,
					allow: ['multipart/form-data'],
					multipart: true,
				},
			},
		},

		{
			method: 'GET',
			path: '/account/verifyEmail/{token}',
			handler: Handlers.VerifyEmail,
			config: {
				tags: ['deprecated'],
				description: 'Verify User email',
				notes: 'User clicks link in email sent during registration',
				validate: {
					params: {
						token: Joi.string().required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/account/verifyEmail',
			handler: Handlers.VerifyEmail,
			config: {
				tags: ['deprecated'],
				description: 'Verify user email with verification token(not authentication token)',
				notes: 'User clicks link in email sent during registration',
				validate: {
					payload: {
						token: Joi.string().required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/account/evc',
			handler: Handlers.Evc,
			config: {
				tags: ['private'],
				validate: {
					payload: {
						email: Joi.string().email().lowercase().required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/account/resetPasswordRequest',
			handler: Handlers.ResetPasswordRequest,
			config: {
				// Include this API in swagger documentation
				tags: ['deprecated'],
				description: 'User requests to reset password',
				notes: 'Email is sent to email address provided',
				validate: {
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/account/resetPassword',
			handler: Handlers.ResetPassword,
			config: {
				// Include this API in swagger documentation
				tags: ['deprecated'],
				description: 'User posts new password',
				notes: 'Password form posts new password',
				validate: {
					payload: {
						//email required
						email: Joi.string().required(),
						//password required with same regex as client
						password: Joi.string().regex(validation.password).required(),
						vrfcode: Joi.string(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'GET',
			path: '/account/profile/me',
			handler: Handlers.GetMyProfile,
			config: {
				auth: 'token',
				tags: ['api'],
				description: '获取当前用户的账户信息',
				notes:
					'账号信息,包括账户,当前所在组织的员工信息,以及当前所在组织的信息, 返回 {user, employee,  tenant}对象',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/employee/signature/upload',
			handler: Handlers.SignatureUpload,
			config: {
				auth: 'token',
				description: "Upload a signature image with file input field 'signature'",
				tags: ['api', 'employee'],
				payload: {
					maxBytes: 1024 * 1024 * 5,
					output: 'file',
					parse: true,
					allow: ['multipart/form-data'],
					multipart: true,
				},
			},
		},
		{
			method: 'POST',
			path: '/employee/signature/set/text',
			handler: Handlers.SignatureSetText,
			config: {
				auth: 'token',
				tags: ['api', 'employee'],
				description: 'Set signature string',
				validate: {
					payload: {
						eid: Joi.string().optional(),
						signature: Joi.string().required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/employee/signature/remove',
			handler: Handlers.SignatureRemove,
			config: {
				tags: ['api', 'employee'],
				description: 'remove signature ',
				auth: 'token',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					payload: {
						eid: Joi.string().optional(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/employee/signature/get/text',
			handler: Handlers.SignatureGetText,
			config: {
				auth: 'token',
				tags: ['api', 'employee'],
				description:
					"Get signature defitition string, if start with 'PIC:', the signature is a picture, frontend should use  img.src='../signagure/eid' to display the signature, or else, the employee's signature is a text string, frontend should display this string directly",
				validate: {
					payload: {
						eid: Joi.string().optional(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'GET',
			path: '/signature/{eid}',
			handler: Handlers.SignatureViewer,
			config: {
				auth: 'token',
				tags: ['api'],
				description: "View an employee's signature",
			},
		},
		{
			method: 'POST',
			path: '/account/set/username',
			handler: Handlers.SetUserName,
			config: {
				auth: 'token',
				tags: ['api'],
				description: '修改账号的姓名',
				notes:
					'修改当前登录用户的account下的username , 并返回于登录时相同的session数据; 如当前用户是ADMIN,可以使用修改 其他用户的username, 此时需要指定account, 返回{account, username}',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					payload: {
						username: Joi.string()
							.trim()
							.regex(validation.username)
							.required()
							.description('账户名称'),
						account: Joi.string()
							.optional()
							.description('可选。如指定且用户为管理员时，可修改他人名称'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/employee/set/nickname',
			handler: Handlers.SetNickName,
			config: {
				auth: 'token',
				tags: ['api', 'employee'],
				description: '修改用户在当前组织中的名称',
				notes:
					'如果不指定eid, 则修改当前登录用户的当下tenant中employee的nickname, 并返回于登录时相同的session数据, 如果指定eid, 当eid不是当前用户时,要求当前用户必须是ADMIN, 如果是修改当前用户自己的nickname, 则返回session数据, 如果是ADMIN修改其他用户的nickname,则返回{eid, nickname}',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					payload: {
						nickname: Joi.string()
							.trim()
							.regex(validation.nickname)
							.required()
							.description('组织内名称'),
						eid: Joi.string()
							.optional()
							.description('可选.如指定eid且当前用户是管理员时,可修改他人的组织内名称'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/account/set/password',
			handler: Handlers.SetMyPassword,
			config: {
				auth: 'token',
				tags: ['api'],
				description: '修改密码',
				notes: '当前登录用户修改密码',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					payload: {
						oldpassword: Joi.string().required().description('原密码'),
						password: Joi.string().min(6).required().description('新密码'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/employee/set/notify',
			handler: Handlers.SetNotify,
			config: {
				auth: 'token',
				tags: ['api', 'employee'],
				description:
					"Set notify setting string for the current employee, any combination of 'e|s|w' is allowed",
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					payload: {
						notify: Joi.string().regex(validation.notify).required().allow(''),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/admin/remove/account',
			handler: Handlers.RemoveUser,
			config: {
				auth: 'token',
				tags: ['admin', 'account'],
				description: '站点管理员删除一个账号，管理员必须处于已登录状态，切提供站点管理密码',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					payload: {
						account: Joi.string().required().description('The account to be deleted'),
						password: Joi.string().required().description('The site password'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/my/org',
			handler: Handlers.MyOrg,
			config: {
				tags: ['api'],
				description: 'Get my org info in strict tenant mode',
				auth: 'token',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/set/orgmode',
			handler: Handlers.MyOrgSetOrgmode,
			config: {
				tags: ['api'],
				description: 'Set my org to orgmode',
				auth: 'token',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					payload: {
						tenant_id: Joi.string().required().description('字符串形式的tenant_id'),
						password: Joi.string().required().description('这个需要提供站点管理密码'),
						orgmode: Joi.bool().default(true),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/get/smtp',
			handler: Handlers.MyOrgGetSmtp,
			config: {
				tags: ['api'],
				description: 'Get SMTP from my org',
				auth: 'token',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					payload: {},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/set/smtp',
			handler: Handlers.MyOrgSetSmtp,
			config: {
				tags: ['api'],
				description: 'Set SMTP for my org',
				auth: 'token',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					payload: {
						smtp: {
							host: Joi.string()
								.required()
								.error(new Error('SMTP server address must be provided')),
							port: Joi.number().required().error(new Error('SMTP port must be provided')),
							secure: Joi.boolean().required().error(new Error('Secure connect must be specified')),
							username: Joi.string().required().error(new Error('SMTP user name must be provided')),
							password: Joi.string()
								.required()
								.error(new Error('SMTP user password must be provided')),
							from: Joi.string().required().error(new Error("Sender's name must be provided")),
						},
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/set/regfree',
			handler: Handlers.MyOrgSetRegFree,
			config: {
				tags: ['api'],
				description: 'Toggle allow regfree',
				auth: 'token',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					payload: {
						//password: Joi.string().required().error(new Error("Admin password must be provided")),
						regfree: Joi.boolean().required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/set/allowemptypbo',
			handler: Handlers.MyOrgSetAllowEmptyPbo,
			config: {
				tags: ['api'],
				description: 'Toggle allow empty PBO on process start',
				auth: 'token',
				validate: {
					headers: Joi.object({
						Authorization: Joi.string(),
					}).unknown(),
					payload: {
						allow: Joi.boolean().optional(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/joincode/new',
			handler: Handlers.GenerateNewJoinCode,
			config: {
				tags: ['api'],
				description: 'Generate new join code for strict tenant mode',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/set/joincode',
			handler: Handlers.OrgSetJoinCode,
			config: {
				tags: ['api'],
				description: 'Save a new join code.',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: { joincode: Joi.string().min(4).required() },
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/set/name',
			handler: Handlers.OrgSetName,
			config: {
				tags: ['api'],
				description: 'Save org name for strict tenant mode',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					//payload: { orgname: Joi.string().min(4).required(), password: Joi.string().required() },
					payload: { orgname: Joi.string().min(4).required() },
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/set/theme',
			handler: Handlers.OrgSetTheme,
			config: {
				tags: ['api'],
				description: 'Save org theme for strict tenant mode',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					//payload: { css: Joi.string().required(), password: Joi.string().required() },
					payload: { css: Joi.string().required() },
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/set/timezone',
			handler: Handlers.OrgSetTimezone,
			config: {
				tags: ['api'],
				description: 'Save org theme for strict tenant mode',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					//payload: { timezone: Joi.string().required(), password: Joi.string().required() },
					payload: { timezone: Joi.string().required() },
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/set/openaiapikey',
			handler: Handlers.OrgSetOpenAiAPIKey,
			config: {
				tags: ['api'],
				description: 'Set OpenAI API Key for current tenant',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: { openaiapikey: Joi.string().required() },
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/set/menu',
			handler: Handlers.OrgSetMenu,
			config: {
				tags: ['api'],
				description: 'Save org menu for strict tenant mode',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					//payload: { menu: Joi.string().required(), password: Joi.string().required() },
					payload: { menu: Joi.string().required() },
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/set/tags',
			handler: Handlers.OrgSetTags,
			config: {
				tags: ['api'],
				description: 'Save org menu for strict tenant mode',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					//payload: { tags: Joi.string().required().allow(""), password: Joi.string().required() },
					payload: { tags: Joi.string().required().allow(''), password: Joi.string().optional() },
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/join',
			handler: Handlers.JoinOrg,
			config: {
				tags: ['api'],
				description: 'Join a tenant in strict mode.',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: { joincode: Joi.string().min(4).required() },
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/join/clear',
			handler: Handlers.ClearJoinApplication,
			config: {
				tags: ['api'],
				description: 'Clear Join a tenant in strict mode.',
				auth: 'token',
			},
		},
		{
			method: 'POST',
			path: '/tnt/approve',
			handler: Handlers.JoinApprove,
			config: {
				tags: ['api'],
				description: 'Approve a tenant join application in strict mode.',
				auth: 'token',
				validate: {
					//headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: {
						account_eids: Joi.array()
							.items({
								account: Joi.string().lowercase(),
								eid: Joi.string().lowercase(),
							})
							.required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/employee/remove',
			handler: Handlers.RemoveEmployees,
			config: {
				tags: ['api'],
				description: 'Remove members from org',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: { eids: Joi.array().items(Joi.string()).required() },
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/employee/setgroup',
			handler: Handlers.SetEmployeeGroup,
			config: {
				tags: ['api'],
				description: 'Set group for members',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: {
						eids: Joi.array().items(Joi.string()).required().description('Array of eids'),
						group: Joi.string()
							.required()
							.valid('ADMIN', 'OBSERVER', 'DOER')
							.description('group to set'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/employee/setmenugroup',
			handler: Handlers.SetEmployeeMenuGroup,
			config: {
				tags: ['api'],
				description: 'Set menu group for members',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: {
						eids: Joi.array().items(Joi.string()).required().description('Array of eids'),
						menugroup: Joi.string().required().description('menu group to set'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/employee/setpassword',
			handler: Handlers.SetEmployeePassword,
			config: {
				tags: ['api'],
				description: 'Set group for members',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: {
						eids: Joi.array().items(Joi.string()).required(),
						set_password_to: Joi.string().regex(validation.password).required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/employees',
			handler: Handlers.GetOrgEmployees,
			config: {
				tags: ['api'],
				description: 'Get orgnization employees, {eid, nickname, group}',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: {
						eids: Joi.array()
							.default([])
							.items(Joi.string())
							.description('eids数组为空，返回全部, eids是一个eid数组,仅返回这部分员工信息'),
						active: Joi.number().optional().default(1).description('1: 在职, 2: 离职, 3:全部'),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/quit',
			handler: Handlers.QuitOrg,
			config: {
				tags: ['api'],
				description: 'Quit a tenant in strict mode',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tnt/send/invitation',
			handler: Handlers.SendInvitation,
			config: {
				tags: ['api'],
				description: 'Send invitaton to eids (array of eids)',
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: {
						eids: Joi.array().items(Joi.string()).required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'GET',
			path: '/avatar/{eid}',
			handler: Handlers.AvatarViewer,
			config: {
				auth: 'token',
				tags: ['api'],
				description: '用户的头像',
				notes: '可直接集成到html的 img src中',
			},
		},
		{
			method: 'POST',
			path: '/tenant/list',
			handler: Handlers.TenantList,
			config: {
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: {
						account: Joi.string().required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tenant/switch',
			handler: Handlers.SwitchTenant,
			config: {
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: {
						tenantid: Joi.string().required(),
						account: Joi.string().required(),
					},
					validator: Joi,
				},
			},
		},

		{
			method: 'GET',
			path: '/tenant/detail/{tenant_id}',
			handler: Handlers.TenantDetail,
			config: {
				auth: 'token',
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					params: {
						tenant_id: Joi.string().required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/tenant/upgrade',
			handler: Handlers.upgradeTenant,
			config: {
				// auth: "token",
				validate: {
					headers: Joi.object({ Authorization: Joi.string() }).unknown(),
					payload: {
						tenantid: Joi.string().required(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'GET',
			path: '/tenant/data-flow/{code}',
			handler: Handlers.handleDateFlow,
			config: {
				description: 'handle data flow',
				validate: {
					params: {
						code: Joi.string().optional(),
					},
					validator: Joi,
				},
			},
		},
		{
			method: 'POST',
			path: '/account/update_user_info',
			handler: Handlers.UpdataUserInfo,
			config: {
				tags: ['api'],
				description: '修改用户信息',
				notes: '修改用户信息',
				auth: 'token',
				validate: {
					payload: {
						username: Joi.string()
							.regex(validation.username)
							.required()
							.description('该账户的用户名'),
						phone: Joi.string().description('手机号').allow(''),
						email: Joi.string().description('邮箱').allow(''),
						decs: Joi.string().description('说明').allow(''),
						organization: Joi.string().description('组织').allow(''),
						corporate: Joi.string().description('公司').allow(''),
						avatar: Joi.string().description('头像').allow(''),
					},
					validator: Joi,
				},
			},
		},
	],
};

export default internals;
