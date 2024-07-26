import path from 'path';

export default {
	hapi: {
		port: process.env.HAPI_PORT,
		ip: process.env.HOST,
	},
	mongodb: {
		connectionString: process.env.MONGO_CONNECTION_STRING,
		rs: false,
	},
	redis: {
		connectionString: process.env.REDIS_CONNECTION_STRING,
		password: process.env.REDIS_PASSWORD,
	},
	crypto: {
		privateKey: process.env.CRYPTO_PRIVATE_KEY,
		tokenExpiry: process.env.CRYPTO_EXPIRE, //in seconds
	},
	email: {
		test: false,
		smtp: {
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: true,
			username: process.env.SMTP_USERNAME,
			password: process.env.SMTP_PASSWORD,
			from: process.env.SMTP_FROM,
		},
	},
	verify: {
		email: {
			notwithin: 60,
			verifyin: 15 * 60,
		},
	},
	admin: process.env.SITE_ADMIN,
	ap: process.env.SITE_ADMIN_PASSWORD,
	wxConfig: {
		appId: process.env.WX_APPID,
		appSecret: process.env.WX_APPSECRET,
	},
	apm: {
		pythonProgram: process.env.APM_PYTHON_PROGRAM,
		localRepositoryDir:
			process.env.APM_LOCAL_REPOSITORY_DIR || path.resolve(process.env.HOME, '.apm'),
	},
};
