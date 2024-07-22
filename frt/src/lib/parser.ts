/*eslint @typescript-eslint/no-explicit-any: 0*/
import { Buffer } from 'buffer';
import * as api from '$lib/api';
interface KVars {
	name: string;
	def: unknown;
}
const createWorker = (funcContent: string): Worker => {
	const blob = new Blob([funcContent]);
	const url = window.URL.createObjectURL(blob);
	const worker = new Worker(url);
	return worker;
};
const workerFunctionContent = function (expr: string): string {
	return `(function(e){
		let res = ${expr};
		self.postMessage(res);
		self.close();
})()`;
};

const Parser = {
	isEmpty: function (str: string | number): boolean {
		if (str === undefined || str === null) return true;
		if (str === '') return true;
		return false;
	},
	hasValue: function (str: string | number): boolean {
		return !this.isEmpty(str);
	},
	kvarsToArrayForActionPropertyModal: function (
		kvars: KVars,
		workid: string,
	): Record<string, unknown>[] {
		const kvarsArr = [];
		for (const [name, valueDef] of Object.entries(kvars)) {
			//eslint-disable-next-line
			let tmp: Record<string, unknown> = {};
			if (typeof valueDef === 'string') tmp = { name: name, value: valueDef, type: 'plaintext' };
			else {
				tmp = { ...{ name: name }, ...valueDef };
				//END Speculate variable type
				if (workid && workid.length > 0) {
					for (const [varKey, varValue] of Object.entries(tmp)) {
						if (typeof varValue === 'string' && varValue.indexOf('[workid]') >= 0) {
							tmp[varKey] = varValue.replace('[workid]', workid);
						}
					}
				}
				/* if (tmp.type === 'select' && Array.isArray(tmp.options) === false) {
					tmp.options = ['DEFAULT'];
				} */
			}
			if (tmp.formula) tmp.value = '=' + tmp.formula;
			if ((tmp.name as unknown as string).startsWith('$') === false) {
				kvarsArr.push(tmp);
			}
		}
		return kvarsArr;
	},
	arrayToKvars: function (kvarsArray: Record<string, unknown>[]): Record<string, unknown> {
		const ret: Record<string, unknown> = <Record<string, unknown>>{};
		for (let i = 0; i < kvarsArray.length; i++) {
			ret[kvarsArray[i].name as string] = kvarsArray[i];
			delete (ret[kvarsArray[i].name as string] as Record<string, unknown>)['name'];
		}
		return ret;
	},
	splitStringToArray: function (str: string, deli: string | null = null) {
		if (typeof str !== 'string') str = '';
		else str = str.trim();
		if (str === '') return [];
		let tmp = str.split(deli ? deli : /[\s;,]/);
		tmp = tmp.map((x: string) => x.trim()).filter((x: string) => x.length > 0);
		return tmp;
	},
	chunkString: function (str: string, len: number) {
		const size = Math.ceil(str.length / len);
		const r = Array(size);
		let offset = 0;

		for (let i = 0; i < size; i++) {
			r[i] = str.substring(offset, offset + len);
			offset += len;
		}

		return r;
	},

	codeToBase64: function (code: string): string {
		return Buffer.from(code).toString('base64');
	},
	base64ToCode: function (base64: string, ifErrorValue = ''): string {
		try {
			return Buffer.from(base64, 'base64').toString('utf-8');
		} catch (error) {
			return ifErrorValue;
		}
	},
	addUserTag: function (str: string) {
		const m = str.match(/(@\S+)/g);
		if (!m) return str;
		for (let i = 0; i < m.length; i++) {
			str = str.replace(m[i], `<span class='usertag'>${m[i]}</span>`);
		}
		return str;
	},

	//eslint-disable-next-line
	collectRoles: function (nodes: any): string[] {
		const ret: string[] = [];
		//eslint-disable-next-line
		nodes.each((_index: number, aNode: any) => {
			const aRole = $(aNode).attr('role');
			if (aRole && ret.indexOf(aRole) === -1) {
				ret.push(aRole);
			}
		});
		if (ret.indexOf('DEFAULT') === -1) {
			ret.push('DEFAULT');
		}
		if (ret.indexOf('STARTER') === -1) {
			ret.unshift('STARTER');
		}
		return ret;
	},

	newlineToBreak: function (txt: string): string {
		return txt.replace(/\n/g, '<br/>');
	},

	toValidVarName: function (tmp: string): string {
		return tmp.trim().replace(/^[^a-zA-Z_$]|[^\w$]/g, '_');
	},

	evalFormula: function (kvarArr: any[], formula: string): Promise<any> {
		const replaceKvar = function (formula: string) {
			for (let i = 0; i < kvarArr.length; i++) {
				const re = new RegExp(`\\b${kvarArr[i].name}\\b`, 'g');
				if (kvarArr[i].type === 'number' || kvarArr[i].type === 'range')
					formula = formula.replace(re, kvarArr[i].value);
				else formula = formula.replace(re, '"' + kvarArr[i].value + '"');
			}
			return formula;
		};

		const expr = replaceKvar(formula);
		//let result = await api.post('formula/eval', { expr: expr }, user.sessionToken);

		return new Promise(function (resolve, reject) {
			const pollingWorker = createWorker(workerFunctionContent(expr));

			pollingWorker.onmessage = function (e: any) {
				let result = e.data;
				if (typeof result === 'number' && isNaN(result)) result = 0;
				resolve(result);
			};
			pollingWorker.onerror = function (e: any) {
				reject(e.data);
			};
		});
	},

	evalFormula_use_server_backend: async function (
		user: any,
		kvarArr: any[],
		formula: string,
	): Promise<any> {
		const replaceKvar = function (formula: string) {
			for (let i = 0; i < kvarArr.length; i++) {
				const re = new RegExp(`\\b${kvarArr[i].name}\\b`, 'g');
				if (kvarArr[i].type === 'number' || kvarArr[i].type === 'range')
					formula = formula.replace(re, kvarArr[i].value);
				else formula = formula.replace(re, '"' + kvarArr[i].value + '"');
			}
			return formula;
		};

		const expr = replaceKvar(formula);
		const result = await api.post('formula/eval', { expr: expr }, user.sessionToken);

		//console.log('Formula:', formula, 'Expr:', expr, 'Result:', result);
		return result;
	},

	//转换value为与refValue类型相同，并返回转换后的值
	//仅支持基本类型，string， boolean， number
	sameTypeValue: function (value: any, refValue: any) {
		let tmp = value;
		if (typeof tmp !== 'string') {
			tmp = '' + value;
		}
		if (typeof refValue === 'boolean') {
			tmp = value === 'true';
			return tmp;
		} else if (typeof refValue === 'number') {
			tmp = parseFloat(tmp);
			return tmp;
		} else {
			return value;
		}
	},

	normalizeServerErrorMessage: function (res: any, i18n: any) {
		if (
			[
				'DELEGATE_FAILED_SAME_USER',
				'DELEGATE_FAILED_NOT_SAME_ORG',
				'DELEGATE_FAILED_OVERLAP',
			].indexOf(res.error) >= 0
		) {
			return i18n('server.' + res.error);
		} else if (
			res.message.indexOf('fails to match the required pattern') >= 0 &&
			res.message.indexOf('set_password_to') >= 0
		) {
			console.log(res);
			return i18n('error.password_format');
		} else {
			return res.message;
		}
	},
};
export default Parser;
