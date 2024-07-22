/*jshint node: true */
'use strict';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import HapiServer from './config/hapi.js';
import { dbConnect } from './database/mongodb.js';
import { redisConnect } from './database/redis.js';

dbConnect().then(() => {
	redisConnect().then(() => {
		HapiServer.starter();
	});
});
