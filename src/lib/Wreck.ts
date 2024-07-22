import Wreck from "@hapi/wreck";
import { HttpsProxyAgent } from "https-proxy-agent";

const example = async function () {
	// let { res, payload } = await Wreck.get("https://dog.ceo/api/breeds/list/all");
	// console.log(payload.toString());
	const proxyAgent = new HttpsProxyAgent("http://127.0.0.1:7890");

	const { payload } = await Wreck.post("https://jsonplaceholder.typicode.com/posts", {
		headers: { "Content-Type": "application/json" },
		payload: JSON.stringify({ key1: "value1", key2: "value2" }),
		json: true,
		agent: proxyAgent,
	});
	console.log(payload);
};

try {
	example();
} catch (ex) {
	console.error(ex);
}
