'use strict';
import { HydratedDocument, InferSchemaType, Schema, model } from 'mongoose';
interface ITimestamp {
	_id: Schema.Types.ObjectId | string;
	createdAt: Date;
	updatedAt: Date;
}

const schema = new Schema({
	// 用户id, 对应到用户个人账号
	userid: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
	// 用户当前所属的租户， 对应到所在企业
	tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
	// 对应到员工ID, eid + domain为邮箱
	// 如果企业有邮箱（Tenant.hasemail===true), 则eid就是邮箱前缀
	// 如果企业有没有邮箱(Tenant.hasemail===false), 则eid可以由用户自行设置, 需要保证eid+tenant唯一
	account: { type: String, required: true },
	eid: { type: String, required: true },
	domain: { type: String, default: '' },
	inviterid: { type: String, default: '' },
	// 用户在组织的编号。比如：工号等
	idnumber: { type: String, default: '' },
	// 企业备注昵称
	nickname: { type: String, defalut: '' },
	// 用户所属的用户组， 不同用户组用于控制相应权限
	// 在当前的代码中，应该只用到了DOER和ADMIN，以区分普通用户和管理员
	// 未来开发中，一个组织中有哪些用户组，应该由管理员来配置，
	// 而不是在这里用enum固定定义。相应的，不同用户组有什么权限
	// 也应由管理员来配置
	group: [{ type: String }],

	mg: {
		type: String,
		default: 'default',
	},
	// 用户上传的头像，相对路径
	// 注意历史遗留未澄清：
	// 1. 之前使用avatar，就是一个url，直接作为img的src值
	// 2. 后来支持用户上传，上传后文件信息放在avatarinfo中
	// 3. 但好像代码中还保留了之前的avatar，需要澄清清理
	avatarinfo: {
		path: { type: String, required: true },
		media: { type: String, required: true },
		etag: { type: String, default: '' },
	},
	// 用户的签名档图片地址，直接是URL
	signature: { type: Schema.Types.String, default: '' },
	// 当前账号是否为可用状态
	active: { type: Boolean, default: true },
	// 用户离职后，接手人的userId
	succeed: { type: String, default: '' },
	// 接手人的nickname
	succeedname: { type: String, default: '' },
	// 在有新工作任务时，是否发送提醒: e:邮件; s:短信; w:企业微信 多个字母的组合
	notify: { type: String, default: 'e' },
});
schema.index({ tenant: 1, eid: 1 }, { unique: true });

export type EmployeeType = HydratedDocument<InferSchemaType<typeof schema>> & ITimestamp;

export const Employee = model('Employee', schema);
