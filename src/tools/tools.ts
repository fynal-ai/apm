import { Cheerio, Element } from 'cheerio';
import Jimp from 'jimp';
import { marked as Marked } from 'marked';
import Cache from '../lib/Cache.js';
import EmpError from '../lib/EmpError.js';
import { Types } from 'mongoose';
import zlib from 'zlib';
import type { PondFileInfoOnServerType } from '../lib/EmpTypes.js';
import lodash from 'lodash';
import path from 'path';
import { sprintf } from 'sprintf-js';
import Handlebars from 'handlebars';
import SanitizeHtml from 'sanitize-html';

const replaceReg = / |　/gi;
const Tools = {
	NID: '000000000000000000000000',
	USER_SYS: '000000000000000000000000',
	USER_AST: '000000000000000000000001',
	MAX_PIN_KEEP: -365,
	toISOString: function (date: Date) {
		return date.toISOString();
	},
	getISODate: function (date: Date) {
		let y = date.getFullYear();
		let m = date.getMonth() + 1;
		let d = date.getDate();

		return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
	},
	ISODate: function (fodate: any) {
		return (
			fodate.year +
			'-' +
			(fodate.month < 10 ? '0' + fodate.month : fodate.month) +
			'-' +
			(fodate.day < 10 ? '0' + fodate.day : fodate.day)
		);
	},
	getBeforeDate: function (month: string) {
		let y = Number(month.substring(0, 4));
		let m = Number(month.substring(5)) + 1;
		if (m > 12) {
			m = 1;
			y = y + 1;
		}
		let tmp = y + '-';
		if (m < 10) tmp += '0';
		tmp += m;
		tmp += '-01';
		return new Date(tmp);
	},
	hasValue: function (obj: any) {
		if (obj === undefined) return false;
		if (obj === null) return false;
		if (obj === '') return false;

		return true;
	},
	isEmpty: function (obj: any) {
		return !this.hasValue(obj);
	},
	blankToDefault: function (val: any, defaultValue: any) {
		if (this.isEmpty(val)) return defaultValue;
		else return val;
	},

	emptyThenDefault: function (val: any, defaultValue: any) {
		if (this.isEmpty(val)) return defaultValue;
		else return val;
	},

	cleanupDelimiteredString: function (str: string) {
		return str
			.split(/[ ;,]/)
			.filter((x) => x.trim().length > 0)
			.join(';');
	},
	sleep: async function (miliseconds: number) {
		await new Promise((resolve) => setTimeout(resolve, miliseconds));
	},
	isArray: function (input: any) {
		return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
	},
	nbArray: function (arr: any) {
		return arr && this.isArray(arr) && arr.length > 0;
	},
	chunkString: function (str: any, len: number) {
		const size = Math.ceil(str.length / len);
		const r = Array(size);
		let offset = 0;

		for (let i = 0; i < size; i++) {
			r[i] = str.substr(offset, len);
			offset += len;
		}

		return r;
	},

	qtb: function (str: string) {
		str = str.replace(/；/g, ';');
		str = str.replace(/：/g, ':');
		str = str.replace(/，/g, ',');
		str = str.replace(/（/g, '(');
		str = str.replace(/）/g, ')');
		str = str.replace(/｜/g, '|');
		return str;
	},

	isObject: function (input: object) {
		// IE8 will treat undefined and null as object if it wasn't for
		// input != null
		return input != null && Object.prototype.toString.call(input) === '[object Object]';
	},

	hasOwnProp: function (a: any, b: string) {
		return Object.prototype.hasOwnProperty.call(a, b);
	},

	isObjectEmpty: function (obj: any) {
		if (Object.getOwnPropertyNames) {
			return Object.getOwnPropertyNames(obj).length === 0;
		} else {
			var k: any;
			for (k in obj) {
				if (Tools.hasOwnProp(obj, k)) {
					return false;
				}
			}
			return true;
		}
	},

	isUndefined: function (input: any) {
		return input === void 0;
	},

	isNumber: function (input: any) {
		return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
	},

	isDate: function (input: any) {
		return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
	},

	copyObject: function (obj: any) {
		let ret = {};
		for (let key in obj) {
			if (key !== '_id') ret[key] = obj[key];
		}
		return ret;
	},
	copyObjectAsis: function (obj: any) {
		let ret = {};
		for (let key in obj) {
			ret[key] = obj[key];
		}
		return ret;
	},

	fromObject: function (obj: any, names: string[]) {
		let ret = {};
		for (let i = 0; i < names.length; i++) {
			if (obj[names[i]] !== undefined) ret[names[i]] = obj[names[i]];
		}
		return ret;
	},

	log: function (obj: any, tag: string) {
		if (tag) console.log(tag + ' ' + JSON.stringify(obj, null, 2));
		else console.log(JSON.stringify(obj, null, 2));
	},

	codeToBase64: function (code: any) {
		return Buffer.from(code).toString('base64');
	},
	base64ToCode: function (base64: any) {
		return Buffer.from(base64, 'base64').toString('utf-8');
	},

	getTagsFromString: function (tagstring: string) {
		let tmp = tagstring.replace(replaceReg, '');
		tmp = tmp.replace(/,$|，$/, '');
		let tags = tmp.split(/,|，/);
		tags = tags.filter((x) => x !== '');
		tags = [...new Set(tags)];
		return tags;
	},

	resizeImage: async function (
		images: string[],
		width: number,
		height = Jimp.AUTO,
		quality: number
	) {
		await Promise.all(
			images.map(async (imgPath) => {
				const image = await Jimp.read(imgPath);
				image.resize(width, height);
				image.quality(quality);
				image.writeAsync(imgPath);
			})
		);
	},

	defaultValue: function (obj: any, defaultValue: any, allowEmptyString = false) {
		if (allowEmptyString && obj === '') return obj;
		return this.isEmpty(obj) ? defaultValue : obj;
	},

	zipit: function (input: any, options: zlib.ZlibOptions) {
		const promise = new Promise(function (resolve, reject) {
			zlib.gzip(input, options, function (error, result) {
				if (!error) resolve(result);
				else reject(Error(error.message));
			});
		});
		return promise;
	},
	unzipit: function (input: any, options: zlib.ZlibOptions) {
		const promise = new Promise(function (resolve, reject) {
			zlib.gunzip(input, options, function (error, result) {
				if (!error) resolve(result);
				else reject(Error(error.message));
			});
		});
		return promise;
	},
	makeEmailSameDomain: function (uid: string, email: string) {
		throw new Error(`makeEmailSameDomain(${uid}, ${email}) is deprecated`);
		/*
		let domain = this.getEmailDomain(email);
		let tmp = uid.indexOf("@");
		if (tmp < 0) return uid + domain;
		else if (tmp === 0) {
			return uid.substring(1) + domain;
		} else {
			return uid.substring(0, tmp) + domain;
		}
		*/
	},
	getEmailDomain: function (email: string) {
		let tmp = email.indexOf('@');
		if (tmp < 0) return 'notemail';
		return email.substring(tmp);
	},
	getEmailPrefix: function (email: string) {
		let tmp = email.indexOf('@');
		if (tmp < 0) return email;
		return email.substring(0, tmp);
	},

	getFrontEndUrl: function () {
		var url = '';
		if (process.env.EMP_FRONTEND_URL) {
			url = process.env.EMP_FRONTEND_URL;
		} else {
			throw new Error('EMP_FRONTEND_URL not set');
		}
		return url;
	},
	timeStringTag: function (time = null) {
		if (!time) time = new Date();
		return sprintf(
			'%04d%02d%02d:%02d:%02d:%02d',
			time.getFullYear(),
			time.getMonth(),
			time.getDate(),
			time.getHours(),
			time.getMinutes(),
			time.getSeconds()
		);
	},

	getPondServerFile: function (
		tenant: string | Types.ObjectId,
		eid: string,
		serverId: string
	): PondFileInfoOnServerType {
		let attachment_folder = Tools.getTenantFolders(tenant).attachment;
		return {
			tenant: tenant.toString(),
			eid: eid,
			fileName: serverId,
			folder: path.join(attachment_folder, eid),
			fullPath: path.join(attachment_folder, eid, serverId),
		};
	},
	getRandomInt: function (min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	randomNumber: () => {
		let Num = Math.round(Math.random() * 1000000);
		if (Num < 100000 || Num > 1000000) {
			return Tools.randomNumber();
		} else {
			return Num;
		}
	},

	randomString: function (length: number, chars: string) {
		var result = '';
		for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
		return result;
	},
	getEidsFromText: function (content: string) {
		let people = [];
		let m = content.match(/@([\w]+)/g);
		if (m) {
			for (let i = 0; i < m.length; i++) {
				let anEid = m[i].substring(1);
				anEid = Tools.qtb(anEid);
				anEid = lodash.trimEnd(anEid, '.,? ');
				people.push(anEid);
			}
		}
		return people;
	},
	getDefaultAvatarPath: function () {
		return path.join(process.env.EMP_STATIC_FOLDER, 'default_avatar.png');
	},
	getEmployeeAvatarPath: function (tenant: string, eid: string) {
		return path.join(process.env.EMP_STATIC_FOLDER, tenant, 'avatar', 'avatar_' + eid);
	},
	getEmployeeSignaturePath: function (tenant: string, eid: string) {
		return path.join(process.env.EMP_STATIC_FOLDER, tenant, 'signature', 'sig_' + eid);
	},
	getTemplateCoverPath: function (tenant: string, tplid: string) {
		return path.join(this.getTenantFolders(tenant).cover, `${tplid}.png`);
	},
	getTenantFolders: function (tenant: string | Types.ObjectId) {
		tenant = tenant.toString();
		return {
			runtime: path.join(process.env.EMP_RUNTIME_FOLDER, tenant),
			avatar: path.join(process.env.EMP_STATIC_FOLDER, tenant, 'avatar'),
			signature: path.join(process.env.EMP_STATIC_FOLDER, tenant, 'signature'),
			cover: path.join(process.env.EMP_STATIC_FOLDER, tenant, 'cover'),
			attachment: path.join(process.env.EMP_ATTACHMENT_FOLDER, tenant),
		};
	},
	splitComment: function (str: string) {
		//确保@之前有空格
		str = str.replace(/([\S])@/g, '$1 @');
		//确保@ID之后有空格
		str = str.replace(/@(\w+)/g, '@$1 ');
		//按空字符分割
		let tmp = str.split(/\s/);
		if (Array.isArray(tmp)) return tmp;
		else return [];
	},
	sanitizeHtmlAndHandleBar: function (all_kvars: any, txt: string) {
		let ret = txt;
		let template = Handlebars.compile(txt);
		ret = template(all_kvars);
		ret = SanitizeHtml(ret, {
			allowedTags: [
				'b',
				'i',
				'em',
				'strong',
				'a',
				'blockquote',
				'li',
				'ol',
				'ul',
				'br',
				'code',
				'span',
				'sub',
				'sup',
				'table',
				'thead',
				'th',
				'tbody',
				'img',
				'video',
				'source',
				'tr',
				'td',
				'p',
				'div',
				'h1',
				'h2',
				'h3',
				'h4',
			],
			allowedAttributes: {
				'*': ['*'],
			},
		});
		return ret;
	},

	getStatusFromClass: function (node: Cheerio<Element>) {
		if (node.hasClass('ST_RUN')) return 'ST_RUN';
		if (node.hasClass('ST_PAUSE')) return 'ST_PAUSE';
		if (node.hasClass('ST_DONE')) return 'ST_DONE';
		if (node.hasClass('ST_STOP')) return 'ST_STOP';
		if (node.hasClass('ST_IGNORE')) return 'ST_IGNORE';
		if (node.hasClass('ST_RETURNED')) return 'ST_RETURNED';
		if (node.hasClass('ST_REVOKED')) return 'ST_REVOKED';
		if (node.hasClass('ST_END')) return 'ST_END';
		if (node.hasClass('ST_WAIT')) return 'ST_WAIT';
		throw new EmpError(
			'WORK_NO_STATUS_CLASS',
			`Node status class is not found. classes="${node.attr('class')}"`,
			{
				nodeid: node.attr('nodeid'),
				classes: node.attr('class'),
			}
		);
	},

	setPeopleFromContent: async function (
		tenant: Types.ObjectId | string,
		content: string,
		people: string[],
		eids: string[]
	) {
		let tmp = Tools.getEidsFromText(content);
		for (let i = 0; i < tmp.length; i++) {
			let toWhomEid = tmp[i];
			let receiverCN = await Cache.getEmployeeName(tenant, toWhomEid, 'setPeopleFromContent');
			if (receiverCN !== 'USER_NOT_FOUND') {
				people.push(tmp[i]);
				eids.push(toWhomEid);
			}
		}
		eids = [...new Set(eids)];
		people = [...new Set(people)];
		people = people.map((p) => Tools.getEmailPrefix(p));
		return [people, eids];
	},
};

export default Tools;
