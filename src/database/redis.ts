"use strict";
import { isMainThread } from "worker_threads";
import { createClient } from "redis";
import ServerConfig from "../config/server.js";

const theThread = isMainThread ? "MainThread" : "ChildThread";

const redisUrl = ServerConfig.redis.connectionString;
const redisPassword = ServerConfig.redis.password;
console.log("🔥 createClient", redisUrl, redisPassword);
const redisClient = createClient({
	url: redisUrl,
	password: redisPassword,
	// password: "ddipMzbaHtEw7PZK",
});

const redisConnect = async () => {
	if (!redisClient.isOpen) await redisClient.connect();
};
const redisDisconnect = async () => {
	if (redisClient.isOpen) await redisClient.disconnect();
};

redisClient
	.on("error", (err) => {
		console.log("🆘 redis error", theThread, err);
	})
	.on("connect", (err) => {
		console.log("✅ 💃", theThread, "connect redis success!", redisUrl);
	})
	.on("end", (err) => {
		console.log("❎ 💃", theThread, "redis disconnected!");
	});

export { redisClient, redisConnect, redisDisconnect };
