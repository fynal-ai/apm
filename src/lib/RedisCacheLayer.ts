import { isMainThread } from "worker_threads";
import Tools from "../tools/tools.js";
import EmpError from "./EmpError.js";
/*
import { Template } from "../database/models/Template.js";
import { Workflow } from "../database/models/Workflow.js";
*/
import { redisClient, redisConnect } from "../database/redis.js";
import { Types, ClientSession } from "mongoose";
import assert from "assert";
import { LRUCache } from "lru-cache";

type WfFilter = { tenant: string | Types.ObjectId; wfid: string };
const lruCache = new LRUCache({ max: 2000 });
const CACHE_ELEVEL_MEM = 1;
const CACHE_ELEVEL_REDIS = 2;

const bytes = (s) => {
  return ~-encodeURI(s).split(/%..|./).length;
};
const jsonSize = (s) => {
  return bytes(JSON.stringify(s));
};

const genRedisKey = async (wfFilter: WfFilter) => {
  if (!redisClient.isOpen) await redisConnect();
  return `${wfFilter.tenant}:WF:${wfFilter.wfid}`;
};

/*
const getWorkflow = async (wfFilter: WfFilter, fromFunc: string) => {
	if (!fromFunc)
		throw new EmpError("NO_FROM_FUNC", "calling getWorkflow must provide from which function");
	if (!(wfFilter.tenant && wfFilter.wfid))
		throw new EmpError("WF_FILTER_ERROR", "Passed in wf filter should have both tenant and wfid");

	const wfCacheKey = await genRedisKey(wfFilter);

	const wfInLocalLruCache = lruCache.get(wfCacheKey) as any;
	if (wfInLocalLruCache) {
		try {
			assert(wfInLocalLruCache.doc, "⚠️  cache-1 workflow should have doc property");
			console.log(`[Cache 1️⃣ ] 🐵 getWorkflow  ${fromFunc}`);
			return wfInLocalLruCache;
		} catch (assertError) {
			console.log(assertError.message);
			lruCache.delete(wfCacheKey);
		}
	}

	const stringifiedWfInRedis = (await redisClient.get(wfCacheKey)) as string;
	if (stringifiedWfInRedis) {
		const wfInRedis = JSON.parse(stringifiedWfInRedis);
		try {
			assert(wfInRedis.doc, "⚠️  cache-2 workflow should have doc property");
			lruCache.set(wfCacheKey, wfInRedis);
			console.log(`[Cache 2️⃣ ] 🐵 getWorkflow  ${fromFunc}`);
			return wfInRedis;
		} catch (assertError) {
			console.log(assertError.message);
			await redisClient.del(wfCacheKey);
			throw new EmpError("WF_NOT_CORRECT", assertError.message);
		}
	}

	const wfInDB = await Workflow.findOne(wfFilter, { __v: 0 }).lean();
	if (!wfInDB) {
		throw new EmpError("WF_NOT_FOUND", wfCacheKey);
	}
	try {
		assert(wfInDB.doc, "⚠️  cache-3 workflow should have doc property");
		const stringifiedWfInDB = JSON.stringify(wfInDB);
		await redisClient.set(wfCacheKey, stringifiedWfInDB);
		lruCache.set(wfCacheKey, wfInDB);
		console.log(`[Cache 3️⃣ ] 🐵 getWorkflow  ${fromFunc}`);
		return wfInDB;
	} catch (assertError) {
		throw new EmpError("WF_NOT_CORRECT", assertError.message);
	}
};

const updateWorkflow = async (wfFilter: WfFilter, newSet: any, fromFunc: string) => {
	if (!fromFunc)
		throw new EmpError("NO_FROM_FUNC", "calling updateWorkflow must provide from which function");

	const wfCacheKey = await genRedisKey(wfFilter);

	let wf = await Workflow.findOneAndUpdate(wfFilter, newSet, { upsert: false, new: true });
	await redisClient.set(wfCacheKey, JSON.stringify(wf));
	lruCache.set(wfCacheKey, wf);
	console.log(`[Cache ♻️ ] 🐵 updateWorkflow  ${fromFunc}`);
	return wf;
};

const delWorkflow = async (wfFilter: WfFilter, fromFunc: string) => {
	if (!fromFunc)
		throw new EmpError("NO_FROM_FUNC", "calling delWorkflow must provide from which function");
	const wfCacheKey = await genRedisKey(wfFilter);

	let wf = await getWorkflow(wfFilter, fromFunc);
	lruCache.delete(wfCacheKey);
	await redisClient.del(wfCacheKey);
	await Workflow.deleteOne(wfFilter);
	console.log(`[Cache ❎] 🐵 delWorkflow  ${fromFunc}`);
	return wf;
};

const resetCache = async (wfFilter: WfFilter, fromFunc: string, level: number) => {
	const wfCacheKey = await genRedisKey(wfFilter);
	level >= CACHE_ELEVEL_MEM && lruCache.delete(wfCacheKey);
	level >= CACHE_ELEVEL_REDIS && (await redisClient.del(wfCacheKey));
};
*/

export default {
  /*
  getWorkflow,
  updateWorkflow,
  delWorkflow,
  resetCache,
  */
  CACHE_ELEVEL_MEM,
  CACHE_ELEVEL_REDIS,
};
