'use strict';

import { Request, ResponseObject, ResponseToolkit, Server } from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiSwagger from 'hapi-swagger';
import JasonWebToken from 'jsonwebtoken';
import JwtAuth from '../auth/jwt-strategy.js';
import ServerConfig from '../config/server.js';
import Routes from './routes.js';
import Views from './views.js';

// import Good from "@hapi/good";
import hapiAuthJwt from 'hapi-auth-jwt2';

const theHapiServer = {
	server_initialized: false,
	server: new Server({
		port: ServerConfig.hapi.port,
		address: ServerConfig.hapi.ip,
		/*
		 * https://morioh.com/p/3d5ffc21ace4
		 * headers - a strings array of allowed headers (‘Access-Control-Allow-Headers’). Defaults to [‘Accept’, ‘Authorization’, ‘Content-Type’, ‘If-None-Match’].
		 * exposedHeaders - a strings array of exposed headers (‘Access-Control-Expose-Headers’). Defaults to [‘WWW-Authenticate’, ‘Server-Authorization’].

additionalExposedHeaders - a strings array of additional headers to exposedHeaders. Use this to keep the default headers in place.
		 */
		/*
		 * https://stackoverflow.com/questions/57653272/how-to-allow-cors-in-hapi-js
		 * const server = Hapi.server({
				port: 3000,
				host: '192.168.1.13',        
				"routes": {
						"cors": {
								"origin": ["http://192.168.1.13:4200"],
								"headers": ["Accept", "Content-Type"],
								"additionalHeaders": ["X-Requested-With"]
						}
				}
				});
		 */
		routes: {
			//Allow CORS for all
			// cors: true,
			cors: {
				origin: ['*'],
				credentials: true,
				additionalExposedHeaders: ['ETag', 'X-Content-Type-Options'],
			},
			validate: {
				failAction: (request: Request, h: ResponseToolkit, err) => {
					console.error(err);
					if (request.method === 'post') {
						console.error(request.path, JSON.stringify(request.payload));
					}
					throw err;
				},
			},
		},
	}),

	// register_Good: async () => {
	// 	await theHapiServer.server.register({
	// 		plugin: Good,
	// 		options: {
	// 			reporters: {
	// 				myConsoleReporter: [
	// 					{
	// 						module: "@hapi/good-squeeze",
	// 						name: "Squeeze",
	// 						args: [
	// 							{
	// 								log: "*",
	// 								request: ["error", "warn", "debug"],
	// 								error: "*",
	// 							},
	// 						],
	// 					},
	// 					{
	// 						module: "@hapi/good-console",
	// 					},
	// 					"stdout",
	// 				],
	// 			},
	// 		},
	// 	});
	// },
	register_authJwt: async () => {
		await theHapiServer.server.register({ plugin: hapiAuthJwt });
	},
	register_swagger: async () => {
		await theHapiServer.server.register([
			Inert,
			Vision,
			{
				plugin: HapiSwagger,
				options: {
					info: {
						title: 'APM API Documentation',
						version: '1.0',
						description: 'APM (Agent Package Manager)',
						contact: {
							name: 'API Support',
							url: 'https://www.baystoneai.com/aboutus',
						},
					},

					// 设置Authorization
					securityDefinitions: {
						Bearer: { type: 'apiKey', name: 'Authorization', in: 'header' },
					},
					security: [{ Bearer: [] }],
				},
			},
		]);
	},
	starter: async () => {
		if (theHapiServer.server_initialized) {
			return theHapiServer.server;
		}
		await theHapiServer.register_authJwt();
		await theHapiServer.register_swagger();

		await JwtAuth.setJwtStrategy(theHapiServer.server);
		await Routes.init(theHapiServer.server);
		await Views.init(theHapiServer.server);
		await theHapiServer.server.start();
		console.debug('Server is running: ' + theHapiServer.server.info.uri);
		theHapiServer.server.events.on('response', function (request: Request) {
			switch (request.method.toUpperCase()) {
				case 'POST':
					break;
				case 'GET':
			}
			let user = 'Unkown';
			if (request.payload && (<any>request.payload).token) {
				let decoded = JasonWebToken.verify(
					(<any>request.payload).token,
					ServerConfig.crypto.privateKey
				);
				user = (<any>decoded).email;
			}
			if (request.path.indexOf('getNewerIds') < 0) {
				const tokens = [
					request.method.toUpperCase(),
					request.path,
					(<ResponseObject>request.response).statusCode,
				];

				if (request.method.toUpperCase() === 'POST') {
					// hidden upload file payload data
					if ((<any>request.payload)?.file && typeof (<any>request.payload)?.file === 'object') {
						(<any>request.payload).file._data = 'file data';
					}

					tokens.push(JSON.stringify(request.payload));
				}

				console.debug(tokens.join(' '));
			}
		});
		theHapiServer.server_initialized = true;
		return theHapiServer.server;
	},
	init: async () => {
		if (theHapiServer.server_initialized) {
			return theHapiServer.server;
		}
		// await theHapiServer.register_Good();
		await theHapiServer.register_authJwt();
		await theHapiServer.register_swagger();

		await JwtAuth.setJwtStrategy(theHapiServer.server);
		await Views.init(theHapiServer.server);
		await Routes.init(theHapiServer.server);
		await theHapiServer.server.initialize();
		console.debug('Server is initializing: ' + theHapiServer.server.info.uri);
		theHapiServer.server_initialized = true;
		return theHapiServer.server;
	},
};

export default theHapiServer;
