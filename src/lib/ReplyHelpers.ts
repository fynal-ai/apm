import type { ErrResponse } from "./EmpTypes.js";
import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";

function joiResponseErrorHandler(err) {
	if (err.isJoi) {
		let response: ErrResponse = {
			errors: {},
		};

		err.details.forEach((error) => {
			response.errors[error.context.key] = [error.message];
		});

		console.log("Error handler with JOI");
		return response;
	}

	return null;
}

function defaultResponseErrorHandler(err) {
	let response: ErrResponse = {};

	response.statusCode = 400;
	response.error = err.name;
	response.code = "default";
	response.message = err.message;
	response.details = err.details;
	console.log("Error handler with default");

	return response;
}

function mongooseResponseValidationErrorHandler(err) {
	if (err.name && err.name === "ValidationError") {
		let response: ErrResponse = {
			errors: {},
		};

		var keys = Object.keys(err.errors);
		for (var index in keys) {
			var key = keys[index];
			console.log("Key=", key);
			if (err.errors[key].hasOwnProperty("message")) {
				response.errors[key] = [`"${err.errors[key].value}" ${err.errors[key].message}`];
			}
		}

		console.log("Error handler with mongoValidation");
		return response;
	}

	return null;
}
function mongooseErrorHandler(err) {
	//err={"driver":true,"name":"MongoError","index":0,"code":11000,"keyPattern":{"email":1},"keyValue":{"email":"liukehong@gmail.com"}}
	if (err.name && ["MongoError", "MongoServerError"].includes(err.name)) {
		let response: ErrResponse = {};

		response.statusCode = 400;
		response.code = err.code;
		if (err.code === 11000) {
			var keys = Object.keys(err.keyPattern);
			let duplicateKey = keys[0];
			response.error = "duplicate_" + duplicateKey;
			let duplicateValue = err.keyValue[duplicateKey];
			response.message = `${duplicateValue} 已经存在`;
		}

		console.log("Error handler with mongoServer");
		return response;
	}

	return null;
}

const errorHandlers = [
	joiResponseErrorHandler,
	mongooseResponseValidationErrorHandler,
	mongooseErrorHandler,
	defaultResponseErrorHandler,
];

const replyHelper = {
	constructErrorResponse: (err) => {
		var response;
		for (var handler in errorHandlers) {
			let handlerFn = errorHandlers[handler];
			if (typeof handlerFn === "function") {
				response = handlerFn(err);
				if (response !== null) break;
			}
		}
		//console.error("============return:", response);
		return response;
	},

	headers: {
		nocache: {
			"Content-Type": "application/json; charset=utf-8;",
			"Cache-Control": "no-cache, private",
			"X-Content-Type-Options": "nosniff",
		},
	},

	build304: (data: any, etag: string) => {
		return replyHelper.buildReturn(data, replyHelper.headers.nocache, etag, 304);
	},
	buildReturnWithEtag: (data: any, etag: string) => {
		return replyHelper.buildReturn(data, replyHelper.headers.nocache, etag);
	},
	buildReturn: (data: any, headers: Record<string, any>, etag: string = "", code: number = -1) => {
		let theData = { data: data, headers: headers };
		if (etag != "") theData["etag"] = etag;
		if (code > 0) theData["code"] = code;
		return theData;
	},

	buildResponse: (h: ResponseToolkit, retData: any): ResponseObject => {
		let res: ResponseObject = null;
		if (retData?.data) {
			//复杂返回，必须要有data
			res = h.response(retData.data);
			res = res.header("Access-Control-Allow-Origin", "*");
			if (retData.code) res = res.code(retData.code);
			if (retData.etag) res = res.header("ETag", retData.etag);
			if (retData.headers) {
				let names = Object.keys(retData.headers);
				for (let i = 0; i < names.length; i++) {
					res = res.header(names[i], retData.headers[names[i]]);
				}
			}
		} else {
			//简单返回
			res = h.response(retData);
		}
		return res;
	},
};

export default replyHelper;
