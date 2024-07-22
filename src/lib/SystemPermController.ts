import { strict as assert } from 'node:assert';
import { EmployeeType } from '../database/models/Employee.js';
import Cache from './Cache.js';
const SUPPORTED_GROUPS = ['ADMIN', 'OBSERVER', 'DOER'];
const internals = {
	//对三个系统角色的赋权
	getMyGroupPerm: function (groups: string[]) {
		let perm = [];
		for (let i = 0; i < groups.length; i++) {
			perm = [...new Set([...perm, ...internals._getSingleGroupPerm(groups[i])])];
		}
		return perm;
	},

	_getSingleGroupPerm: function (group: string) {
		let perm = [];
		if (group === 'ADMIN') {
			//ADMIN组，所有人可用
			perm = ['*-*-*'];
		} else if (group == 'OBSERVER') {
			//OBSERVER只能读
			perm = ['*-*-read', '-*-*-update', '-*-*-delete', '-*-*-create'];
		} else if (group === 'DOER') {
			//DOER，
			perm = [
				//对所有可读
				'*-*-read',
				//对所有可创建
				'*-*-create',
				//对自己的对象拥有全部权限
				'owned-*-*',
				//对工作流进程不能改动
				//"-*-workflow-update",
				//对工作流进程不能删除
				//"-*-workflow-delete",
				//对工作项不能删除
				'-*-work-delete',
			];
		}
		return perm;
	},

	/**
	 * internals.hasPerm = async() Whether user has operaiton permission on class or object
	 *
	 *
	 * }
	 */
	hasPerm: async function (employee: EmployeeType, what: string, instance: any, op: string) {
		assert(
			employee.domain && employee.group && employee.eid,
			'First arg must be employee for hasPerm'
		);
		//先找缓存
		let permKey = `perm_${employee.domain}_${employee.eid}_${what}_${op}`;
		if (instance && instance._id) {
			permKey = permKey + '_' + instance._id.toString();
		}
		let perm = await Cache.getMyPerm(permKey);
		//找不到，则调用control来判断
		if (perm === null || perm === undefined) {
			perm = this.control(this.getMyGroupPerm(employee.group), employee.eid, what, instance, op);
			//解析后，放入缓存
			await Cache.setMyPerm(permKey, perm);
		} else {
			console.log('GOT perm from cache');
		}
		console.log('Perm>', perm, permKey);
		return perm;
	},

	//这个是真正的解析
	control: function (perms: string[], who: string, what: string, instance: any, op: string) {
		assert(who.indexOf('@') < 0, 'Who should be an eid');
		let ret = false;
		try {
			for (let i = 0; i < perms.length; i++) {
				let aPerm = perms[i];
				//赋予还是去除？
				let assign = true;
				if (aPerm[0] === '-') {
					//首字符为-，则为去除
					assign = false;
					aPerm = aPerm.substring(1);
				}
				//再按-分割
				let tmp = aPerm.split('-');
				let ownerField = 'author';
				//对象不同，ownerfield的owner的意义不同，
				//temkpalte/team的owner的意义是author
				//workflow是starter， work是doer
				ownerField = ['template', 'team'].includes(what)
					? 'author'
					: what === 'workflow'
					? 'starter'
					: what === 'work'
					? 'doer'
					: 'unknown_owner_field';
				if (tmp[0] === 'owned') {
					//针对owner, 则一定是指具体的一个instance
					if (instance && instance[ownerField] === who) {
						//如果是我的对象，那么就要再看，对象类型what和操作类型op的匹配
						if (['*', what].includes(tmp[1]) && ['*', op].includes(tmp[2])) {
							if (assign) ret = true;
							else ret = false;
						}
					}
				} else if (tmp[0] === '*') {
					//如果是对所有人，则也要针对对象what和操作op进行匹配分析
					if (['*', what].includes(tmp[1]) && ['*', op].includes(tmp[2])) {
						if (assign) ret = true;
						else ret = false;
					}
				}
				if (
					what &&
					instance &&
					who &&
					what === 'workflow' &&
					instance['starter'] === who &&
					instance['rehearsal'] === true
				) {
					ret = true;
				}
			}
		} catch (err) {
			console.error(err);
		}
		return ret;
	},
};

export default internals;
