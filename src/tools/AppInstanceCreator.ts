/**
 * Usage:
 * 1. modify workerenv_example.sh
 * 2. run it on current shell with '. ./workerenv.sh'
 * 3. run this script with 'node build/tools/AppInstanceCreator.js'
 * 4. in production env. run it with pm2
 */
import zmq from 'zeromq';
import { Mongoose, dbConnect } from '../database/mongodb.js';
import { BsClient } from '../tools/BsClient.js';

async function run() {
	BsClient.setServer(process.env.BS_ENDPOINT);
	BsClient.setHeader('Authorization', '');
	// await BsClient.login(process.env.USER_K8S_WORKER, process.env.USER_K8S_WORKER_PWD);
	// const loginResponse = await BsClient.login(
	// 	process.env.USER_K8S_WORKER,
	// 	process.env.USER_K8S_WORKER_PWD
	// );
	// console.log('Token:', loginResponse);
	const loginResponse = await loginWithRetry(
		process.env.USER_K8S_WORKER,
		process.env.USER_K8S_WORKER_PWD
	);
	// 确保打印出登录响应
	// console.log('登录成功，继续执行后续操作', loginResponse);
	const sock = new zmq.Pull();
	sock.connect(`tcp://${process.env.ZEROMQ_SERVER}:${process.env.ZEROMQ_PORT}`);
	// console.log(`Worker connected to ${process.env.ZEROMQ_SERVER}:${process.env.ZEROMQ_PORT}`);

	await Mongoose.connection.close();
}

function generateRandomName(length) {
	const letters = 'abcdefghijklmnopqrstuvwxyz';
	const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	// 确保名称以一个字母开头
	result += letters.charAt(Math.floor(Math.random() * letters.length));
	// 为剩余的长度添加随机字符
	for (let i = 1; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

dbConnect().then(async () => {
	console.log('Db connected');
	try {
		run();
	} catch (err) {
		console.log(err.message);
		await Mongoose.connection.close();
	}
});

async function createNamespace(namespaceName) {
	const namespaceData = {
		apiVersion: 'v1',
		kind: 'Namespace',
		metadata: {
			name: namespaceName,
		},
	};
	try {
		// console.log('正在检查命名空间:', namespaceName);
		const getResponse = await BsClient.get(
			`https://kbapi.baystoneai.com/api/v1/namespaces/${namespaceName}`
		);
		// console.log('命名空间已存在:', getResponse);
		if (getResponse.code === 404) {
			const response = await BsClient.post(
				'https://kbapi.baystoneai.com/api/v1/namespaces',
				namespaceData
			);
			// console.log('创建命名空间成功:', response);
			return response.metadata.name;
		} else {
			console.log('命名空间已存在:', getResponse.metadata);
			return getResponse.metadata.name;
		}
	} catch (error) {
		console.error('检查命名空间过程中出错:', error);
	}
}

async function loginWithRetry(username, password, maxRetries = -1) {
	try {
		const loginResponse = await BsClient.login(username, password);
		// console.log('Token:', loginResponse);
		// 登录成功，可以继续后续逻辑
		return loginResponse; // 返回登录响应
	} catch (error) {
		console.log('登录失败，错误信息:', error.message);
		if (maxRetries === 0) {
			throw new Error('达到最大重试次数，登录失败');
		}
		// 登录失败，设置10秒后重试
		console.log('10秒后重试...');
		await new Promise((resolve) => setTimeout(resolve, 10000)); // 等待10秒
		return loginWithRetry(username, password, maxRetries - 1); // 递归调用，重试登录
	}
}
