"use strict";
import Mongoose from "mongoose";
import replyHelper from "./ReplyHelpers.js";
import EmpError from "./EmpError.js";

const MongoSession = {
	startSession: async (): Promise<Mongoose.ClientSession> => {
		const session = await Mongoose.connection.startSession({
			defaultTransactionOptions: {
				readConcern: { level: "majority" },
				writeConcern: { w: "majority", j: true },
				readPreference: "primary",
				//maxCommitTimeMS: 2000,
			},
		});
		return session;
	},

	withTransaction: async (
		mtcFunc: (session: Mongoose.ClientSession) => Promise<any>,
	): Promise<any> => {
		const session = await MongoSession.startSession();
		try {
			let resultObj: any;
			const transactionResults = await session.withTransaction(async (session) => {
				resultObj = await mtcFunc(session);
				return resultObj;
			});
			return resultObj;
		} catch (err) {
			console.log("==================");
			console.log("Got err", err);
			console.log("==================");
			return MongoSession.errorHandler(err);
		} finally {
			try {
				await session.endSession();
			} catch (err) {
				console.error(err);
			}
		}
	},

	noTransaction: async (mtcFunc: () => Promise<any>): Promise<any> => {
		try {
			return await mtcFunc();
		} catch (err) {
			return MongoSession.errorHandler(err);
		}
	},

	errorHandler: (err: Error) => {
		console.error(err);
		interface withKey {
			keyValue: any;
		}
		if (err.message.indexOf("E11000 duplicate key") > -1) {
			if (err.message.indexOf("emp.tenants index: domain") > 0) {
				err = new EmpError(
					"DUPLICATE_TENANT_DOMAIN",
					`Tenants with the same domain ${
						(err as unknown as withKey).keyValue?.domain
					} already exists`,
				);
			} else if (err.message.indexOf("emp.tenants index: site") > 0) {
				err = new EmpError(
					"DUPLICATE_TENANT_NAME",
					"Tenants with the same name in the same site already exists",
				);
			} else if (err.message.indexOf("emp.templates index") > 0) {
				err = new EmpError("TPL_ALREADY_EXIST", "Templates with the same tplid already exists");
			} else {
				err = new EmpError("DUPLICATE_KEY", "The same key already exists");
			}
			return replyHelper.constructErrorResponse(err);
		} else {
			return replyHelper.constructErrorResponse(err);
		}
	},
};

export default MongoSession;
