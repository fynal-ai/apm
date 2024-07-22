import Crypto from "./Crypto.js";

var myArgs = process.argv.slice(2);
for (let i = 0; i < myArgs.length; i++) {
	console.log(Crypto.encrypt(myArgs[i]));
}
