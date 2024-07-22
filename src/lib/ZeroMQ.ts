import zmq from 'zeromq';

export const socks = {
	Push: new zmq.Push(),
};
export function checkZeroMQConfig() {
	if (process.env.ZEROMQ_SERVER && process.env.ZEROMQ_PORT) {
		console.log('ZeroMQ server :', `tcp://${process.env.ZEROMQ_SERVER}:${process.env.ZEROMQ_PORT}`);
		return true;
	} else {
		console.error('ZeroMQ server is not configured correctly');
		console.error('Please set env variables ZEROMQ_SERVER and ZEROMQ_PORT');
		return false;
	}
}

export async function startZeroMQPushServer() {
	if (checkZeroMQConfig() === false) return false;
	await socks.Push.bind(`tcp://${process.env.ZEROMQ_SERVER}:${process.env.ZEROMQ_PORT}`);
	console.log(`ZeroMQ is running on ${process.env.ZEROMQ_SERVER}:${process.env.ZEROMQ_PORT}`);
}

export function getPushSocket() {
	return socks.Push;
}

export async function push(message: string) {
	await socks.Push.send(message);
	//next:
	//server
}
