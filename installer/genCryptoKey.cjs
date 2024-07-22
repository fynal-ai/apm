const crypto = require("crypto");
const _ = require("lodash");
const saltBank = "liuzijinshiwoerzia";
const charBank = "abcdliuziinlmnopshiwoerziz123456";

const salt = _.shuffle(Array.from(saltBank)).join("");
const chars = _.shuffle(Array.from(charBank)).join("");
const hash = crypto.createHash("sha1");
hash.update(salt);

let key = hash.digest().slice(0, 32);
key = Buffer.from(chars, "utf8");
// console.log(key);
// console.log(key.length);
console.log(key.toString("base64"));
