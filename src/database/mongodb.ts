import { isMainThread } from 'worker_threads';
/*jshint node: true */
('use strict');

import Mongoose, { ConnectOptions } from 'mongoose';
import ServerConfig from '../config/server.js';
const theThread = isMainThread ? 'MainThread' : 'ChildThread';

/**
 * ## Default the connection string to the development envionment
 *
 */
let connection_string = ServerConfig.mongodb.connectionString;

Mongoose.connection
	.on(
		'open',
		console.info.bind(console, '✅ 🦆', theThread, 'connect mongodb success!', connection_string)
	)
	.on('close', console.info.bind(console, '❎ 🦆', theThread, 'mongodb disconnected!', ''));

console.log('▶️ 🦆', 'Trying to open', connection_string);
const dbConnect = async () => {
	await Mongoose.connect(connection_string, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		maxPoolSize: isMainThread ? 100 : 1,
	} as ConnectOptions);
};
//Mongoose.set("useCreateIndex", true);
//Mongoose.set("useFindAndModify", false);
//
export { Mongoose, dbConnect };
